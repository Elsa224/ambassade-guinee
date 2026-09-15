<script setup lang="ts">
import { ref, computed, onMounted } from 'vue'
import {
  listerEvenementsAdmin,
  LIMITE_DEFAUT,
  type EvenementAdmin,
  type Pagination as FormePagination,
} from '@/api/evenements-admin'
import { messageErreur } from '@/api/evenements'
import { dateLisible, etatDe, remplissage } from './presentation'
import PastilleEtat from './PastilleEtat.vue'
import Pagination from './Pagination.vue'

/**
 * Liste d'administration des evenements.
 *
 * Les inscrits ne sont JAMAIS detailles ici. Le back sert `participants[]`
 * avec nom, courriel et identifiant dans la reponse de liste : ce sont des
 * donnees personnelles, et un tableau d'administration n'est pas l'endroit ou
 * les deverser. Seul leur nombre est affiche ; le detail appartient a la fiche
 * d'un evenement, ou l'on sait pourquoi on l'ouvre.
 */
const evenements = ref<EvenementAdmin[]>([])
const pagination = ref<FormePagination>({ page: 1, limit: LIMITE_DEFAUT, total: 0, totalPages: 1 })
const chargement = ref(true)
const erreur = ref('')

/**
 * Vrai quand le back sert la publication.
 *
 * `isPublished` vient du CMS, pas d'Ambassade Secure. Tant que la jointure sur
 * `secure_event_publications` n'est pas deployee, le champ est absent : la
 * colonne se retire alors, plutot que d'afficher « brouillon » pour tout le
 * monde, ce qui serait faux et inquietant.
 */
const publicationConnue = computed(() => evenements.value.some((e) => e.isPublished !== undefined))

async function charger(page = pagination.value.page, limite = pagination.value.limit) {
  chargement.value = true
  erreur.value = ''
  try {
    const resultat = await listerEvenementsAdmin(page, limite)
    evenements.value = resultat.evenements
    pagination.value = resultat.pagination
  } catch (souleve) {
    erreur.value = messageErreur(souleve)
    evenements.value = []
  } finally {
    chargement.value = false
  }
}

onMounted(() => charger(1))
</script>

