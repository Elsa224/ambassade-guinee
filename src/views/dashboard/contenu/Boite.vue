<template>
  <div
    class="fixed inset-0 z-50 flex items-start sm:items-center justify-center bg-black/40 p-4 overflow-y-auto"
    role="dialog"
    aria-modal="true"
    :aria-label="titre"
    @click.self="$emit('fermer')"
  >
    <div class="bg-white rounded-2xl shadow-xl w-full max-w-lg my-8">
      <div class="flex items-center justify-between px-6 py-4 border-b border-gray-100">
        <h3 class="text-lg font-semibold text-gray-800">{{ titre }}</h3>
        <button
          type="button"
          class="p-1 rounded-full hover:bg-gray-100 text-gray-500"
          aria-label="Fermer"
          @click="$emit('fermer')"
        >
          <i class="bx bx-x text-2xl" aria-hidden="true"></i>
        </button>
      </div>
      <div class="p-6"><slot /></div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { onMounted, onUnmounted } from 'vue'

defineProps<{ titre: string }>()
const emit = defineEmits<{ fermer: [] }>()

// Une boite modale qui ne se ferme pas a la touche d'echappement piege
// l'utilisateur au clavier.
function auClavier(evenement: KeyboardEvent): void {
  if (evenement.key === 'Escape') emit('fermer')
}

onMounted(() => document.addEventListener('keydown', auClavier))
onUnmounted(() => document.removeEventListener('keydown', auClavier))
</script>
