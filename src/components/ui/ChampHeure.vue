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
        :aria-label="ouvert ? 'Fermer le choix de l\'heure' : 'Choisir une heure'"
        :aria-expanded="ouvert"
        class="mr-1 shrink-0 rounded-md p-2 text-primary transition-colors hover:bg-primary/10 disabled:text-gray-400 disabled:hover:bg-transparent"
        @click="basculer"
      >
        <i class="bx bx-time-five text-xl" aria-hidden="true"></i>
      </button>
    </div>

    <div
      v-if="ouvert"
      class="absolute z-30 mt-2 w-56 rounded-xl border border-gray-200 bg-white p-3 shadow-xl"
      role="dialog"
      aria-label="Choisir une heure"
      @keydown.esc.stop="fermerEtRendreLeFocus"
    >
      <div class="flex gap-2">
        <div class="flex-1">
          <p class="mb-1 text-center text-xs font-semibold tracking-wide text-gray-500 uppercase">
            Heures
          </p>
          <!-- Les deux colonnes defilent : vingt-quatre heures ne tiennent
               pas a l'ecran, et une liste deroulante native nous ramenerait
               au controle dessine par le systeme qu'on remplace ici. -->
          <ul
            ref="colonneHeures"
            class="max-h-48 overflow-y-auto rounded-lg border border-gray-100"
            role="listbox"
            aria-label="Heures"
          >
            <li v-for="valeur in HEURES" :key="valeur">
              <button
                type="button"
                role="option"
                :aria-selected="valeur === choix.heures"
                :data-heure="valeur"
                class="w-full px-2 py-1.5 text-center text-sm tabular-nums transition-colors"
                :class="
                  valeur === choix.heures
                    ? 'bg-primary font-semibold text-white'
                    : 'text-gray-700 hover:bg-gray-100'
                "
                @click="choisirHeures(valeur)"
              >
                {{ String(valeur).padStart(2, '0') }}
              </button>
            </li>
          </ul>
        </div>

        <div class="flex-1">
          <p class="mb-1 text-center text-xs font-semibold tracking-wide text-gray-500 uppercase">
            Minutes
          </p>
          <ul
            ref="colonneMinutes"
            class="max-h-48 overflow-y-auto rounded-lg border border-gray-100"
            role="listbox"
            aria-label="Minutes"
          >
            <li v-for="valeur in minutes" :key="valeur">
              <button
                type="button"
                role="option"
                :aria-selected="valeur === choix.minutes"
                :data-minute="valeur"
                class="w-full px-2 py-1.5 text-center text-sm tabular-nums transition-colors"
                :class="
                  valeur === choix.minutes
                    ? 'bg-primary font-semibold text-white'
                    : 'text-gray-700 hover:bg-gray-100'
                "
                @click="choisirMinutes(valeur)"
              >
                {{ String(valeur).padStart(2, '0') }}
              </button>
            </li>
          </ul>
        </div>
      </div>

      <div class="mt-3 flex items-center justify-between border-t border-gray-100 pt-2.5">
        <button
          type="button"
          class="rounded-md px-2 py-1 text-sm text-gray-500 transition-colors hover:bg-gray-100 hover:text-gray-700"
          @click="choisirMaintenant"
        >
          Maintenant
        </button>
        <button
          type="button"
          class="rounded-md px-2 py-1 text-sm font-medium text-primary-dark transition-colors hover:bg-primary/10"
          @click="fermerEtRendreLeFocus"
        >
          Terminé
        </button>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { computed, nextTick, onBeforeUnmount, ref, useTemplateRef, watch } from 'vue'
import {
  HEURES,
  depuisIso,
  depuisSaisie,
  maintenant,
  minutesParPas,
  versAffichage,
  versIso,
  type HeureCivile,
} from './heures'

/**
 * Champ d'heure du gabarit, en remplacement de `<input type="time">`.
 *
 * Le champ natif est dessine par le SYSTEME, pas par la feuille de style :
 * sur macOS il ouvre trois colonnes bleues avec un « AM » et un « PM » en
 * anglais, sur un site d'ambassade francophone qui affiche par ailleurs des
 * horaires en vingt-quatre heures. C'etait, avec le champ de date et la
 * liste deroulante deja remplaces, le dernier controle du tableau de bord a
 * ne ressembler a rien d'autre.
 *
 * Le contrat de valeur est celui du champ natif, volontairement : le modele
 * est une chaine `HH:MM` sur vingt-quatre heures, vide quand rien n'est
 * choisi. C'est aussi la forme que l'API sert et attend (`time: "18:30"`),
 * donc le remplacement ne touche a aucun appel.
 *
 * La saisie au clavier reste possible et prioritaire : taper « 8h30 » doit
 * marcher sans jamais ouvrir le selecteur, parce que c'est plus rapide que
 * de faire defiler deux colonnes.
 */
