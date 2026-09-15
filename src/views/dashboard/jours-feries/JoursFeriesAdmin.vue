<template>
  <div>
    <header class="mb-6">
      <h2 class="text-2xl font-bold text-gray-800">Calendrier des jours fériés</h2>
      <p class="text-gray-600 mt-1">
        Les fêtes légales affichées sur le site, année par année.
        <span class="font-medium">Tant qu'aucune fête n'est saisie, la page n'apparaît pas.</span>
      </p>
    </header>

    <p v-if="chargement" class="text-gray-500 py-20 text-center">Chargement du calendrier…</p>

    <p
      v-else-if="erreurChargement"
      class="bg-red-50 border border-red-200 text-red-800 rounded-xl px-4 py-3"
      role="alert"
    >
      {{ erreurChargement }}
    </p>

    <div v-else class="space-y-6">
      <!-- Choix de l'annee -->
      <section class="bg-white rounded-xl border border-gray-200 p-6">
        <div class="flex flex-wrap items-end gap-4">
          <div>
            <label for="annee-admin" class="block text-sm font-medium text-gray-700 mb-1.5">
              Année
            </label>
            <ChampSelect
              id="annee-admin"
              v-model="anneeChoisie"
              :options="optionsDAnnee"
              class="w-32"
              @update:model-value="charger(Number($event))"
            />
          </div>

          <!-- Chaque annee se saisit en entier : le back ne reporte rien
               d'une annee sur la suivante, dates fixes comprises. -->
          <button
            type="button"
            class="px-4 py-2.5 rounded-lg border border-gray-300 font-semibold text-gray-700 hover:bg-gray-50 transition-colors"
            @click="ouvrirAnnee"
          >
            Ajouter une année
          </button>

          <p class="text-sm text-gray-500 flex-1 min-w-[16rem]">
            Chaque année se saisit entièrement, y compris les dates fixes.
          </p>
        </div>
      </section>

      <!-- Fetes de l'annee choisie, triees par date au serveur -->
      <section class="bg-white rounded-xl border border-gray-200">
        <div class="flex items-center justify-between gap-4 px-6 py-4 border-b border-gray-100">
          <div>
            <h3 class="font-semibold text-gray-800">Fêtes de {{ calendrier.year }}</h3>
            <p class="text-sm text-gray-600">Classées par date, du 1er janvier au 31 décembre.</p>
          </div>
          <div class="flex items-center gap-3">
            <EtatSection :rempli="calendrier.holidays.length > 0" />
            <button
              type="button"
              class="bg-primary hover:bg-primary-dark text-white font-semibold px-4 py-2 rounded-lg transition-colors whitespace-nowrap"
              @click="ouvrirFete(null)"
            >
              Ajouter une fête
            </button>
          </div>
        </div>

        <p v-if="calendrier.holidays.length === 0" class="px-6 py-10 text-center text-gray-500">
          Aucune fête pour cette année.
        </p>

        <ul v-else class="divide-y divide-gray-100">
          <li
            v-for="fete in calendrier.holidays"
            :key="fete.id"
            class="flex items-center gap-4 px-6 py-4"
          >
            <div class="min-w-0 flex-1">
              <p class="font-semibold text-gray-800 truncate">
                {{ formaterJour(fete.date) }} — {{ fete.name }}
              </p>
              <p class="text-sm text-gray-600 truncate">
                {{ libelleDuType(fete.type) }}
                <span v-if="fete.note !== null"> · {{ fete.note }}</span>
              </p>
            </div>
            <div class="flex items-center gap-1 shrink-0">
              <button
                type="button"
                class="p-2 rounded-lg text-gray-500 hover:bg-gray-100"
                :aria-label="`Modifier ${fete.name}`"
                @click="ouvrirFete(fete.id)"
              >
                <i class="bx bx-pencil text-xl" aria-hidden="true"></i>
              </button>
              <button
                type="button"
                class="p-2 rounded-lg text-red-600 hover:bg-red-50"
                :aria-label="`Supprimer ${fete.name}`"
                @click="retirer(fete.id)"
              >
                <i class="bx bx-trash text-xl" aria-hidden="true"></i>
              </button>
            </div>
          </li>
        </ul>
      </section>

      <!-- Bloc de reglages : texte de presentation et document -->
      <section class="bg-white rounded-xl border border-gray-200 p-6">
        <div class="flex items-start justify-between gap-4 mb-4">
          <div>
            <h3 class="font-semibold text-gray-800">Présentation et document</h3>
            <p class="text-sm text-gray-600">
              Un texte d'introduction et le calendrier officiel au format PDF, tous deux
              facultatifs. Ils valent pour toutes les années.
            </p>
          </div>
          <EtatSection :rempli="reglagesRemplis" />
        </div>

        <form class="space-y-5" @submit.prevent="enregistrerLesReglages">
          <div>
            <label for="intro-feries" class="block text-sm font-medium text-gray-700 mb-1.5">
              Texte de présentation <span class="text-gray-400 font-normal">(facultatif)</span>
            </label>
            <textarea
              id="intro-feries"
              v-model="saisieReglages.intro"
              rows="3"
              placeholder="Référence du décret, précisions sur les dates variables…"
              class="w-full border border-gray-300 rounded-lg px-4 py-2.5 focus:outline-none focus:ring-2 focus:ring-primary/40 focus:border-primary"
            ></textarea>
            <p class="text-xs text-gray-500 mt-1.5">
              Les retours à la ligne sont conservés à l'affichage.
            </p>
          </div>

          <div>
            <p class="block text-sm font-medium text-gray-700 mb-1.5">
              Calendrier au format PDF <span class="text-gray-400 font-normal">(facultatif)</span>
            </p>

            <div class="flex flex-wrap items-center gap-3">
              <label
                class="inline-flex items-center gap-2 px-4 py-2 rounded-lg border border-gray-300 text-sm font-semibold text-gray-700 hover:bg-gray-50 cursor-pointer transition-colors"
                :class="{ 'opacity-60 pointer-events-none': envoiDocument }"
              >
                <i class="bx bx-upload" aria-hidden="true"></i>
                {{
                  envoiDocument
                    ? 'Envoi en cours…'
                    : saisieReglages.document_url !== ''
                      ? 'Remplacer le document'
                      : 'Choisir un document'
                }}
                <input
                  type="file"
                  class="sr-only"
                  accept="application/pdf"
                  @change="choisirDocument"
                />
              </label>

              <a
                v-if="saisieReglages.document_url !== ''"
                :href="saisieReglages.document_url"
                target="_blank"
                rel="noopener"
                class="text-primary font-semibold hover:underline text-sm"
              >
                Consulter le document
              </a>

              <button
                v-if="saisieReglages.document_url !== ''"
                type="button"
                class="text-red-600 font-semibold hover:underline text-sm"
                @click="saisieReglages.document_url = ''"
              >
                Retirer le document
              </button>
            </div>

            <p class="text-xs text-gray-500 mt-2">
              PDF uniquement, 5 Mo maximum. Le document s'ouvre dans un onglet, il ne se télécharge
              pas.
            </p>
            <p v-if="erreurDocument" class="text-sm text-red-700 mt-2" role="alert">
              {{ erreurDocument }}
            </p>
          </div>

          <p v-if="erreurReglages" class="text-sm text-red-700" role="alert">
            {{ erreurReglages }}
          </p>

          <div class="flex justify-end">
            <button
              type="submit"
              :disabled="enregistrement"
              class="bg-primary hover:bg-primary-dark disabled:opacity-60 text-white font-semibold px-5 py-2.5 rounded-lg transition-colors"
            >
              {{ enregistrement ? 'Enregistrement…' : 'Enregistrer' }}
            </button>
          </div>
        </form>
      </section>
    </div>

    <!-- Formulaire d'une fete -->
    <Boite
      v-if="feteOuverte"
      :titre="feteEditee ? 'Modifier la fête' : 'Ajouter une fête'"
      @fermer="feteOuverte = false"
    >
      <form class="space-y-5" @submit.prevent="enregistrerLaFete">
        <div>
          <label for="nom-fete" class="block text-sm font-medium text-gray-700 mb-1.5">
            Nom <span class="text-red-600" aria-hidden="true">*</span>
          </label>
          <input
            id="nom-fete"
            v-model.trim="saisieFete.name"
            type="text"
            placeholder="Fête de l'Indépendance"
            class="w-full border border-gray-300 rounded-lg px-4 py-2.5 focus:outline-none focus:ring-2 focus:ring-primary/40 focus:border-primary"
          />
        </div>

        <div class="grid md:grid-cols-2 gap-5">
          <div>
            <label for="date-fete" class="block text-sm font-medium text-gray-700 mb-1.5">
              Date <span class="text-red-600" aria-hidden="true">*</span>
            </label>
            <ChampDate id="date-fete" v-model="saisieFete.date" />
          </div>
          <div>
            <label for="type-fete" class="block text-sm font-medium text-gray-700 mb-1.5">
              Type <span class="text-red-600" aria-hidden="true">*</span>
            </label>
            <ChampSelect id="type-fete" v-model="saisieFete.type" :options="optionsDeType" />
          </div>
        </div>

        <div>
          <label for="note-fete" class="block text-sm font-medium text-gray-700 mb-1.5">
            Précision <span class="text-gray-400 font-normal">(facultatif)</span>
          </label>
          <input
            id="note-fete"
            v-model.trim="saisieFete.note"
            type="text"
            placeholder="Date variable, confirmée par les autorités religieuses"
            class="w-full border border-gray-300 rounded-lg px-4 py-2.5 focus:outline-none focus:ring-2 focus:ring-primary/40 focus:border-primary"
          />
        </div>

        <p v-if="erreurFormulaire" class="text-sm text-red-700" role="alert">
          {{ erreurFormulaire }}
        </p>

        <div class="flex justify-end gap-3 pt-2">
          <button
            type="button"
            class="px-4 py-2.5 text-gray-700 font-semibold"
            @click="feteOuverte = false"
          >
            Annuler
          </button>
          <button
            type="submit"
            :disabled="enregistrement"
            class="bg-primary hover:bg-primary-dark disabled:opacity-60 text-white font-semibold px-5 py-2.5 rounded-lg transition-colors"
          >
            {{ enregistrement ? 'Enregistrement…' : 'Enregistrer' }}
          </button>
        </div>
      </form>
    </Boite>

    <!-- Ouverture d'une annee non encore pourvue -->
    <Boite v-if="anneeOuverte" titre="Ajouter une année" @fermer="anneeOuverte = false">
      <form class="space-y-5" @submit.prevent="ouvrirNouvelleAnnee">
        <div>
          <label for="nouvelle-annee" class="block text-sm font-medium text-gray-700 mb-1.5">
            Année
          </label>
          <input
            id="nouvelle-annee"
            v-model.number="saisieAnnee"
            type="number"
            min="1900"
            max="2100"
            class="w-full border border-gray-300 rounded-lg px-4 py-2.5 focus:outline-none focus:ring-2 focus:ring-primary/40 focus:border-primary"
          />
          <p class="text-xs text-gray-500 mt-1.5">
            L'année s'ajoutera à la liste dès sa première fête enregistrée.
          </p>
        </div>

        <p v-if="erreurAnnee" class="text-sm text-red-700" role="alert">{{ erreurAnnee }}</p>

        <div class="flex justify-end gap-3 pt-2">
          <button
            type="button"
            class="px-4 py-2.5 text-gray-700 font-semibold"
            @click="anneeOuverte = false"
          >
            Annuler
          </button>
          <button
            type="submit"
            class="bg-primary hover:bg-primary-dark text-white font-semibold px-5 py-2.5 rounded-lg transition-colors"
          >
            Ouvrir l'année
          </button>
        </div>
      </form>
    </Boite>

    <p
      v-if="message"
      class="fixed bottom-6 right-6 bg-gray-900 text-white px-5 py-3 rounded-lg shadow-lg"
      role="status"
    >
      {{ message }}
    </p>
  </div>
