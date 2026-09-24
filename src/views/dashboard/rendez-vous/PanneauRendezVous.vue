<script setup lang="ts">
import { ref, computed, onMounted, onUnmounted } from 'vue'
import {
  approuverRendezVous,
  refuserRendezVous,
  refusDuMotif,
  messageErreurRdvAdmin,
  MOTIF_MAXIMUM,
  type RendezVousAdmin,
} from '@/api/rendez-vous-admin'
import {
  dateEtHeure,
  dateEtHeureLisible,
  etatDe,
  estEnAttente,
  nomDuVisiteur,
} from './presentation'
import PastilleEtat from '@/components/ui/PastilleEtat.vue'
import Confirmation from '@/components/ui/Confirmation.vue'
import PieceIdentite from './PieceIdentite.vue'

/**
 * Le detail d'une demande, et les deux seuls gestes qui existent.
 *
 * La demande n'est PAS rechargee a l'ouverture : la route de detail rend
 * exactement les memes champs que la ligne de liste, et l'appeler couterait
 * en amont une requete de liste complete — pieces base64 comprises — pour un
 * contenu que l'ecran a deja. Ce qui est affiche ici vient donc de la ligne,
 * et n'est remplace que par la reponse d'un geste.
 */
const { rendezVous } = defineProps<{ rendezVous: RendezVousAdmin }>()
const emit = defineEmits<{ fermer: []; traite: [demande: RendezVousAdmin] }>()

const etat = computed(() => etatDe(rendezVous.status))
const enAttente = computed(() => estEnAttente(rendezVous))
const rendezVousLe = computed(() => dateEtHeure(rendezVous.scheduledAt))

const erreur = ref('')
const enCours = ref(false)

/** L'approbation demande confirmation : elle est irreversible. */
const approbationADemander = ref(false)

/** Le motif de refus n'apparait qu'une fois le refus engage. */
const refusEngage = ref(false)
const motif = ref('')
const refusDuChamp = ref('')

async function approuver(): Promise<void> {
  if (enCours.value) return
  enCours.value = true
  erreur.value = ''
  try {
    emit('traite', await approuverRendezVous(rendezVous.reference))
  } catch (souleve) {
    erreur.value = messageErreurRdvAdmin(souleve)
  } finally {
    enCours.value = false
    approbationADemander.value = false
  }
}

async function refuser(): Promise<void> {
  if (enCours.value) return
  // Le motif est verifie ici avant tout appel, comme le back le fait de son
  // cote : un refus sans motif revient en 422 generique, ou l'agent ne
  // saurait pas quel champ manque.
  refusDuChamp.value = refusDuMotif(motif.value)
  if (refusDuChamp.value !== '') return

  enCours.value = true
  erreur.value = ''
  try {
    emit('traite', await refuserRendezVous(rendezVous.reference, motif.value.trim()))
  } catch (souleve) {
    erreur.value = messageErreurRdvAdmin(souleve)
  } finally {
    enCours.value = false
  }
}

function auClavier(evenement: KeyboardEvent): void {
  if (evenement.key === 'Escape') emit('fermer')
}

onMounted(() => document.addEventListener('keydown', auClavier))
onUnmounted(() => document.removeEventListener('keydown', auClavier))
</script>

