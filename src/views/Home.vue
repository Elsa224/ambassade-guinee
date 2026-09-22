<template>
  <div class="min-h-screen bg-gray-50">
    <!-- HERO en diaporama, quand l'ambassade a choisi cette mise en page et
         televerse au moins une image. -->
    <BanniereDiaporama
      v-if="diaporamaAffiche"
      :titre="titreDeLaBanniere"
      :intro="banniere?.intro ?? null"
      :logo="logo"
      :diapositives="banniere?.slides ?? []"
    >
      <template #boutons>
        <router-link
          to="/actualite"
          class="bg-primary hover:bg-primary-dark text-white px-8 py-4 rounded-xl font-semibold shadow-lg transition-colors"
        >
          Consulter les actualités
        </router-link>
        <router-link
          v-if="servicesConsulairesOuverts"
          to="/services"
          class="text-white font-semibold flex items-center gap-2 hover:text-secondary transition-colors"
        >
          Nos services
          <i class="bx bx-right-arrow-alt text-xl" aria-hidden="true"></i>
        </router-link>
      </template>
    </BanniereDiaporama>

    <!-- HERO classique : le defaut du gabarit, et ce que garde toute
         ambassade qui ne saisit rien. -->
    <section v-else class="py-20 bg-cover bg-center" :style="{ backgroundImage: `url(${bgHero})` }">
      <div class="max-w-7xl mx-auto px-6 lg:px-8 grid lg:grid-cols-2 gap-16 items-center">
        <!-- TEXTE GAUCHE -->
        <div>
          <!-- Logo -->
          <img v-if="logo" :src="logo" class="w-20 mb-6" :alt="nomDeLAmbassade" />

          <!-- Titre -->
          <h1 class="text-4xl lg:text-5xl font-bold text-gray-900 leading-tight mb-6">
            {{ titreDeLaBanniere }}
          </h1>

          <!-- Le faux texte de maquette qui occupait cette place (« Ut velit
               mauris, egestas sed... ») est remplace par l'accroche saisie
               dans le CMS. Rien saisi, rien affiche. -->
          <p v-if="banniere?.intro" class="text-lg text-gray-700 leading-relaxed mb-8">
            {{ banniere.intro }}
          </p>

          <!-- Boutons : le premier menait a `/services`, qui n'est pas une
               route, sous le libelle de maquette « Button 1 ». Les deux
               destinations retenues sont ouvertes pour toutes les ambassades. -->
          <div class="flex items-center gap-6">
            <router-link
              to="/actualite"
              class="bg-primary hover:bg-primary-dark text-white px-8 py-4 rounded-xl font-semibold shadow-lg transition-colors"
            >
              Consulter les actualités
            </router-link>

            <router-link
              v-if="servicesOuverts"
              to="/demarche-ligne"
              class="text-gray-700 font-semibold flex items-center gap-2 hover:text-primary transition-colors"
            >
              Vos démarches en ligne
              <i class="bx bx-right-arrow-alt text-xl" aria-hidden="true"></i>
            </router-link>
          </div>
        </div>

        <!-- IMAGES DROITE -->
        <div class="grid grid-cols-2 gap-6">
          <!-- La grille ne porte plus l'embleme du tenant : elle ne montre que
               les photos de la vitrine, servies par le CMS. L'ambassade qui
               veut son drapeau ici le televerse comme premiere photo, et
               choisit ainsi l'image qu'elle montre en grand, plutot que de se
               voir imposer l'aplat qui sert d'embleme en pied de page. -->
          <img
            v-for="(photo, rang) in photosVitrine"
            :key="photo.id"
            loading="lazy"
            :src="photo.image_url"
            :alt="photo.alt ?? ''"
            class="rounded-2xl shadow-lg object-cover w-full"
            :class="rang === 0 ? 'h-64 mt-10' : rang === 1 ? 'h-64' : 'h-48'"
          />
        </div>
      </div>
    </section>
    <!-- Mot de bienvenue et dirigeants : contenu servi par le CMS, propre a
         chaque ambassade. Rien n'est ecrit en dur ici, et une ambassade qui
         n'a rien saisi ne voit pas la section : le repli n'est pas le contenu
         d'une autre ambassade, c'est l'absence. -->
    <section v-if="sectionBienvenue" data-bloc="bienvenue" class="py-20 bg-white">
      <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div v-if="motDeBienvenue" class="text-center mb-16">
          <h2 class="text-4xl font-bold text-primary mb-4">{{ motDeBienvenue.title }}</h2>
          <div class="w-24 h-1 bg-secondary mx-auto"></div>
        </div>

        <div v-if="dirigeants.length" class="flex flex-col lg:flex-row items-stretch gap-8">
          <div v-for="(dirigeant, rang) in dirigeants" :key="dirigeant.id" class="lg:w-1/3">
            <div
              class="bg-white rounded-2xl shadow-xl overflow-hidden transform hover:-translate-y-2 transition-all duration-300 h-full flex flex-col"
            >
              <div class="h-80 lg:h-[520px] overflow-hidden flex-shrink-0 bg-gray-100">
                <img
                  loading="lazy"
                  :src="dirigeant.image_url"
                  :alt="dirigeant.name"
                  class="w-full h-full object-cover object-[center_20%] hover:scale-110 transition-transform duration-500"
                />
              </div>
              <div
                class="p-8 text-center flex-grow min-h-[150px] flex flex-col justify-center"
                :class="habillageDuRang(rang)"
              >
                <h3 class="text-xl font-bold mb-2">{{ dirigeant.name }}</h3>
                <p class="font-medium text-sm" :class="accentDuRang(rang)">{{ dirigeant.role }}</p>
                <p v-if="dirigeant.subtitle" class="text-xs mt-1 opacity-80">
                  {{ dirigeant.subtitle }}
                </p>
                <!-- Seule la carte de l'ambassadeur mene a sa biographie : les
                     autres dirigeants n'ont pas de page sur ce site. La carte
                     vient du CMS, on reconnait donc l'ambassadeur a son role.
                     Et le bouton ne promet la page que si le CMS sert la
                     biographie : sinon il menerait a une rubrique vide. -->
                <router-link
                  v-if="biographieDisponible && estAmbassadeur(dirigeant)"
                  to="/ambassadeur"
                  class="inline-block mt-4 bg-white/20 hover:bg-white/30 border border-white/40 px-5 py-2 rounded-full text-sm font-semibold transition-colors"
                >
                  Biographie
                </router-link>
              </div>
            </div>
          </div>
        </div>

        <!-- Le corps du mot de bienvenue est assaini par le serveur : le
             contrat l'exige, le front ne peut pas etre la derniere defense. -->
        <div
          v-if="motDeBienvenue && motDeBienvenue.body_html"
          class="mt-12 bg-gray-50 p-8 rounded-2xl shadow-lg border-l-8 border-secondary contenu-cms max-w-none text-gray-700"
          v-html="motDeBienvenue.body_html"
        ></div>
      </div>
    </section>

    <!-- Section Services : servie par le CMS.
         Elle portait six cartes ECRITES EN DUR, dont la premiere proposait
         un « visa pour les Etats-Unis » a tous les tenants, et dont les six
         liens menaient a /construction. Elle lit desormais les services que
         l'ambassade a saisis, et disparait quand il n'y en a aucun : le
         contenu est son propre interrupteur. -->
    <section v-if="servicesEnAvant.length > 0" class="py-20 bg-gray-50">
      <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div class="text-center mb-16">
          <h2 class="text-4xl font-bold text-primary mb-4">NOS SERVICES</h2>
          <div class="w-24 h-1 bg-secondary mx-auto mb-4"></div>
          <p class="text-gray-600 text-lg max-w-2xl mx-auto">
            Les démarches que l'ambassade accompagne, et ce qu'il faut savoir avant de venir.
          </p>
        </div>

        <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          <router-link
            v-for="service in servicesEnAvant"
            :key="service.id"
            :to="`/services/${service.slug}`"
            class="group flex h-full flex-col bg-white p-8 rounded-2xl shadow-lg hover:shadow-xl transform hover:-translate-y-2 transition-all duration-300 border-b-4 border-secondary focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-primary"
          >
            <div class="w-16 h-16 bg-primary/10 rounded-2xl flex items-center justify-center mb-6">
              <IconeService :icone="service.icon" class="text-4xl text-primary" />
            </div>
            <h3 class="text-2xl font-bold text-primary mb-3">{{ service.title }}</h3>
            <p v-if="service.summary" class="text-gray-600 mb-4">{{ service.summary }}</p>

            <!-- Delai et frais : seulement ce que l'ambassade a renseigne. -->
            <dl
              v-if="service.delay || service.fee"
              class="flex flex-wrap gap-x-6 gap-y-1 text-sm text-gray-500 mb-4"
            >
              <div v-if="service.delay" class="flex gap-2">
                <dt>Délai</dt>
                <dd class="font-medium text-gray-700">{{ service.delay }}</dd>
              </div>
              <div v-if="service.fee" class="flex gap-2">
                <dt>Frais</dt>
                <dd class="font-medium text-gray-700">{{ service.fee }}</dd>
              </div>
            </dl>

            <!-- `mt-auto` colle l'appel en bas de la carte : les resumes
                 n'ont pas la meme longueur, et sans cela « En savoir plus »
                 flottait a une hauteur differente sur chaque carte de la
                 rangee. -->
            <span
              class="mt-auto pt-2 text-accent font-semibold inline-flex items-center gap-2 group-hover:gap-3 transition-all"
            >
              En savoir plus <i class="bx bx-right-arrow-alt" aria-hidden="true"></i>
            </span>
          </router-link>
        </div>

        <div v-if="services.services.length > servicesEnAvant.length" class="text-center mt-12">
          <router-link
            to="/services"
            class="inline-flex items-center gap-2 font-semibold text-primary hover:gap-3 transition-all"
          >
            Voir tous les services
            <i class="bx bx-right-arrow-alt" aria-hidden="true"></i>
          </router-link>
        </div>
      </div>
    </section>

    <!-- Section Démarches consulaires et actualités récentes -->
    <section class="py-20 bg-white">
      <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <!-- La colonne « Demarches consulaires » vivait ici : elle listait les
             memes services que la section NOS SERVICES ci-dessus, qui les
             sert desormais vraiment. Deux listes du meme contenu sur une
             seule page, c'etait une de trop. -->
        <div>
          <!-- Actualités récentes -->
          <div>
            <h2 class="text-3xl font-bold text-primary mb-6 flex items-center gap-3">
              <span class="w-2 h-8 bg-secondary rounded-full"></span>
              Actualités récentes
            </h2>
            <p v-if="chargement" class="text-gray-500">Chargement des actualités…</p>
            <p v-else-if="erreur" class="text-gray-500">{{ erreur }}</p>
            <p v-else-if="troisDernieres.length === 0" class="text-gray-500">
              Aucune actualité publiée pour le moment.
            </p>
            <div v-else class="space-y-4">
              <router-link
                v-for="actu in troisDernieres"
                :key="actu.id"
                :to="`/actualites/${actu.slug}`"
                class="bg-gray-50 p-5 rounded-xl hover:shadow-lg transition-all block"
              >
                <div class="flex items-start gap-4">
                  <div
                    class="w-16 h-16 rounded-xl flex items-center justify-center text-white font-bold text-center leading-tight shrink-0"
                    :style="{ backgroundColor: couleurDeCategorie(actu.categorie) }"
                  >
                    {{ formaterDateCourte(actu.date_publication) }}
                  </div>
                  <div>
                    <h3 class="font-semibold text-lg mb-1">{{ actu.titre }}</h3>
                    <p class="text-gray-600 text-sm">{{ actu.resume }}</p>
                  </div>
                </div>
              </router-link>
            </div>
          </div>
        </div>
      </div>
    </section>

    <!-- Section Actualités en cartes (4 cards) -->
    <section class="py-20 bg-gray-50">
      <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div class="text-center mb-16">
          <h2 class="text-4xl font-bold text-primary mb-4">ACTUALITÉS RÉCENTES</h2>
          <div class="w-24 h-1 bg-secondary mx-auto mb-4"></div>
          <p class="text-gray-600 text-lg max-w-2xl mx-auto">
            Restez informé des dernières nouvelles de l'ambassade
          </p>
        </div>

        <p v-if="chargement" class="text-center text-gray-500 py-12">Chargement des actualités…</p>

        <div v-else-if="erreur" class="text-center py-12">
          <p class="text-gray-700 mb-4">{{ erreur }}</p>
          <button
            @click="recharger"
            class="bg-primary hover:bg-primary-dark text-white px-6 py-2.5 rounded-full font-semibold transition-colors"
          >
            Réessayer
          </button>
        </div>

        <p v-else-if="quatreDernieres.length === 0" class="text-center text-gray-500 py-12">
          Aucune actualité publiée pour le moment.
        </p>

        <div v-else class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
          <div
            v-for="actu in quatreDernieres"
            :key="actu.id"
            class="bg-white rounded-2xl shadow-lg overflow-hidden transform hover:-translate-y-2 transition-all duration-300"
          >
            <div class="h-48 overflow-hidden relative">
              <div
                class="absolute top-4 left-4 text-white px-3 py-1 rounded-full text-sm font-semibold z-10"
                :style="{ backgroundColor: couleurDeCategorie(actu.categorie) }"
              >
                {{ actu.categorie?.nom }}
              </div>
              <img
                loading="lazy"
                :src="actu.image"
                :alt="actu.titre"
                class="w-full h-full object-cover hover:scale-110 transition-transform duration-500"
              />
            </div>
            <div class="p-6">
              <div class="flex items-center gap-2 text-sm text-gray-500 mb-3">
                <i class="bx bx-calendar"></i>
                <span>{{ formaterDate(actu.date_publication) }}</span>
              </div>
              <h3 class="font-bold text-lg mb-2 text-primary">{{ actu.titre }}</h3>
              <p class="text-gray-600 text-sm mb-4">{{ actu.resume }}</p>
              <router-link
                :to="`/actualites/${actu.slug}`"
                class="text-accent font-semibold inline-flex items-center gap-1 hover:gap-2 transition-all"
              >
                Lire la suite <i class="bx bx-right-arrow-alt"></i>
              </router-link>
            </div>
          </div>
        </div>

        <div class="text-center mt-12">
          <router-link
            to="/actualite"
            class="inline-flex items-center gap-2 bg-primary text-white px-8 py-4 rounded-lg font-semibold hover:bg-primary-dark transition-all"
          >
            Voir toutes les actualités
            <i class="bx bx-right-arrow-alt text-xl"></i>
          </router-link>
        </div>
      </div>
    </section>
  </div>
