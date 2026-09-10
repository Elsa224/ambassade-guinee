<template>
  <div class="min-h-screen bg-gray-50">
  <!-- HERO -->
<section
  class="py-20 bg-cover bg-center"
  :style="{ backgroundImage: `url(${bgHero})` }"
>
  <div class="max-w-7xl mx-auto px-6 lg:px-8 grid lg:grid-cols-2 gap-16 items-center">

    <!-- TEXTE GAUCHE -->
    <div>

      <!-- Logo -->
      <img
        :src="logoAmbassade"
        class="w-20 mb-6"
        alt="Logo Guinée"
      />

      <!-- Titre -->
      <h1 class="text-4xl lg:text-5xl font-bold text-gray-900 leading-tight mb-6">
        Ambassade de la République de Guinée
        près les Etats-Unis d'Amérique
        Washington DC
      </h1>

      <!-- Texte -->
      <p class="text-gray-600 mb-8 max-w-xl">
        Ut velit mauris, egestas sed, gravida nec, ornare ut, mi.
        Aenean ut orci vel massa suscipit pulvinar.
        Nulla sollicitudin.
      </p>

      <!-- Boutons -->
      <div class="flex items-center gap-6">
        <router-link
          to="/services"
          class="bg-red-600 text-white px-8 py-4 rounded-xl font-semibold shadow-lg hover:bg-red-700 transition"
        >
          Button 1
        </router-link>

        <a
          href="#"
          class="text-gray-700 font-semibold flex items-center gap-2 hover:text-red-600"
        >
          Voir plus →
        </a>
      </div>

    </div>

    <!-- IMAGES DROITE -->
    <div class="grid grid-cols-2 gap-6">

      <img
        :src="heroPhoto1"
        class="rounded-2xl shadow-lg object-cover h-48 w-full"
      />

      <img
        :src="heroPhoto2"
        class="rounded-2xl shadow-lg object-cover h-64 w-full mt-10"
      />

      <img
        :src="heroPhoto3"
        class="rounded-2xl shadow-lg object-cover h-64 w-full"
      />

      <img
        :src="heroPhoto4"
        class="rounded-2xl shadow-lg object-cover h-48 w-full"
      />

    </div>

  </div>
</section>
<!-- Message de bienvenue - 3 photos avec visages bien visibles -->
<section class="py-20 bg-white">
  <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
    <div class="text-center mb-16">
      <h2 class="text-4xl font-bold text-primary mb-4">MOT DE BIENVENUE</h2>
      <div class="w-24 h-1 bg-secondary mx-auto"></div>
    </div>

    <!-- Trois photos alignées : Président, Ministre, Ambassadeur -->
    <div class="flex flex-col lg:flex-row items-stretch gap-8">

      <!-- Photo du Président (gauche) -->
      <div class="lg:w-1/3">
        <div class="bg-white rounded-2xl shadow-xl overflow-hidden transform hover:-translate-y-2 transition-all duration-300 h-full flex flex-col">
          <div class="h-80 lg:h-[520px] overflow-hidden flex-shrink-0 bg-gray-100">
            <img
              :src="presidentImage"
              alt="Président Mamadi DOUMBOUYA"
              class="w-full h-full object-cover object-[center_20%] hover:scale-110 transition-transform duration-500"
            />
          </div>
          <div class="p-8 text-center bg-gradient-to-b from-accent to-accent-dark text-white flex-grow min-h-[150px] flex flex-col justify-center">
            <h3 class="text-xl font-bold mb-2">S.E. Monsieur Mamadi DOUMBOUYA</h3>
            <p class="text-secondary font-medium text-sm">Président de la République, Chef de l'État</p>
            <p class="text-white/80 text-xs mt-1">République de Guinée</p>
          </div>
        </div>
      </div>

      <!-- Photo du Ministre (centre) -->
      <div class="lg:w-1/3">
        <div class="bg-white rounded-2xl shadow-xl overflow-hidden transform hover:-translate-y-2 transition-all duration-300 h-full flex flex-col">
          <div class="h-80 lg:h-[520px] overflow-hidden flex-shrink-0 bg-gray-100">
            <img
              :src="ministreImage"
              alt="Dr. Morissanda KOUYATE"
              class="w-full h-full object-cover object-[center_20%] hover:scale-110 transition-transform duration-500"
            />
          </div>
          <div class="p-8 text-center bg-gradient-to-b from-secondary to-secondary-dark text-gray-800 flex-grow min-h-[150px] flex flex-col justify-center">
            <h3 class="text-xl font-bold mb-2">Dr. Morissanda KOUYATE</h3>
            <p class="text-primary font-medium text-sm">Ministre des Affaires Étrangères,<br>de l'Intégration Africaine et des Guinéens établis à l'Étranger</p>
            <p class="text-gray-700/80 text-xs mt-1">République de Guinée</p>
          </div>
        </div>
      </div>

      <!-- Photo de l'Ambassadeur (droite) -->
      <div class="lg:w-1/3">
        <div class="bg-white rounded-2xl shadow-xl overflow-hidden transform hover:-translate-y-2 transition-all duration-300 h-full flex flex-col">
          <div class="h-80 lg:h-[520px] overflow-hidden flex-shrink-0 bg-gray-100">
            <img
              :src="ambassadeurImage"
              alt="Ibrahima N'Daïry Diallo"
              class="w-full h-full object-cover object-[center_20%] hover:scale-110 transition-transform duration-500"
            />
          </div>
          <div class="p-8 text-center bg-gradient-to-b from-primary to-primary-dark text-white flex-grow min-h-[150px] flex flex-col justify-center">
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
        "Chers compatriotes,<br>
        Chers amis et partenaires de la République de Guinée,"
      </p>
      <p class="text-gray-700 leading-relaxed mb-6">
        C'est avec un réel plaisir que nous vous ouvrons les portes d'entrée de l'Ambassade de Guinée à Washington DC et celles de la Guinée toute entière via ce site web.
      </p>
      <p class="text-gray-700 leading-relaxed">
        En effet, la coopération entre les États-Unis et la République de Guinée date des premières années de l'indépendance de la Guinée. Mais, c'est en 1979 que les relations diplomatiques proprement dites ont été établies entre les deux pays. Cet élan de coopération connaîtra un second souffle en 1982 avec la signature de l'Accord général de coopération et de développement, suivi de l'ouverture de l'ambassade de Guinée aux États-Unis en 1980 et celle des États-Unis en Guinée en 1982.
      </p>
    </div>
  </div>
