<script setup lang="ts">
import { ref, computed, onMounted } from 'vue'
import { useRoute } from 'vue-router'
import {
  recupererEvenementAdmin,
  recupererPresence,
  exporterPresence,
  LIMITE_DEFAUT,
  type LignePresence,
  type ResumePresence,
  type FiltresPresence,
  type FormatExport,
  type Pagination as PaginationServie,
} from '@/api/evenements-admin'
import { messageErreur } from '@/api/evenements'
import Pagination from '@/components/ui/Pagination.vue'
import ChampSelect from '@/components/ui/ChampSelect.vue'

/** Les trois etats du filtre de pointage, dans l'ordre d'usage. */
const OPTIONS_DE_POINTAGE = [
  { valeur: '', libelle: 'Tous' },
  { valeur: 'true', libelle: 'Ont pointé' },
  { valeur: 'false', libelle: "N'ont pas pointé" },
] as const

/**
 * Feuille de presence d'un evenement.
 *
 * Ce que la fiche ne dit pas : qui a reellement pointe le jour venu. La
 * liste des inscrits vit sur la fiche ; ici on lit le roster des pass emis
 * par Ambassade Secure, avec l'etat de pointage de chacun.
 *
 * Le decompte (les quatre cartes) vient du back, calcule sur tout le roster
 * apres `search` mais AVANT le filtre `present` : basculer entre presents et
 * absents ne le fait pas bouger, et c'est voulu. Ne pas le recalculer depuis
 * la page affichee, qui n'en montre qu'une tranche.
 */
const route = useRoute()
const slug = computed(() => String(route.params.slug ?? ''))

/** Le nom de l'evenement, pour titrer la feuille. Son absence n'empeche rien. */
const nomEvenement = ref('')

const lignes = ref<LignePresence[]>([])
const pagination = ref<PaginationServie | null>(null)
const resume = ref<ResumePresence | null>(null)
const chargement = ref(true)
const erreur = ref('')

/** Saisie en cours, distincte du terme applique : la recherche part au geste. */
const recherche = ref('')
const rechercheAppliquee = ref('')
const filtrePresent = ref<'' | 'true' | 'false'>('')
const page = ref(1)
const limite = ref(LIMITE_DEFAUT)

function filtresCourants(): FiltresPresence {
  return {
    search: rechercheAppliquee.value === '' ? undefined : rechercheAppliquee.value,
    present: filtrePresent.value === '' ? undefined : filtrePresent.value === 'true',
  }
}

/**
 * Numero de la derniere requete partie.
 *
 * Deux chargements peuvent se croiser (changer de filtre pendant qu'une page
 * arrive) : seule la reponse du dernier parti a le droit d'ecrire l'ecran.
 */
let sequence = 0

async function charger() {
  const numero = ++sequence
  chargement.value = true
  erreur.value = ''
  try {
    const servie = await recupererPresence(slug.value, filtresCourants(), page.value, limite.value)
    if (numero !== sequence) return
    lignes.value = servie.lignes
    pagination.value = servie.pagination
    resume.value = servie.resume
  } catch (souleve) {
    if (numero !== sequence) return
    erreur.value = messageErreur(souleve)
    lignes.value = []
    pagination.value = null
    resume.value = null
  } finally {
    if (numero === sequence) chargement.value = false
  }
}

function rechercher() {
  rechercheAppliquee.value = recherche.value.trim()
  page.value = 1
  void charger()
}

function changerPresent(valeur: '' | 'true' | 'false') {
  filtrePresent.value = valeur
  page.value = 1
  void charger()
}

function allerPage(numero: number) {
  page.value = numero
  void charger()
}

function changerLimite(nouvelle: number) {
  limite.value = nouvelle
  page.value = 1
  void charger()
}

/**
 * Export : les octets exigent le jeton porteur, donc pas de lien direct. On
 * recupere le fichier puis on le tend au navigateur par une URL d'objet ; le
 * nom vient du back (Content-Disposition), le repli n'existe que pour un
 * back qui ne le servirait pas.
 */
const exportEnCours = ref<FormatExport | null>(null)
const erreurExport = ref('')

