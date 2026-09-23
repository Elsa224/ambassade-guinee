<template>
  <div class="min-h-screen bg-gray-50">
    <!-- Hero section -->
    <div class="relative bg-gradient-to-r from-accent to-primary-light text-white">
      <div class="absolute inset-0 bg-black/20"></div>
      <div class="relative max-w-7xl mx-auto px-4 py-16 md:py-20">
        <div class="text-center">
          <div
            class="inline-flex items-center gap-2 bg-white/20 backdrop-blur px-4 py-1 rounded-full text-sm mb-4"
          >
            <img
              v-if="identite.drapeau.value"
              :src="identite.drapeau.value"
              alt=""
              class="h-4 w-6 object-cover rounded-sm"
            />
            Visite à la chancellerie
          </div>
          <h1 class="text-4xl md:text-5xl font-bold mb-4">Prise de rendez-vous</h1>
          <p class="text-xl md:text-2xl max-w-3xl mx-auto opacity-90">
            Demandez à rencontrer l'Ambassadeur ou l'un des services de la chancellerie
          </p>
          <div class="flex justify-center gap-4 mt-8">
            <div class="w-16 h-1 bg-accent"></div>
            <div class="w-16 h-1 bg-secondary"></div>
            <div class="w-16 h-1 bg-primary-light"></div>
          </div>
        </div>
      </div>

      <!-- Wave decoration -->
      <div class="absolute bottom-0 left-0 right-0">
        <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 1440 120" class="w-full h-auto">
          <path
            fill="#f9fafb"
            fill-opacity="1"
            d="M0,64L80,69.3C160,75,320,85,480,80C640,75,800,53,960,48C1120,43,1280,53,1360,58.7L1440,64L1440,120L1360,120C1280,120,1120,120,960,120C800,120,640,120,480,120C320,120,160,120,80,120L0,120Z"
          ></path>
        </svg>
      </div>
    </div>

    <!-- Contenu principal -->
    <div class="max-w-7xl mx-auto px-4 py-12">
      <!-- Ce que cette page N'EST PAS. Place avant le formulaire, et non en
           note de bas de page : le formulaire du gabarit proposait
           « Demande de passeport » et « Information visa », et une demande de
           passeport adressee au secretariat de l'Ambassadeur ne va nulle
           part. -->
      <div class="mb-8 rounded-2xl border-l-4 border-secondary bg-white p-6 shadow-sm">
        <h2 class="text-lg font-bold text-gray-800 mb-2">
          Pour une démarche consulaire, ce n'est pas ici
        </h2>
        <p class="text-gray-600">
          Passeport, visa, acte d'état civil, légalisation : ces démarches ne se prennent pas sur
          cette page. Consultez
          <router-link to="/services" class="font-semibold text-primary-dark underline">
            la page des services
          </router-link>
          , qui indique la plateforme à utiliser.
        </p>
        <p class="text-gray-600 mt-2">
          Ce formulaire sert uniquement à demander une visite à la chancellerie.
        </p>
      </div>

      <p v-if="chargement" class="py-16 text-center text-gray-500">Chargement du formulaire…</p>

      <!-- Le service est injoignable : on ne montre pas un formulaire dont
           l'envoi echouerait, et surtout on n'invente pas une liste de
           services que l'ambassade n'a pas declares. -->
      <div v-else-if="erreurChargement" class="mx-auto max-w-2xl py-16 text-center">
        <h2 class="mb-3 text-2xl font-bold text-gray-800">Prise de rendez-vous indisponible</h2>
        <p class="mb-8 text-gray-600">{{ erreurChargement }}</p>
        <router-link to="/" class="font-semibold text-accent hover:underline">
          Retour à l'accueil
        </router-link>
      </div>

      <div v-else class="grid grid-cols-1 lg:grid-cols-3 gap-8">
        <!-- Formulaire de rendez-vous -->
        <div class="lg:col-span-2">
          <div class="bg-white rounded-2xl shadow-xl p-8">
            <h2 class="text-2xl font-bold text-gray-800 mb-6 flex items-center">
              <span class="bg-accent w-1 h-6 mr-3"></span>
              Formulaire de demande
            </h2>

            <form class="space-y-6" @submit.prevent="envoyer">
              <div v-if="departements.length > 0">
                <label for="rdv-departement" class="block text-sm font-semibold text-gray-700 mb-2">
                  Service à rencontrer
                </label>
                <ChampSelect
                  id="rdv-departement"
                  v-model="saisie.departmentSlug"
                  :options="optionsDepartement"
                  placeholder="Sélectionnez un service"
                />
              </div>

              <div>
                <label for="rdv-host" class="block text-sm font-semibold text-gray-700 mb-2">
                  Personne à rencontrer (optionnel)
                </label>
                <input
                  id="rdv-host"
                  v-model="saisie.host"
                  type="text"
                  :class="CLASSE_CHAMP"
                  placeholder="Nom de la personne, si vous le connaissez"
                />
              </div>

              <div>
                <label for="rdv-purpose" class="block text-sm font-semibold text-gray-700 mb-2">
                  Motif de la visite *
                </label>
                <textarea
                  id="rdv-purpose"
                  v-model="saisie.purpose"
                  rows="3"
                  :class="CLASSE_CHAMP"
                  placeholder="Expliquez en quelques mots l'objet de votre visite"
                  required
                ></textarea>
              </div>

              <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label for="rdv-lastname" class="block text-sm font-semibold text-gray-700 mb-2">
                    Nom *
                  </label>
                  <input
                    id="rdv-lastname"
                    v-model="saisie.lastName"
                    type="text"
                    :class="CLASSE_CHAMP"
                    required
                  />
                </div>
                <div>
                  <label for="rdv-firstname" class="block text-sm font-semibold text-gray-700 mb-2">
                    Prénom(s) *
                  </label>
                  <input
                    id="rdv-firstname"
                    v-model="saisie.firstName"
                    type="text"
                    :class="CLASSE_CHAMP"
                    required
                  />
                </div>
              </div>

              <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label for="rdv-email" class="block text-sm font-semibold text-gray-700 mb-2">
                    Email *
                  </label>
                  <input
                    id="rdv-email"
                    v-model="saisie.email"
                    type="email"
                    :class="CLASSE_CHAMP"
                    required
                  />
                </div>
                <div>
                  <label for="rdv-phone" class="block text-sm font-semibold text-gray-700 mb-2">
                    Téléphone *
                  </label>
                  <input
                    id="rdv-phone"
                    v-model="saisie.phone"
                    type="tel"
                    :class="CLASSE_CHAMP"
                    required
                  />
                </div>
              </div>

              <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label for="rdv-date" class="block text-sm font-semibold text-gray-700 mb-2">
                    Date souhaitée *
                  </label>
                  <ChampDate
                    id="rdv-date"
                    v-model="saisie.date"
                    :min="dateMinimale"
                    :max="dateMaximale"
                    requis
                  />
                  <p class="mt-1 text-xs text-gray-500">
                    Jusqu'à {{ FENETRE_EN_JOURS }} jours à l'avance.
                  </p>
                </div>
                <div>
                  <label for="rdv-time" class="block text-sm font-semibold text-gray-700 mb-2">
                    Heure souhaitée *
                  </label>
                  <ChampSelect
                    id="rdv-time"
                    v-model="saisie.time"
                    :options="optionsHeure"
                    placeholder="Sélectionnez une heure"
                  />
                  <p v-if="optionsHeure.length === 0" class="mt-1 text-xs text-amber-700">
                    Il n'y a plus d'heure disponible aujourd'hui. Choisissez une autre date.
                  </p>
                </div>
              </div>

              <fieldset class="rounded-xl border border-gray-200 p-4">
                <legend class="px-2 text-sm font-semibold text-gray-700">
                  Pièce d'identité (optionnel)
                </legend>
                <p class="mb-4 text-sm text-gray-500">
                  La joindre à l'avance accélère le contrôle à l'entrée. Vous pouvez aussi la
                  présenter sur place.
                </p>

                <div class="mb-4">
                  <label for="rdv-idnumber" class="block text-sm font-semibold text-gray-700 mb-2">
                    Numéro de la pièce
                  </label>
                  <input
                    id="rdv-idnumber"
                    v-model="saisie.idNumber"
                    type="text"
                    :class="CLASSE_CHAMP"
                  />
                </div>

                <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label for="rdv-recto" class="block text-sm font-semibold text-gray-700 mb-2">
                      Recto
                    </label>
                    <input
                      id="rdv-recto"
                      type="file"
                      accept="image/*"
                      class="w-full text-sm text-gray-600 file:mr-3 file:rounded-lg file:border-0 file:bg-gray-100 file:px-4 file:py-2 file:text-sm file:font-semibold file:text-gray-700"
                      @change="choisirRecto"
                    />
                  </div>
                  <div>
                    <label for="rdv-verso" class="block text-sm font-semibold text-gray-700 mb-2">
                      Verso
                    </label>
                    <input
                      id="rdv-verso"
                      type="file"
                      accept="image/*"
                      class="w-full text-sm text-gray-600 file:mr-3 file:rounded-lg file:border-0 file:bg-gray-100 file:px-4 file:py-2 file:text-sm file:font-semibold file:text-gray-700"
                      @change="choisirVerso"
                    />
                  </div>
                </div>

                <p v-if="erreurFichier" class="mt-3 text-sm text-red-700" role="alert">
                  {{ erreurFichier }}
                </p>
              </fieldset>

              <p v-if="erreurEnvoi" class="text-sm text-red-700" role="alert">{{ erreurEnvoi }}</p>

              <div class="flex justify-center pt-4">
                <button
                  type="submit"
                  :disabled="envoiEnCours"
                  class="bg-accent text-white px-10 py-4 rounded-lg font-semibold hover:bg-accent-dark transition-colors disabled:opacity-50 disabled:cursor-not-allowed text-lg shadow-lg hover:shadow-xl"
                >
                  {{ envoiEnCours ? 'Envoi en cours…' : 'Envoyer ma demande' }}
                </button>
              </div>
            </form>
          </div>
        </div>

        <!-- Sidebar informations -->
        <div class="space-y-6">
          <!-- Horaires d'ouverture -->
          <div class="bg-white rounded-2xl shadow-xl p-6">
            <h3 class="text-xl font-bold text-gray-800 mb-4 flex items-center">
              <i class="bx bx-time-five text-2xl text-accent mr-2" aria-hidden="true"></i>
              Horaires d'ouverture
            </h3>
            <p v-if="identite.horaires.value" class="text-gray-600">
              {{ identite.horaires.value }}
            </p>
            <p v-else class="text-gray-500">Les horaires d’ouverture ne sont pas encore publiés.</p>
          </div>

          <!-- Coordonnées -->
          <div class="bg-white rounded-2xl shadow-xl p-6">
            <h3 class="text-xl font-bold text-gray-800 mb-4 flex items-center">
              <i class="bx bx-map text-2xl text-accent mr-2" aria-hidden="true"></i>
              Nous contacter
            </h3>
            <div class="space-y-3">
              <div class="flex items-start gap-3">
                <i class="bx bx-phone mt-1 text-xl text-accent" aria-hidden="true"></i>
                <div>
                  <p class="font-semibold">Téléphone</p>
                  <p class="text-gray-600">{{ identite.telephone.value || 'Non communiqué' }}</p>
                </div>
              </div>
              <div class="flex items-start gap-3">
                <i class="bx bx-envelope mt-1 text-xl text-accent" aria-hidden="true"></i>
                <div>
                  <p class="font-semibold">Email</p>
                  <p class="text-gray-600">{{ identite.courriel.value }}</p>
                </div>
              </div>
              <div v-if="identite.adresse.value" class="flex items-start gap-3">
                <i class="bx bx-map-pin mt-1 text-xl text-accent" aria-hidden="true"></i>
                <div>
                  <p class="font-semibold">Adresse</p>
                  <p class="text-gray-600 whitespace-pre-line">{{ identite.adresse.value }}</p>
                </div>
              </div>
            </div>
          </div>

          <!-- Le jour de la visite -->
          <div class="bg-gradient-to-r from-accent to-primary-light text-white rounded-2xl p-6">
            <h3 class="text-xl font-bold mb-4 flex items-center">
              <i class="bx bx-id-card text-2xl mr-2" aria-hidden="true"></i>
              Le jour de la visite
            </h3>
            <ul class="space-y-2 text-sm">
              <li class="flex items-start gap-2">
                <span class="text-secondary">✓</span>
                <span>Présentez-vous avec une pièce d'identité valide.</span>
              </li>
              <li class="flex items-start gap-2">
                <span class="text-secondary">✓</span>
                <span>Munissez-vous de la référence qui vous sera remise.</span>
              </li>
              <li class="flex items-start gap-2">
                <span class="text-secondary">✓</span>
                <span>Arrivez quelques minutes en avance pour le contrôle à l'entrée.</span>
              </li>
            </ul>
          </div>
        </div>
      </div>

      <!-- Recapitulatif. C'est la SEULE et DERNIERE vue que le visiteur aura
           de sa demande : le CMS n'a aucune route pour la relire. -->
      <div
        v-if="confirmation"
        class="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4"
      >
        <div class="bg-white rounded-2xl max-w-md w-full p-8 max-h-full flex flex-col">
          <div
            class="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4 shrink-0"
          >
            <i class="bx bx-check text-3xl text-green-600" aria-hidden="true"></i>
          </div>
          <div class="flex-1 min-h-0 overflow-y-auto text-center">
            <h3 class="text-2xl font-bold text-gray-800 mb-2">Demande enregistrée</h3>
            <p class="text-gray-600 mb-6">
              Votre demande a bien été transmise à l'ambassade.
              <strong>Elle n'est pas encore confirmée</strong> : le poste vous recontacte.
            </p>

            <dl class="text-left space-y-3 rounded-xl bg-gray-50 p-4">
              <div>
                <dt class="text-sm font-semibold text-gray-700">Référence à conserver</dt>
                <dd class="text-lg font-bold text-gray-900 tabular-nums">
                  {{ confirmation.reference }}
                </dd>
              </div>
              <div>
                <dt class="text-sm font-semibold text-gray-700">État</dt>
                <dd class="text-gray-900">{{ libelleStatut(confirmation.status) }}</dd>
              </div>
              <div>
                <dt class="text-sm font-semibold text-gray-700">Date et heure demandées</dt>
                <!-- La date et l'heure SAISIES, et non le `scheduledAt` de la
                     reponse : l'amont serialise en UTC un instant construit
                     sans fuseau, et le reformater afficherait une autre heure
                     que celle demandee. -->
                <dd class="text-gray-900">{{ recapitulatifDateHeure }}</dd>
              </div>
              <div v-if="confirmation.department">
                <dt class="text-sm font-semibold text-gray-700">Service</dt>
                <dd class="text-gray-900">{{ confirmation.department.name }}</dd>
              </div>
              <div v-if="confirmation.host">
                <dt class="text-sm font-semibold text-gray-700">Personne à rencontrer</dt>
                <dd class="text-gray-900">{{ confirmation.host }}</dd>
              </div>
            </dl>
          </div>
          <button
            type="button"
            class="mt-6 shrink-0 bg-accent text-white px-6 py-3 rounded-lg font-semibold hover:bg-accent-dark transition-colors"
            @click="fermerConfirmation"
          >
            Fermer
          </button>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { computed, onMounted, reactive, ref } from 'vue'
