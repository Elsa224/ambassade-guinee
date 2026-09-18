<template>
  <div>
    <header class="mb-6">
      <h2 class="text-2xl font-bold text-gray-800">Demandes de rendez-vous</h2>
      <p class="text-gray-600 mt-1">
        Les demandes envoyées depuis le site.
        <span class="font-medium">
          Le site ne confirme aucun rendez-vous : c'est vous qui recontactez le demandeur.
        </span>
      </p>
    </header>

    <!-- Filtre par statut -->
    <section class="bg-white rounded-xl border border-gray-200 p-4 mb-6">
      <div class="flex flex-wrap items-end gap-4">
        <div>
          <label for="statut-rdv" class="block text-sm font-medium text-gray-700 mb-1.5">
            Statut
          </label>
          <ChampSelect
            id="statut-rdv"
            v-model="filtre"
            :options="optionsDeFiltre"
            class="w-56"
            @update:model-value="charger()"
          />
        </div>
        <p class="text-sm text-gray-500 flex-1 min-w-[16rem]">
          Une demande traitée reste consultable tant qu'elle n'est pas supprimée.
        </p>
      </div>
    </section>

    <p v-if="chargement" class="text-gray-500 py-20 text-center">Chargement des demandes…</p>

    <p
      v-else-if="erreurChargement"
      class="bg-red-50 border border-red-200 text-red-800 rounded-xl px-4 py-3"
      role="alert"
    >
      {{ erreurChargement }}
    </p>

    <p v-else-if="demandes.length === 0" class="text-gray-500 py-20 text-center">
      Aucune demande pour ce filtre.
    </p>

    <ul v-else class="space-y-4">
      <li
        v-for="demande in demandes"
        :key="demande.id"
        class="bg-white rounded-xl border border-gray-200 p-5"
      >
        <div class="flex flex-wrap items-start justify-between gap-4">
          <div>
            <p class="font-semibold text-gray-800">
              {{ demande.first_name }} {{ demande.last_name }}
            </p>
            <p class="text-sm text-gray-500">
              {{ demande.reference }} · demandé pour le
              {{ versAffichage(demande.preferred_date) }} à {{ demande.preferred_time }}
            </p>
          </div>
          <span
            class="rounded-full px-3 py-1 text-sm font-medium"
            :class="COULEURS[demande.status] ?? 'bg-gray-100 text-gray-700'"
          >
            {{ libelleDuStatut(demande.status) }}
          </span>
        </div>

        <dl class="mt-4 grid gap-x-8 gap-y-2 sm:grid-cols-2 text-sm">
          <div class="flex gap-2">
            <dt class="text-gray-500">Service</dt>
            <dd class="text-gray-800">{{ libelleDuService(demande.service) }}</dd>
          </div>
          <div class="flex gap-2">
            <dt class="text-gray-500">Téléphone</dt>
            <dd class="text-gray-800">{{ demande.phone }}</dd>
          </div>
          <div class="flex gap-2">
            <dt class="text-gray-500">Courriel</dt>
            <dd class="text-gray-800 break-all">{{ demande.email }}</dd>
          </div>
        </dl>

        <p v-if="demande.documents" class="mt-3 text-sm text-gray-700">
          <span class="text-gray-500">Documents annoncés :</span> {{ demande.documents }}
        </p>
        <p v-if="demande.message" class="mt-1 text-sm text-gray-700">
          <span class="text-gray-500">Message :</span> {{ demande.message }}
        </p>

        <div class="mt-4 flex flex-wrap items-center gap-2 border-t border-gray-100 pt-4">
          <button
            v-for="statut in STATUTS_RENDEZ_VOUS"
            :key="statut"
            type="button"
            :disabled="demande.status === statut || enCours === demande.id"
            class="rounded-lg border px-3 py-1.5 text-sm font-medium transition-colors disabled:opacity-40 disabled:cursor-not-allowed"
            :class="
              demande.status === statut
                ? 'border-gray-200 text-gray-400'
                : 'border-gray-300 text-gray-700 hover:bg-gray-50'
            "
            @click="changerStatut(demande, statut)"
          >
            {{ libelleDuStatut(statut) }}
          </button>
        </div>

        <p v-if="erreurs[demande.id]" class="mt-3 text-sm text-red-700" role="alert">
          {{ erreurs[demande.id] }}
        </p>
      </li>
    </ul>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, onMounted } from 'vue'
