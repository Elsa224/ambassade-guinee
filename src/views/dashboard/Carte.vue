<template>
  <div class="min-h-screen bg-gray-100 p-6">
    <div class="max-w-6xl mx-auto">

      <!-- Barre action -->
      <div class="flex justify-between items-center mb-6">
        <h2 class="text-3xl font-semibold text-primary">
          {{ activeTab === 'creer' ? 'Créer une Carte' : 'Liste des Cartes' }}
        </h2>

        <!-- Bouton dynamique -->
        <div>
          <!-- Sur liste : bouton pour créer une carte -->
          <router-link
            v-if="activeTab === 'liste'"
            to="/dashboard/cartes/creer"
            class="bg-primary text-white px-4 py-2 rounded-lg hover:bg-primary-dark transition-colors"
          >
            Créer une Carte
          </router-link>

          <!-- Sur création : bouton retour à la liste -->
          <router-link
            v-else
            to="/dashboard/cartes/liste"
            class="border border-primary text-primary px-4 py-2 rounded-lg hover:bg-primary hover:text-white transition-colors"
          >
            Retour à la Liste
          </router-link>
        </div>
      </div>

      <!-- Contenu dynamique -->
      <router-view />
    </div>
  </div>
</template>

<script setup lang="ts">
import { computed } from 'vue'
import { useRoute } from 'vue-router'

const route = useRoute()

// Détermine si on est sur la page création ou la liste
const activeTab = computed(() => {
  return route.path.includes('/creer') ? 'creer' : 'liste'
})
</script>