<template>
  <!-- La carte occupe la hauteur restante : seules les lignes defilent, si
       bien que l'en-tete des colonnes et la pagination restent toujours en
       vue. `min-h-0` est indispensable, sans quoi un enfant flex refuse de
       retrecir sous sa hauteur de contenu et la carte deborde. -->
  <div class="flex flex-col h-[calc(100vh-var(--hauteur-barre)-3rem)]">
    <header class="mb-6 flex flex-wrap items-end justify-between gap-4">
      <div>
        <h2 class="text-2xl font-bold text-gray-800">Évènements</h2>
        <p class="text-gray-600 mt-1">
          Les évènements de l'ambassade et l'état de leurs inscriptions.
        </p>
      </div>
      <div class="flex items-center gap-4">
        <p v-if="!chargement && !erreur" class="text-sm text-gray-500 tabular-nums">
          {{ pagination.total }} évènement{{ pagination.total > 1 ? 's' : '' }}
        </p>
        <RouterLink
          :to="{ name: 'evenement-admin-nouveau' }"
          class="bg-primary text-white font-medium px-4 py-2 rounded-lg hover:opacity-90"
        >
          Nouvel évènement
        </RouterLink>
      </div>
    </header>

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
                class="w-[32%] sticky top-0 z-10 bg-gray-50 border-b border-gray-200 px-5 py-3 text-xs font-semibold uppercase tracking-wide text-gray-500"
                scope="col"
              >
                Évènement
              </th>
              <th
                class="sticky top-0 z-10 bg-gray-50 border-b border-gray-200 px-5 py-3 text-xs font-semibold uppercase tracking-wide text-gray-500 whitespace-nowrap"
                scope="col"
              >
                Date
              </th>
              <th
                class="w-[20%] sticky top-0 z-10 bg-gray-50 border-b border-gray-200 px-5 py-3 text-xs font-semibold uppercase tracking-wide text-gray-500"
                scope="col"
              >
                Lieu
              </th>
              <th
                class="sticky top-0 z-10 bg-gray-50 border-b border-gray-200 px-5 py-3 text-xs font-semibold uppercase tracking-wide text-gray-500"
                scope="col"
              >
                Inscriptions
              </th>
              <th
                class="sticky top-0 z-10 bg-gray-50 border-b border-gray-200 px-5 py-3 text-xs font-semibold uppercase tracking-wide text-gray-500"
                scope="col"
              >
                État
              </th>
              <th
                v-if="publicationConnue"
                class="sticky top-0 z-10 bg-gray-50 border-b border-gray-200 px-5 py-3 text-xs font-semibold uppercase tracking-wide text-gray-500"
                scope="col"
              >
                Site
              </th>
            </tr>
          </thead>

          <tbody v-if="chargement">
            <tr v-for="ligne in 5" :key="ligne" class="border-b border-gray-100">
              <td class="px-5 py-4" :colspan="publicationConnue ? 6 : 5">
                <span class="block h-4 rounded bg-gray-100 animate-pulse" aria-hidden="true"></span>
                <span class="sr-only">Chargement des évènements…</span>
              </td>
            </tr>
          </tbody>

          <tbody v-else-if="evenements.length === 0">
            <tr>
              <td class="px-5 py-16 text-center" :colspan="publicationConnue ? 6 : 5">
                <p class="font-medium text-gray-700">Aucun évènement pour le moment</p>
                <p class="text-sm text-gray-500 mt-1">
                  Les évènements créés dans Ambassade Secure apparaissent ici.
                </p>
              </td>
            </tr>
          </tbody>

          <tbody v-else>
            <tr
              v-for="evenement in evenements"
              :key="evenement.slug"
              class="border-b border-gray-100 last:border-0 hover:bg-gray-50/70 transition-colors"
            >
              <td class="px-5 py-4">
                <RouterLink
                  :to="{ name: 'evenement-admin', params: { slug: evenement.slug } }"
                  class="font-semibold text-gray-800 hover:text-primary hover:underline underline-offset-2 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-primary rounded-sm"
                >
                  {{ evenement.name }}
                </RouterLink>
                <p v-if="evenement.typeLabel" class="text-xs text-gray-500 mt-0.5">
                  {{ evenement.typeLabel }}
                </p>
              </td>

              <td class="px-5 py-4 whitespace-nowrap">
                <p class="text-gray-800 tabular-nums">{{ dateLisible(evenement.date) }}</p>
                <p class="text-xs text-gray-500 tabular-nums mt-0.5">{{ evenement.time }}</p>
              </td>

              <td class="px-5 py-4 text-gray-600">
                <span class="block truncate" :title="evenement.location">
                  {{ evenement.location }}
                </span>
              </td>

              <td class="px-5 py-4">
                <p class="text-gray-800 tabular-nums">
                  {{ evenement.registeredCount }}
                  <span v-if="evenement.capacity" class="text-gray-400"
                    >/ {{ evenement.capacity }}</span
                  >
                </p>
                <div
                  v-if="evenement.capacity"
                  class="mt-1.5 h-1.5 w-24 rounded-full bg-gray-100 overflow-hidden"
                  aria-hidden="true"
                >
                  <div
                    class="h-full rounded-full"
                    :class="remplissage(evenement) >= 100 ? 'bg-amber-500' : 'bg-primary'"
                    :style="{ width: `${remplissage(evenement)}%` }"
                  ></div>
                </div>
                <p v-else class="text-xs text-gray-400 mt-0.5">Sans limite</p>
              </td>

              <td class="px-5 py-4">
                <div class="flex flex-wrap items-center gap-1.5">
                  <PastilleEtat :libelle="etatDe(evenement).libelle" :ton="etatDe(evenement).ton" />
                  <PastilleEtat
                    v-if="evenement.registrationOpen"
                    libelle="Inscriptions ouvertes"
                    ton="neutre"
                  />
                </div>
              </td>

              <td v-if="publicationConnue" class="px-5 py-4">
                <PastilleEtat
                  :libelle="evenement.isPublished ? 'Publié' : 'Non publié'"
                  :ton="evenement.isPublished ? 'positif' : 'eteint'"
                />
              </td>
            </tr>
          </tbody>
        </table>
      </div>

      <Pagination
        :pagination="pagination"
        :desactive="chargement"
        @page="(numero) => charger(numero)"
        @limite="(lignes) => charger(1, lignes)"
      />
    </div>
  </div>
</template>
