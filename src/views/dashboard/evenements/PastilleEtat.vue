<script setup lang="ts">
import { computed } from 'vue'

/**
 * Pastille d'etat, lue d'un coup d'oeil.
 *
 * Le ton porte l'information autant que le mot : sur un tableau de vingt
 * lignes, personne ne lit vingt fois le libelle. La forme reste distincte du
 * ton pour qui ne percoit pas la couleur, d'ou le point et le texte.
 */
const props = defineProps<{
  libelle: string
  ton: 'positif' | 'neutre' | 'attention' | 'eteint'
}>()

const TONS = {
  positif: 'bg-emerald-50 text-emerald-800 ring-emerald-600/20',
  neutre: 'bg-sky-50 text-sky-800 ring-sky-600/20',
  attention: 'bg-amber-50 text-amber-900 ring-amber-600/25',
  eteint: 'bg-gray-100 text-gray-600 ring-gray-500/20',
} as const

const POINTS = {
  positif: 'bg-emerald-500',
  neutre: 'bg-sky-500',
  attention: 'bg-amber-500',
  eteint: 'bg-gray-400',
} as const

const habillage = computed(() => TONS[props.ton])
const point = computed(() => POINTS[props.ton])
</script>

<template>
  <span
    class="inline-flex items-center gap-1.5 rounded-full px-2.5 py-1 text-xs font-medium ring-1 ring-inset whitespace-nowrap"
    :class="habillage"
  >
    <span class="w-1.5 h-1.5 rounded-full" :class="point" aria-hidden="true"></span>
    {{ libelle }}
  </span>
</template>
