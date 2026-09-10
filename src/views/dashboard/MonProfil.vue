<template>
  <div class="p-6 min-h-screen bg-gray-100">
    <!-- Header -->
    <h1 class="text-3xl font-bold text-ink mb-6">Mon Profil</h1>

    <div class="max-w-3xl mx-auto p-6">
      <!-- Avatar et nom -->
      <div class="flex items-center gap-6 mb-6">
        <img :src="avatarDefaut" alt="Avatar" class="w-24 h-24 rounded-full border-2 border-ink" />
        <div>
          <h2 class="text-2xl font-semibold text-gray-700">John Doe</h2>
          <p class="text-gray-500">Utilisateur du dashboard</p>
        </div>
      </div>

      <!-- Informations utilisateur -->
      <div class="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div>
          <label class="block text-gray-600 mb-1">Nom</label>
          <input
            type="text"
            v-model="user.nom"
            class="w-full border border-gray-300 rounded px-3 py-2 focus:outline-none focus:ring-2 focus:ring-ink"
          />
        </div>

        <div>
          <label class="block text-gray-600 mb-1">Prénom</label>
          <input
            type="text"
            v-model="user.prenom"
            class="w-full border border-gray-300 rounded px-3 py-2 focus:outline-none focus:ring-2 focus:ring-ink"
          />
        </div>

        <div>
          <label class="block text-gray-600 mb-1">Email</label>
          <input
            type="email"
            v-model="user.email"
            class="w-full border border-gray-300 rounded px-3 py-2 focus:outline-none focus:ring-2 focus:ring-ink"
          />
        </div>

        <div>
          <label class="block text-gray-600 mb-1">Téléphone</label>
          <input
            type="text"
            v-model="user.telephone"
            class="w-full border border-gray-300 rounded px-3 py-2 focus:outline-none focus:ring-2 focus:ring-ink"
          />
        </div>
      </div>

      <!-- Boutons -->
      <div class="mt-6 flex justify-end gap-4">
        <button
          class="px-4 py-2 rounded bg-gray-200 text-gray-700 hover:bg-gray-300"
          @click="resetForm"
        >
          Annuler
        </button>
        <button class="px-4 py-2 rounded bg-ink text-white hover:bg-ink-light" @click="saveProfile">
          Enregistrer
        </button>
      </div>
    </div>
  </div>
</template>

<script setup>
import avatarDefaut from '@/assets/avatar-defaut.svg'
import { reactive } from 'vue'

const user = reactive({
  nom: 'Doe',
  prenom: 'John',
  email: 'john.doe@example.com',
  telephone: '+225 01 23 45 67 89',
})

const saveProfile = () => {
  alert(
    `Profil sauvegardé !\nNom: ${user.nom}\nPrénom: ${user.prenom}\nEmail: ${user.email}\nTéléphone: ${user.telephone}`,
  )
}

const resetForm = () => {
  user.nom = 'Doe'
  user.prenom = 'John'
  user.email = 'john.doe@example.com'
  user.telephone = '+225 01 23 45 67 89'
}
</script>

<style scoped>
input:focus {
  transition: all 0.2s ease-in-out;
}
</style>
