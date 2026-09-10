<template>
  <div class="min-h-screen bg-gray-50 p-6">
    <div class="max-w-2xl mx-auto">
      <!-- En-tête -->
      <div class="mb-8">
        <h1 class="text-3xl font-bold text-gray-900 mb-2">
          {{ isEditing ? 'Éditer le Commentaire' : 'Ajouter un Commentaire' }} - Update liste
        </h1>
        <div class="flex justify-between items-center">
          <p class="text-gray-600">
            {{ isEditing ? 'Modifier le commentaire' : 'Ajouter un nouveau commentaire' }}
          </p>
          <!-- Bouton Retour vers la liste des tâches -->
          <button
            @click="goBackToTasks"
            class="px-4 py-2 flex items-center gap-1 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50 transition-colors"
          >
            ← Retour à la liste
          </button>
        </div>
      </div>

      <!-- Formulaire -->
      <div class="bg-white rounded-lg shadow-lg p-6">
        <div class="space-y-6">
          <!-- Commentaire -->
          <div>
            <label class="block text-sm font-medium text-gray-700 mb-2">
              Commentaire <span class="text-red-500">*</span>
            </label>
            <textarea
              rows="6"
              class="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent"
              placeholder="Écrivez votre commentaire..."
              v-model="commentText"
            ></textarea>
            <p class="text-sm text-gray-500 mt-1">{{ commentText.length }}/500 caractères</p>
          </div>

          <!-- Pièce jointe -->
          <div>
            <label class="block text-sm font-medium text-gray-700 mb-2">
              Pièce jointe (optionnel)
            </label>
            <div class="flex items-center gap-3">
              <input
                type="file"
                class="hidden"
                id="file-upload"
                @change="handleFileUpload"
                ref="fileInput"
              />
              <label
                for="file-upload"
                class="px-4 py-2 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50 transition-colors cursor-pointer"
              >
                Choisir un fichier
              </label>
              <span class="text-gray-500 text-sm">{{
                selectedFile || 'Aucun fichier choisi'
              }}</span>
              <button
                v-if="selectedFile"
                @click="removeFile"
                class="text-red-600 hover:text-red-800 p-1"
              >
                <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path
                    stroke-linecap="round"
                    stroke-linejoin="round"
                    stroke-width="2"
                    d="M6 18L18 6M6 6l12 12"
                  />
                </svg>
              </button>
            </div>
          </div>

          <!-- Notification -->
          <div class="flex items-center gap-2">
            <input
              type="checkbox"
              id="notify"
              v-model="notifyUsers"
              class="rounded border-gray-300 text-primary focus:ring-primary"
            />
            <label for="notify" class="text-sm text-gray-700">
              Notifier les utilisateurs assignés à cette tâche
            </label>
          </div>

          <!-- Boutons d'action -->
          <div class="flex justify-end space-x-3 pt-4 border-t border-gray-200">
            <button
              @click="goBackToTasks"
              class="px-6 py-2 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50 transition-colors"
            >
              Annuler
            </button>
            <button
              @click="submitComment"
              :disabled="!commentText.trim()"
              class="px-6 py-2 bg-primary text-white rounded-lg hover:bg-primary-dark transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {{ isEditing ? 'Mettre à jour' : 'Publier' }}
            </button>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted } from 'vue'
import { useRouter, useRoute } from 'vue-router'

const router = useRouter()
const route = useRoute()
const fileInput = ref(null)

const commentText = ref('')
const selectedFile = ref('')
const notifyUsers = ref(true)
const isEditing = ref(false)

onMounted(() => {
  if (route.params.commentId) {
    isEditing.value = true
    commentText.value = 'Commentaire existant à modifier...'
  }
})

const handleFileUpload = (event) => {
  const file = event.target.files[0]
  if (file) selectedFile.value = file.name
}

const removeFile = () => {
  selectedFile.value = ''
  if (fileInput.value) fileInput.value.value = ''
}

// 🔹 Retour vers la liste des tâches
const goBackToTasks = () => {
  router.push({ name: 'TaskList' }) // ← important
}

const submitComment = () => {
  if (commentText.value.trim()) {
    console.log('Commentaire soumis:', {
      content: commentText.value,
      file: selectedFile.value,
      notify: notifyUsers.value,
    })
    goBackToTasks()
  }
}
</script>
