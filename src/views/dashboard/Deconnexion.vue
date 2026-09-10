<template>
  <div class="p-6 min-h-screen bg-gray-100 flex items-center justify-center">
    <div class="bg-white rounded-lg shadow-lg p-6 max-w-sm text-center">
      <h1 class="text-2xl font-bold text-ink mb-4">Déconnexion</h1>
      <p class="text-gray-600 mb-6">Êtes-vous sûr de vouloir vous déconnecter ?</p>

      <div class="flex justify-center gap-4">
        <button
          @click="cancelLogout"
          class="px-4 py-2 rounded bg-gray-200 text-gray-700 hover:bg-gray-300"
        >
          Annuler
        </button>
        <button
          @click="logout"
          class="px-4 py-2 rounded bg-red-600 text-white hover:bg-red-700"
        >
          Déconnecter
        </button>
      </div>
    </div>
  </div>
</template>

<script setup>
import { useRouter } from 'vue-router'

const router = useRouter()

const cancelLogout = () => {
  // Retour au dashboard
  router.push({ name: 'HomeDashboard' })
}

const logout = () => {
  // Ici tu peux supprimer le token ou l'état de connexion
  alert('Vous êtes maintenant déconnecté !')

  // Redirection vers la page de login
  router.push({ name: 'Connexion' })
}
</script>

<style scoped>
</style>
