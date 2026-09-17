<template>
  <div ref="racine" class="relative">
    <button
      :id="id"
      ref="declencheur"
      type="button"
      role="combobox"
      :disabled="desactive"
      :aria-expanded="ouvert"
      :aria-controls="ouvert ? listeId : undefined"
      aria-haspopup="listbox"
      class="flex w-full items-center justify-between gap-2 rounded-lg border bg-white px-4 py-2.5 text-left transition-colors disabled:bg-gray-50 disabled:text-gray-500"
      :class="
        desactive
          ? 'border-gray-200'
          : ouvert
            ? 'border-primary ring-2 ring-primary/30'
            : 'border-gray-300 hover:border-gray-400'
      "
      @click="basculer"
      @keydown="surToucheDuDeclencheur"
    >
      <span class="truncate" :class="choisi === undefined ? 'text-gray-400' : 'text-gray-900'">
        {{ choisi?.libelle ?? placeholder }}
      </span>
      <i
        class="bx bx-chevron-down shrink-0 text-xl transition-transform"
        :class="ouvert ? 'rotate-180 text-primary' : 'text-gray-400'"
        aria-hidden="true"
      ></i>
    </button>

    <ul
      v-if="ouvert"
      :id="listeId"
      ref="liste"
      role="listbox"
      tabindex="-1"
      class="absolute z-30 mt-2 max-h-64 w-full overflow-y-auto rounded-xl border border-gray-200 bg-white p-1.5 shadow-xl"
      @keydown="surToucheDeLaListe"
    >
      <li v-if="options.length === 0" class="px-3 py-2 text-sm text-gray-400">
        Aucune option disponible
      </li>
      <li v-for="(option, rang) in options" :key="String(option.valeur)">
        <button
          ref="entrees"
          type="button"
          role="option"
          :aria-selected="option.valeur === modelValue"
          :tabindex="rang === actif ? 0 : -1"
          class="flex w-full items-center justify-between gap-2 rounded-lg px-3 py-2 text-left text-sm transition-colors"
          :class="
            option.valeur === modelValue
              ? 'bg-primary/10 font-medium text-primary'
              : 'text-gray-700 hover:bg-gray-100'
          "
          @click="choisir(option.valeur)"
          @focus="actif = rang"
        >
          <span class="truncate">{{ option.libelle }}</span>
          <i
            v-if="option.valeur === modelValue"
            class="bx bx-check shrink-0 text-lg"
            aria-hidden="true"
          ></i>
        </button>
      </li>
    </ul>
  </div>
</template>

<script setup lang="ts">
import { computed, nextTick, onBeforeUnmount, ref, useId, useTemplateRef, watch } from 'vue'

/** Une entree de la liste : ce qu'on envoie, et ce qu'on lit. */
export interface OptionSelect {
  /**
   * `null` est une valeur legitime, pas une absence : c'est ce qu'on envoie
   * pour « Sans type », « Aucune categorie » ou tout autre choix explicite
   * de ne rien designer. Le texte indicatif ne s'affiche donc que si aucune
   * option ne porte la valeur courante.
   */
  valeur: string | number | null
  libelle: string
}

/**
 * Liste deroulante du gabarit, en remplacement de `<select>`.
 *
 * Le `<select>` natif pose le meme probleme que le champ de date : son menu
 * est dessine par le systeme, pas par la feuille de style, et il ne ressemble
 * a rien d'autre dans le tableau de bord. Celui-ci reprend l'aspect des
 * autres champs et le meme jeu de couleurs du tenant.
 *
 * Le contrat de valeur reste celui du natif — le modele porte la valeur de
 * l'option, pas son libelle — pour que le remplacement ne touche a aucune
 * logique de formulaire.
 */
const { modelValue, options, ...proprietes } = defineProps<{
  /**
   * Valeur courante. `null` et `undefined` designent tous deux « rien de
   * choisi » : le premier vient des contrats de l'API, le second d'un champ
   * facultatif de formulaire. Le texte indicatif s'affiche alors.
   */
  modelValue: string | number | null | undefined
  options: readonly OptionSelect[]
  id?: string
  desactive?: boolean
  placeholder?: string
}>()

const emit = defineEmits<{ 'update:modelValue': [valeur: string | number | null] }>()

const listeId = useId()
const racine = useTemplateRef<HTMLDivElement>('racine')
const declencheur = useTemplateRef<HTMLButtonElement>('declencheur')
const entrees = useTemplateRef<HTMLButtonElement[]>('entrees')

const ouvert = ref(false)
/** Rang de l'entree qui porte le focus, pour les fleches. */
const actif = ref(0)

const placeholder = computed(() => proprietes.placeholder ?? 'Choisir…')

const choisi = computed(() => options.find((option) => option.valeur === modelValue))

/** Rang de la valeur courante, ou 0 quand rien n'est choisi. */
function rangCourant(): number {
  const rang = options.findIndex((option) => option.valeur === modelValue)
  return rang === -1 ? 0 : rang
}

function ouvrir(rang = rangCourant()): void {
  if (proprietes.desactive === true || options.length === 0) return
  actif.value = rang
  ouvert.value = true
  void nextTick(() => entrees.value?.[actif.value]?.focus())
}

function fermer(): void {
  ouvert.value = false
}

function fermerEtRendreLeFocus(): void {
  fermer()
  declencheur.value?.focus()
}

function basculer(): void {
  if (ouvert.value) fermerEtRendreLeFocus()
  else ouvrir()
}

function choisir(valeur: string | number | null): void {
  emit('update:modelValue', valeur)
  fermerEtRendreLeFocus()
}

function deplacer(pas: number): void {
  const total = options.length
  if (total === 0) return
  actif.value = (actif.value + pas + total) % total
  void nextTick(() => entrees.value?.[actif.value]?.focus())
}

function surToucheDuDeclencheur(evenement: KeyboardEvent): void {
  if (evenement.key === 'ArrowDown' || evenement.key === 'Enter' || evenement.key === ' ') {
    evenement.preventDefault()
    ouvrir()
    return
  }
  if (evenement.key === 'ArrowUp') {
    evenement.preventDefault()
    ouvrir(options.length - 1)
  }
}

function surToucheDeLaListe(evenement: KeyboardEvent): void {
  switch (evenement.key) {
    case 'ArrowDown':
      evenement.preventDefault()
      deplacer(1)
      break
    case 'ArrowUp':
      evenement.preventDefault()
      deplacer(-1)
      break
    case 'Home':
      evenement.preventDefault()
      actif.value = 0
      void nextTick(() => entrees.value?.[0]?.focus())
      break
    case 'End':
      evenement.preventDefault()
      actif.value = options.length - 1
      void nextTick(() => entrees.value?.[actif.value]?.focus())
      break
    case 'Escape':
      evenement.preventDefault()
      fermerEtRendreLeFocus()
      break
    case 'Tab':
      fermer()
      break
    default:
      break
  }
}

function surClicExterieur(evenement: MouseEvent): void {
  if (!ouvert.value) return
  if (racine.value?.contains(evenement.target as Node) === true) return
  fermer()
}

watch(ouvert, (estOuvert) => {
  if (estOuvert) document.addEventListener('mousedown', surClicExterieur)
  else document.removeEventListener('mousedown', surClicExterieur)
})

onBeforeUnmount(() => document.removeEventListener('mousedown', surClicExterieur))
</script>
