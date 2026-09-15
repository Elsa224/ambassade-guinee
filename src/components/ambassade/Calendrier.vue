<template>
  <div class="min-h-screen bg-gray-50">
    <p v-if="premierChargement" class="text-gray-500 py-24 text-center">
      Chargement du calendrier…
    </p>

    <!-- Discipline de retractation : tant que le CMS ne sert ni fete, ni
         texte, ni document, la page ne montre rien du gabarit. -->
    <div v-else-if="!aDuContenu" class="max-w-3xl mx-auto px-4 py-24 text-center">
      <h1 class="text-2xl font-bold text-gray-800 mb-3">Rubrique en préparation</h1>
      <p class="text-gray-600 mb-8">Le calendrier des jours fériés n'a pas encore été publié.</p>
      <router-link to="/" class="text-accent font-semibold hover:underline">
        Retour à l'accueil
      </router-link>
    </div>

    <template v-else>
      <!-- Bandeau -->
      <div class="relative bg-gradient-to-r from-accent to-primary-light text-white">
        <div class="absolute inset-0 bg-black/20"></div>
        <div class="relative max-w-7xl mx-auto px-4 py-16 md:py-20">
          <div class="text-center">
            <div
              class="inline-flex items-center gap-2 bg-white/20 backdrop-blur px-4 py-1 rounded-full text-sm mb-4"
            >
              <img
                v-if="drapeau !== ''"
                :src="drapeau"
                :alt="`Drapeau ${articleDuPays(nomOfficiel)} ${nomOfficiel}`"
                class="w-5 h-auto rounded-sm"
              />
              {{ nomDeLAmbassade }}
            </div>
            <h1 class="text-4xl md:text-5xl font-bold mb-4">Calendrier des jours fériés</h1>
            <p class="text-xl md:text-2xl max-w-3xl mx-auto opacity-90">
              Fêtes légales et commémorations officielles
            </p>
            <div class="flex justify-center gap-4 mt-8">
              <div class="w-16 h-1 bg-accent"></div>
              <div class="w-16 h-1 bg-secondary"></div>
              <div class="w-16 h-1 bg-primary-light"></div>
            </div>
          </div>
        </div>

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

      <div class="max-w-4xl mx-auto px-4 py-12">
        <!-- Annee servie, selecteur, et texte de presentation de l'ambassade -->
        <div class="bg-white rounded-2xl shadow-lg p-8 mb-8">
          <div class="flex flex-col md:flex-row justify-between items-start gap-6">
            <div class="flex items-center gap-4">
              <div class="bg-accent p-4 rounded-full">
                <i class="bx bx-calendar text-3xl text-white" aria-hidden="true"></i>
              </div>
              <div>
                <span class="text-sm text-gray-500">Calendrier officiel</span>
                <h2 class="text-4xl font-bold text-accent">{{ calendrier.year }}</h2>
              </div>
            </div>

            <div v-if="annees.length > 1">
              <label for="annee-feries" class="block text-sm text-gray-500 mb-1">
                Changer d'année
              </label>
              <select
                id="annee-feries"
                v-model.number="anneeChoisie"
                class="border border-gray-300 rounded-lg px-4 py-2 focus:outline-none focus:ring-2 focus:ring-accent"
                @change="charger(anneeChoisie)"
              >
                <option v-for="annee in annees" :key="annee" :value="annee">{{ annee }}</option>
              </select>
            </div>
          </div>

          <!-- Texte saisi par l'ambassade : reference du decret, precisions.
               Rien n'est ecrit en dur ici, le gabarit n'en porte aucun. -->
          <p
            v-if="calendrier.intro !== null"
            class="mt-6 bg-secondary/10 p-4 rounded-xl text-sm text-gray-700 whitespace-pre-line"
          >
            {{ calendrier.intro }}
          </p>
        </div>

        <!-- Liste des fetes, dans l'ordre servi : date croissante puis id -->
        <div class="bg-white rounded-2xl shadow-xl overflow-hidden mb-8">
          <div class="bg-gradient-to-r from-accent to-primary-light p-6">
            <h3 class="text-2xl font-bold text-white">Fêtes légales {{ calendrier.year }}</h3>
          </div>

          <div class="p-6">
            <p v-if="calendrier.holidays.length === 0" class="text-gray-600 text-center py-6">
              Aucune fête n'est publiée pour cette année.
            </p>

            <div v-else class="space-y-4">
              <div
                v-for="fete in calendrier.holidays"
                :key="fete.id"
                class="border-l-4 pl-4 py-2 hover:bg-gray-50 transition-colors"
                :class="bordureDuType(fete.type)"
              >
                <div class="flex flex-wrap justify-between items-center gap-2">
                  <div class="min-w-0">
                    <span class="font-bold text-lg">{{ formaterJour(fete.date) }}</span>
                    <span class="ml-3 text-gray-600 break-words">{{ fete.name }}</span>
                    <p v-if="fete.note !== null" class="text-sm text-gray-500 break-words">
                      {{ fete.note }}
                    </p>
                  </div>
                  <span
                    class="px-3 py-1 rounded-full text-sm font-medium whitespace-nowrap"
                    :class="pastilleDuType(fete.type)"
                  >
                    {{ libelleDuType(fete.type) }}
                  </span>
                </div>
              </div>
            </div>

            <!-- Legende : les trois types du contrat, et eux seuls -->
            <div
              v-if="calendrier.holidays.length > 0"
              class="mt-8 pt-6 border-t border-gray-200 grid grid-cols-1 sm:grid-cols-3 gap-4"
            >
              <div v-for="type in TYPES" :key="type" class="flex items-center gap-2">
                <div class="w-4 h-4 rounded" :class="temoinDuType(type)"></div>
                <span class="text-sm">{{ libelleDuType(type) }}</span>
              </div>
            </div>
          </div>
        </div>

        <!-- Document servi par l'ambassade. Le relais ne pose pas de
             Content-Disposition : le PDF s'ouvre dans l'onglet, il ne se
             telecharge pas. Le libelle le dit. -->
        <div
          v-if="calendrier.document_url !== null"
          class="bg-gradient-to-r from-accent to-primary-light text-white rounded-2xl p-8 text-center"
        >
          <h3 class="text-2xl font-bold mb-4">Calendrier officiel au format PDF</h3>
          <a
            :href="calendrier.document_url"
            target="_blank"
            rel="noopener"
            class="bg-white text-accent px-8 py-3 rounded-full font-semibold hover:bg-gray-100 transition-colors inline-flex items-center gap-2"
          >
            <i class="bx bx-file" aria-hidden="true"></i>
            Consulter le calendrier au format PDF
          </a>
        </div>
      </div>
    </template>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, onMounted } from 'vue'
