<template>
  <div
    v-if="company"
    class="fixed inset-0 flex flex-col items-center justify-center bg-black/50 z-50 overflow-auto pt-4"
  >
    <!-- Bouton Retour en haut -->
    <div class="self-start ml-6 mb-4">
      <button
        @click="$emit('close')"
        class="flex items-center text-ink font-semibold hover:text-ink-dark transition-colors"
      >
        <i class="bx bx-arrow-back text-xl mr-2"></i> Retour
      </button>
    </div>

    <!-- Carte principale -->
    <div class="relative bg-ink text-white w-96 rounded-3xl shadow-lg overflow-hidden pt-4 pb-6">
      <!-- Bouton fermeture X en haut à droite -->
      <button
        @click="$emit('close')"
        class="absolute top-3 right-3 text-white bg-black/25 rounded-full w-7 h-7 flex items-center justify-center hover:bg-black/40"
      >
        &times;
      </button>

      <!-- Cercle Logo -->
      <div class="flex justify-center">
        <div
          class="w-28 h-28 bg-white rounded-full flex items-center justify-center shadow-md border-4 border-ink -mt-14"
        >
          <img :src="company.logo" alt="Logo" class="w-20 h-20 object-contain mt-4" />
        </div>
      </div>

      <!-- Corps -->
      <div class="relative mt-2 px-6">
        <!-- Découpes arrondies -->
        <div
          class="absolute top-1/2 left-0 transform -translate-y-1/2 bg-white rounded-r-full w-6 h-6"
        ></div>
        <div
          class="absolute top-1/2 right-0 transform -translate-y-1/2 bg-white rounded-l-full w-6 h-6"
        ></div>

        <!-- QR Code -->
        <div class="flex justify-center mb-4">
          <div class="bg-white p-4 rounded-xl">
            <img :src="company.qrCode" alt="QR Code" class="w-28 h-28" />
          </div>
        </div>

        <!-- Ticket -->
        <div class="flex justify-center mb-1">
          <div class="text-white font-medium">Ticket #{{ company.id || '0001' }}</div>
        </div>

        <!-- Ligne pointillée -->
        <div class="border-t-2 border-dashed border-white w-3/4 mx-auto mb-3"></div>

        <!-- Informations -->
        <div class="grid grid-cols-2 gap-3 mb-6 text-sm">
          <div class="flex items-start space-x-2">
            <i class="bx bx-calendar text-xl"></i>
            <div>
              <h3 class="font-bold">Event</h3>
              <p>{{ company.eventName || 'Déjeuner RHDP DMV' }}</p>
              <p class="text-xs">By {{ company.host || 'Ministre ADOM KACOU LEON' }}</p>
            </div>
          </div>

          <div class="flex items-start space-x-2">
            <i class="bx bx-map text-xl"></i>
            <div>
              <h3 class="font-bold">Location</h3>
              <p>{{ company.location || 'MORTON’S THE STEAKHOUSE' }}</p>
            </div>
          </div>

          <div class="flex items-start space-x-2">
            <i class="bx bx-current-location text-xl"></i>
            <div>
              <h3 class="font-bold">Adresse</h3>
              <p class="text-xs leading-tight">
                {{ company.address || '1050 Connecticut Ave NW, Washington DC' }}
              </p>
            </div>
          </div>

          <div class="flex items-start space-x-2">
            <i class="bx bx-time text-xl"></i>
            <div>
              <h3 class="font-bold">Date</h3>
              <p>{{ company.date || '11 Octobre 2025' }}</p>
              <p class="text-xs">{{ company.time || '13h00 - 14h00' }}</p>
            </div>
          </div>
        </div>
      </div>
    </div>

    <!-- Boutons bas -->
    <div class="flex justify-center gap-4 mt-4 mb-8">
      <button
        class="bg-ink text-white px-6 py-3 rounded-lg flex items-center gap-2 shadow hover:bg-ink-dark transition-colors"
      >
        <i class="bx bx-share-alt"></i> Partager
      </button>
      <button
        class="bg-ink text-white px-6 py-3 rounded-lg flex items-center gap-2 shadow hover:bg-ink-dark transition-colors"
      >
        <i class="bx bx-download"></i> Capturer
      </button>
    </div>
  </div>
</template>

<script setup lang="ts">
interface Company {
  logo?: string
  qrCode?: string
  id?: string
  eventName?: string
  host?: string
  location?: string
  address?: string
  date?: string
  time?: string
}

defineProps<{ company: Company }>()
</script>
