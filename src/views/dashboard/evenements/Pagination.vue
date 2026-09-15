<script setup lang="ts">
import { computed } from 'vue'
import { bornesAffichees, type Pagination } from '@/api/evenements-admin'

/**
 * Navigation entre les pages.
 *
 * Le back garantit `total` et `totalPages` : on affiche donc un decompte
 * exact (« 61-90 sur 204 ») plutot qu'une navigation a l'aveugle ou seul le
 * bouton suivant renseigne sur ce qui reste.
 */
const props = defineProps<{ pagination: Pagination; desactive?: boolean }>()
const emit = defineEmits<{ page: [numero: number]; limite: [lignes: number] }>()

const LIGNES_POSSIBLES = [10, 20, 50, 100] as const

const bornes = computed(() => bornesAffichees(props.pagination))

/**
 * Numeros a afficher, la page courante toujours entouree.
 *
 * Au-dela de sept pages, les extremites restent accessibles et le milieu se
 * replie : une liste de deux cents pages deborderait la ligne.
 */
const numeros = computed<(number | 'saut')[]>(() => {
  const { page, totalPages } = props.pagination
  if (totalPages <= 7) return Array.from({ length: totalPages }, (_, i) => i + 1)
  const proches = [page - 1, page, page + 1].filter((n) => n > 1 && n < totalPages)
  const suite: (number | 'saut')[] = [1]
  if (proches[0] !== undefined && proches[0] > 2) suite.push('saut')
  suite.push(...proches)
  const dernierProche = proches[proches.length - 1]
  if (dernierProche !== undefined && dernierProche < totalPages - 1) suite.push('saut')
  suite.push(totalPages)
  return suite
})

function aller(numero: number) {
  if (numero === props.pagination.page || props.desactive) return
  emit('page', numero)
}
</script>

<template>
  <div
    class="flex flex-wrap items-center justify-between gap-4 border-t border-gray-200 px-5 py-3.5"
  >
    <p class="text-sm text-gray-600 tabular-nums">
      <template v-if="pagination.total === 0">Aucun évènement</template>
      <template v-else>
        <span class="font-medium text-gray-800">{{ bornes.premier }}–{{ bornes.dernier }}</span>
        sur {{ pagination.total }}
      </template>
    </p>

    <div class="flex items-center gap-4">
      <label class="flex items-center gap-2 text-sm text-gray-600">
        <span class="hidden sm:inline">Lignes</span>
        <select
          class="border border-gray-300 rounded-lg py-1.5 pl-2.5 pr-8 text-sm focus:outline-none focus:ring-2 focus:ring-primary/40 focus:border-primary"
          :value="pagination.limit"
          :disabled="desactive"
          @change="emit('limite', Number(($event.target as HTMLSelectElement).value))"
        >
          <option v-for="lignes in LIGNES_POSSIBLES" :key="lignes" :value="lignes">
            {{ lignes }}
          </option>
        </select>
      </label>

      <nav class="flex items-center gap-1" aria-label="Pages">
        <button
          type="button"
          class="px-2.5 py-1.5 rounded-lg text-sm text-gray-600 hover:bg-gray-100 disabled:opacity-40 disabled:hover:bg-transparent"
          :disabled="pagination.page <= 1 || desactive"
          @click="aller(pagination.page - 1)"
        >
          Précédent
        </button>

        <template v-for="(numero, rang) in numeros" :key="`${numero}-${rang}`">
          <span v-if="numero === 'saut'" class="px-1.5 text-gray-400" aria-hidden="true">…</span>
          <button
            v-else
            type="button"
            class="min-w-8 px-2.5 py-1.5 rounded-lg text-sm tabular-nums transition-colors"
            :class="
              numero === pagination.page
                ? 'bg-primary text-white font-semibold'
                : 'text-gray-700 hover:bg-gray-100'
            "
            :aria-current="numero === pagination.page ? 'page' : undefined"
            :aria-label="`Page ${numero}`"
            :disabled="desactive"
            @click="aller(numero)"
          >
            {{ numero }}
          </button>
        </template>

        <button
          type="button"
          class="px-2.5 py-1.5 rounded-lg text-sm text-gray-600 hover:bg-gray-100 disabled:opacity-40 disabled:hover:bg-transparent"
          :disabled="pagination.page >= pagination.totalPages || desactive"
          @click="aller(pagination.page + 1)"
        >
          Suivant
        </button>
      </nav>
    </div>
  </div>
</template>
