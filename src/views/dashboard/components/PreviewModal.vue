<template>
  <div v-if="show" class="fixed inset-0 flex items-center justify-center bg-black/50 z-50 p-4">
    <div class="bg-white rounded-2xl w-full max-w-4xl max-h-[90vh] overflow-hidden">
      <!-- En-tête -->
      <div class="bg-gradient-to-r from-blue-500 to-purple-600 p-6 text-white">
        <div class="flex justify-between items-center">
          <div>
            <h3 class="text-2xl font-bold">🧾 Aperçu du Document</h3>
            <p class="text-blue-100 mt-1">{{ document?.titre }}</p>
          </div>
          <button
            @click="$emit('close')"
            class="text-white hover:bg-white/20 rounded-full w-10 h-10 flex items-center justify-center transition-colors"
          >
            <i class="bx bx-x text-2xl"></i>
          </button>
        </div>
      </div>

      <!-- Contenu -->
      <div class="p-6 overflow-y-auto max-h-[calc(90vh-200px)]">
        <!-- En-tête document -->
        <div class="flex justify-center mb-6">
          <div
            class="bg-gradient-to-r from-orange-400 to-orange-600 text-white p-8 rounded-2xl text-center w-full max-w-md"
          >
            <img
              src="https://upload.wikimedia.org/wikipedia/commons/5/5b/Orange_logo.svg"
              alt="Orange"
              class="h-12 mx-auto mb-4"
            />
            <div class="text-2xl font-bold uppercase tracking-wide">PAIEMENT DE SALAIRE</div>
          </div>
        </div>

        <!-- Informations -->
        <div class="grid md:grid-cols-2 gap-6 mb-6">
          <div class="space-y-4">
            <div class="flex items-center gap-3">
              <div class="w-12 h-12 bg-blue-100 rounded-lg flex items-center justify-center">
                <i class="bx bx-building text-blue-600 text-xl"></i>
              </div>
              <div>
                <p class="text-sm text-gray-600">Entreprise</p>
                <p class="font-semibold">{{ document?.compagnie }}</p>
              </div>
            </div>
            <div class="flex items-center gap-3">
              <div class="w-12 h-12 bg-green-100 rounded-lg flex items-center justify-center">
                <i class="bx bx-user text-green-600 text-xl"></i>
              </div>
              <div>
                <p class="text-sm text-gray-600">Émetteur</p>
                <p class="font-semibold">{{ document?.emetteur }}</p>
              </div>
            </div>
          </div>
          <div class="space-y-4">
            <div class="flex items-center gap-3">
              <div class="w-12 h-12 bg-purple-100 rounded-lg flex items-center justify-center">
                <i class="bx bx-calendar text-purple-600 text-xl"></i>
              </div>
              <div>
                <p class="text-sm text-gray-600">Date d'émission</p>
                <p class="font-semibold">{{ document?.dateEmission }}</p>
              </div>
            </div>
            <div class="flex items-center gap-3">
              <div class="w-12 h-12 bg-yellow-100 rounded-lg flex items-center justify-center">
                <i class="bx bx-file text-yellow-600 text-xl"></i>
              </div>
              <div>
                <p class="text-sm text-gray-600">Statut</p>
                <p class="font-semibold">{{ document?.statusApprobation }}</p>
              </div>
            </div>
          </div>
        </div>

        <!-- Description -->
        <div v-if="document?.description" class="bg-gray-50 rounded-xl p-4">
          <h4 class="font-semibold text-gray-700 mb-2">Description</h4>
          <p class="text-gray-600">{{ document.description }}</p>
        </div>
      </div>

      <!-- Actions -->
      <div class="border-t p-6 bg-gray-50">
        <div class="flex justify-center gap-4">
          <button
            @click="$emit('close')"
            class="px-8 py-3 border border-gray-300 text-gray-700 rounded-xl hover:bg-gray-50 transition-colors font-semibold flex items-center gap-2"
          >
            <i class="bx bx-x"></i>
            Fermer
          </button>
          <button
            v-if="document?.statusApprobation.includes('⏳')"
            @click="$emit('approve', document.id)"
            class="px-8 py-3 bg-green-500 text-white rounded-xl hover:bg-green-600 transition-colors font-semibold flex items-center gap-2"
          >
            <i class="bx bx-check"></i>
            Approuver le document
          </button>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
defineProps({
  show: Boolean,
  document: Object,
})

defineEmits(['close', 'approve'])
</script>
