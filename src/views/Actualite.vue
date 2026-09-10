<template>
  <div class="min-h-screen bg-gray-50">
    <!-- Hero section de la page actualités -->
    <section class="relative bg-gradient-to-r from-primary to-primary-dark py-16 lg:py-24">
      <div class="absolute inset-0 overflow-hidden">
        <div class="absolute inset-0 bg-black/20"></div>
        <svg
          class="absolute left-0 right-0 top-40"
          xmlns="http://www.w3.org/2000/svg"
          viewBox="0 0 1440 320"
        >
          <path
            fill="#ffffff"
            fill-opacity="1"
            d="M0,96L48,112C96,128,192,160,288,160C384,160,480,128,576,122.7C672,117,768,139,864,154.7C960,171,1056,181,1152,170.7C1248,160,1344,128,1392,112L1440,96L1440,320L1392,320C1344,320,1248,320,1152,320C1056,320,960,320,864,320C768,320,672,320,576,320C480,320,384,320,288,320C192,320,96,320,48,320L0,320Z"
          ></path>
        </svg>
      </div>

      <div class="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
        <h1 class="text-4xl lg:text-5xl font-bold text-white mb-4">Actualités</h1>
        <div class="w-24 h-1 bg-secondary mx-auto mb-6"></div>
        <p class="text-xl text-white/90 max-w-3xl mx-auto">
          Restez informé des dernières nouvelles de l'Ambassade et de la Guinée
        </p>
      </div>
    </section>

    <!-- Filtres et recherche -->
    <section class="py-8 bg-white shadow-sm sticky top-0 z-40">
      <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div class="flex flex-col lg:flex-row gap-4 items-center justify-between">
          <!-- Filtres par catégorie -->
          <div class="flex flex-wrap gap-2">
            <button
              @click="categorieActive = 'tous'"
              class="px-4 py-2 rounded-full text-sm font-semibold transition-all"
              :class="
                categorieActive === 'tous'
                  ? 'bg-primary text-white'
                  : 'bg-gray-100 text-gray-700 hover:bg-secondary hover:text-primary'
              "
            >
              Toutes
            </button>
            <button
              v-for="categorie in categories"
              :key="categorie.slug"
              @click="categorieActive = categorie.slug"
              class="px-4 py-2 rounded-full text-sm font-semibold transition-all"
              :class="
                categorieActive === categorie.slug
                  ? 'text-white'
                  : 'bg-gray-100 text-gray-700 hover:bg-secondary hover:text-primary'
              "
              :style="
                categorieActive === categorie.slug
                  ? { backgroundColor: categorie.couleur }
                  : undefined
              "
            >
              {{ categorie.nom }}
            </button>
          </div>

          <!-- Barre de recherche -->
          <div class="relative w-full lg:w-96">
            <input
              type="text"
              v-model="recherche"
              placeholder="Rechercher une actualité..."
              class="w-full px-4 py-2 pl-10 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent"
            />
            <i class="bx bx-search absolute left-3 top-1/2 -translate-y-1/2 text-gray-400"></i>
          </div>
        </div>
      </div>
    </section>

    <!-- Section actualités principales -->
    <section class="py-12">
      <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <p v-if="chargement" class="text-center text-gray-500 py-20">Chargement des actualités…</p>

        <div v-else-if="erreur" class="text-center py-20">
          <p class="text-gray-700 mb-4">{{ erreur }}</p>
          <button
            @click="recharger"
            class="bg-primary hover:bg-primary-dark text-white px-6 py-2.5 rounded-full font-semibold transition-colors"
          >
            Réessayer
          </button>
        </div>

        <!-- Actualité à la une -->
        <div v-if="!chargement && !erreur && actualiteUne" class="mb-16">
          <div
            class="bg-white rounded-3xl shadow-2xl overflow-hidden transform hover:-translate-y-2 transition-all duration-500"
          >
            <div class="grid grid-cols-1 lg:grid-cols-2">
              <div class="h-80 lg:h-auto overflow-hidden">
                <img
                  :src="actualiteUne.image"
                  :alt="actualiteUne.titre"
                  class="w-full h-full object-cover hover:scale-110 transition-transform duration-700"
                />
              </div>
              <div class="p-8 lg:p-12 flex flex-col justify-center">
                <div class="flex items-center gap-3 mb-4">
                  <span
                    class="px-3 py-1 rounded-full text-sm font-semibold text-white"
                    :style="{ backgroundColor: actualiteUne.categorie?.couleur }"
                  >
                    {{ actualiteUne.categorie?.nom }}
                  </span>
                  <span class="text-sm text-gray-500 flex items-center gap-1">
                    <i class="bx bx-calendar"></i>
                    {{ formaterDate(actualiteUne.date_publication) }}
                  </span>
                </div>
                <h2 class="text-3xl lg:text-4xl font-bold text-primary mb-4">
                  {{ actualiteUne.titre }}
                </h2>
                <p class="text-gray-600 text-lg mb-6">{{ actualiteUne.resume }}</p>
                <div class="flex items-center justify-between">
                  <router-link
                    :to="`/actualites/${actualiteUne.slug}`"
                    class="inline-flex items-center gap-2 bg-secondary text-primary px-6 py-3 rounded-lg font-semibold hover:bg-primary hover:text-white transition-all group"
                  >
                    Lire l'article complet
                    <i
                      class="bx bx-right-arrow-alt text-xl group-hover:translate-x-2 transition-transform"
                    ></i>
                  </router-link>
                  <div class="flex items-center gap-2 text-sm text-gray-500">
                    <i class="bx bx-show"></i>
                    <span>{{ actualiteUne.vues }} vues</span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>

        <!-- Grille des actualités -->
        <div
          v-if="!chargement && !erreur"
          class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8"
        >
          <div
            v-for="actualite in articlesDeLaPage"
            :key="actualite.id"
            class="bg-white rounded-2xl shadow-lg overflow-hidden transform hover:-translate-y-2 transition-all duration-300 hover:shadow-2xl"
          >
            <div class="relative h-56 overflow-hidden">
              <img
                :src="actualite.image"
                :alt="actualite.titre"
                class="w-full h-full object-cover hover:scale-110 transition-transform duration-500"
              />
              <div class="absolute top-4 left-4 flex gap-2">
                <span
                  class="px-3 py-1 rounded-full text-xs font-semibold text-white"
                  :style="{ backgroundColor: actualite.categorie?.couleur }"
                >
                  {{ actualite.categorie?.nom }}
                </span>
              </div>
            </div>

            <div class="p-6">
              <div class="flex items-center gap-2 text-sm text-gray-500 mb-3">
                <i class="bx bx-calendar"></i>
                <span>{{ formaterDate(actualite.date_publication) }}</span>
                <span class="mx-2">•</span>
                <i class="bx bx-time"></i>
                <span>{{ actualite.temps_lecture }} min</span>
              </div>

              <h3 class="font-bold text-xl mb-3 text-primary hover:text-accent transition-colors">
                <router-link :to="`/actualites/${actualite.slug}`">{{
                  actualite.titre
                }}</router-link>
              </h3>

              <p class="text-gray-600 text-sm mb-4 line-clamp-2">{{ actualite.resume }}</p>

              <div class="flex items-center justify-between">
                <router-link
                  :to="`/actualites/${actualite.slug}`"
                  class="text-accent font-semibold inline-flex items-center gap-1 hover:gap-2 transition-all group"
                >
                  Lire la suite
                  <i
                    class="bx bx-right-arrow-alt group-hover:translate-x-1 transition-transform"
                  ></i>
                </router-link>

                <div class="flex items-center gap-3 text-sm text-gray-500">
                  <span class="flex items-center gap-1">
                    <i class="bx bx-heart"></i>
                    <span>{{ actualite.likes }}</span>
                  </span>
                  <span class="flex items-center gap-1">
                    <i class="bx bx-show"></i>
                    <span>{{ actualite.vues }}</span>
                  </span>
                </div>
              </div>
            </div>
          </div>
        </div>

        <!-- Message si aucune actualité -->
        <div
          v-if="!chargement && !erreur && articlesDeLaPage.length === 0"
          class="text-center py-20"
        >
          <div class="text-6xl mb-4">📰</div>
          <h3 class="text-2xl font-bold text-gray-700 mb-2">Aucune actualité trouvée</h3>
          <p class="text-gray-500">Essayez de modifier vos filtres ou votre recherche</p>
        </div>

        <!-- Pagination : inutile tant qu'il n'y a qu'une page. -->
        <div v-if="!chargement && !erreur && pagesTotales > 1" class="mt-12 flex justify-center">
          <nav class="flex items-center gap-2">
            <button
              @click="pageCourante--"
              :disabled="pageCourante === 1"
              class="w-10 h-10 rounded-lg border border-gray-300 flex items-center justify-center hover:bg-secondary hover:text-primary transition-colors disabled:opacity-50 disabled:hover:bg-transparent"
            >
              <i class="bx bx-chevron-left"></i>
            </button>

            <button
              v-for="page in pagesTotales"
              :key="page"
              @click="pageCourante = page"
              class="w-10 h-10 rounded-lg font-semibold transition-all"
              :class="
                pageCourante === page
                  ? 'bg-primary text-white'
                  : 'border border-gray-300 hover:bg-secondary hover:text-primary'
              "
            >
              {{ page }}
            </button>

            <button
              @click="pageCourante++"
              :disabled="pageCourante === pagesTotales"
              class="w-10 h-10 rounded-lg border border-gray-300 flex items-center justify-center hover:bg-secondary hover:text-primary transition-colors disabled:opacity-50 disabled:hover:bg-transparent"
            >
              <i class="bx bx-chevron-right"></i>
            </button>
          </nav>
        </div>
      </div>
    </section>

    <!-- Section newsletter -->
    <section class="py-20 bg-gradient-to-r from-primary to-primary-dark">
      <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
        <h2 class="text-3xl lg:text-4xl font-bold text-white mb-4">Restez informé</h2>
        <p class="text-xl text-white/90 mb-8 max-w-2xl mx-auto">
          Abonnez-vous à notre newsletter pour recevoir les dernières actualités de l'Ambassade
        </p>

        <form
          @submit.prevent="abonnerNewsletter"
          class="flex flex-col sm:flex-row gap-4 max-w-lg mx-auto"
        >
          <input
            type="email"
            v-model="email"
            placeholder="Votre adresse email"
            class="flex-1 px-6 py-4 rounded-lg focus:outline-none focus:ring-2 focus:ring-secondary text-gray-800"
            required
          />
          <button
            type="submit"
            class="bg-secondary text-primary px-8 py-4 rounded-lg font-semibold hover:bg-white transition-all whitespace-nowrap flex items-center justify-center gap-2"
          >
            S'abonner
            <i class="bx bx-send"></i>
          </button>
        </form>

        <p class="text-white/70 text-sm mt-4">
          En vous abonnant, vous acceptez de recevoir nos actualités. Vous pourrez vous désabonner à
          tout moment.
        </p>
      </div>
    </section>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, watch } from 'vue'
