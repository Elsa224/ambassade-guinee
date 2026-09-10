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
          <h1 class="text-4xl md:text-5xl font-bold mb-4">Consuls Honoraires</h1>
          <p class="text-xl md:text-2xl max-w-3xl mx-auto opacity-90">
            Représentants consulaires au service des ressortissants guinéens
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
      <!-- Introduction -->
      <div class="bg-white rounded-2xl shadow-lg p-8 mb-12">
        <div class="flex items-center gap-4 mb-4">
          <div class="bg-accent p-3 rounded-full">
            <svg class="w-8 h-8 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M21 13.255A23.931 23.931 0 0112 15c-3.183 0-6.22-.62-9-1.745M16 6V4a2 2 0 00-2-2h-4a2 2 0 00-2 2v2m4 6h.01M5 20h14a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z"></path>
            </svg>
          </div>
          <h2 class="text-3xl font-bold text-gray-800">Représentation Consulaire</h2>
        </div>
        <p class="text-gray-600 text-lg leading-relaxed">
          Les Consuls Honoraires de la République de Guinée assurent une présence et une assistance consulaire
          dans différentes régions des États-Unis. Ils travaillent en étroite collaboration avec l'Ambassade
          à Washington D.C. pour offrir des services de proximité aux ressortissants guinéens.
        </p>
      </div>

      <!-- Grille des consuls honoraires -->
      <div class="grid grid-cols-1 lg:grid-cols-2 gap-8">
        <!-- Houston, Texas -->
        <div class="bg-white rounded-2xl shadow-xl overflow-hidden hover:shadow-2xl transition-shadow">
          <div class="bg-gradient-to-r from-accent to-accent-deep h-3"></div>
          <div class="p-8">
            <div class="flex items-center justify-between mb-6">
              <div class="flex items-center gap-3">
                <div class="bg-accent/10 p-3 rounded-full">
                  <svg class="w-8 h-8 text-accent" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z"></path>
                  </svg>
                </div>
                <div>
                  <span class="text-sm text-gray-500">Consul Honoraire</span>
                  <h3 class="text-2xl font-bold text-gray-800">Monsieur WEA H. LEE</h3>
                </div>
              </div>
              <div class="bg-accent text-white px-4 py-2 rounded-full text-sm font-semibold">
                Texas
              </div>
            </div>

            <div class="bg-gray-50 rounded-xl p-6 space-y-4">
              <!-- Adresse -->
              <div class="flex items-start gap-3">
                <div class="bg-accent/10 p-2 rounded-lg">
                  <svg class="w-5 h-5 text-accent" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z"></path>
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 11a3 3 0 11-6 0 3 3 0 016 0z"></path>
                  </svg>
                </div>
                <div>
                  <p class="text-sm text-gray-500">Adresse</p>
                  <p class="font-semibold text-gray-800">11122 Bellaire Boulevard</p>
                  <p class="text-gray-600">Houston, Texas 77072</p>
                </div>
              </div>

              <!-- Téléphone -->
              <div class="flex items-start gap-3">
                <div class="bg-primary-light/10 p-2 rounded-lg">
                  <svg class="w-5 h-5 text-primary-light" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z"></path>
                  </svg>
                </div>
                <div>
                  <p class="text-sm text-gray-500">Mobile</p>
                  <a href="tel:+12817269888" class="font-semibold text-primary-light hover:underline text-xl">
                    +1 281-726-9888
                  </a>
                </div>
              </div>

              <!-- Badge région -->
              <div class="flex items-center gap-2 mt-4 pt-4 border-t border-gray-200">
                <span class="text-2xl">🇺🇸</span>
                <span class="font-medium text-gray-700">Juridiction : Texas et régions environnantes</span>
              </div>
            </div>

            <!-- Bouton contact -->
            <div class="mt-6">
              <a href="tel:+12817269888" class="block w-full bg-accent text-white text-center py-3 rounded-xl font-semibold hover:bg-accent-dark transition-colors">
                Contacter le Consul
              </a>
            </div>
          </div>
        </div>

        <!-- Santa Monica, California -->
        <div class="bg-white rounded-2xl shadow-xl overflow-hidden hover:shadow-2xl transition-shadow">
          <div class="bg-gradient-to-r from-primary-light to-primary-dark h-3"></div>
          <div class="p-8">
            <div class="flex items-center justify-between mb-6">
              <div class="flex items-center gap-3">
                <div class="bg-primary-light/10 p-3 rounded-full">
                  <svg class="w-8 h-8 text-primary-light" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z"></path>
                  </svg>
                </div>
                <div>
                  <span class="text-sm text-gray-500">Consul Honoraire</span>
                  <h3 class="text-2xl font-bold text-gray-800">M. Jordan José Maria Garcia</h3>
                </div>
              </div>
              <div class="bg-primary-light text-white px-4 py-2 rounded-full text-sm font-semibold">
                Californie
              </div>
            </div>

            <div class="bg-gray-50 rounded-xl p-6 space-y-4">
              <!-- Adresse -->
              <div class="flex items-start gap-3">
                <div class="bg-primary-light/10 p-2 rounded-lg">
                  <svg class="w-5 h-5 text-primary-light" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z"></path>
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 11a3 3 0 11-6 0 3 3 0 016 0z"></path>
                  </svg>
                </div>
                <div>
                  <p class="text-sm text-gray-500">Adresse</p>
                  <p class="font-semibold text-gray-800">1047 17th Street</p>
                  <p class="text-gray-600">Santa Monica, California 90403</p>
                </div>
              </div>

              <!-- Téléphone -->
              <div class="flex items-start gap-3">
                <div class="bg-secondary/10 p-2 rounded-lg">
                  <svg class="w-5 h-5 text-secondary" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z"></path>
                  </svg>
                </div>
                <div>
                  <p class="text-sm text-gray-500">Mobile</p>
                  <a href="tel:+13108041705" class="font-semibold text-primary-light hover:underline text-xl">
                    +1 310-804-1705
                  </a>
                </div>
              </div>

              <!-- Badge région -->
              <div class="flex items-center gap-2 mt-4 pt-4 border-t border-gray-200">
                <span class="text-2xl">🇺🇸</span>
                <span class="font-medium text-gray-700">Juridiction : Californie et côte ouest</span>
              </div>
            </div>

            <!-- Bouton contact -->
            <div class="mt-6">
              <a href="tel:+13108041705" class="block w-full bg-primary-light text-white text-center py-3 rounded-xl font-semibold hover:bg-primary-dark transition-colors">
                Contacter le Consul
              </a>
            </div>
          </div>
        </div>
      </div>

      <!-- Carte des consulats -->
      <div class="mt-12 bg-white rounded-2xl shadow-lg p-8">
        <h3 class="text-2xl font-bold text-gray-800 mb-6 flex items-center">
          <span class="bg-secondary w-1 h-8 mr-3"></span>
          Zones de couverture consulaire
        </h3>

        <div class="grid grid-cols-1 md:grid-cols-2 gap-8">
          <!-- Houston -->
          <div class="border border-gray-200 rounded-xl p-4">
            <div class="flex items-center gap-3 mb-3">
              <div class="w-3 h-3 bg-accent rounded-full"></div>
              <h4 class="font-bold text-lg">Consulat Honoraire - Houston</h4>
            </div>
            <p class="text-gray-600 ml-6">Couverture : Texas, Louisiane, Arkansas, Oklahoma</p>
            <p class="text-sm text-gray-500 ml-6 mt-1">Consul : M. WEA H. LEE</p>
          </div>

          <!-- Santa Monica -->
          <div class="border border-gray-200 rounded-xl p-4">
            <div class="flex items-center gap-3 mb-3">
              <div class="w-3 h-3 bg-primary-light rounded-full"></div>
              <h4 class="font-bold text-lg">Consulat Honoraire - Santa Monica</h4>
            </div>
            <p class="text-gray-600 ml-6">Couverture : Californie, Oregon, Washington, Nevada</p>
            <p class="text-sm text-gray-500 ml-6 mt-1">Consul : M. Jordan José Maria Garcia</p>
          </div>
        </div>

        <!-- Note d'information -->
        <div class="mt-8 bg-blue-50 border-l-4 border-accent p-4 rounded-r-xl">
          <div class="flex items-start gap-3">
            <svg class="w-6 h-6 text-accent flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"></path>
            </svg>
            <div>
              <p class="font-semibold text-gray-800">Information importante</p>
              <p class="text-gray-600">
                Les Consuls Honoraires travaillent en étroite collaboration avec l'Ambassade à Washington D.C.
                Pour toute question relative à leur juridiction, n'hésitez pas à les contacter directement.
              </p>
            </div>
          </div>
        </div>
      </div>

      <!-- Contact Ambassade -->
      <div class="mt-8 text-center">
        <p class="text-gray-600">
          Vous pouvez également contacter l'Ambassade à Washington D.C. pour toute information complémentaire :
        </p>
        <div class="flex justify-center gap-4 mt-4">
          <a href="tel:+12029864300" class="text-accent font-semibold hover:underline">
            +1 (202) 986-4300
          </a>
          <span class="text-gray-300">|</span>
          <a href="mailto:consulat@ambaguinee-usa.org" class="text-primary-light font-semibold hover:underline">
            consulat@ambaguinee-usa.org
          </a>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
// Pas de logique particulière pour cette page
</script>

<style scoped>
.hover\:shadow-2xl {
  transition: all 0.3s ease;
}

/* Animation pour les cartes */
.bg-gradient-to-r {
  transition: height 0.3s ease;
}

/* Style pour les liens téléphone */
a[href^="tel"] {
  transition: color 0.2s ease;
}
</style>
