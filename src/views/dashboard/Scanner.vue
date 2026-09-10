<template>
  <div class="p-6 bg-gray-100 min-h-screen">
    <!-- Titre dynamique -->
    <h2 class="text-2xl font-bold text-gray-700 mb-4">
      {{ pageTitle }}
    </h2>

    <!-- Bouton retour à la liste -->
    <div class="mb-4">
      <button
        v-if="route.name !== 'ListeQRCode'"
        @click="goToList"
        class="px-4 py-2 rounded-lg hover:bg-gray-300 transition"
      >
        ← Retour à la liste
      </button>
    </div>

    <!-- Navigation entre sous-pages (liste supprimée) -->
    <div class="flex flex-col md:flex-row items-center justify-between mb-6 gap-4">
      <div class="flex gap-4">
        <RouterLink
          to="/dashboard/scanner/scan"
          :class="btnClass('ScannerQRCode')"
        >Scanner un code</RouterLink>

        <RouterLink
          to="/dashboard/scanner/manuel"
          :class="btnClass('QRManuel')"
        >QR Code manuel</RouterLink>

        <RouterLink
          to="/dashboard/scanner/creer"
          :class="btnClass('CreerQRCode')"
        >Créer QR code</RouterLink>
      </div>
    </div>

    <!-- Contenu automatique selon la sous-route -->
    <RouterView />
  </div>
</template>

<script setup lang="ts">
import { computed, onMounted } from 'vue';
import { useRoute, useRouter } from 'vue-router';

const route = useRoute();
const router = useRouter();

// Redirection automatique vers la liste si on tape juste /app/scanner
onMounted(() => {
  if (route.path === '/app/scanner') {
    router.replace({ name: 'ListeQRCode' });
  }
});

// Titre dynamique
const pageTitle = computed(() => {
  switch (route.name) {
    case 'ScannerQRCode': return ' Scanner un code';
    case 'QRManuel': return 'QR Code manuel';
    case 'ListeQRCode': return ' Liste QR Code';
    case 'CreerQRCode': return ' Créer un QR Code';
    default: return 'La gestion des QR Codes';
  }
});

// Bouton retour à la liste
function goToList() {
  router.push({ name: 'ListeQRCode' });
}

// Style des boutons
function btnClass(tab: string) {
  return route.name === tab
    ? 'bg-primary text-white px-3 py-2 rounded-lg font-semibold hover:bg-primary hover:text-white transition'
    : 'border-2 border-primary text-primary px-3 py-2 rounded-lg font-semibold hover:bg-primary hover:text-white transition';
}
</script>