async function exporter(format: FormatExport) {
  if (exportEnCours.value !== null) return
  exportEnCours.value = format
  erreurExport.value = ''
  try {
    const fichier = await exporterPresence(slug.value, format, filtresCourants())
    const url = URL.createObjectURL(fichier.blob)
    const lien = document.createElement('a')
    lien.href = url
    lien.download = fichier.nomFichier ?? `presence-${slug.value}.${format}`
    document.body.appendChild(lien)
    lien.click()
    lien.remove()
    URL.revokeObjectURL(url)
  } catch (souleve) {
    erreurExport.value = messageErreur(souleve)
  } finally {
    exportEnCours.value = null
  }
}

/** « 14 septembre à 18:05 », en heure locale ; la valeur brute si illisible. */
function pointageLisible(iso: string): string {
  const date = new Date(iso)
  if (Number.isNaN(date.getTime())) return iso
  return new Intl.DateTimeFormat('fr-FR', {
    day: 'numeric',
    month: 'long',
    hour: '2-digit',
    minute: '2-digit',
  }).format(date)
}

const CARTES: { cle: keyof ResumePresence; libelle: string }[] = [
  { cle: 'totalPasses', libelle: 'Pass émis' },
  { cle: 'present', libelle: 'Ont pointé' },
  { cle: 'currentlyInside', libelle: 'Sur place' },
  { cle: 'absent', libelle: "N'ont pas pointé" },
]

onMounted(() => {
  void charger()
  // Le nom sert le titre, rien d'autre : son echec reste silencieux, la
  // feuille elle-meme porte deja son erreur si l'evenement n'existe pas.
  recupererEvenementAdmin(slug.value)
    .then((evenement) => (nomEvenement.value = evenement.name))
    .catch(() => {})
})
</script>

