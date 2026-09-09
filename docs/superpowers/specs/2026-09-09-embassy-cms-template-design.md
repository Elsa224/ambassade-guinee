# Design — Plateforme multi-ambassades : template + CMS + « Ambassade Secure »

**Date :** 2026-09-09
**Auteur :** Elsa (avec Claude Code)
**Statut :** conception — en attente de relecture avant plan d'implémentation

---

## 1. Contexte & objectif

Le boss veut transformer le site d'ambassade existant (front Vue, livré pour
l'ambassade de Guinée, dupliqué à la main pour le Gabon) en un **template
réutilisable pour toutes les ambassades**, doté d'un **back-office façon
WordPress** : un admin se connecte pour alimenter le site (articles, pages,
médias…). Les articles seront à terme **alimentés automatiquement** par un
scraper des pages Facebook des ambassades (développé séparément par Cédric,
Python — non terminé). Le boss veut aussi un module **« Ambassade Secure »**
(d'abord **Rendez-vous** et **Événements**) intégré au dashboard de chaque
ambassade.

### État constaté des repos (analyse 2026-09-09)

Repos analysés : `Danielle074/ambassade-guinee`, `Danielle074/ambassade-gabon`
(forkés sous `Elsa224`, clonés dans `~/VueJS/`).

- **Stack front :** Vue 3.5 + Vite 7 + Tailwind CSS v4 + `vue-router`. Pinia
  installé mais inutilisé. TypeScript configuré, contenu en JS.
- **Aucun back-end :** zéro `axios`/`fetch`, zéro variable d'env, zéro URL
  d'API. Terrain vierge côté serveur.
- **Contenu 100 % en dur** dans les `.vue` (articles, événements, galerie,
  responsables, consuls, services, calendrier, menu, contacts). Pas de couche
  données, pas de JSON.
- **Le « dashboard » est une maquette** : `/connexion` a un bouton qui est un
  simple `router-link` vers `/dashboard` (aucune auth) ; aucune garde de route ;
  ~20 écrans CRUD jolis mais alimentés par des `ref([])` en dur. Réutilisables
  visuellement, mais tout l'auth + l'API + la persistance sont à créer.
- **Guinée → Gabon = copier-coller manuel** (~25 fichiers édités) : couleurs en
  valeurs hex Tailwind en dur (`bg-[#006633]`), faits pays en prose, une
  section entière (« Relations bilatérales ») supprimée chez le Gabon plutôt
  que rendue optionnelle.
- **Médias** compilés dans le build (`import` → `:src`). Pas d'abstraction.
- **Détail révélateur :** le dashboard contient déjà des écrans **SecureCheck**
  (scanner, présence, cartes/badges, événements, QR) et la page login affiche
  encore « Secure Check » — les écrans ont été repris d'un projet SecureCheck.

## 2. Décisions actées

| Sujet | Décision |
|---|---|
| Back-end CMS | **Laravel** (aligné sur le parc PHP-FPM de shared-prod ; auth/CRUD rapides) |
| Architecture | **1 CMS mutualisé multi-tenant** ; tenant résolu par **domaine** |
| Périmètre immédiat | **Phase 1 = Articles** (auth réelle + API + CRUD sur écrans existants + entrée scraping) |
| Front | **1 build mutualisé** ; thème via **variables CSS** depuis la config tenant ; refactor template mené tôt, en parallèle |
| Langue | **FR** en Phase 1 ; schéma **prêt au multilingue** (champ `locale` prévu) |
| Ambassade Secure | **1 brand SecureCheck « Ambassade Secure »** ; **chaque ambassade = un tenant (Company)** dedans |
| Portée RDV au démarrage | **Flux existant suffit** (demande → validation → QR → check-in) ; moteur de créneaux consulaires = plus tard si besoin |
| Base de données CMS | **Nouvelles bases dédiées** (dev + prod) sur une RDS existante du parc (pas de nouvelle instance) |
| Environnements | **shared-dev** (tests/démo/validation) + **shared-prod** (prod) |
| Clé d'ingestion scraping | **Une `X-API-Key` par ambassade** |
| Couture auth CMS ↔ SecureCheck | **BFF** (Laravel garde le JWT SecureCheck côté serveur) |

## 3. Vue d'ensemble de l'architecture

```
                        ┌─────────────────────────────────────┐
   cev.gabon-...  DNS    │  Front Vue (1 build mutualisé)       │
   ambassadeX.org  ────► │  résout le tenant par window.location.hostname
                        │  → charge thème + contenus via API   │
                        └───────────────┬───────────┬─────────┘
                                        │           │
                          (contenu)     │           │  (RDV + Événements)
                                        ▼           ▼
                        ┌──────────────────┐   ┌──────────────────────────┐
                        │ CMS Laravel       │   │ SecureCheck (existant)    │
                        │ 1 app + 1 base    │   │ brand = "ambassade-secure"│
                        │ embassies (tenant)│   │ chaque ambassade = Company│
                        │ articles, taxo,   │   │ events / attendance / RDV │
                        │ config, médias→S3 │   │ (Node/Express/Mongo)      │
                        └────────▲──────────┘   └──────────────────────────┘
                                 │
                    POST /api/ingest/articles (X-API-Key)
                                 │
                        ┌────────┴──────────┐
                        │ Scraper Facebook  │
                        │ (Cédric, Python)  │
                        └───────────────────┘
```

Chaque ambassade existe comme **une ligne des deux côtés** : `embassies.id`
(CMS) ↔ `companyId` (SecureCheck), reliées par un champ de correspondance.

## 4. Composants

### 4.1 Modèle multi-tenant (CMS Laravel)

Table `embassies` (le tenant), une ligne par ambassade, portant **toute la
config par site** :

- `id`, `slug`, `domain` (clé de résolution ; ex. `embassyofguineausa.org`)
- Identité : `country_name_official`, `country_name_short`, `demonym`
  (guinéen(ne)/gabonais(e)), `flag_image`, `logo_image`
- **Thème** : `color_primary`, `color_secondary`, `color_accent` (→ variables CSS)
- Contact : `address`, `phone`, `email`, `hours`
- `modules` (JSON) : activation par ambassade (`bilateral`, `galerie`,
  `secure_rdv`, `secure_events`…)
- `securecheck_company_id` (lien vers le tenant SecureCheck)

Toute donnée de contenu porte `embassy_id`. Résolution du tenant : middleware
Laravel qui mappe `Host:` → `embassies.domain`.

### 4.2 Modèle Article (réconcilie les 3 schémas trouvés dans le code)

```
articles
  id, embassy_id, slug (stable, unique par embassy)
  titre, resume, contenu (riche/Markdown → HTML rendu)
  image (URL S3), categorie_id (taxonomie gérée)
  date_publication, statut (brouillon | a_valider | publie)
  vues, likes
  locale (défaut 'fr' ; prévu pour le multilingue)
  -- provenance / scraping --
  source (manuel | facebook)
  external_id (id du post FB, unique par source ; dédup)
  ingested_at
  created_at, updated_at
categories  -- taxonomie (remplace les listes en dur par composant)
  id, embassy_id, nom, slug, couleur
```

`temps_lecture` : dérivé côté serveur du nombre de mots (pas stocké).

### 4.3 Auth admin (Sanctum) + réutilisation des écrans

- **Laravel Sanctum** pour l'auth admin (token SPA).
- **Garde de route** ajouté côté Vue sur `/dashboard/*` (aujourd'hui ouvert).
- La page `/connexion` est **réécrite** (retrait du texte « Secure Check /
  Maposte » recyclé) et branchée à `POST /api/auth/login`.
- Les écrans dashboard existants (Articles, Actualités, Galerie…) sont
  conservés visuellement ; leurs `ref([])` bidon sont remplacés par de vrais
  appels API. Rôles : au moins `admin` (par ambassade) et `super_admin`
  (transverse).

### 4.4 Contrat d'ingestion scraping (pour Cédric)

Endpoint stable, indépendant de l'avancement de l'UI, que Cédric peut cibler
dès maintenant :

**Clé d'API : une `X-API-Key` distincte par ambassade** (révocable
indépendamment, aucune confusion inter-ambassades ; la clé identifie déjà
l'ambassade cible).

```
POST /api/ingest/articles
  Auth: header X-API-Key (une clé par ambassade → identifie le tenant)
  Body: { external_id, titre, contenu,
          image_url?, date_publication?, categorie? }
  Comportement:
    - dédup sur (source=facebook, external_id) : upsert idempotent
    - crée l'article en statut = a_valider (jamais publié directement)
    - image_url : téléchargée et re-stockée sur S3 par le CMS
  Réponses: 201 créé | 200 déjà connu (no-op) | 401 clé invalide | 422 payload
```

Modération : un humain valide dans le back-office avant passage en `publie`.
(Réutilise le principe `X-API-Key` déjà en place sur scb-cev — cohérence parc.)

### 4.5 Front template : theming runtime + tenant par domaine

- **1 seul build.** Au boot, le front lit `window.location.hostname`, appelle
  `GET /api/bootstrap?domain=…` → reçoit la config du tenant (thème, identité,
  modules actifs) + contenus.
- **Thème par variables CSS :** on remplace les `bg-[#006633]` éparpillés par
  `var(--color-primary)` etc., injectées au runtime depuis la config. Ajouter
  une ambassade = une ligne en base + DNS + vhost, **aucun rebuild**.
- **Routes de détail manquantes ajoutées** : `/actualites/:slug` (liée partout
  aujourd'hui mais absente du routeur).
- Contenus en dur migrés progressivement vers l'API (articles d'abord).
- Modules optionnels (ex. « Relations bilatérales ») pilotés par
  `embassies.modules` plutôt que par présence/absence de code.

### 4.6 Pipeline médias

- Upload via le CMS Laravel → **S3** (mêmes conventions que les buckets brand
  existants : block-public-access, SSE, **CORS reposé sur l'origine exacte**).
- Le contenu stocke des **URLs**, plus d'`import` compilé.
- Images scrapées : `image_url` récupérée par l'endpoint d'ingestion et
  re-stockée sur S3 (pas de hotlink Facebook).

### 4.7 Intégration « Ambassade Secure »

- **1 brand SecureCheck** `ambassade-secure` provisionné **une seule fois**
  (port/base Mongo/bucket S3/SES/DNS/vhost/fichier `src/brands/…` + PR —
  cf. checklist d'onboarding brand SecureCheck).
- **Chaque ambassade = un tenant (Company)** dans ce brand, onboardé via le
  flux léger existant (`POST /api/v1/companies` / `scripts/onboard-company.js`).
  Lien stocké dans `embassies.securecheck_company_id`.
- **Événements** : quasi prêt côté SecureCheck (CRUD, inscription publique,
  badges QR/UIDN, présence/check-in, export). Les écrans SecureCheck-like déjà
  présents dans le dashboard d'ambassade sont branchés sur les endpoints
  `events` / `attendance` / `membership-cards`. Peu/pas de dev back-end.
- **Rendez-vous** : cycle de vie existant réutilisé (demande visiteur → OCR
  pièce → validation/refus → QR → check-in/out → suivi public). **Pas de moteur
  de créneaux** au démarrage (nouvelle feature ultérieure si le consulaire
  l'exige).
- **Couture auth : BFF (retenu).** SecureCheck n'a pas de SSO (login → JWT dans
  le corps, pensé pour un BFF). Le back CMS Laravel **proxifie** les appels
  SecureCheck (events/attendance/RDV) en gardant le JWT SecureCheck **côté
  serveur** ; le front d'ambassade ne voit jamais ce token. Aligné sur le
  pattern d'intégration prévu par SecureCheck.
  Enjeu à câbler : provisionner/mapper un utilisateur SecureCheck par admin
  d'ambassade et le rattacher au bon `companyId`.

## 5. Déploiement

**Environnements :**
- **shared-dev** : tests internes, démo, validation.
- **shared-prod** : production.

- **CMS Laravel** : 1 app PHP-FPM + 1 vhost Apache par environnement. **Base =
  nouvelle base dédiée par environnement** (dev + prod), sur une RDS existante
  MariaDB/MySQL du parc (pas de nouvelle instance). Ce sont de **nouvelles
  bases**, donc aucune interférence avec l'existant. Instance précise à
  confirmer au déploiement. Médias sur S3.
- **Front** : 1 build Vue statique servi pour tous les domaines (docroot partagé
  ou proxy), 1 **vhost Apache + certbot par domaine** d'ambassade (comme les
  autres sites du parc). TLS Let's Encrypt.
- **SecureCheck** : brand `ambassade-secure` déployé selon `deploy/release.sh`
  (nouveau `case` port/pm2), Mongo dédié, bucket + SES + DNS.
- Chaque nouvelle ambassade : ligne `embassies` + Company SecureCheck + DNS +
  vhost + certbot. Pas de rebuild front.

## 6. Hors périmètre / phases ultérieures

- Moteur de **créneaux consulaires** réservables (RDV avancé).
- **Multilingue** effectif (FR/EN) — schéma prêt, activation plus tard.
- Migration des **autres types de contenu** (galerie publique, responsables,
  consuls, services, calendrier des fêtes, menu data-driven) après les articles.
- Modules SecureCheck additionnels éventuels (courrier interne, RH…) déjà
  présents dans SecureCheck mais non exposés.

## 7. Risques / points ouverts

Décisions figées (2026-09-09) : base CMS = **nouveau schéma sur RDS existante** ;
ingestion = **une `X-API-Key` par ambassade** ; couture auth = **BFF**.

- **Instance RDS précise** pour les bases CMS (dev/prod) — à confirmer au
  déploiement (une RDS MariaDB/MySQL du parc).
- **Refactor couleurs** : le passage des `bg-[#hex]` en variables CSS touche
  beaucoup de fichiers (effort réel, mais prérequis du template).
- **Repos** : le back Laravel n'existe pas encore (repo à créer) ; le front
  template partira du fork `Elsa224/ambassade-guinee`. Nommage projet à définir.
- Les repos donnés (`Danielle074/*`) diffèrent de la source déployée en juin
  (`new-guinea-embassy`) — on part bien des `Danielle074/*`.

## 8. Prochaine étape

Relecture de cette spec par Elsa → ajustements → plan d'implémentation détaillé
(skill writing-plans), Phase 1 en premier (auth + API Articles + câblage des
écrans + endpoint d'ingestion), refactor theming front mené en parallèle.