import ChampSelect, { type OptionSelect } from '@/components/ui/ChampSelect.vue'
import ChampDate from '@/components/ui/ChampDate.vue'
import { aujourdHui, decaler, versAffichage, versIso } from '@/components/ui/dates'
import { useIdentite } from '@/tenant/identite'
import {
  recupererServiceRdv,
  demanderRendezVous,
  libelleStatut,
  messageErreurRdv,
  type DepartementRdv,
  type RendezVousCree,
} from '@/api/rendez-vous'

/**
 * Coordonnees de l'ambassade qui sert le domaine.
 *
 * La barre laterale portait celles du gabarit : un numero de Washington, une
 * adresse de Washington et le courriel de l'ambassade de Guinee aux
 * Etats-Unis.
 */
const identite = useIdentite()

const CLASSE_CHAMP =
  'w-full px-4 py-3 rounded-lg border border-gray-300 focus:outline-none focus:ring-2 focus:ring-accent focus:border-transparent'

/** Fenetre de reservation tenue par le serveur : 90 jours. */
const FENETRE_EN_JOURS = 90

/** Poids maximal d'une face de la piece, en octets — borne du serveur. */
const POIDS_MAXIMAL = 10 * 1024 * 1024

/**
 * Creneaux proposes : les heures ouvrables du poste, pas des disponibilites.
 *
 * Le module ne connait ni planning ni quota. Une liste fermee evite seulement
 * qu'on demande une visite a trois heures du matin ; elle ne promet rien.
 */
