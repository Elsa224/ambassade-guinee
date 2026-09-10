<template>
  <div class="min-h-screen bg-gray-50">
    <!-- Hero section avec titre -->
    <div class="bg-accent text-white py-16 px-4">
      <div class="max-w-7xl mx-auto text-center">
        <h1 class="text-4xl md:text-5xl font-bold mb-4">Nos Actualités</h1>
        <p class="text-xl md:text-2xl opacity-90">{{ sousTitre }}</p>
        <div class="w-24 h-1 bg-secondary mx-auto mt-6"></div>
      </div>
    </div>

    <div class="max-w-7xl mx-auto px-4 py-8">
      <div class="flex flex-col md:flex-row justify-between items-center gap-4 mb-8">
        <div class="relative w-full md:w-64 md:ml-auto">
          <input
            type="search"
            v-model="recherche"
            placeholder="Rechercher une actualité..."
            aria-label="Rechercher une actualité"
            class="w-full px-4 py-2 rounded-lg border border-gray-200 focus:outline-none focus:ring-2 focus:ring-accent focus:border-transparent"
          />
        </div>
      </div>

      <p v-if="chargement" class="text-center text-gray-500 py-20">Chargement des actualités…</p>

      <div v-else-if="erreur" class="text-center py-20">
        <p class="text-gray-700 mb-4">{{ erreur }}</p>
        <button
          @click="recharger"
          class="bg-accent hover:bg-accent-dark text-white px-6 py-2.5 rounded-full font-semibold transition-colors"
        >
          Réessayer
        </button>
      </div>

      <template v-else>
        <!-- Actualités en vedette -->
        <div v-if="vedettes.length > 0" class="mb-12">
          <h2 class="text-2xl font-bold text-gray-800 mb-6 flex items-center">
            <span class="bg-secondary w-1 h-8 mr-3"></span>
            À la une
          </h2>

          <div class="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <router-link
              v-for="actu in vedettes"
              :key="actu.id"
              :to="`/actualites/${actu.slug}`"
              class="bg-white rounded-xl shadow-lg overflow-hidden hover:shadow-xl transition-shadow group block"
            >
              <div class="relative h-64 overflow-hidden">
                <img
                  :src="actu.image"
                  :alt="actu.titre"
                  class="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                />
              </div>

              <div class="p-6">
                <p class="text-sm text-gray-500 mb-2">
                  {{ formaterDate(actu.date_publication) }}
                </p>
                <h3 class="text-xl font-bold text-gray-800 mb-2">{{ actu.titre }}</h3>
                <p class="text-gray-600">{{ actu.resume }}</p>
              </div>
            </router-link>
          </div>
        </div>

        <!-- Grille -->
        <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          <router-link
            v-for="actu in reste"
            :key="actu.id"
            :to="`/actualites/${actu.slug}`"
            class="bg-white rounded-lg shadow-md overflow-hidden hover:shadow-lg transition-shadow block"
          >
            <img :src="actu.image" :alt="actu.titre" class="w-full h-48 object-cover" />

            <div class="p-4">
              <p class="text-xs text-gray-500 mb-2">{{ formaterDate(actu.date_publication) }}</p>
              <h3 class="font-bold text-gray-800 mb-2">{{ actu.titre }}</h3>
              <p class="text-gray-600 text-sm">{{ actu.resume }}</p>
            </div>
          </router-link>
        </div>

        <div v-if="correspondants.length === 0" class="text-center py-20">
          <h3 class="text-2xl font-bold text-gray-700 mb-2">Aucune actualité pour le moment</h3>
          <p class="text-gray-500">
            {{
              recherche
                ? 'Aucun résultat ne correspond à votre recherche.'
                : 'Cette rubrique sera alimentée prochainement.'
            }}
          </p>
        </div>
      </template>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, toRef } from 'vue'
import { useActualites, formaterDate } from '@/composables/useActualites'

/**
 * Page de rubrique, partagee par les trois routes d'actualites.
 *
 * Ces trois pages etaient auparavant trois composants identiques au mot pres,
 * a l'exception de leur sous-titre, et affichaient tous les memes huit
 * actualites codees en dur : la rubrique ne filtrait rien. La categorie
 * arrive maintenant par les props de la route et sert reellement de filtre.
 */
const props = defineProps<{
  /** Slug de la categorie, tel qu'il figure dans `categorie.slug` de l'API. */
  categorie: string
  sousTitre: string
}>()

const { articles, chargement, erreur, recharger } = useActualites(toRef(props, 'categorie'))

const recherche = ref('')

const correspondants = computed(() => {
  const requete = recherche.value.trim().toLowerCase()
  if (!requete) return articles.value
  return articles.value.filter(
    (article) =>
      article.titre.toLowerCase().includes(requete) ||
      article.resume.toLowerCase().includes(requete),
  )
})

/** Les deux plus recentes, l'API renvoyant la liste deja triee. */
const vedettes = computed(() => correspondants.value.slice(0, 2))
const reste = computed(() => correspondants.value.slice(2))
</script>
