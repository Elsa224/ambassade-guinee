<template>
  <div class="min-h-screen bg-gray-50">
    <!-- Hero section avec titre -->
    <div class="bg-accent text-white py-16 px-4">
      <div class="max-w-7xl mx-auto text-center">
        <h1 class="text-4xl md:text-5xl font-bold mb-4">Nos Actualités</h1>
        <p class="text-xl md:text-2xl opacity-90">Actualités Gouvernementales</p>
        <div class="w-24 h-1 bg-secondary mx-auto mt-6"></div>
      </div>
    </div>

    <!-- Filtres et recherche -->
    <div class="max-w-7xl mx-auto px-4 py-8">
      <div class="flex flex-col md:flex-row justify-between items-center gap-4 mb-8">
        <div class="flex gap-2 overflow-x-auto pb-2 w-full md:w-auto">
          <button
            v-for="categorie in categories"
            :key="categorie"
            @click="categorieActive = categorie"
            :class="[
              'px-4 py-2 rounded-full text-sm font-medium transition-all whitespace-nowrap',
              categorieActive === categorie
                ? 'bg-accent text-white'
                : 'bg-white text-gray-600 hover:bg-gray-100 border border-gray-200'
            ]"
          >
            {{ categorie }}
          </button>
        </div>

        <div class="relative w-full md:w-64">
          <input
            type="text"
            v-model="recherche"
            placeholder="Rechercher une actualité..."
            class="w-full px-4 py-2 pl-10 rounded-lg border border-gray-200 focus:outline-none focus:ring-2 focus:ring-accent focus:border-transparent"
          >
        </div>
      </div>

      <!-- Actualités en vedette -->
      <div v-if="actualitesVedette.length > 0" class="mb-12">
        <h2 class="text-2xl font-bold text-gray-800 mb-6 flex items-center">
          <span class="bg-secondary w-1 h-8 mr-3"></span>
          À la une
        </h2>

        <div class="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <div
            v-for="(actu, index) in actualitesVedette"
            :key="'vedette-'+index"
            class="bg-white rounded-xl shadow-lg overflow-hidden hover:shadow-xl transition-shadow group cursor-pointer"
          >
            <div class="relative h-64 overflow-hidden">
              <img :src="actu.image" class="w-full h-full object-cover">
            </div>

            <div class="p-6">
              <h3 class="text-xl font-bold text-gray-800 mb-2">
                {{ actu.titre }}
              </h3>
              <p class="text-gray-600 mb-4">{{ actu.resume }}</p>
            </div>
          </div>
        </div>
      </div>

      <!-- Grille -->
      <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        <div
          v-for="(actu, index) in actualitesFiltrees"
          :key="index"
          class="bg-white rounded-lg shadow-md overflow-hidden"
        >
          <img :src="actu.image" class="w-full h-48 object-cover">

          <div class="p-4">
            <h3 class="font-bold text-gray-800 mb-2">
              {{ actu.titre }}
            </h3>
            <p class="text-gray-600 text-sm">
              {{ actu.resume }}
            </p>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, computed } from 'vue'

// ✅ IMPORT DES IMAGES (CORRECTION ICI)
import img1 from '@/assets/images/partenariat.jpg'
import img2 from '@/assets/images/18474.jpg'
import img3 from '@/assets/images/8.jpg'
import img4 from '@/assets/images/Cascade.jpg'
import img5 from '@/assets/images/actualite4.jpg'
import img6 from '@/assets/images/actualite3.jpg'
import img7 from '@/assets/images/actualite2.jpg'
import img8 from '@/assets/images/actualite1.jpg'

// Données
const actualites = ref([
  {
    titre: "Cérémonie de commémoration de l'indépendance de la Guinée",
    resume: "L'Ambassade a organisé une cérémonie officielle.",
    image: img1,
    categorie: "Événements",
    estVedette: true
  },
  {
    titre: "Nouveau service de visa en ligne",
    resume: "Lancement du portail visa.",
    image: img2,
    categorie: "Services",
    estVedette: true
  },
  {
    titre: "Rencontre diplomatique",
    resume: "Discussion des relations bilatérales.",
    image: img3,
    categorie: "Diplomatie",
    estVedette: false
  },
  {
    titre: "Forum économique",
    resume: "Forum Guinée-USA.",
    image: img4,
    categorie: "Économie",
    estVedette: false
  },
  {
    titre: "Journée culturelle",
    resume: "Culture guinéenne.",
    image: img5,
    categorie: "Culture",
    estVedette: false
  },
  {
    titre: "Recrutement",
    resume: "Poste disponible.",
    image: img6,
    categorie: "Recrutement",
    estVedette: false
  },
  {
    titre: "Visite officielle",
    resume: "Renforcement échanges.",
    image: img7,
    categorie: "Diplomatie",
    estVedette: false
  },
  {
    titre: "Procédure consulaire",
    resume: "Mise à jour.",
    image: img8,
    categorie: "Services",
    estVedette: false
  }
])

const categories = ref(['Toutes', 'Événements', 'Diplomatie', 'Services', 'Culture', 'Économie', 'Recrutement'])
const categorieActive = ref('Toutes')
const recherche = ref('')

const actualitesVedette = computed(() =>
  actualites.value.filter(a => a.estVedette)
)

const actualitesFiltrees = computed(() =>
  actualites.value.filter(a => !a.estVedette)
)
</script>

<style scoped>
.line-clamp-2 {
  display: -webkit-box;
  -webkit-line-clamp: 2;
  -webkit-box-orient: vertical;
  overflow: hidden;
}
</style>