</template>

<script setup lang="ts">
import { ref, reactive, computed, onMounted } from 'vue'
import Boite from '../contenu/Boite.vue'
import ChampDate from '@/components/ui/ChampDate.vue'
import ChampSelect from '@/components/ui/ChampSelect.vue'
import EtatSection from '../contenu/EtatSection.vue'
import { messageErreurContenu } from '@/api/contenu'
import {
  recupererCalendrierAdmin,
  ajouterFete,
  modifierFete,
  supprimerFete,
  enregistrerReglages,
  televerserDocument,
  refusDuDocument,
  anneesDuSelecteur,
  libelleDuType,
  formaterJour,
  CALENDRIER_VIDE,
  type CalendrierFeries,
  type TypeDeFete,
} from '@/api/jours-feries'

const calendrier = ref<CalendrierFeries>({ ...CALENDRIER_VIDE })
const chargement = ref(true)
const erreurChargement = ref('')
const enregistrement = ref(false)
const erreurFormulaire = ref('')
const message = ref('')

const anneeChoisie = ref(CALENDRIER_VIDE.year)
const anneeOuverte = ref(false)
const saisieAnnee = ref(CALENDRIER_VIDE.year)
const erreurAnnee = ref('')

const feteOuverte = ref(false)
const feteEditee = ref<number | null>(null)
const saisieFete = reactive({ name: '', date: '', type: 'legale' as TypeDeFete, note: '' })

