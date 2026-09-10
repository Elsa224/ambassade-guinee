<template>
  <div class="min-h-screen bg-gray-50">
    <!-- HERO -->
    <section class="py-20 bg-cover bg-center" :style="{ backgroundImage: `url(${bgHero})` }">
      <div class="max-w-7xl mx-auto px-6 lg:px-8 grid lg:grid-cols-2 gap-16 items-center">
        <!-- TEXTE GAUCHE -->
        <div>
          <!-- Logo -->
          <img v-if="logo" :src="logo" class="w-20 mb-6" :alt="nomDeLAmbassade" />

          <!-- Titre -->
          <h1 class="text-4xl lg:text-5xl font-bold text-gray-900 leading-tight mb-6">
            {{ nomDeLAmbassade }}
          </h1>

          <!-- Le paragraphe qui suivait etait du faux texte de maquette
               (« Ut velit mauris, egestas sed... »), reste en production. Il
               attend un vrai texte d'accroche, que l'API ne transmet pas
               encore. -->

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
          <img
            v-if="drapeau"
            :src="drapeau"
            :alt="`Drapeau ${articleDuPays(nomOfficiel)} ${nomOfficiel}`"
            class="rounded-2xl shadow-lg object-cover h-48 w-full"
          />

          <img
            v-if="vitrineOuverte"
            :src="heroPhoto2"
            class="rounded-2xl shadow-lg object-cover h-64 w-full mt-10"
          />

          <img
            v-if="vitrineOuverte"
            :src="heroPhoto3"
            class="rounded-2xl shadow-lg object-cover h-64 w-full"
          />

          <img
            v-if="vitrineOuverte"
            :src="heroPhoto4"
            class="rounded-2xl shadow-lg object-cover h-48 w-full"
          />
        </div>
      </div>
    </section>
    <!-- Message de bienvenue - 3 photos avec visages bien visibles -->
    <!-- Portraits des dirigeants et mot de bienvenue : contenu propre a chaque
         ambassade, que le contrat d'API ne transmet pas encore. Tant qu'il n'a
         pas de source, la section s'efface plutot que d'afficher les
         responsables d'un autre pays. -->
    <section v-if="dirigeantsOuverts" class="py-20 bg-white">
      <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div class="text-center mb-16">
          <h2 class="text-4xl font-bold text-primary mb-4">MOT DE BIENVENUE</h2>
          <div class="w-24 h-1 bg-secondary mx-auto"></div>
        </div>

        <!-- Trois photos alignées : Président, Ministre, Ambassadeur -->
        <div class="flex flex-col lg:flex-row items-stretch gap-8">
          <!-- Photo du Président (gauche) -->
          <div class="lg:w-1/3">
            <div
              class="bg-white rounded-2xl shadow-xl overflow-hidden transform hover:-translate-y-2 transition-all duration-300 h-full flex flex-col"
            >
              <div class="h-80 lg:h-[520px] overflow-hidden flex-shrink-0 bg-gray-100">
                <img
                  loading="lazy"
                  :src="presidentImage"
                  alt="Président Mamadi DOUMBOUYA"
                  class="w-full h-full object-cover object-[center_20%] hover:scale-110 transition-transform duration-500"
                />
              </div>
              <div
                class="p-8 text-center bg-gradient-to-b from-accent to-accent-dark text-white flex-grow min-h-[150px] flex flex-col justify-center"
              >
                <h3 class="text-xl font-bold mb-2">S.E. Monsieur Mamadi DOUMBOUYA</h3>
                <p class="text-secondary font-medium text-sm">
                  Président de la République, Chef de l'État
                </p>
                <p class="text-white/80 text-xs mt-1">République de Guinée</p>
              </div>
            </div>
          </div>

          <!-- Photo du Ministre (centre) -->
          <div class="lg:w-1/3">
            <div
              class="bg-white rounded-2xl shadow-xl overflow-hidden transform hover:-translate-y-2 transition-all duration-300 h-full flex flex-col"
            >
              <div class="h-80 lg:h-[520px] overflow-hidden flex-shrink-0 bg-gray-100">
                <img
                  loading="lazy"
                  :src="ministreImage"
                  alt="Dr. Morissanda KOUYATE"
                  class="w-full h-full object-cover object-[center_20%] hover:scale-110 transition-transform duration-500"
                />
              </div>
              <div
                class="p-8 text-center bg-gradient-to-b from-secondary to-secondary-dark text-gray-800 flex-grow min-h-[150px] flex flex-col justify-center"
              >
                <h3 class="text-xl font-bold mb-2">Dr. Morissanda KOUYATE</h3>
                <p class="text-primary font-medium text-sm">
                  Ministre des Affaires Étrangères,<br />de l'Intégration Africaine et des Guinéens
                  établis à l'Étranger
                </p>
                <p class="text-gray-700/80 text-xs mt-1">République de Guinée</p>
              </div>
            </div>
          </div>

          <!-- Photo de l'Ambassadeur (droite) -->
          <div class="lg:w-1/3">
            <div
              class="bg-white rounded-2xl shadow-xl overflow-hidden transform hover:-translate-y-2 transition-all duration-300 h-full flex flex-col"
            >
              <div class="h-80 lg:h-[520px] overflow-hidden flex-shrink-0 bg-gray-100">
                <img
                  loading="lazy"
                  :src="ambassadeurImage"
                  alt="Ibrahima N'Daïry Diallo"
                  class="w-full h-full object-cover object-[center_20%] hover:scale-110 transition-transform duration-500"
                />
              </div>
              <div
                class="p-8 text-center bg-gradient-to-b from-primary to-primary-dark text-white flex-grow min-h-[150px] flex flex-col justify-center"
              >
                <h3 class="text-xl font-bold mb-2">M. Ibrahima N'Daïry Diallo</h3>
                <p class="text-secondary font-medium text-sm">Chargé d'affaires a.i.</p>
                <p class="text-white/80 text-xs mt-1">Ambassade de Guinée aux États-Unis</p>
              </div>
            </div>
          </div>
        </div>

        <!-- Texte de bienvenue (en dessous des 3 photos) -->
        <div class="mt-12 bg-gray-50 p-8 rounded-2xl shadow-lg border-l-8 border-secondary">
          <p class="text-lg text-gray-700 leading-relaxed mb-6 italic">
            "Chers compatriotes,<br />
            Chers amis et partenaires de la République de Guinée,"
          </p>
          <p class="text-gray-700 leading-relaxed mb-6">
            C'est avec un réel plaisir que nous vous ouvrons les portes d'entrée de l'Ambassade de
            Guinée à Washington DC et celles de la Guinée toute entière via ce site web.
          </p>
          <p class="text-gray-700 leading-relaxed">
            En effet, la coopération entre les États-Unis et la République de Guinée date des
            premières années de l'indépendance de la Guinée. Mais, c'est en 1979 que les relations
            diplomatiques proprement dites ont été établies entre les deux pays. Cet élan de
            coopération connaîtra un second souffle en 1982 avec la signature de l'Accord général de
            coopération et de développement, suivi de l'ouverture de l'ambassade de Guinée aux
            États-Unis en 1980 et celle des États-Unis en Guinée en 1982.
          </p>
        </div>
      </div>
    </section>
    <!-- Section Services : le texte des cartes nomme le pays d'accueil de
         l'ambassade d'origine (« visa pour les Etats-Unis »). Tant qu'il
         n'est pas servi par l'API, il suit la rubrique des services. -->
    <section v-if="servicesOuverts" class="py-20 bg-gray-50">
      <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div class="text-center mb-16">
          <h2 class="text-4xl font-bold text-primary mb-4">NOS SERVICES</h2>
          <div class="w-24 h-1 bg-secondary mx-auto mb-4"></div>
          <p class="text-gray-600 text-lg max-w-2xl mx-auto">
            Découvrez l'ensemble de nos services consulaires pour vous accompagner dans vos
            démarches
          </p>
        </div>

        <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          <!-- Visa -->
          <div
            class="bg-white p-8 rounded-2xl shadow-lg hover:shadow-xl transform hover:-translate-y-2 transition-all duration-300 border-b-4 border-secondary"
          >
            <div class="w-16 h-16 bg-primary/10 rounded-2xl flex items-center justify-center mb-6">
              <i class="bx bx-edit text-4xl text-primary"></i>
            </div>
            <h3 class="text-2xl font-bold text-primary mb-3">Visa</h3>
            <p class="text-gray-600 mb-4">
              Demande de visa pour les États-Unis et informations sur les procédures.
            </p>
            <router-link
              to="/construction"
              class="text-accent font-semibold inline-flex items-center gap-2 hover:gap-3 transition-all"
            >
              En savoir plus <i class="bx bx-right-arrow-alt"></i>
            </router-link>
          </div>

          <!-- Carte consulaire -->
          <div
            class="bg-white p-8 rounded-2xl shadow-lg hover:shadow-xl transform hover:-translate-y-2 transition-all duration-300 border-b-4 border-secondary"
          >
            <div class="w-16 h-16 bg-primary/10 rounded-2xl flex items-center justify-center mb-6">
              <i class="bx bx-id-card text-4xl text-primary"></i>
            </div>
            <h3 class="text-2xl font-bold text-primary mb-3">Carte consulaire</h3>
            <p class="text-gray-600 mb-4">
              Inscription et renouvellement de votre carte consulaire.
            </p>
            <router-link
              to="/construction"
              class="text-accent font-semibold inline-flex items-center gap-2 hover:gap-3 transition-all"
            >
              En savoir plus <i class="bx bx-right-arrow-alt"></i>
            </router-link>
          </div>

          <!-- Autres documents -->
          <div
            class="bg-white p-8 rounded-2xl shadow-lg hover:shadow-xl transform hover:-translate-y-2 transition-all duration-300 border-b-4 border-secondary"
          >
            <div class="w-16 h-16 bg-primary/10 rounded-2xl flex items-center justify-center mb-6">
              <i class="bx bx-file text-4xl text-primary"></i>
            </div>
            <h3 class="text-2xl font-bold text-primary mb-3">Autres documents</h3>
            <p class="text-gray-600 mb-4">
              Demande d'actes d'état civil, certificats et autres documents.
            </p>
            <router-link
              to="/construction"
              class="text-accent font-semibold inline-flex items-center gap-2 hover:gap-3 transition-all"
            >
              En savoir plus <i class="bx bx-right-arrow-alt"></i>
            </router-link>
          </div>

          <!-- Documents civils -->
          <div
            class="bg-white p-8 rounded-2xl shadow-lg hover:shadow-xl transform hover:-translate-y-2 transition-all duration-300 border-b-4 border-secondary"
          >
            <div class="w-16 h-16 bg-primary/10 rounded-2xl flex items-center justify-center mb-6">
              <i class="bx bx-certification text-4xl text-primary"></i>
            </div>
            <h3 class="text-2xl font-bold text-primary mb-3">Documents civils</h3>
            <p class="text-gray-600 mb-4">
              Légalisation, certification et authentification de documents.
            </p>
            <router-link
              to="/construction"
              class="text-accent font-semibold inline-flex items-center gap-2 hover:gap-3 transition-all"
            >
              En savoir plus <i class="bx bx-right-arrow-alt"></i>
            </router-link>
          </div>

          <!-- Titre de voyage -->
          <div
            class="bg-white p-8 rounded-2xl shadow-lg hover:shadow-xl transform hover:-translate-y-2 transition-all duration-300 border-b-4 border-secondary"
          >
            <div class="w-16 h-16 bg-primary/10 rounded-2xl flex items-center justify-center mb-6">
              <i class="bx bx-trip text-4xl text-primary"></i>
            </div>
            <h3 class="text-2xl font-bold text-primary mb-3">Titre de voyage</h3>
            <p class="text-gray-600 mb-4">
              Demande et renouvellement de passeport et titres de voyage.
            </p>
            <router-link
              to="/construction"
              class="text-accent font-semibold inline-flex items-center gap-2 hover:gap-3 transition-all"
            >
              En savoir plus <i class="bx bx-right-arrow-alt"></i>
            </router-link>
          </div>

          <!-- Delivery Express -->
          <div
            class="bg-white p-8 rounded-2xl shadow-lg hover:shadow-xl transform hover:-translate-y-2 transition-all duration-300 border-b-4 border-secondary"
          >
            <div class="w-16 h-16 bg-primary/10 rounded-2xl flex items-center justify-center mb-6">
              <i class="bx bx-package text-4xl text-primary"></i>
            </div>
            <h3 class="text-2xl font-bold text-primary mb-3">Delivery Express</h3>
            <p class="text-gray-600 mb-4">
              Service d'envoi et de réception de documents en express.
            </p>
            <router-link
              to="/construction"
              class="text-accent font-semibold inline-flex items-center gap-2 hover:gap-3 transition-all"
            >
              En savoir plus <i class="bx bx-right-arrow-alt"></i>
            </router-link>
          </div>
        </div>
      </div>
    </section>

    <!-- Section Démarches consulaires et actualités récentes -->
    <section class="py-20 bg-white">
      <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div class="grid grid-cols-1 lg:grid-cols-2 gap-12">
          <!-- Démarches consulaires -->
          <div>
            <h2 class="text-3xl font-bold text-primary mb-6 flex items-center gap-3">
              <span class="w-2 h-8 bg-secondary rounded-full"></span>
              Démarches consulaires
            </h2>
            <div class="space-y-4">
              <router-link
                to="/construction"
                class="block bg-gray-50 p-5 rounded-xl hover:bg-primary hover:text-white group transition-all"
              >
                <div class="flex items-center justify-between">
                  <span class="font-semibold text-lg">Comment obtenir un visa ?</span>
                  <i
                    class="bx bx-chevron-right text-2xl group-hover:translate-x-2 transition-transform"
                  ></i>
                </div>
              </router-link>
              <router-link
                to="/construction"
                class="block bg-gray-50 p-5 rounded-xl hover:bg-primary hover:text-white group transition-all"
              >
                <div class="flex items-center justify-between">
                  <span class="font-semibold text-lg">Renouvellement de passeport</span>
                  <i
                    class="bx bx-chevron-right text-2xl group-hover:translate-x-2 transition-transform"
                  ></i>
                </div>
              </router-link>
              <router-link
                to="/construction"
                class="block bg-gray-50 p-5 rounded-xl hover:bg-primary hover:text-white group transition-all"
              >
                <div class="flex items-center justify-between">
                  <span class="font-semibold text-lg">Légalisation de documents</span>
                  <i
                    class="bx bx-chevron-right text-2xl group-hover:translate-x-2 transition-transform"
                  ></i>
                </div>
              </router-link>
              <router-link
                to="/construction"
                class="block bg-gray-50 p-5 rounded-xl hover:bg-primary hover:text-white group transition-all"
              >
                <div class="flex items-center justify-between">
                  <span class="font-semibold text-lg">Inscription consulaire</span>
                  <i
                    class="bx bx-chevron-right text-2xl group-hover:translate-x-2 transition-transform"
                  ></i>
                </div>
              </router-link>
            </div>
          </div>

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
                    :style="{ backgroundColor: actu.categorie?.couleur }"
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
                :style="{ backgroundColor: actu.categorie?.couleur }"
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
import { computed } from 'vue'
import { useActualites, formaterDate, formaterDateCourte } from '@/composables/useActualites'
import { useTenantStore } from '@/stores/tenant'
import { useIdentite, articleDuPays } from '@/tenant/identite'

