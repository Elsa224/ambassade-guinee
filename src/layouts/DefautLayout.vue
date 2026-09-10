<template>
  <div class="min-h-screen bg-gray-100">
    <!-- Sidebar -->
    <Sidebar @toggle="handleSidebarToggle" />

    <!-- Contenu principal avec navbar -->
    <div :class="['transition-all duration-300', isSidebarCollapsed ? 'ml-20' : 'ml-72']">
      <!-- Navbar -->
      <nav class="bg-white shadow-md sticky top-0 z-[999]">
        <div class="px-6 py-3">
          <div class="flex items-center justify-between">
            <!-- Titre de la page dynamique -->
            <div class="flex items-center gap-3">
              <i :class="currentPageIcon" class="text-2xl text-primary"></i>
              <h1 class="text-xl font-semibold text-gray-800">{{ currentPageTitle }}</h1>
            </div>

            <!-- Actions de la navbar -->
            <div class="flex items-center gap-4">
              <!-- Recherche -->
              <div class="relative hidden md:block">
                <i class='bx bx-search absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400'></i>
                <input
                  type="text"
                  placeholder="Rechercher..."
                  class="pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-secondary focus:border-secondary w-64"
                >
              </div>

              <!-- Notifications -->
              <div class="relative">
                <button @click="toggleNotifications" class="relative">
                  <i class='bx bx-bell text-2xl text-gray-600 hover:text-primary transition-colors'></i>
                  <span class="absolute -top-1 -right-1 bg-red-600 text-white text-xs rounded-full w-4 h-4 flex items-center justify-center">3</span>
                </button>

                <!-- Dropdown notifications -->
                <div v-if="showNotifications" class="absolute right-0 mt-2 w-80 bg-white rounded-lg shadow-xl z-50">
                  <div class="p-3 border-b border-gray-200">
                    <h3 class="font-semibold text-gray-800">Notifications</h3>
                  </div>
                  <div class="max-h-96 overflow-y-auto">
                    <div class="p-3 hover:bg-gray-50 cursor-pointer">
                      <p class="text-sm text-gray-600">Nouvel article publié</p>
                      <p class="text-xs text-gray-400 mt-1">Il y a 5 minutes</p>
                    </div>
                    <div class="p-3 hover:bg-gray-50 cursor-pointer">
                      <p class="text-sm text-gray-600">Nouveau commentaire</p>
                      <p class="text-xs text-gray-400 mt-1">Il y a 1 heure</p>
                    </div>
                  </div>
                </div>
              </div>

              <!-- Messages -->
              <div class="relative hidden sm:block">
                <button @click="toggleMessages" class="relative">
                  <i class='bx bx-envelope text-2xl text-gray-600 hover:text-primary transition-colors'></i>
                  <span class="absolute -top-1 -right-1 bg-secondary text-primary text-xs rounded-full w-4 h-4 flex items-center justify-center">2</span>
                </button>

                <!-- Dropdown messages -->
                <div v-if="showMessages" class="absolute right-0 mt-2 w-80 bg-white rounded-lg shadow-xl z-50">
                  <div class="p-3 border-b border-gray-200">
                    <h3 class="font-semibold text-gray-800">Messages</h3>
                  </div>
                  <div class="max-h-96 overflow-y-auto">
                    <div class="p-3 hover:bg-gray-50 cursor-pointer">
                      <p class="text-sm font-medium text-gray-800">Administrateur</p>
                      <p class="text-xs text-gray-500">Bienvenue sur votre dashboard</p>
                    </div>
                  </div>
                </div>
              </div>

              <!-- Profil -->
              <div class="relative">
                <button @click="toggleProfile" class="flex items-center gap-2">
                  <img
                    src="https://via.placeholder.com/40"
                    alt="Avatar"
                    class="w-10 h-10 rounded-full object-cover"
                  >
                  <div class="hidden lg:block text-left">
                    <p class="text-sm font-medium text-gray-800">Administrateur</p>
                    <p class="text-xs text-gray-500">admin@ambaguinee.org</p>
                  </div>
                  <i class='bx bx-chevron-down text-gray-600'></i>
                </button>

                <!-- Dropdown profil -->
                <div v-if="showProfile" class="absolute right-0 mt-2 w-48 bg-white rounded-lg shadow-xl z-50">
                  <router-link to="/admin/profil" class="flex items-center gap-3 px-4 py-2 text-sm text-gray-700 hover:bg-gray-100">
                    <i class='bx bx-user'></i>
                    <span>Mon profil</span>
                  </router-link>
                  <router-link to="/admin/parametres" class="flex items-center gap-3 px-4 py-2 text-sm text-gray-700 hover:bg-gray-100">
                    <i class='bx bx-cog'></i>
                    <span>Paramètres</span>
                  </router-link>
                  <hr class="my-1">
                  <button @click="deconnexion" class="w-full flex items-center gap-3 px-4 py-2 text-sm text-red-600 hover:bg-gray-100">
                    <i class='bx bx-log-out'></i>
                    <span>Déconnexion</span>
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      </nav>

      <!-- Contenu de la page -->
      <main class="p-6">
        <router-view />
      </main>
    </div>
  </div>