const saisieReglages = reactive({ intro: '', document_url: '' })
const erreurReglages = ref('')
const erreurDocument = ref('')
const envoiDocument = ref(false)

/** Les trois types du contrat, dans l'ordre du formulaire. */
const TYPES: readonly TypeDeFete[] = ['legale', 'nationale', 'religieuse']

/**
 * Options du selecteur : les annees pourvues, plus l'annee affichee, plus
 * celle que l'administrateur vient d'ouvrir et qui n'a pas encore de fete.
 */
const anneesOuvertes = ref<number[]>([])
const annees = computed(() =>
  [...new Set([...anneesDuSelecteur(calendrier.value), ...anneesOuvertes.value])].sort(
    (a, b) => a - b,
  ),
)

/** Les memes annees, dans la forme que la liste deroulante consomme. */
const optionsDAnnee = computed(() =>
  annees.value.map((annee) => ({ valeur: annee, libelle: String(annee) })),
)

/** Les trois types du contrat, avec le libelle que lit la redaction. */
const optionsDeType = TYPES.map((type) => ({ valeur: type, libelle: libelleDuType(type) }))

const reglagesRemplis = computed(
  () => saisieReglages.intro.trim() !== '' || saisieReglages.document_url !== '',
)

function annoncer(texte: string): void {
  message.value = texte
  setTimeout(() => (message.value = ''), 3000)
}

