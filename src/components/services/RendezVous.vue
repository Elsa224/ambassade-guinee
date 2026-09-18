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
            Service aux citoyens
          </div>
          <h1 class="text-4xl md:text-5xl font-bold mb-4">Prise de rendez-vous</h1>
          <p class="text-xl md:text-2xl max-w-3xl mx-auto opacity-90">
            Prenez rendez-vous avec les services consulaires de l'Ambassade
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
            fill="#f3f4f6"
            fill-opacity="1"
            d="M0,64L80,69.3C160,75,320,85,480,80C640,75,800,53,960,48C1120,43,1280,53,1360,58.7L1440,64L1440,120L1360,120C1280,120,1120,120,960,120C800,120,640,120,480,120C320,120,160,120,80,120L0,120Z"
          ></path>
        </svg>
      </div>
    </div>

    <!-- Contenu principal -->
    <div class="max-w-7xl mx-auto px-4 py-12">
      <div class="grid grid-cols-1 lg:grid-cols-3 gap-8">
        <!-- Formulaire de rendez-vous -->
        <div class="lg:col-span-2">
          <div class="bg-white rounded-2xl shadow-xl p-8">
            <h2 class="text-2xl font-bold text-gray-800 mb-6 flex items-center">
              <span class="bg-accent w-1 h-6 mr-3"></span>
              Formulaire de rendez-vous
            </h2>

            <form @submit.prevent="envoyerDemande" class="space-y-6">
              <!-- Type de service -->
              <div>
                <label class="block text-sm font-semibold text-gray-700 mb-2">
                  Type de service *
                </label>
                <ChampSelect v-model="formulaire.service" :options="optionsService" />
                <p v-if="erreurs.service" class="mt-2 text-sm text-red-600" role="alert">
                  {{ erreurs.service }}
                </p>
              </div>

              <!-- Informations personnelles -->
              <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label class="block text-sm font-semibold text-gray-700 mb-2"> Nom * </label>
                  <input
                    type="text"
                    v-model="formulaire.last_name"
                    class="w-full px-4 py-3 rounded-lg border border-gray-300 focus:outline-none focus:ring-2 focus:ring-accent focus:border-transparent"
                    required
                  />
                  <p v-if="erreurs.last_name" class="mt-2 text-sm text-red-600" role="alert">
                    {{ erreurs.last_name }}
                  </p>
                </div>
                <div>
                  <label class="block text-sm font-semibold text-gray-700 mb-2">
                    Prénom(s) *
                  </label>
                  <input
                    type="text"
                    v-model="formulaire.first_name"
                    class="w-full px-4 py-3 rounded-lg border border-gray-300 focus:outline-none focus:ring-2 focus:ring-accent focus:border-transparent"
                    required
                  />
                  <p v-if="erreurs.first_name" class="mt-2 text-sm text-red-600" role="alert">
                    {{ erreurs.first_name }}
                  </p>
                </div>
              </div>

              <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label class="block text-sm font-semibold text-gray-700 mb-2"> Email * </label>
                  <input
                    type="email"
                    v-model="formulaire.email"
                    class="w-full px-4 py-3 rounded-lg border border-gray-300 focus:outline-none focus:ring-2 focus:ring-accent focus:border-transparent"
                    required
                  />
                  <p v-if="erreurs.email" class="mt-2 text-sm text-red-600" role="alert">
                    {{ erreurs.email }}
                  </p>
                </div>
                <div>
                  <label class="block text-sm font-semibold text-gray-700 mb-2">
                    Téléphone *
                  </label>
                  <input
                    type="tel"
                    v-model="formulaire.phone"
                    class="w-full px-4 py-3 rounded-lg border border-gray-300 focus:outline-none focus:ring-2 focus:ring-accent focus:border-transparent"
                    required
                  />
                  <p v-if="erreurs.phone" class="mt-2 text-sm text-red-600" role="alert">
                    {{ erreurs.phone }}
                  </p>
                </div>
              </div>

              <!-- Date et heure -->
              <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label class="block text-sm font-semibold text-gray-700 mb-2">
                    Date souhaitée *
                  </label>
                  <ChampDate v-model="formulaire.preferred_date" :min="dateMin" requis />
                  <p v-if="erreurs.preferred_date" class="mt-2 text-sm text-red-600" role="alert">
                    {{ erreurs.preferred_date }}
                  </p>
                </div>
                <div>
                  <label class="block text-sm font-semibold text-gray-700 mb-2">
                    Heure souhaitée *
                  </label>
                  <ChampSelect v-model="formulaire.preferred_time" :options="OPTIONS_HEURE" />
                  <p v-if="erreurs.preferred_time" class="mt-2 text-sm text-red-600" role="alert">
                    {{ erreurs.preferred_time }}
                  </p>
                </div>
              </div>

              <!-- Documents -->
              <div>
                <label class="block text-sm font-semibold text-gray-700 mb-2">
                  Documents à apporter *
                </label>
                <textarea
                  v-model="formulaire.documents"
                  rows="3"
                  class="w-full px-4 py-3 rounded-lg border border-gray-300 focus:outline-none focus:ring-2 focus:ring-accent focus:border-transparent"
                  placeholder="Listez les documents que vous apporterez (passeport, formulaire, etc.)"
                  required
                ></textarea>
              </div>

              <!-- Message -->
              <div>
                <label class="block text-sm font-semibold text-gray-700 mb-2">
                  Message (optionnel)
                </label>
                <textarea
                  v-model="formulaire.message"
                  rows="3"
                  class="w-full px-4 py-3 rounded-lg border border-gray-300 focus:outline-none focus:ring-2 focus:ring-accent focus:border-transparent"
                  placeholder="Informations complémentaires..."
                ></textarea>
              </div>

              <p
                v-if="echec"
                class="rounded-lg border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700"
                role="alert"
              >
                {{ echec }}
              </p>

              <!-- Bouton soumission - CENTRÉ -->
              <div class="flex justify-center pt-4">
                <button
                  type="submit"
                  :disabled="envoi"
                  class="bg-accent text-white px-10 py-4 rounded-lg font-semibold hover:bg-accent-dark transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-3 text-lg shadow-lg hover:shadow-xl"
                >
                  <svg v-if="envoi" class="animate-spin h-5 w-5" fill="none" viewBox="0 0 24 24">
                    <circle
                      class="opacity-25"
                      cx="12"
                      cy="12"
                      r="10"
                      stroke="currentColor"
                      stroke-width="4"
                    ></circle>
                    <path
                      class="opacity-75"
                      fill="currentColor"
                      d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                    ></path>
                  </svg>
                  <span v-else>📅 Demander un rendez-vous</span>
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
              <svg
                class="w-6 h-6 text-accent mr-2"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  stroke-linecap="round"
                  stroke-linejoin="round"
                  stroke-width="2"
                  d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z"
                ></path>
              </svg>
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
              <svg
                class="w-6 h-6 text-accent mr-2"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  stroke-linecap="round"
                  stroke-linejoin="round"
                  stroke-width="2"
                  d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z"
                ></path>
                <path
                  stroke-linecap="round"
                  stroke-linejoin="round"
                  stroke-width="2"
                  d="M15 11a3 3 0 11-6 0 3 3 0 016 0z"
                ></path>
              </svg>
              Nous contacter
            </h3>
            <div class="space-y-3">
              <div class="flex items-start gap-3">
                <svg
                  class="w-5 h-5 text-accent mt-1"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    stroke-linecap="round"
                    stroke-linejoin="round"
                    stroke-width="2"
                    d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z"
                  ></path>
                </svg>
                <div>
                  <p class="font-semibold">Téléphone</p>
                  <p class="text-gray-600">{{ identite.telephone.value || 'Non communiqué' }}</p>
                </div>
              </div>
              <div class="flex items-start gap-3">
                <svg
                  class="w-5 h-5 text-accent mt-1"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    stroke-linecap="round"
                    stroke-linejoin="round"
                    stroke-width="2"
                    d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z"
                  ></path>
                </svg>
                <div>
                  <p class="font-semibold">Email</p>
                  <p class="text-gray-600">{{ identite.courriel.value }}</p>
                </div>
              </div>
              <div v-if="identite.adresse.value" class="flex items-start gap-3">
                <svg
                  class="w-5 h-5 text-accent mt-1"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    stroke-linecap="round"
                    stroke-linejoin="round"
                    stroke-width="2"
                    d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z"
                  ></path>
                  <path
                    stroke-linecap="round"
                    stroke-linejoin="round"
                    stroke-width="2"
                    d="M15 11a3 3 0 11-6 0 3 3 0 016 0z"
                  ></path>
                </svg>
                <div>
                  <p class="font-semibold">Adresse</p>
                  <p class="text-gray-600 whitespace-pre-line">{{ identite.adresse.value }}</p>
                </div>
              </div>
            </div>
          </div>

          <!-- Documents requis -->
          <div class="bg-gradient-to-r from-accent to-primary-light text-white rounded-2xl p-6">
            <h3 class="text-xl font-bold mb-4 flex items-center">
              <svg class="w-6 h-6 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path
                  stroke-linecap="round"
                  stroke-linejoin="round"
                  stroke-width="2"
                  d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"
                ></path>
              </svg>
              Documents requis
            </h3>
            <ul class="space-y-2 text-sm">
              <li class="flex items-start gap-2">
                <span class="text-secondary">✓</span>
                <span>Pièce d'identité valide (passeport, carte consulaire)</span>
              </li>
              <li class="flex items-start gap-2">
                <span class="text-secondary">✓</span>
                <span>Formulaire de rendez-vous rempli</span>
              </li>
              <li class="flex items-start gap-2">
                <span class="text-secondary">✓</span>
                <span>Documents spécifiques selon le service demandé</span>
              </li>
              <li class="flex items-start gap-2">
                <span class="text-secondary">✓</span>
                <span>Justificatif de domicile dans le pays de résidence</span>
              </li>
            </ul>
          </div>
        </div>
      </div>

      <!-- Modal de confirmation -->
      <div
        v-if="accuse"
        class="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4"
        role="dialog"
        aria-modal="true"
      >
        <div class="bg-white rounded-2xl max-w-md w-full p-8 text-center">
          <div
            class="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4"
          >
            <svg
              class="w-8 h-8 text-green-600"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                stroke-linecap="round"
                stroke-linejoin="round"
                stroke-width="2"
                d="M5 13l4 4L19 7"
              ></path>
            </svg>
          </div>
          <h3 class="text-2xl font-bold text-gray-800 mb-2">Demande enregistrée</h3>
          <p class="text-gray-600 mb-4">
            Le service consulaire vous recontactera pour confirmer la date et l’heure de votre
            rendez-vous.
          </p>
          <p class="mb-6 text-gray-600">
            Conservez votre référence :
            <span class="font-semibold text-gray-800">{{ accuse.reference }}</span>
          </p>
          <button
            @click="fermerConfirmation"
            class="bg-accent text-white px-6 py-3 rounded-lg font-semibold hover:bg-accent-dark transition-colors"
          >
            Fermer
          </button>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, reactive, computed, onMounted } from 'vue'
