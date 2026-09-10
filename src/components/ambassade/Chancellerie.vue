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
          <h1 class="text-4xl md:text-5xl font-bold mb-4">La Chancellerie Diplomatique</h1>
          <p class="text-xl md:text-2xl max-w-3xl mx-auto opacity-90">
            Au service de la diplomatie guinéenne et des relations bilatérales
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
          <path fill="#f3f4f6" fill-opacity="1" d="M0,64L80,69.3C160,75,320,85,480,80C640,75,800,53,960,48C1120,43,1280,53,1360,58.7L1440,64L1440,120L1360,120C1280,120,1120,120,960,120C800,120,640,120,480,120C320,120,160,120,80,120L0,120Z"></path>
        </svg>
      </div>
    </div>

    <!-- Contenu principal -->
    <div class="max-w-7xl mx-auto px-4 py-12">
      <!-- Section description -->
      <div class="bg-white rounded-2xl shadow-lg p-8 mb-12">
        <div class="flex flex-col md:flex-row gap-8 items-start">
          <div class="md:w-2/3">
            <h2 class="text-2xl font-bold text-gray-800 mb-4 flex items-center">
              <span class="bg-accent w-1 h-6 mr-3"></span>
              Mission de la Chancellerie
            </h2>
            <p class="text-gray-700 leading-relaxed mb-4">
              La chancellerie diplomatique est chargée d'assister l'Ambassadeur dans ses fonctions de chef de mission officiel, représentant du Président de la République, Chef de l'État et du Gouvernement guinéen auprès des autorités américaine, costaricaine, haïtienne et bahamienne.
            </p>
            <p class="text-gray-700 leading-relaxed">
              À ce titre, elle a pour mission l'analyse de la situation politique, économique, sociale et culturelle des pays de sa juridiction, tout en assurant la coordination des services de l'Ambassade, le service d'appui notamment.
            </p>
          </div>
          <div class="md:w-1/3 bg-gradient-to-br from-accent to-primary-light text-white rounded-xl p-6">
            <div class="flex items-center gap-3 mb-4">
              <svg class="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M3.055 11H5a2 2 0 012 2v1a2 2 0 002 2 2 2 0 012 2v2.945M8 3.935V5.5A2.5 2.5 0 0010.5 8h.5a2 2 0 012 2 2 2 0 104 0 2 2 0 012-2h1.064M15 20.488V18a2 2 0 012-2h3.064M21 12a9 9 0 11-18 0 9 9 0 0118 0z"></path>
              </svg>
              <h3 class="font-bold text-lg">Juridiction</h3>
            </div>
            <ul class="space-y-2 text-sm">
              <li class="flex items-center gap-2">
                <span class="w-1 h-1 bg-secondary rounded-full"></span>
                États-Unis d'Amérique
              </li>
              <li class="flex items-center gap-2">
                <span class="w-1 h-1 bg-secondary rounded-full"></span>
                République du Costa-Rica
              </li>
              <li class="flex items-center gap-2">
                <span class="w-1 h-1 bg-secondary rounded-full"></span>
                République d'Haïti
              </li>
              <li class="flex items-center gap-2">
                <span class="w-1 h-1 bg-secondary rounded-full"></span>
                Commonwealth des Bahamas
              </li>
            </ul>
          </div>
        </div>
      </div>

      <!-- Équipe Diplomatique -->
      <div class="mb-16">
        <h2 class="text-3xl font-bold text-gray-800 mb-8 flex items-center">
          <span class="bg-accent w-1 h-8 mr-3"></span>
          Équipe Diplomatique
        </h2>

        <!-- Ambassadeur (carte spéciale) -->
        <div class="bg-gradient-to-r from-accent to-accent-deep text-white rounded-2xl p-6 mb-8 shadow-xl">
          <div class="flex items-center gap-4">
            <div class="bg-white/20 p-3 rounded-full">
              <svg class="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z"></path>
              </svg>
            </div>
            <div>
              <p class="text-sm opacity-90">Son Excellence</p>
              <h3 class="text-2xl font-bold">Madame Sidibé Fatoumata KABA</h3>
              <p class="text-lg text-secondary">Ambassadeur Extraordinaire et Plénipotentiaire</p>
            </div>
          </div>
        </div>

        <!-- Grille des diplomates -->
        <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          <!-- Ministre Conseiller -->
          <div class="bg-white rounded-xl shadow-lg p-6 hover:shadow-xl transition-shadow border-l-4 border-accent">
            <div class="flex items-start gap-4">
              <div class="bg-accent/10 p-3 rounded-full">
                <svg class="w-6 h-6 text-accent" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z"></path>
                </svg>
              </div>
              <div>
                <h3 class="font-bold text-gray-800">M. Ibrahima N'Dayiri DIALL</h3>
                <p class="text-accent font-medium">Ministre Conseiller</p>
              </div>
            </div>
          </div>

          <!-- Premier Conseiller Communication -->
          <div class="bg-white rounded-xl shadow-lg p-6 hover:shadow-xl transition-shadow border-l-4 border-secondary">
            <div class="flex items-start gap-4">
              <div class="bg-secondary/10 p-3 rounded-full">
                <svg class="w-6 h-6 text-secondary" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M8 10h.01M12 10h.01M16 10h.01M9 16H5a2 2 0 01-2-2V6a2 2 0 012-2h14a2 2 0 012 2v8a2 2 0 01-2 2h-5l-5 5v-5z"></path>
                </svg>
              </div>
              <div>
                <h3 class="font-bold text-gray-800">M. Mohamed Lamine SOLANO</h3>
                <p class="text-secondary font-medium">Premier Conseiller chargé de la Communication et des Relations Extérieures</p>
              </div>
            </div>
          </div>

          <!-- Premier Conseiller Économique -->
          <div class="bg-white rounded-xl shadow-lg p-6 hover:shadow-xl transition-shadow border-l-4 border-primary-light">
            <div class="flex items-start gap-4">
              <div class="bg-primary-light/10 p-3 rounded-full">
                <svg class="w-6 h-6 text-primary-light" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z"></path>
                </svg>
              </div>
              <div>
                <h3 class="font-bold text-gray-800">M. Georges Nekeon MAMY</h3>
                <p class="text-primary-light font-medium">Premier Conseiller chargé des questions Économiques</p>
              </div>
            </div>
          </div>

          <!-- Première Conseillère Administrative -->
          <div class="bg-white rounded-xl shadow-lg p-6 hover:shadow-xl transition-shadow border-l-4 border-accent">
            <div class="flex items-start gap-4">
              <div class="bg-accent/10 p-3 rounded-full">
                <svg class="w-6 h-6 text-accent" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"></path>
                </svg>
              </div>
              <div>
                <h3 class="font-bold text-gray-800">Madame SANOH Saran SANO</h3>
                <p class="text-accent font-medium">Première Conseillère chargée des Affaires Administratives</p>
              </div>
            </div>
          </div>

          <!-- Deuxième Conseiller Logistique -->
          <div class="bg-white rounded-xl shadow-lg p-6 hover:shadow-xl transition-shadow border-l-4 border-secondary">
            <div class="flex items-start gap-4">
              <div class="bg-secondary/10 p-3 rounded-full">
                <svg class="w-6 h-6 text-secondary" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M5 8h14M5 8a2 2 0 110-4h14a2 2 0 110 4M5 8v10a2 2 0 002 2h10a2 2 0 002-2V8m-9 4h4"></path>
                </svg>
              </div>
              <div>
                <h3 class="font-bold text-gray-800">M. KANDET Sékou</h3>
                <p class="text-secondary font-medium">Deuxième Conseiller chargé de la Logistique</p>
              </div>
            </div>
          </div>

          <!-- Première Secrétaire Finances -->
          <div class="bg-white rounded-xl shadow-lg p-6 hover:shadow-xl transition-shadow border-l-4 border-primary-light">
            <div class="flex items-start gap-4">
              <div class="bg-primary-light/10 p-3 rounded-full">
                <svg class="w-6 h-6 text-primary-light" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M17 9V7a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2m2 4h10a2 2 0 002-2v-6a2 2 0 00-2-2H9a2 2 0 00-2 2v6a2 2 0 002 2zm7-5a2 2 0 11-4 0 2 2 0 014 0z"></path>
                </svg>
              </div>
              <div>
                <h3 class="font-bold text-gray-800">Madame Touré Adama KEÏTA</h3>
                <p class="text-primary-light font-medium">Première Secrétaire chargée des Affaires Financières</p>
              </div>
            </div>
          </div>

          <!-- Premier Secrétaire Protocole -->
          <div class="bg-white rounded-xl shadow-lg p-6 hover:shadow-xl transition-shadow border-l-4 border-accent">
            <div class="flex items-start gap-4">
              <div class="bg-accent/10 p-3 rounded-full">
                <svg class="w-6 h-6 text-accent" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M21 15.546c-.523 0-1.046.151-1.5.454a2.704 2.704 0 01-3 0 2.704 2.704 0 00-3 0 2.704 2.704 0 01-3 0 2.704 2.704 0 00-3 0 2.704 2.704 0 01-3 0 2.701 2.701 0 00-1.5-.454M9 6v2m3-2v2m3-2v2M9 3h.01M12 3h.01M15 3h.01M21 21v-7a2 2 0 00-2-2H5a2 2 0 00-2 2v7h18zm-3-9v-2a2 2 0 00-2-2H8a2 2 0 00-2 2v2h12z"></path>
                </svg>
              </div>
              <div>
                <h3 class="font-bold text-gray-800">M. Ibrahima BANGOURA</h3>
                <p class="text-accent font-medium">Premier Secrétaire chargé du Protocole</p>
              </div>
            </div>
          </div>

          <!-- Troisième Secrétaire Administratif -->
          <div class="bg-white rounded-xl shadow-lg p-6 hover:shadow-xl transition-shadow border-l-4 border-secondary">
            <div class="flex items-start gap-4">
              <div class="bg-secondary/10 p-3 rounded-full">
                <svg class="w-6 h-6 text-secondary" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4"></path>
                </svg>
              </div>
              <div>
                <h3 class="font-bold text-gray-800">Madame Kagbè MAGASSOUBA</h3>
                <p class="text-secondary font-medium">Troisième Secrétaire chargé des Affaires Administratives</p>
              </div>
            </div>
          </div>
        </div>
      </div>

      <!-- Section Consulaire et Secrétariat -->
      <div class="grid grid-cols-1 lg:grid-cols-2 gap-8 mb-12">
        <!-- Section Consulaire -->
        <div class="bg-white rounded-2xl shadow-lg p-8">
          <h2 class="text-2xl font-bold text-gray-800 mb-6 flex items-center">
            <span class="bg-primary-light w-1 h-6 mr-3"></span>
            <svg class="w-6 h-6 text-primary-light mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M3.055 11H5a2 2 0 012 2v1a2 2 0 002 2 2 2 0 012 2v2.945M8 3.935V5.5A2.5 2.5 0 0010.5 8h.5a2 2 0 012 2 2 2 0 104 0 2 2 0 012-2h1.064M15 20.488V18a2 2 0 012-2h3.064M21 12a9 9 0 11-18 0 9 9 0 0118 0z"></path>
            </svg>
            La Section Consulaire
          </h2>

          <div class="bg-gray-50 rounded-xl p-6">
            <div class="flex items-center gap-4">
              <div class="bg-primary-light p-3 rounded-full">
                <svg class="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z"></path>
                </svg>
              </div>
              <div>
                <p class="text-sm text-gray-500">Attachée Consulaire</p>
                <h3 class="text-xl font-bold text-gray-800">Madame XXX NABÉ</h3>
              </div>
            </div>
          </div>
        </div>

        <!-- Secrétariat de l'Ambassade -->
        <div class="bg-white rounded-2xl shadow-lg p-8">
          <h2 class="text-2xl font-bold text-gray-800 mb-6 flex items-center">
            <span class="bg-secondary w-1 h-6 mr-3"></span>
            <svg class="w-6 h-6 text-secondary mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z"></path>
            </svg>
            Le Secrétariat de l'Ambassade
          </h2>

          <p class="text-gray-600 mb-6">
            Ce service, structure d'appui, est placé auprès de l'Ambassadeur. Il est chargé de la gestion administrative de la chancellerie diplomatique et de la section consulaire.
          </p>

          <div class="space-y-4">
            <div class="bg-gray-50 rounded-xl p-4">
              <div class="flex items-center gap-3">
                <div class="bg-secondary p-2 rounded-full">
                  <svg class="w-5 h-5 text-gray-800" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M5 13l4 4L19 7"></path>
                  </svg>
                </div>
                <div>
                  <p class="text-sm text-gray-500">Secrétaire particulière de l'Ambassadeur</p>
                  <h3 class="font-bold text-gray-800">Madame Jean PHILIPPE</h3>
                </div>
              </div>
            </div>

            <div class="bg-gray-50 rounded-xl p-4">
              <div class="flex items-center gap-3">
                <div class="bg-primary-light p-2 rounded-full">
                  <svg class="w-5 h-5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z"></path>
                  </svg>
                </div>
                <div>
                  <p class="text-sm text-gray-500">Secrétaire-réceptionniste</p>
                  <h3 class="font-bold text-gray-800">Madame Justine ADEYANJU</h3>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      <!-- Organisation Chart -->
      <div class="bg-gray-900 text-white rounded-2xl p-8">
        <h2 class="text-2xl font-bold mb-6 flex items-center">
          <span class="bg-secondary w-1 h-6 mr-3"></span>
          Organisation de la Chancellerie
        </h2>

        <div class="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div class="border border-gray-700 rounded-lg p-4">
            <h3 class="text-secondary font-bold mb-3">Ambassadeur</h3>
            <p class="text-sm">Chef de mission diplomatique</p>
          </div>
          <div class="border border-gray-700 rounded-lg p-4">
            <h3 class="text-secondary font-bold mb-3">Conseillers</h3>
            <p class="text-sm">Équipe diplomatique</p>
          </div>
          <div class="border border-gray-700 rounded-lg p-4">
            <h3 class="text-secondary font-bold mb-3">Services d'appui</h3>
            <p class="text-sm">Secrétariat et consulat</p>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
// Pas de logique particulière pour cette page
// Les données sont directement dans le template
</script>

<style scoped>
/* Animations */
.hover\:shadow-xl {
  transition: all 0.3s ease;
}

.border-l-4 {
  transition: transform 0.2s ease;
}

.border-l-4:hover {
  transform: translateX(5px);
}
</style>
