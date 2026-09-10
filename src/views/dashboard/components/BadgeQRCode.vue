<template>
  <!-- Page complète du badge QR -->
  <div
    class="fixed inset-0 flex flex-col items-center min-h-screen bg-white z-50 overflow-y-auto pt-6"
  >
    <!-- 🔙 Bouton Retour -->
    <div class="self-start ml-6 mb-4">
      <router-link
        to="/app/evenement/liste"
        class="flex items-center text-primary font-semibold hover:text-primary-dark transition-colors"
      >
        <i class="bx bx-arrow-back text-xl mr-2"></i> Retour
      </router-link>
    </div>

    <!-- 🎟️ Carte du badge -->
    <div
      class="relative bg-primary text-white w-96 rounded-3xl shadow-lg overflow-hidden pt-2 mb-6"
    >
      <!-- Logo -->
      <div class="flex justify-center">
        <div
          class="w-28 h-28 bg-white rounded-full flex items-center justify-center shadow-md border-4 border-primary -mt-14"
        >
          <img :src="logo" alt="Logo" class="w-20 h-20 object-contain mt-6" />
        </div>
      </div>

      <!-- Corps -->
      <div class="relative mt-1 px-6">
        <!-- Découpes latérales -->
        <div
          class="absolute top-1/2 left-0 transform -translate-y-1/2 bg-white rounded-r-full w-6 h-6"
        ></div>
        <div
          class="absolute top-1/2 right-0 transform -translate-y-1/2 bg-white rounded-l-full w-6 h-6"
        ></div>

        <!-- QR Code -->
        <div class="flex justify-center mb-4">
          <div class="bg-white p-4 rounded-xl">
            <img :src="qrCodeUrl" alt="QR Code" class="w-40 h-40" />
          </div>
        </div>

        <!-- Ticket info -->
        <div class="flex justify-center mb-1">
          <div class="text-white font-medium">Ticket #{{ request.id }}</div>
        </div>

        <!-- Ligne pointillée -->
        <div class="border-t-2 border-dashed border-white w-3/4 mx-auto mb-3"></div>

        <!-- Détails -->
        <div class="grid grid-cols-2 gap-3 mb-6 text-sm">
          <div class="flex items-start space-x-2">
            <i class="bx bx-calendar text-xl"></i>
            <div>
              <h3 class="font-bold">Event</h3>
              <p>{{ request.reason }}</p>
              <p class="text-xs">By {{ request.host }}</p>
            </div>
          </div>

          <div class="flex items-start space-x-2">
            <i class="bx bx-envelope text-xl"></i>
            <div>
              <h3 class="font-bold">Email</h3>
              <p class="text-xs">{{ request.email }}</p>
            </div>
          </div>

          <div class="flex items-start space-x-2">
            <i class="bx bx-phone text-xl"></i>
            <div>
              <h3 class="font-bold">Contact</h3>
              <p class="text-xs">{{ request.contact }}</p>
            </div>
          </div>

          <div class="flex items-start space-x-2">
            <i class="bx bx-time text-xl"></i>
            <div>
              <h3 class="font-bold">Date</h3>
              <p>11 Octobre 2025</p>
              <p class="text-xs">13h00 - 14h00</p>
            </div>
          </div>
        </div>
      </div>
    </div>

    <!-- Boutons bas -->
    <div class="flex justify-center gap-4 mb-8">
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
</template>

<script setup>
import { ref } from "vue";

// Logo et QR par défaut
const logo = ref("/logo.png"); // Mets ton vrai logo ici
const qrCodeUrl = ref("https://api.qrserver.com/v1/create-qr-code/?size=150x150&data=ExempleQR");

// Exemple de données du badge (à remplacer dynamiquement plus tard)
const request = ref({
  id: "SCB-001",
  reason: "Forum Sécurité Digitale",
  host: "SCB Group",
  email: "contact@scbgroup.com",
  contact: "+225 07 07 07 07",
});
</script>
