<template>
  <aside
    :class="[
      'fixed left-0 top-0 h-full bg-gradient-to-b from-primary to-primary-dark text-white shadow-xl flex flex-col transition-all duration-300 z-[1000]',
      isCollapsed ? 'w-20' : 'w-72',
    ]"
  >
    <!-- Bouton toggle -->
    <button
      @click="toggleSidebar"
      class="absolute -right-3 top-20 bg-secondary text-ink-dark rounded-full p-1 cursor-pointer shadow-lg transition-all duration-300 hover:scale-110 z-10"
    >
      <i :class="isCollapsed ? 'bx bx-menu' : 'bx bx-menu-alt-left'" class="text-xl"></i>
    </button>

    <!-- Logo -->
    <div class="py-6 px-5 border-b border-white/10 mb-5">
      <router-link to="/" class="flex flex-col items-center gap-2 no-underline">
        <img
          v-if="logo"
          :src="logo"
          :alt="nomDeLAmbassade"
          :class="['object-contain transition-all duration-300', isCollapsed ? 'w-12' : 'w-20']"
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
            <i class="bx bx-user-circle text-xl flex-shrink-0"></i>
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
            :exact-active-class="LIEN_ACTIF"
          >
            <i class="bx bxs-dashboard text-xl flex-shrink-0"></i>
            <span v-if="!isCollapsed">Tableau de bord</span>
          </router-link>

          <router-link
            to="/dashboard/contenu-accueil"
            class="flex items-center gap-3 px-4 py-2 rounded-xl text-white no-underline transition-all duration-300 text-sm font-medium hover:bg-yellow-500/20 hover:text-secondary hover:translate-x-1"
            :active-class="LIEN_ACTIF"
          >
            <i class="bx bxs-home-heart text-xl flex-shrink-0"></i>
            <span v-if="!isCollapsed">Contenu de l'accueil</span>
          </router-link>

          <router-link
            to="/dashboard/services"
            class="flex items-center gap-3 px-4 py-2 rounded-xl text-white no-underline transition-all duration-300 text-sm font-medium hover:bg-yellow-500/20 hover:text-secondary hover:translate-x-1"
            :active-class="LIEN_ACTIF"
          >
            <i class="bx bxs-briefcase text-xl flex-shrink-0"></i>
            <span v-if="!isCollapsed">Services consulaires</span>
          </router-link>

          <router-link
            to="/dashboard/annuaire"
            class="flex items-center gap-3 px-4 py-2 rounded-xl text-white no-underline transition-all duration-300 text-sm font-medium hover:bg-yellow-500/20 hover:text-secondary hover:translate-x-1"
            :active-class="LIEN_ACTIF"
          >
            <i class="bx bxs-contact text-xl flex-shrink-0"></i>
            <span v-if="!isCollapsed">Annuaire</span>
          </router-link>

          <router-link
            to="/dashboard/parametres"
            class="flex items-center gap-3 px-4 py-2 rounded-xl text-white no-underline transition-all duration-300 text-sm font-medium hover:bg-yellow-500/20 hover:text-secondary hover:translate-x-1"
            :active-class="LIEN_ACTIF"
          >
            <i class="bx bxs-cog text-xl flex-shrink-0"></i>
            <span v-if="!isCollapsed">Paramètres</span>
          </router-link>

          <router-link
            to="/dashboard/jours-feries"
            class="flex items-center gap-3 px-4 py-2 rounded-xl text-white no-underline transition-all duration-300 text-sm font-medium hover:bg-yellow-500/20 hover:text-secondary hover:translate-x-1"
            :active-class="LIEN_ACTIF"
          >
            <i class="bx bxs-calendar-star text-xl flex-shrink-0"></i>
            <span v-if="!isCollapsed">Jours fériés</span>
          </router-link>

          <router-link
            to="/dashboard/articles"
            class="flex items-center gap-3 px-4 py-2 rounded-xl text-white no-underline transition-all duration-300 text-sm font-medium hover:bg-yellow-500/20 hover:text-secondary hover:translate-x-1"
            :active-class="LIEN_ACTIF"
          >
            <i class="bx bxs-news text-xl flex-shrink-0"></i>
            <span v-if="!isCollapsed">Articles</span>
          </router-link>

          <!-- Lien Site Internet (pour retourner au site public) -->
          <router-link
            to="/"
            class="flex items-center gap-3 px-4 py-2 rounded-xl text-white no-underline transition-all duration-300 text-sm font-medium hover:bg-yellow-500/20 hover:text-secondary hover:translate-x-1"
            :active-class="LIEN_ACTIF"
          >
            <i class="bx bx-globe text-xl flex-shrink-0"></i>
            <span v-if="!isCollapsed">Site Internet</span>
          </router-link>
        </div>
      </div>

      <!--
        ========== GROUPE AMBASSADESECURE ==========
        Le groupe entier depend du module : il ne contient plus que les
        Evenements, et un intitule qu'on deplie sur rien est une impasse. La
        garde porte donc sur l'en-tete, pas seulement sur le lien.
      -->
      <div v-if="evenementsOuverts">
        <div
          @click="toggleAmbassade"
          class="flex items-center justify-between px-4 py-3 rounded-xl cursor-pointer transition-all duration-300 text-white hover:bg-yellow-500/20 hover:text-secondary"
        >
          <div class="flex items-center gap-3">
            <i class="bx bx-shield text-xl flex-shrink-0"></i>
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
            to="/dashboard/evenements"
            class="flex items-center gap-3 px-4 py-2 rounded-xl text-white no-underline transition-all duration-300 text-sm font-medium hover:bg-yellow-500/20 hover:text-secondary hover:translate-x-1"
            :active-class="LIEN_ACTIF"
          >
            <i class="bx bx-calendar-event text-xl flex-shrink-0"></i>
            <span v-if="!isCollapsed">Evènements</span>
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
        <i class="bx bx-log-out-circle text-xl"></i>
        <span v-if="!isCollapsed">Déconnexion</span>
      </button>
    </div>
  </aside>
</template>

<script setup>
import { ref, computed } from 'vue'
import { useRouter } from 'vue-router'
import { useAuthStore } from '@/stores/auth'
import { useTenantStore } from '@/stores/tenant'
import { useIdentite } from '@/tenant/identite'
import { etatDuModule } from '@/tenant/module-administration'

const router = useRouter()
const auth = useAuthStore()
const tenant = useTenantStore()

/**
 * Le tableau de bord n'est pas le site : l'administrateur est chez lui, et une
 * entree de menu qui mene a un 404 se lit comme une panne. L'etat « attente »
 * masque le groupe le temps du bootstrap, pour eviter qu'il n'apparaisse puis
 * disparaisse ; la regle et le cas du bootstrap en echec sont documentes dans
 * `tenant/module-administration.ts`.
 */
const evenementsOuverts = computed(() => etatDuModule('secure_events', tenant) === 'ouvert')

// Le logo vient de l'ambassade consultee. Il etait importe du depot :
// l'embleme guineen s'affichait donc dans la barre laterale de toutes les
// ambassades, y compris sur le tableau de bord gabonais.
const { logo, nomDeLAmbassade } = useIdentite()

/** Habillage du lien de la rubrique ouverte, partage par tous les liens. */
const LIEN_ACTIF = '!bg-secondary !text-ink-dark'
const isCollapsed = ref(false)

// État d'ouverture des groupes
const isAdminOpen = ref(true) // ouvert par défaut
const isAmbassadeOpen = ref(true) // ouvert par défaut

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
