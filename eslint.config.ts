import { globalIgnores } from 'eslint/config'
import { defineConfigWithVueTs, vueTsConfigs } from '@vue/eslint-config-typescript'
import pluginVue from 'eslint-plugin-vue'
import pluginPlaywright from 'eslint-plugin-playwright'
import pluginVitest from '@vitest/eslint-plugin'
import pluginOxlint from 'eslint-plugin-oxlint'
import skipFormatting from 'eslint-config-prettier/flat'

// To allow more languages other than `ts` in `.vue` files, uncomment the following lines:
import { configureVueProject } from '@vue/eslint-config-typescript'
// Le projet mélange des composants historiques écrits en JavaScript brut et des
// composants TypeScript écrits depuis. On autorise donc les deux langages de
// script dans les fichiers .vue plutôt que d'imposer `lang="ts"` partout : le
// code neuf est attendu en TypeScript, mais les anciens composants JavaScript
// ne sont pas migrés de force (cela déclencherait un flot d'erreurs de typage
// sans rapport avec le nettoyage en cours).
configureVueProject({ scriptLangs: ['ts', 'js'] })
// More info at https://github.com/vuejs/eslint-config-typescript/#advanced-setup

export default defineConfigWithVueTs(
  {
    name: 'app/files-to-lint',
    files: ['**/*.{vue,ts,mts,tsx}'],
  },

  globalIgnores(['**/dist/**', '**/dist-ssr/**', '**/coverage/**']),

  ...pluginVue.configs['flat/essential'],
  vueTsConfigs.recommended,

  {
    // La règle `vue/multi-word-component-names` impose des noms de composants
    // composés d'au moins deux mots (pour éviter toute collision avec de
    // futurs éléments HTML natifs). De nombreux composants existants de
    // l'application (Sidebar, Ambassadeur, Calendrier, Dashboard, etc.) ont
    // été nommés en un seul mot bien avant l'introduction de cette règle.
    // Les renommer impliquerait de modifier le routeur et tous leurs imports
    // pour un gain purement stylistique, avec un vrai risque de régression.
    // On désactive donc la règle ; elle pourra être reconsidérée si ces
    // composants sont un jour réorganisés.
    name: 'app/disable-multi-word-component-names',
    rules: {
      'vue/multi-word-component-names': 'off',
    },
  },

  {
    ...pluginPlaywright.configs['flat/recommended'],
    files: ['e2e/**/*.{test,spec}.{js,ts,jsx,tsx}'],
  },

  {
    ...pluginVitest.configs.recommended,
    files: ['src/**/__tests__/*'],
  },

  ...pluginOxlint.buildFromOxlintConfigFile('.oxlintrc.json'),

  skipFormatting,
)
