<template>
  <div class="min-h-screen bg-gray-50">
    <!-- Hero section de la page actualités -->
    <section class="relative bg-gradient-to-r from-primary to-primary-dark py-16 lg:py-24">
      <div class="absolute inset-0 overflow-hidden">
        <div class="absolute inset-0 bg-black/20"></div>
        <svg class="absolute  left-0 right-0 top-40" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 1440 320">
          <path fill="#ffffff" fill-opacity="1" d="M0,96L48,112C96,128,192,160,288,160C384,160,480,128,576,122.7C672,117,768,139,864,154.7C960,171,1056,181,1152,170.7C1248,160,1344,128,1392,112L1440,96L1440,320L1392,320C1344,320,1248,320,1152,320C1056,320,960,320,864,320C768,320,672,320,576,320C480,320,384,320,288,320C192,320,96,320,48,320L0,320Z"></path>
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
              @click="selectedCategorie = 'tous'"
              class="px-4 py-2 rounded-full text-sm font-semibold transition-all"
              :class="selectedCategorie === 'tous' ? 'bg-primary text-white' : 'bg-gray-100 text-gray-700 hover:bg-secondary hover:text-primary'"
            >
              Toutes
            </button>
            <button
              v-for="categorie in categories"
              :key="categorie.id"
              @click="selectedCategorie = categorie.id"
              class="px-4 py-2 rounded-full text-sm font-semibold transition-all"
              :class="selectedCategorie === categorie.id ? categorie.color + ' text-white' : 'bg-gray-100 text-gray-700 hover:bg-secondary hover:text-primary'"
            >
              {{ categorie.nom }}
            </button>
          </div>

          <!-- Barre de recherche -->
          <div class="relative w-full lg:w-96">
            <input
              type="text"
              v-model="searchQuery"
              placeholder="Rechercher une actualité..."
              class="w-full px-4 py-2 pl-10 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent"
            >
            <i class='bx bx-search absolute left-3 top-1/2 -translate-y-1/2 text-gray-400'></i>
          </div>
        </div>
      </div>
    </section>

    <!-- Section actualités principales -->
    <section class="py-12">
      <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <!-- Actualité à la une -->
        <div v-if="actualiteUne" class="mb-16">
          <div class="bg-white rounded-3xl shadow-2xl overflow-hidden transform hover:-translate-y-2 transition-all duration-500">
            <div class="grid grid-cols-1 lg:grid-cols-2">
              <div class="h-80 lg:h-auto overflow-hidden">
                <img :src="actualiteUne.image" :alt="actualiteUne.titre" class="w-full h-full object-cover hover:scale-110 transition-transform duration-700">
              </div>
              <div class="p-8 lg:p-12 flex flex-col justify-center">
                <div class="flex items-center gap-3 mb-4">
                  <span class="px-3 py-1 rounded-full text-sm font-semibold" :class="getCategorieColor(actualiteUne.categorie)">
                    {{ getCategorieNom(actualiteUne.categorie) }}
                  </span>
                  <span class="text-sm text-gray-500 flex items-center gap-1">
                    <i class='bx bx-calendar'></i>
                    {{ formatDate(actualiteUne.date) }}
                  </span>
                </div>
                <h2 class="text-3xl lg:text-4xl font-bold text-primary mb-4">{{ actualiteUne.titre }}</h2>
                <p class="text-gray-600 text-lg mb-6">{{ actualiteUne.description }}</p>
                <div class="flex items-center justify-between">
                  <router-link
                    to="/actualite"
                    class="inline-flex items-center gap-2 bg-secondary text-primary px-6 py-3 rounded-lg font-semibold hover:bg-primary hover:text-white transition-all group"
                  >
                    Lire l'article complet
                    <i class='bx bx-right-arrow-alt text-xl group-hover:translate-x-2 transition-transform'></i>
                  </router-link>
                  <div class="flex items-center gap-2 text-sm text-gray-500">
                    <i class='bx bx-show'></i>
                    <span>{{ actualiteUne.vues }} vues</span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>

        <!-- Grille des actualités -->
        <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          <div
            v-for="actualite in actualitesFiltrees"
            :key="actualite.id"
            class="bg-white rounded-2xl shadow-lg overflow-hidden transform hover:-translate-y-2 transition-all duration-300 hover:shadow-2xl"
          >
            <div class="relative h-56 overflow-hidden">
              <img :src="actualite.image" :alt="actualite.titre" class="w-full h-full object-cover hover:scale-110 transition-transform duration-500">
              <div class="absolute top-4 left-4 flex gap-2">
                <span class="px-3 py-1 rounded-full text-xs font-semibold" :class="getCategorieColor(actualite.categorie)">
                  {{ getCategorieNom(actualite.categorie) }}
                </span>
              </div>
              <div class="absolute top-4 right-4">
                <button @click="toggleLike(actualite.id)" class="bg-white/90 hover:bg-white p-2 rounded-full transition-all">
                  <i class='bx bx-heart text-red-500' :class="{ 'bxs-heart': actualite.liked }"></i>
                </button>
              </div>
            </div>

            <div class="p-6">
              <div class="flex items-center gap-2 text-sm text-gray-500 mb-3">
                <i class='bx bx-calendar'></i>
                <span>{{ formatDate(actualite.date) }}</span>
                <span class="mx-2">•</span>
                <i class='bx bx-time'></i>
                <span>{{ actualite.tempsLecture }} min</span>
              </div>

              <h3 class="font-bold text-xl mb-3 text-primary hover:text-accent transition-colors">
                <router-link to="/actualite">{{ actualite.titre }}</router-link>
              </h3>

              <p class="text-gray-600 text-sm mb-4 line-clamp-2">{{ actualite.description }}</p>

              <div class="flex items-center justify-between">
                <router-link
                  to="/actualite"
                  class="text-accent font-semibold inline-flex items-center gap-1 hover:gap-2 transition-all group"
                >
                  Lire la suite
                  <i class='bx bx-right-arrow-alt group-hover:translate-x-1 transition-transform'></i>
                </router-link>

                <div class="flex items-center gap-3 text-sm text-gray-500">
                  <button @click="toggleLike(actualite.id)" class="flex items-center gap-1 hover:text-red-500 transition-colors">
                    <i class='bx bx-heart' :class="{ 'bxs-heart text-red-500': actualite.liked }"></i>
                    <span>{{ actualite.likes }}</span>
                  </button>
                  <button class="flex items-center gap-1 hover:text-primary transition-colors">
                    <i class='bx bx-share-alt'></i>
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>

        <!-- Message si aucune actualité -->
        <div v-if="actualitesFiltrees.length === 0" class="text-center py-20">
          <div class="text-6xl mb-4">📰</div>
          <h3 class="text-2xl font-bold text-gray-700 mb-2">Aucune actualité trouvée</h3>
          <p class="text-gray-500">Essayez de modifier vos filtres ou votre recherche</p>
        </div>

        <!-- Pagination -->
        <div class="mt-12 flex justify-center">
          <nav class="flex items-center gap-2">
            <button
              @click="pageCourante--"
              :disabled="pageCourante === 1"
              class="w-10 h-10 rounded-lg border border-gray-300 flex items-center justify-center hover:bg-secondary hover:text-primary transition-colors disabled:opacity-50 disabled:hover:bg-transparent"
            >
              <i class='bx bx-chevron-left'></i>
            </button>

            <button
              v-for="page in pagesTotales"
              :key="page"
              @click="pageCourante = page"
              class="w-10 h-10 rounded-lg font-semibold transition-all"
              :class="pageCourante === page ? 'bg-primary text-white' : 'border border-gray-300 hover:bg-secondary hover:text-primary'"
            >
              {{ page }}
            </button>

            <button
              @click="pageCourante++"
              :disabled="pageCourante === pagesTotales"
              class="w-10 h-10 rounded-lg border border-gray-300 flex items-center justify-center hover:bg-secondary hover:text-primary transition-colors disabled:opacity-50 disabled:hover:bg-transparent"
            >
              <i class='bx bx-chevron-right'></i>
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

        <form @submit.prevent="subscribeNewsletter" class="flex flex-col sm:flex-row gap-4 max-w-lg mx-auto">
          <input
            type="email"
            v-model="email"
            placeholder="Votre adresse email"
            class="flex-1 px-6 py-4 rounded-lg focus:outline-none focus:ring-2 focus:ring-secondary text-gray-800"
            required
          >
          <button
            type="submit"
            class="bg-secondary text-primary px-8 py-4 rounded-lg font-semibold hover:bg-white transition-all whitespace-nowrap flex items-center justify-center gap-2"
          >
            S'abonner
            <i class='bx bx-send'></i>
          </button>
        </form>

        <p class="text-white/70 text-sm mt-4">
          En vous abonnant, vous acceptez de recevoir nos actualités. Vous pourrez vous désabonner à tout moment.
        </p>
      </div>
    </section>
  </div>
