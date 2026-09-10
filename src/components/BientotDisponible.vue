<template>
  <section class="min-h-[70vh] flex items-center justify-center px-4 py-20">
    <div class="max-w-xl w-full text-center">
      <span
        class="inline-flex items-center justify-center w-16 h-16 rounded-full bg-primary/10 text-primary mb-8"
        aria-hidden="true"
      >
        <i class="bx bx-time-five text-3xl"></i>
      </span>

      <p class="text-sm font-semibold uppercase tracking-widest text-accent mb-3">
        Rubrique en préparation
      </p>

      <h1 class="text-3xl md:text-4xl font-bold text-ink-dark leading-tight mb-4">
        {{ titre }}
      </h1>

      <p class="text-gray-600 text-lg leading-relaxed mb-10">
        Cette page sera publiée dès que les informations correspondantes nous auront été transmises.
        Le reste du site est consultable normalement.
      </p>

      <div class="flex flex-wrap justify-center gap-3">
        <router-link
          to="/"
          class="inline-flex items-center gap-2 bg-primary hover:bg-primary-dark text-white px-6 py-2.5 rounded-full font-semibold transition-colors"
        >
          <i class="bx bx-home-alt" aria-hidden="true"></i>
          Retour à l'accueil
        </router-link>
        <router-link
          to="/actualite"
          class="inline-flex items-center gap-2 border border-primary text-primary hover:bg-primary/5 px-6 py-2.5 rounded-full font-semibold transition-colors"
        >
          <i class="bx bx-news" aria-hidden="true"></i>
          Voir les actualités
        </router-link>
      </div>

      <p v-if="courriel" class="text-sm text-gray-500 mt-10">
        Pour une demande urgente, écrivez à
        <a :href="`mailto:${courriel}`" class="text-primary hover:underline">{{ courriel }}</a>
      </p>
    </div>
  </section>
</template>

<script setup lang="ts">
import { computed } from 'vue'
import { storeToRefs } from 'pinia'
import { useTenantStore } from '@/stores/tenant'

const props = defineProps<{
  /** Intitulé de la rubrique concernée, tel qu'il figure au menu. */
  titre?: string
}>()

const { embassy } = storeToRefs(useTenantStore())

const titre = computed(() => props.titre ?? 'Cette rubrique sera bientôt disponible')

// Le courriel de contact vient du tenant : sans configuration chargee, la
// ligne disparait plutot que d'afficher une adresse vide ou celle d'une
// autre ambassade.
const courriel = computed(() => embassy.value?.contact?.email ?? '')
</script>
