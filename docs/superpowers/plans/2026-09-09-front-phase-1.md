# Front Phase 1 — template multi-ambassades : theming runtime, tenant, auth, Articles

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal :** transformer le front Vue de l'ambassade de Guinée en un template mutualisé : un seul build qui resout son tenant par le nom de domaine, applique le theme de ce tenant via des variables CSS, authentifie reellement ses administrateurs et alimente ses ecrans Articles/Actualites depuis l'API CMS.

**Architecture :** les couleurs de marque en dur (`bg-[#006633]`) deviennent des tokens de theme Tailwind v4 declares dans `@theme` ; seules trois variables (`--color-primary`, `--color-secondary`, `--color-accent`) sont injectees au runtime sur `document.documentElement`, toutes les nuances derivees s'obtenant par `color-mix()` en CSS. Au demarrage, `main.ts` appelle `GET /api/bootstrap?domain=<hostname>` en **même origine** (le vhost Apache de chaque ambassade proxifie `/api` vers le CMS Laravel), stocke la reponse dans un store Pinia `tenant` et applique le theme avant le montage. L'auth admin utilise **Sanctum en mode jeton porteur** : `POST /api/auth/login` renvoie un token, conserve dans `localStorage` et envoye en en-tête `Authorization: Bearer`. Un garde de route protege `/dashboard/*`. Le back Laravel etant developpe dans une autre session, le front travaille contre des **fixtures JSON versionnees** servies en dev par un plugin Vite, et contre un `fetch` stube dans les tests.

**Tech Stack :** Vue 3.5 (`<script setup>`), Vite 7, Tailwind CSS v4 (`@theme`, `color-mix`), vue-router 5, Pinia 3, TypeScript 5.9, Vitest 4 + `@vue/test-utils`, Playwright.

**Spec :** `docs/superpowers/specs/2026-09-09-embassy-cms-template-design.md` (sections 4.1, 4.2, 4.3, 4.5 pour ce plan)

## Ordre d'execution

Les tâches se suivent dans l'ordre numerique, **a une exception** : la **Tâche 13 (polices)**
s'execute **juste apres la Tâche 1**. Les anciens fichiers `FuturaCyrillic*.woff` ont ete
supprimes du repertoire le 2026-09-09, donc `style.css` reference aujourd'hui sept fichiers
inexistants : le site n'a plus aucune police de marque tant que cette tâche n'est pas faite.
Elle ne depend d'aucune autre.

Ordre reel : **1, 13, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12**.

## Global Constraints

- **Perimetre : Phase 1 uniquement.** Ne pas traiter la galerie publique, les responsables, les consuls, les services, le calendrier, le menu data-driven, ni aucun module Ambassade Secure (RDV, evenements). Ne pas toucher au back Laravel (`~/Laravel/ambassade-cms-api`, autre session).
- **Le back-end n'existe pas encore.** Aucune tâche ne doit dependre d'un serveur Laravel joignable. Tout se valide contre les fixtures de `src/api/fixtures/` et un `fetch` stube.
- **Un seul build pour tous les domaines.** Interdiction absolue d'introduire une variable d'environnement, un fichier de config ou une branche de code specifique a une ambassade. Toute donnee variable vient de `/api/bootstrap`.
- **Appels API en même origine.** Toutes les URL d'API sont **relatives** (`/api/...`). Ne jamais introduire `VITE_API_BASE_URL` ni une URL absolue vers l'API.
- **Auth = jeton porteur Sanctum.** `Authorization: Bearer <token>`. Ne pas implementer `/sanctum/csrf-cookie`, ni `credentials: 'include'`, ni de lecture de cookie XSRF.
- **Aucun secret commite.** Pas de token, mot de passe, clef d'API ni URL interne dans le depot. Les fixtures ne contiennent que des donnees fictives.
- **Langue :** tout le contenu, les commentaires et les messages d'interface en **francais**. **Aucun emoji** dans un fichier commite (les fichiers existants en contiennent : les retirer quand on reecrit le fichier concerne).
- **Git :** ne pousser que sur `origin` (Elsa224). **Jamais** sur `upstream` (Danielle074). Les etapes « Commit » de ce plan creent des commits locaux ; **ne pas pousser** sans demande explicite d'Elsa.
- **Prerequis machine :** `node_modules` est absent du poste. Executer `npm install` une fois avant la Tâche 1 (voir Tâche 1, etape 1).
- **`noUncheckedIndexedAccess` est actif** (`tsconfig.app.json`, dont herite `tsconfig.vitest.json`).
  Tout acces indexe a un tableau produit `T | undefined`. Dans les tests, indexer `mock.calls[0]` ou
  `fixture.data[0]` **exige** une assertion `!` — sinon `npm run type-check` echoue. Les extraits de
  code de ce plan la portent deja : les recopier verbatim, sans « corriger » le `!`.
- **Les fichiers de test vont dans un repertoire `__tests__/`**, seul emplacement inclus par
  `tsconfig.vitest.json` (`src/**/__tests__/*`). Un test place ailleurs echappe au type-check.
- **Palette de marque figee** (valeurs sources relevees dans le code existant, a reprendre verbatim) :
  `primary #006633` · `primary-dark #004c2a` · `primary-light #009460` · `secondary #fcd116` · `secondary-dark #e6b800` · `accent #ce1126` · `accent-dark #b30f20` · `accent-deep #8b0b1a` · `ink #346778` · `ink-dark #2a5563` · `ink-light #42637a` · `info #0297b8` · `info-dark #02739a`

---

## Structure des fichiers

**Theming**
- `src/style.css` (modifie) — bloc `@theme` : declare les tokens de couleur et derive les nuances par `color-mix()`. Seul endroit ou une couleur de marque est ecrite en dur (valeurs de repli si le bootstrap echoue).
- `src/theme/applyTheme.ts` (cree) — unique responsabilite : ecrire les trois variables CSS du tenant sur `document.documentElement`.
- `scripts/migrate-colors.mjs` (cree) — codemod jetable mais versionne : remplace `[#hex]` par le nom de token dans tout `src/`.

**Couche API**
- `src/api/client.ts` (cree) — un seul point de sortie HTTP : URL relatives, en-tête `Authorization` si un token est present, deserialisation JSON, erreurs typees. Tout appel reseau du front passe par la.
- `src/api/bootstrap.ts` (cree) — `fetchBootstrap()` et les types du contrat tenant (§4.1).
- `src/api/articles.ts` (cree) — CRUD Articles (§4.2) et les types associes.
- `src/api/fixtures/bootstrap.json`, `src/api/fixtures/articles.json` (crees) — le contrat rendu executable : servent au mode dev et aux tests.
- `vite-plugins/mock-api.ts` (cree) — plugin Vite **dev uniquement** qui sert `/api/*` depuis les fixtures. Jamais inclus dans le build de production.

**Etat applicatif**
- `src/stores/tenant.ts` (cree) — store Pinia : config du tenant + etat de chargement.
- `src/stores/auth.ts` (cree) — store Pinia : token, utilisateur courant, `login()`, `logout()`, persistance `localStorage`.
- `src/stores/counter.ts` (supprime) — squelette inutilise laisse par `create-vue`.

**Vues et routage**
- `src/views/Connexion.vue` (reecrit entierement) — formulaire d'authentification reel ; suppression de tout le texte « Secure Check » / « Maposte ».
- `src/router/index.ts` (modifie) — garde `beforeEach` sur `/dashboard/*`, route `/actualites/:slug`.
- `src/views/ActualiteDetail.vue` (cree) — page publique de detail d'un article.
- `src/views/dashboard/Articles.vue` (modifie) — `ref([])` remplace par les appels CRUD.
- `src/views/dashboard/Actualites.vue` (modifie) — idem.
- `src/main.ts` (modifie) — bootstrap asynchrone avant montage.

**Polices**
- `src/assets/fonts/*.woff2` (remplaces) — Futura PT avec le jeu latin accentue.
- `scripts/font-coverage.mjs` (cree) — lecteur de table `cmap` WOFF/WOFF2 sans dependance, utilise par le test de garde.

**Tests**
- `src/__tests__/App.spec.ts` (reecrit) — le test actuel attend « You did it! », texte absent de l'application.
- `e2e/vue.spec.ts` (reecrit) — même probleme.
- `src/__tests__/no-hardcoded-brand-colors.spec.ts` (cree) — garde anti-regression du refactor theming.
- `src/__tests__/fonts-coverage.spec.ts` (cree) — garde anti-regression des accents.
- `src/theme/__tests__/`, `src/api/__tests__/`, `src/stores/__tests__/`, `src/views/__tests__/`, `src/router/__tests__/` (crees).

---

## Tâche 1 : assainir la base de tests

