<template>
  <!-- 🔙 Bouton de retour -->
  <div class="mb-4">
    <router-link
      to="/dashboard/evenement/liste"
      class="inline-block px-4 py-2 rounded-lg font-semibold text-gray-800 hover:bg-gray-200 transition"
    >
      ← Retour à la liste
    </router-link>
  </div>

  <div class="bg-white p-6 rounded-lg shadow-md relative">
    <!-- 📝 Formulaire -->
    <form @submit.prevent="ajouterEvenement" class="grid grid-cols-2 gap-4">
      <!-- Champs de formulaire -->
      <div>
        <label class="block mb-2 text-gray-700"
          >Entreprise <span class="text-red-500">*</span></label
        >
        <input
          v-model="newEvent.entreprise"
          type="text"
          required
          class="w-full border rounded-lg p-2 bg-gray-100 focus:ring-2 focus:ring-primary"
        />
      </div>

      <div>
        <label class="block mb-2 text-gray-700"
          >Nom de l'Événement <span class="text-red-500">*</span></label
        >
        <input
          v-model="newEvent.nom"
          type="text"
          required
          class="w-full border rounded-lg p-2 bg-gray-100 focus:ring-2 focus:ring-primary"
        />
      </div>

      <div>
        <label class="block mb-2 text-gray-700"
          >Lieu de l'Événement <span class="text-red-500">*</span></label
        >
        <input
          v-model="newEvent.lieu"
          type="text"
          required
          class="w-full border rounded-lg p-2 bg-gray-100 focus:ring-2 focus:ring-primary"
        />
      </div>

      <div>
        <label class="block mb-2 text-gray-700">Adresse</label>
        <input
          v-model="newEvent.adresse"
          type="text"
          class="w-full border rounded-lg p-2 bg-gray-100 focus:ring-2 focus:ring-primary"
        />
      </div>

      <div>
        <label class="block mb-2 text-gray-700">Ville</label>
        <select
          v-model="newEvent.ville"
          class="w-full border rounded-lg p-2 bg-gray-100 focus:ring-2 focus:ring-primary"
        >
          <option value="">Sélectionner une ville</option>
          <option>Abidjan</option>
          <option>Paris</option>
          <option>New York</option>
          <option>Tokyo</option>
          <option>Autre...</option>
        </select>
      </div>

      <div>
        <label class="block mb-2 text-gray-700">Pays</label>
        <select
          v-model="newEvent.pays"
          class="w-full border rounded-lg p-2 bg-gray-100 focus:ring-2 focus:ring-primary"
        >
          <option value="">Sélectionner un pays</option>
          <option>Côte d'Ivoire</option>
          <option>France</option>
          <option>USA</option>
          <option>Japon</option>
          <option>Autre...</option>
        </select>
      </div>

      <div>
        <label class="block mb-2 text-gray-700">Région / État</label>
        <input
          v-model="newEvent.region"
          type="text"
          class="w-full border rounded-lg p-2 bg-gray-100 focus:ring-2 focus:ring-primary"
        />
      </div>

      <div>
        <label class="block mb-2 text-gray-700">Code Postal</label>
        <input
          v-model="newEvent.codePostal"
          type="text"
          class="w-full border rounded-lg p-2 bg-gray-100 focus:ring-2 focus:ring-primary"
        />
      </div>

      <div>
        <label class="block mb-2 text-gray-700"
          >Date de l'Événement <span class="text-red-500">*</span></label
        >
        <input
          v-model="newEvent.date"
          type="date"
          required
          class="w-full border rounded-lg p-2 bg-gray-100 focus:ring-2 focus:ring-primary"
        />
      </div>

      <div>
        <label class="block mb-2 text-gray-700"
          >Heure de l'Événement <span class="text-red-500">*</span></label
        >
        <input
          v-model="newEvent.heure"
          type="time"
          required
          class="w-full border rounded-lg p-2 bg-gray-100 focus:ring-2 focus:ring-primary"
        />
      </div>

      <div>
        <label class="block mb-2 text-gray-700">Lien <span class="text-red-500">*</span></label>
        <input
          v-model="newEvent.lien"
          type="text"
          required
          class="w-full border rounded-lg p-2 bg-gray-100 focus:ring-2 focus:ring-primary"
        />
      </div>

      <!-- Bouton d'envoi -->
      <div class="col-span-2 flex justify-center mt-6">
        <button
          type="submit"
          class="bg-primary text-white px-8 py-2 rounded-lg font-semibold hover:bg-primary-dark transition"
        >
          Soumettre
        </button>
      </div>
    </form>

    <!-- 🟩 Badge QR Code style ticket -->
    <div
      v-if="showQrCard"
      class="fixed inset-0 flex flex-col items-center justify-center bg-white z-50 overflow-y-auto p-4"
    >
      <div class="self-start ml-6 mb-4">
        <button
          @click="fermerBadge"
          class="flex items-center text-primary font-semibold hover:text-primary-dark transition-colors"
        >
          <i class="bx bx-arrow-back text-xl mr-2"></i> Retour
        </button>
      </div>

      <div
        class="relative bg-primary text-white w-full max-w-sm rounded-3xl shadow-lg overflow-hidden p-6"
      >
        <div class="flex justify-center -mt-14 mb-4">
          <div
            class="w-28 h-28 bg-white rounded-full flex items-center justify-center shadow-md border-4 border-primary"
          >
            <img :src="logo" alt="Logo" class="w-20 h-20 object-contain" />
          </div>
        </div>

        <div class="flex justify-center mb-4">
          <div class="bg-white p-4 rounded-xl">
            <img :src="qrCodeUrl" alt="QR Code" class="w-40 h-40" />
          </div>
        </div>

        <div class="flex justify-center mb-3">
          <div class="text-white font-medium">Ticket #{{ eventForBadge.id || '001' }}</div>
        </div>

        <div class="border-t-2 border-dashed border-white w-3/4 mx-auto mb-4"></div>

        <div class="grid grid-cols-2 gap-3 text-sm">
          <div class="flex items-start space-x-2">
            <i class="bx bx-calendar text-xl"></i>
            <div>
              <h3 class="font-bold">Event</h3>
              <p>{{ eventForBadge.nom }}</p>
              <p class="text-xs">By {{ eventForBadge.entreprise }}</p>
            </div>
          </div>

          <div class="flex items-start space-x-2">
            <i class="bx bx-envelope text-xl"></i>
            <div>
              <h3 class="font-bold">Lieu</h3>
              <p class="text-xs">{{ eventForBadge.lieu }}</p>
            </div>
          </div>

          <div class="flex items-start space-x-2">
            <i class="bx bx-phone text-xl"></i>
            <div>
              <h3 class="font-bold">Date</h3>
              <p class="text-xs">{{ eventForBadge.date }}</p>
            </div>
          </div>

          <div class="flex items-start space-x-2">
            <i class="bx bx-time text-xl"></i>
            <div>
              <h3 class="font-bold">Heure</h3>
              <p class="text-xs">{{ eventForBadge.heure }}</p>
            </div>
          </div>
        </div>

        <div class="flex justify-center gap-4 mt-6">
          <button
            class="bg-primary text-white px-6 py-3 rounded-lg flex items-center gap-2 shadow hover:bg-primary-dark transition-colors"
          >
            <i class="bx bx-share-alt"></i> Partager
          </button>
          <button
            class="bg-primary text-white px-6 py-3 rounded-lg flex items-center gap-2 shadow hover:bg-primary-dark transition-colors"
          >
            <i class="bx bx-download"></i> Capturer
          </button>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref } from 'vue'
