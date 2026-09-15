<template>
  <div class="min-h-screen bg-gray-50">
    <p v-if="chargement" class="text-gray-500 py-24 text-center">Chargement de la biographie…</p>

    <!-- Discipline de retractation : tant que le CMS ne sert pas la
         biographie, la page ne montre rien du gabarit. Le bouton d'acces
         est masque sur l'accueil, mais l'adresse reste atteignable a la
         main : on explique plutot que d'afficher une page vide. -->
    <div v-else-if="biographie === null" class="max-w-3xl mx-auto px-4 py-24 text-center">
      <h1 class="text-2xl font-bold text-gray-800 mb-3">Rubrique en préparation</h1>
      <p class="text-gray-600 mb-8">La biographie de l'ambassadeur n'a pas encore été publiée.</p>
      <router-link to="/" class="text-accent font-semibold hover:underline">
        Retour à l'accueil
      </router-link>
    </div>

    <template v-else>
      <!-- Bandeau : portrait, nom et fonction servis par le CMS -->
      <div class="relative bg-gradient-to-r from-accent to-primary-light text-white">
        <div class="absolute inset-0 bg-black/20"></div>
        <div class="relative max-w-7xl mx-auto px-4 py-16 md:py-24">
          <div class="flex flex-col md:flex-row items-center gap-8 md:gap-12">
            <div v-if="biographie.image_url !== null" class="relative flex-shrink-0">
              <div
                class="w-56 h-56 md:w-80 md:h-80 rounded-full border-4 border-white shadow-2xl overflow-hidden bg-gray-200"
              >
                <img
                  :src="biographie.image_url"
                  :alt="`${biographie.title} ${biographie.name}`"
                  class="w-full h-full object-cover object-center"
                />
              </div>
            </div>

            <div class="text-center md:text-left">
              <h1 class="text-4xl md:text-5xl font-bold mb-3">{{ biographie.name }}</h1>
              <p class="text-2xl md:text-3xl text-secondary font-semibold">
                {{ biographie.title }}
              </p>
            </div>
          </div>
        </div>

        <div class="absolute bottom-0 left-0 right-0">
          <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 1440 120" class="w-full h-auto">
            <path
              fill="#f9fafb"
              fill-opacity="1"
              d="M0,64L80,69.3C160,75,320,85,480,80C640,75,800,53,960,48C1120,43,1280,53,1360,58.7L1440,64L1440,120L1360,120C1280,120,1120,120,960,120C800,120,640,120,480,120C320,120,160,120,80,120L0,120Z"
            ></path>
          </svg>
        </div>
      </div>

      <!-- Corps de la biographie, assaini cote serveur -->
      <div class="max-w-4xl mx-auto px-4 py-12">
        <div class="bg-white rounded-2xl shadow-lg p-8">
          <h2 class="text-3xl font-bold text-gray-800 mb-6 flex items-center">
            <span class="bg-accent w-1 h-8 mr-3"></span>
            Biographie
          </h2>
          <div class="prose prose-lg max-w-none text-gray-700" v-html="biographie.body_html"></div>
        </div>
      </div>
    </template>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, onMounted } from 'vue'
import { recupererContenuAccueil, CONTENU_VIDE, type ContenuAccueil } from '@/api/contenu'

/**
 * La page etait ecrite en dur avec la biographie de l'ambassadeur de Guinee
 * aux Etats-Unis : c'etait l'une des fuites d'identite du gabarit. Tout
 * vient desormais du bloc `ambassador` du CMS ; sur un echec, le contenu
 * reste vide et la page se retracte, elle ne se rabat jamais sur le contenu
 * d'une autre ambassade.
 */
const contenu = ref<ContenuAccueil>({ ...CONTENU_VIDE })
const chargement = ref(true)

const biographie = computed(() => contenu.value.ambassador)

onMounted(async () => {
  try {
    contenu.value = await recupererContenuAccueil()
  } catch {
    // Le contenu reste vide : la page affiche « Rubrique en preparation ».
  } finally {
    chargement.value = false
  }
})
</script>