</template>

<script setup lang="ts">
import { computed, onMounted, onBeforeUnmount, watch, ref } from 'vue'
import { useActualites, formaterDate, formaterDateCourte } from '@/composables/useActualites'
import { useTenantStore } from '@/stores/tenant'
import { couleurDeCategorie } from '@/api/articles'
import { useIdentite } from '@/tenant/identite'
import { recupererContenuAccueil, CONTENU_VIDE, type ContenuAccueil } from '@/api/contenu'
import { recupererServices, SERVICES_VIDES, type ContenuServices } from '@/api/services'
import BanniereDiaporama from '@/components/accueil/BanniereDiaporama.vue'
import IconeService from '@/components/services/IconeService.vue'
import { poserEnteteEnSurimpression } from '@/tenant/banniere'

const tenant = useTenantStore()
const { nomDeLAmbassade, logo } = useIdentite()

// Rubriques de contenu : ouvertes tant que l'ambassade ne les ferme pas.
const servicesOuverts = computed(() => tenant.rubriqueOuverte('services'))

/** La rubrique servie par le CMS, distincte de la page ecrite en dur. */
const servicesConsulairesOuverts = computed(() => tenant.rubriqueOuverte('services_consulaires'))

/**
 * Contenu d'accueil servi par le CMS : mot de bienvenue, dirigeants, vitrine.
 *
 * L'echec est silencieux et laisse le contenu vide. Sur une page d'accueil
 * d'ambassade, une section absente vaut mieux qu'un message d'erreur ; et
 * surtout, le repli ne doit jamais etre le contenu compile dans le gabarit,
 * qui est celui d'une autre ambassade.
 */