const CRENEAUX = [
  '09:00',
  '09:30',
  '10:00',
  '10:30',
  '11:00',
  '11:30',
  '14:00',
  '14:30',
  '15:00',
  '15:30',
  '16:00',
]

const chargement = ref(true)
const erreurChargement = ref('')
const departements = ref<DepartementRdv[]>([])

const envoiEnCours = ref(false)
const erreurEnvoi = ref('')
const erreurFichier = ref('')
const confirmation = ref<RendezVousCree | null>(null)

const saisie = reactive({
  departmentSlug: '',
  host: '',
  purpose: '',
  lastName: '',
  firstName: '',
  email: '',
  phone: '',
  date: '',
  time: '',
  idNumber: '',
})

const recto = ref<File | null>(null)
const verso = ref<File | null>(null)

// Ce que le visiteur a demande, fige a l'envoi : le formulaire est vide
// ensuite, et le recapitulatif doit continuer a le montrer.
const demandeAffichee = reactive({ date: '', time: '' })

const dateMinimale = versIso(aujourdHui())
const dateMaximale = versIso(decaler(aujourdHui(), FENETRE_EN_JOURS))

const optionsDepartement = computed<OptionSelect[]>(() =>
  departements.value.map((departement) => ({
    valeur: departement.slug,
    libelle: departement.name,
  })),
)

