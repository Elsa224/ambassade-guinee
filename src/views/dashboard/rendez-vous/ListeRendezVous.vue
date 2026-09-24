<script setup lang="ts">
import { ref, onMounted } from 'vue'
import {
  listerRendezVous,
  messageErreurRdvAdmin,
  LIMITE_DEFAUT,
  type RendezVousAdmin,
  type FiltresRdv,
} from '@/api/rendez-vous-admin'
import type { Pagination as FormePagination } from '@/components/ui/pagination'
import {
  dateEtHeure,
  etatDe,
  estEnAttente,
  nomDuVisiteur,
  STATUTS_FILTRABLES,
} from './presentation'
import PastilleEtat from '@/components/ui/PastilleEtat.vue'
import Pagination from '@/components/ui/Pagination.vue'
import ChampSelect from '@/components/ui/ChampSelect.vue'
import ChampDate from '@/components/ui/ChampDate.vue'
import PanneauRendezVous from './PanneauRendezVous.vue'

/**
 * Consultation des demandes de rendez-vous de chancellerie.
 *
 * Le CMS n'en stocke aucune : chaque ligne est relayee depuis Ambassade
 * Secure a la demande. Trois consequences se lisent dans cet ecran.
 *
 *  - **Aucun rafraichissement automatique.** Une seule ligne coute en amont
 *    une requete de liste complete, pieces d'identite base64 comprises : une
 *    boucle de rafraichissement ferait de cet ecran une charge permanente sur
 *    le service. La liste se recharge sur geste, et apres un geste.
 *  - **Le tableau ne montre aucune piece d'identite**, et le detail ne les
 *    ouvre que sur clic.
 *  - **L'heure s'affiche telle qu'elle arrive.** Voir `presentation.ts`.
 */
const demandes = ref<RendezVousAdmin[]>([])
const pagination = ref<FormePagination>({ page: 1, limit: LIMITE_DEFAUT, total: 0, totalPages: 1 })
const chargement = ref(true)
const erreur = ref('')

/** La demande ouverte dans le panneau, ou `null`. */
const ouverte = ref<RendezVousAdmin | null>(null)

const recherche = ref('')
const statut = ref<string | null>(null)
const depuis = ref<string | null>(null)
const jusqua = ref<string | null>(null)

const OPTIONS_STATUT = STATUTS_FILTRABLES.map(({ valeur, libelle }) => ({ valeur, libelle }))

function filtres(page: number, limite: number): FiltresRdv {
  return {
    page,
    limit: limite,
    status: statut.value ?? undefined,
    from: depuis.value ?? undefined,
    to: jusqua.value ?? undefined,
    search: recherche.value,
  }
}

async function charger(page = pagination.value.page, limite = pagination.value.limit) {
  chargement.value = true
  erreur.value = ''
  try {
    const resultat = await listerRendezVous(filtres(page, limite))
    demandes.value = resultat.rendezVous
    pagination.value = resultat.pagination
  } catch (souleve) {
    erreur.value = messageErreurRdvAdmin(souleve)
    demandes.value = []
  } finally {
    chargement.value = false
  }
}

/** Un filtre qui change repart de la premiere page : sinon on l'applique a une page qui n'existe plus. */
function appliquer(): void {
  void charger(1)
}

function reinitialiser(): void {
  recherche.value = ''
  statut.value = null
  depuis.value = null
  jusqua.value = null
  void charger(1)
}

/**
 * Apres un geste, la ligne est remplacee par la demande que le back vient de
 * rendre — pas par un rechargement de la liste.
 *
 * La reponse d'approbation est le SEUL endroit ou le QR du visiteur est
 * servi : recharger la liste a la place l'effacerait avant que l'agent l'ait
 * vu, et couterait une requete de liste de plus en amont.
 */
function remplacer(demande: RendezVousAdmin): void {
  const rang = demandes.value.findIndex((ligne) => ligne.reference === demande.reference)
  if (rang !== -1) demandes.value[rang] = demande
  ouverte.value = demande
}
onMounted(() => charger(1))
</script>

