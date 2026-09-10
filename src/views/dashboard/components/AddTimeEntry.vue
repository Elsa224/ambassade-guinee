<template>
  <div class="min-h-screen bg-gray-50 p-6">
    <div class="max-w-2xl mx-auto">
      <!-- En-tête -->
      <div class="mb-8">
        <h1 class="text-3xl font-bold text-gray-900 mb-2">Ajouter une durée - Update liste</h1>
        <div class="flex justify-between items-center">
          <p class="text-gray-600">Ajouter un temps d'exécution</p>
          <button
            @click="goBack"
            class="px-4 py-2 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50 transition-colors"
          >
            Retour
          </button>
        </div>
      </div>

      <!-- Formulaire -->
      <div class="bg-white rounded-lg shadow-lg p-6">
        <div class="space-y-6">
          <!-- Durée -->
          <div>
            <label class="block text-sm font-medium text-gray-700 mb-2">
              Durée : <span class="text-red-500">*</span>
            </label>
            <input
              type="number"
              step="0.5"
              class="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-info-dark focus:border-transparent"
              placeholder="0"
              v-model="duration"
            >
          </div>

          <!-- Commentaire -->
          <div>
            <label class="block text-sm font-medium text-gray-700 mb-2">
              Commentaire : <span class="text-red-500">*</span>
            </label>
            <textarea
              rows="4"
              class="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-info-dark focus:border-transparent"
              placeholder="Entrez un commentaire..."
              v-model="comment"
            ></textarea>
          </div>

          <!-- Bouton Soumettre -->
          <div class="flex justify-end">
            <button
              @click="submitTimeEntry"
              class="px-6 py-2 bg-info-dark text-white rounded-lg hover:bg-blue-700 transition-colors"
            >
              Soumettre
            </button>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref } from 'vue'
import { useRouter } from 'vue-router'

const router = useRouter()
const duration = ref('')
const comment = ref('')

const goBack = () => {
  router.back()
}

const submitTimeEntry = () => {
  if (duration.value && comment.value) {
    // Logique pour sauvegarder le time entry
    console.log('Time entry ajouté:', { duration: duration.value, comment: comment.value })
    router.back()
  }
}
</script>