async function charger(annee?: number): Promise<void> {
  chargement.value = true
  erreurChargement.value = ''
  try {
    calendrier.value = await recupererCalendrierAdmin(annee)
    anneeChoisie.value = calendrier.value.year
    saisieReglages.intro = calendrier.value.intro ?? ''
    saisieReglages.document_url = calendrier.value.document_url ?? ''
  } catch (souleve) {
    erreurChargement.value = messageErreurContenu(souleve)
  } finally {
    chargement.value = false
  }
}

/**
 * Rejoue l'action puis recharge depuis le serveur, sur l'annee affichee.
 *
 * Recharger plutot que de modifier la copie locale garde l'ecran aligne sur
 * ce que le site public sert : le tri par date est fixe cote serveur.
 */
async function agir(action: () => Promise<unknown>, succes: string): Promise<boolean> {
  enregistrement.value = true
  erreurFormulaire.value = ''
  erreurReglages.value = ''
  try {
    await action()
    await charger(anneeChoisie.value)
    annoncer(succes)
    return true
  } catch (souleve) {
    const texte = messageErreurContenu(souleve)
    erreurFormulaire.value = texte
    erreurReglages.value = texte
    return false
  } finally {
    enregistrement.value = false
  }
}

function ouvrirAnnee(): void {
  erreurAnnee.value = ''
  saisieAnnee.value = calendrier.value.year
  anneeOuverte.value = true
}