</template>

<script setup>
import { ref, computed, onMounted, onUnmounted } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import Sidebar from '@/components/Sidebar.vue'
import { useAuthStore } from '@/stores/auth'

const route = useRoute()
const router = useRouter()
const auth = useAuthStore()
const isSidebarCollapsed = ref(false)
const showNotifications = ref(false)
const showMessages = ref(false)
const showProfile = ref(false)

// Titre dynamique selon la page
const currentPageTitle = computed(() => {
  const titles = {
    '/admin/dashboard': 'Tableau de bord',
    '/admin/articles': 'Gestion des articles',
    '/admin/actualites': 'Gestion des actualités',
    '/admin/photos': 'Galerie photos',
    '/admin/nouvelles': 'Nouvelles',
    '/admin/categories': 'Catégories',
    '/admin/commentaires': 'Commentaires',
    '/admin/utilisateurs': 'Utilisateurs',
    '/admin/parametres': 'Paramètres',
    '/admin/profil': 'Mon profil'
  }
  return titles[route.path] || 'Administration'
})

// Icône dynamique selon la page
const currentPageIcon = computed(() => {
  const icons = {
    '/admin/dashboard': 'bx bxs-dashboard',
    '/admin/articles': 'bx bxs-news',
    '/admin/actualites': 'bx bxs-megaphone',
    '/admin/photos': 'bx bxs-image',
    '/admin/nouvelles': 'bx bxs-bell',
    '/admin/categories': 'bx bxs-category',
    '/admin/commentaires': 'bx bxs-chat',
    '/admin/utilisateurs': 'bx bxs-user',
    '/admin/parametres': 'bx bxs-cog',
    '/admin/profil': 'bx bxs-user-circle'
  }
  return icons[route.path] || 'bx bxs-dashboard'
})

const handleSidebarToggle = (collapsed) => {
  isSidebarCollapsed.value = collapsed
}

const toggleNotifications = () => {
  showNotifications.value = !showNotifications.value
  showMessages.value = false
  showProfile.value = false
}

const toggleMessages = () => {
  showMessages.value = !showMessages.value
  showNotifications.value = false
  showProfile.value = false
}

const toggleProfile = () => {
  showProfile.value = !showProfile.value
  showNotifications.value = false
  showMessages.value = false
}

const deconnexion = async () => {
  await auth.logout()
  await router.push('/connexion')
}

// Fermer les dropdowns quand on clique ailleurs
const handleClickOutside = (event) => {
  if (!event.target.closest('.relative')) {
    showNotifications.value = false
    showMessages.value = false
    showProfile.value = false
  }
}

onMounted(() => {
  window.addEventListener('click', handleClickOutside)
})

onUnmounted(() => {
  window.removeEventListener('click', handleClickOutside)
})
</script>
