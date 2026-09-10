<template>
  <div class="bg-white rounded-lg shadow-lg p-6">
    <form @submit.prevent="creerCarte" class="grid grid-cols-2 gap-4">
      <!-- Tous les champs comme tu avais déjà -->
      <div>
        <label class="block mb-2 text-gray-700">Prénoms *</label>
        <input v-model="newCard.prenoms" type="text" required class="w-full border rounded-lg p-2 bg-gray-100" />
      </div>
      <div>
        <label class="block mb-2 text-gray-700">Nom *</label>
        <input v-model="newCard.nom" type="text" required class="w-full border rounded-lg p-2 bg-gray-100" />
      </div>
      <div>
        <label class="block mb-2 text-gray-700">Email *</label>
        <input v-model="newCard.email" type="email" required class="w-full border rounded-lg p-2 bg-gray-100" />
      </div>
      <div>
        <label class="block mb-2 text-gray-700">Contact *</label>
        <input v-model="newCard.contact" type="text" required class="w-full border rounded-lg p-2 bg-gray-100" />
      </div>
      <div>
        <label class="block mb-2 text-gray-700">Titre *</label>
        <input v-model="newCard.titre" type="text" required class="w-full border rounded-lg p-2 bg-gray-100" />
      </div>
      <div>
        <label class="block mb-2 text-gray-700">QR Code *</label>
        <input v-model="newCard.qr" type="text" required class="w-full border rounded-lg p-2 bg-gray-100" placeholder="Généré ou fourni" />
      </div>
      <div>
        <label class="block mb-2 text-gray-700">Type *</label>
        <input v-model="newCard.type" type="text" required class="w-full border rounded-lg p-2 bg-gray-100" />
      </div>
      <div>
        <label class="block mb-2 text-gray-700">Date d'expiration *</label>
        <input v-model="newCard.dateExpiration" type="date" required class="w-full border rounded-lg p-2 bg-gray-100" />
      </div>
      <div>
        <label class="block mb-2 text-gray-700">Entreprise *</label>
        <input v-model="newCard.entreprise" type="text" required class="w-full border rounded-lg p-2 bg-gray-100" />
      </div>
      <div class="col-span-2">
        <label class="block mb-2 text-gray-700">Document</label>
        <input type="file" class="w-full border rounded-lg p-2 bg-gray-100" @change="handleFileChange" />
      </div>
      <div class="col-span-2 flex justify-center mt-6">
        <button type="submit" class="bg-primary text-white px-6 py-2 rounded-lg hover:bg-primary-dark">
          Créer
        </button>
      </div>
    </form>
  </div>
</template>

<script setup lang="ts">
import { ref } from 'vue'

interface NewCard {
  prenoms: string
  nom: string
  email: string
  contact: string
  titre: string
  qr: string
  type: string
  dateExpiration: string
  entreprise: string
  document: File | null
}

const newCard = ref<NewCard>({
  prenoms: '',
  nom: '',
  email: '',
  contact: '',
  titre: '',
  qr: '',
  type: '',
  dateExpiration: '',
  entreprise: '',
  document: null,
})

function handleFileChange(event: Event) {
  const target = event.target as HTMLInputElement
  const file = target.files?.[0] ?? null
  newCard.value.document = file
}

function creerCarte() {
  console.log('Carte créée :', newCard.value)
  alert('✅ Carte créée avec succès !')

  // Réinitialisation
  newCard.value = {
    prenoms: '',
    nom: '',
    email: '',
    contact: '',
    titre: '',
    qr: '',
    type: '',
    dateExpiration: '',
    entreprise: '',
    document: null,
  }
}
</script>
