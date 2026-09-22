<template>
  <div
    class="fixed inset-0 z-[1100] flex items-center justify-center bg-black/40 p-4"
    role="dialog"
    aria-modal="true"
    :aria-label="titre"
    @click.self="$emit('fermer')"
  >
    <div class="bg-white rounded-2xl shadow-xl w-full max-w-lg max-h-full flex flex-col">
      <div class="flex-none flex items-center justify-between px-6 py-4 border-b border-gray-100">
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
      <div class="flex-1 min-h-0 overflow-y-auto p-6"><slot /></div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { onMounted, onUnmounted } from 'vue'

/**
 * Boite modale bornee a la hauteur de la fenetre.
 *
 * Le contenu defile DANS la boite, pas derriere elle : un formulaire plus
 * haut que l'ecran poussait auparavant son propre titre hors du cadre, et il
 * fallait dezoomer le navigateur pour voir le bouton d'enregistrement. Un
 * redacteur n'a pas ce reflexe.
 *
 * `max-h-full` borne l'enfant du conteneur centre, et `min-h-0` sur la zone
 * defilante leve la hauteur minimale implicite d'un element flex, sans
 * laquelle il refuserait de retrecir et deborderait a nouveau.
 *
 * Le plan doit passer AU-DESSUS du cadre d'administration : la barre du haut
 * est en `z-[999]` et la colonne laterale en `z-[1000]`, si bien qu'un voile
 * en `z-50` laissait la barre recouvrir l'entete de la boite. Son titre et sa
 * croix de fermeture disparaissaient derriere.
 */
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