import ChampSelect from '@/components/ui/ChampSelect.vue'
import { versAffichage } from '@/components/ui/dates'
import { ApiError, messageDeLEchec } from '@/api/client'
import { recupererServicesAdmin } from '@/api/services'
import {
  recupererRendezVous,
  traiterRendezVous,
  libelleDuStatut,
  STATUTS_RENDEZ_VOUS,
  type RendezVous,
  type StatutRendezVous,
} from '@/api/rendez-vous'

/**
 * Les demandes de rendez-vous prises sur le site.
 *
 * L'ecran ne modifie ni les coordonnees ni le souhait du demandeur : le poste
 * ne recrit pas la demande d'un citoyen, il la traite. Seul le statut change.
 */
const COULEURS: Readonly<Record<string, string>> = {
  nouveau: 'bg-blue-100 text-blue-800',
  confirme: 'bg-green-100 text-green-800',
  refuse: 'bg-red-100 text-red-800',
  honore: 'bg-gray-100 text-gray-700',
  annule: 'bg-amber-100 text-amber-800',
}

const optionsDeFiltre = [
  { valeur: '', libelle: 'Toutes les demandes' },
  ...STATUTS_RENDEZ_VOUS.map((statut) => ({ valeur: statut, libelle: libelleDuStatut(statut) })),
]

/**
 * Le titre d'un service a partir de son slug.
 *
 * La demande porte le slug, qui est ce que le formulaire envoie ; « passeport »
 * se lit, mais « carte-consulaire » moins bien, et un service renomme depuis
 * garderait son ancien slug. Un slug inconnu s'affiche tel quel plutot que de
 * disparaitre : il dit encore ce que la personne a demande.
 */
const titresParSlug = ref<Record<string, string>>({})

function libelleDuService(slug: string): string {
  if (slug === 'autre') return 'Autre service'
  return titresParSlug.value[slug] ?? slug
}

const filtre = ref('')
const demandes = ref<RendezVous[]>([])
const chargement = ref(true)
const erreurChargement = ref('')
const enCours = ref<number | null>(null)
const erreurs = ref<Record<number, string>>({})

const statutFiltre = computed(() =>
  filtre.value === '' ? undefined : (filtre.value as StatutRendezVous),
)

/**
 * Le texte a montrer sur un echec.
 *
 * Le statut `0` est celui d'un echec reseau : le client le pose quand la
 * requete n'est jamais partie. Le laisser passer afficherait « Erreur 0 », qui
 * ne dit rien a personne.
 */
function message(souleve: unknown): string {
  if (souleve instanceof ApiError && souleve.statut !== 0 && souleve.corpsPorteUnMessage) {
    return messageDeLEchec(souleve.corps, souleve.statut)
  }
  return 'Service indisponible. Réessayez dans un moment.'
}

async function charger() {
  chargement.value = true
  erreurChargement.value = ''
  try {
    demandes.value = (await recupererRendezVous({ statut: statutFiltre.value })).demandes
  } catch (souleve) {
    erreurChargement.value = message(souleve)
    demandes.value = []
  } finally {
    chargement.value = false
  }
}

async function changerStatut(demande: RendezVous, statut: StatutRendezVous) {
  enCours.value = demande.id
  delete erreurs.value[demande.id]
  try {
    const servi = await traiterRendezVous(demande.id, { status: statut })
    Object.assign(demande, servi)
    // La demande sort de la liste des que le filtre ne la retient plus.
    if (statutFiltre.value && servi.status !== statutFiltre.value) {
      demandes.value = demandes.value.filter((autre) => autre.id !== demande.id)
    }
  } catch (souleve) {
    erreurs.value = { ...erreurs.value, [demande.id]: message(souleve) }
  } finally {
    enCours.value = null
  }
}

onMounted(async () => {
  await charger()
  try {
    const servis = (await recupererServicesAdmin()).services
    titresParSlug.value = Object.fromEntries(servis.map((s) => [s.slug, s.title]))
  } catch {
    // Les demandes restent lisibles : seul le libelle du service reste brut.
    titresParSlug.value = {}
  }
})
</script>
