<template>
  <!-- Discipline de retractation : sans plateforme servie, pas de bandeau.
       Le gabarit n'annonce jamais une demarche en ligne qui n'existe pas. -->
  <section
    v-if="plateforme"
    class="bg-gradient-to-r from-primary to-primary-dark text-white rounded-2xl p-8 md:p-10"
  >
    <div class="flex flex-col md:flex-row md:items-center gap-6">
      <div class="flex-1">
        <p class="text-sm uppercase tracking-wider opacity-80 mb-2">Démarches en ligne</p>
        <h2 class="text-2xl md:text-3xl font-bold mb-3">{{ plateforme.name }}</h2>
        <p v-if="plateforme.description" class="opacity-90 max-w-2xl">
          {{ plateforme.description }}
        </p>
      </div>

      <div class="flex flex-col gap-3 md:items-end">
        <a
          :href="plateforme.url"
          target="_blank"
          rel="noopener noreferrer"
          class="inline-flex items-center gap-2 bg-secondary text-ink-dark font-semibold px-6 py-3 rounded-lg hover:bg-secondary-dark transition-colors"
        >
          Accéder à {{ plateforme.name }}
          <i class="bx bx-link-external" aria-hidden="true"></i>
        </a>
        <a
          v-if="plateforme.phone"
          :href="`tel:${plateforme.phone.replace(/\s/g, '')}`"
          class="inline-flex items-center gap-2 text-sm opacity-90 hover:opacity-100 hover:underline"
        >
          <i class="bx bx-phone" aria-hidden="true"></i>
          {{ plateforme.phone }}
        </a>
      </div>
    </div>
  </section>
</template>

<script setup lang="ts">
import type { PlateformeDemarches } from '@/api/services'

defineProps<{ plateforme: PlateformeDemarches | null }>()
</script>
