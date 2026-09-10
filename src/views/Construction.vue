<template>
  <div class="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100">
    <!-- Contenu principal -->
    <div class="max-w-7xl mx-auto px-4 py-12 md:py-20">
      <div class="text-center">
        <!-- Logo -->
        <div class="flex justify-center mb-8">
          <div class="bg-gradient-to-r from-accent to-primary-light p-4 rounded-2xl shadow-xl">
            <div class="bg-white rounded-xl p-4">
              <div class="flex items-center gap-4">
                <img :src="logo1" alt="Logo Guinée" class="h-12 w-auto">
                <img :src="logoSimandou" alt="Simandou" class="h-12 w-auto">
              </div>
            </div>
          </div>
        </div>

        <!-- Icône de construction -->
        <div class="mb-8 animate-bounce">
          <div class="inline-block bg-accent/10 p-6 rounded-full">
            <svg class="w-20 h-20 text-accent" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="1.5" d="M19.428 15.428a2 2 0 00-1.022-.547l-2.387-.477a6 6 0 00-3.86.517l-.318.158a6 6 0 01-3.86.517L6.05 15.21a2 2 0 00-1.806.547M8 4h8l-1 1v5.172a2 2 0 00.586 1.414l5 5c1.26 1.26.367 3.414-1.415 3.414H4.828c-1.782 0-2.674-2.154-1.414-3.414l5-5A2 2 0 009 10.172V5L8 4z"></path>
            </svg>
          </div>
        </div>

        <!-- Titre principal -->
        <h1 class="text-4xl md:text-6xl font-bold text-gray-800 mb-4">
          Page en <span class="text-accent">construction</span>
        </h1>

        <!-- Sous-titre -->
        <p class="text-xl md:text-2xl text-gray-600 mb-6">
          Nous travaillons dur pour vous offrir une expérience exceptionnelle
        </p>

        <!-- Message de disponibilité -->
        <div class="max-w-2xl mx-auto mb-12">
          <div class="bg-gradient-to-r from-accent/10 to-primary-light/10 rounded-2xl p-6">
            <p class="text-gray-700 text-lg">
              🚧 Cette page est actuellement en cours de développement.<br>
              Elle sera bientôt disponible en ligne. Merci de votre patience ! 🙏
            </p>
          </div>
        </div>

        <!-- Barre de progression animée -->
        <div class="max-w-md mx-auto mb-12">
          <div class="bg-gray-200 rounded-full h-3 overflow-hidden">
            <div class="bg-gradient-to-r from-accent to-primary-light h-3 rounded-full animate-progress" style="width: 65%"></div>
          </div>
          <p class="text-sm text-gray-500 mt-2">Progression des travaux : 65%</p>
        </div>

        <!-- Compteur estimatif -->
        <div class="flex justify-center gap-8 mb-12">
          <div class="text-center">
            <div class="text-3xl font-bold text-accent">📅</div>
            <p class="text-sm text-gray-600">Lancement prévu</p>
            <p class="font-semibold">Avril 2025</p>
          </div>
          <div class="text-center">
            <div class="text-3xl font-bold text-primary-light">⚡</div>
            <p class="text-sm text-gray-600">Délai estimé</p>
            <p class="font-semibold">30 jours</p>
          </div>
        </div>

        <!-- Boutons d'action -->
        <div class="flex flex-col sm:flex-row gap-4 justify-center mb-16">
          <router-link
            to="/"
            class="bg-accent text-white px-8 py-3 rounded-full font-semibold hover:bg-accent-dark transition-colors inline-flex items-center gap-2"
          >
            <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6"></path>
            </svg>
            Retour à l'accueil
          </router-link>

          <router-link
            to="/contact"
            class="border-2 border-accent text-accent px-8 py-3 rounded-full font-semibold hover:bg-accent hover:text-white transition-colors inline-flex items-center gap-2"
          >
            <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z"></path>
            </svg>
            Nous contacter
          </router-link>
        </div>

        <!-- Fonctionnalités à venir -->
        <div class="grid grid-cols-1 md:grid-cols-3 gap-6 max-w-4xl mx-auto">
          <div class="bg-white rounded-xl p-6 shadow-lg hover:shadow-xl transition-shadow">
            <div class="w-12 h-12 bg-accent/10 rounded-full flex items-center justify-center mx-auto mb-4">
              <svg class="w-6 h-6 text-accent" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"></path>
              </svg>
            </div>
            <h3 class="font-bold text-gray-800 mb-2">Informations complètes</h3>
            <p class="text-sm text-gray-600">Toutes les informations sur les services consulaires</p>
          </div>

          <div class="bg-white rounded-xl p-6 shadow-lg hover:shadow-xl transition-shadow">
            <div class="w-12 h-12 bg-primary-light/10 rounded-full flex items-center justify-center mx-auto mb-4">
              <svg class="w-6 h-6 text-primary-light" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z"></path>
              </svg>
            </div>
            <h3 class="font-bold text-gray-800 mb-2">Prise de RDV en ligne</h3>
            <p class="text-sm text-gray-600">Prenez rendez-vous facilement depuis chez vous</p>
          </div>

          <div class="bg-white rounded-xl p-6 shadow-lg hover:shadow-xl transition-shadow">
            <div class="w-12 h-12 bg-secondary/10 rounded-full flex items-center justify-center mx-auto mb-4">
              <svg class="w-6 h-6 text-secondary" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M3.055 11H5a2 2 0 012 2v1a2 2 0 002 2 2 2 0 012 2v2.945M8 3.935V5.5A2.5 2.5 0 0010.5 8h.5a2 2 0 012 2 2 2 0 104 0 2 2 0 012-2h1.064M15 20.488V18a2 2 0 012-2h3.064M21 12a9 9 0 11-18 0 9 9 0 0118 0z"></path>
              </svg>
            </div>
            <h3 class="font-bold text-gray-800 mb-2">Suivi en temps réel</h3>
            <p class="text-sm text-gray-600">Suivez l'état de vos démarches en ligne</p>
          </div>
        </div>
      </div>
    </div>

    <!-- Animation des particules (optionnel) -->
    <div class="fixed bottom-0 left-0 right-0 pointer-events-none">
      <svg class="w-full h-32 text-accent/5" preserveAspectRatio="none" viewBox="0 0 1440 320">
        <path fill="currentColor" fill-opacity="0.3" d="M0,96L48,112C96,128,192,160,288,160C384,160,480,128,576,122.7C672,117,768,139,864,154.7C960,171,1056,181,1152,170.7C1248,160,1344,128,1392,112L1440,96L1440,320L1392,320C1344,320,1248,320,1152,320C1056,320,960,320,864,320C768,320,672,320,576,320C480,320,384,320,288,320C192,320,96,320,48,320L0,320Z"></path>
      </svg>
    </div>
  </div>
</template>

<script setup>
import { ref } from 'vue'
import logo1 from '@/assets/images/logo.png'
import logoSimandou from '@/assets/images/masque.png'

// Vous pouvez également définir d'autres données si nécessaire
const pageTitle = ref('Page en construction')
const progress = ref(65)
const launchDate = ref('Avril 2025')
</script>

<style scoped>
@keyframes bounce {
  0%, 100% {
    transform: translateY(0);
  }
  50% {
    transform: translateY(-10px);
  }
}

.animate-bounce {
  animation: bounce 2s infinite;
}

@keyframes progress {
  0% {
    width: 0%;
  }
  100% {
    width: 65%;
  }
}

.animate-progress {
  animation: progress 1.5s ease-out;
}
</style>