</template>

<script setup>
import { ref, computed } from 'vue'

// État pour les filtres et recherche
const selectedCategorie = ref('tous')
const searchQuery = ref('')
const pageCourante = ref(1)
const articlesParPage = 6
const email = ref('')

// Catégories disponibles
const categories = [
  { id: 'ambassade', nom: 'Ambassade', color: 'bg-primary' },
  { id: 'diplomatie', nom: 'Diplomatie', color: 'bg-accent' },
  { id: 'economie', nom: 'Économie', color: 'bg-secondary text-primary' },
  { id: 'culture', nom: 'Culture', color: 'bg-purple-600' },
  { id: 'communique', nom: 'Communiqué', color: 'bg-gray-700' },
  { id: 'evenement', nom: 'Événement', color: 'bg-blue-600' }
]

// Données simulées des actualités
const toutesActualites = ref([
  {
    id: 1,
    titre: "Rencontre diplomatique entre la Guinée et les États-Unis",
    description: "L'ambassadeur S.E. Madame Sidibé Fatoumata KABA a été reçue par le secrétaire d'État américain pour discuter du renforcement de la coopération bilatérale entre nos deux pays.",
    image: new URL('@/assets/images/vision.webp', import.meta.url).href,
    date: '2024-03-15',
    categorie: 'diplomatie',
    tempsLecture: 3,
    vues: 1245,
    likes: 89,
    liked: false
  },
  {
    id: 2,
    titre: "Célébration de la Journée Internationale de la Femme à l'Ambassade",
    description: "Une cérémonie spéciale a été organisée pour honorer les femmes guinéennes et leur contribution au développement de notre pays.",
    image: new URL('@/assets/images/18474.webp', import.meta.url).href,
    date: '2024-03-10',
    categorie: 'ambassade',
    tempsLecture: 2,
    vues: 876,
    likes: 156,
    liked: false
  },
  {
    id: 3,
    titre: "Forum économique Guinée-États-Unis : Nouvelles opportunités d'investissement",
    description: "Plus de 200 investisseurs américains ont participé au forum visant à promouvoir les opportunités d'affaires en Guinée.",
    image: new URL('@/assets/images/partenariat.webp', import.meta.url).href,
    date: '2024-03-05',
    categorie: 'economie',
    tempsLecture: 4,
    vues: 2341,
    likes: 234,
    liked: false
  },
  {
    id: 4,
    titre: "Journée culturelle guinéenne à Washington",
    description: "La diaspora guinéenne s'est réunie pour célébrer la richesse culturelle de notre pays à travers la musique, la danse et la gastronomie.",
    image: new URL('@/assets/images/Cascade.webp', import.meta.url).href,
    date: '2024-02-28',
    categorie: 'culture',
    tempsLecture: 3,
    vues: 654,
    likes: 98,
    liked: false
  },
  {
    id: 5,
    titre: "Communiqué sur les nouvelles procédures de visa",
    description: "L'Ambassade informe ses ressortissants des changements concernant les procédures de demande de visa à compter du 1er avril 2024.",
    image: new URL('@/assets/images/partenaire.webp', import.meta.url).href,
    date: '2024-02-25',
    categorie: 'communique',
    tempsLecture: 2,
    vues: 4321,
    likes: 67,
    liked: false
  },
  {
    id: 6,
    titre: "Inauguration du nouveau centre culturel guinéen",
    description: "Un espace dédié à la promotion de la culture guinéenne a ouvert ses portes au cœur de Washington.",
    image: new URL('@/assets/images/infrastructure.webp', import.meta.url).href,
    date: '2024-02-20',
    categorie: 'culture',
    tempsLecture: 3,
    vues: 987,
    likes: 145,
    liked: false
  },
  {
    id: 7,
    titre: "Rencontre avec la communauté guinéenne de New York",
    description: "L'ambassadeur a rencontré les représentants de la communauté guinéenne pour échanger sur leurs préoccupations.",
    image: new URL('@/assets/images/8.webp', import.meta.url).href,
    date: '2024-02-15',
    categorie: 'ambassade',
    tempsLecture: 3,
    vues: 765,
    likes: 112,
    liked: false
  },
  {
    id: 8,
    titre: "Signature d'un accord de coopération éducative",
    description: "Un partenariat a été signé entre l'Ambassade et plusieurs universités américaines pour faciliter les échanges d'étudiants.",
    image: new URL('@/assets/images/demarcheconsulaire.webp', import.meta.url).href,
    date: '2024-02-10',
    categorie: 'diplomatie',
    tempsLecture: 4,
    vues: 543,
    likes: 78,
    liked: false
  },
  {
    id: 9,
    titre: "Célébration de l'indépendance de la Guinée",
    description: "La communauté guinéenne s'est rassemblée pour célébrer le 66ème anniversaire de l'indépendance de notre pays.",
    image: new URL('@/assets/images/hero1.webp', import.meta.url).href,
    date: '2024-02-05',
    categorie: 'evenement',
    tempsLecture: 3,
    vues: 1890,
    likes: 267,
    liked: false
  }
])

