# gouvernement-guinee

This template should help get you started developing with Vue 3 in Vite.

## Recommended IDE Setup

[VS Code](https://code.visualstudio.com/) + [Vue (Official)](https://marketplace.visualstudio.com/items?itemName=Vue.volar) (and disable Vetur).

## Recommended Browser Setup

- Chromium-based browsers (Chrome, Edge, Brave, etc.):
  - [Vue.js devtools](https://chromewebstore.google.com/detail/vuejs-devtools/nhdogjmejiglipccpnnnanhbledajbpd)
  - [Turn on Custom Object Formatter in Chrome DevTools](http://bit.ly/object-formatters)
- Firefox:
  - [Vue.js devtools](https://addons.mozilla.org/en-US/firefox/addon/vue-js-devtools/)
  - [Turn on Custom Object Formatter in Firefox DevTools](https://fxdx.dev/firefox-devtools-custom-object-formatters/)

## Type Support for `.vue` Imports in TS

TypeScript cannot handle type information for `.vue` imports by default, so we replace the `tsc` CLI with `vue-tsc` for type checking. In editors, we need [Volar](https://marketplace.visualstudio.com/items?itemName=Vue.volar) to make the TypeScript language service aware of `.vue` types.

## Customize configuration

See [Vite Configuration Reference](https://vite.dev/config/).

## Project Setup

```sh
npm install
```

### Compile and Hot-Reload for Development

```sh
npm run dev
```

#### Choisir l'ambassade en local

Un seul build sert tous les domaines : l'ambassade est resolue a partir du nom
d'hote de la page (`window.location.hostname`), qui est ensuite transmis a
l'API. En developpement, `localhost` ne designe aucune ambassade et le faux
serveur retombe donc sur l'ambassade de Guinee aux Etats-Unis, celle dont le
gabarit porte encore le contenu.

Pour ouvrir le site d'une autre ambassade, il suffit d'un sous-domaine de
`localhost` qui porte son nom — ils resolvent tous vers 127.0.0.1, et Vite les
accepte sans configuration :

| Adresse | Ambassade servie |
|---|---|
| `http://localhost:5173/` | Guinee aux Etats-Unis |
| `http://gabon.localhost:5173/` | Gabon en Guinee |

Le parametre `?domain=` de la barre d'adresse n'y change rien : il n'est lu que
par l'API, pas par le front. Le forcage explicite equivalent est l'en-tete
`X-Embassy-Domain`, que la vraie API accepte aussi mais qu'un navigateur ne
peut pas poser sur une navigation.

Le faux serveur `/api` est un greffon Vite : toute modification de
`vite-plugins/mock-api.ts` demande de relancer `npm run dev`, le rechargement a
chaud ne la prend pas.

### Type-Check, Compile and Minify for Production

```sh
npm run build
```

### Run Unit Tests with [Vitest](https://vitest.dev/)

```sh
npm run test:unit
```

### Run End-to-End Tests with [Playwright](https://playwright.dev)

```sh
# Install browsers for the first run
npx playwright install

# When testing on CI, must build the project first
npm run build

# Runs the end-to-end tests
npm run test:e2e
# Runs the tests only on Chromium
npm run test:e2e -- --project=chromium
# Runs the tests of a specific file
npm run test:e2e -- tests/example.spec.ts
# Runs the tests in debug mode
npm run test:e2e -- --debug
```

### Lint with [ESLint](https://eslint.org/)

```sh
npm run lint
```
