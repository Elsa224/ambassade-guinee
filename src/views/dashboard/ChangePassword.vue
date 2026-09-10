<template>
  <div class="p-6 min-h-screen bg-gray-100">
    <!-- Header -->
    <h1 class="text-3xl font-bold text-ink mb-6">Modifier le mot de passe</h1>

    <div class="max-w-md mx-auto p-6">
      <form @submit.prevent="changePassword" class="space-y-4">
        <!-- Ancien mot de passe -->
        <div>
          <label class="block text-gray-600 mb-1">Ancien mot de passe</label>
          <input
            type="password"
            v-model="password.old"
            placeholder="********"
            class="w-full border border-gray-300 rounded px-3 py-2 focus:outline-none focus:ring-2 focus:ring-ink"
            required
          />
        </div>

        <!-- Nouveau mot de passe -->
        <div>
          <label class="block text-gray-600 mb-1">Nouveau mot de passe</label>
          <input
            type="password"
            v-model="password.new"
            placeholder="********"
            class="w-full border border-gray-300 rounded px-3 py-2 focus:outline-none focus:ring-2 focus:ring-ink"
            required
          />
        </div>

        <!-- Confirmation -->
        <div>
          <label class="block text-gray-600 mb-1">Confirmer le nouveau mot de passe</label>
          <input
            type="password"
            v-model="password.confirm"
            placeholder="********"
            class="w-full border border-gray-300 rounded px-3 py-2 focus:outline-none focus:ring-2 focus:ring-ink"
            required
          />
        </div>

        <!-- Message d'erreur -->
        <p v-if="error" class="text-red-500 text-sm">{{ error }}</p>

        <!-- Boutons -->
        <div class="flex justify-end gap-4 mt-4">
          <button
            type="button"
            class="px-4 py-2 rounded bg-gray-200 text-gray-700 hover:bg-gray-300"
            @click="resetForm"
          >
            Annuler
          </button>
          <button
            type="submit"
            class="px-4 py-2 rounded bg-ink text-white hover:bg-ink-dark transition-colors"
          >
            Enregistrer
          </button>
        </div>
      </form>
    </div>
  </div>
</template>

<script setup>
import { reactive, ref } from 'vue'

const password = reactive({
  old: '',
  new: '',
  confirm: ''
})

const error = ref('')

const changePassword = () => {
  error.value = ''
  if (password.new !== password.confirm) {
    error.value = 'Le nouveau mot de passe et la confirmation ne correspondent pas.'
    return
  }
  if (password.new.length < 6) {
    error.value = 'Le mot de passe doit contenir au moins 6 caractères.'
    return
  }

  // Ici tu peux envoyer la modification au backend
  alert('Mot de passe modifié avec succès !')

  resetForm()
}

const resetForm = () => {
  password.old = ''
  password.new = ''
  password.confirm = ''
  error.value = ''
}
</script>

<style scoped>
input:focus {
  transition: all 0.2s ease-in-out;
}
</style>
