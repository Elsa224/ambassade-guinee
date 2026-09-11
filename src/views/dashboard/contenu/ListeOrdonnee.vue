<template>
  <section class="bg-white shadow-sm rounded-xl p-6">
    <div class="flex items-start justify-between gap-4 mb-5">
      <div>
        <h3 class="text-lg font-semibold text-primary">{{ titre }}</h3>
        <p class="text-sm text-gray-500 mt-0.5">{{ description }}</p>
      </div>
      <EtatSection :rempli="elements.length > 0" />
    </div>

    <!-- Etat vide : il dit ce qui se passe, pas seulement qu'il n'y a rien. -->
    <p
      v-if="elements.length === 0"
      class="text-sm text-gray-500 bg-gray-50 border border-dashed border-gray-200 rounded-lg px-4 py-8 text-center"
    >
      Rien n'est encore enregistré. Cette section n'apparaît pas sur le site.
    </p>

    <ul v-else class="divide-y divide-gray-100">
      <li
        v-for="(element, index) in elements"
        :key="element.id"
        class="flex items-center gap-4 py-3"
      >
        <span class="text-sm font-semibold text-gray-400 tabular-nums w-5 shrink-0">
          {{ index + 1 }}
        </span>

        <div class="flex items-center gap-4 flex-1 min-w-0">
          <slot name="apercu" :element="element" />
        </div>

        <div class="flex items-center gap-1 shrink-0">
          <button
            type="button"
            class="p-2 rounded-lg text-gray-500 hover:bg-gray-100 disabled:opacity-30 disabled:hover:bg-transparent"
            :disabled="index === 0"
            :aria-label="`Monter ${libelleElement(element)}`"
            @click="$emit('monter', element.id)"
          >
            <i class="bx bx-up-arrow-alt text-lg" aria-hidden="true"></i>
          </button>
          <button
            type="button"
            class="p-2 rounded-lg text-gray-500 hover:bg-gray-100 disabled:opacity-30 disabled:hover:bg-transparent"
            :disabled="index === elements.length - 1"
            :aria-label="`Descendre ${libelleElement(element)}`"
            @click="$emit('descendre', element.id)"
          >
            <i class="bx bx-down-arrow-alt text-lg" aria-hidden="true"></i>
          </button>
          <button
            type="button"
            class="p-2 rounded-lg text-gray-600 hover:bg-gray-100"
            :aria-label="`Modifier ${libelleElement(element)}`"
            @click="$emit('modifier', element.id)"
          >
            <i class="bx bx-edit-alt text-lg" aria-hidden="true"></i>
          </button>
          <button
            type="button"
            class="p-2 rounded-lg text-red-700 hover:bg-red-50"
            :aria-label="`Retirer ${libelleElement(element)}`"
            @click="$emit('supprimer', element.id)"
          >
            <i class="bx bx-trash text-lg" aria-hidden="true"></i>
          </button>
        </div>
      </li>
    </ul>

    <button
      type="button"
      class="mt-5 inline-flex items-center gap-2 text-sm font-semibold text-primary hover:underline"
      @click="$emit('ajouter')"
    >
      <i class="bx bx-plus" aria-hidden="true"></i>
      {{ libelleAjout }}
    </button>
  </section>
</template>

<script setup lang="ts" generic="T extends ElementOrdonne">
import EtatSection from './EtatSection.vue'

/**
 * Le minimum dont la liste a besoin. Le composant reste generique : chaque
 * appelant passe ses propres elements et son propre apercu, sans que la liste
 * connaisse la forme d'un dirigeant ou d'une photo.
 */
export interface ElementOrdonne {
  id: number
  name?: string
  alt?: string | null
}

defineProps<{
  titre: string
  description: string
  libelleAjout: string
  elements: readonly T[]
}>()

defineEmits<{
  monter: [id: number]
  descendre: [id: number]
  modifier: [id: number]
  supprimer: [id: number]
  ajouter: []
}>()

/**
 * Nomme l'element dans les libelles d'accessibilite.
 *
 * Quatre boutons par ligne, tous identiques a la lecture d'ecran : sans ce
 * nom, « Modifier » cinq fois de suite ne dit pas quoi.
 */
function libelleElement(element: T): string {
  return element.name ?? element.alt ?? "l'élément"
}
</script>
