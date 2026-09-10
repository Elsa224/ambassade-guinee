<template>
  <div v-if="show" class="fixed inset-0 flex items-center justify-center bg-black/50 z-50 p-4">
    <div class="bg-white rounded-2xl w-full max-w-2xl max-h-[90vh] overflow-hidden">
      <!-- En-tête -->
      <div class="bg-gradient-to-r from-green-500 to-teal-600 p-6 text-white">
        <div class="flex justify-between items-center">
          <div>
            <h3 class="text-2xl font-bold">📝 Nouveau Document</h3>
            <p class="text-green-100 mt-1">Ajoutez un nouveau document au système</p>
          </div>
          <button
            @click="$emit('close')"
            class="text-white hover:bg-white/20 rounded-full w-10 h-10 flex items-center justify-center transition-colors"
          >
            <i class="bx bx-x text-2xl"></i>
          </button>
        </div>
      </div>

      <!-- Formulaire -->
      <form
        @submit.prevent="$emit('submit', formData)"
        class="p-6 overflow-y-auto max-h-[calc(90vh-200px)]"
      >
        <div class="space-y-6">
          <div class="grid md:grid-cols-2 gap-6">
            <div>
              <label class="block text-sm font-semibold text-gray-700 mb-2"
                >Entreprise destinataire *</label
              >
              <input
                v-model="formData.compagnie"
                type="text"
                placeholder="Ex: SCB"
                required
                class="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-green-500 focus:border-transparent outline-none transition-all"
              />
            </div>
            <div>
              <label class="block text-sm font-semibold text-gray-700 mb-2"
                >Titre du document *</label
              >
              <input
                v-model="formData.titre"
                type="text"
                placeholder="Permission RE"
                required
                class="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-green-500 focus:border-transparent outline-none transition-all"
              />
            </div>
          </div>

          <div>
            <label class="block text-sm font-semibold text-gray-700 mb-2">Document *</label>
            <div
              class="border-2 border-dashed border-gray-300 rounded-xl p-6 text-center hover:border-green-500 transition-colors"
            >
              <i class="bx bx-cloud-upload text-3xl text-gray-400 mb-2"></i>
              <p class="text-gray-600 mb-2">Glissez-déposez votre fichier ou</p>
              <input type="file" required class="hidden" id="file-upload-new" />
              <label
                for="file-upload-new"
                class="bg-green-500 text-white px-4 py-2 rounded-lg hover:bg-green-600 transition-colors cursor-pointer"
              >
                Parcourir les fichiers
              </label>
            </div>
          </div>

          <div>
            <label class="block text-sm font-semibold text-gray-700 mb-2">Description</label>
            <textarea
              v-model="formData.description"
              rows="4"
              placeholder="Description détaillée du document..."
              class="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-green-500 focus:border-transparent outline-none transition-all"
            ></textarea>
          </div>
        </div>

        <!-- Actions -->
        <div class="flex justify-center gap-4 mt-8 pt-6 border-t">
          <button
            type="button"
            @click="$emit('close')"
            class="px-8 py-3 border border-gray-300 text-gray-700 rounded-xl hover:bg-gray-50 transition-colors font-semibold flex items-center gap-2"
          >
            <i class="bx bx-x"></i>
            Annuler
          </button>
          <button
            type="submit"
            class="px-8 py-3 bg-green-500 text-white rounded-xl hover:bg-green-600 transition-colors font-semibold flex items-center gap-2"
          >
            <i class="bx bx-check"></i>
            Soumettre
          </button>
        </div>
      </form>
    </div>
  </div>
</template>

<script setup>
import { reactive, watch } from 'vue'

defineProps({
  show: Boolean,
})

defineEmits(['close', 'submit'])

const formData = reactive({
  compagnie: '',
  titre: '',
  description: '',
})

watch(
  () => formData,
  () => {
    // Reset form when modal opens
  },
  { deep: true },
)
</script>