import {
  recupererCalendrier,
  anneesDuSelecteur,
  libelleDuType,
  formaterJour,
  CALENDRIER_VIDE,
  type CalendrierFeries,
  type TypeDeFete,
} from '@/api/jours-feries'
import { useIdentite, articleDuPays } from '@/tenant/identite'

/**
 * La page portait en dur le calendrier guineen : l'annee 2023 figee, le
 * decret D/2022/0526/PRG/CNRD/SGG, treize fetes, une image du calendrier
 * guineen, un tableau recapitulatif qui repetait la liste et un bouton de
 * telechargement qui ne menait nulle part. C'etait l'une des fuites
 * d'identite du gabarit.
 *
 * Tout vient desormais de `GET /api/content/holidays`. Le texte de
 * presentation, jadis la reference du decret guinéen, est saisi par
 * l'ambassade ; le PDF aussi. Sur un echec, le calendrier reste vide et la
 * page se retracte.
 */
const calendrier = ref<CalendrierFeries>({ ...CALENDRIER_VIDE })
/**
 * Seul le premier chargement masque la page. Un changement d'annee la
 * laisse en place : escamoter le selecteur pendant sa propre requete ferait
 * disparaitre le controle qu'on vient d'actionner.
 */
const premierChargement = ref(true)
const anneeChoisie = ref(CALENDRIER_VIDE.year)

const { nomOfficiel, nomDeLAmbassade, drapeau } = useIdentite()

const annees = computed(() => anneesDuSelecteur(calendrier.value))
/**
 * La retractation se juge sur l'ambassade, pas sur l'annee affichee.
 *
 * `available_years` porte toutes les annees pourvues : une annee vide garde
 * donc la page et son selecteur, sans quoi la consulter suffirait a effacer
 * le moyen d'en sortir.
 */
const aDuContenu = computed(
  () =>
    calendrier.value.holidays.length > 0 ||
    calendrier.value.available_years.length > 0 ||
    calendrier.value.intro !== null ||
    calendrier.value.document_url !== null,
)

/** Les trois types du contrat, dans l'ordre de la legende. */
const TYPES: readonly TypeDeFete[] = ['legale', 'nationale', 'religieuse']

const BORDURES: Readonly<Record<TypeDeFete, string>> = {
  legale: 'border-accent',
  nationale: 'border-secondary',
  religieuse: 'border-primary-light',
}
const PASTILLES: Readonly<Record<TypeDeFete, string>> = {
  legale: 'bg-accent/10 text-accent',
  nationale: 'bg-secondary/10 text-secondary',
  religieuse: 'bg-primary-light/10 text-primary-light',
}
const TEMOINS: Readonly<Record<TypeDeFete, string>> = {
  legale: 'bg-accent',
  nationale: 'bg-secondary',
  religieuse: 'bg-primary-light',
}

/** Un type inconnu ne casse pas la mise en page : il prend le gris neutre. */
const bordureDuType = (type: string) => BORDURES[type as TypeDeFete] ?? 'border-gray-300'
const pastilleDuType = (type: string) =>
  PASTILLES[type as TypeDeFete] ?? 'bg-gray-100 text-gray-600'
const temoinDuType = (type: TypeDeFete) => TEMOINS[type]

async function charger(annee?: number): Promise<void> {
  try {
    calendrier.value = await recupererCalendrier(annee)
    anneeChoisie.value = calendrier.value.year
  } catch {
    // Le calendrier reste vide : la page affiche « Rubrique en preparation ».
  } finally {
    premierChargement.value = false
  }
}

onMounted(() => charger())
</script>

<style scoped>
.border-l-4 {
  transition: all 0.3s ease;
}

.border-l-4:hover {
  transform: translateX(5px);
}
</style>
