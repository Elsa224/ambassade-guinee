<template>
  <div class="min-h-screen bg-gray-50">
    <p v-if="chargement" class="text-gray-500 py-24 text-center">Chargement des services…</p>

    <!-- Discipline de retractation : tant que le CMS ne sert aucun service, la
         page ne montre rien du gabarit. L'adresse reste atteignable a la main,
         on explique donc plutot que d'afficher une grille vide. -->
    <div v-else-if="services.length === 0" class="max-w-3xl mx-auto px-4 py-24 text-center">
      <h1 class="text-2xl font-bold text-gray-800 mb-3">Rubrique en préparation</h1>
      <p class="text-gray-600 mb-8">Les services consulaires n'ont pas encore été publiés.</p>
      <router-link to="/" class="text-accent font-semibold hover:underline">
        Retour à l'accueil
      </router-link>
    </div>

    <div v-else class="max-w-7xl mx-auto px-4 py-16 md:py-20">
      <div class="text-center mb-12">
        <h1 class="text-3xl md:text-4xl font-bold text-primary uppercase tracking-wide mb-4">
          Nos services
        </h1>
        <div class="w-24 h-1 bg-secondary mx-auto mb-6"></div>
        <p class="text-gray-600 max-w-2xl mx-auto">
          Découvrez l'ensemble de nos services consulaires pour vous accompagner dans vos démarches.
        </p>
      </div>

      <BandeauPlateforme :plateforme="contenu.platform" class="mb-12" />

      <div class="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
        <router-link
          v-for="service in services"
          :key="service.id"
          :to="`/services/${service.slug}`"
          class="group bg-white rounded-2xl p-8 border-b-4 border-secondary shadow-sm hover:shadow-lg hover:-translate-y-1 transition-all duration-300 flex flex-col"
        >
          <div
            class="w-14 h-14 rounded-xl bg-primary/10 flex items-center justify-center mb-6 flex-shrink-0"
          >
            <IconeService :icone="service.icon" />
          </div>

          <h2 class="text-xl font-bold text-primary mb-3">{{ service.title }}</h2>
          <p v-if="service.summary" class="text-gray-600 flex-grow">{{ service.summary }}</p>

          <span
            class="inline-flex items-center gap-2 mt-6 text-sm font-semibold text-accent group-hover:gap-3 transition-all"
          >
            En savoir plus
            <i class="bx bx-right-arrow-alt" aria-hidden="true"></i>
          </span>
        </router-link>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, onMounted } from 'vue'
import { recupererServices, SERVICES_VIDES, type ContenuServices } from '@/api/services'
import BandeauPlateforme from './BandeauPlateforme.vue'
import IconeService from './IconeService.vue'

/**
 * La grille des services consulaires, servie par le CMS.
 *
 * Elle ne remplace pas `/services-ambassadeur`, qui porte encore en dur le
 * texte de l'ambassade de Guinee aux Etats-Unis : cette page-la vivra tant
 * que son contenu n'aura pas ete saisi dans le CMS.
 */
const contenu = ref<ContenuServices>({ ...SERVICES_VIDES })
const chargement = ref(true)

const services = computed(() => contenu.value.services)

onMounted(async () => {
  try {
    contenu.value = await recupererServices()
  } catch {
    // La page se retracte : sur un site d'ambassade, une rubrique absente
    // vaut mieux qu'un message d'erreur, et le repli n'est jamais le contenu
    // compile dans le gabarit.
  }
  chargement.value = false
})
</script>