// Actualité à la une (la plus récente et importante)
const actualiteUne = computed(() => {
  return toutesActualites.value[0] // La première actualité
})

// Actualités filtrées (sans l'actualité à la une)
const actualitesFiltrees = computed(() => {
  let filtered = toutesActualites.value.slice(1) // Exclure l'actualité à la une

  // Filtre par catégorie
  if (selectedCategorie.value !== 'tous') {
    filtered = filtered.filter(a => a.categorie === selectedCategorie.value)
  }

  // Filtre par recherche
  if (searchQuery.value) {
    const query = searchQuery.value.toLowerCase()
    filtered = filtered.filter(a =>
      a.titre.toLowerCase().includes(query) ||
      a.description.toLowerCase().includes(query)
    )
  }

  // Pagination
  const debut = (pageCourante.value - 1) * articlesParPage
  return filtered.slice(debut, debut + articlesParPage)
})

// Nombre total de pages
const pagesTotales = computed(() => {
  let filtered = toutesActualites.value.slice(1)
  if (selectedCategorie.value !== 'tous') {
    filtered = filtered.filter(a => a.categorie === selectedCategorie.value)
  }
  if (searchQuery.value) {
    const query = searchQuery.value.toLowerCase()
    filtered = filtered.filter(a =>
      a.titre.toLowerCase().includes(query) ||
      a.description.toLowerCase().includes(query)
    )
  }
  return Math.ceil(filtered.length / articlesParPage)
})

// Fonctions utilitaires
const formatDate = (date) => {
  const options = { year: 'numeric', month: 'long', day: 'numeric' }
  return new Date(date).toLocaleDateString('fr-FR', options)
}

const getCategorieNom = (categorieId) => {
  const categorie = categories.find(c => c.id === categorieId)
  return categorie ? categorie.nom : categorieId
}

const getCategorieColor = (categorieId) => {
  const categorie = categories.find(c => c.id === categorieId)
  return categorie ? categorie.color : 'bg-gray-500 text-white'
}

const toggleLike = (id) => {
  const actualite = toutesActualites.value.find(a => a.id === id)
  if (actualite) {
    actualite.liked = !actualite.liked
    actualite.likes += actualite.liked ? 1 : -1
  }
}

const subscribeNewsletter = () => {
  // Logique d'abonnement à la newsletter
  alert(`Merci pour votre abonnement avec l'adresse : ${email.value}`)
  email.value = ''
}
</script>

<style scoped>
.line-clamp-2 {
  display: -webkit-box;
  -webkit-line-clamp: 2;
  -webkit-box-orient: vertical;
  overflow: hidden;
}
</style>
