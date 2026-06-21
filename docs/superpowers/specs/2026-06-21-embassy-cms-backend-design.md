# Embassy of Guinea — CMS Backend, Roles & Approval Workflow

**Date:** 2026-06-21
**Status:** Approved design — ready for implementation planning
**Authors:** Elsa Zougouri + Claude

---

## 1. Purpose & context

The Embassy of Guinea (USA) is replacing its stale live site (`embassyofguineausa.org`,
a Laravel app at `/var/www/embassyofguineausa/public` on shared-prod, with outdated content)
with a newly redesigned frontend. The new frontend exists; the backend that powers its CMS
does **not**. This spec defines that backend plus the frontend wiring required to make the
dashboard real.

### What exists today

| Repo | Stack | State |
|---|---|---|
| `ambassade-guinee` (GitHub `Danielle074/ambassade-guinee`) | Vue 3 + Vite + TS + Tailwind 4 + Pinia + vue-router | Public site is real & embassy-specific. Dashboard is a repurposed generic "AlignUI" admin template filled with **mock data only** — no backend calls, no auth, no route guards, no WYSIWYG, no uploads. |
| `scrapping-guinea-embassy-website` (`/Users/elysabeth_chan/Django/...`) | Python (feedparser + BeautifulSoup) | Working RSS aggregator over 6 Guinean news feeds → writes `actus_guinee.json` (title, date, category, resumer, source_link, image_url). No dedup, messy category casing, hotlinked images. |

### Decisions locked during brainstorming

- **Backend stack:** Laravel (PHP 8.3) — matches shared-prod conventions (Apache + PHP-FPM,
  Laravel apps already run there: SecureCheck, BoursePay, TANARES, Ecivil) and the existing
  Laravel seeder artifacts.
- **The new site replaces the old `embassyofguineausa.org`.** Old content is discarded.
  Default to a **clean new Laravel backend** in the same deploy slot; inspecting the old DB
  for salvageable data is an optional one-time check, not a dependency.
- **Roles:** Admin / Supervisor / Editor / Viewer (4-tier).
- **Approval gate** applies to: Articles, Actualités, Nouvelles, Événements, Galerie,
  Documents, Courriers (all publishable content).
- **SecureCheck Guinea** (badges/QR/scanner/présence/visiteurs/tâches in the dashboard) is a
  **separate product** — a new tenant of the existing `api.securecheck.info`. It is **out of
  scope for this spec** and gets its own spec; its dashboard routes stay intact but parked.

---

## 2. System architecture

Three repositories, one product:

```
┌────────────────────────────┐      HTTPS/JSON      ┌──────────────────────────────┐
│  ambassade-guinee (Vue SPA)│ ───────────────────▶ │  ambassade-guinee-api (Laravel)│
│  - public site (read-only) │ ◀─────────────────── │  - public content API          │
│  - dashboard (auth + roles)│   token (Sanctum)    │  - admin/CMS API               │
└────────────────────────────┘                      │  - roles + approval engine     │
                                                     │  - S3 media (presigned)        │
                                                     │  - scraper ingest endpoint     │
                                                     └──────────────┬────────────────┘
                                                                    │ POST (token)
                                                     ┌──────────────┴────────────────┐
                                                     │ scrapping-guinea-embassy-website│
                                                     │ (Django/Python, cron RSS job)  │
                                                     └────────────────────────────────┘
```

**Deploy topology (shared-prod, `scb-systems-shared-prod-server`):**

- **API:** `/var/www/ambassade-guinee-api/public`, Apache vhost, PHP 8.3 FPM, TLS via certbot.
- **SPA:** static `vite build` served from its own docroot via Apache (same TLS/vhost pattern).
- **DB:** new MySQL schema on the existing `tanares-db` RDS instance (no new RDS needed).
- **Media:** dedicated S3 bucket `guinea-embassy-cms-media` (us-east-1).
- **Cutover:** the new API + SPA vhosts replace the old `embassyofguineausa` vhost.

The three repos stay **separate** (independent histories, deploy lifecycles). Their contract is
HTTP/JSON only.

---

## 3. Backend domain model

All tables in the new `ambassade_guinee` MySQL schema. Laravel migrations are the source of truth.

### 3.1 Users & roles

- `users` — standard Laravel (`id, name, email, password, …`) + `is_active`.
- Roles via **spatie/laravel-permission**: `admin`, `supervisor`, `editor`, `viewer`.
- Auth via **Laravel Sanctum** (token-based; the SPA stores the token and sends
  `Authorization: Bearer`).