<template>
  <!-- Le cadre d'administration monte jusqu'a z-[1000] : un panneau en
       dessous laisserait la barre du haut recouvrir son titre. -->
  <div
    class="fixed inset-0 z-[1100] flex justify-end bg-black/40"
    role="dialog"
    aria-modal="true"
    aria-label="Détail de la demande de rendez-vous"
    @click.self="emit('fermer')"
  >
    <div class="flex h-full w-full max-w-xl flex-col bg-white shadow-xl">
      <header
        class="flex flex-none items-start justify-between gap-4 border-b border-gray-100 px-6 py-4"
      >
        <div>
          <p class="font-mono text-sm text-gray-500">{{ rendezVous.reference }}</p>
          <h3 class="mt-0.5 text-lg font-semibold text-gray-800">
            {{ nomDuVisiteur(rendezVous) }}
          </h3>
          <PastilleEtat class="mt-2" :libelle="etat.libelle" :ton="etat.ton" />
        </div>
        <button
          type="button"
          class="rounded-full p-1 text-gray-500 hover:bg-gray-100"
          aria-label="Fermer"
          @click="emit('fermer')"
        >
          <i class="bx bx-x text-2xl" aria-hidden="true"></i>
        </button>
      </header>

      <div class="min-h-0 flex-1 space-y-6 overflow-y-auto px-6 py-5">
        <p
          v-if="erreur"
          class="rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-red-800"
          role="alert"
        >
          {{ erreur }}
        </p>

        <section>
          <h4 class="text-xs font-semibold uppercase tracking-wide text-gray-500">
            Le rendez-vous
          </h4>
          <dl class="mt-3 grid grid-cols-[9rem_1fr] gap-x-4 gap-y-2 text-sm">
            <dt class="text-gray-500">Date</dt>
            <dd class="tabular-nums text-gray-800">{{ rendezVousLe.date }}</dd>
            <!-- L'heure est celle que l'amont a enregistree, affichee telle
                 quelle. La remettre dans le fuseau du navigateur en montrerait
                 une autre a l'agent qu'au visiteur. -->
            <dt class="text-gray-500">Heure</dt>
            <dd class="tabular-nums text-gray-800">{{ rendezVousLe.heure }}</dd>
            <template v-if="rendezVous.department">
              <dt class="text-gray-500">Service</dt>
              <dd class="text-gray-800">{{ rendezVous.department.name }}</dd>
            </template>
            <template v-if="rendezVous.purpose">
              <dt class="text-gray-500">Objet</dt>
              <dd class="text-gray-800">{{ rendezVous.purpose }}</dd>
            </template>
            <template v-if="rendezVous.host">
              <dt class="text-gray-500">Personne visitée</dt>
              <dd class="text-gray-800">{{ rendezVous.host }}</dd>
            </template>
          </dl>
        </section>

        <section>
          <h4 class="text-xs font-semibold uppercase tracking-wide text-gray-500">Le visiteur</h4>
          <dl class="mt-3 grid grid-cols-[9rem_1fr] gap-x-4 gap-y-2 text-sm">
            <dt class="text-gray-500">Nom</dt>
            <dd class="text-gray-800">{{ nomDuVisiteur(rendezVous) }}</dd>
            <template v-if="rendezVous.visitor.email">
              <dt class="text-gray-500">Courriel</dt>
              <dd class="break-all text-gray-800">{{ rendezVous.visitor.email }}</dd>
            </template>
            <template v-if="rendezVous.visitor.phone">
              <dt class="text-gray-500">Téléphone</dt>
              <dd class="text-gray-800">{{ rendezVous.visitor.phone }}</dd>
            </template>
            <template v-if="rendezVous.visitor.idNumber">
              <dt class="text-gray-500">N° de pièce</dt>
              <dd class="text-gray-800">{{ rendezVous.visitor.idNumber }}</dd>
            </template>
          </dl>
        </section>

        <section>
          <h4 class="text-xs font-semibold uppercase tracking-wide text-gray-500">
            Pièce d'identité
          </h4>
          <p class="mt-1 text-xs text-gray-500">
            Chaque affichage interroge Ambassade Secure : n'ouvrez que ce que vous avez besoin de
            vérifier.
          </p>
          <div class="mt-3 space-y-4">
            <PieceIdentite
              :reference="rendezVous.reference"
              face="recto"
              :presente="rendezVous.hasIdCardFront"
            />
            <PieceIdentite
              :reference="rendezVous.reference"
              face="verso"
              :presente="rendezVous.hasIdCardBack"
            />
          </div>
        </section>

        <section v-if="rendezVous.qr">
          <h4 class="text-xs font-semibold uppercase tracking-wide text-gray-500">
            Laissez-passer
          </h4>
          <p class="mt-1 text-xs text-gray-500">
            Ce QR vient d'être envoyé au visiteur par courriel. Il n'est plus servi ensuite.
          </p>
          <img
            :src="rendezVous.qr"
            alt="QR code du laissez-passer du visiteur"
            class="mt-3 h-40 w-40 rounded-lg border border-gray-200"
          />
        </section>

        <section>
          <h4 class="text-xs font-semibold uppercase tracking-wide text-gray-500">Suivi</h4>
          <dl class="mt-3 grid grid-cols-[9rem_1fr] gap-x-4 gap-y-2 text-sm">
            <dt class="text-gray-500">Demande déposée</dt>
            <dd class="tabular-nums text-gray-800">
              {{ dateEtHeureLisible(rendezVous.createdAt) }}
            </dd>
            <template v-if="rendezVous.rejectionReason">
              <dt class="text-gray-500">Motif du refus</dt>
              <dd class="text-gray-800">{{ rendezVous.rejectionReason }}</dd>
            </template>
            <template v-if="rendezVous.checkInAt">
              <dt class="text-gray-500">Arrivée</dt>
              <dd class="tabular-nums text-gray-800">
                {{ dateEtHeureLisible(rendezVous.checkInAt) }}
              </dd>
            </template>
            <template v-if="rendezVous.checkOutAt">
              <dt class="text-gray-500">Départ</dt>
              <dd class="tabular-nums text-gray-800">
                {{ dateEtHeureLisible(rendezVous.checkOutAt) }}
              </dd>
            </template>
            <template v-if="rendezVous.durationMinutes !== null">
              <dt class="text-gray-500">Durée</dt>
              <dd class="tabular-nums text-gray-800">{{ rendezVous.durationMinutes }} min</dd>
            </template>
          </dl>
        </section>
      </div>

      <!-- Les deux gestes DISPARAISSENT une fois l'un des deux fait : ils
           sont a sens unique depuis « en attente », et deux boutons qui
           rendraient une erreur vaudraient moins que pas de bouton. -->
      <footer v-if="enAttente" class="flex-none border-t border-gray-100 px-6 py-4">
        <div v-if="refusEngage">
          <label for="rdv-motif" class="block text-sm font-medium text-gray-700">
            Motif du refus
          </label>
          <p class="mt-1 text-xs text-gray-500">Le visiteur le recevra tel quel.</p>
          <textarea
            id="rdv-motif"
            v-model="motif"
            rows="3"
            :maxlength="MOTIF_MAXIMUM"
            class="mt-2 w-full rounded-xl border border-gray-300 px-3 py-2 text-sm focus:border-primary focus:outline-none"
          ></textarea>
          <p class="mt-1 text-right text-xs text-gray-400 tabular-nums">
            {{ motif.length }} / {{ MOTIF_MAXIMUM }}
          </p>
          <p v-if="refusDuChamp" class="text-sm text-red-700" role="alert">{{ refusDuChamp }}</p>
          <div class="mt-3 flex justify-end gap-3">
            <button
              type="button"
              class="rounded-xl border border-gray-300 px-4 py-2 text-sm font-medium text-gray-700 hover:bg-gray-50"
              @click="refusEngage = false"
            >
              Renoncer
            </button>
            <button
              type="button"
              class="rounded-xl bg-red-600 px-4 py-2 text-sm font-semibold text-white hover:bg-red-700 disabled:opacity-60"
              :disabled="enCours"
              @click="refuser"
            >
              {{ enCours ? 'En cours…' : 'Refuser la demande' }}
            </button>
          </div>
        </div>

        <div v-else class="flex justify-end gap-3">
          <button
            type="button"
            class="rounded-xl border border-gray-300 px-4 py-2 text-sm font-medium text-gray-700 hover:bg-gray-50"
            @click="refusEngage = true"
          >
            Refuser
          </button>
          <button
            type="button"
            class="rounded-xl bg-primary px-4 py-2 text-sm font-semibold text-white hover:opacity-90 disabled:opacity-60"
            :disabled="enCours"
            @click="approbationADemander = true"
          >
            Approuver
          </button>
        </div>
      </footer>
    </div>

    <Confirmation
      v-if="approbationADemander"
      titre="Approuver cette demande"
      :question="`Confirmer le rendez-vous de ${nomDuVisiteur(rendezVous)} le ${rendezVousLe.date} à ${rendezVousLe.heure} ?`"
      consequence="Le visiteur reçoit immédiatement son laissez-passer par courriel. Rien ne permet de revenir en arrière : la demande ne pourra plus être refusée."
      libelle-confirmer="Approuver"
      libelle-renoncer="Renoncer"
      :en-cours="enCours"
      @confirmer="approuver"
      @fermer="approbationADemander = false"
    />
  </div>
</template>
