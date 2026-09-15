<template>
  <div ref="racine" class="relative">
    <div
      class="flex items-center rounded-lg border bg-white transition-colors"
      :class="
        desactive
          ? 'border-gray-200 bg-gray-50'
          : ouvert
            ? 'border-primary ring-2 ring-primary/30'
            : 'border-gray-300 hover:border-gray-400'
      "
    >
      <input
        :id="id"
        ref="saisie"
        :value="texte"
        :placeholder="placeholder"
        :disabled="desactive"
        :required="requis"
        type="text"
        inputmode="numeric"
        autocomplete="off"
        class="w-full rounded-lg bg-transparent px-4 py-2.5 text-gray-900 outline-none placeholder:text-gray-400 disabled:text-gray-500"
        @input="surSaisie"
        @blur="validerLaSaisie"
        @keydown.enter.prevent="validerLaSaisie"
        @keydown.down.prevent="ouvrir"
      />
      <button
        type="button"
        :disabled="desactive"
        :aria-label="ouvert ? 'Fermer le calendrier' : 'Ouvrir le calendrier'"
        :aria-expanded="ouvert"
        class="mr-1 shrink-0 rounded-md p-2 text-primary transition-colors hover:bg-primary/10 disabled:text-gray-400 disabled:hover:bg-transparent"
        @click="basculer"
      >
        <i class="bx bx-calendar text-xl" aria-hidden="true"></i>
      </button>
    </div>

    <div
      v-if="ouvert"
      class="absolute z-30 mt-2 w-[19rem] rounded-xl border border-gray-200 bg-white p-3 shadow-xl"
      role="dialog"
      aria-label="Choisir une date"
      @keydown.esc.stop="fermerEtRendreLeFocus"
    >
      <div class="flex items-center justify-between">
        <button
          type="button"
          :aria-label="vue === 'jours' ? 'Mois précédent' : 'Années précédentes'"
          class="rounded-md p-1.5 text-gray-600 transition-colors hover:bg-gray-100"
          @click="reculer"
        >
          <i class="bx bx-chevron-left text-xl" aria-hidden="true"></i>
        </button>
        <button
          type="button"
          class="rounded-md px-3 py-1 font-semibold text-gray-900 transition-colors hover:bg-gray-100"
          :aria-label="vue === 'jours' ? 'Choisir une année' : 'Revenir au calendrier'"
          @click="vue = vue === 'jours' ? 'annees' : 'jours'"
        >
          {{ titre }}
        </button>
        <button
          type="button"
          :aria-label="vue === 'jours' ? 'Mois suivant' : 'Années suivantes'"
          class="rounded-md p-1.5 text-gray-600 transition-colors hover:bg-gray-100"
          @click="avancer"
        >
          <i class="bx bx-chevron-right text-xl" aria-hidden="true"></i>
        </button>
      </div>

      <template v-if="vue === 'jours'">
        <div class="mt-3 grid grid-cols-7 gap-1 text-center text-xs text-gray-500">
          <span v-for="jour in JOURS_COURTS" :key="jour">{{ jour }}</span>
        </div>
        <div class="mt-1 grid grid-cols-7 gap-1" role="grid">
          <span v-for="vide in rangDuPremier(curseur.annee, curseur.mois)" :key="`v${vide}`"></span>
          <button
            v-for="jour in joursDuMois(curseur.annee, curseur.mois)"
            :key="jour"
            ref="cellules"
            type="button"
            :disabled="horsBornes(jour)"
            :tabindex="jour === focalise ? 0 : -1"
            :aria-current="estAujourdHui(jour) ? 'date' : undefined"
            :aria-pressed="estChoisi(jour)"
            class="h-9 w-9 rounded-lg text-sm transition-colors disabled:cursor-not-allowed disabled:text-gray-300"
            :class="classesDuJour(jour)"
            @click="choisir(jour)"
            @keydown="surToucheDuJour($event, jour)"
          >
            {{ jour }}
          </button>
        </div>
      </template>

      <div v-else class="mt-3 grid grid-cols-3 gap-2">
        <button
          v-for="annee in decennie"
          :key="annee"
          type="button"
          class="rounded-lg py-2.5 text-sm transition-colors"
          :class="
            annee === curseur.annee
              ? 'bg-primary font-semibold text-white'
              : 'text-gray-700 hover:bg-gray-100'
          "
          @click="choisirLAnnee(annee)"
        >
          {{ annee }}
        </button>
      </div>

      <div class="mt-3 flex items-center justify-between border-t border-gray-100 pt-2.5">
        <button
          type="button"
          class="rounded-md px-2 py-1 text-sm text-gray-500 transition-colors hover:bg-gray-100 hover:text-gray-700"
          @click="effacer"
        >
          Effacer
        </button>
        <button
          type="button"
          :disabled="aujourdHuiHorsBornes"
          class="rounded-md px-2 py-1 text-sm font-medium text-primary transition-colors hover:bg-primary/10 disabled:text-gray-300 disabled:hover:bg-transparent"
          @click="allerAAujourdHui"
        >
          Aujourd'hui
        </button>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { computed, nextTick, onBeforeUnmount, ref, useTemplateRef, watch } from 'vue'