| Role | Capabilities |
|---|---|
| **admin** | Everything Supervisor can do + manage users/roles + site settings. |
| **supervisor** | Review submitted content → approve/publish or reject (with reason). Cannot manage users. |
| **editor** | Create/edit own content, submit for review. Cannot publish. |
| **viewer** | Read-only access to the dashboard (audit / SecureCheck-only staff). |

### 3.2 Content types & the publishable contract

Each publishable type shares a common **publishable shape** (implemented as a Laravel trait +
shared columns, not copy-paste):

```
id, title, slug, body (HTML from WYSIWYG), excerpt, cover_image_url,
status            ENUM('draft','submitted','published','rejected')  default 'draft'
author_id         FK users
reviewer_id       FK users  nullable
submitted_at, reviewed_at, published_at  timestamps nullable
rejection_reason  text nullable
created_at, updated_at
```

Publishable types and their type-specific fields:

| Type | Table | Extra fields |
|---|---|---|
| Article | `articles` | `category` |
| Actualité | `actualites` | `category` (ambassade / diplomatique / gouvernementale) |
| Nouvelle (external news) | `nouvelles` | `source_link` (unique), `source_name`, `original_category` |
| Événement | `evenements` | `starts_at`, `ends_at`, `location` |
| Galerie (album) | `galeries` + `galerie_images` | album → many S3 images |
| Document | `documents` | `file_url` (S3), `file_type`, `file_size` |
| Courrier | `courriers` | `reference`, `is_internal` (default true) |

> **Nouvelles** is the destination for scraper output: external curated news, distinct from
> staff-authored Articles. Same approval gate — a Supervisor curates which scraped items go live.

### 3.3 Approval state machine

```
        submit                 approve/publish
draft ─────────▶ submitted ─────────────────▶ published
  ▲                  │
  │      reject      │
  └──────────────────┘   (rejection_reason required; returns to draft)
```

Rules enforced server-side (policy + a small state-transition service):

- Only **editor/supervisor/admin** create drafts; an editor may only edit **own** drafts.
- Only **supervisor/admin** may `approve`/`publish` or `reject`.
- `reject` **requires** a `rejection_reason`; transition is `submitted → draft`.
- The **public content API serves `published` only.** Drafts/submitted/rejected are never public.
- Every transition writes an **audit record** (see 3.4).

### 3.4 Audit trail

- `content_revisions` — append-only: `(content_type, content_id, actor_id, action, from_status,
  to_status, note, created_at)`. Captures submit/approve/reject/publish/edit. Powers a
  "who changed what, when" view and accountability for the supervisor sign-off.

---

## 4. API surface (high level)

Versioned under `/api/v1`. Two audiences:

**Public (no auth, published-only):**
```
GET /api/v1/public/articles            GET /api/v1/public/articles/{slug}
GET /api/v1/public/actualites?type=…   GET /api/v1/public/nouvelles
GET /api/v1/public/evenements          GET /api/v1/public/galeries
GET /api/v1/public/documents
```

**Dashboard (Sanctum + role/policy gated):**
```
POST /api/v1/auth/login                POST /api/v1/auth/logout   GET /api/v1/auth/me
CRUD /api/v1/admin/{articles|actualites|nouvelles|evenements|galeries|documents|courriers}
POST /api/v1/admin/{type}/{id}/submit
POST /api/v1/admin/{type}/{id}/approve
POST /api/v1/admin/{type}/{id}/reject          (body: { reason })
POST /api/v1/admin/media/presign               (returns presigned S3 PUT)
CRUD /api/v1/admin/users                        (admin only)
POST /api/v1/ingest/nouvelles                   (scraper token; bulk upsert by source_link)
```

Authorization is enforced by Laravel **Policies** per content type + role middleware, not by
client-side checks.

---

## 5. Media: S3 + WYSIWYG

- **WYSIWYG:** **TipTap** (Vue 3 native) in the editor screens. Stores sanitized HTML in `body`.
  Server re-sanitizes on save (allowlist) to prevent stored XSS.
- **Uploads:** Laravel `Storage` S3 driver → `guinea-embassy-cms-media`. Flow: dashboard requests
  `POST /admin/media/presign` → uploads the file directly to S3 with the presigned URL → stores
  the returned object URL on the record. Keeps large media off the PHP request path.
- **Access:** shared-prod instance role granted `s3:PutObject/GetObject` on the bucket (same
  instance-role + Secrets-Manager pattern already used on the box). No static keys in the repo.
- **Bucket policy:** public-read for the `media/` prefix that serves the public site (or fronted
  by CloudFront later); credentials never committed.

---

## 6. Scraper integration

The Django job keeps its role (RSS aggregation) and gains a clean ingest contract:

