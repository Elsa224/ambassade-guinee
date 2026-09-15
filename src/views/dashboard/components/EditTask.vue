<template>
  <div class="min-h-screen bg-gray-50 p-6">
    <div class="max-w-4xl mx-auto">
      <!-- En-tête -->
      <div class="mb-8">
        <h1 class="text-3xl font-bold text-gray-900 mb-2">Éditer une Tâche - SecureCheck</h1>
        <div class="flex justify-between items-center">
          <p class="text-gray-600">Modifier les informations de la tâche</p>
          <div class="space-x-2">
            <button
              @click="goBack"
              class="px-4 py-2 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50 transition-colors"
            >
              Annuler
            </button>
            <button
              class="px-4 py-2 bg-primary text-white rounded-lg hover:bg-primary-dark transition-colors"
            >
              Sauvegarder
            </button>
          </div>
        </div>
      </div>

      <!-- Formulaire -->
      <div class="bg-white rounded-lg shadow-lg p-6">
        <div class="grid grid-cols-2 gap-8">
          <!-- Colonne gauche -->
          <div class="space-y-6">
            <!-- Tâche parente -->
            <div>
              <label class="block text-sm font-medium text-gray-700 mb-2"> Tâche parente </label>
              <ChampSelect v-model="tacheParente" :options="OPTIONS_TACHEPARENTE" />
            </div>

            <!-- Assigné à -->
            <div>
              <label class="block text-sm font-medium text-gray-700 mb-2">
                Assigné à <span class="text-red-500">*</span>
              </label>
              <ChampSelect v-model="assigneA" :options="OPTIONS_ASSIGNEA" />
            </div>

            <!-- Date début -->
            <div>
              <label class="block text-sm font-medium text-gray-700 mb-2">
                Date début <span class="text-red-500">*</span>
              </label>
              <input
                type="text"
                class="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent"
                value="23/10/2025"
              />
            </div>

            <!-- Temps estimé -->
            <div>
              <label class="block text-sm font-medium text-gray-700 mb-2">
                Temps estimé (heures)
              </label>
              <input
                type="number"
                class="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent"
                value="4"
              />
            </div>

            <!-- Statut -->
            <div>
              <label class="block text-sm font-medium text-gray-700 mb-2">
                Statut <span class="text-red-500">*</span>
              </label>
              <ChampSelect v-model="statut" :options="OPTIONS_STATUT" />
            </div>
          </div>

          <!-- Colonne droite -->
          <div class="space-y-6">
            <!-- Titre -->
            <div>
              <label class="block text-sm font-medium text-gray-700 mb-2">
                Titre <span class="text-red-500">*</span>
              </label>
              <input
                type="text"
                class="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent"
                value="Update liste"
              />
            </div>

            <!-- Priorité -->
            <div>
              <label class="block text-sm font-medium text-gray-700 mb-2">
                Priorité <span class="text-red-500">*</span>
              </label>
              <ChampSelect v-model="priorite" :options="OPTIONS_PRIORITE" />
            </div>

            <!-- Date fin -->
            <div>
              <label class="block text-sm font-medium text-gray-700 mb-2">
                Date fin <span class="text-red-500">*</span>
              </label>
              <input
                type="text"
                class="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent"
                value="23/10/2025"
              />
            </div>

            <!-- Temps passé -->
            <div>
              <label class="block text-sm font-medium text-gray-700 mb-2">
                Temps passé (heures)
              </label>
              <input
                type="number"
                class="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent"
                value="15"
              />
              <p class="text-sm text-gray-500 mt-1">Veuillez compléter ce champ.</p>
            </div>
          </div>
        </div>

        <!-- Description -->
        <div class="mt-6">
          <label class="block text-sm font-medium text-gray-700 mb-2"> Description : </label>
          <textarea
            rows="4"
            class="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent"
          >
Mise à jour des tâches</textarea
          >
        </div>

        <!-- Actions -->
        <div class="flex justify-end space-x-3 mt-6 pt-6 border-t border-gray-200">
          <button
            class="px-6 py-2 border border-red-300 text-red-700 rounded-lg hover:bg-red-50 transition-colors"
          >
            Supprimer
          </button>
          <button
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
import ChampSelect from '@/components/ui/ChampSelect.vue'

const OPTIONS_TACHEPARENTE = [
  { valeur: 'api-list', libelle: 'API List' },
  { valeur: 'accune', libelle: 'Accune' },
]
const tacheParente = ref('api-list')

const OPTIONS_ASSIGNEA = [
  { valeur: 'employee-admin', libelle: 'Employee Admin' },
  { valeur: 'master-admin', libelle: 'Master Admin' },
]
const assigneA = ref('employee-admin')

const OPTIONS_STATUT = [
  { valeur: 'termine', libelle: 'Terminé' },
  { valeur: 'a-faire', libelle: 'A faire' },
  { valeur: 'en-cours', libelle: 'En cours' },
]
const statut = ref('termine')

const OPTIONS_PRIORITE = [
  { valeur: 'urgente', libelle: 'Urgente' },
  { valeur: 'normale', libelle: 'Normale' },
  { valeur: 'basse', libelle: 'Basse' },
]
const priorite = ref('urgente')
import { useRouter } from 'vue-router'

const router = useRouter()

const goBack = () => {
  router.back()
}
</script>
