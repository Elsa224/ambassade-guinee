<template>
  <div class="min-h-screen bg-gray-50">
    <!-- Hero section -->
    <div class="relative bg-gradient-to-r from-accent to-primary-light text-white">
      <div class="absolute inset-0 bg-black/20"></div>
      <div class="relative max-w-7xl mx-auto px-4 py-16 md:py-20">
        <div class="text-center">
          <div class="inline-block bg-white/20 backdrop-blur px-4 py-1 rounded-full text-sm mb-4">
            🇬🇳 Service aux citoyens
          </div>
          <h1 class="text-4xl md:text-5xl font-bold mb-4">Le Consulat</h1>
          <p class="text-xl md:text-2xl max-w-3xl mx-auto opacity-90">
            Au service des ressortissants guinéens aux États-Unis
          </p>
          <div class="flex justify-center gap-4 mt-8">
            <div class="w-16 h-1 bg-accent "></div>
            <div class="w-16 h-1 bg-secondary"></div>
            <div class="w-16 h-1 bg-primary-light"></div>
          </div>
        </div>
      </div>

      <!-- Wave decoration -->
      <div class="absolute bottom-0 left-0 right-0">
        <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 1440 120" class="w-full h-auto">
          <path fill="#f3f4f6" fill-opacity="1" d="M0,64L80,69.3C160,75,320,85,480,80C640,75,800,53,960,48C1120,43,1280,53,1360,58.7L1440,64L1440,120L1360,120C1280,120,1120,120,960,120C800,120,640,120,480,120C320,120,160,120,80,120L0,120Z"></path>
        </svg>
      </div>
    </div>

    <!-- Contenu principal -->
    <div class="max-w-7xl mx-auto px-4 py-12">
      <!-- Responsable consulaire -->
      <div class="bg-white rounded-2xl shadow-xl p-8 mb-8">
        <div class="flex flex-col md:flex-row gap-8 items-start">
          <div class="md:w-1/3">
            <div class="bg-gradient-to-r from-accent to-accent-deep text-white rounded-xl p-6 text-center">
              <div class="w-24 h-24 mx-auto bg-white/20 rounded-full flex items-center justify-center mb-4">
                <svg class="w-12 h-12 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z"></path>
                </svg>
              </div>
              <h2 class="text-2xl font-bold mb-2">Madame NABÉ</h2>
              <p class="text-lg opacity-90">Attachée Consulaire</p>
              <div class="mt-4 pt-4 border-t border-white/20">
                <p class="text-sm">Votre contact pour toutes les démarches consulaires</p>
              </div>
            </div>
          </div>

          <div class="md:w-2/3">
            <h2 class="text-2xl font-bold text-gray-800 mb-4">À propos du Consulat</h2>
            <p class="text-gray-700 leading-relaxed mb-4">
              Il est chargé des relations avec les <span class="font-bold text-accent">ressortissants Guinéens établis aux États-Unis d'Amérique</span>.
              Son rôle consiste avant tout d'assurer la <span class="font-bold text-accent">protection de nos compatriotes</span>.
            </p>
            <div class="bg-blue-50 border-l-4 border-accent p-4 rounded-r-xl">
              <p class="font-semibold">🎯 Mission principale</p>
              <p>Assurer la protection et l'assistance consulaire à tous les ressortissants guinéens sur le territoire américain.</p>
            </div>
          </div>
        </div>
      </div>

      <!-- Coordonnées -->
      <div class="grid grid-cols-1 md:grid-cols-2 gap-8 mb-8">
        <div class="bg-white rounded-2xl shadow-xl p-8">
          <h3 class="text-xl font-bold text-gray-800 mb-4 flex items-center">
            <svg class="w-6 h-6 text-accent mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z"></path>
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 11a3 3 0 11-6 0 3 3 0 016 0z"></path>
            </svg>
            📍 Adresse
          </h3>
          <p class="text-gray-700 text-lg">2112 Leroy Place, NW</p>
          <p class="text-gray-700">Washington, D.C. 20008</p>
          <a href="#" class="text-accent hover:underline mt-2 inline-block">Voir sur Google Maps →</a>
        </div>

        <div class="bg-white rounded-2xl shadow-xl p-8">
          <h3 class="text-xl font-bold text-gray-800 mb-4 flex items-center">
            <svg class="w-6 h-6 text-accent mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z"></path>
            </svg>
            📞 Téléphone
          </h3>
          <p class="text-gray-700 text-2xl font-bold">+1 (202) 986-4300</p>
          <p class="text-sm text-gray-500 mt-2">Ligne directe du consulat</p>
        </div>
      </div>

      <!-- Missions consulaires -->
      <div class="bg-white rounded-2xl shadow-xl p-8 mb-8">
        <h2 class="text-2xl font-bold text-gray-800 mb-6 flex items-center">
          <span class="bg-accent w-1 h-6 mr-3"></span>
          📋 Missions du service consulaire
        </h2>

        <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
          <div class="bg-gray-50 p-4 rounded-lg text-center hover:shadow-md transition-shadow">
            <div class="bg-accent/10 w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-3">
              <svg class="w-8 h-8 text-accent" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M18 9v3m0 0v3m0-3h3m-3 0h-3m-2-5a4 4 0 11-8 0 4 4 0 018 0zM3 20a6 6 0 0112 0v1H3v-1z"></path>
              </svg>
            </div>
            <h4 class="font-semibold">Assistance</h4>
            <p class="text-sm text-gray-600">À tous nos compatriotes vivant aux États-Unis</p>
          </div>

          <div class="bg-gray-50 p-4 rounded-lg text-center hover:shadow-md transition-shadow">
            <div class="bg-secondary/10 w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-3">
              <svg class="w-8 h-8 text-secondary" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"></path>
              </svg>
            </div>
            <h4 class="font-semibold">État civil</h4>
            <p class="text-sm text-gray-600">Gestion des actes d'état civil et action sociale</p>
          </div>

          <div class="bg-gray-50 p-4 rounded-lg text-center hover:shadow-md transition-shadow">
            <div class="bg-primary-light/10 w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-3">
              <svg class="w-8 h-8 text-primary-light" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 9h3.75M15 12h3.75M15 15h3.75M4.5 19.5h15a2.25 2.25 0 002.25-2.25V6.75A2.25 2.25 0 0019.5 4.5h-15a2.25 2.25 0 00-2.25 2.25v10.5A2.25 2.25 0 004.5 19.5zm6-10.125a1.875 1.875 0 11-3.75 0 1.875 1.875 0 013.75 0zm1.294 6.336a6.721 6.721 0 01-3.17.789 6.721 6.721 0 01-3.168-.789 3.376 3.376 0 016.338 0z"></path>
              </svg>
            </div>
            <h4 class="font-semibold">Cartes consulaires</h4>
            <p class="text-sm text-gray-600">Délivrance des cartes consulaires et titres de voyage</p>
          </div>

          <div class="bg-gray-50 p-4 rounded-lg text-center hover:shadow-md transition-shadow">
            <div class="bg-accent/10 w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-3">
              <svg class="w-8 h-8 text-accent" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 6v6m0 0v6m0-6h6m-6 0H6"></path>
              </svg>
            </div>
            <h4 class="font-semibold">Visas</h4>
            <p class="text-sm text-gray-600">Assistance aux demandeurs via www.paf.gov.gn</p>
          </div>
        </div>
      </div>

      <!-- Informations importantes -->
      <div class="grid grid-cols-1 md:grid-cols-2 gap-8 mb-8">
        <!-- Section Visas -->
        <div class="bg-yellow-50 border border-yellow-200 rounded-2xl p-8">
          <div class="flex items-center gap-3 mb-4">
            <div class="bg-secondary p-2 rounded-full">
              <svg class="w-6 h-6 text-gray-800" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z"></path>
              </svg>
            </div>
            <h3 class="text-xl font-bold text-gray-800">📌 Important - Visas</h3>
          </div>
          <p class="text-gray-700 mb-3">
            Depuis <span class="font-bold">2021</span>, le consulat <span class="font-bold text-accent">ne délivre plus de visas</span>, mais porte assistance aux demandeurs.
          </p>
          <div class="bg-white p-4 rounded-lg">
            <p class="text-sm font-semibold mb-2">Site officiel du Ministère :</p>
            <a href="https://www.paf.gov.gn" target="_blank" class="inline-flex items-center gap-2 bg-accent text-white px-4 py-2 rounded-lg hover:bg-accent-dark transition-colors">
              www.paf.gov.gn
              <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14"></path>
              </svg>
            </a>
          </div>
        </div>

        <!-- Section Passeports -->
        <div class="bg-orange-50 border border-orange-200 rounded-2xl p-8">
          <div class="flex items-center gap-3 mb-4">
            <div class="bg-accent p-2 rounded-full">
              <svg class="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 9h3.75M15 12h3.75M15 15h3.75M4.5 19.5h15a2.25 2.25 0 002.25-2.25V6.75A2.25 2.25 0 0019.5 4.5h-15a2.25 2.25 0 00-2.25 2.25v10.5A2.25 2.25 0 004.5 19.5z"></path>
              </svg>
            </div>
            <h3 class="text-xl font-bold text-gray-800">📌 Important - Passeports</h3>
          </div>
          <p class="text-gray-700 mb-3">
            <span class="font-bold text-accent">La délivrance de passeports n'est pas encore possible</span> dans notre Ambassade.
          </p>
          <div class="bg-white p-4 rounded-lg">
            <p class="text-sm font-semibold mb-2">Demande de passeports biométriques :</p>
            <a href="https://www.loubaservices.com" target="_blank" class="inline-flex items-center gap-2 bg-primary-light text-white px-4 py-2 rounded-lg hover:bg-primary-dark transition-colors">
              www.loubaservices.com
              <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14"></path>
              </svg>
            </a>
          </div>
        </div>
      </div>

      <!-- Mission Permanente à New York -->
      <div class="bg-gradient-to-r from-accent to-primary-light text-white rounded-2xl p-8 mb-8">
        <div class="flex items-center gap-3 mb-6">
          <div class="bg-white/20 p-3 rounded-full">
            <svg class="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4"></path>
            </svg>
          </div>
          <h2 class="text-2xl font-bold">Mission Permanente de la Guinée près les Nations Unies</h2>
        </div>

        <div class="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div class="bg-white/10 backdrop-blur rounded-xl p-4">
            <h3 class="font-bold mb-2 flex items-center gap-2">
              <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z"></path>
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 11a3 3 0 11-6 0 3 3 0 016 0z"></path>
              </svg>
              📍 Adresse
            </h3>
            <p>140 East 39th Street</p>
            <p>New York, NY 10016</p>
          </div>

          <div class="bg-white/10 backdrop-blur rounded-xl p-4">
            <h3 class="font-bold mb-2 flex items-center gap-2">
              <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z"></path>
              </svg>
              📞 Téléphone
            </h3>
            <p>+1 (212) 687-8115</p>
          </div>

          <div class="bg-white/10 backdrop-blur rounded-xl p-4 md:col-span-2">
            <h3 class="font-bold mb-2 flex items-center gap-2">
              <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z"></path>
              </svg>
              📧 Emails
            </h3>
            <p class="mb-1">missionofguinea.un@gmail.com</p>
            <p>mpguinee@mae.gov.gn</p>
          </div>
        </div>
      </div>

      <!-- Note d'information -->
      <div class="bg-blue-50 border-l-4 border-accent p-4 rounded-r-xl">
        <div class="flex items-start gap-3">
          <svg class="w-6 h-6 text-accent flex-shrink-0 mt-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"></path>
          </svg>
          <div>
            <h4 class="font-bold text-gray-800 mb-1">Information complémentaire</h4>
            <p class="text-gray-700">
              Pour toute information complémentaire, nous vous prions de bien vouloir vous renseigner auprès du service consulaire
              de la Mission Permanente de la République de Guinée près les Nations Unies.
            </p>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
// Pas de logique particulière pour cette page
</script>

<style scoped>
.hover\:shadow-md {
  transition: all 0.3s ease;
}

.bg-white\/10 {
  backdrop-filter: blur(4px);
}
</style>
