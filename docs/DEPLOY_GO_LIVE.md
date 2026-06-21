# Go-Live Runbook — Embassy of Guinea (new Vue site)

**Target launch:** Monday 2026-06-22 (ambassador demo)
**What this does:** publishes the redesigned static Vue SPA at `https://embassyofguineausa.org`,
replacing the old stale Laravel site, with instant rollback.

This is a **static** launch: the public site content is currently hardcoded in the Vue
components, so **no backend/database is needed to go live**. The CMS API + dashboard land later
(see `docs/superpowers/specs/` and `docs/superpowers/plans/`).

---

## 0. Pre-flight facts (verified 2026-06-21)

- DNS: `embassyofguineausa.org` and `www` → **44.208.252.167** (shared-prod). **No DNS change needed.**
- The box already serves the OLD site (Apache/2.4.58, Laravel) for this domain — we only swap
  the Apache **DocumentRoot** to the new SPA and reload. The domain + TLS cert stay.
- Build artifact: `dist/` is **~12 MB** (was 109 MB before image optimization).
- Dashboard is **hidden** in this build (`VITE_ENABLE_DASHBOARD` unset → `/dashboard` and
  `/connexion` redirect to home; Connexion buttons hidden).

> **SSH note:** From the prep machine, `ssh scb-systems-shared-prod-server` timed out on port 22
> (security-group / IP allowlist). To run this runbook you need SSH access to the box from a
> whitelisted IP, or add the operator's IP to the shared-prod security group first.

---

## 1. Build the launch artifact (on the build machine)

```bash
cd /Users/elysabeth_chan/Downloads/new-guinea-embassy
git checkout release/launch-2026-06-22
npm ci                       # IMPORTANT: not a copied node_modules (exec-bit issue)
npm run build                # VITE_ENABLE_DASHBOARD intentionally unset -> dashboard hidden
du -sh dist                  # expect ~12 MB
test -f dist/index.html && echo "artifact OK"
```

---

## 2. Ship the artifact to shared-prod (new directory — keeps rollback trivial)

Deploy into a **new** docroot so the old site stays intact until we flip:

```bash
# from the build machine
rsync -az --delete dist/ scb-systems-shared-prod-server:/tmp/embassy-spa/
ssh scb-systems-shared-prod-server '
  sudo mkdir -p /var/www/embassyofguineausa-spa &&
  sudo rsync -a --delete /tmp/embassy-spa/ /var/www/embassyofguineausa-spa/ &&
  sudo chown -R www-data:www-data /var/www/embassyofguineausa-spa &&
  rm -rf /tmp/embassy-spa &&
  ls -la /var/www/embassyofguineausa-spa | head
'
```

---

## 3. Back up the old site + vhost (rollback safety)

```bash
ssh scb-systems-shared-prod-server '
  TS=$(date +%Y%m%d-%H%M%S)
  echo "Backing up vhost + docroot ($TS)"
  # find the active vhost for this domain
  grep -rl "embassyofguineausa" /etc/apache2/sites-available/
  sudo cp -a /etc/apache2/sites-available/ /root/apache-vhost-backup-$TS
  # note the current DocumentRoot so we can restore it
  grep -i "DocumentRoot" /etc/apache2/sites-available/*embassyofguineausa* 
'
```

Record the printed **vhost filename** and **old DocumentRoot** (expected
`/var/www/embassyofguineausa/public`) — you need them for rollback.

---

## 4. Point the vhost at the SPA + add history fallback

Edit the **SSL** vhost for the domain (the file from step 3, typically
`embassyofguineausa-le-ssl.conf` or `embassyofguineausa-ssl.conf`). Change **only** the
`DocumentRoot` and add a `<Directory>` block; **leave the `SSLCertificate*`, `ServerName`,
`ServerAlias` lines untouched** so TLS keeps working.

```apache
    DocumentRoot /var/www/embassyofguineausa-spa

    <Directory /var/www/embassyofguineausa-spa>
        Options -Indexes +FollowSymLinks
        AllowOverride None
        Require all granted
        # SPA client-side routing: serve index.html for unknown paths
        FallbackResource /index.html
    </Directory>
```

If there is a separate **port-80** vhost for the domain that also sets a `DocumentRoot`, update it
the same way (or leave it if it only redirects to HTTPS — check with
`grep -i 'DocumentRoot\|Redirect' /etc/apache2/sites-available/*embassyofguineausa*`).

---

## 5. Validate config, reload, smoke test

```bash
ssh scb-systems-shared-prod-server '
  sudo apache2ctl configtest &&        # must print: Syntax OK
  sudo systemctl reload apache2
'
# from anywhere:
curl -sS -I https://embassyofguineausa.org/            | head -5   # expect 200, no Laravel headers
curl -sS    https://embassyofguineausa.org/            | grep -o "<title>[^<]*" | head -1
curl -sS -o /dev/null -w "%{http_code}\n" https://embassyofguineausa.org/presentation   # 200 (SPA fallback)
curl -sS -o /dev/null -w "%{http_code}\n" https://embassyofguineausa.org/dashboard      # 200 -> redirects to home client-side
```

**Manual demo check (browser):**
- Home loads fast (images now small). Hero carousel renders.
- Navigate Présentation / Ambassadeur / Relations bilatérales / Consulat — all render.
- `/dashboard` and `/connexion` bounce to the homepage. No "Connexion" button in the header.
- Hard-refresh on a deep page (e.g. `/presentation`) still returns the site (FallbackResource works).

---

## 6. Rollback (if anything looks wrong)

```bash
ssh scb-systems-shared-prod-server '
  # restore the old DocumentRoot in the vhost (set it back to /var/www/embassyofguineausa/public),
  # or restore the whole vhost dir from the backup:
  # sudo cp -a /root/apache-vhost-backup-<TS>/. /etc/apache2/sites-available/
  sudo apache2ctl configtest && sudo systemctl reload apache2
'
curl -sS -I https://embassyofguineausa.org/ | head -3
```

The old Laravel app at `/var/www/embassyofguineausa/` is never deleted by this runbook, so rollback
is just pointing the DocumentRoot back and reloading.

---

## 7. After a successful launch

- Leave the old Laravel app in place for ~1 week, then archive/remove it in a later cleanup
  (note it in the aws-migration workspace recap, since that box is tracked there).
- When the CMS is ready, re-enable the dashboard by building with `VITE_ENABLE_DASHBOARD=true`
  and re-deploying (steps 1-2-5). The runbook is otherwise unchanged.

---

## Deferred (NOT part of this launch)

- Laravel CMS API, dashboard wiring, scraper ingest — see the spec + Plan 1 in
  `docs/superpowers/`. The site goes live first; these follow without another cutover (just a
  rebuild with the flag on once the API exists).
