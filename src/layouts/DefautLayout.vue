<template>
  <!-- Coquille de tableau de bord : la fenetre ne defile pas, seul le panneau
       de contenu le fait. La barre laterale garde ainsi toute la hauteur et la
       barre de titre reste visible, quelle que soit la longueur de la page. -->
  <div class="h-screen overflow-hidden bg-gray-100">
    <!-- Sidebar -->
    <Sidebar @toggle="handleSidebarToggle" />

    <!-- Contenu principal avec navbar -->
    <div
      style="--hauteur-barre: 66px"
      :class="[
        'h-screen overflow-y-auto transition-all duration-300',
        isSidebarCollapsed ? 'ml-20' : 'ml-72',
      ]"
    >
      <!-- Navbar -->
      <!-- Hauteur fixe et assumee : les en-tetes de tableau collants s'y
           alignent (`top-[var(--hauteur-barre)]`). Sans hauteur connue, ils se
           calent derriere cette barre et disparaissent au defilement. -->
      <nav
        class="bg-white shadow-md sticky top-0 z-[999] h-[var(--hauteur-barre)] flex items-center"
      >
        <div class="w-full px-6">
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
                <i
                  class="bx bx-search absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400"
                ></i>
                <input
                  type="text"
                  placeholder="Rechercher..."
                  class="pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-secondary focus:border-secondary w-64"
                />
              </div>

              <!-- Notifications -->
              <div class="relative">
                <button @click="toggleNotifications" class="relative">
                  <i
                    class="bx bx-bell text-2xl text-gray-600 hover:text-primary transition-colors"
                  ></i>
                  <span
                    class="absolute -top-1 -right-1 bg-red-600 text-white text-xs rounded-full w-4 h-4 flex items-center justify-center"
                    >3</span
                  >
                </button>

                <!-- Dropdown notifications -->
                <div
                  v-if="showNotifications"
                  class="absolute right-0 mt-2 w-80 bg-white rounded-lg shadow-xl z-50"
                >
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
                  <i
                    class="bx bx-envelope text-2xl text-gray-600 hover:text-primary transition-colors"
                  ></i>
                  <span
                    class="absolute -top-1 -right-1 bg-secondary text-ink-dark text-xs rounded-full w-4 h-4 flex items-center justify-center"
                    >2</span
                  >
                </button>

                <!-- Dropdown messages -->
                <div
                  v-if="showMessages"
                  class="absolute right-0 mt-2 w-80 bg-white rounded-lg shadow-xl z-50"
                >
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
                    :src="avatarDefaut"
                    alt="Avatar"
                    class="w-10 h-10 rounded-full object-cover"
                  />
                  <!-- Le nom et l'adresse de la personne connectee, jamais
                       ceux d'un compte ecrit en dur : l'adresse placee ici
                       etait celle d'un administrateur guineen, affichee a
                       toutes les ambassades. -->
                  <div class="hidden lg:block text-left">
                    <p class="text-sm font-medium text-gray-800">
                      {{ auth.utilisateur?.name || 'Administrateur' }}
                    </p>
                    <p v-if="auth.utilisateur?.email" class="text-xs text-gray-500">
                      {{ auth.utilisateur.email }}
                    </p>
                  </div>
                  <i class="bx bx-chevron-down text-gray-600"></i>
                </button>

                <!-- Dropdown profil -->
                <div
                  v-if="showProfile"
                  class="absolute right-0 mt-2 w-48 bg-white rounded-lg shadow-xl z-50"
                >
                  <!--
                    « Mon profil » est revenu avec les vraies routes de
                    compte, livrees le 2026-09-17. L'ecran qu'il ouvrait
                    auparavant affichait « John Doe » en dur et proposait un
                    changement de mot de passe qui n'envoyait rien a
                    personne.

                    « Parametres » pointait sur ce meme ecran alors que
                    l'ambassade en a un vrai : il mene desormais ou son
                    intitule le promet.
                  -->
                  <router-link
                    to="/dashboard/profil"
                    class="flex items-center gap-3 px-4 py-2 text-sm text-gray-700 hover:bg-gray-100"
                  >
                    <i class="bx bx-user"></i>
                    <span>Mon profil</span>
                  </router-link>
                  <router-link
                    to="/dashboard/parametres"
                    class="flex items-center gap-3 px-4 py-2 text-sm text-gray-700 hover:bg-gray-100"
                  >
                    <i class="bx bx-cog"></i>
                    <span>Paramètres</span>
                  </router-link>
                  <hr class="my-1" />
                  <button
                    @click="deconnexion"
                    class="w-full flex items-center gap-3 px-4 py-2 text-sm text-red-600 hover:bg-gray-100"
                  >
                    <i class="bx bx-log-out"></i>
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
import avatarDefaut from '@/assets/avatar-defaut.svg'
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

/**
 * Le titre et l'icone de la barre, par chemin.
 *
 * Les deux tables etaient indexees sur des chemins `/admin/...` qui n'existent
 * dans aucune route : le tableau de bord affichait donc « Administration » et
 * l'icone par defaut sur chacune de ses pages. Une seule table, indexee sur
 * les chemins reels, evite qu'elles divergent — et les entrees d'ecrans
 * supprimes en 2026 sont parties avec eux.
 */
const RUBRIQUES = {
  '/dashboard': { titre: 'Tableau de bord', icone: 'bx bxs-dashboard' },
  '/dashboard/contenu-accueil': { titre: "Contenu de l'accueil", icone: 'bx bxs-home-heart' },
  '/dashboard/services': { titre: 'Services consulaires', icone: 'bx bxs-briefcase' },
  '/dashboard/annuaire': { titre: 'Annuaire', icone: 'bx bxs-contact' },
  '/dashboard/parametres': { titre: "Paramètres de l'ambassade", icone: 'bx bxs-cog' },
  '/dashboard/utilisateurs': { titre: 'Utilisateurs', icone: 'bx bxs-group' },
  '/dashboard/jours-feries': { titre: 'Jours fériés', icone: 'bx bxs-calendar-star' },
  '/dashboard/articles': { titre: 'Articles', icone: 'bx bxs-news' },
  '/dashboard/profil': { titre: 'Mon profil', icone: 'bx bxs-user-circle' },
  '/dashboard/rendez-vous': { titre: 'Rendez-vous', icone: 'bx bx-calendar-check' },
}

/**
 * Les evenements portent des chemins a identifiant (`/dashboard/evenements/
 * fete-nationale/presence`) : une table exacte ne pourrait pas les nommer, et
 * le prefixe suffit.
 */
const rubrique = computed(() => {
  if (route.path.startsWith('/dashboard/evenements')) {
    return { titre: 'Evènements', icone: 'bx bx-calendar-event' }
  }
  return RUBRIQUES[route.path] ?? { titre: 'Administration', icone: 'bx bxs-dashboard' }
})

const currentPageTitle = computed(() => rubrique.value.titre)
const currentPageIcon = computed(() => rubrique.value.icone)

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