const contenu = ref<ContenuAccueil>({ ...CONTENU_VIDE })

/**
 * Le contenu est son propre interrupteur.
 *
 * Les drapeaux `dirigeants` et `vitrine` servaient a masquer du contenu ecrit
 * en dur dans le gabarit. Ce contenu n'existe plus : ce que le CMS ne sert pas
 * ne s'affiche pas, et une ambassade qui veut retirer une section la vide
 * depuis son administration. Garder les deux mecanismes ferait remplir un
 * formulaire sans rien voir apparaitre.
 */
/**
 * La banniere choisie par l'ambassade, ou `null` quand elle n'a rien choisi.
 */
const banniere = computed(() => contenu.value.hero)

/**
 * Un diaporama sans image n'est pas un diaporama : c'est un aplat sombre ou
 * personne ne trouve le menu. Le front ne fait donc pas confiance a la seule
 * valeur du champ et verifie qu'il y a au moins une photo. Le back, lui,
 * enregistre cette combinaison sans broncher — refuser imposerait de
 * televerser les images avant de choisir la mise en page.
 */
const diaporamaAffiche = computed(
  () => banniere.value?.variant === 'diaporama' && banniere.value.slides.length > 0,
)

/** Le titre saisi, ou le nom de l'ambassade comme aujourd'hui. */
const titreDeLaBanniere = computed(() => banniere.value?.title ?? nomDeLAmbassade.value)

