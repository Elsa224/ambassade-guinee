<template>
  <div class="p-6 bg-gray-100 min-h-screen">
    <!-- Titre dynamique -->
    <div class="flex justify-between items-center mb-6">
      <h2 class="text-2xl font-bold text-gray-800">
        {{ pageTitle }}
      </h2>

      <!-- Bouton Créer un Événement -->
      <div v-if="!isCreatePage" class="space-x-4">
        <router-link
          to="/dashboard/evenement/creer"
          class="px-4 py-2 rounded-lg font-semibold bg-primary text-white hover:bg-primary-dark"
        >
          Créer un Événement
        </router-link>
      </div>
    </div>

    <!-- Contenu de la sous-route -->
    <router-view
      :events="events"
      :perPage="perPage"
      :currentPage="currentPage"
      @add-event="handleAddEvent"
      @edit-event="modifierEvent"
      @delete-event="supprimerEvent"
      @view-participants="voirParticipants"
    />
  </div>
</template>

<script setup lang="ts">
import { ref, computed } from 'vue'
import { useRoute } from 'vue-router'

const route = useRoute()

// Les événements reçus des sous-vues (création, édition) portent des champs
// variables (entreprise, lieu, date, heure, lien, qrCode, etc.) en plus du
// nom : on ne connaît pas leur forme exacte à l'avance, d'où ce type ouvert.
interface EvenementItem {
  nom: string
  [key: string]: unknown
}

const perPage = ref(5)
const currentPage = ref(1)
const events = ref<EvenementItem[]>([{ nom: 'Forum Digital' }, { nom: 'Conférence Élite' }])

const selectedEvent = ref<EvenementItem | null>(null)

// Détection de la page actuelle pour changer le titre
const pageTitle = computed(() => {
  if (route.path.includes('creer')) return 'Créer un Événement'
  if (route.path.includes('participants')) return 'Participants de l’Événement'
  return 'Liste des Événements'
})

// Vérifie si on est sur la page de création (pour cacher le bouton)
const isCreatePage = computed(() => route.path.includes('creer'))

function handleAddEvent(event: EvenementItem) {
  events.value.push(event)
  // après création, rediriger vers la liste
  window.location.href = '/dashboard/evenement/liste'
}

function modifierEvent(event: EvenementItem) {
  alert(`Modifier ${event.nom}`)
}

function supprimerEvent(index: number) {
  if (confirm('Supprimer cet événement ?')) events.value.splice(index, 1)
}

function voirParticipants(event: EvenementItem) {
  selectedEvent.value = event
  window.location.href = `/dashboard/evenement/participants/${event.nom}`
}
</script>
