<template>
  <div class="min-h-screen bg-gray-50 p-6">
    <div class="max-w-4xl mx-auto">
      <!-- En-tête -->
      <div class="mb-8 flex justify-between items-center">
        <div>
          <h1 class="text-3xl font-bold text-gray-900 mb-2">Editer un Projet</h1>
          <p class="text-gray-600">Modifier les informations du projet</p>
        </div>
        <!-- Boutons dynamiques Annuler / Sauvegarder -->
        <div class="space-x-2">
          <button
            @click="goBack"
            class="px-4 py-2 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50 transition-colors"
          >
            Annuler
          </button>
          <button
            @click="updateProject"
            class="px-4 py-2 bg-primary text-white rounded-lg hover:bg-primary-dark transition-colors"
          >
            Sauvegarder
          </button>
        </div>
      </div>
<!-- Bouton Retour à la liste -->
<div class="mb-4">
  <button
    @click="goBack"
    class="px-4 py-2 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50 transition-colors"
  >
    ← Retour à la liste des projets
  </button>
</div>

      <!-- Formulaire -->
      <div class="bg-white rounded-lg shadow-lg p-6">
        <div class="grid grid-cols-2 gap-6 mb-6">
          <!-- Colonne gauche -->
          <div class="space-y-6">
            <!-- Entreprise -->
            <div>
              <label class="block text-sm font-medium text-gray-700 mb-2">
                Entreprise
              </label>
              <input
                type="text"
                class="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-info focus:border-transparent"
                v-model="company"
              >
            </div>

            <!-- Titre -->
            <div>
              <label class="block text-sm font-medium text-gray-700 mb-2">
                Titre <span class="text-red-500">*</span>
              </label>
              <input
                type="text"
                class="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                v-model="title"
              >
            </div>

            <!-- Date début -->
            <div>
              <label class="block text-sm font-medium text-gray-700 mb-2">
                Date début <span class="text-red-500">*</span>
              </label>
              <input
                type="text"
                class="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent"
                v-model="startDate"
              >
            </div>

            <!-- Statut -->
            <div>
              <label class="block text-sm font-medium text-gray-700 mb-2">
                Statut <span class="text-red-500">*</span>
              </label>
              <select
                class="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-info focus:border-transparent"
                v-model="status"
              >
                <option value="Planifié">Planifié</option>
                <option value="En cours">En cours</option>
                <option value="Terminé">Terminé</option>
              </select>
            </div>

            <!-- Document -->
            <div>
              <label class="block text-sm font-medium text-gray-700 mb-2">
                Document
              </label>
              <div class="flex items-center gap-3">
                <input
                  type="file"
                  class="hidden"
                  id="document-upload"
                  @change="handleFileUpload"
                >
                <label
                  for="document-upload"
                  class="px-4 py-2 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50 transition-colors cursor-pointer"
                >
                  Parcourir...
                </label>
                <span class="text-gray-500 text-sm">{{ selectedFile || 'Aucun fichier sélectionné' }}</span>
              </div>
            </div>
          </div>

          <!-- Colonne droite -->
          <div class="space-y-6">
            <!-- TANARES -->
            <div>
              <label class="block text-sm font-medium text-gray-700 mb-2">
                TANARES
              </label>
              <input
                type="text"
                class="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-info focus:border-transparent bg-gray-50"
                value="TANARES"
                readonly
              >
            </div>

            <!-- Date fin -->
            <div>
              <label class="block text-sm font-medium text-gray-700 mb-2">
                Date fin <span class="text-red-500">*</span>
              </label>
              <input
                type="text"
                class="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-info focus:border-transparent"
                v-model="endDate"
              >
            </div>

            <!-- Progression -->
            <div>
              <label class="block text-sm font-medium text-gray-700 mb-2">
                Progression
              </label>
              <div class="flex items-center gap-3">
                <input
                  type="range"
                  min="0"
                  max="100"
                  v-model="progress"
                  class="w-full"
                >
                <span class="text-sm text-gray-700 min-w-12">{{ progress }}%</span>
              </div>
            </div>
          </div>
        </div>

        <!-- Description -->
        <div>
          <label class="block text-sm font-medium text-gray-700 mb-2">
            Description :
          </label>
          <textarea
            rows="4"
            class="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent"
            v-model="description"
          ></textarea>
        </div>

        <!-- Séparateur -->
        <div class="border-t border-gray-200 my-6"></div>

        <!-- Actions -->
        <div class="flex justify-end space-x-3">
          <button
            @click="deleteProject"
            class="px-6 py-2 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50 transition-colors"
          >
            Supprimer
          </button>
          <button
            @click="updateProject"
            class="px-6 py-2 bg-primary text-white rounded-lg hover:bg-primary-dark transition-colors"
          >
            Mettre à jour
          </button>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref } from 'vue'
import { useRouter } from 'vue-router'

const router = useRouter()

const company = ref('SCB')
const title = ref('TANARES')
const startDate = ref('27/10/2025')
const endDate = ref('31/12/2025')
const status = ref('Planifié')
const progress = ref(0)
const description = ref('Le TANARES est le Tableau National de Répartition des Spectres et Fréquences de l\'Agence Ivoirienne de Gestion des Fréquences')
const selectedFile = ref('')

// Navigation
const goBack = () => router.push({ name: 'ProjectList' })

// Gestion des fichiers
const handleFileUpload = (event) => {
  const file = event.target.files[0]
  if (file) selectedFile.value = file.name
}

// Actions dynamiques
const deleteProject = () => {
  if (confirm('Voulez-vous supprimer ce projet ?')) goBack()
}
const updateProject = () => {
  alert('Projet mis à jour !')
  goBack()
}
</script>