<template>
  <div class="flex flex-col h-[calc(100vh-var(--hauteur-barre)-3rem)]">
    <RouterLink
      :to="{ name: 'evenement-admin', params: { slug } }"
      class="self-start text-sm text-gray-500 hover:text-primary-dark mb-4"
    >
      &larr; Fiche de l'évènement
    </RouterLink>

    <header class="mb-6 flex flex-wrap items-start justify-between gap-4">
      <div>
        <h2 class="text-2xl font-bold text-gray-800">Feuille de présence</h2>
        <p v-if="nomEvenement" class="text-gray-500 mt-1">{{ nomEvenement }}</p>
      </div>

      <div class="flex items-center gap-2">
        <button
          type="button"
          :disabled="exportEnCours !== null"
          class="border border-gray-300 text-gray-700 font-medium px-4 py-2 rounded-lg disabled:opacity-60"
          @click="exporter('csv')"
        >
          {{ exportEnCours === 'csv' ? 'Export en cours…' : 'Exporter en CSV' }}
        </button>
        <button
          type="button"
          :disabled="exportEnCours !== null"
          class="border border-gray-300 text-gray-700 font-medium px-4 py-2 rounded-lg disabled:opacity-60"
          @click="exporter('xlsx')"
        >
          {{ exportEnCours === 'xlsx' ? 'Export en cours…' : 'Exporter en XLSX' }}
        </button>
      </div>
    </header>

    <p
      v-if="erreurExport"
      class="bg-red-50 border border-red-200 text-red-800 rounded-xl px-4 py-3 mb-4"
      role="alert"
    >
      {{ erreurExport }}
    </p>

    <!-- Le decompte : calcule par le back sur tout le roster -->
    <div v-if="resume" class="grid grid-cols-2 sm:grid-cols-4 gap-4 mb-6">
      <div v-for="carte in CARTES" :key="carte.cle" class="bg-white shadow-sm rounded-xl p-4">
        <p class="text-xs text-gray-500">{{ carte.libelle }}</p>
        <p class="mt-1 text-2xl font-bold text-gray-800 tabular-nums">{{ resume[carte.cle] }}</p>
      </div>
    </div>

    <div class="min-h-0 flex-1 flex flex-col bg-white shadow-sm rounded-xl overflow-hidden">
      <div class="flex flex-wrap items-center gap-3 px-5 py-4">
        <form class="flex items-center gap-2" @submit.prevent="rechercher">
          <label class="text-sm">
            <span class="sr-only">Rechercher dans la feuille de présence</span>
            <input
              v-model="recherche"
              type="search"
              placeholder="Nom, courriel ou identifiant"
              class="w-64 max-w-full rounded-lg border border-gray-200 px-3 py-1.5 focus:outline-2 focus:outline-offset-2 focus:outline-primary"
            />
          </label>
          <button
            type="submit"
            class="border border-gray-300 text-gray-700 text-sm font-medium px-3 py-1.5 rounded-lg"
          >
            Rechercher
          </button>
        </form>

        <label class="ml-auto flex items-center gap-2 text-sm text-gray-600">
          <span>Pointage</span>
          <ChampSelect
            :model-value="filtrePresent"
            :options="OPTIONS_DE_POINTAGE"
            class="w-44"
            @update:model-value="changerPresent($event as '' | 'true' | 'false')"
          />
        </label>
      </div>

      <p v-if="chargement" class="px-5 pb-8 text-gray-500">Chargement de la feuille de présence…</p>

      <p
        v-else-if="erreur"
        class="mx-5 mb-6 bg-red-50 border border-red-200 text-red-800 rounded-xl px-4 py-3"
        role="alert"
      >
        {{ erreur }}
        <button type="button" class="ml-2 font-medium underline" @click="charger()">
          Réessayer
        </button>
      </p>

      <p v-else-if="lignes.length === 0" class="px-5 pb-8 text-gray-500">
        Aucun pass ne correspond à ces critères.
      </p>

      <div v-else class="min-h-0 flex-1 overflow-auto">
        <table class="w-full text-left">
          <thead>
            <tr class="bg-gray-50">
              <th
                v-for="entete in [
                  'Nom',
                  'Courriel',
                  'A pointé',
                  'Dernier pointage',
                  'Sur place',
                  'Passages',
                  'Identifiant',
                ]"
                :key="entete"
                class="border-y border-gray-200 px-5 py-3 text-xs font-semibold uppercase tracking-wide text-gray-500"
                scope="col"
              >
                {{ entete }}
              </th>
            </tr>
          </thead>
          <tbody>
            <tr
              v-for="ligne in lignes"
              :key="ligne.uidn"
              class="border-b border-gray-100 last:border-0"
            >
              <td class="px-5 py-3 text-gray-800">{{ ligne.fullName }}</td>
              <td class="px-5 py-3 text-gray-600">
                <a
                  v-if="ligne.email"
                  :href="`mailto:${ligne.email}`"
                  class="hover:text-primary hover:underline"
                >
                  {{ ligne.email }}
                </a>
                <template v-else>—</template>
              </td>
              <td class="px-5 py-3">
                <span
                  class="inline-block rounded-full px-2.5 py-0.5 text-xs font-medium"
                  :class="
                    ligne.hasCheckedIn ? 'bg-green-100 text-green-800' : 'bg-gray-100 text-gray-600'
                  "
                >
                  {{ ligne.hasCheckedIn ? 'Oui' : 'Non' }}
                </span>
              </td>
              <td class="px-5 py-3 text-gray-600 tabular-nums">
                {{ ligne.checkInAt ? pointageLisible(ligne.checkInAt) : '—' }}
              </td>
              <td class="px-5 py-3 text-gray-600">{{ ligne.currentlyInside ? 'Oui' : '—' }}</td>
              <td class="px-5 py-3 text-gray-600 tabular-nums">{{ ligne.scansUsed }}</td>
              <td class="px-5 py-3 text-gray-500 tabular-nums">{{ ligne.uidn }}</td>
            </tr>
          </tbody>
        </table>
      </div>

      <Pagination
        v-if="pagination && pagination.total > 0"
        :pagination="pagination"
        :desactive="chargement"
        libelle-vide="Aucune inscription"
        @page="allerPage"
        @limite="changerLimite"
      />
    </div>
  </div>
</template>