// L'en-tete ne passe en surimpression que devant le diaporama reellement
// affiche, et reprend sa forme habituelle des qu'on quitte l'accueil.
watch(diaporamaAffiche, poserEnteteEnSurimpression, { immediate: true })
onBeforeUnmount(() => poserEnteteEnSurimpression(false))

const motDeBienvenue = computed(() => contenu.value.welcome)
const dirigeants = computed(() => contenu.value.leaders)
const photosVitrine = computed(() => contenu.value.showcase)
const sectionBienvenue = computed(
  () => motDeBienvenue.value !== null || dirigeants.value.length > 0,
)

/** Les trois fiches alternent les couleurs de l'ambassade, dans son ordre. */
const HABILLAGES = [
  'bg-gradient-to-b from-accent to-accent-dark text-white',
  'bg-gradient-to-b from-secondary to-secondary-dark text-ink-dark',
  'bg-gradient-to-b from-primary to-primary-dark text-white',
] as const
const ACCENTS = ['text-secondary', 'text-primary', 'text-secondary'] as const

const habillageDuRang = (rang: number) => HABILLAGES[rang % HABILLAGES.length]
const accentDuRang = (rang: number) => ACCENTS[rang % ACCENTS.length]

/**
 * La carte de l'ambassadeur, et elle seule, porte le bouton Biographie.
 *
 * Les dirigeants viennent du CMS sans type : le role est le seul indice.
 * On le compare sans accents ni casse pour que « ambassadeur » saisi
 * autrement dans le dashboard garde le bouton.
 */
