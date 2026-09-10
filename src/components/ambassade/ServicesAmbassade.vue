<template>
  <div class="min-h-screen bg-gray-50">
    <!-- Hero section -->
    <div class="relative bg-gradient-to-r from-accent to-primary-light text-white">
      <div class="absolute inset-0 bg-black/20"></div>
      <div class="relative max-w-7xl mx-auto px-4 py-16 md:py-20">
        <div class="text-center">
          <div class="inline-block bg-white/20 backdrop-blur px-4 py-1 rounded-full text-sm mb-4">
            🇬🇳 Ambassade de Guinée aux États-Unis
          </div>
          <h1 class="text-4xl md:text-5xl font-bold mb-4">Services aux Citoyens</h1>
          <p class="text-xl md:text-2xl max-w-3xl mx-auto opacity-90">
            Au service des ressortissants guinéens établis aux États-Unis
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
      <!-- Section Consulat -->
      <div class="bg-white rounded-2xl shadow-xl p-8 mb-12">
        <div class="flex items-center gap-3 mb-6">
          <div class="bg-accent p-3 rounded-full">
            <svg class="w-8 h-8 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path
                stroke-linecap="round"
                stroke-linejoin="round"
                stroke-width="2"
                d="M21 13.255A23.931 23.931 0 0112 15c-3.183 0-6.22-.62-9-1.745M16 6V4a2 2 0 00-2-2h-4a2 2 0 00-2 2v2m4 6h.01M5 20h14a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z"
              ></path>
            </svg>
          </div>
          <h2 class="text-3xl font-bold text-gray-800">Le Consulat</h2>
        </div>

        <!-- Responsable consulaire -->
        <div class="bg-gradient-to-r from-accent to-accent-deep text-white rounded-xl p-6 mb-8">
          <div class="flex items-center gap-4">
            <div class="bg-white/20 p-3 rounded-full">
              <svg class="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path
                  stroke-linecap="round"
                  stroke-linejoin="round"
                  stroke-width="2"
                  d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z"
                ></path>
              </svg>
            </div>
            <div>
              <p class="text-sm opacity-90">Attachée Consulaire</p>
              <h3 class="text-2xl font-bold">Madame NABÉ</h3>
            </div>
          </div>
        </div>

        <!-- Coordonnées du consulat -->
        <div class="grid grid-cols-1 md:grid-cols-2 gap-8 mb-8">
          <div class="bg-gray-50 rounded-xl p-6">
            <h3 class="text-xl font-bold text-gray-800 mb-4 flex items-center">
              <svg
                class="w-5 h-5 text-accent mr-2"
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
              Adresse
            </h3>
            <p class="text-gray-700 text-lg">2112 Leroy Place, NW</p>
            <p class="text-gray-700">Washington, D.C. 20008</p>
            <a href="#" class="text-accent hover:underline mt-2 inline-block"
              >Voir sur Google Maps →</a
            >
          </div>

          <div class="bg-gray-50 rounded-xl p-6">
            <h3 class="text-xl font-bold text-gray-800 mb-4 flex items-center">
              <svg
                class="w-5 h-5 text-accent mr-2"
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
              Téléphone
            </h3>
            <p class="text-gray-700 text-xl font-semibold">+1 (202) 986-4300</p>
            <p class="text-sm text-gray-500 mt-2">Ligne directe du consulat</p>
          </div>
        </div>

        <!-- Rôle du consulat -->
        <div class="bg-blue-50 border-l-4 border-accent p-6 rounded-r-xl mb-8">
          <p class="text-gray-700 text-lg">
            Il est chargé des relations avec les ressortissants Guinéens établis aux États-Unis
            d'Amérique. Son rôle consiste avant tout d'assurer la
            <span class="font-bold text-accent">protection de nos compatriotes</span>.
          </p>
        </div>

        <!-- Missions consulaires -->
        <h3 class="text-2xl font-bold text-gray-800 mb-6">Missions du service consulaire</h3>

        <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
          <div class="bg-gray-50 p-4 rounded-lg text-center hover:shadow-md transition-shadow">
            <div
              class="bg-accent/10 w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-3"
            >
              <svg
                class="w-8 h-8 text-accent"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  stroke-linecap="round"
                  stroke-linejoin="round"
                  stroke-width="2"
                  d="M18 9v3m0 0v3m0-3h3m-3 0h-3m-2-5a4 4 0 11-8 0 4 4 0 018 0zM3 20a6 6 0 0112 0v1H3v-1z"
                ></path>
              </svg>
            </div>
            <h4 class="font-semibold">Assistance</h4>
            <p class="text-sm text-gray-600">À tous nos compatriotes vivant aux États-Unis</p>
          </div>

          <div class="bg-gray-50 p-4 rounded-lg text-center hover:shadow-md transition-shadow">
            <div
              class="bg-secondary/10 w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-3"
            >
              <svg
                class="w-8 h-8 text-secondary"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  stroke-linecap="round"
                  stroke-linejoin="round"
                  stroke-width="2"
                  d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"
                ></path>
              </svg>
            </div>
            <h4 class="font-semibold">État civil</h4>
            <p class="text-sm text-gray-600">Gestion des actes d'état civil et action sociale</p>
          </div>

          <div class="bg-gray-50 p-4 rounded-lg text-center hover:shadow-md transition-shadow">
            <div
              class="bg-primary-light/10 w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-3"
            >
              <svg
                class="w-8 h-8 text-primary-light"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  stroke-linecap="round"
                  stroke-linejoin="round"
                  stroke-width="2"
                  d="M15 9h3.75M15 12h3.75M15 15h3.75M4.5 19.5h15a2.25 2.25 0 002.25-2.25V6.75A2.25 2.25 0 0019.5 4.5h-15a2.25 2.25 0 00-2.25 2.25v10.5A2.25 2.25 0 004.5 19.5zm6-10.125a1.875 1.875 0 11-3.75 0 1.875 1.875 0 013.75 0zm1.294 6.336a6.721 6.721 0 01-3.17.789 6.721 6.721 0 01-3.168-.789 3.376 3.376 0 016.338 0z"
                ></path>
              </svg>
            </div>
            <h4 class="font-semibold">Cartes consulaires</h4>
            <p class="text-sm text-gray-600">
              Délivrance des cartes consulaires et titres de voyage
            </p>
          </div>

          <div class="bg-gray-50 p-4 rounded-lg text-center hover:shadow-md transition-shadow">
            <div
              class="bg-accent/10 w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-3"
            >
              <svg
                class="w-8 h-8 text-accent"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  stroke-linecap="round"
                  stroke-linejoin="round"
                  stroke-width="2"
                  d="M12 6v6m0 0v6m0-6h6m-6 0H6"
                ></path>
              </svg>
            </div>
            <h4 class="font-semibold">Visas</h4>
            <p class="text-sm text-gray-600">Assistance aux demandeurs via www.paf.gov.gn</p>
          </div>
        </div>

        <!-- Informations importantes sur les visas et passeports -->
        <div class="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
          <div class="bg-yellow-50 border border-yellow-200 rounded-xl p-6">
            <div class="flex items-center gap-3 mb-4">
              <div class="bg-secondary p-2 rounded-full">
                <svg
                  class="w-6 h-6 text-gray-800"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    stroke-linecap="round"
                    stroke-linejoin="round"
                    stroke-width="2"
                    d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z"
                  ></path>
                </svg>
              </div>
              <h4 class="font-bold text-lg">Important - Visas</h4>
            </div>
            <p class="text-gray-700">
              Depuis 2021, le consulat <span class="font-bold">ne délivre plus de visas</span>, mais
              porte assistance aux demandeurs via le site internet du Ministère de la Sécurité et de
              la Protection Civile :
            </p>
            <a
              href="https://www.paf.gov.gn"
              target="_blank"
              class="inline-flex items-center gap-2 bg-accent text-white px-4 py-2 rounded-lg mt-4 hover:bg-accent-dark transition-colors"
            >
              www.paf.gov.gn
              <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path
                  stroke-linecap="round"
                  stroke-linejoin="round"
                  stroke-width="2"
                  d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14"
                ></path>
              </svg>
            </a>
          </div>

          <div class="bg-orange-50 border border-orange-200 rounded-xl p-6">
            <div class="flex items-center gap-3 mb-4">
              <div class="bg-accent p-2 rounded-full">
                <svg
                  class="w-6 h-6 text-white"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    stroke-linecap="round"
                    stroke-linejoin="round"
                    stroke-width="2"
                    d="M15 9h3.75M15 12h3.75M15 15h3.75M4.5 19.5h15a2.25 2.25 0 002.25-2.25V6.75A2.25 2.25 0 0019.5 4.5h-15a2.25 2.25 0 00-2.25 2.25v10.5A2.25 2.25 0 004.5 19.5z"
                  ></path>
                </svg>
              </div>
              <h4 class="font-bold text-lg">Important - Passeports</h4>
            </div>
            <p class="text-gray-700 mb-2">
              <span class="font-bold">La délivrance de passeports n'est pas encore possible</span> à
              l'Ambassade.
            </p>
            <p class="text-gray-700">
              En attendant, les demandeurs de passeports biométriques peuvent en faire la demande
              auprès de la Mission Permanente de la République de Guinée près les Nations Unies :
            </p>
            <a
              href="https://www.loubaservices.com"
              target="_blank"
              class="inline-flex items-center gap-2 bg-primary-light text-white px-4 py-2 rounded-lg mt-4 hover:bg-primary-dark transition-colors"
            >
              www.loubaservices.com
              <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path
                  stroke-linecap="round"
                  stroke-linejoin="round"
                  stroke-width="2"
                  d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14"
                ></path>
              </svg>
            </a>
          </div>
        </div>

        <!-- Contact Mission Permanente -->
        <div class="bg-gray-800 text-white rounded-xl p-6">
          <h4 class="text-xl font-bold mb-4 flex items-center">
            <svg class="w-6 h-6 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path
                stroke-linecap="round"
                stroke-linejoin="round"
                stroke-width="2"
                d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6"
              ></path>
            </svg>
            Mission Permanente de la République de Guinée près les Nations Unies
          </h4>
          <p class="mb-2">140 East 39th Street, New York</p>
          <div class="grid grid-cols-1 md:grid-cols-2 gap-4 mt-4">
            <div class="flex items-center gap-2">
              <svg
                class="w-5 h-5 text-secondary"
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
              <span>+1 (212) 687-8115</span>
            </div>
            <div class="flex items-center gap-2">
              <svg
                class="w-5 h-5 text-secondary"
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
              <span>missionofguinea.un@gmail.com</span>
            </div>
            <div class="flex items-center gap-2 col-span-2">
              <svg
                class="w-5 h-5 text-secondary"
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
              <span>mpguinee@mae.gov.gn</span>
            </div>
          </div>
        </div>
      </div>

      <!-- Section Secrétariat -->
      <div class="bg-white rounded-2xl shadow-xl p-8">
        <div class="flex items-center gap-3 mb-6">
          <div class="bg-secondary p-3 rounded-full">
            <svg
              class="w-8 h-8 text-gray-800"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                stroke-linecap="round"
                stroke-linejoin="round"
                stroke-width="2"
                d="M19 21v-2a4 4 0 00-4-4H9a4 4 0 00-4 4v2"
              ></path>
              <circle cx="12" cy="7" r="4"></circle>
            </svg>
          </div>
          <h2 class="text-3xl font-bold text-gray-800">Le Secrétariat de l'Ambassade</h2>
        </div>

        <p class="text-gray-700 text-lg mb-6">
          Ce service, structure d'appui, est placé auprès de l'Ambassadeur. Il est chargé de la
          gestion administrative de la chancellerie diplomatique et de la section consulaire.
        </p>

        <div class="grid grid-cols-1 md:grid-cols-2 gap-8">
          <div class="bg-gray-50 rounded-xl p-6">
            <h3 class="text-xl font-bold text-gray-800 mb-4 flex items-center">
              <svg
                class="w-5 h-5 text-secondary mr-2"
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
              Adresse
            </h3>
            <p class="text-gray-700 text-lg">2112 Leroy Place, NW</p>
            <p class="text-gray-700">Washington, D.C. 20008</p>
          </div>

          <div class="bg-gray-50 rounded-xl p-6">
            <h3 class="text-xl font-bold text-gray-800 mb-4 flex items-center">
              <svg
                class="w-5 h-5 text-secondary mr-2"
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
              Téléphone
            </h3>
            <p class="text-gray-700 text-xl font-semibold">+1 (202) 986-4300</p>
            <p class="text-sm text-gray-500 mt-2">Standard de l'Ambassade</p>
          </div>
        </div>

        <!-- Note d'information complémentaire -->
        <div class="mt-8 bg-accent/5 border border-accent/20 rounded-xl p-6">
          <div class="flex items-start gap-3">
            <svg
              class="w-6 h-6 text-accent flex-shrink-0 mt-1"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                stroke-linecap="round"
                stroke-linejoin="round"
                stroke-width="2"
                d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
              ></path>
            </svg>
            <div>
              <h4 class="font-bold text-gray-800 mb-2">Information complémentaire</h4>
              <p class="text-gray-600">
                Pour toute information complémentaire, nous vous prions de bien vouloir vous
                renseigner auprès du service consulaire de la Mission Permanente de la République de
                Guinée près les Nations Unies située à 140 East 39th Street à New-York.
              </p>
            </div>
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
.hover\:shadow-md,
.hover\:shadow-xl {
  transition: all 0.3s ease;
}
</style>
