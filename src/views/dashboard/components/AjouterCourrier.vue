<template>
  <div>
    <!-- Bouton Retour -->
    <div class="mb-4">
      <router-link
        to="/dashboard/courriers/liste"
        class="inline-block text-gray-700 px-4 py-2 rounded-lg hover:bg-gray-300 transition"
      >
        ← Retour à la liste
      </router-link>
    </div>

    <!-- Formulaire -->
    <form @submit.prevent="soumettreCourrier" class="grid grid-cols-2 gap-4 bg-transparent">
      <!-- Entreprise avec menu déroulant -->
      <div>
        <label class="block font-medium mb-1">Entreprise</label>
        <ChampSelect v-model="form.entreprise" :options="OPTIONS_FORM_ENTREPRISE" />
      </div>

      <div>
        <label class="block font-medium mb-1">Objet</label>
        <input v-model="form.objet" type="text" class="w-full border rounded-lg p-2 bg-gray-200" />
      </div>

      <div>
        <label class="block font-medium mb-1">Nom du destinateur</label>
        <input v-model="form.nom" type="text" class="w-full border rounded-lg p-2 bg-gray-200" />
      </div>

      <div>
        <label class="block font-medium mb-1">Prénoms du destinateur</label>
        <input v-model="form.prenom" type="text" class="w-full border rounded-lg p-2 bg-gray-200" />
      </div>

      <div>
        <label class="block font-medium mb-1">Adresse du destinateur</label>
        <input
          v-model="form.adresse"
          type="text"
          class="w-full border rounded-lg p-2 bg-gray-200"
        />
      </div>

      <div>
        <label class="block font-medium mb-1">Email du destinateur</label>
        <input v-model="form.email" type="email" class="w-full border rounded-lg p-2 bg-gray-200" />
      </div>

      <div>
        <label class="block font-medium mb-1">Contact du destinateur</label>
        <input
          v-model="form.contact"
          type="text"
          class="w-full border rounded-lg p-2 bg-gray-200"
        />
      </div>

      <div>
        <label class="block font-medium mb-1">Lieu</label>
        <input v-model="form.lieu" type="text" class="w-full border rounded-lg p-2 bg-gray-200" />
      </div>

      <div>
        <label class="block font-medium mb-1">Date</label>
        <ChampDate v-model="form.date" />
      </div>

      <div>
        <label class="block font-medium mb-1">Civilité du destinataire</label>
        <ChampSelect v-model="form.civilite" :options="OPTIONS_FORM_CIVILITE" />
      </div>

      <div>
        <label class="block font-medium mb-1">Destinataire</label>
        <input
          v-model="form.destinataire"
          type="text"
          class="w-full border rounded-lg p-2 bg-gray-200"
        />
      </div>

      <div>
        <label class="block font-medium mb-1">Signature</label>
        <input type="file" class="w-full border rounded-lg p-2 bg-gray-200" />
      </div>

      <div>
        <label class="block font-medium mb-1">Fichier</label>
        <input type="file" class="w-full border rounded-lg p-2 bg-gray-200" />
      </div>

      <!-- Courrier (grand textarea en bas, occupe toute la largeur) -->
      <div class="col-span-2">
        <label class="block font-medium mb-1">Courrier</label>
        <textarea
          v-model="form.courrier"
          rows="10"
          class="w-full border rounded-lg p-4 bg-gray-200 resize-none"
          placeholder="Rédigez votre courrier ici..."
        ></textarea>
      </div>

      <!-- Bouton soumettre -->
      <div class="col-span-2 flex justify-center mt-6">
        <button
          type="submit"
          class="bg-primary text-white px-6 py-2 rounded-lg hover:bg-primary-dark transition"
        >
          Soumettre
        </button>
      </div>
    </form>
  </div>
</template>

<script setup lang="ts">
import { ref } from 'vue'
import ChampSelect from '@/components/ui/ChampSelect.vue'
import ChampDate from '@/components/ui/ChampDate.vue'

const OPTIONS_FORM_ENTREPRISE = [
  { valeur: '', libelle: 'Sélectionner une entreprise' },
  { valeur: 'Entreprise A', libelle: 'Entreprise A' },
  { valeur: 'Entreprise B', libelle: 'Entreprise B' },
  { valeur: 'Entreprise C', libelle: 'Entreprise C' },
] as const

const OPTIONS_FORM_CIVILITE = [
  { valeur: '', libelle: 'Sélectionner' },
  { valeur: 'Monsieur', libelle: 'Monsieur' },
  { valeur: 'Madame', libelle: 'Madame' },
  { valeur: 'Mademoiselle', libelle: 'Mademoiselle' },
] as const

const form = ref({
  entreprise: '',
  objet: '',
  nom: '',
  prenom: '',
  adresse: '',
  email: '',
  contact: '',
  lieu: '',
  date: '',
  civilite: '',
  destinataire: '',
  courrier: '',
})

const soumettreCourrier = () => {
  alert('Courrier ajouté avec succès ✅')
}
</script>