/**
 * Creneaux encore possibles pour la date choisie.
 *
 * Les deux bornes ne coincident pas cote serveur : le CMS valide la DATE
 * seule (`after_or_equal:today`), tandis qu'Ambassade Secure refuse tout
 * horodatage deja passe. Une demande deposee aujourd'hui pour une heure
 * ecoulee franchirait donc la validation du CMS pour se faire refuser plus
 * loin. On retire ces heures plutot que de les laisser proposer.
 */
const optionsHeure = computed<OptionSelect[]>(() => {
  const maintenant = new Date()
  const estAujourdHui = saisie.date === dateMinimale
  return CRENEAUX.filter((creneau) => {
    if (!estAujourdHui) return true
    const [heures, minutes] = creneau.split(':')
    const passee =
      Number(heures) < maintenant.getHours() ||
      (Number(heures) === maintenant.getHours() && Number(minutes) <= maintenant.getMinutes())
    return !passee
  }).map((creneau) => ({ valeur: creneau, libelle: creneau }))
})

const recapitulatifDateHeure = computed(() =>
  demandeAffichee.date === ''
    ? ''
    : `${versAffichage(demandeAffichee.date)} à ${demandeAffichee.time}`,
)

onMounted(async () => {
  try {
    const service = await recupererServiceRdv()
    departements.value = service.departments
  } catch (souleve) {
    erreurChargement.value = messageErreurRdv(souleve)
  } finally {
    chargement.value = false
  }
})

