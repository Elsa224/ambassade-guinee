<template>
  <aside
    :class="[
      'fixed left-0 top-0 h-full bg-gradient-to-b from-primary to-primary-dark text-white shadow-xl flex flex-col transition-all duration-300 z-[1000]',
      isCollapsed ? 'w-20' : 'w-72'
    ]"
  >
    <!-- Bouton toggle -->
    <button
      @click="toggleSidebar"
      class="absolute -right-3 top-20 bg-secondary text-primary rounded-full p-1 cursor-pointer shadow-lg transition-all duration-300 hover:scale-110 z-10"
    >
      <i :class="isCollapsed ? 'bx bx-menu' : 'bx bx-menu-alt-left'" class="text-xl"></i>
    </button>

    <!-- Logo -->
    <div class="py-6 px-5 border-b border-white/10 mb-5">
      <router-link to="/" class="flex flex-col items-center gap-2 no-underline">
        <img
          :src="logo1"
          alt="Logo"
          :class="[
            'object-contain transition-all duration-300',
            isCollapsed ? 'w-12' : 'w-20'
          ]"
        />
      </router-link>
    </div>

    <!-- Navigation -->
    <nav class="flex-1 flex flex-col gap-1 px-3 overflow-y-auto">

      <!-- ========== GROUPE ADMIN ========== -->
      <div>
        <div
          @click="toggleAdmin"
          class="flex items-center justify-between px-4 py-3 rounded-xl cursor-pointer transition-all duration-300 text-white hover:bg-yellow-500/20 hover:text-secondary"
        >
          <div class="flex items-center gap-3">
            <i class='bx bx-user-circle text-xl flex-shrink-0'></i>
            <span v-if="!isCollapsed" class="font-medium text-sm">Admin</span>
          </div>
          <i
            v-if="!isCollapsed"
            :class="isAdminOpen ? 'bx bx-chevron-down' : 'bx bx-chevron-right'"
            class="text-xl transition-transform duration-300"
          ></i>
        </div>

        <div v-show="isAdminOpen" class="ml-2 flex flex-col gap-1">
          <router-link
            to="/dashboard"
            class="flex items-center gap-3 px-4 py-2 rounded-xl text-white no-underline transition-all duration-300 text-sm font-medium hover:bg-yellow-500/20 hover:text-secondary hover:translate-x-1"
            active-class="!bg-secondary !text-primary"
          >
            <i class='bx bxs-dashboard text-xl flex-shrink-0'></i>
            <span v-if="!isCollapsed">Tableau de bord</span>
          </router-link>

          <router-link
            to="/dashboard/articles"
            class="flex items-center gap-3 px-4 py-2 rounded-xl text-white no-underline transition-all duration-300 text-sm font-medium hover:bg-yellow-500/20 hover:text-secondary hover:translate-x-1"
            active-class="!bg-secondary !text-primary"
          >
            <i class='bx bxs-news text-xl flex-shrink-0'></i>
            <span v-if="!isCollapsed">Articles</span>
          </router-link>

          <router-link
            to="/dashboard/actualites"
            class="flex items-center gap-3 px-4 py-2 rounded-xl text-white no-underline transition-all duration-300 text-sm font-medium hover:bg-yellow-500/20 hover:text-secondary hover:translate-x-1"
            active-class="!bg-secondary !text-primary"
          >
            <i class='bx bxs-megaphone text-xl flex-shrink-0'></i>
            <span v-if="!isCollapsed">Actualités</span>
          </router-link>

          <router-link
            to="/dashboard/galerie"
            class="flex items-center gap-3 px-4 py-2 rounded-xl text-white no-underline transition-all duration-300 text-sm font-medium hover:bg-yellow-500/20 hover:text-secondary hover:translate-x-1"
            active-class="!bg-secondary !text-primary"
          >
            <i class='bx bxs-image text-xl flex-shrink-0'></i>
            <span v-if="!isCollapsed">Galerie photos</span>
          </router-link>

          <router-link
            to="/dashboard/nouvelles"
            class="flex items-center gap-3 px-4 py-2 rounded-xl text-white no-underline transition-all duration-300 text-sm font-medium hover:bg-yellow-500/20 hover:text-secondary hover:translate-x-1"
            active-class="!bg-secondary !text-primary"
          >
            <i class='bx bxs-bell text-xl flex-shrink-0'></i>
            <span v-if="!isCollapsed">Nouvelles</span>
          </router-link>

          <!-- Lien Site Internet (pour retourner au site public) -->
          <router-link
            to="/"
            class="flex items-center gap-3 px-4 py-2 rounded-xl text-white no-underline transition-all duration-300 text-sm font-medium hover:bg-yellow-500/20 hover:text-secondary hover:translate-x-1"
            active-class="!bg-secondary !text-primary"
          >
            <i class='bx bx-globe text-xl flex-shrink-0'></i>
            <span v-if="!isCollapsed">Site Internet</span>
          </router-link>
        </div>
      </div>

      <!-- ========== GROUPE AMBASSADESECURE ========== -->
      <div>
        <div
          @click="toggleAmbassade"
          class="flex items-center justify-between px-4 py-3 rounded-xl cursor-pointer transition-all duration-300 text-white hover:bg-yellow-500/20 hover:text-secondary"
        >
          <div class="flex items-center gap-3">
            <i class='bx bx-shield text-xl flex-shrink-0'></i>
            <span v-if="!isCollapsed" class="font-medium text-sm">Ambassade Secure</span>
          </div>
          <i
            v-if="!isCollapsed"
            :class="isAmbassadeOpen ? 'bx bx-chevron-down' : 'bx bx-chevron-right'"
            class="text-xl transition-transform duration-300"
          ></i>
        </div>

        <div v-show="isAmbassadeOpen" class="ml-2 flex flex-col gap-1">

          <router-link
            to="/dashboard/utilisateurs"
            class="flex items-center gap-3 px-4 py-2 rounded-xl text-white no-underline transition-all duration-300 text-sm font-medium hover:bg-yellow-500/20 hover:text-secondary hover:translate-x-1"
            active-class="!bg-secondary !text-primary"
          >
            <i class='bx bx-user text-xl flex-shrink-0'></i>
            <span v-if="!isCollapsed">Utilisateurs</span>
          </router-link>

          <router-link
            to="/dashboard/scanner"
            class="flex items-center gap-3 px-4 py-2 rounded-xl text-white no-underline transition-all duration-300 text-sm font-medium hover:bg-yellow-500/20 hover:text-secondary hover:translate-x-1"
            active-class="!bg-secondary !text-primary"
          >
            <i class='bx bx-qr-scan text-xl flex-shrink-0'></i>
            <span v-if="!isCollapsed">Scanner QR Code</span>
          </router-link>

          <router-link
            to="/dashboard/evenement"
            class="flex items-center gap-3 px-4 py-2 rounded-xl text-white no-underline transition-all duration-300 text-sm font-medium hover:bg-yellow-500/20 hover:text-secondary hover:translate-x-1"
            active-class="!bg-secondary !text-primary"
          >
            <i class='bx bx-calendar-event text-xl flex-shrink-0'></i>
            <span v-if="!isCollapsed">Evènements</span>
          </router-link>

          <router-link
            to="/dashboard/visiteur"
            class="flex items-center gap-3 px-4 py-2 rounded-xl text-white no-underline transition-all duration-300 text-sm font-medium hover:bg-yellow-500/20 hover:text-secondary hover:translate-x-1"
            active-class="!bg-secondary !text-primary"
          >
            <i class='bx bx-list-ul text-xl flex-shrink-0'></i>
            <span v-if="!isCollapsed">Liste des visiteurs</span>
          </router-link>

          <router-link
            to="/dashboard/demande"
            class="flex items-center gap-3 px-4 py-2 rounded-xl text-white no-underline transition-all duration-300 text-sm font-medium hover:bg-yellow-500/20 hover:text-secondary hover:translate-x-1"
            active-class="!bg-secondary !text-primary"
          >
            <i class='bx bx-envelope text-xl flex-shrink-0'></i>
            <span v-if="!isCollapsed">Demande</span>
          </router-link>

          <router-link
            to="/dashboard/presence"
            class="flex items-center gap-3 px-4 py-2 rounded-xl text-white no-underline transition-all duration-300 text-sm font-medium hover:bg-yellow-500/20 hover:text-secondary hover:translate-x-1"
            active-class="!bg-secondary !text-primary"
          >
            <i class='bx bx-check-square text-xl flex-shrink-0'></i>
            <span v-if="!isCollapsed">Liste de présence</span>
          </router-link>

          <router-link
            to="/dashboard/cartes/liste"
            class="flex items-center gap-3 px-4 py-2 rounded-xl text-white no-underline transition-all duration-300 text-sm font-medium hover:bg-yellow-500/20 hover:text-secondary hover:translate-x-1"
            active-class="!bg-secondary !text-primary"
          >
            <i class='bx bx-id-card text-xl flex-shrink-0'></i>
            <span v-if="!isCollapsed">Carte de membre</span>
          </router-link>

          <router-link
            to="/dashboard/courriers/liste"
            class="flex items-center gap-3 px-4 py-2 rounded-xl text-white no-underline transition-all duration-300 text-sm font-medium hover:bg-yellow-500/20 hover:text-secondary hover:translate-x-1"
            active-class="!bg-secondary !text-primary"
          >
            <i class='bx bx-mail-send text-xl flex-shrink-0'></i>
            <span v-if="!isCollapsed">Liste de courriers</span>
          </router-link>

          <router-link
            to="/dashboard/taches"
            class="flex items-center gap-3 px-4 py-2 rounded-xl text-white no-underline transition-all duration-300 text-sm font-medium hover:bg-yellow-500/20 hover:text-secondary hover:translate-x-1"
            active-class="!bg-secondary !text-primary"
          >
            <i class='bx bx-task text-xl flex-shrink-0'></i>
            <span v-if="!isCollapsed">Tâches</span>
          </router-link>

          <router-link
            to="/dashboard/projets/liste"
            class="flex items-center gap-3 px-4 py-2 rounded-xl text-white no-underline transition-all duration-300 text-sm font-medium hover:bg-yellow-500/20 hover:text-secondary hover:translate-x-1"
            active-class="!bg-secondary !text-primary"
          >
            <i class='bx bx-folder text-xl flex-shrink-0'></i>
            <span v-if="!isCollapsed">Projets</span>
          </router-link>

          <router-link
            to="/dashboard/documents"
            class="flex items-center gap-3 px-4 py-2 rounded-xl text-white no-underline transition-all duration-300 text-sm font-medium hover:bg-yellow-500/20 hover:text-secondary hover:translate-x-1"
            active-class="!bg-secondary !text-primary"
          >
            <i class='bx bx-file text-xl flex-shrink-0'></i>
            <span v-if="!isCollapsed">Documents</span>
          </router-link>

        </div>
      </div>

    </nav>

    <!-- Déconnexion -->
    <div class="p-5 border-t border-white/10 mt-auto">
      <button
        @click="deconnexion"
        class="w-full flex items-center gap-3 px-4 py-3 rounded-xl bg-red-600/20 text-red-300 border border-red-600/50 cursor-pointer transition-all duration-300 text-sm font-medium hover:bg-red-600 hover:text-white hover:border-red-600"
      >
        <i class='bx bx-log-out-circle text-xl'></i>
        <span v-if="!isCollapsed">Déconnexion</span>
      </button>
    </div>
  </aside>