import { useActualites, formaterDate } from '@/composables/useActualites'

const { articles, categories, chargement, erreur, recharger } = useActualites()

const categorieActive = ref('tous')
const recherche = ref('')
const pageCourante = ref(1)
const ARTICLES_PAR_PAGE = 6
const email = ref('')

/**
 * Une seule source de verite pour le filtrage : la pagination et le compteur
 * de pages en derivent tous les deux. La version precedente recalculait le
 * meme filtre a deux endroits, avec le risque qu'ils divergent.
 */
const articlesCorrespondants = computed(() => {
  // La une est retiree de la grille : elle est deja affichee en tete.
  let resultat = articles.value.slice(1)

  if (categorieActive.value !== 'tous') {
    resultat = resultat.filter((article) => article.categorie?.slug === categorieActive.value)
  }

  const requete = recherche.value.trim().toLowerCase()
  if (requete) {
    resultat = resultat.filter(
      (article) =>
        article.titre.toLowerCase().includes(requete) ||
        article.resume.toLowerCase().includes(requete),
    )
  }

  return resultat
})

const pagesTotales = computed(() =>
  Math.max(1, Math.ceil(articlesCorrespondants.value.length / ARTICLES_PAR_PAGE)),
)

const articlesDeLaPage = computed(() => {
  const debut = (pageCourante.value - 1) * ARTICLES_PAR_PAGE
  return articlesCorrespondants.value.slice(debut, debut + ARTICLES_PAR_PAGE)
})

// Sans cette remise a zero, filtrer depuis la page 3 laisse le visiteur sur
// une page qui n'existe plus dans le resultat filtre, donc sur du vide.
watch([categorieActive, recherche], () => {
  pageCourante.value = 1
})

/** Article mis en avant : le plus recent, l'API renvoyant la liste triee. */
const actualiteUne = computed(() => articles.value[0])

function abonnerNewsletter() {
  alert(`Merci pour votre abonnement avec l'adresse : ${email.value}`)
  email.value = ''
}
</script>