<template>
  <div class="flex flex-col h-[calc(100vh-var(--hauteur-barre)-3rem)]">
    <header class="mb-6 flex flex-wrap items-end justify-between gap-4">
      <div>
        <h2 class="text-2xl font-bold text-gray-800">Rendez-vous</h2>
        <p class="text-gray-600 mt-1">
          Les demandes de visite à la chancellerie, à confirmer ou à refuser.
        </p>
      </div>
      <p v-if="!chargement && !erreur" class="text-sm text-gray-500 tabular-nums">
        {{ pagination.total }} demande{{ pagination.total > 1 ? 's' : '' }}
      </p>
    </header>

    <form
      class="mb-4 flex flex-wrap items-end gap-3 rounded-xl bg-white p-4 shadow-sm"
      @submit.prevent="appliquer"
    >
      <div class="min-w-56 flex-1">
        <label for="rdv-recherche" class="block text-xs font-medium text-gray-600"
          >Rechercher</label
        >
        <input
          id="rdv-recherche"
          v-model="recherche"
          type="search"
          placeholder="Nom, courriel ou référence"
          class="mt-1 w-full rounded-xl border border-gray-300 px-3 py-2 text-sm focus:border-primary focus:outline-none"
        />
      </div>

      <div class="w-48">
        <label for="rdv-statut" class="block text-xs font-medium text-gray-600">État</label>
        <div class="mt-1">
          <!-- « Annulé » n'est pas propose : l'amont declare la valeur mais ne
               l'assigne jamais, et aucune route n'annule un rendez-vous. Ce
               filtre ne rendrait jamais rien. -->
          <ChampSelect
            id="rdv-statut"
            v-model="statut"
            :options="OPTIONS_STATUT"
            placeholder="Tous les états"
            @update:model-value="appliquer"
          />
        </div>
      </div>

      <div class="w-44">
        <label for="rdv-depuis" class="block text-xs font-medium text-gray-600">À partir du</label>
        <div class="mt-1"><ChampDate id="rdv-depuis" v-model="depuis" /></div>
      </div>

      <div class="w-44">
        <label for="rdv-jusqua" class="block text-xs font-medium text-gray-600">Jusqu'au</label>
        <div class="mt-1"><ChampDate id="rdv-jusqua" v-model="jusqua" /></div>
      </div>

      <button
        type="submit"
        class="rounded-xl bg-primary px-4 py-2 text-sm font-semibold text-white hover:opacity-90"
      >
        Filtrer
      </button>
      <button
        type="button"
        class="rounded-xl border border-gray-300 px-4 py-2 text-sm font-medium text-gray-700 hover:bg-gray-50"
        @click="reinitialiser"
      >
        Tout afficher
      </button>
    </form>

    <p
      v-if="erreur"
      class="bg-red-50 border border-red-200 text-red-800 rounded-xl px-4 py-3"
      role="alert"
    >
      {{ erreur }}
      <button type="button" class="ml-2 font-medium underline" @click="charger()">Réessayer</button>
    </p>

    <div v-else class="flex flex-col min-h-0 flex-1 bg-white shadow-sm rounded-xl overflow-hidden">
      <div class="min-h-0 flex-1 overflow-auto">
        <table class="w-full text-left">
          <thead>
            <tr class="bg-gray-50">
              <th
                class="sticky top-0 z-10 bg-gray-50 border-b border-gray-200 px-5 py-3 text-xs font-semibold uppercase tracking-wide text-gray-500 whitespace-nowrap"
                scope="col"
              >
                Rendez-vous
              </th>
              <th
                class="w-[26%] sticky top-0 z-10 bg-gray-50 border-b border-gray-200 px-5 py-3 text-xs font-semibold uppercase tracking-wide text-gray-500"
                scope="col"
              >
                Visiteur
              </th>
              <th
                class="w-[22%] sticky top-0 z-10 bg-gray-50 border-b border-gray-200 px-5 py-3 text-xs font-semibold uppercase tracking-wide text-gray-500"
                scope="col"
              >
                Service
              </th>
              <th
                class="sticky top-0 z-10 bg-gray-50 border-b border-gray-200 px-5 py-3 text-xs font-semibold uppercase tracking-wide text-gray-500"
                scope="col"
              >
                État
              </th>
              <th
                class="sticky top-0 z-10 bg-gray-50 border-b border-gray-200 px-5 py-3 text-xs font-semibold uppercase tracking-wide text-gray-500"
                scope="col"
              >
                Actions
              </th>
            </tr>
          </thead>

          <tbody v-if="chargement">
            <tr v-for="ligne in 5" :key="ligne" class="border-b border-gray-100">
              <td class="px-5 py-4" colspan="5">
                <span class="block h-4 rounded bg-gray-100 animate-pulse" aria-hidden="true"></span>
                <span class="sr-only">Chargement des demandes…</span>
              </td>
            </tr>
          </tbody>

          <tbody v-else-if="demandes.length === 0">
            <tr>
              <td class="px-5 py-16 text-center" colspan="5">
                <p class="font-medium text-gray-700">Aucune demande</p>
                <p class="text-sm text-gray-500 mt-1">
                  Les demandes déposées sur le site apparaissent ici.
                </p>
              </td>
            </tr>
          </tbody>

          <tbody v-else>
            <tr
              v-for="demande in demandes"
              :key="demande.reference"
              class="border-b border-gray-100 last:border-0 hover:bg-gray-50/70 transition-colors"
            >
              <td class="px-5 py-4 whitespace-nowrap">
                <p class="text-gray-800 tabular-nums">
                  {{ dateEtHeure(demande.scheduledAt).date }}
                </p>
                <p class="text-xs text-gray-500 tabular-nums mt-0.5">
                  {{ dateEtHeure(demande.scheduledAt).heure }}
                </p>
              </td>

              <td class="px-5 py-4">
                <p class="font-semibold text-gray-800">{{ nomDuVisiteur(demande) }}</p>
                <p class="font-mono text-xs text-gray-500 mt-0.5">{{ demande.reference }}</p>
              </td>

              <td class="px-5 py-4 text-gray-600">
                <span class="block truncate">{{ demande.department?.name ?? '—' }}</span>
                <span v-if="demande.purpose" class="block truncate text-xs text-gray-500">
                  {{ demande.purpose }}
                </span>
              </td>

              <td class="px-5 py-4">
                <PastilleEtat
                  :libelle="etatDe(demande.status).libelle"
                  :ton="etatDe(demande.status).ton"
                />
              </td>

              <td class="px-5 py-4">
                <button
                  type="button"
                  class="rounded-lg border border-gray-300 px-3 py-1.5 text-sm font-medium text-gray-700 transition-colors hover:bg-gray-50"
                  @click="ouverte = demande"
                >
                  {{ estEnAttente(demande) ? 'Examiner' : 'Consulter' }}
                </button>
              </td>
            </tr>
          </tbody>
        </table>
      </div>

      <Pagination
        :pagination="pagination"
        :desactive="chargement"
        libelle-vide="Aucune demande"
        @page="(numero) => charger(numero)"
        @limite="(lignes) => charger(1, lignes)"
      />
    </div>

    <PanneauRendezVous
      v-if="ouverte"
      :rendez-vous="ouverte"
      @traite="remplacer"
      @fermer="ouverte = null"
    />
  </div>
</template>