1. **Normalize on collect:** lowercase-fold category to a canonical set
   (`À la une`/`A la une`/`A LA UNE` → `a_la_une`, etc.); parse RFC-822 `date` → ISO 8601.
2. **Dedup:** `source_link` is the natural key; the API upserts on it (`nouvelles.source_link`
   is `UNIQUE`), so re-runs never duplicate.
3. **Push, don't dump:** after collecting, `POST /api/v1/ingest/nouvelles` with a bearer
   **ingest token** (env var, not committed). Payload = the normalized records. The old
   `actus_guinee.json` write stays as a debug fallback.
4. **Re-host images:** the API downloads each `image_url` (hotlinked from source media sites)
   and stores it in S3, replacing it with the bucket URL so public images don't rot or get
   hotlink-blocked.
5. **Landing state:** ingested items are created as **`submitted`** (not auto-published), so a
   Supervisor explicitly curates what appears publicly.
6. **Schedule:** cron on shared-prod (e.g. every 6h). Cadence tunable.

---

## 7. Frontend wiring (existing Vue SPA)

The public site is largely done. The dashboard needs to become real:

1. **API client + config:** typed client reading `import.meta.env.VITE_API_URL`; Pinia stores
   per resource replacing every hardcoded mock array (randomuser.me / alignui.com fixtures).
2. **Auth:** real `login` → store Sanctum token; `auth` Pinia store with `user` + `roles`.
3. **Route guard (currently missing entirely):** `router.beforeEach` — `/dashboard/**` requires
   a valid token; each route declares `meta: { roles: [...] }` and is rejected if the user lacks
   the role. This is the security gate the template never had.
4. **Editor UX:** TipTap WYSIWYG component; S3 presigned-upload component; submit/approve/reject
   actions surfaced by role (editors see "Submit", supervisors see "Approve/Reject").
5. **CMS scope only:** wire Articles, Actualités, Nouvelles, Galerie, Documents, Courriers,
   Événements, Utilisateurs, Profil. SecureCheck routes are left in place but parked.

---

## 8. Git & repository strategy

- **`ambassade-guinee` (frontend):** already on GitHub (`Danielle074/ambassade-guinee`).
  Frontend wiring lands here via PRs. (This spec lives here under `docs/superpowers/specs/`.)
- **`ambassade-guinee-api` (backend):** **new repo** — `git init`, standard Laravel `.gitignore`
  (ignore `.env`, `/vendor`, `/storage/*.key`), first commit = fresh Laravel scaffold. Setup
  documented in the runbook (section 10).
- **`scrapping-guinea-embassy-website` (scraper):** existing; add the ingest-push + normalization
  on a branch, PR in.
- **Secrets** (DB creds, S3 keys, ingest token, Sanctum) never enter any repo — `.env` on the
  server + AWS Secrets Manager / instance role, per the workspace's standing secret policy.

---

## 9. Scope boundaries

**In scope (this spec → one implementation plan):**
CMS data model · 4 roles · approval state machine + audit · public + admin API · Sanctum auth ·
S3 media + presigned upload · TipTap WYSIWYG · scraper ingest endpoint + normalization ·
frontend dashboard wiring + route guards · deploy runbook.

**Explicitly deferred (own spec later):**
SecureCheck Guinea modules (badges/QR/scanner/présence/visiteurs/tâches/projets) wired to a new
Guinea tenant of `api.securecheck.info`. Routes remain present but non-functional/parked until then.

**Optional / non-blocking:**
One-time inspection of the old `embassyofguineausa` DB for salvageable content before cutover.

---

## 10. Deliverable docs (produced after the plan is approved)

1. **Backend setup runbook** — `git init` + Laravel scaffold, `.env` template (DB on `tanares-db`,
   S3, Sanctum, ingest token), `composer`/migrate/seed, spatie roles seeder.
2. **AWS setup** — create `guinea-embassy-cms-media` bucket + bucket policy; grant the shared-prod
   instance role; certbot vhost for the API + SPA; cutover steps replacing the old vhost.
3. **Scraper change doc** — normalization + ingest-push wiring + cron entry.
4. **Frontend integration doc** — env vars, API client, auth store, route guard, TipTap + upload.

---

## 11. Open questions / assumptions

- **DB placement:** assumes a new schema on `tanares-db` (MySQL) is acceptable; if the embassy
  must be isolated, swap to a dedicated small RDS (cost note: ~$27/mo, like the retired
  `erhdp-rds`). Default: shared `tanares-db`.
- **Domain at cutover:** assumes the new site keeps `embassyofguineausa.org` (with `.com`
  redirect). Confirm before flipping the vhost.
- **Public image hosting:** assumes S3 public-read (or CloudFront) for the media prefix; confirm
  whether CloudFront is wanted now or later.