</template>

<script setup>
import { ref } from 'vue'
import { useRouter } from 'vue-router'
import { useAuthStore } from '@/stores/auth'
import logo1 from '@/assets/images/logo.png'

const router = useRouter()
const auth = useAuthStore()
const isCollapsed = ref(false)

// État d'ouverture des groupes
const isAdminOpen = ref(true)      // ouvert par défaut
const isAmbassadeOpen = ref(true)  // ouvert par défaut

const toggleSidebar = () => {
  isCollapsed.value = !isCollapsed.value
  emit('toggle', isCollapsed.value)
}

const toggleAdmin = () => {
  if (!isCollapsed.value) isAdminOpen.value = !isAdminOpen.value
}

const toggleAmbassade = () => {
  if (!isCollapsed.value) isAmbassadeOpen.value = !isAmbassadeOpen.value
}

const emit = defineEmits(['toggle'])

const deconnexion = async () => {
  await auth.logout()
  await router.push('/connexion')
}
</script>

<style scoped>
.overflow-y-auto::-webkit-scrollbar {
  width: 4px;
}

.overflow-y-auto::-webkit-scrollbar-track {
  background: var(--color-primary-dark);
  border-radius: 4px;
}

.overflow-y-auto::-webkit-scrollbar-thumb {
  background: var(--color-secondary);
  border-radius: 4px;
}

/* Animation du chevron */
.bx-chevron-down,
.bx-chevron-right {
  transition: transform 0.3s ease;
}
</style>
