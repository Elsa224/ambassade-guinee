<template>
  <PageRedaction slug="presentation" macaron="L'Ambassade" flanc chiffres-visibles />
</template>

<script setup lang="ts">
/**
 * La page de presentation de l'ambassade.
 *
 * Elle portait 428 lignes ecrites en dur : « Ambassade de la Republique de
 * Guinee », une juridiction americaine, « 1959 », « 186 ambassades a
 * Washington DC ». Tout cela vient desormais du CMS, et la page se retracte
 * quand l'ambassade n'a rien saisi.
 */
import PageRedaction from './PageRedaction.vue'
</script>