const tenant = useTenantStore()
const { nomOfficiel, nomDeLAmbassade, logo, drapeau } = useIdentite()

// Rubriques de contenu : ouvertes tant que l'ambassade ne les ferme pas.
const dirigeantsOuverts = computed(() => tenant.rubriqueOuverte('dirigeants'))
const vitrineOuverte = computed(() => tenant.rubriqueOuverte('vitrine'))
const servicesOuverts = computed(() => tenant.rubriqueOuverte('services'))

// Import des 4 photos de fond pour le hero
import heroPhoto2 from '@/assets/images/hero4.webp' // Gare
import heroPhoto3 from '@/assets/images/hero5.webp' // Paysage orange
import heroPhoto4 from '@/assets/images/hero6.webp' // Cascade
import bgHero from '@/assets/images/bghero.webp'

// Import du logo de l'ambassade

// Import des photos du président et de l'ambassadeur
import presidentImage from '@/assets/images/president.webp'
import ambassadeurImage from '@/assets/images/ambassadeur.webp'
// Import de la photo du Ministre
import ministreImage from '@/assets/images/ministre.webp'

// Actualites de la page d'accueil : l'API renvoie la liste deja triee du plus
// recent au plus ancien, les deux sections en prennent simplement le debut.
const { articles, chargement, erreur, recharger } = useActualites()
const troisDernieres = computed(() => articles.value.slice(0, 3))
const quatreDernieres = computed(() => articles.value.slice(0, 4))
</script>

<style scoped>
/* Styles pour les transitions si besoin */
</style>