import avatarDefaut from '@/assets/avatar-defaut.svg'

const emit = defineEmits(['add-event'])

const newEvent = ref({
  entreprise: '',
  nom: '',
  lieu: '',
  adresse: '',
  ville: '',
  pays: '',
  region: '',
  codePostal: '',
  date: '',
  heure: '',
  lien: '',
})

const eventForBadge = ref({
  id: '',
  nom: '',
  entreprise: '',
  lieu: '',
  date: '',
  heure: '',
})

const qrCodeUrl = ref('')
const showQrCard = ref(false)
// Logo par defaut du badge, tant que l'evenement n'en porte pas.
const logo = ref(avatarDefaut)

function ajouterEvenement() {
  if (
    !newEvent.value.nom ||
    !newEvent.value.entreprise ||
    !newEvent.value.lieu ||
    !newEvent.value.date ||
    !newEvent.value.heure ||
    !newEvent.value.lien
  ) {
    alert('Veuillez remplir tous les champs obligatoires !')
    return
  }

  eventForBadge.value = {
    id: Math.floor(Math.random() * 1000)
      .toString()
      .padStart(3, '0'),
    nom: newEvent.value.nom,
    entreprise: newEvent.value.entreprise,
    lieu: newEvent.value.lieu,
    date: newEvent.value.date,
    heure: newEvent.value.heure,
  }

  // QR code avec le lien complet de l'événement
  qrCodeUrl.value = `https://api.qrserver.com/v1/create-qr-code/?size=200x200&data=${encodeURIComponent(newEvent.value.lien)}`

  showQrCard.value = true
  emit('add-event', { ...newEvent.value, qrCode: qrCodeUrl.value })

  console.log('QR Code généré et affiché !')
}

function fermerBadge() {
  showQrCard.value = false

  // Réinitialiser le formulaire uniquement quand on ferme le badge
  newEvent.value = {
    entreprise: '',
    nom: '',
    lieu: '',
    adresse: '',
    ville: '',
    pays: '',
    region: '',
    codePostal: '',
    date: '',
    heure: '',
    lien: '',
  }

  console.log('Badge fermé et formulaire réinitialisé')
}
</script>