const { modelValue, ...proprietes } = defineProps<{
  /**
   * Heure au format `HH:MM`. `null` vaut la chaine vide : plusieurs contrats
   * servent `null` pour une heure facultative absente, et le champ ne doit
   * pas obliger chaque appelant a traduire.
   */
  modelValue: string | null
  id?: string
  /** Pas des minutes proposees. Cinq par defaut ; la saisie reste libre. */
  pas?: number
  desactive?: boolean
  requis?: boolean
  placeholder?: string
}>()

const emit = defineEmits<{ 'update:modelValue': [valeur: string] }>()

const placeholder = computed(() => proprietes.placeholder ?? 'HH:MM')
const minutes = computed(() => minutesParPas(proprietes.pas ?? 5))

const racine = useTemplateRef<HTMLDivElement>('racine')
const saisie = useTemplateRef<HTMLInputElement>('saisie')
const colonneHeures = useTemplateRef<HTMLUListElement>('colonneHeures')
const colonneMinutes = useTemplateRef<HTMLUListElement>('colonneMinutes')

const ouvert = ref(false)
const texte = ref(versAffichage(modelValue ?? ''))

/**
 * Ce que les colonnes montrent comme choisi.
 *
 * Distinct du modele : tant que rien n'est saisi, aucune heure n'est
 * surlignee — `-1` ne correspond a aucune valeur de liste. Surligner minuit
 * par defaut ferait croire qu'une heure est deja choisie.
 */
const choix = ref<HeureCivile>(depuisIso(modelValue ?? '') ?? { heures: -1, minutes: -1 })

// Une valeur changee depuis l'exterieur — un formulaire qu'on rouvre, une
// reponse du serveur — doit se voir dans le champ sans qu'on ait a le toucher.
watch(
  () => modelValue,
  (valeur) => {
    texte.value = versAffichage(valeur ?? '')
    const heure = depuisIso(valeur ?? '')
    if (heure !== null) choix.value = heure
  },
)

function surSaisie(evenement: Event): void {
  texte.value = (evenement.target as HTMLInputElement).value
}

/**
 * Applique ce qui a ete tape, ou remet ce qui etait la.
 *
 * Une saisie incomprise ne vide pas le champ : elle revient a la valeur
 * precedente. Effacer une heure reste possible, mais explicitement — en
 * vidant le champ.
 */
function validerLaSaisie(): void {
  const brut = texte.value.trim()
  if (brut === '') {
    emit('update:modelValue', '')
    texte.value = ''
    return
  }
  const valeur = depuisSaisie(brut)
  if (valeur === null) {
    texte.value = versAffichage(modelValue ?? '')
    return
  }
  poser(valeur)
}

function poser(valeur: string): void {
  emit('update:modelValue', valeur)
  texte.value = valeur
  const heure = depuisIso(valeur)
  if (heure !== null) choix.value = heure
}

/**
 * Choisir une heure sans minutes deja posees vaut « heure pile ».
 *
 * L'inverse — choisir des minutes sans heure — ne peut pas deviner : on se
 * rabat sur l'heure courante, la seule qui ne soit pas arbitraire.
 */
function choisirHeures(valeur: number): void {
  const mn = choix.value.minutes < 0 ? 0 : choix.value.minutes
  poser(versIso({ heures: valeur, minutes: mn }))
}

function choisirMinutes(valeur: number): void {
  const hr = choix.value.heures < 0 ? new Date().getHours() : choix.value.heures
  poser(versIso({ heures: hr, minutes: valeur }))
}

function choisirMaintenant(): void {
  poser(maintenant(proprietes.pas ?? 5))
  void nextTick(() => faireDefilerVersLeChoix())
}

/** Amene la valeur choisie en vue : sans cela, 18:30 reste hors de l'ecran. */
function faireDefilerVersLeChoix(): void {
  amener(colonneHeures.value, `[data-heure="${choix.value.heures}"]`)
  amener(colonneMinutes.value, `[data-minute="${choix.value.minutes}"]`)
}

/**
 * `scrollIntoView` n'existe pas partout — jsdom ne l'implemente pas, et
 * certains moteurs anciens non plus. Le defilement est un confort : son
 * absence ne doit pas faire echouer l'ouverture du selecteur.
 */
function amener(colonne: HTMLElement | null, selecteur: string): void {
  const cible = colonne?.querySelector(selecteur)
  if (cible instanceof HTMLElement && typeof cible.scrollIntoView === 'function') {
    cible.scrollIntoView({ block: 'center' })
  }
}

function ouvrir(): void {
  if (proprietes.desactive === true) return
  ouvert.value = true
  void nextTick(() => faireDefilerVersLeChoix())
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

/** Un clic ailleurs ferme le selecteur, comme tout menu du gabarit. */
function surClicExterieur(evenement: MouseEvent): void {
  if (!ouvert.value) return
  if (racine.value?.contains(evenement.target as Node) === false) fermer()
}

document.addEventListener('mousedown', surClicExterieur)
onBeforeUnmount(() => document.removeEventListener('mousedown', surClicExterieur))
</script>