Les deux seuls tests du depot attendent le texte « You did it! », qui n'existe nulle part dans l'application (`App.vue` ne contient qu'un `<router-view />`). Tant qu'ils sont rouges, aucun signal de test n'est exploitable pour la suite du plan. Cette tâche etablit une suite verte de reference.

**Files:**
- Modify: `src/__tests__/App.spec.ts`
- Modify: `e2e/vue.spec.ts`
- Delete: `src/stores/counter.ts`

**Interfaces:**
- Consumes: rien.
- Produits: une commande `npx vitest run` qui se termine en succes, prerequis de toutes les tâches suivantes.

- [ ] **Step 1 : installer les dependances**

`node_modules` est absent du poste. La premiere execution de `npx` telechargerait les paquets et paraitrait bloquee.

Run: `npm install`
Expected: installation complete, aucune erreur de resolution.

- [ ] **Step 2 : constater l'echec des tests existants**

Run: `npx vitest run`
Expected: FAIL — `src/__tests__/App.spec.ts` echoue avec un message du type `expected '' to contain 'You did it!'`.

- [ ] **Step 3 : reecrire le test unitaire d'App**

`App.vue` n'est qu'un point de montage du routeur. Le seul comportement verifiable est qu'il rend la vue active. On monte un routeur memoire minimal pour eviter de dependre du routeur reel de l'application.

Fichier `src/__tests__/App.spec.ts` (contenu complet) :

```ts
import { describe, it, expect } from 'vitest'
import { mount } from '@vue/test-utils'
import { createRouter, createMemoryHistory } from 'vue-router'
import { defineComponent, h } from 'vue'
import App from '../App.vue'

const VuePlaceholder = defineComponent({
  render: () => h('p', 'contenu de la route'),
})

describe('App', () => {
  it('rend la vue de la route active', async () => {
    const router = createRouter({
      history: createMemoryHistory(),
      routes: [{ path: '/', component: VuePlaceholder }],
    })
    router.push('/')
    await router.isReady()

    const wrapper = mount(App, { global: { plugins: [router] } })

    expect(wrapper.text()).toContain('contenu de la route')
  })
})
```

- [ ] **Step 4 : reecrire le test end-to-end**

Le test e2e attend lui aussi « You did it! ». On le remplace par une verification que la page d'accueil se charge sans erreur de console. On ne verifie pas de texte metier ici : le contenu de la page d'accueil sera migre vers l'API dans une phase ulterieure.

Fichier `e2e/vue.spec.ts` (contenu complet) :

```ts
import { test, expect } from '@playwright/test'

test("la page d'accueil se charge sans erreur console", async ({ page }) => {
  const erreurs: string[] = []
  page.on('console', (message) => {
    if (message.type() === 'error') erreurs.push(message.text())
  })

  await page.goto('/')

  await expect(page.locator('#app')).toBeVisible()
  expect(erreurs).toEqual([])
})
```

- [ ] **Step 5 : supprimer le store squelette inutilise**

`src/stores/counter.ts` est le fichier d'exemple genere par `create-vue`. Aucun composant ne l'importe, et il induirait en erreur sur les conventions de store a suivre dans les tâches 7 et 8.

Run: `grep -rn "stores/counter\|useCounterStore" src e2e ; rm src/stores/counter.ts`
Expected: le `grep` ne remonte aucune occurrence avant la suppression.

- [ ] **Step 6 : verifier que la suite unitaire passe**

Run: `npx vitest run`
Expected: PASS — 1 fichier de test, 1 test reussi.

- [ ] **Step 7 : verifier la compilation de types**

Run: `npm run type-check`
Expected: aucune erreur.

- [ ] **Step 8 : commit**

```bash
git add src/__tests__/App.spec.ts e2e/vue.spec.ts
git add -u src/stores/counter.ts
git commit -m "test: remplacer les tests squelette par des tests conformes a l'application"
```

---

## Tâche 2 : tokens de theme et application au runtime

Fondation du refactor template. On declare les tokens de couleur dans `@theme` (Tailwind v4 genere alors les utilitaires `bg-primary`, `text-accent`, `focus:ring-secondary`...) et on ecrit la fonction qui remplace, au runtime, les trois couleurs de base par celles du tenant.

Point cle : **seules trois variables sont injectees**. Les nuances (`primary-dark`, `accent-deep`...) sont derivees en CSS par `color-mix()` a partir de ces trois-la, donc elles suivent automatiquement le tenant sans que JavaScript ait a calculer quoi que ce soit.

**Files:**
- Modify: `src/style.css`
- Create: `src/theme/applyTheme.ts`
- Test: `src/theme/__tests__/applyTheme.spec.ts`

**Interfaces:**
- Consumes: rien.
- Produit :
  - `export interface ThemeColors { color_primary: string; color_secondary: string; color_accent: string }`
  - `export function applyTheme(theme: Partial<ThemeColors>, target?: HTMLElement): void` — ecrit `--color-primary`, `--color-secondary`, `--color-accent` sur `target` (defaut `document.documentElement`).
  - Les classes utilitaires `*-primary`, `*-primary-dark`, `*-primary-light`, `*-secondary`, `*-secondary-dark`, `*-accent`, `*-accent-dark`, `*-accent-deep`, `*-ink`, `*-ink-dark`, `*-ink-light`, `*-info`, `*-info-dark`, consommees par la Tâche 3.

- [ ] **Step 1 : ecrire le test en echec**

Fichier `src/theme/__tests__/applyTheme.spec.ts` (contenu complet) :

```ts
import { describe, it, expect, beforeEach } from 'vitest'
import { applyTheme } from '../applyTheme'

describe('applyTheme', () => {
  beforeEach(() => {
    document.documentElement.removeAttribute('style')
  })

  it('ecrit les trois couleurs du tenant sur la racine du document', () => {
    applyTheme({
      color_primary: '#006633',
      color_secondary: '#fcd116',
      color_accent: '#ce1126',
    })

    const racine = document.documentElement.style
    expect(racine.getPropertyValue('--color-primary')).toBe('#006633')
    expect(racine.getPropertyValue('--color-secondary')).toBe('#fcd116')
    expect(racine.getPropertyValue('--color-accent')).toBe('#ce1126')
  })

  it('applique le theme sur la cible fournie', () => {
    const cible = document.createElement('div')

    applyTheme(
      { color_primary: '#0a3d62', color_secondary: '#f6b93b', color_accent: '#b71540' },
      cible,
    )

    expect(cible.style.getPropertyValue('--color-primary')).toBe('#0a3d62')
    expect(document.documentElement.style.getPropertyValue('--color-primary')).toBe('')
  })

  it('ignore une couleur absente plutot que d ecrire une valeur vide', () => {
    document.documentElement.style.setProperty('--color-accent', '#ce1126')

    applyTheme({ color_primary: '#0a3d62', color_secondary: '', color_accent: '' })

    expect(document.documentElement.style.getPropertyValue('--color-primary')).toBe('#0a3d62')
    expect(document.documentElement.style.getPropertyValue('--color-accent')).toBe('#ce1126')
  })
})
```

Le troisieme test est le comportement important : si le back renvoie une config incomplete, on garde la valeur de repli du CSS plutot que d'effacer la couleur et d'afficher un site sans identite.

- [ ] **Step 2 : lancer le test pour verifier qu'il echoue**

Run: `npx vitest run src/theme`
Expected: FAIL — `Failed to resolve import "../applyTheme"`.

- [ ] **Step 3 : implementer applyTheme**

Fichier `src/theme/applyTheme.ts` (contenu complet) :

```ts
/**
 * Couleurs de marque fournies par le tenant via GET /api/bootstrap.
 * Les noms de champs reprennent ceux de la table `embassies` (spec 4.1).
 */
export interface ThemeColors {
  color_primary: string
  color_secondary: string
  color_accent: string
}

const CORRESPONDANCE: Record<keyof ThemeColors, string> = {
  color_primary: '--color-primary',
  color_secondary: '--color-secondary',
  color_accent: '--color-accent',
}

/**
 * Applique le theme du tenant en ecrivant les variables CSS de base.
 * Les nuances derivees (primary-dark, accent-deep...) sont calculees en CSS
 * par color-mix() dans style.css : rien d'autre n'est a injecter ici.
 * Une couleur vide ou absente est ignoree, ce qui laisse la valeur de repli
 * declaree dans @theme s'appliquer.
 */
export function applyTheme(theme: Partial<ThemeColors>, target?: HTMLElement): void {
  const racine = target ?? document.documentElement

  for (const [champ, variable] of Object.entries(CORRESPONDANCE)) {
    const valeur = theme[champ as keyof ThemeColors]
    if (typeof valeur === 'string' && valeur.trim() !== '') {
      racine.style.setProperty(variable, valeur.trim())
    }
  }
}
```

- [ ] **Step 4 : lancer le test pour verifier qu'il passe**

Run: `npx vitest run src/theme`
Expected: PASS — 3 tests reussis.

- [ ] **Step 5 : declarer les tokens dans le bloc @theme**

Inserer ce bloc dans `src/style.css`, **immediatement apres** la ligne `@import 'tailwindcss';` et **avant** les declarations `@font-face`.

```css
/*
 * Tokens de theme du template multi-ambassades.
 * Les trois couleurs de base sont remplacees au runtime par applyTheme()
 * a partir de la config du tenant (GET /api/bootstrap). Les valeurs ci-dessous
 * sont les couleurs de l'ambassade de Guinee, utilisees comme repli si le
 * bootstrap echoue ou renvoie une config incomplete.
 * Les nuances sont derivees par color-mix() : elles suivent donc
 * automatiquement la couleur de base injectee, sans calcul en JavaScript.
 */
@theme {
  --color-primary: #006633;
  --color-primary-dark: color-mix(in oklab, var(--color-primary) 78%, black);
  --color-primary-light: color-mix(in oklab, var(--color-primary) 82%, white);

  --color-secondary: #fcd116;
  --color-secondary-dark: color-mix(in oklab, var(--color-secondary) 88%, black);

  --color-accent: #ce1126;
  --color-accent-dark: color-mix(in oklab, var(--color-accent) 86%, black);
  --color-accent-deep: color-mix(in oklab, var(--color-accent) 66%, black);

  /* Gris bleutes du dashboard : non pilotes par le tenant. */
  --color-ink: #346778;
  --color-ink-dark: #2a5563;
  --color-ink-light: #42637a;

  /* Bleus d'information repris des ecrans SecureCheck. */
  --color-info: #0297b8;
  --color-info-dark: #02739a;
}
```

- [ ] **Step 6 : verifier que Tailwind genere bien les utilitaires**

Le risque reel ici est une erreur silencieuse de Tailwind v4 : un token mal nomme ne produit aucun utilitaire, et les classes de la Tâche 3 seraient sans effet. On le verifie par un build.

Run: `npx vite build 2>&1 | tail -5 ; grep -c "\-\-color-primary-dark" dist/assets/*.css`
Expected: build en succes, et le `grep` renvoie au moins `1`.

- [ ] **Step 7 : nettoyer l'artefact de build**

Run: `rm -rf dist`
Expected: `dist/` supprime (il est deja dans `.gitignore`, mais on ne laisse pas trainer d'artefact).

- [ ] **Step 8 : commit**

```bash
git add src/style.css src/theme/applyTheme.ts src/theme/__tests__/applyTheme.spec.ts
git commit -m "feat(theme): declarer les tokens de couleur et l'application du theme au runtime"
```

---

## Tâche 3 : migrer les couleurs de marque en dur vers les tokens

Environ 1900 occurrences de couleurs hexadecimales reparties sur 69 fichiers. La quasi-totalite (1443) sont des classes Tailwind a valeur arbitraire (`bg-[#006633]`, `focus:ring-[#fcd116]`, `hover:text-[#ce1126]`), ce qui rend la migration purement textuelle : on remplace le fragment `[#006633]` par `primary`, et tous les prefixes (`bg-`, `hover:bg-`, `focus:ring-`, `from-`...) comme tous les suffixes d'opacite (`/80`) sont preserves sans traitement particulier.

Les gris neutres (`#f3f4f6`, `#6b7280`, `#e5e7eb`...) ne sont **pas** des couleurs de marque : ils ne doivent pas devenir des tokens de tenant. Ils sont convertis vers les classes Tailwind standard equivalentes.

**Files:**
- Create: `scripts/migrate-colors.mjs`
- Modify: 69 fichiers sous `src/` (la liste exacte est produite par le script)
- Test: `src/__tests__/no-hardcoded-brand-colors.spec.ts`

**Interfaces:**
- Consomme : les utilitaires generes par le bloc `@theme` de la Tâche 2.
- Produit : plus aucune couleur de marque en dur dans `src/`, garantie par un test permanent.

- [ ] **Step 1 : ecrire le test de garde en echec**

Fichier `src/__tests__/no-hardcoded-brand-colors.spec.ts` (contenu complet) :

```ts
import { describe, it, expect } from 'vitest'
import { readFileSync, globSync } from 'node:fs'
import { fileURLToPath } from 'node:url'
import { join } from 'node:path'

/**
 * Garde du refactor template : une couleur de marque en dur dans un composant
 * echappe au theme du tenant, donc le meme build afficherait les couleurs de la
 * Guinee sur le site du Gabon. Seul style.css a le droit d'ecrire ces valeurs,
 * en repli du bootstrap.
 */
const COULEURS_DE_MARQUE = [
  '#006633', '#004c2a', '#004d26', '#00331a', '#006b44', '#007a4d', '#009460',
  '#fcd116', '#e6b800', '#e6a800',
  '#ce1126', '#b30f20', '#a10e1f', '#8b0b1a',
]

const racine = fileURLToPath(new URL('..', import.meta.url))

describe('couleurs de marque', () => {
  it("n'apparaissent en dur dans aucun composant", () => {
    // style.css porte les couleurs de repli ; ce fichier-ci porte la liste a interdire.
    const EXCLUS = ['style.css', '__tests__/no-hardcoded-brand-colors.spec.ts']

    const fichiers = globSync('**/*.{vue,ts,css}', { cwd: racine })
      .filter((chemin) => !EXCLUS.includes(chemin))

    const fautifs: string[] = []
    for (const chemin of fichiers) {
      const contenu = readFileSync(join(racine, chemin), 'utf8')
      const minuscules = contenu.toLowerCase()
      for (const couleur of COULEURS_DE_MARQUE) {
        if (minuscules.includes(couleur)) fautifs.push(`${chemin} contient ${couleur}`)
      }
    }

    expect(fautifs).toEqual([])
  })
})
```

Note pour l'implementeur : `globSync` est exporte par `node:fs` a partir de Node 22. Le depot exige `node >= 22.12` (`package.json`, champ `engines`), la fonction est donc disponible. Si l'execution echoue sur `globSync is not a function`, verifier la version de Node avec `node -v` avant de chercher ailleurs.

- [ ] **Step 2 : lancer le test pour verifier qu'il echoue**

Run: `npx vitest run src/__tests__/no-hardcoded-brand-colors.spec.ts`
Expected: FAIL — le tableau `fautifs` contient plusieurs centaines d'entrees, a commencer par `layouts/Layout.vue contient #006633`.

- [ ] **Step 3 : ecrire le codemod**

Fichier `scripts/migrate-colors.mjs` (contenu complet) :

```js
/**
 * Codemod de migration des couleurs en dur vers les tokens de theme.
 *
 * Deux passes :
 *  1. classes Tailwind a valeur arbitraire : `[#006633]` -> `primary`.
 *     Le remplacement porte uniquement sur le fragment entre crochets, ce qui
 *     preserve les prefixes (bg-, hover:bg-, focus:ring-, from-...) et les
 *     suffixes d'opacite (/80).
 *  2. couleurs hors classes (blocs <style>, attributs fill SVG) :
 *     `#006633` -> `var(--color-primary)`.
 *
 * Usage : node scripts/migrate-colors.mjs
 */
import { readFileSync, writeFileSync, globSync } from 'node:fs'
import { join } from 'node:path'

const RACINE = 'src'

/** Couleurs de marque : pilotees par le tenant, donc converties en tokens. */
const TOKENS = {
  '#006633': 'primary',
  '#009460': 'primary-light',
  '#004c2a': 'primary-dark',
  '#004d26': 'primary-dark',
  '#00331a': 'primary-dark',
  '#006b44': 'primary-dark',
  '#007a4d': 'primary-dark',
  '#fcd116': 'secondary',
  '#e6b800': 'secondary-dark',
  '#e6a800': 'secondary-dark',
  '#ce1126': 'accent',
  '#b30f20': 'accent-dark',
  '#a10e1f': 'accent-dark',
  '#8b0b1a': 'accent-deep',
  '#346778': 'ink',
  '#2a5563': 'ink-dark',
  '#42637a': 'ink-light',
  '#0297b8': 'info',
  '#02739a': 'info-dark',
}

/**
 * Gris neutres : pas de l'identite d'ambassade, donc pas de token de tenant.
 * On les ramene sur l'echelle grise standard de Tailwind.
 */
const NEUTRES = {
  '#ffffff': 'white',
  '#f9fafb': 'gray-50',
  '#f5f5f5': 'gray-100',
  '#f3f4f6': 'gray-100',
  '#f1f1f1': 'gray-100',
  '#f1f5f9': 'slate-100',
  '#e5e7eb': 'gray-200',
  '#cbd5e1': 'slate-300',
  '#d1d5db': 'gray-300',
  '#c1c1c1': 'gray-300',
  '#a8a8a8': 'gray-400',
  '#9ca3af': 'gray-400',
  '#94a3b8': 'slate-400',
  '#6b7280': 'gray-500',
  '#374151': 'gray-700',
  '#1f2937': 'gray-800',
}

/*
 * style.css porte les couleurs de repli, et le test de garde liste les hex de marque
 * pour pouvoir les interdire : les reecrire detruirait l un comme l autre.
 */
const EXCLUS = ['style.css', '__tests__/no-hardcoded-brand-colors.spec.ts']

const fichiers = globSync('**/*.{vue,ts,css}', { cwd: RACINE })
  .filter((chemin) => !EXCLUS.includes(chemin))

let modifies = 0

for (const relatif of fichiers) {
  const chemin = join(RACINE, relatif)
  const avant = readFileSync(chemin, 'utf8')
  let apres = avant

  // Passe 1 : classes a valeur arbitraire.
  for (const [hex, nom] of [...Object.entries(TOKENS), ...Object.entries(NEUTRES)]) {
    apres = apres.replaceAll(`[${hex}]`, nom)
    apres = apres.replaceAll(`[${hex.toUpperCase()}]`, nom)
  }

  // Passe 2 : couleurs de marque hors classes -> variable CSS.
  // Les neutres ne sont pas traites ici : un fill SVG gris reste litteral.
  for (const [hex, nom] of Object.entries(TOKENS)) {
    apres = apres.replaceAll(hex, `var(--color-${nom})`)
    apres = apres.replaceAll(hex.toUpperCase(), `var(--color-${nom})`)
  }

  if (apres !== avant) {
    writeFileSync(chemin, apres)
    modifies += 1
    console.log(`modifie ${chemin}`)
  }
}

console.log(`\n${modifies} fichier(s) modifie(s).`)
```

- [ ] **Step 4 : executer le codemod**

Run: `node scripts/migrate-colors.mjs`
Expected: environ 69 fichiers modifies, dernier ligne `69 fichier(s) modifie(s).` (le nombre exact peut varier de quelques unites).

- [ ] **Step 5 : verifier qu'aucune classe a valeur arbitraire ne subsiste**

Run: `grep -rnE '\[#[0-9a-fA-F]{6}' src | grep -v style.css`
Expected: aucune sortie. Si le `grep` remonte des lignes, ce sont des couleurs absentes des deux tables du codemod : les ajouter a `NEUTRES` (si ce sont des gris) ou a `TOKENS` (si ce sont des couleurs de marque), puis relancer l'etape 4.

- [ ] **Step 6 : lancer le test de garde**

Run: `npx vitest run src/__tests__/no-hardcoded-brand-colors.spec.ts`
Expected: PASS.

- [ ] **Step 7 : verifier visuellement la non-regression**

Le codemod est textuel : le risque n'est pas qu'il casse la compilation, mais qu'il change le rendu. Le theme de repli de la Tâche 2 est celui de la Guinee, donc le site doit être **visuellement identique** a avant.

Run: `npm run dev`
Puis ouvrir `http://localhost:5173/` et comparer avec la capture de reference. Verifier explicitement :
- l'en-tête et le pied de page de `Layout.vue` (78 occurrences migrees, le fichier le plus touche) ;
- la page d'accueil `/` (bandeau vert, boutons rouges, soulignes jaunes) ;
- la barre laterale du dashboard `/dashboard` (`Sidebar.vue`, dont deux regles CSS `background:` migrees en `var(--color-*)`) ;
- une page de relations bilaterales, `/usa`, pour les degrades `from-`/`to-`.

Expected: aucune difference de couleur perceptible. Arreter le serveur avec Ctrl-C.

- [ ] **Step 8 : verifier le type-check et la suite complete**

Run: `npm run type-check && npx vitest run`
Expected: PASS, aucune erreur de types.

- [ ] **Step 9 : commit**

```bash
git add scripts/migrate-colors.mjs src/__tests__/no-hardcoded-brand-colors.spec.ts
git add -u src
git commit -m "refactor(theme): remplacer les couleurs de marque en dur par les tokens de theme"
```

---

## Tâche 4 : client HTTP

Point de sortie reseau unique du front. Toutes les URL sont relatives — le vhost Apache de chaque domaine d'ambassade proxifie `/api` vers le CMS Laravel, il n'y a donc ni CORS, ni variable d'environnement, ni URL absolue.

**Files:**
- Create: `src/api/client.ts`
- Test: `src/api/__tests__/client.spec.ts`

**Interfaces:**
- Consomme : rien.
- Produit :
  - `export class ApiError extends Error { readonly statut: number; readonly corps: unknown }`
  - `export function setAuthToken(token: string | null): void`
  - `export function apiGet<T>(chemin: string): Promise<T>`
  - `export function apiPost<T>(chemin: string, corps: unknown): Promise<T>`
  - `export function apiPut<T>(chemin: string, corps: unknown): Promise<T>`
  - `export function apiDelete(chemin: string): Promise<void>`

- [ ] **Step 1 : ecrire le test en echec**

Fichier `src/api/__tests__/client.spec.ts` (contenu complet) :

```ts
import { describe, it, expect, beforeEach, vi, afterEach } from 'vitest'
import { ApiError, apiGet, apiPost, apiDelete, setAuthToken } from '../client'

function reponse(corps: unknown, statut = 200) {
  return new Response(corps === null ? null : JSON.stringify(corps), {
    status: statut,
    headers: { 'Content-Type': 'application/json' },
  })
}

describe('client API', () => {
  beforeEach(() => {
    setAuthToken(null)
    vi.stubGlobal('fetch', vi.fn())
  })

  afterEach(() => {
    vi.unstubAllGlobals()
  })

  it('appelle une URL relative pour rester en meme origine', async () => {
    vi.mocked(fetch).mockResolvedValue(reponse({ ok: true }))

    await apiGet('/api/bootstrap')

    const [url] = vi.mocked(fetch).mock.calls[0]!
    expect(url).toBe('/api/bootstrap')
  })

  it('retourne le corps JSON deserialise', async () => {
    vi.mocked(fetch).mockResolvedValue(reponse({ titre: 'Un article' }))

    const resultat = await apiGet<{ titre: string }>('/api/articles/1')

    expect(resultat).toEqual({ titre: 'Un article' })
  })

  it("n'envoie pas d en-tete Authorization sans token", async () => {
    vi.mocked(fetch).mockResolvedValue(reponse({}))

    await apiGet('/api/articles')

    const options = vi.mocked(fetch).mock.calls[0]![1] as RequestInit
    expect((options.headers as Record<string, string>).Authorization).toBeUndefined()
  })

  it('envoie le jeton porteur une fois defini', async () => {
    vi.mocked(fetch).mockResolvedValue(reponse({}))
    setAuthToken('jeton-de-test')

    await apiGet('/api/articles')

    const options = vi.mocked(fetch).mock.calls[0]![1] as RequestInit
    expect((options.headers as Record<string, string>).Authorization).toBe('Bearer jeton-de-test')
  })

  it('serialise le corps en JSON sur un POST', async () => {
    vi.mocked(fetch).mockResolvedValue(reponse({ id: 1 }, 201))

    await apiPost('/api/auth/login', { email: 'a@b.fr', password: 'secret' })

    const options = vi.mocked(fetch).mock.calls[0]![1] as RequestInit
    expect(options.method).toBe('POST')
    expect(options.body).toBe(JSON.stringify({ email: 'a@b.fr', password: 'secret' }))
    expect((options.headers as Record<string, string>)['Content-Type']).toBe('application/json')
  })

  it('leve une ApiError portant le statut et le corps sur une reponse 422', async () => {
    // Le corps d'une Response ne peut etre lu qu'une seule fois : mockResolvedValue
    // rendrait la MEME instance aux deux appels et le second echouerait sur
    // « Body is unusable ». On en fabrique donc une par appel.
    vi.mocked(fetch).mockImplementation(async () =>
      reponse({ message: 'Identifiants invalides' }, 422),
    )

    await expect(apiGet('/api/articles')).rejects.toMatchObject({
      statut: 422,
      corps: { message: 'Identifiants invalides' },
    })
    await expect(apiGet('/api/articles')).rejects.toBeInstanceOf(ApiError)
  })

  it('leve une ApiError de statut 0 quand le reseau est injoignable', async () => {
    vi.mocked(fetch).mockRejectedValue(new TypeError('Failed to fetch'))

    await expect(apiGet('/api/bootstrap')).rejects.toMatchObject({ statut: 0 })
  })

  it('accepte une reponse 204 sans corps sur un DELETE', async () => {
    vi.mocked(fetch).mockResolvedValue(new Response(null, { status: 204 }))

    await expect(apiDelete('/api/articles/1')).resolves.toBeUndefined()
  })
})
```

- [ ] **Step 2 : lancer le test pour verifier qu'il echoue**

Run: `npx vitest run src/api`
Expected: FAIL — `Failed to resolve import "../client"`.

- [ ] **Step 3 : implementer le client**

Fichier `src/api/client.ts` (contenu complet) :

```ts
/**
 * Point de sortie HTTP unique du front.
 *
 * Toutes les URL sont relatives : le vhost Apache de chaque domaine
 * d'ambassade proxifie /api vers le CMS Laravel. Le meme build fonctionne
 * donc sur tous les domaines, sans CORS ni variable d'environnement.
 *
 * Authentification : jeton porteur Sanctum, place ici par le store auth.
 */

export class ApiError extends Error {
  readonly statut: number
  readonly corps: unknown

  constructor(message: string, statut: number, corps: unknown) {
    super(message)
    this.name = 'ApiError'
    this.statut = statut
    this.corps = corps
  }
}

let jeton: string | null = null

/** Definit (ou efface) le jeton porteur envoye avec chaque requete. */
export function setAuthToken(token: string | null): void {
  jeton = token
}

function entetes(avecCorps: boolean): Record<string, string> {
  const resultat: Record<string, string> = { Accept: 'application/json' }
  if (avecCorps) resultat['Content-Type'] = 'application/json'
  if (jeton) resultat.Authorization = `Bearer ${jeton}`
  return resultat
}

async function requete<T>(chemin: string, options: RequestInit, avecCorps: boolean): Promise<T> {
  let reponse: Response
  try {
    reponse = await fetch(chemin, { ...options, headers: entetes(avecCorps) })
  } catch (erreur) {
    // Panne reseau, DNS ou serveur injoignable : fetch rejette sans reponse.
    throw new ApiError(
      erreur instanceof Error ? erreur.message : 'Serveur injoignable',
      0,
      null,
    )
  }

  // 204 No Content, ou reponse vide : rien a deserialiser.
  if (reponse.status === 204) return undefined as T

  const texte = await reponse.text()
  let corps: unknown = null
  if (texte !== '') {
    try {
      corps = JSON.parse(texte)
    } catch {
      corps = texte
    }
  }

  if (!reponse.ok) {
    const message =
      corps !== null && typeof corps === 'object' && 'message' in corps
        ? String((corps as { message: unknown }).message)
        : `Erreur ${reponse.status}`
    throw new ApiError(message, reponse.status, corps)
  }

  return corps as T
}

export function apiGet<T>(chemin: string): Promise<T> {
  return requete<T>(chemin, { method: 'GET' }, false)
}

export function apiPost<T>(chemin: string, corps: unknown): Promise<T> {
  return requete<T>(chemin, { method: 'POST', body: JSON.stringify(corps) }, true)
}

export function apiPut<T>(chemin: string, corps: unknown): Promise<T> {
  return requete<T>(chemin, { method: 'PUT', body: JSON.stringify(corps) }, true)
}

export function apiDelete(chemin: string): Promise<void> {
  return requete<void>(chemin, { method: 'DELETE' }, false)
}
```

- [ ] **Step 4 : lancer le test pour verifier qu'il passe**

Run: `npx vitest run src/api`
Expected: PASS — 8 tests reussis.

- [ ] **Step 5 : commit**

```bash
git add src/api/client.ts src/api/__tests__/client.spec.ts
git commit -m "feat(api): ajouter le client HTTP en meme origine avec jeton porteur"
```

---

## Tâche 5 : fixtures du contrat et serveur d'API simule en dev

Le back Laravel n'existe pas encore. Cette tâche fige le contrat de l'API sous forme de fichiers JSON versionnes, et les sert en developpement via un plugin Vite, pour que `npm run dev` produise une application fonctionnelle sans back-end. Les mêmes fixtures alimentent les tests des tâches suivantes : le contrat n'est ecrit qu'une fois.

Le plugin est **dev uniquement** : `apply: 'serve'` garantit qu'il ne participe pas au build de production.

**Files:**
- Create: `src/api/fixtures/bootstrap.json`
- Create: `src/api/fixtures/articles.json`
- Create: `vite-plugins/mock-api.ts`
- Modify: `vite.config.ts`

**Interfaces:**
- Consomme : rien.
- Produit : en `npm run dev`, les routes `GET /api/bootstrap`, `POST /api/auth/login`, `GET /api/auth/me`, `POST /api/auth/logout`, `GET|POST /api/articles`, `PUT|DELETE /api/articles/:id` repondent conformement aux sections 4.1, 4.2 et 4.3 de la spec. Les fixtures sont importables dans les tests par `import bootstrap from '@/api/fixtures/bootstrap.json'`.

- [ ] **Step 1 : ecrire la fixture de bootstrap**

Fichier `src/api/fixtures/bootstrap.json` (contenu complet). Ce fichier est la reference du contrat §4.1 pour le front ; toute divergence avec le back Laravel doit être arbitree ici.

```json
{
  "embassy": {
    "id": 1,
    "slug": "guinee-usa",
    "domain": "embassyofguineausa.org",
    "country_name_official": "Republique de Guinee",
    "country_name_short": "Guinee",
    "demonym": "guineen",
    "flag_image": "/fixtures/flag-guinee.png",
    "logo_image": "/fixtures/logo-guinee.png",
    "theme": {
      "color_primary": "#006633",
      "color_secondary": "#fcd116",
      "color_accent": "#ce1126"
    },
    "contact": {
      "address": "2112 Leroy Place NW, Washington, DC 20008",
      "phone": "+1 202 986 4300",
      "email": "contact@exemple-ambassade.test",
      "hours": "Du lundi au vendredi, 9h - 17h"
    },
    "modules": {
      "bilateral": true,
      "galerie": true,
      "secure_rdv": false,
      "secure_events": false
    }
  }
}
```

- [ ] **Step 2 : ecrire la fixture d'articles**

Fichier `src/api/fixtures/articles.json` (contenu complet). Les champs reprennent la table `articles` de la section 4.2, y compris `temps_lecture` derive cote serveur.

```json
{
  "data": [
    {
      "id": 1,
      "slug": "rencontre-bilaterale-a-washington",
      "titre": "Rencontre bilaterale a Washington",
      "resume": "L ambassadeur a rencontre les representants du Departement d Etat.",
      "contenu": "<p>Une rencontre de travail s est tenue a Washington.</p>",
      "image": "/fixtures/article-1.jpg",
      "categorie": { "id": 1, "nom": "Actualites Ambassade", "slug": "actualites-ambassade", "couleur": "#006633" },
      "date_publication": "2026-08-14",
      "statut": "publie",
      "vues": 128,
      "likes": 12,
      "locale": "fr",
      "source": "manuel",
      "temps_lecture": 2
    },
    {
      "id": 2,
      "slug": "accord-de-cooperation-avec-le-costa-rica",
      "titre": "Accord de cooperation avec le Costa Rica",
      "resume": "Signature d un accord de cooperation economique.",
      "contenu": "<p>Les deux pays ont signe un accord de cooperation.</p>",
      "image": "/fixtures/article-2.jpg",
      "categorie": { "id": 2, "nom": "Actualites Diplomatiques", "slug": "actualites-diplomatique", "couleur": "#ce1126" },
      "date_publication": "2026-07-02",
      "statut": "a_valider",
      "vues": 41,
      "likes": 3,
      "locale": "fr",
      "source": "facebook",
      "temps_lecture": 1
    },
    {
      "id": 3,
      "slug": "brouillon-fete-nationale",
      "titre": "Preparation de la fete nationale",
      "resume": "Les preparatifs de la ceremonie sont engages.",
      "contenu": "<p>La ceremonie se tiendra a la chancellerie.</p>",
      "image": "/fixtures/article-3.jpg",
      "categorie": { "id": 3, "nom": "Actualites Gouvernementales", "slug": "actualites-gouvernementale", "couleur": "#fcd116" },
      "date_publication": "2026-09-01",
      "statut": "brouillon",
      "vues": 0,
      "likes": 0,
      "locale": "fr",
      "source": "manuel",
      "temps_lecture": 1
    }
  ],
  "meta": { "total": 3, "page": 1, "par_page": 10 }
}
```

- [ ] **Step 3 : ecrire le plugin Vite de simulation**

Fichier `vite-plugins/mock-api.ts` (contenu complet) :

```ts
import type { Plugin } from 'vite'
import { readFileSync } from 'node:fs'
import { fileURLToPath } from 'node:url'

/**
 * Sert /api/* depuis les fixtures pendant le developpement, le CMS Laravel
 * etant developpe separement. En production, /api est proxifie vers le back
 * par le vhost Apache de chaque domaine d'ambassade : ce plugin, declare avec
 * apply: 'serve', n'est jamais inclus dans le build.
 *
 * Les identifiants ci-dessous sont de simples valeurs de developpement, sans
 * aucun rapport avec un compte reel.
 */
const IDENTIFIANTS_DEV = { email: 'admin@exemple-ambassade.test', password: 'motdepasse' }
const JETON_DEV = 'jeton-de-developpement'

function fixture(nom: string): unknown {
  const chemin = fileURLToPath(new URL(`../src/api/fixtures/${nom}.json`, import.meta.url))
  return JSON.parse(readFileSync(chemin, 'utf8'))
}

export function mockApi(): Plugin {
  // Etat en memoire : remis a zero a chaque redemarrage du serveur de dev.
  let articles = (fixture('articles') as { data: unknown[] }).data as Record<string, unknown>[]
  let prochainId = 100

  return {
    name: 'mock-api',
    apply: 'serve',
    configureServer(serveur) {
      serveur.middlewares.use('/api', (requete, reponse) => {
        const url = new URL(requete.url ?? '/', 'http://localhost')
        const chemin = url.pathname
        const methode = requete.method ?? 'GET'

        const repondre = (statut: number, corps: unknown) => {
          reponse.statusCode = statut
          reponse.setHeader('Content-Type', 'application/json')
          reponse.end(corps === null ? '' : JSON.stringify(corps))
        }

        const lireCorps = (): Promise<Record<string, unknown>> =>
          new Promise((resoudre) => {
            let brut = ''
            requete.on('data', (morceau) => (brut += morceau))
            requete.on('end', () => resoudre(brut ? JSON.parse(brut) : {}))
          })

        if (chemin === '/bootstrap') {
          return repondre(200, fixture('bootstrap'))
        }

        if (chemin === '/auth/login' && methode === 'POST') {
          return void lireCorps().then((corps) => {
            if (
              corps.email === IDENTIFIANTS_DEV.email &&
              corps.password === IDENTIFIANTS_DEV.password
            ) {
              return repondre(200, {
                token: JETON_DEV,
                user: { id: 1, nom: 'Administrateur', email: IDENTIFIANTS_DEV.email, role: 'admin' },
              })
            }
            return repondre(422, { message: 'Identifiants invalides.' })
          })
        }

        if (chemin === '/auth/me') {
          if (requete.headers.authorization !== `Bearer ${JETON_DEV}`) {
            return repondre(401, { message: 'Non authentifie.' })
          }
          return repondre(200, {
            user: { id: 1, nom: 'Administrateur', email: IDENTIFIANTS_DEV.email, role: 'admin' },
          })
        }

        if (chemin === '/auth/logout' && methode === 'POST') {
          return repondre(204, null)
        }

        if (chemin === '/articles' && methode === 'GET') {
          return repondre(200, {
            data: articles,
            meta: { total: articles.length, page: 1, par_page: 10 },
          })
        }

        if (chemin === '/articles' && methode === 'POST') {
          return void lireCorps().then((corps) => {
            const article = { ...corps, id: prochainId++, vues: 0, likes: 0, temps_lecture: 1 }
            articles = [article, ...articles]
            return repondre(201, { data: article })
          })
        }

        const correspondance = chemin.match(/^\/articles\/(\d+)$/)
        if (correspondance) {
          const id = Number(correspondance[1])

          if (methode === 'GET') {
            const trouve = articles.find((a) => a.id === id)
            return trouve ? repondre(200, { data: trouve }) : repondre(404, { message: 'Introuvable.' })
          }

          if (methode === 'PUT') {
            return void lireCorps().then((corps) => {
              const index = articles.findIndex((a) => a.id === id)
              if (index === -1) return repondre(404, { message: 'Introuvable.' })
              articles[index] = { ...articles[index], ...corps, id }
              return repondre(200, { data: articles[index] })
            })
          }

          if (methode === 'DELETE') {
            articles = articles.filter((a) => a.id !== id)
            return repondre(204, null)
          }
        }

        return repondre(404, { message: `Route simulee absente : ${methode} /api${chemin}` })
      })
    },
  }
}
```

- [ ] **Step 4 : brancher le plugin dans la configuration Vite**

Dans `vite.config.ts`, ajouter l'import et l'entree dans `plugins` :

```ts
import { mockApi } from './vite-plugins/mock-api'
```

puis, dans le tableau `plugins`, ajouter `mockApi(),` apres `vueDevTools(),`.

- [ ] **Step 5 : verifier le serveur simule**

Run: `npm run dev` puis, dans un autre terminal :
```bash
curl -s http://localhost:5173/api/bootstrap | head -c 200
curl -s -X POST http://localhost:5173/api/auth/login \
  -H 'Content-Type: application/json' \
  -d '{"email":"admin@exemple-ambassade.test","password":"mauvais"}'
```
Expected: la premiere commande renvoie le JSON de la fixture bootstrap ; la seconde renvoie `{"message":"Identifiants invalides."}`. Arreter le serveur avec Ctrl-C.

- [ ] **Step 6 : verifier que le plugin n'entre pas dans le build**

Run: `npx vite build 2>&1 | tail -3 && grep -rl "jeton-de-developpement" dist || echo "absent du build"`
Expected: build en succes, puis `absent du build`.

- [ ] **Step 7 : nettoyer l'artefact de build**

Run: `rm -rf dist`

- [ ] **Step 8 : commit**

```bash
git add src/api/fixtures vite-plugins/mock-api.ts vite.config.ts
git commit -m "feat(dev): figer le contrat API en fixtures et simuler /api en developpement"
```

---

## Tâche 6 : resolution du tenant par le domaine

Le front lit `window.location.hostname`, appelle `/api/bootstrap`, stocke la config du tenant et applique son theme. C'est le mecanisme qui permet a un seul build de servir tous les domaines.

Choix de robustesse a implementer : si le bootstrap echoue, l'application se monte quand même, avec le theme de repli declare dans `@theme`. Un site d'ambassade injoignable est pire qu'un site aux couleurs de repli.

**Files:**
- Create: `src/api/bootstrap.ts`
- Create: `src/stores/tenant.ts`
- Modify: `src/main.ts`
- Test: `src/stores/__tests__/tenant.spec.ts`

**Interfaces:**
- Consomme : `apiGet` (Tâche 4), `applyTheme` et `ThemeColors` (Tâche 2).
- Produit :
  - `export interface Embassy { id: number; slug: string; domain: string; country_name_official: string; country_name_short: string; demonym: string; flag_image: string; logo_image: string; theme: ThemeColors; contact: EmbassyContact; modules: Record<string, boolean> }`
  - `export interface EmbassyContact { address: string; phone: string; email: string; hours: string }`
  - `export function fetchBootstrap(domain: string): Promise<Embassy>`
  - `export const useTenantStore` avec l'etat `embassy: Embassy | null`, `chargement: boolean`, `erreur: string | null`, les getters `moduleActif(nom: string): boolean` et `nomCourt: string`, et l'action `charger(domain?: string): Promise<void>`.

- [ ] **Step 1 : ecrire le test en echec**

Fichier `src/stores/__tests__/tenant.spec.ts` (contenu complet) :

```ts
import { describe, it, expect, beforeEach, vi, afterEach } from 'vitest'
import { setActivePinia, createPinia } from 'pinia'
import { useTenantStore } from '../tenant'
import bootstrapFixture from '@/api/fixtures/bootstrap.json'

function reponse(corps: unknown, statut = 200) {
  return new Response(JSON.stringify(corps), {
    status: statut,
    headers: { 'Content-Type': 'application/json' },
  })
}

describe('store tenant', () => {
  beforeEach(() => {
    setActivePinia(createPinia())
    document.documentElement.removeAttribute('style')
    vi.stubGlobal('fetch', vi.fn())
  })

  afterEach(() => {
    vi.unstubAllGlobals()
  })

  it('interroge le bootstrap avec le domaine courant', async () => {
    vi.mocked(fetch).mockResolvedValue(reponse(bootstrapFixture))

    await useTenantStore().charger('ambassade-du-gabon.test')

    const [url] = vi.mocked(fetch).mock.calls[0]!
    expect(url).toBe('/api/bootstrap?domain=ambassade-du-gabon.test')
  })

  it('expose la config de l ambassade apres chargement', async () => {
    vi.mocked(fetch).mockResolvedValue(reponse(bootstrapFixture))
    const store = useTenantStore()

    await store.charger('embassyofguineausa.org')

    expect(store.embassy?.slug).toBe('guinee-usa')
    expect(store.nomCourt).toBe('Guinee')
    expect(store.chargement).toBe(false)
    expect(store.erreur).toBeNull()
  })

  it('applique le theme du tenant aux variables CSS', async () => {
    vi.mocked(fetch).mockResolvedValue(
      reponse({
        embassy: {
          ...bootstrapFixture.embassy,
          theme: { color_primary: '#0a3d62', color_secondary: '#f6b93b', color_accent: '#b71540' },
        },
      }),
    )

    await useTenantStore().charger('ambassade-du-gabon.test')

    expect(document.documentElement.style.getPropertyValue('--color-primary')).toBe('#0a3d62')
    expect(document.documentElement.style.getPropertyValue('--color-accent')).toBe('#b71540')
  })

  it('expose l activation des modules', async () => {
    vi.mocked(fetch).mockResolvedValue(reponse(bootstrapFixture))
    const store = useTenantStore()

    await store.charger('embassyofguineausa.org')

    expect(store.moduleActif('bilateral')).toBe(true)
    expect(store.moduleActif('secure_rdv')).toBe(false)
    expect(store.moduleActif('module_inconnu')).toBe(false)
  })

  it('enregistre l erreur sans lever quand le bootstrap echoue', async () => {
    vi.mocked(fetch).mockResolvedValue(reponse({ message: 'Domaine inconnu.' }, 404))
    const store = useTenantStore()

    await expect(store.charger('domaine-inconnu.test')).resolves.toBeUndefined()

    expect(store.embassy).toBeNull()
    expect(store.erreur).toBe('Domaine inconnu.')
    expect(store.chargement).toBe(false)
  })
})
```

- [ ] **Step 2 : lancer le test pour verifier qu'il echoue**

Run: `npx vitest run src/stores`
Expected: FAIL — `Failed to resolve import "../tenant"`.

- [ ] **Step 3 : implementer le module bootstrap**

Fichier `src/api/bootstrap.ts` (contenu complet) :

```ts
import { apiGet } from './client'
import type { ThemeColors } from '@/theme/applyTheme'

/** Coordonnees de l'ambassade (spec 4.1). */
export interface EmbassyContact {
  address: string
  phone: string
  email: string
  hours: string
}

/** Le tenant : une ambassade et toute sa configuration de site (spec 4.1). */
export interface Embassy {
  id: number
  slug: string
  domain: string
  country_name_official: string
  country_name_short: string
  demonym: string
  flag_image: string
  logo_image: string
  theme: ThemeColors
  contact: EmbassyContact
  modules: Record<string, boolean>
}

interface ReponseBootstrap {
  embassy: Embassy
}

/**
 * Resout le tenant a partir du domaine.
 * Le parametre `domain` double l en-tete Host, que le middleware Laravel
 * utilise egalement : les deux mecanismes doivent designer la meme ambassade.
 */
export async function fetchBootstrap(domain: string): Promise<Embassy> {
  const reponse = await apiGet<ReponseBootstrap>(
    `/api/bootstrap?domain=${encodeURIComponent(domain)}`,
  )
  return reponse.embassy
}
```

- [ ] **Step 4 : implementer le store tenant**

Fichier `src/stores/tenant.ts` (contenu complet) :

```ts
import { defineStore } from 'pinia'
import { ref, computed } from 'vue'
import { fetchBootstrap, type Embassy } from '@/api/bootstrap'
import { applyTheme } from '@/theme/applyTheme'
import { ApiError } from '@/api/client'

/**
 * Config du site courant, resolue par le nom de domaine.
 * Un seul build sert tous les domaines : tout ce qui differe d une ambassade
 * a l autre passe par ce store.
 */
export const useTenantStore = defineStore('tenant', () => {
  const embassy = ref<Embassy | null>(null)
  const chargement = ref(false)
  const erreur = ref<string | null>(null)

  const nomCourt = computed(() => embassy.value?.country_name_short ?? '')

  function moduleActif(nom: string): boolean {
    return embassy.value?.modules?.[nom] === true
  }

  /**
   * Charge la config du tenant et applique son theme.
   * Ne leve jamais : un echec de bootstrap laisse l application se monter avec
   * le theme de repli declare dans style.css, ce qui vaut mieux qu une page
   * blanche sur un site d ambassade.
   */
  async function charger(domain: string = window.location.hostname): Promise<void> {
    chargement.value = true
    erreur.value = null
    try {
      const resultat = await fetchBootstrap(domain)
      embassy.value = resultat
      applyTheme(resultat.theme)
    } catch (souleve) {
      erreur.value = souleve instanceof ApiError ? souleve.message : 'Configuration indisponible.'
      console.error('Echec du bootstrap du tenant :', souleve)
    } finally {
      chargement.value = false
    }
  }

  return { embassy, chargement, erreur, nomCourt, moduleActif, charger }
})
```

- [ ] **Step 5 : lancer le test pour verifier qu'il passe**

Run: `npx vitest run src/stores`
Expected: PASS — 5 tests reussis.

- [ ] **Step 6 : declencher le bootstrap avant le montage**

Fichier `src/main.ts` (contenu complet) :

```ts
import { createApp } from 'vue'
import { createPinia } from 'pinia'
import App from './App.vue'
import router from './router'
import './style.css'
import 'boxicons/css/boxicons.min.css'
import { useTenantStore } from '@/stores/tenant'

const app = createApp(App)
const pinia = createPinia()

app.use(pinia)
app.use(router)

// La config du tenant est resolue avant le montage : le theme est ainsi
// applique des le premier rendu, sans transition de couleurs visible.
useTenantStore(pinia)
  .charger()
  .finally(() => {
    app.mount('#app')
  })
```

- [ ] **Step 7 : verifier le comportement dans le navigateur**

Run: `npm run dev`, puis ouvrir `http://localhost:5173/` et l'onglet Reseau des outils de developpement.
Expected: une requete `GET /api/bootstrap?domain=localhost` en 200, le site s'affiche normalement aux couleurs de la Guinee. Dans la console, `document.documentElement.style.getPropertyValue('--color-primary')` renvoie `#006633`. Arreter avec Ctrl-C.

- [ ] **Step 8 : verifier le type-check et la suite complete**

Run: `npm run type-check && npx vitest run`
Expected: PASS.

- [ ] **Step 9 : commit**

```bash
git add src/api/bootstrap.ts src/stores/tenant.ts src/stores/__tests__/tenant.spec.ts src/main.ts
git commit -m "feat(tenant): resoudre le tenant par le domaine et appliquer son theme au boot"
```

---

## Tâche 7 : store d'authentification

Auth Sanctum en jeton porteur. Le store detient le token, le persiste dans `localStorage` pour survivre a un rechargement, et le transmet au client HTTP.

**Files:**
- Create: `src/stores/auth.ts`
- Test: `src/stores/__tests__/auth.spec.ts`

**Interfaces:**
- Consomme : `apiPost`, `apiGet`, `setAuthToken`, `ApiError` (Tâche 4).
- Produit :
  - `export interface Utilisateur { id: number; nom: string; email: string; role: string }`
  - `export const useAuthStore` avec l'etat `token: string | null`, `utilisateur: Utilisateur | null`, `chargement: boolean`, `erreur: string | null`, le getter `estAuthentifie: boolean`, et les actions `login(email: string, password: string): Promise<boolean>`, `logout(): Promise<void>`, `restaurerSession(): void`.
- La clef de stockage est `cms_token`. Elle est utilisee par le garde de route (Tâche 9).

- [ ] **Step 1 : ecrire le test en echec**

Fichier `src/stores/__tests__/auth.spec.ts` (contenu complet) :

```ts
import { describe, it, expect, beforeEach, vi, afterEach } from 'vitest'
import { setActivePinia, createPinia } from 'pinia'
import { useAuthStore } from '../auth'

function reponse(corps: unknown, statut = 200) {
  return new Response(corps === null ? null : JSON.stringify(corps), {
    status: statut,
    headers: { 'Content-Type': 'application/json' },
  })
}

const CONNEXION_OK = {
  token: 'jeton-valide',
  user: { id: 1, nom: 'Administrateur', email: 'admin@exemple-ambassade.test', role: 'admin' },
}

describe('store auth', () => {
  beforeEach(() => {
    setActivePinia(createPinia())
    localStorage.clear()
    vi.stubGlobal('fetch', vi.fn())
  })

  afterEach(() => {
    vi.unstubAllGlobals()
  })

  it('envoie les identifiants a POST /api/auth/login', async () => {
    vi.mocked(fetch).mockResolvedValue(reponse(CONNEXION_OK))

    await useAuthStore().login('admin@exemple-ambassade.test', 'motdepasse')

    const [url, options] = vi.mocked(fetch).mock.calls[0]!
    expect(url).toBe('/api/auth/login')
    expect((options as RequestInit).method).toBe('POST')
    expect((options as RequestInit).body).toBe(
      JSON.stringify({ email: 'admin@exemple-ambassade.test', password: 'motdepasse' }),
    )
  })

  it('conserve le jeton et l utilisateur apres une connexion reussie', async () => {
    vi.mocked(fetch).mockResolvedValue(reponse(CONNEXION_OK))
    const store = useAuthStore()

    const reussi = await store.login('admin@exemple-ambassade.test', 'motdepasse')

    expect(reussi).toBe(true)
    expect(store.token).toBe('jeton-valide')
    expect(store.utilisateur?.role).toBe('admin')
    expect(store.estAuthentifie).toBe(true)
    expect(localStorage.getItem('cms_token')).toBe('jeton-valide')
  })

  it('joint le jeton aux requetes suivantes', async () => {
    vi.mocked(fetch).mockResolvedValue(reponse(CONNEXION_OK))
    await useAuthStore().login('admin@exemple-ambassade.test', 'motdepasse')

    vi.mocked(fetch).mockResolvedValue(reponse({ data: [] }))
    const { apiGet } = await import('@/api/client')
    await apiGet('/api/articles')

    const options = vi.mocked(fetch).mock.calls[1]![1] as RequestInit
    expect((options.headers as Record<string, string>).Authorization).toBe('Bearer jeton-valide')
  })

  it('expose le message d erreur et reste deconnecte sur identifiants invalides', async () => {
    vi.mocked(fetch).mockResolvedValue(reponse({ message: 'Identifiants invalides.' }, 422))
    const store = useAuthStore()

    const reussi = await store.login('admin@exemple-ambassade.test', 'faux')

    expect(reussi).toBe(false)
    expect(store.estAuthentifie).toBe(false)
    expect(store.erreur).toBe('Identifiants invalides.')
    expect(localStorage.getItem('cms_token')).toBeNull()
  })

  it('efface le jeton a la deconnexion', async () => {
    vi.mocked(fetch).mockResolvedValue(reponse(CONNEXION_OK))
    const store = useAuthStore()
    await store.login('admin@exemple-ambassade.test', 'motdepasse')

    vi.mocked(fetch).mockResolvedValue(new Response(null, { status: 204 }))
    await store.logout()

    expect(store.token).toBeNull()
    expect(store.utilisateur).toBeNull()
    expect(store.estAuthentifie).toBe(false)
    expect(localStorage.getItem('cms_token')).toBeNull()
  })

  it('efface le jeton meme si l appel de deconnexion echoue', async () => {
    vi.mocked(fetch).mockResolvedValue(reponse(CONNEXION_OK))
    const store = useAuthStore()
    await store.login('admin@exemple-ambassade.test', 'motdepasse')

    vi.mocked(fetch).mockRejectedValue(new TypeError('Failed to fetch'))
    await store.logout()

    expect(store.estAuthentifie).toBe(false)
    expect(localStorage.getItem('cms_token')).toBeNull()
  })

  it('restaure une session depuis le stockage local', () => {
    localStorage.setItem('cms_token', 'jeton-persiste')
    const store = useAuthStore()

    store.restaurerSession()

    expect(store.token).toBe('jeton-persiste')
    expect(store.estAuthentifie).toBe(true)
  })
})
```

- [ ] **Step 2 : lancer le test pour verifier qu'il echoue**

Run: `npx vitest run src/stores/__tests__/auth.spec.ts`
Expected: FAIL — `Failed to resolve import "../auth"`.

- [ ] **Step 3 : implementer le store auth**

Fichier `src/stores/auth.ts` (contenu complet) :

```ts
import { defineStore } from 'pinia'
import { ref, computed } from 'vue'
import { apiPost, setAuthToken, ApiError } from '@/api/client'

/** Administrateur du back-office (spec 4.3). */
export interface Utilisateur {
  id: number
  nom: string
  email: string
  role: string
}

interface ReponseConnexion {
  token: string
  user: Utilisateur
}

/** Clef de persistance du jeton porteur Sanctum. */
const CLEF_JETON = 'cms_token'

export const useAuthStore = defineStore('auth', () => {
  const token = ref<string | null>(null)
  const utilisateur = ref<Utilisateur | null>(null)
  const chargement = ref(false)
  const erreur = ref<string | null>(null)

  const estAuthentifie = computed(() => token.value !== null)

  function enregistrerJeton(valeur: string | null): void {
    token.value = valeur
    setAuthToken(valeur)
    if (valeur === null) {
      localStorage.removeItem(CLEF_JETON)
    } else {
      localStorage.setItem(CLEF_JETON, valeur)
    }
  }

  /** Rend true si la connexion a reussi ; le message d erreur reste dans `erreur`. */
  async function login(email: string, password: string): Promise<boolean> {
    chargement.value = true
    erreur.value = null
    try {
      const reponse = await apiPost<ReponseConnexion>('/api/auth/login', { email, password })
      enregistrerJeton(reponse.token)
      utilisateur.value = reponse.user
      return true
    } catch (souleve) {
      erreur.value =
        souleve instanceof ApiError && souleve.statut !== 0
          ? souleve.message
          : 'Serveur injoignable. Reessayez dans un instant.'
      return false
    } finally {
      chargement.value = false
    }
  }

  /**
   * Deconnecte l administrateur. La session locale est effacee meme si l appel
   * serveur echoue : laisser un jeton actif dans le navigateur apres un clic
   * sur « se deconnecter » serait pire qu un jeton orphelin cote serveur.
   */
  async function logout(): Promise<void> {
    try {
      await apiPost('/api/auth/logout', {})
    } catch {
      // Deconnexion locale malgre tout.
    } finally {
      enregistrerJeton(null)
      utilisateur.value = null
    }
  }

  /** Recharge le jeton persiste au demarrage de l application. */
  function restaurerSession(): void {
    const persiste = localStorage.getItem(CLEF_JETON)
    if (persiste) {
      token.value = persiste
      setAuthToken(persiste)
    }
  }

  return { token, utilisateur, chargement, erreur, estAuthentifie, login, logout, restaurerSession }
})
```

- [ ] **Step 4 : lancer le test pour verifier qu'il passe**

Run: `npx vitest run src/stores/__tests__/auth.spec.ts`
Expected: PASS — 7 tests reussis.

- [ ] **Step 5 : restaurer la session au demarrage**

Dans `src/main.ts`, ajouter l'import et l'appel de restauration **avant** le chargement du tenant :

```ts
import { useAuthStore } from '@/stores/auth'
```

puis, juste apres `app.use(router)` :

```ts
// Le jeton persiste est remis en place avant le premier garde de route.
useAuthStore(pinia).restaurerSession()
```

- [ ] **Step 6 : verifier la suite complete**

Run: `npm run type-check && npx vitest run`
Expected: PASS.

- [ ] **Step 7 : commit**

```bash
git add src/stores/auth.ts src/stores/__tests__/auth.spec.ts src/main.ts
git commit -m "feat(auth): ajouter le store d'authentification Sanctum a jeton porteur"
```

---

## Tâche 8 : reecriture de la page de connexion

La page actuelle est une maquette : le bouton « Se connecter » est un `router-link` vers `/dashboard`, sans aucune verification, et la page affiche encore le texte recycle d'un autre projet (« Logo Secure Check », « L'application de gestion et suivie de vos colis avec Maposte »). Elle est reecrite entierement.

Suppressions explicitement requises : l'`alt` « Logo Secure Check », le paragraphe Maposte, l'`alt` « Maposte » de l'image de droite, le lien « Creer un compte » (route `/creer-compte` inexistante ; la creation de comptes admin releve du back-office), le placeholder `securecheck@scb.org`, et les emojis des commentaires de template.

**Files:**
- Modify: `src/views/Connexion.vue` (reecriture complete)
- Test: `src/views/__tests__/Connexion.spec.ts`

**Interfaces:**
- Consomme : `useAuthStore` (Tâche 7), `useTenantStore` (Tâche 6), les tokens de theme (Tâche 2).
- Produit : apres connexion reussie, redirection vers la route visee (query `redirect`) ou `/dashboard` a defaut. Contrat consomme par le garde de la Tâche 9.

- [ ] **Step 1 : ecrire le test en echec**

Fichier `src/views/__tests__/Connexion.spec.ts` (contenu complet) :

```ts
import { describe, it, expect, beforeEach, vi } from 'vitest'
import { mount, flushPromises } from '@vue/test-utils'
import { createRouter, createMemoryHistory, type Router } from 'vue-router'
import { createPinia, setActivePinia } from 'pinia'
import { defineComponent, h } from 'vue'
import Connexion from '../Connexion.vue'
import { useAuthStore } from '@/stores/auth'

const Vide = defineComponent({ render: () => h('div') })

function creerRouteur(): Router {
  return createRouter({
    history: createMemoryHistory(),
    routes: [
      { path: '/', component: Vide },
      { path: '/connexion', component: Connexion },
      { path: '/dashboard', component: Vide },
      { path: '/dashboard/articles', component: Vide },
    ],
  })
}

async function monter(routeur: Router) {
  routeur.push('/connexion')
  await routeur.isReady()
  return mount(Connexion, { global: { plugins: [routeur] } })
}

describe('page de connexion', () => {
  beforeEach(() => {
    setActivePinia(createPinia())
    localStorage.clear()
  })

  it('ne contient plus le texte recycle de Secure Check ni de Maposte', async () => {
    const wrapper = await monter(creerRouteur())

    const html = wrapper.html()
    expect(html).not.toMatch(/secure ?check/i)
    expect(html).not.toMatch(/maposte/i)
    expect(html).not.toMatch(/colis/i)
    expect(html).not.toMatch(/creer-compte/i)
  })

  it('appelle le store auth avec les identifiants saisis', async () => {
    const routeur = creerRouteur()
    const wrapper = await monter(routeur)
    const auth = useAuthStore()
    const login = vi.spyOn(auth, 'login').mockResolvedValue(true)

    await wrapper.find('input[type="email"]').setValue('admin@exemple-ambassade.test')
    await wrapper.find('input[type="password"]').setValue('motdepasse')
    await wrapper.find('form').trigger('submit')
    await flushPromises()

    expect(login).toHaveBeenCalledWith('admin@exemple-ambassade.test', 'motdepasse')
  })

  it('redirige vers le dashboard apres une connexion reussie', async () => {
    const routeur = creerRouteur()
    const wrapper = await monter(routeur)
    vi.spyOn(useAuthStore(), 'login').mockResolvedValue(true)

    await wrapper.find('form').trigger('submit')
    await flushPromises()

    expect(routeur.currentRoute.value.path).toBe('/dashboard')
  })

  it('redirige vers la route initialement demandee', async () => {
    const routeur = creerRouteur()
    routeur.push('/connexion?redirect=/dashboard/articles')
    await routeur.isReady()
    const wrapper = mount(Connexion, { global: { plugins: [routeur] } })
    vi.spyOn(useAuthStore(), 'login').mockResolvedValue(true)

    await wrapper.find('form').trigger('submit')
    await flushPromises()

    expect(routeur.currentRoute.value.path).toBe('/dashboard/articles')
  })

  it("affiche le message d erreur du store et ne navigue pas", async () => {
    const routeur = creerRouteur()
    const wrapper = await monter(routeur)
    const auth = useAuthStore()
    vi.spyOn(auth, 'login').mockImplementation(async () => {
      auth.erreur = 'Identifiants invalides.'
      return false
    })

    await wrapper.find('form').trigger('submit')
    await flushPromises()

    expect(wrapper.text()).toContain('Identifiants invalides.')
    expect(routeur.currentRoute.value.path).toBe('/connexion')
  })

  it('desactive le bouton de soumission pendant la requete', async () => {
    const routeur = creerRouteur()
    const wrapper = await monter(routeur)
    const auth = useAuthStore()
    auth.chargement = true
    await wrapper.vm.$nextTick()

    expect(wrapper.find('button[type="submit"]').attributes('disabled')).toBeDefined()
  })
})
```

- [ ] **Step 2 : lancer le test pour verifier qu'il echoue**

Run: `npx vitest run src/views/__tests__/Connexion.spec.ts`
Expected: FAIL — le premier test echoue sur la presence de « Secure Check », et `wrapper.find('form').trigger('submit')` ne declenche aucune connexion.

- [ ] **Step 3 : reecrire la page**

Fichier `src/views/Connexion.vue` (contenu complet, remplace integralement l'existant) :

```vue
<template>
  <div class="min-h-screen flex flex-col md:flex-row">
    <!-- Formulaire -->
    <div class="flex w-full md:w-1/2 items-center justify-center bg-white order-2 md:order-1">
      <div class="p-8 w-full max-w-md">
        <div class="mb-6">
          <router-link
            to="/"
            class="inline-flex items-center gap-2 text-ink hover:text-primary transition-colors"
          >
            <i class="bx bx-arrow-back text-lg"></i>
            <span class="text-sm font-medium">Retour a l'accueil</span>
          </router-link>
        </div>

        <div class="flex flex-col items-center mb-8">
          <img v-if="logo" :src="logo" :alt="`Armoiries de ${nomCourt}`" class="w-40 h-auto mb-4" />
          <h1 class="text-2xl font-bold text-primary text-center">Espace administration</h1>
          <p class="text-sm text-gray-600 mt-1 text-center">
            Connectez-vous pour gerer le contenu du site.
          </p>
        </div>

        <form class="space-y-5" @submit.prevent="soumettre">
          <div
            v-if="auth.erreur"
            role="alert"
            class="rounded-lg border border-accent bg-accent/10 px-4 py-3 text-sm text-accent-dark"
          >
            {{ auth.erreur }}
          </div>

          <div>
            <label for="email" class="block text-sm font-medium text-gray-700 mb-1">
              Adresse electronique
            </label>
            <input
              id="email"
              v-model="email"
              type="email"
              autocomplete="username"
              required
              class="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary focus:border-primary focus:outline-none"
            />
          </div>

          <div>
            <label for="mot-de-passe" class="block text-sm font-medium text-gray-700 mb-1">
              Mot de passe
            </label>
            <div class="relative">
              <input
                id="mot-de-passe"
                v-model="password"
                :type="motDePasseVisible ? 'text' : 'password'"
                autocomplete="current-password"
                required
                class="w-full px-4 py-2 pr-10 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary focus:border-primary focus:outline-none"
              />
              <button
                type="button"
                :aria-label="motDePasseVisible ? 'Masquer le mot de passe' : 'Afficher le mot de passe'"
                class="absolute inset-y-0 right-0 flex items-center pr-3 text-gray-500 hover:text-primary"
                @click="motDePasseVisible = !motDePasseVisible"
              >
                <i :class="motDePasseVisible ? 'bx bx-hide' : 'bx bx-show'" class="text-lg"></i>
              </button>
            </div>
          </div>

          <button
            type="submit"
            :disabled="auth.chargement"
            class="w-full bg-primary hover:bg-primary-dark disabled:opacity-60 disabled:cursor-not-allowed text-white py-2.5 rounded-full font-semibold transition-colors"
          >
            {{ auth.chargement ? 'Connexion en cours...' : 'Se connecter' }}
          </button>
        </form>

        <p class="text-center text-gray-500 text-xs mt-8 leading-relaxed">
          Acces reserve aux personnels habilites de l'ambassade.
        </p>
      </div>
    </div>

    <!-- Illustration -->
    <div class="hidden md:flex md:w-1/2 relative overflow-hidden order-1 md:order-2 bg-primary/10">
      <img :src="illustration" alt="" aria-hidden="true" class="w-full h-full object-cover" />
      <div class="absolute inset-0 bg-primary/30"></div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, computed } from 'vue'
import { useRouter, useRoute } from 'vue-router'
import { useAuthStore } from '@/stores/auth'
import { useTenantStore } from '@/stores/tenant'
import illustration from '@/assets/images/hero3.jpg'
import logoParDefaut from '@/assets/images/logo.png'

const router = useRouter()
const route = useRoute()
const auth = useAuthStore()
const tenant = useTenantStore()

const email = ref('')
const password = ref('')
const motDePasseVisible = ref(false)

// Le logo vient du tenant ; l image compilee sert de repli si le bootstrap a echoue.
const logo = computed(() => tenant.embassy?.logo_image || logoParDefaut)
const nomCourt = computed(() => tenant.nomCourt || "l'ambassade")

async function soumettre(): Promise<void> {
  const reussi = await auth.login(email.value, password.value)
  if (!reussi) return

  const destination = route.query.redirect
  await router.push(typeof destination === 'string' ? destination : '/dashboard')
}
</script>
```

- [ ] **Step 4 : lancer le test pour verifier qu'il passe**

Run: `npx vitest run src/views/__tests__/Connexion.spec.ts`
Expected: PASS — 6 tests reussis.

- [ ] **Step 5 : verifier qu'aucun texte recycle ne subsiste ailleurs**

Run: `grep -rniE "securecheck|secure check|maposte" src --include=*.vue --include=*.ts`
Expected: la commande peut encore remonter des ecrans du groupe Ambassade Secure (`Scanner.vue`, `Carte.vue`, `Presence.vue`...). C'est attendu : ces ecrans sont hors perimetre de la Phase 1 (spec, section 4.7). Verifier uniquement qu'**aucune occurrence ne provient de `src/views/Connexion.vue`**.

- [ ] **Step 6 : verifier la connexion dans le navigateur**

Run: `npm run dev`, ouvrir `http://localhost:5173/connexion`.
Expected :
- avec `admin@exemple-ambassade.test` / `mauvais`, le bandeau rouge « Identifiants invalides. » s'affiche et l'URL reste `/connexion` ;
- avec `admin@exemple-ambassade.test` / `motdepasse`, la page redirige vers `/dashboard` ;
- apres un rechargement de page, l'onglet Application des outils de developpement montre `cms_token` en stockage local.
Arreter avec Ctrl-C.

- [ ] **Step 7 : verifier la suite complete**

Run: `npm run type-check && npx vitest run`
Expected: PASS.

- [ ] **Step 8 : commit**

```bash
git add src/views/Connexion.vue src/views/__tests__/Connexion.spec.ts
git commit -m "feat(auth): reecrire la page de connexion avec une authentification reelle"
```

---

## Tâche 9 : garde de route sur le dashboard

`/dashboard/*` est aujourd'hui accessible sans aucune authentification. On ajoute un garde global qui redirige vers `/connexion` en conservant la destination demandee, et qui evite qu'un administrateur deja connecte reste sur la page de connexion.

**Files:**
- Modify: `src/router/index.ts`
- Test: `src/router/__tests__/garde.spec.ts`

**Interfaces:**
- Consomme : `useAuthStore` (Tâche 7), la gestion du query `redirect` par `Connexion.vue` (Tâche 8).
- Produit : toute route dont le chemin commence par `/dashboard` exige `estAuthentifie`.

- [ ] **Step 1 : ecrire le test en echec**

Fichier `src/router/__tests__/garde.spec.ts` (contenu complet) :

```ts
import { describe, it, expect, beforeEach } from 'vitest'
import { createPinia, setActivePinia } from 'pinia'
import router from '../index'
import { useAuthStore } from '@/stores/auth'

describe('garde du dashboard', () => {
  beforeEach(async () => {
    setActivePinia(createPinia())
    localStorage.clear()
    await router.replace('/')
    await router.isReady()
  })

  it('redirige un visiteur non authentifie vers la connexion', async () => {
    await router.push('/dashboard')

    expect(router.currentRoute.value.path).toBe('/connexion')
  })

  it('conserve la destination demandee dans le query redirect', async () => {
    await router.push('/dashboard/articles')

    expect(router.currentRoute.value.path).toBe('/connexion')
    expect(router.currentRoute.value.query.redirect).toBe('/dashboard/articles')
  })

  it('laisse passer un administrateur authentifie', async () => {
    useAuthStore().token = 'jeton-valide'

    await router.push('/dashboard/articles')

    expect(router.currentRoute.value.path).toBe('/dashboard/articles')
  })

  it("n'entrave pas l'acces aux pages publiques", async () => {
    await router.push('/presentation')

    expect(router.currentRoute.value.path).toBe('/presentation')
  })

  it('renvoie un administrateur deja connecte vers le dashboard', async () => {
    useAuthStore().token = 'jeton-valide'

    await router.push('/connexion')

    expect(router.currentRoute.value.path).toBe('/dashboard')
  })
})
```

- [ ] **Step 2 : lancer le test pour verifier qu'il echoue**

Run: `npx vitest run src/router`
Expected: FAIL — le premier test constate `/dashboard` au lieu de `/connexion`.

- [ ] **Step 3 : ajouter le garde**

Dans `src/router/index.ts`, ajouter l'import en haut du fichier :

```ts
import { useAuthStore } from '@/stores/auth'
```

puis, **entre** la fin de `const router = createRouter({...})` et la ligne `export default router`, inserer :

```ts
/**
 * Garde d acces au back-office.
 * Le dashboard etait jusqu ici entierement ouvert : toute route sous
 * /dashboard exige desormais une session. La destination demandee est
 * conservee pour y revenir apres la connexion.
 */
router.beforeEach((destination) => {
  const auth = useAuthStore()
  const versDashboard = destination.path.startsWith('/dashboard')

  if (versDashboard && !auth.estAuthentifie) {
    return { path: '/connexion', query: { redirect: destination.fullPath } }
  }

  if (destination.path === '/connexion' && auth.estAuthentifie) {
    return { path: '/dashboard' }
  }

  return true
})
```

Note pour l'implementeur : `useAuthStore()` est appele **dans** le garde, pas au niveau du module. Appele a l'import, Pinia ne serait pas encore installe et l'application planterait au demarrage.

- [ ] **Step 4 : lancer le test pour verifier qu'il passe**

Run: `npx vitest run src/router`
Expected: PASS — 5 tests reussis.

- [ ] **Step 5 : verifier le comportement dans le navigateur**

Run: `npm run dev`, puis :
- ouvrir `http://localhost:5173/dashboard/articles` en navigation privee → redirection vers `/connexion?redirect=/dashboard/articles` ;
- se connecter avec `admin@exemple-ambassade.test` / `motdepasse` → arrivee sur `/dashboard/articles` ;
- recharger la page → on reste sur le dashboard (session restauree depuis le stockage local).
Arreter avec Ctrl-C.

- [ ] **Step 6 : verifier la suite complete**

Run: `npm run type-check && npx vitest run`
Expected: PASS.

- [ ] **Step 7 : commit**

```bash
git add src/router/index.ts src/router/__tests__/garde.spec.ts
git commit -m "feat(auth): proteger les routes du dashboard par un garde d'authentification"
```

---

## Tâche 10 : service Articles et cablage de l'ecran Articles

L'ecran `dashboard/Articles.vue` est complet visuellement mais fonctionne sur un `ref([])` et un `saveArticle()` qui se contente de manipuler le tableau local. On introduit un service API et on branche l'ecran dessus, en preservant integralement l'interface existante (filtres, tri, pagination, modales).

Point d'attention : l'ecran manipule aujourd'hui des statuts en francais capitalise (`'Brouillon'`, `'Publié'`) alors que l'API utilise `brouillon | a_valider | publie` (spec 4.2). Le service assure la traduction dans les deux sens, ce qui evite de reecrire tous les gabarits.

**Files:**
- Create: `src/api/articles.ts`
- Modify: `src/views/dashboard/Articles.vue` (bloc `<script setup>` uniquement)
- Test: `src/api/__tests__/articles.spec.ts`

**Interfaces:**
- Consomme : `apiGet`, `apiPost`, `apiPut`, `apiDelete` (Tâche 4).
- Produit :
  - `export type StatutArticle = 'brouillon' | 'a_valider' | 'publie'`
  - `export interface Categorie { id: number; nom: string; slug: string; couleur: string }`
  - `export interface Article { id: number; slug: string; titre: string; resume: string; contenu: string; image: string; categorie: Categorie; date_publication: string; statut: StatutArticle; vues: number; likes: number; locale: string; source: string; temps_lecture: number }`
  - `export interface BrouillonArticle { titre: string; resume: string; contenu: string; categorie_slug: string; statut: StatutArticle; date_publication: string; image?: string }`
  - `export function listerArticles(): Promise<Article[]>`
  - `export function recupererArticleParSlug(slug: string): Promise<Article>`
  - `export function creerArticle(brouillon: BrouillonArticle): Promise<Article>`
  - `export function modifierArticle(id: number, brouillon: BrouillonArticle): Promise<Article>`
  - `export function supprimerArticle(id: number): Promise<void>`
  - `export function libelleStatut(statut: StatutArticle): string` et `export function statutDepuisLibelle(libelle: string): StatutArticle`

- [ ] **Step 1 : ecrire le test en echec**

Fichier `src/api/__tests__/articles.spec.ts` (contenu complet) :

```ts
import { describe, it, expect, beforeEach, vi, afterEach } from 'vitest'
import {
  listerArticles,
  recupererArticleParSlug,
  creerArticle,
  modifierArticle,
  supprimerArticle,
  libelleStatut,
  statutDepuisLibelle,
  type BrouillonArticle,
} from '../articles'
import articlesFixture from '../fixtures/articles.json'

function reponse(corps: unknown, statut = 200) {
  return new Response(corps === null ? null : JSON.stringify(corps), {
    status: statut,
    headers: { 'Content-Type': 'application/json' },
  })
}

const BROUILLON: BrouillonArticle = {
  titre: 'Nouvel article',
  resume: 'Un resume.',
  contenu: '<p>Du contenu.</p>',
  categorie_slug: 'actualites-ambassade',
  statut: 'brouillon',
  date_publication: '2026-09-09',
}

describe('service Articles', () => {
  beforeEach(() => {
    vi.stubGlobal('fetch', vi.fn())
  })

  afterEach(() => {
    vi.unstubAllGlobals()
  })

  it('liste les articles depuis GET /api/articles', async () => {
    vi.mocked(fetch).mockResolvedValue(reponse(articlesFixture))

    const articles = await listerArticles()

    expect(vi.mocked(fetch).mock.calls[0]![0]).toBe('/api/articles')
    expect(articles).toHaveLength(3)
    expect(articles[0]!.slug).toBe('rencontre-bilaterale-a-washington')
    expect(articles[0]!.statut).toBe('publie')
  })

  it('recupere un article par son slug', async () => {
    vi.mocked(fetch).mockResolvedValue(reponse({ data: articlesFixture.data[0]! }))

    const article = await recupererArticleParSlug('rencontre-bilaterale-a-washington')

    expect(vi.mocked(fetch).mock.calls[0]![0]).toBe('/api/articles/rencontre-bilaterale-a-washington')
    expect(article.titre).toBe('Rencontre bilaterale a Washington')
  })

  it('cree un article par POST', async () => {
    vi.mocked(fetch).mockResolvedValue(reponse({ data: { ...articlesFixture.data[0]!, id: 42 } }, 201))

    const article = await creerArticle(BROUILLON)

    const [url, options] = vi.mocked(fetch).mock.calls[0]!
    expect(url).toBe('/api/articles')
    expect((options as RequestInit).method).toBe('POST')
    expect(JSON.parse((options as RequestInit).body as string).titre).toBe('Nouvel article')
    expect(article.id).toBe(42)
  })

  it('modifie un article par PUT', async () => {
    vi.mocked(fetch).mockResolvedValue(reponse({ data: articlesFixture.data[0]! }))

    await modifierArticle(1, BROUILLON)

    const [url, options] = vi.mocked(fetch).mock.calls[0]!
    expect(url).toBe('/api/articles/1')
    expect((options as RequestInit).method).toBe('PUT')
  })

  it('supprime un article par DELETE', async () => {
    vi.mocked(fetch).mockResolvedValue(new Response(null, { status: 204 }))

    await supprimerArticle(7)

    const [url, options] = vi.mocked(fetch).mock.calls[0]!
    expect(url).toBe('/api/articles/7')
    expect((options as RequestInit).method).toBe('DELETE')
  })

  it('traduit les statuts entre l API et l interface', () => {
    expect(libelleStatut('publie')).toBe('Publie')
    expect(libelleStatut('a_valider')).toBe('A valider')
    expect(libelleStatut('brouillon')).toBe('Brouillon')
    expect(statutDepuisLibelle('Publie')).toBe('publie')
    expect(statutDepuisLibelle('A valider')).toBe('a_valider')
    expect(statutDepuisLibelle('Brouillon')).toBe('brouillon')
    expect(statutDepuisLibelle('valeur inattendue')).toBe('brouillon')
  })
})
```

- [ ] **Step 2 : lancer le test pour verifier qu'il echoue**

Run: `npx vitest run src/api/__tests__/articles.spec.ts`
Expected: FAIL — `Failed to resolve import "../articles"`.

- [ ] **Step 3 : implementer le service**

Fichier `src/api/articles.ts` (contenu complet) :

```ts
import { apiGet, apiPost, apiPut, apiDelete } from './client'

/** Statuts de moderation d un article (spec 4.2). */
export type StatutArticle = 'brouillon' | 'a_valider' | 'publie'

/** Taxonomie geree en base, en remplacement des listes en dur (spec 4.2). */
export interface Categorie {
  id: number
  nom: string
  slug: string
  couleur: string
}

export interface Article {
  id: number
  slug: string
  titre: string
  resume: string
  contenu: string
  image: string
  categorie: Categorie
  date_publication: string
  statut: StatutArticle
  vues: number
  likes: number
  locale: string
  source: string
  /** Derive du nombre de mots cote serveur : jamais calcule ici. */
  temps_lecture: number
}

/** Charge utile d ecriture : sous-ensemble modifiable depuis le back-office. */
export interface BrouillonArticle {
  titre: string
  resume: string
  contenu: string
  categorie_slug: string
  statut: StatutArticle
  date_publication: string
  image?: string
}

interface Enveloppe<T> {
  data: T
}

const LIBELLES: Record<StatutArticle, string> = {
  brouillon: 'Brouillon',
  a_valider: 'A valider',
  publie: 'Publie',
}

/** Libelle affichable d un statut. */
export function libelleStatut(statut: StatutArticle): string {
  return LIBELLES[statut] ?? LIBELLES.brouillon
}

/**
 * Statut d API correspondant a un libelle d interface.
 * Repli sur `brouillon` : en cas de valeur inattendue, mieux vaut ne rien
 * publier que publier par accident.
 */
export function statutDepuisLibelle(libelle: string): StatutArticle {
  const trouve = (Object.keys(LIBELLES) as StatutArticle[]).find(
    (statut) => LIBELLES[statut] === libelle,
  )
  return trouve ?? 'brouillon'
}

export async function listerArticles(): Promise<Article[]> {
  const reponse = await apiGet<Enveloppe<Article[]>>('/api/articles')
  return reponse.data
}

export async function recupererArticleParSlug(slug: string): Promise<Article> {
  const reponse = await apiGet<Enveloppe<Article>>(`/api/articles/${encodeURIComponent(slug)}`)
  return reponse.data
}

export async function creerArticle(brouillon: BrouillonArticle): Promise<Article> {
  const reponse = await apiPost<Enveloppe<Article>>('/api/articles', brouillon)
  return reponse.data
}

export async function modifierArticle(id: number, brouillon: BrouillonArticle): Promise<Article> {
  const reponse = await apiPut<Enveloppe<Article>>(`/api/articles/${id}`, brouillon)
  return reponse.data
}

export function supprimerArticle(id: number): Promise<void> {
  return apiDelete(`/api/articles/${id}`)
}
```

- [ ] **Step 4 : lancer le test pour verifier qu'il passe**

Run: `npx vitest run src/api/__tests__/articles.spec.ts`
Expected: PASS — 6 tests reussis.

- [ ] **Step 5 : brancher l'ecran Articles sur le service**

Dans `src/views/dashboard/Articles.vue`, modifier **uniquement le bloc `<script setup>`**, sans toucher au `<template>`.

Remplacer les trois imports d'images en haut du script (`partenariatImage`, `infrastructureImage`, `ambassadeurImage`) — inutilises depuis que les articles viennent de l'API — par :

```js
import {
  listerArticles,
  creerArticle,
  modifierArticle,
  supprimerArticle,
  libelleStatut,
  statutDepuisLibelle,
} from '@/api/articles'
```

Ajouter, a cote de `const articles = ref([])` :

```js
const chargement = ref(false)
const erreurApi = ref(null)
```

Ajouter le chargement initial (le fichier importe deja `onMounted`) :

```js
/**
 * L API renvoie categorie sous forme d objet et statut en valeur technique.
 * Le gabarit existant attend des chaines plates : on adapte ici plutot que de
 * reecrire toute la vue.
 */
const versVue = (article) => ({
  ...article,
  categorie: article.categorie?.slug ?? '',
  statut: libelleStatut(article.statut),
  date: article.date_publication,
})

const chargerArticles = async () => {
  chargement.value = true
  erreurApi.value = null
  try {
    articles.value = (await listerArticles()).map(versVue)
  } catch (souleve) {
    erreurApi.value = "Impossible de charger les articles."
    console.error('Echec du chargement des articles :', souleve)
  } finally {
    chargement.value = false
  }
}

onMounted(chargerArticles)
```

Remplacer integralement la fonction `saveArticle` par :

```js
const saveArticle = async () => {
  const brouillon = {
    titre: formArticle.value.titre,
    resume: formArticle.value.resume,
    contenu: formArticle.value.contenu,
    categorie_slug: formArticle.value.categorie,
    statut: statutDepuisLibelle(formArticle.value.statut),
    date_publication: formArticle.value.date,
    image: formArticle.value.imagePreview || undefined,
  }

  try {
    if (modalMode.value === 'add') {
      await creerArticle(brouillon)
    } else {
      await modifierArticle(editId.value, brouillon)
    }
    closeModal()
    await chargerArticles()
  } catch (souleve) {
    erreurApi.value = "Enregistrement impossible. Verifiez les champs et reessayez."
    console.error("Echec de l enregistrement de l article :", souleve)
  }
}
```

Remplacer integralement la fonction `deleteArticle` par :

```js
const deleteArticle = async (id) => {
  if (!confirm('Etes-vous sur de vouloir supprimer cet article ?')) return

  try {
    await supprimerArticle(id)
    await chargerArticles()
  } catch (souleve) {
    erreurApi.value = 'Suppression impossible.'
    console.error("Echec de la suppression de l article :", souleve)
  }
}
```

Si `onMounted` contenait deja un appel peuplant `articles.value` avec des donnees en dur, le supprimer.

- [ ] **Step 6 : verifier qu'aucune donnee en dur ne subsiste dans l'ecran**

Run: `grep -n "assets/images" src/views/dashboard/Articles.vue`
Expected: aucune sortie.

- [ ] **Step 7 : verifier le cycle complet dans le navigateur**

Run: `npm run dev`, se connecter, ouvrir `/dashboard/articles`.
Expected :
- les trois articles de la fixture s'affichent ;
- « Ajouter un article » cree une quatrieme ligne apres enregistrement ;
- la modification d'un titre est visible apres fermeture de la modale ;
- la suppression retire la ligne ;
- l'onglet Reseau montre bien `GET /api/articles`, `POST /api/articles`, `PUT /api/articles/:id`, `DELETE /api/articles/:id`.
Arreter avec Ctrl-C.

- [ ] **Step 8 : verifier la suite complete**

Run: `npm run type-check && npx vitest run`
Expected: PASS.

- [ ] **Step 9 : commit**

```bash
git add src/api/articles.ts src/api/__tests__/articles.spec.ts src/views/dashboard/Articles.vue
git commit -m "feat(dashboard): brancher l'ecran Articles sur l'API CRUD"
```

---

## Tâche 11 : cablage de l'ecran Actualites

`dashboard/Actualites.vue` est le jumeau de `Articles.vue` : même structure, même `ref([])` vide, avec un champ `type` la ou Articles a `categorie`. On le branche sur le même service, sans creer de second service.

**Files:**
- Modify: `src/views/dashboard/Actualites.vue` (bloc `<script setup>` uniquement)

**Interfaces:**
- Consomme : le service `src/api/articles.ts` (Tâche 10), a l'identique. Aucune nouvelle interface produite.

- [ ] **Step 1 : constater l'etat initial**

Run: `grep -n "ref(\[\])\|assets/images\|actualites.value.unshift" src/views/dashboard/Actualites.vue`
Expected: le fichier declare `const actualites = ref([])`, importe cinq images et manipule le tableau localement dans `saveActualite`.

- [ ] **Step 2 : brancher l'ecran sur le service**

Dans `src/views/dashboard/Actualites.vue`, modifier **uniquement le bloc `<script setup>`**.

Remplacer les cinq imports d'images (`rencontreWashingtonImage`, `accordCostaRicaImage`, `feteNationaleImage`, `loiInvestissementImage`, `visitePresidentImage`) par :

```js
import {
  listerArticles,
  creerArticle,
  modifierArticle,
  supprimerArticle,
  libelleStatut,
  statutDepuisLibelle,
} from '@/api/articles'
```

Ajouter, a cote de `const actualites = ref([])` :

```js
const chargement = ref(false)
const erreurApi = ref(null)
```

Ajouter le chargement initial. Cet ecran nomme `type` ce que l'API appelle `categorie` : l'adaptation se fait ici.

```js
const versVue = (article) => ({
  ...article,
  type: article.categorie?.slug ?? '',
  statut: libelleStatut(article.statut),
  date: article.date_publication,
})

const chargerActualites = async () => {
  chargement.value = true
  erreurApi.value = null
  try {
    actualites.value = (await listerArticles()).map(versVue)
  } catch (souleve) {
    erreurApi.value = 'Impossible de charger les actualites.'
    console.error('Echec du chargement des actualites :', souleve)
  } finally {
    chargement.value = false
  }
}

onMounted(chargerActualites)
```

Remplacer integralement `saveActualite` par :

```js
const saveActualite = async () => {
  const brouillon = {
    titre: formActualite.value.titre,
    resume: formActualite.value.resume,
    contenu: formActualite.value.contenu,
    categorie_slug: formActualite.value.type,
    statut: statutDepuisLibelle(formActualite.value.statut),
    date_publication: formActualite.value.date,
    image: formActualite.value.imagePreview || undefined,
  }

  try {
    if (modalMode.value === 'add') {
      await creerArticle(brouillon)
    } else {
      await modifierArticle(editId.value, brouillon)
    }
    closeModal()
    await chargerActualites()
  } catch (souleve) {
    erreurApi.value = "Enregistrement impossible. Verifiez les champs et reessayez."
    console.error("Echec de l enregistrement de l actualite :", souleve)
  }
}
```

Remplacer integralement `deleteActualite` par :

```js
const deleteActualite = async (id) => {
  if (!confirm('Etes-vous sur de vouloir supprimer cette actualite ?')) return

  try {
    await supprimerArticle(id)
    await chargerActualites()
  } catch (souleve) {
    erreurApi.value = 'Suppression impossible.'
    console.error("Echec de la suppression de l actualite :", souleve)
  }
}
```

Note pour l'implementeur : le nom exact de la fonction de suppression peut differer dans ce fichier (`deleteActualite`, `supprimerActualite`...). Reperer la fonction appelee par le bouton de suppression dans le `<template>` et conserver **son** nom ; ne pas renommer, le gabarit n'est pas modifie.

- [ ] **Step 3 : verifier qu'aucune donnee en dur ne subsiste**

Run: `grep -n "assets/images" src/views/dashboard/Actualites.vue`
Expected: aucune sortie.

- [ ] **Step 4 : verifier dans le navigateur**

Run: `npm run dev`, se connecter, ouvrir `/dashboard/actualites`.
Expected: les trois articles de la fixture s'affichent, la creation, la modification et la suppression fonctionnent, et l'onglet Reseau montre les appels `/api/articles`. Arreter avec Ctrl-C.

- [ ] **Step 5 : verifier la suite complete**

Run: `npm run type-check && npx vitest run`
Expected: PASS.

- [ ] **Step 6 : commit**

```bash
git add src/views/dashboard/Actualites.vue
git commit -m "feat(dashboard): brancher l'ecran Actualites sur l'API CRUD"
```

---

## Tâche 12 : route publique de detail d'une actualite

`Home.vue` et `Actualite.vue` pointent vers `/actualites/:id` en six endroits, mais cette route n'existe pas dans le routeur : tous ces liens menent a une page blanche. On ajoute la route et sa vue, adressee par **slug** (spec 4.2 : `slug` stable, unique par ambassade — un identifiant numerique dans une URL publique est instable et mauvais pour le referencement).

**Files:**
- Create: `src/views/ActualiteDetail.vue`
- Modify: `src/router/index.ts`
- Modify: `src/views/Home.vue` (6 liens), `src/views/Actualite.vue` (3 liens)
- Test: `src/views/__tests__/ActualiteDetail.spec.ts`

**Interfaces:**
- Consomme : `recupererArticleParSlug`, `type Article` (Tâche 10).
- Produit : la route nommee `actualite-detail`, de chemin `/actualites/:slug`.

- [ ] **Step 1 : ecrire le test en echec**

Fichier `src/views/__tests__/ActualiteDetail.spec.ts` (contenu complet) :

```ts
import { describe, it, expect, beforeEach, vi, afterEach } from 'vitest'
import { mount, flushPromises } from '@vue/test-utils'
import { createRouter, createMemoryHistory } from 'vue-router'
import { defineComponent, h } from 'vue'
import ActualiteDetail from '../ActualiteDetail.vue'
import articlesFixture from '@/api/fixtures/articles.json'

const Vide = defineComponent({ render: () => h('div') })

function reponse(corps: unknown, statut = 200) {
  return new Response(JSON.stringify(corps), {
    status: statut,
    headers: { 'Content-Type': 'application/json' },
  })
}

async function monter(slug: string) {
  const routeur = createRouter({
    history: createMemoryHistory(),
    routes: [
      { path: '/', component: Vide },
      { path: '/actualites/:slug', component: ActualiteDetail },
    ],
  })
  routeur.push(`/actualites/${slug}`)
  await routeur.isReady()
  const wrapper = mount(ActualiteDetail, { global: { plugins: [routeur] } })
  await flushPromises()
  return wrapper
}

describe("page de detail d'une actualite", () => {
  beforeEach(() => {
    vi.stubGlobal('fetch', vi.fn())
  })

  afterEach(() => {
    vi.unstubAllGlobals()
  })

  it("recupere l article correspondant au slug de l URL", async () => {
    vi.mocked(fetch).mockResolvedValue(reponse({ data: articlesFixture.data[0]! }))

    await monter('rencontre-bilaterale-a-washington')

    expect(vi.mocked(fetch).mock.calls[0]![0]).toBe(
      '/api/articles/rencontre-bilaterale-a-washington',
    )
  })

  it("affiche le titre et le contenu de l article", async () => {
    vi.mocked(fetch).mockResolvedValue(reponse({ data: articlesFixture.data[0]! }))

    const wrapper = await monter('rencontre-bilaterale-a-washington')

    expect(wrapper.text()).toContain('Rencontre bilaterale a Washington')
    expect(wrapper.html()).toContain('Une rencontre de travail s est tenue a Washington.')
  })

  it("affiche un message clair quand l article n existe pas", async () => {
    vi.mocked(fetch).mockResolvedValue(reponse({ message: 'Introuvable.' }, 404))

    const wrapper = await monter('slug-inexistant')

    expect(wrapper.text()).toContain('Cette actualite est introuvable')
  })
})
```

- [ ] **Step 2 : lancer le test pour verifier qu'il echoue**

Run: `npx vitest run src/views/__tests__/ActualiteDetail.spec.ts`
Expected: FAIL — `Failed to resolve import "../ActualiteDetail.vue"`.

- [ ] **Step 3 : creer la vue de detail**

Fichier `src/views/ActualiteDetail.vue` (contenu complet) :

```vue
<template>
  <article class="max-w-3xl mx-auto px-4 py-12">
    <p v-if="chargement" class="text-center text-gray-500 py-16">Chargement de l'actualite...</p>

    <div v-else-if="introuvable" class="text-center py-16">
      <h1 class="text-2xl font-bold text-ink mb-3">Cette actualite est introuvable</h1>
      <p class="text-gray-600 mb-6">
        Elle a peut-etre ete retiree, ou le lien que vous avez suivi est incorrect.
      </p>
      <router-link
        to="/actualite"
        class="inline-block bg-primary hover:bg-primary-dark text-white px-6 py-2.5 rounded-full font-semibold transition-colors"
      >
        Voir toutes les actualites
      </router-link>
    </div>

    <template v-else-if="article">
      <router-link
        to="/actualite"
        class="inline-flex items-center gap-2 text-primary hover:text-primary-dark mb-6 text-sm font-medium"
      >
        <i class="bx bx-arrow-back"></i>
        Retour aux actualites
      </router-link>

      <p class="text-sm font-semibold text-accent uppercase tracking-wide mb-2">
        {{ article.categorie?.nom }}
      </p>

      <h1 class="text-3xl md:text-4xl font-bold text-ink-dark leading-tight mb-4">
        {{ article.titre }}
      </h1>

      <p class="text-sm text-gray-500 mb-8">
        Publie le {{ dateLisible }} &middot; {{ article.temps_lecture }} min de lecture
      </p>

      <img
        v-if="article.image"
        :src="article.image"
        :alt="article.titre"
        class="w-full rounded-xl mb-8 object-cover"
      />

      <p class="text-lg text-gray-700 font-medium mb-6">{{ article.resume }}</p>

      <!-- Le contenu est du HTML rendu par le CMS (spec 4.2). -->
      <div class="prose max-w-none text-gray-800 leading-relaxed" v-html="article.contenu"></div>
    </template>
  </article>
</template>

<script setup lang="ts">
import { ref, computed, watch } from 'vue'
import { useRoute } from 'vue-router'
import { recupererArticleParSlug, type Article } from '@/api/articles'
import { ApiError } from '@/api/client'

const route = useRoute()

const article = ref<Article | null>(null)
const chargement = ref(true)
const introuvable = ref(false)

const dateLisible = computed(() => {
  if (!article.value?.date_publication) return ''
  return new Date(article.value.date_publication).toLocaleDateString('fr-FR', {
    day: 'numeric',
    month: 'long',
    year: 'numeric',
  })
})

async function charger(slug: string): Promise<void> {
  chargement.value = true
  introuvable.value = false
  article.value = null
  try {
    article.value = await recupererArticleParSlug(slug)
  } catch (souleve) {
    // Un 404 est un cas nominal (lien obsolete) ; toute autre erreur aussi
    // aboutit a l ecran « introuvable », faute de contenu a afficher.
    introuvable.value = true
    if (!(souleve instanceof ApiError) || souleve.statut !== 404) {
      console.error("Echec du chargement de l actualite :", souleve)
    }
  } finally {
    chargement.value = false
  }
}

// `immediate` couvre le premier rendu ; le watch gere la navigation d un
// article a un autre, ou le composant est reutilise sans etre remonte.
watch(() => route.params.slug, (slug) => charger(String(slug)), { immediate: true })
</script>
```

- [ ] **Step 4 : lancer le test pour verifier qu'il passe**

Run: `npx vitest run src/views/__tests__/ActualiteDetail.spec.ts`
Expected: PASS — 3 tests reussis.

- [ ] **Step 5 : declarer la route**

Dans `src/router/index.ts`, ajouter l'import a cote des autres imports d'actualites :

```ts
import ActualiteDetail from '@/views/ActualiteDetail.vue'
```

puis, dans le tableau `children` du bloc `path: '/'` (site public), **juste apres** la ligne de la route `actualite` :

```ts
{ path: 'actualites/:slug', name: 'actualite-detail', component: ActualiteDetail },
```

- [ ] **Step 6 : corriger les liens qui pointaient vers un identifiant**

Les liens existants utilisent l'identifiant numerique ; la route attend un slug.

Dans `src/views/Home.vue`, les quatre liens en dur `to="/actualites/1"` … `to="/actualites/4"` referencent des articles en dur qui ne seront migres vers l'API que dans une phase ulterieure. Les faire pointer sur la liste plutot que sur un article inexistant :

Run: `sed -i '' -E 's|to="/actualites/[0-9]+"|to="/actualite"|g' src/views/Home.vue && grep -n 'to="/actualite' src/views/Home.vue`
Expected: quatre lignes, toutes en `to="/actualite"`.

Dans `src/views/Actualite.vue`, les trois liens utilisent une interpolation `${actualite.id}` sur des donnees encore en dur. Les faire pointer sur le slug si l'objet en possede un, et sur la liste sinon :

Run: `sed -i '' -E "s|/actualites/\\\$\{actualiteUne\.id\}|/actualites/\${actualiteUne.slug ?? ''}|g; s|/actualites/\\\$\{actualite\.id\}|/actualites/\${actualite.slug ?? ''}|g" src/views/Actualite.vue && grep -n '/actualites/' src/views/Actualite.vue`

Attention : les apostrophes du repli sont des guillemets **simples** (`?? ''`). Des guillemets doubles fermeraient prematurement l'attribut `:to="..."` du gabarit.
Expected: trois lignes, toutes en `slug`.

Note pour l'implementeur : ces liens resteront inertes tant que le contenu de la page d'accueil et de la liste d'actualites n'est pas migre vers l'API — migration hors perimetre de la Phase 1 (spec, section 4.5 : « contenus en dur migres progressivement »). L'objectif de cette etape est qu'aucun lien ne mene plus a une page blanche.

- [ ] **Step 7 : verifier dans le navigateur**

Run: `npm run dev`, ouvrir `http://localhost:5173/actualites/rencontre-bilaterale-a-washington`.
Expected: le titre, la date, le temps de lecture et le contenu de l'article s'affichent. Ouvrir ensuite `/actualites/slug-inexistant` : le message « Cette actualite est introuvable » s'affiche avec le lien de retour. Arreter avec Ctrl-C.

- [ ] **Step 8 : verifier la suite complete**

Run: `npm run type-check && npx vitest run`
Expected: PASS.

- [ ] **Step 9 : commit**

```bash
git add src/views/ActualiteDetail.vue src/views/__tests__/ActualiteDetail.spec.ts src/router/index.ts src/views/Home.vue src/views/Actualite.vue
git commit -m "feat(actualites): ajouter la route publique de detail /actualites/:slug"
```

---

## Tâche 13 : corriger les polices sur les caracteres accentues

**A executer juste apres la Tâche 1** (voir « Ordre d'execution »).

**Defaut constate le 2026-09-09 :** les caracteres accentues (`é`, `è`, `à`, `ç`...) s'affichaient
dans une police differente du reste du texte. Visible sur le titre de la page d'accueil :
« R**é**publique », « Guin**ée** pr**è**s », « Am**é**rique ».

**Cause etablie**, et non supposee : les sept fichiers `src/assets/fonts/FuturaCyrillic*.woff`
etaient des sous-ensembles **cyrillique + ASCII**. Verification faite avec fontTools sur
`FuturaCyrillicBook.woff` : 416 glyphes, dont 175 cyrilliques, 95 latins de base, 20 signes de
ponctuation et divers symboles — et **zero caractere du bloc Latin-1 Supplement**, celui qui
contient toutes les lettres accentuees du francais. Le navigateur n'avait donc pas d'autre choix
que de retomber sur une police systeme pour chacun de ces caracteres. Aucun reglage CSS ne peut
compenser des glyphes absents du fichier : il fallait remplacer les fichiers.

**Etat au demarrage de la tâche.** Elsa a livre les fichiers de remplacement et supprime les
anciens. `src/assets/fonts/` contient desormais six fichiers **OpenType** :

| Fichier | Famille interne | Graisse | Accents francais |
|---|---|---|---|
| `FuturaLTProLight.otf` | Futura LT Pro Light | 300 | complets |
| `FuturaLTProBook.otf` | Futura LT Pro Book | 400 | complets |
| `FuturaLTProMedium.otf` | Futura LT Pro Medium | 500 | complets |
| `FuturaLTProBold.otf` | FuturaLTPro-Bold | 700 | complets |
| `FuturaLTProXBold.otf` | Futura LT Pro Extra Bold | 800 | complets |
| `FuturaLTProHeavy.otf` | Futura LT Pro Heavy | 900 | complets |

Couverture verifiee sur les six : `éèêëàâäçîïôöûùüÉÈÀÇ` tous presents, 386 glyphes chacun.

Trois consequences sur le plan initial, a respecter :

1. **La famille est `Futura LT Pro`, pas `Futura PT`.** Toutes les declarations CSS utilisent ce nom.
2. **Il n'y a pas de graisse Demi (600).** Les anciennes declarations en comportaient une. On declare
   les six graisses reellement fournies ; le navigateur choisira la 700 pour un `font-weight: 600`.
3. **Les fichiers sont en `.otf`.** Ce format n'a pas sa place dans un build web : environ 48 Ko par
   fichier contre environ 25 Ko en WOFF2, et il se met moins bien en cache. L'etape 6 les convertit en
   `.woff2` (format servi) **et** `.woff` (repli navigateur, et seul format que lit l'outil de
   verification), puis retire les `.otf` du depot.

**Point de licence signale a Elsa, non tranche.** Le champ `fsType` de ces fichiers vaut `4`
(« Preview & Print embedding ») et non `0` (« Installable »), avec une notice de licence Linotype.
Ce bit n'autorise pas de lui-meme la diffusion comme police web. Ne pas commiter cette tâche avant
qu'Elsa ait confirme que sa licence couvre l'usage webfont ; les etapes techniques peuvent etre
menees en attendant.

**Files:**
- Convert then delete: `src/assets/fonts/FuturaLTPro*.otf`
- Create: `src/assets/fonts/FuturaLTPro-{Light,Book,Medium,Bold,XBold,Heavy}.{woff2,woff}`
- Modify: `src/style.css` (declarations `@font-face` et regle `body`)
- Create: `scripts/font-coverage.mjs`
- Create: `scripts/font-coverage.d.ts`
- Create: `scripts/convert-fonts.mjs`
- Test: `src/__tests__/fonts-coverage.spec.ts`

**Interfaces:**
- Consomme : rien.
- Produit : `export function codePointsDeLaPolice(chemin: string): Set<number>`, declare pour
  TypeScript dans `scripts/font-coverage.d.ts`.

- [ ] **Step 1 : constater l'etat du repertoire**

Run: `ls src/assets/fonts/ && git status --short src/assets/fonts/`
Expected: six fichiers `.otf` non suivis, et sept suppressions `FuturaCyrillic*.woff`. Si le
repertoire ne correspond pas a cette description, s'arreter et le signaler plutot qu'improviser.

- [ ] **Step 2 : ecrire l'outil de verification de couverture**

Fichier `scripts/font-coverage.mjs` (contenu complet). Il lit la table `cmap` d'un fichier WOFF ou WOFF2 sans dependance externe.

```js
/**
 * Lecture de la couverture de caracteres d un fichier de police WOFF.
 *
 * Motivation : les polices « Futura Cyrillic » initialement livrees etaient des
 * sous-ensembles sans aucune lettre accentuee, ce qui faisait retomber tous les
 * accents francais sur une police systeme. Cet outil rend la regression
 * detectable par un test automatique.
 *
 * Usage direct : node scripts/font-coverage.mjs src/assets/fonts/FuturaPT-Book.woff2
 */
import { readFileSync } from 'node:fs'
import { inflateSync } from 'node:zlib'

/** Extrait les tables d un conteneur WOFF (signature wOFF). */
function tablesWoff(tampon) {
  const numTables = tampon.readUInt16BE(12)
  const tables = new Map()
  for (let i = 0; i < numTables; i += 1) {
    const base = 44 + i * 20
    const tag = tampon.toString('ascii', base, base + 4)
    const offset = tampon.readUInt32BE(base + 4)
    const compLength = tampon.readUInt32BE(base + 8)
    const origLength = tampon.readUInt32BE(base + 12)
    const brut = tampon.subarray(offset, offset + compLength)
    tables.set(tag, compLength < origLength ? inflateSync(brut) : brut)
  }
  return tables
}

/** Extrait les tables d une police sfnt non compressee (OTF/TTF). */
function tablesSfnt(tampon) {
  const numTables = tampon.readUInt16BE(4)
  const tables = new Map()
  for (let i = 0; i < numTables; i += 1) {
    const base = 12 + i * 16
    const tag = tampon.toString('ascii', base, base + 4)
    const offset = tampon.readUInt32BE(base + 8)
    const length = tampon.readUInt32BE(base + 12)
    tables.set(tag, tampon.subarray(offset, offset + length))
  }
  return tables
}

/** Sous-table cmap au format 4 : segments de plage. */
function codePointsFormat4(cmap, debut) {
  const segCount = cmap.readUInt16BE(debut + 6) / 2
  const finSegments = debut + 14
  const debutSegments = finSegments + segCount * 2 + 2

  const resultat = new Set()
  for (let i = 0; i < segCount; i += 1) {
    const fin = cmap.readUInt16BE(finSegments + i * 2)
    const commence = cmap.readUInt16BE(debutSegments + i * 2)
    if (commence === 0xffff) continue // segment sentinelle
    for (let cp = commence; cp <= fin; cp += 1) resultat.add(cp)
  }
  return resultat
}

/** Sous-table cmap au format 12 : groupes 32 bits. */
function codePointsFormat12(cmap, debut) {
  const nGroupes = cmap.readUInt32BE(debut + 12)
  const resultat = new Set()
  for (let i = 0; i < nGroupes; i += 1) {
    const base = debut + 16 + i * 12
    const commence = cmap.readUInt32BE(base)
    const fin = cmap.readUInt32BE(base + 4)
    for (let cp = commence; cp <= fin; cp += 1) resultat.add(cp)
  }
  return resultat
}

/** Retourne l ensemble des points de code couverts par la police. */
export function codePointsDeLaPolice(chemin) {
  const tampon = readFileSync(chemin)
  const signature = tampon.toString('ascii', 0, 4)

  if (signature === 'wOF2') {
    throw new Error(
      'WOFF2 non pris en charge par ce lecteur. Fournir aussi un .woff, ' +
        'ou convertir avec `npx wawoff2 decompress`.',
    )
  }

  const tables = signature === 'wOFF' ? tablesWoff(tampon) : tablesSfnt(tampon)
  const cmap = tables.get('cmap')
  if (!cmap) throw new Error(`Table cmap absente de ${chemin}`)

  const nTables = cmap.readUInt16BE(2)
  const resultat = new Set()
  for (let i = 0; i < nTables; i += 1) {
    const offset = cmap.readUInt32BE(4 + i * 8 + 4)
    const format = cmap.readUInt16BE(offset)
    if (format === 4) for (const cp of codePointsFormat4(cmap, offset)) resultat.add(cp)
    if (format === 12) for (const cp of codePointsFormat12(cmap, offset)) resultat.add(cp)
  }
  return resultat
}

// Execution directe en ligne de commande.
if (process.argv[1]?.endsWith('font-coverage.mjs')) {
  const chemin = process.argv[2]
  const cps = codePointsDeLaPolice(chemin)
  const accents = [...'éèêëàâäçîïôöûùü'].filter((c) => !cps.has(c.codePointAt(0)))
  console.log(`${chemin} : ${cps.size} glyphes`)
  console.log(`accents manquants : ${accents.join('') || 'aucun'}`)
}
```

Note pour l'implementeur : si les fichiers fournis sont en `.woff2`, le lecteur leve une erreur explicite. Deux issues possibles — livrer aussi un `.woff` (utile de toute facon comme repli navigateur), ou decompresser avec `npx wawoff2 decompress` avant analyse. Choisir la premiere.

- [ ] **Step 3 : declarer les types de l'outil**

Le test est en TypeScript et `vue-tsc` refuserait d'importer un module JavaScript sans declaration (`TS7016`).

Fichier `scripts/font-coverage.d.ts` (contenu complet) :

```ts
/** Points de code couverts par un fichier de police WOFF ou sfnt. */
export declare function codePointsDeLaPolice(chemin: string): Set<number>
```

- [ ] **Step 4 : ecrire le test de garde en echec**

Fichier `src/__tests__/fonts-coverage.spec.ts` (contenu complet) :

```ts
import { describe, it, expect } from 'vitest'
import { globSync } from 'node:fs'
import { fileURLToPath } from 'node:url'
import { join } from 'node:path'
import { codePointsDeLaPolice } from '../../scripts/font-coverage.mjs'

/**
 * Les polices initialement livrees etaient des sous-ensembles cyrilliques sans
 * aucune lettre accentuee : tous les accents francais retombaient sur une
 * police systeme. Ce test empeche la regression.
 */
const ACCENTS_FRANCAIS = 'éèêëàâäçîïôöûùüÉÈÀÇ'

const dossier = fileURLToPath(new URL('../assets/fonts', import.meta.url))

describe('polices', () => {
  it('couvrent tous les caracteres accentues du francais', () => {
    const fichiers = globSync('*.woff', { cwd: dossier })
    expect(fichiers.length).toBeGreaterThan(0)

    const manques: string[] = []
    for (const fichier of fichiers) {
      const couverts = codePointsDeLaPolice(join(dossier, fichier))
      const absents = [...ACCENTS_FRANCAIS].filter((c) => !couverts.has(c.codePointAt(0)!))
      if (absents.length > 0) manques.push(`${fichier} : ${absents.join('')}`)
    }

    expect(manques).toEqual([])
  })
})
```

- [ ] **Step 5 : lancer le test pour verifier qu'il echoue**

Avec les polices actuelles encore en place :

Run: `npx vitest run src/__tests__/fonts-coverage.spec.ts`
Expected: FAIL — chacun des sept fichiers est signale, par exemple `FuturaCyrillicBook.woff : éèêëàâäçîïôöûùüÉÈÀÇ`.

- [ ] **Step 6 : convertir les polices en WOFF2 et WOFF**

Ecrire `scripts/convert-fonts.mjs`, qui s'appuie sur fontTools (deja present sur le poste, il a
servi au diagnostic) :

```js
/**
 * Convertit les .otf livres en .woff2 (format servi) et .woff (repli navigateur,
 * et seul format lu par scripts/font-coverage.mjs).
 * Usage : node scripts/convert-fonts.mjs
 */
import { execFileSync } from 'node:child_process'
import { readdirSync } from 'node:fs'
import { join } from 'node:path'

const DOSSIER = 'src/assets/fonts'

const script = `
import sys
from fontTools.ttLib import TTFont
source = sys.argv[1]
for flavor in ('woff2', 'woff'):
    font = TTFont(source)
    font.flavor = flavor
    cible = source[:-4] + '.' + flavor
    font.save(cible)
    print('ecrit', cible)
`

for (const fichier of readdirSync(DOSSIER).filter((f) => f.endsWith('.otf'))) {
  execFileSync('python3', ['-c', script, join(DOSSIER, fichier)], { stdio: 'inherit' })
}
```

Run: `node scripts/convert-fonts.mjs`
Expected: douze lignes `ecrit ...` ; six `.woff2` et six `.woff` crees. Si la sortie mentionne
`brotli`, installer la dependance par `python3 -m pip install brotli` puis relancer.

- [ ] **Step 6b : normaliser les noms et retirer les sources OpenType**

Les fichiers livres sont nommes `FuturaLTProBook.otf`, tandis que les declarations CSS de l'etape
suivante attendent `FuturaLTPro-Book.woff2`. Renommer, puis supprimer les `.otf`.

```bash
cd src/assets/fonts
for graisse in Light Book Medium Bold XBold Heavy; do
  for ext in woff2 woff; do
    mv "FuturaLTPro${graisse}.${ext}" "FuturaLTPro-${graisse}.${ext}"
  done
done
rm FuturaLTPro*.otf
cd -
ls src/assets/fonts/
```

Expected: douze fichiers, tous de la forme `FuturaLTPro-<Graisse>.<woff2|woff>`, aucun `.otf`.

- [ ] **Step 6c : verifier la couverture des fichiers convertis**

La conversion pourrait theoriquement perdre des glyphes : on le verifie plutot que de le supposer.

Run: `for f in src/assets/fonts/*.woff; do node scripts/font-coverage.mjs "$f"; done`
Expected: pour chacun des six fichiers, `accents manquants : aucun`.

- [ ] **Step 7 : mettre a jour les declarations @font-face**

Dans `src/style.css`, remplacer integralement le bloc genere par font.download (les sept
`@font-face` `Futura PT *`, qui pointent tous vers des fichiers supprimes) par une **famille unique
a graisses**. Sept familles distinctes obligeaient chaque composant a nommer la bonne famille ; une
seule famille laisse `font-weight` faire son travail.

```css
@font-face {
  font-family: 'Futura LT Pro';
  font-style: normal;
  font-weight: 300;
  font-display: swap;
  src: url('./assets/fonts/FuturaLTPro-Light.woff2') format('woff2'),
       url('./assets/fonts/FuturaLTPro-Light.woff') format('woff');
}

@font-face {
  font-family: 'Futura LT Pro';
  font-style: normal;
  font-weight: 400;
  font-display: swap;
  src: url('./assets/fonts/FuturaLTPro-Book.woff2') format('woff2'),
       url('./assets/fonts/FuturaLTPro-Book.woff') format('woff');
}

@font-face {
  font-family: 'Futura LT Pro';
  font-style: normal;
  font-weight: 500;
  font-display: swap;
  src: url('./assets/fonts/FuturaLTPro-Medium.woff2') format('woff2'),
       url('./assets/fonts/FuturaLTPro-Medium.woff') format('woff');
}

@font-face {
  font-family: 'Futura LT Pro';
  font-style: normal;
  font-weight: 700;
  font-display: swap;
  src: url('./assets/fonts/FuturaLTPro-Bold.woff2') format('woff2'),
       url('./assets/fonts/FuturaLTPro-Bold.woff') format('woff');
}

@font-face {
  font-family: 'Futura LT Pro';
  font-style: normal;
  font-weight: 800;
  font-display: swap;
  src: url('./assets/fonts/FuturaLTPro-XBold.woff2') format('woff2'),
       url('./assets/fonts/FuturaLTPro-XBold.woff') format('woff');
}

@font-face {
  font-family: 'Futura LT Pro';
  font-style: normal;
  font-weight: 900;
  font-display: swap;
  src: url('./assets/fonts/FuturaLTPro-Heavy.woff2') format('woff2'),
       url('./assets/fonts/FuturaLTPro-Heavy.woff') format('woff');
}
```

Il n'y a pas de graisse 600 : le navigateur retiendra la 700 pour un `font-weight: 600`, ce qui est
le comportement voulu. Le `local()` des declarations d'origine n'est pas repris : il autorisait le
navigateur a preferer une police locale du meme nom, de couverture inconnue — exactement le genre
de substitution silencieuse a l'origine du defaut corrige ici.

Remplacer aussi la regle `body` en bas du fichier :

```css
body {
  font-family: 'Futura LT Pro', 'Segoe UI', system-ui, sans-serif;
}
```

- [ ] **Step 8 : verifier qu'aucune ancienne famille n'est encore referencee**

Run: `grep -rn "Futura PT\|FuturaCyrillic" src`
Expected: aucune sortie. Toute occurrence restante dans un composant designe une famille qui
n'existe plus : la remplacer par `'Futura LT Pro'` assortie du `font-weight` approprie.

- [ ] **Step 9 : lancer le test pour verifier qu'il passe**

Run: `npx vitest run src/__tests__/fonts-coverage.spec.ts`
Expected: PASS.

- [ ] **Step 10 : verifier le rendu dans le navigateur**

Run: `npm run dev`, ouvrir `http://localhost:5173/`.
Expected: dans le titre « Ambassade de la Republique de Guinee pres les Etats-Unis d'Amerique »,
les caracteres accentues ont exactement la meme graisse et le meme dessin que les autres lettres.
Comparer avec la capture d'origine du 2026-09-09. Verifier aussi une page du dashboard et une page
de services, ou les graisses different. Dans l'onglet Reseau, confirmer que ce sont les fichiers
`.woff2` qui sont telecharges, et non les `.woff`.

- [ ] **Step 11 : verifier la suite complete**

Run: `npm run type-check && npx vitest run`
Expected: PASS.

- [ ] **Step 12 : commit**

Prealable : ne commiter qu'apres confirmation par Elsa que la licence Linotype couvre l'usage
webfont (voir le preambule de la tâche).

```bash
git add src/assets/fonts src/style.css scripts/font-coverage.mjs scripts/font-coverage.d.ts \
        scripts/convert-fonts.mjs src/__tests__/fonts-coverage.spec.ts
git commit -m "fix(polices): remplacer les polices sans glyphes accentues et verifier la couverture"
```

---

## Verification de fin de phase

- [ ] **Suite complete verte**

Run: `npm run type-check && npm run lint && npx vitest run`
Expected: PASS, aucune erreur de lint.

- [ ] **Build de production**

Run: `npx vite build`
Expected: build en succes. Verifier ensuite que le simulateur d'API n'y figure pas :
Run: `grep -rl "jeton-de-developpement" dist || echo "absent du build"`
Expected: `absent du build`.

- [ ] **Aucun secret dans l'historique de la phase**

Run: `git log --oneline -20 -p | grep -inE "api[_-]?key|password *= *['\"]|secret|token *= *['\"][a-z0-9]{20,}"`
Expected: seules remontent les valeurs de developpement explicitement documentees (`jeton-de-developpement`, `motdepasse` dans `vite-plugins/mock-api.ts`). Aucun identifiant reel.

- [ ] **Aucun emoji dans les fichiers ecrits pendant la phase**

Run: `grep -rlP "[\x{1F300}-\x{1FAFF}\x{2600}-\x{27BF}]" src/api src/theme src/stores scripts vite-plugins src/views/Connexion.vue src/views/ActualiteDetail.vue`
Expected: aucune sortie.

- [ ] **Ne pas pousser**

Les commits restent locaux. Ne pousser sur `origin` (Elsa224) que sur demande explicite d'Elsa. **Jamais** sur `upstream` (Danielle074).

---

## Ce que cette phase ne fait pas

Rappel de perimetre, pour eviter les derives pendant l'execution :

- **Migration du reste du contenu en dur** (page d'accueil, galerie publique, responsables, consuls, services, calendrier, menu) — spec section 4.5, apres les articles.
- **Endpoint d'ingestion du scraper** (`POST /api/ingest/articles`) — cote back uniquement, section 4.4.
- **Pipeline medias S3** : l'envoi d'image du dashboard transmet aujourd'hui une URL de donnees (`imagePreview`). Le televersement reel vers S3 releve de la section 4.6 et du back.
- **Modules Ambassade Secure** (RDV, evenements, scanner, cartes, presence) — section 4.7. Les ecrans correspondants du dashboard restent des maquettes non branchees, et leur texte « SecureCheck » subsiste : c'est volontaire.
- **Pilotage des modules optionnels par `embassies.modules`** : le store tenant expose deja `moduleActif()`, mais le masquage effectif de la section « Relations bilaterales » et des entrees de menu n'est pas dans cette phase.
- **Multilingue** : le champ `locale` transite dans les types, sans selecteur de langue.
- **Roles fins** : le garde verifie l'existence d'une session, pas le role. La distinction `admin` / `super_admin` (section 4.3) viendra avec les ecrans transverses.
