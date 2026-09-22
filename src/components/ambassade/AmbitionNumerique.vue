<template>
  <PageRedaction
    slug="ambition-numerique"
    macaron="Notre ambition"
    degrade="bg-gradient-to-r from-primary to-primary-light"
    :avertissement="AVERTISSEMENT"
  />
</template>

<script setup lang="ts">
/**
 * La page qui porte le texte d'une ambassade sur sa transformation numerique.
 *
 * Ce texte annonce des services qui n'existent pas encore — rendez-vous en
 * ligne, pre-demandes, suivi de dossier. Elsa a tranche le 21/09/2026 : le
 * texte officiel est publie SANS etre reecrit, parce qu'amputer un texte signe
 * n'est pas au site de le faire, mais sur une page qui se presente comme une
 * vision. C'est donc le CADRE qui porte l'avertissement, pas le texte.
 *
 * Le jour ou les services existent, la page n'a pas a changer : c'est cette
 * ligne qui tombe.
 */
import PageRedaction from './PageRedaction.vue'

const AVERTISSEMENT =
  "Cette page présente les projets numériques de l'Ambassade. Les services décrits ne sont pas encore ouverts : consultez la rubrique « Nos services » pour les démarches actuellement disponibles."
</script>