import ChampSelect from '@/components/ui/ChampSelect.vue'
import ChampDate from '@/components/ui/ChampDate.vue'
import { aujourdHui, decaler, versIso } from '@/components/ui/dates'
import { useIdentite } from '@/tenant/identite'
import { recupererServices, type Service } from '@/api/services'
import {
  envoyerDemandeRendezVous,
  estTropDeDemandes,
  DELAI_MINIMAL_EN_JOURS,
  SERVICE_AUTRE,
  type AccuseRendezVous,
} from '@/api/rendez-vous'
import { erreursDeChamp } from '@/api/evenements-admin'
import { ApiError, messageDeLEchec } from '@/api/client'

const identite = useIdentite()

/**
 * Les services proposes sont ceux que l'ambassade a publies.
 *
 * La liste etait ecrite en dur et venait du gabarit guineen : elle offrait un
 * rendez-vous pour des services qu'une autre ambassade n'assure pas. Quand le
 * poste n'a rien publie, il ne reste que « Autre service », ce qui est
 * honnete : le champ libre porte alors la demande.
 */
const services = ref<Service[]>([])

const optionsService = computed(() => [
  { valeur: '', libelle: 'Sélectionnez un service' },
  ...services.value.map((service) => ({ valeur: service.slug, libelle: service.title })),
  { valeur: SERVICE_AUTRE, libelle: 'Autre service' },
])