</section>
    <!-- Section Services -->
    <section class="py-20 bg-gray-50">
      <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div class="text-center mb-16">
          <h2 class="text-4xl font-bold text-primary mb-4">NOS SERVICES</h2>
          <div class="w-24 h-1 bg-secondary mx-auto mb-4"></div>
          <p class="text-gray-600 text-lg max-w-2xl mx-auto">
            Découvrez l'ensemble de nos services consulaires pour vous accompagner dans vos démarches
          </p>
        </div>

        <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          <!-- Visa -->
          <div class="bg-white p-8 rounded-2xl shadow-lg hover:shadow-xl transform hover:-translate-y-2 transition-all duration-300 border-b-4 border-secondary">
            <div class="w-16 h-16 bg-primary/10 rounded-2xl flex items-center justify-center mb-6">
              <i class='bx bx-edit text-4xl text-primary'></i>
            </div>
            <h3 class="text-2xl font-bold text-primary mb-3">Visa</h3>
            <p class="text-gray-600 mb-4">Demande de visa pour les États-Unis et informations sur les procédures.</p>
            <router-link to="/services/visa" class="text-accent font-semibold inline-flex items-center gap-2 hover:gap-3 transition-all">
              En savoir plus <i class='bx bx-right-arrow-alt'></i>
            </router-link>
          </div>

          <!-- Carte consulaire -->
          <div class="bg-white p-8 rounded-2xl shadow-lg hover:shadow-xl transform hover:-translate-y-2 transition-all duration-300 border-b-4 border-secondary">
            <div class="w-16 h-16 bg-primary/10 rounded-2xl flex items-center justify-center mb-6">
              <i class='bx bx-id-card text-4xl text-primary'></i>
            </div>
            <h3 class="text-2xl font-bold text-primary mb-3">Carte consulaire</h3>
            <p class="text-gray-600 mb-4">Inscription et renouvellement de votre carte consulaire.</p>
            <router-link to="/services/inscription" class="text-accent font-semibold inline-flex items-center gap-2 hover:gap-3 transition-all">
              En savoir plus <i class='bx bx-right-arrow-alt'></i>
            </router-link>
          </div>

          <!-- Autres documents -->
          <div class="bg-white p-8 rounded-2xl shadow-lg hover:shadow-xl transform hover:-translate-y-2 transition-all duration-300 border-b-4 border-secondary">
            <div class="w-16 h-16 bg-primary/10 rounded-2xl flex items-center justify-center mb-6">
              <i class='bx bx-file text-4xl text-primary'></i>
            </div>
            <h3 class="text-2xl font-bold text-primary mb-3">Autres documents</h3>
            <p class="text-gray-600 mb-4">Demande d'actes d'état civil, certificats et autres documents.</p>
            <router-link to="/services/documents" class="text-accent font-semibold inline-flex items-center gap-2 hover:gap-3 transition-all">
              En savoir plus <i class='bx bx-right-arrow-alt'></i>
            </router-link>
          </div>

          <!-- Documents civils -->
          <div class="bg-white p-8 rounded-2xl shadow-lg hover:shadow-xl transform hover:-translate-y-2 transition-all duration-300 border-b-4 border-secondary">
            <div class="w-16 h-16 bg-primary/10 rounded-2xl flex items-center justify-center mb-6">
              <i class='bx bx-certification text-4xl text-primary'></i>
            </div>
            <h3 class="text-2xl font-bold text-primary mb-3">Documents civils</h3>
            <p class="text-gray-600 mb-4">Légalisation, certification et authentification de documents.</p>
            <router-link to="/services/legalisation" class="text-accent font-semibold inline-flex items-center gap-2 hover:gap-3 transition-all">
              En savoir plus <i class='bx bx-right-arrow-alt'></i>
            </router-link>
          </div>

          <!-- Titre de voyage -->
          <div class="bg-white p-8 rounded-2xl shadow-lg hover:shadow-xl transform hover:-translate-y-2 transition-all duration-300 border-b-4 border-secondary">
            <div class="w-16 h-16 bg-primary/10 rounded-2xl flex items-center justify-center mb-6">
              <i class='bx bx-trip text-4xl text-primary'></i>
            </div>
            <h3 class="text-2xl font-bold text-primary mb-3">Titre de voyage</h3>
            <p class="text-gray-600 mb-4">Demande et renouvellement de passeport et titres de voyage.</p>
            <router-link to="/services/passeport" class="text-accent font-semibold inline-flex items-center gap-2 hover:gap-3 transition-all">
              En savoir plus <i class='bx bx-right-arrow-alt'></i>
            </router-link>
          </div>

          <!-- Delivery Express -->
          <div class="bg-white p-8 rounded-2xl shadow-lg hover:shadow-xl transform hover:-translate-y-2 transition-all duration-300 border-b-4 border-secondary">
            <div class="w-16 h-16 bg-primary/10 rounded-2xl flex items-center justify-center mb-6">
              <i class='bx bx-package text-4xl text-primary'></i>
            </div>
            <h3 class="text-2xl font-bold text-primary mb-3">Delivery Express</h3>
            <p class="text-gray-600 mb-4">Service d'envoi et de réception de documents en express.</p>
            <router-link to="/services/express" class="text-accent font-semibold inline-flex items-center gap-2 hover:gap-3 transition-all">
              En savoir plus <i class='bx bx-right-arrow-alt'></i>
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
              <router-link to="/services/visa" class="block bg-gray-50 p-5 rounded-xl hover:bg-primary hover:text-white group transition-all">
                <div class="flex items-center justify-between">
                  <span class="font-semibold text-lg">Comment obtenir un visa ?</span>
                  <i class='bx bx-chevron-right text-2xl group-hover:translate-x-2 transition-transform'></i>
                </div>
              </router-link>
              <router-link to="/services/passeport" class="block bg-gray-50 p-5 rounded-xl hover:bg-primary hover:text-white group transition-all">
                <div class="flex items-center justify-between">
                  <span class="font-semibold text-lg">Renouvellement de passeport</span>
                  <i class='bx bx-chevron-right text-2xl group-hover:translate-x-2 transition-transform'></i>
                </div>
              </router-link>
              <router-link to="/services/legalisation" class="block bg-gray-50 p-5 rounded-xl hover:bg-primary hover:text-white group transition-all">
                <div class="flex items-center justify-between">
                  <span class="font-semibold text-lg">Légalisation de documents</span>
                  <i class='bx bx-chevron-right text-2xl group-hover:translate-x-2 transition-transform'></i>
                </div>
              </router-link>
              <router-link to="/services/inscription" class="block bg-gray-50 p-5 rounded-xl hover:bg-primary hover:text-white group transition-all">
                <div class="flex items-center justify-between">
                  <span class="font-semibold text-lg">Inscription consulaire</span>
                  <i class='bx bx-chevron-right text-2xl group-hover:translate-x-2 transition-transform'></i>
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
            <div class="space-y-4">
              <div class="bg-gray-50 p-5 rounded-xl hover:shadow-lg transition-all">
                <div class="flex items-start gap-4">
                  <div class="w-16 h-16 bg-accent rounded-xl flex items-center justify-center text-white font-bold">
                    15 MAR
                  </div>
                  <div>
                    <h3 class="font-semibold text-lg mb-1">Réunion diplomatique</h3>
                    <p class="text-gray-600 text-sm">Rencontre avec le secrétaire d'État américain</p>
                  </div>
                </div>
              </div>
              <div class="bg-gray-50 p-5 rounded-xl hover:shadow-lg transition-all">
                <div class="flex items-start gap-4">
                  <div class="w-16 h-16 bg-primary rounded-xl flex items-center justify-center text-white font-bold">
                    10 MAR
                  </div>
                  <div>
                    <h3 class="font-semibold text-lg mb-1">Célébration du 8 Mars</h3>
                    <p class="text-gray-600 text-sm">Journée internationale des droits des femmes</p>
                  </div>
                </div>
              </div>
              <div class="bg-gray-50 p-5 rounded-xl hover:shadow-lg transition-all">
                <div class="flex items-start gap-4">
                  <div class="w-16 h-16 bg-secondary rounded-xl flex items-center justify-center text-primary font-bold">
                    05 MAR
                  </div>
                  <div>
                    <h3 class="font-semibold text-lg mb-1">Forum économique</h3>
                    <p class="text-gray-600 text-sm">Promotion des investissements en Guinée</p>
                  </div>
                </div>
              </div>
              <div class="bg-gray-50 p-5 rounded-xl hover:shadow-lg transition-all">
                <div class="flex items-start gap-4">
                  <div class="w-16 h-16 bg-accent rounded-xl flex items-center justify-center text-white font-bold">
                    28 FEV
                  </div>
                  <div>
                    <h3 class="font-semibold text-lg mb-1">Journée culturelle</h3>
                    <p class="text-gray-600 text-sm">Célébration de la culture guinéenne à Washington</p>
                  </div>
                </div>
              </div>
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
            Restez informé des dernières nouvelles de l'ambassade et de la Guinée
          </p>
        </div>

        <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
          <!-- Actualité 1 -->
          <div class="bg-white rounded-2xl shadow-lg overflow-hidden transform hover:-translate-y-2 transition-all duration-300">
            <div class="h-48 overflow-hidden relative">
              <div class="absolute top-4 left-4 bg-accent text-white px-3 py-1 rounded-full text-sm font-semibold z-10">
                Diplomatie
              </div>
              <img :src="actualite1" alt="Actualité diplomatique" class="w-full h-full object-cover hover:scale-110 transition-transform duration-500">
            </div>
            <div class="p-6">
              <div class="flex items-center gap-2 text-sm text-gray-500 mb-3">
                <i class='bx bx-calendar'></i>
                <span>15 Mars 2024</span>
              </div>
              <h3 class="font-bold text-lg mb-2 text-primary">Rencontre diplomatique de haut niveau</h3>
              <p class="text-gray-600 text-sm mb-4">L'ambassadeur reçu par le secrétaire d'État américain pour renforcer la coopération bilatérale.</p>
              <router-link to="/actualites/1" class="text-accent font-semibold inline-flex items-center gap-1 hover:gap-2 transition-all">
                Lire la suite <i class='bx bx-right-arrow-alt'></i>
              </router-link>
            </div>
          </div>

          <!-- Actualité 2 -->
          <div class="bg-white rounded-2xl shadow-lg overflow-hidden transform hover:-translate-y-2 transition-all duration-300">
            <div class="h-48 overflow-hidden relative">
              <div class="absolute top-4 left-4 bg-primary text-white px-3 py-1 rounded-full text-sm font-semibold z-10">
                Culture
              </div>
              <img :src="actualite2" alt="Célébration culturelle" class="w-full h-full object-cover hover:scale-110 transition-transform duration-500">
            </div>
            <div class="p-6">
              <div class="flex items-center gap-2 text-sm text-gray-500 mb-3">
                <i class='bx bx-calendar'></i>
                <span>10 Mars 2024</span>
              </div>
              <h3 class="font-bold text-lg mb-2 text-primary">Célébration de la Journée Internationale de la Femme</h3>
              <p class="text-gray-600 text-sm mb-4">Événement spécial à l'ambassade mettant à l'honneur les femmes guinéennes.</p>
              <router-link to="/actualites/2" class="text-accent font-semibold inline-flex items-center gap-1 hover:gap-2 transition-all">
                Lire la suite <i class='bx bx-right-arrow-alt'></i>
              </router-link>
            </div>
          </div>

          <!-- Actualité 3 -->
          <div class="bg-white rounded-2xl shadow-lg overflow-hidden transform hover:-translate-y-2 transition-all duration-300">
            <div class="h-48 overflow-hidden relative">
              <div class="absolute top-4 left-4 bg-secondary text-primary px-3 py-1 rounded-full text-sm font-semibold z-10">
                Économie
              </div>
              <img :src="actualite3" alt="Forum économique" class="w-full h-full object-cover hover:scale-110 transition-transform duration-500">
            </div>
            <div class="p-6">
              <div class="flex items-center gap-2 text-sm text-gray-500 mb-3">
                <i class='bx bx-calendar'></i>
                <span>5 Mars 2024</span>
              </div>
              <h3 class="font-bold text-lg mb-2 text-primary">Forum économique Guinée-États-Unis</h3>
              <p class="text-gray-600 text-sm mb-4">Promotion des opportunités d'investissement en Guinée devant les investisseurs américains.</p>
              <router-link to="/actualites/3" class="text-accent font-semibold inline-flex items-center gap-1 hover:gap-2 transition-all">
                Lire la suite <i class='bx bx-right-arrow-alt'></i>
              </router-link>
            </div>
          </div>

          <!-- Actualité 4 -->
          <div class="bg-white rounded-2xl shadow-lg overflow-hidden transform hover:-translate-y-2 transition-all duration-300">
            <div class="h-48 overflow-hidden relative">
              <div class="absolute top-4 left-4 bg-accent text-white px-3 py-1 rounded-full text-sm font-semibold z-10">
                Communauté
              </div>
              <img :src="actualite4" alt="Journée culturelle" class="w-full h-full object-cover hover:scale-110 transition-transform duration-500">
            </div>
            <div class="p-6">
              <div class="flex items-center gap-2 text-sm text-gray-500 mb-3">
                <i class='bx bx-calendar'></i>
                <span>28 Fev 2024</span>
              </div>
              <h3 class="font-bold text-lg mb-2 text-primary">Journée culturelle guinéenne à Washington</h3>
              <p class="text-gray-600 text-sm mb-4">Célébration de la richesse culturelle de la Guinée avec la diaspora.</p>
              <router-link to="/actualites/4" class="text-accent font-semibold inline-flex items-center gap-1 hover:gap-2 transition-all">
                Lire la suite <i class='bx bx-right-arrow-alt'></i>
              </router-link>
            </div>
          </div>
        </div>

        <div class="text-center mt-12">
          <router-link
            to="/actualites"
            class="inline-flex items-center gap-2 bg-primary text-white px-8 py-4 rounded-lg font-semibold hover:bg-primary-dark transition-all"
          >
            Voir toutes les actualités
            <i class='bx bx-right-arrow-alt text-xl'></i>
          </router-link>
        </div>
      </div>
    </section>
  </div>
</template>

<script setup>
import { ref } from 'vue'

// Import des 4 photos de fond pour le hero
import heroPhoto1 from '@/assets/images/hero3.jpg' // Logo avec bouclier
import heroPhoto2 from '@/assets/images/hero4.jpg' // Gare
import heroPhoto3 from '@/assets/images/hero5.jpg' // Paysage orange
import heroPhoto4 from '@/assets/images/hero6.jpg' // Cascade
import bgHero from "@/assets/images/bghero.jpeg"

// Import du logo de l'ambassade
import logoAmbassade from '@/assets/images/logo.png'

// Import des photos du président et de l'ambassadeur
import presidentImage from '@/assets/images/president.jpeg'
import ambassadeurImage from '@/assets/images/ambassadeur.jpeg'
// Import de la photo du Ministre
import ministreImage from '@/assets/images/ministre.jpeg'

// Import des images pour les actualités (4 cards)
import actualite1 from '@/assets/images/actualite1.jpg'
import actualite2 from '@/assets/images/actualite2.jpg'
import actualite3 from '@/assets/images/actualite3.jpg'
import actualite4 from '@/assets/images/actualite4.jpg'
</script>

<style scoped>
/* Styles pour les transitions si besoin */
</style>
