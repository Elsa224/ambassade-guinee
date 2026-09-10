<template>
  <div class="p-6 max-w-5xl mx-auto bg-white w-full rounded-lg shadow-lg">
    <!-- Bouton Retour aligné à droite -->
    <div class="flex mb-4">
      <router-link
        to="/dashboard/utilisateurs/liste"
        class="inline-flex items-center gap-2 text-primary font-medium hover:text-primary-dark transition"
      >
        <i class="bx bx-arrow-back text-lg"></i> Retour
      </router-link>
    </div>

    <h2 class="text-xl font-semibold mb-6 text-primary">Ajouter un utilisateur</h2>

    <form class="grid grid-cols-1 md:grid-cols-2 gap-4 w-full">
      <div>
        <label class="block font-medium text-gray-700">
          Prénoms <span class="text-accent">*</span>
        </label>
        <input
          type="text"
          placeholder="Prénoms"
          class="mt-1 w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-primary focus:border-primary bg-gray-50 transition"
        />
      </div>

      <div>
        <label class="block font-medium text-gray-700">
          Nom <span class="text-accent">*</span>
        </label>
        <input
          type="text"
          placeholder="Nom"
          class="mt-1 w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-primary focus:border-primary bg-gray-50 transition"
        />
      </div>

      <div>
        <label class="block font-medium text-gray-700">
          Email <span class="text-accent">*</span>
        </label>
        <input
          type="email"
          placeholder="Email"
          class="mt-1 w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-primary focus:border-primary bg-gray-50 transition"
        />
      </div>

      <div>
        <label class="block font-medium text-gray-700">Titre</label>
        <input
          type="text"
          placeholder="Titre"
          class="mt-1 w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-primary focus:border-primary bg-gray-50 transition"
        />
      </div>

      <div>
        <label class="block font-medium text-gray-700">
          Rôle <span class="text-accent">*</span>
        </label>
        <input
          type="text"
          placeholder="Rôle"
          class="mt-1 w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-primary focus:border-primary bg-gray-50 transition"
        />
      </div>

      <div>
        <label class="block font-medium text-gray-700">
          Mot de passe <span class="text-accent">*</span>
        </label>
        <input
          type="password"
          placeholder="Mot de passe"
          class="mt-1 w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-primary focus:border-primary bg-gray-50 transition"
        />
      </div>

      <div>
        <label class="block font-medium text-gray-700">Numéro de téléphone</label>
        <input
          type="text"
          placeholder="Numéro de téléphone"
          class="mt-1 w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-primary focus:border-primary bg-gray-50 transition"
        />
      </div>

      <div>
        <label class="block font-medium text-gray-700">Entreprise</label>
        <input
          type="text"
          placeholder="Entreprise"
          class="mt-1 w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-primary focus:border-primary bg-gray-50 transition"
        />
      </div>
    </form>

    <div class="mt-6 text-center">
      <button
        class="bg-primary text-white px-6 py-2 rounded-lg font-semibold hover:bg-secondary hover:text-primary transition shadow-md"
      >
        Ajouter un utilisateur
      </button>
    </div>
  </div>
</template>

<script setup lang="ts">
// Tu peux ajouter ici les fonctions de submit du formulaire si besoin
</script>

<style scoped>
/* Transitions et animations personnalisées */
input:focus {
  outline: none;
}

button {
  transition: all 0.3s ease;
}
</style>