onMounted(async () => {
  try {
    services.value = (await recupererServices()).services
  } catch {
    // Le formulaire reste utilisable : « Autre service » suffit a envoyer.
    services.value = []
  }
})

const OPTIONS_HEURE = [
  { valeur: '', libelle: 'Sélectionnez une heure' },
  { valeur: '09:00', libelle: '09:00' },
  { valeur: '09:30', libelle: '09:30' },
  { valeur: '10:00', libelle: '10:00' },
  { valeur: '10:30', libelle: '10:30' },
  { valeur: '11:00', libelle: '11:00' },
  { valeur: '11:30', libelle: '11:30' },
  { valeur: '14:00', libelle: '14:00' },
  { valeur: '14:30', libelle: '14:30' },
  { valeur: '15:00', libelle: '15:00' },
  { valeur: '15:30', libelle: '15:30' },
  { valeur: '16:00', libelle: '16:00' },
]

/**
 * Les champs portent les noms du contrat, et ce n'est pas une paresse : le
 * serveur range ses refus de validation par nom de champ, et c'est ce qui
 * permet de poser chaque message sous le champ qu'il concerne.
 */
const formulaire = reactive({
  service: '',
  last_name: '',
  first_name: '',
  email: '',
  phone: '',
  preferred_date: '',
  preferred_time: '',
  documents: '',
  message: '',
})

