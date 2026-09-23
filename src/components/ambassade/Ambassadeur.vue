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
        <div class="relative max-w-7xl mx-auto px-4 pt-16 pb-28 md:pt-24 md:pb-32">
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

        <!-- La vague qui rejoint le fond de la page. Meme courbe que la
             banniere des actualites, cadree sur sa crete : le SVG d'origine
             reserve ses 96 premieres unites au vide, et les afficher
             ferait descendre l'aplat sous le titre. -->
        <div class="absolute bottom-0 left-0 right-0">
          <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 96 1440 120" class="w-full h-auto">
            <path
              fill="#f9fafb"
              fill-opacity="1"
              d="M0,96L48,112C96,128,192,160,288,160C384,160,480,128,576,122.7C672,117,768,139,864,154.7C960,171,1056,181,1152,170.7C1248,160,1344,128,1392,112L1440,96L1440,320L1392,320C1344,320,1248,320,1152,320C1056,320,960,320,864,320C768,320,672,320,576,320C480,320,384,320,288,320C192,320,96,320,48,320L0,320Z"
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
          <div class="contenu-cms max-w-none text-gray-700" v-html="biographie.body_html"></div>
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
