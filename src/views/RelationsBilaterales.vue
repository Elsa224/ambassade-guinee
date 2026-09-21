<template>
  <PageRedaction
    slug="relations-bilaterales"
    macaron="Coopération"
    degrade="bg-gradient-to-r from-primary-light to-accent"
  />
</template>

<script setup lang="ts">
/**
 * La page des relations bilaterales.
 *
 * Elle portait, avec ses cinq pages pays (`/usa`, `/costa-rica`, `/haiti`,
 * `/bahamas`, `/fond-monetaire`), 2 441 lignes decrivant les relations de la
 * Guinee avec quatre pays qui ne concernent aucune autre ambassade. Les cinq
 * routes ont ete supprimees ; le texte vient du CMS.
 *
 * Une collection `bilateral-relations`, une page par partenaire, est prevue au
 * contrat et viendra dans un second lot : l'ambassade du Gabon n'a pour
 * l'instant qu'un partenaire a presenter, et son texte tient dans cette page.
 */
import PageRedaction from '@/components/ambassade/PageRedaction.vue'
</script>