import {
  JOURS_COURTS,
  MOIS,
  aujourdHui,
  avant,
  decaler,
  depuisAffichage,
  depuisIso,
  joursDuMois,
  moisPrecedent,
  moisSuivant,
  rangDuPremier,
  versAffichage,
  versIso,
  type DateCivile,
} from './dates'

/**
 * Champ de date du gabarit, en remplacement de `<input type="date">`.
 *
 * Le champ natif n'a ni le meme aspect ni la meme langue d'un navigateur a
 * l'autre, et sa mise en forme echappe entierement a la feuille de style :
 * c'etait le seul element du tableau de bord a ne pas ressembler au reste.
 *
 * Le contrat de valeur est celui du champ natif, volontairement : le modele
 * est une chaine `AAAA-MM-JJ`, vide quand rien n'est choisi. C'est aussi la
 * forme que l'API attend partout, donc le remplacement ne touche a aucun
 * appel.
 *
 * La saisie au clavier reste possible et prioritaire : taper « 17/08/2026 »
 * doit marcher sans jamais ouvrir le calendrier, parce que c'est plus rapide
 * que de cliquer douze fois pour remonter a une annee.
 */
const { modelValue, ...proprietes } = defineProps<{
  /**
   * Date au format `AAAA-MM-JJ`. `null` vaut la chaine vide : plusieurs
   * contrats servent `null` pour une date facultative absente — la cloture
   * des inscriptions d'un evenement, par exemple — et le champ ne doit pas
   * obliger chaque appelant a traduire.
   */
  modelValue: string | null
  id?: string
  /** Premier jour choisissable, au format `AAAA-MM-JJ`. */
  min?: string
  /** Dernier jour choisissable, au format `AAAA-MM-JJ`. */
  max?: string
  desactive?: boolean
  requis?: boolean
  placeholder?: string
}>()

const emit = defineEmits<{ 'update:modelValue': [valeur: string] }>()

const placeholder = computed(() => proprietes.placeholder ?? 'JJ/MM/AAAA')

const racine = useTemplateRef<HTMLDivElement>('racine')
const saisie = useTemplateRef<HTMLInputElement>('saisie')
const cellules = useTemplateRef<HTMLButtonElement[]>('cellules')

const ouvert = ref(false)
const vue = ref<'jours' | 'annees'>('jours')
const texte = ref(versAffichage(modelValue ?? ''))

/** Mois affiche par le calendrier ; il suit la valeur, ou le jour courant. */
const curseur = ref(depuisIso(modelValue ?? '') ?? aujourdHui())

/** Jour du mois qui porte le focus dans la grille, pour les fleches. */
const focalise = ref(curseur.value.jour)

// Une valeur changee depuis l'exterieur — un formulaire qu'on rouvre, une
// reponse du serveur — doit se voir dans le champ sans que l'utilisateur ait
// a le toucher.
watch(
  () => modelValue,
  (valeur) => {
    texte.value = versAffichage(valeur ?? '')
    const civile = depuisIso(valeur ?? '')
    if (civile !== null) {
      curseur.value = civile
      focalise.value = civile.jour
    }
  },
)

const titre = computed(() =>
  vue.value === 'jours'
    ? `${MOIS[curseur.value.mois - 1]} ${curseur.value.annee}`
    : `${decennie.value[0]} – ${decennie.value[decennie.value.length - 1]}`,
)

/** Douze annees autour de celle du curseur, comme sur une page de calendrier. */
const decennie = computed(() => {
  const debut = curseur.value.annee - 10
  return Array.from({ length: 12 }, (_, rang) => debut + rang)
})

function iso(jour: number): string {
  return versIso({ annee: curseur.value.annee, mois: curseur.value.mois, jour })
}

function horsBornes(jour: number): boolean {
  const valeur = iso(jour)
  if (proprietes.min !== undefined && proprietes.min !== '' && avant(valeur, proprietes.min)) {
    return true
  }
  return proprietes.max !== undefined && proprietes.max !== '' && avant(proprietes.max, valeur)
}

function estChoisi(jour: number): boolean {
  return modelValue === iso(jour)
}

function estAujourdHui(jour: number): boolean {
  return versIso(aujourdHui()) === iso(jour)
}