function ouvrirNouvelleAnnee(): void {
  const annee = saisieAnnee.value
  if (!Number.isInteger(annee) || annee < 1900 || annee > 2100) {
    erreurAnnee.value = "L'année doit être comprise entre 1900 et 2100."
    return
  }
  // L'annee n'existe pas encore au serveur : elle n'apparaitra dans
  // `available_years` qu'a sa premiere fete. On la garde ici en attendant,
  // sinon le selecteur la perdrait au rechargement qui suit.
  anneesOuvertes.value = [...anneesOuvertes.value, annee]
  anneeOuverte.value = false
  anneeChoisie.value = annee
  void charger(annee)
}

function ouvrirFete(id: number | null): void {
  erreurFormulaire.value = ''
  const existante = calendrier.value.holidays.find((f) => f.id === id) ?? null
  feteEditee.value = existante?.id ?? null
  saisieFete.name = existante?.name ?? ''
  // Une fete neuve est datee dans l'annee affichee : c'est celle qu'on edite.
  saisieFete.date = existante?.date ?? `${calendrier.value.year}-01-01`
  saisieFete.type = existante?.type ?? 'legale'
  saisieFete.note = existante?.note ?? ''
  feteOuverte.value = true
}

async function enregistrerLaFete(): Promise<void> {
  if (saisieFete.name === '' || saisieFete.date === '') {
    erreurFormulaire.value = 'Le nom et la date sont obligatoires.'
    return
  }
  // `note` vide part a `null`, ce qui l'efface au contrat ; `name`, `date`
  // et `type` ne partent jamais vides, le back repondrait 422.
  const corps = {
    name: saisieFete.name,
    date: saisieFete.date,
    type: saisieFete.type,
    note: saisieFete.note === '' ? null : saisieFete.note,
  }
  const id = feteEditee.value
  const fait = await agir(
    () => (id === null ? ajouterFete(corps) : modifierFete(id, corps)),
    id === null ? 'Fête ajoutée.' : 'Fête modifiée.',
  )
  if (fait) feteOuverte.value = false
}

async function retirer(id: number): Promise<void> {
  await agir(() => supprimerFete(id), 'Fête retirée.')
}

async function choisirDocument(evenement: Event): Promise<void> {
  const champ = evenement.target as HTMLInputElement
  const fichier = champ.files?.[0]
  if (!fichier) return

  erreurDocument.value = ''
  const refus = refusDuDocument(fichier)
  if (refus !== null) {
    erreurDocument.value = refus
    // Sans cela, choisir deux fois le meme fichier ne declenche plus rien.
    champ.value = ''
    return
  }

  envoiDocument.value = true
  try {
    saisieReglages.document_url = await televerserDocument(fichier)
  } catch (souleve) {
    erreurDocument.value = messageErreurContenu(souleve)
  } finally {
    envoiDocument.value = false
    champ.value = ''
  }
}

/**
 * Les DEUX champs partent a chaque fois, et c'est le point dur du contrat :
 * l'enregistrement est un remplacement complet, pas une fusion. N'envoyer
 * que le texte effacerait le document sans que personne ne l'ait demande.
 */
async function enregistrerLesReglages(): Promise<void> {
  await agir(
    () =>
      enregistrerReglages({
        intro: saisieReglages.intro.trim() === '' ? null : saisieReglages.intro,
        document_url: saisieReglages.document_url === '' ? null : saisieReglages.document_url,
      }),
    'Présentation enregistrée.',
  )
}

onMounted(() => charger())
</script>