/** Refuse un fichier trop lourd ou qui n'est pas une image, et dit pourquoi. */
function refusDuFichier(fichier: File): string {
  if (!fichier.type.startsWith('image/')) {
    return 'La pièce d’identité doit être une image (photo ou scan).'
  }
  if (fichier.size > POIDS_MAXIMAL) return 'Chaque face ne doit pas dépasser 10 Mo.'
  return ''
}

function choisir(evenement: Event, cible: typeof recto): void {
  const fichier = (evenement.target as HTMLInputElement).files?.[0] ?? null
  if (fichier === null) {
    cible.value = null
    return
  }
  const refus = refusDuFichier(fichier)
  if (refus !== '') {
    erreurFichier.value = refus
    cible.value = null
    ;(evenement.target as HTMLInputElement).value = ''
    return
  }
  erreurFichier.value = ''
  cible.value = fichier
}

function choisirRecto(evenement: Event): void {
  choisir(evenement, recto)
}

function choisirVerso(evenement: Event): void {
  choisir(evenement, verso)
}

async function envoyer(): Promise<void> {
  if (envoiEnCours.value) return
  envoiEnCours.value = true
  erreurEnvoi.value = ''

  try {
    const creee = await demanderRendezVous({
      firstName: saisie.firstName,
      lastName: saisie.lastName,
      phone: saisie.phone,
      email: saisie.email,
      date: saisie.date,
      time: saisie.time,
      purpose: saisie.purpose,
      host: saisie.host,
      departmentSlug: saisie.departmentSlug,
      idNumber: saisie.idNumber,
      ...(recto.value ? { idCardFront: recto.value } : {}),
      ...(verso.value ? { idCardBack: verso.value } : {}),
    })

    demandeAffichee.date = saisie.date
    demandeAffichee.time = saisie.time
    confirmation.value = creee
    reinitialiser()
  } catch (souleve) {
    erreurEnvoi.value = messageErreurRdv(souleve)
  } finally {
    envoiEnCours.value = false
  }
}

function reinitialiser(): void {
  for (const cle of Object.keys(saisie) as (keyof typeof saisie)[]) saisie[cle] = ''
  recto.value = null
  verso.value = null
  erreurFichier.value = ''
}

function fermerConfirmation(): void {
  confirmation.value = null
}
</script>