function classesDuJour(jour: number): string {
  if (estChoisi(jour)) return 'bg-primary font-semibold text-white'
  if (estAujourdHui(jour)) return 'text-primary font-semibold ring-1 ring-primary'
  return 'text-gray-700 hover:bg-gray-100'
}

const aujourdHuiHorsBornes = computed(() => {
  const valeur = versIso(aujourdHui())
  if (proprietes.min !== undefined && proprietes.min !== '' && avant(valeur, proprietes.min)) {
    return true
  }
  return proprietes.max !== undefined && proprietes.max !== '' && avant(proprietes.max, valeur)
})

function surSaisie(evenement: Event): void {
  texte.value = (evenement.target as HTMLInputElement).value
}

/**
 * Applique ce qui a ete tape, ou remet ce qui etait la.
 *
 * Une saisie incomprise ne vide pas le champ : elle revient a la valeur
 * precedente. Effacer une date reste possible, mais explicitement — en vidant
 * le champ, ou par le bouton du calendrier.
 */
function validerLaSaisie(): void {
  const brut = texte.value.trim()
  if (brut === '') {
    emit('update:modelValue', '')
    texte.value = ''
    return
  }
  const valeur = depuisAffichage(brut)
  if (valeur === null) {
    texte.value = versAffichage(modelValue ?? '')
    return
  }
  emit('update:modelValue', valeur)
  texte.value = versAffichage(valeur)
}

function ouvrir(): void {
  if (proprietes.desactive === true) return
  vue.value = 'jours'
  const civile = depuisIso(modelValue ?? '')
  if (civile !== null) curseur.value = civile
  focalise.value = civile?.jour ?? 1
  ouvert.value = true
  void nextTick(() => donnerLeFocusAuJour())
}

function fermer(): void {
  ouvert.value = false
}

function fermerEtRendreLeFocus(): void {
  fermer()
  saisie.value?.focus()
}

function basculer(): void {
  if (ouvert.value) fermerEtRendreLeFocus()
  else ouvrir()
}

function reculer(): void {
  if (vue.value === 'annees') {
    curseur.value = { ...curseur.value, annee: curseur.value.annee - 12 }
    return
  }
  curseur.value = { ...curseur.value, ...moisPrecedent(curseur.value.annee, curseur.value.mois) }
  recadrerLeFocus()
}

function avancer(): void {
  if (vue.value === 'annees') {
    curseur.value = { ...curseur.value, annee: curseur.value.annee + 12 }
    return
  }
  curseur.value = { ...curseur.value, ...moisSuivant(curseur.value.annee, curseur.value.mois) }
  recadrerLeFocus()
}

/** Le 31 n'existe pas partout : le focus se rabat sur le dernier jour reel. */
function recadrerLeFocus(): void {
  const dernier = joursDuMois(curseur.value.annee, curseur.value.mois)
  if (focalise.value > dernier) focalise.value = dernier
}

function choisir(jour: number): void {
  const valeur = iso(jour)
  emit('update:modelValue', valeur)
  texte.value = versAffichage(valeur)
  fermerEtRendreLeFocus()
}

function choisirLAnnee(annee: number): void {
  curseur.value = { ...curseur.value, annee }
  recadrerLeFocus()
  vue.value = 'jours'
}

function effacer(): void {
  emit('update:modelValue', '')
  texte.value = ''
  fermerEtRendreLeFocus()
}

function allerAAujourdHui(): void {
  const jour = aujourdHui()
  curseur.value = jour
  focalise.value = jour.jour
  emit('update:modelValue', versIso(jour))
  texte.value = versAffichage(versIso(jour))
  fermerEtRendreLeFocus()
}

function donnerLeFocusAuJour(): void {
  cellules.value?.[focalise.value - 1]?.focus()
}

/**
 * Deplacement au clavier dans la grille.
 *
 * Le calcul passe par une vraie date pour que le 31 janvier plus un jour
 * tombe au 1er fevrier, et non sur une case inexistante : on suit le
 * calendrier, pas la grille affichee.
 */
function surToucheDuJour(evenement: KeyboardEvent, jour: number): void {
  const pas: Record<string, number> = {
    ArrowLeft: -1,
    ArrowRight: 1,
    ArrowUp: -7,
    ArrowDown: 7,
    PageUp: -28,
    PageDown: 28,
  }
  const decalage = pas[evenement.key]
  if (decalage === undefined) return
  evenement.preventDefault()

  const cible: DateCivile = decaler(
    { annee: curseur.value.annee, mois: curseur.value.mois, jour },
    decalage,
  )
  curseur.value = cible
  focalise.value = cible.jour
  void nextTick(() => donnerLeFocusAuJour())
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