const envoi = ref(false)
const erreurs = ref<Record<string, string>>({})
const echec = ref<string | null>(null)

/** L'accuse du serveur. Tant qu'il est nul, rien n'a ete enregistre. */
const accuse = ref<AccuseRendezVous | null>(null)

// Date minimale : aujourd'hui plus deux jours. Le calcul reste en heure
// locale — `toISOString()` rend une date UTC, qui recule d'un jour a l'ouest
// de Greenwich et proposerait un creneau trop tot. Le serveur applique la
// meme borne : un front n'est pas une garantie.
const dateMin = ref(versIso(decaler(aujourdHui(), DELAI_MINIMAL_EN_JOURS)))

/**
 * Envoie la demande, et n'affiche la confirmation qu'apres la reponse.
 *
 * Ce composant simulait l'envoi : un `setTimeout`, un `console.log`, puis la
 * fenetre « enregistree avec succes ». La demande du citoyen etait jetee et
 * il repartait en croyant avoir un rendez-vous consulaire.
 */
async function envoyerDemande() {
  envoi.value = true
  erreurs.value = {}
  echec.value = null
  try {
    accuse.value = await envoyerDemandeRendezVous({ ...formulaire })
    for (const cle of Object.keys(formulaire) as (keyof typeof formulaire)[]) {
      formulaire[cle] = ''
    }
  } catch (souleve) {
    erreurs.value = erreursDeChamp(souleve)
    echec.value = messageDuRefus(souleve)
  } finally {
    envoi.value = false
  }
}

/** Le texte du bandeau d'echec, selon ce que le serveur a refuse. */
function messageDuRefus(souleve: unknown): string {
  if (estTropDeDemandes(souleve)) {
    return 'Trop de demandes ont été envoyées depuis cet appareil. Réessayez dans quelques minutes.'
  }
  if (Object.keys(erreurs.value).length > 0) {
    return 'Certains champs doivent être corrigés avant l’envoi.'
  }
  if (souleve instanceof ApiError && souleve.corpsPorteUnMessage) {
    return messageDeLEchec(souleve.corps, souleve.statut)
  }
  return "Votre demande n'a pas pu être envoyée. Vérifiez votre connexion et réessayez."
}

function fermerConfirmation() {
  accuse.value = null
}
</script>

<style scoped>
.animate-spin {
  animation: spin 1s linear infinite;
}

@keyframes spin {
  from {
    transform: rotate(0deg);
  }
  to {
    transform: rotate(360deg);
  }
}

.hover\:shadow-md {
  transition: all 0.3s ease;
}
</style>