/** Le bouton Biographie n'apparait que si le CMS sert le bloc `ambassador`. */
const biographieDisponible = computed(() => contenu.value.ambassador !== null)

const estAmbassadeur = (dirigeant: { role: string }) =>
  dirigeant.role
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .toLowerCase()
    .includes('ambassadeur')

/**
 * Les services consulaires servis par le CMS, pour la section « Demarches
 * consulaires ».
 *
 * Les quatre entrees de cette section menaient a `/construction` : des
 * intitules ecrits en dur, sans destination. Les faire pointer sur un slug
 * devine — `/services/visa` parce que l'intitule parle de visa — remettrait le
 * contenu d'une ambassade dans le gabarit des autres : rien ne garantit
 * qu'un poste nomme son service ainsi, ni qu'il en offre un. La liste vient
 * donc de la meme source que la page `/services`, et chaque entree pointe sur
 * le service qu'elle nomme.
 */
const services = ref<ContenuServices>({ ...SERVICES_VIDES })

/**
 * Six entrees au plus : la section est une mise en avant, pas la rubrique —
 * `/services` sert la liste complete, et le lien « Voir tous les services »
 * n'apparait que s'il y a effectivement plus a voir. L'ordre est celui
 * choisi par l'ambassade, deja applique par l'API.
 */
const SERVICES_EN_AVANT = 6
const servicesEnAvant = computed(() => services.value.services.slice(0, SERVICES_EN_AVANT))

onMounted(async () => {
  try {
    contenu.value = await recupererContenuAccueil()
  } catch {
    // Le contenu reste vide, donc les sections restent masquees. Sur une page
    // d'accueil d'ambassade, une section absente vaut mieux qu'un message
    // d'erreur — et surtout, le repli n'est jamais le contenu compile dans le
    // gabarit, qui est celui d'une autre ambassade.
  }

  try {
    services.value = await recupererServices()
  } catch {
    // Meme discipline : sans service servi, la colonne des demarches
    // disparait et les actualites occupent la largeur.
  }
})

// Import des 4 photos de fond pour le hero
import bgHero from '@/assets/images/bghero.webp'

// Import du logo de l'ambassade

// Import des photos du président et de l'ambassadeur
// Import de la photo du Ministre

// Actualites de la page d'accueil : l'API renvoie la liste deja triee du plus
// recent au plus ancien, les deux sections en prennent simplement le debut.
const { articles, chargement, erreur, recharger } = useActualites()
const troisDernieres = computed(() => articles.value.slice(0, 3))
const quatreDernieres = computed(() => articles.value.slice(0, 4))
</script>

<style scoped>
/* Styles pour les transitions si besoin */
</style>
