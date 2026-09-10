<template>
  <div class="min-h-screen bg-gray-50">
    <!-- Hero section -->
    <div class="relative bg-gradient-to-r from-accent to-primary-light text-white">
      <div class="absolute inset-0 bg-black/20"></div>
      <div class="relative max-w-7xl mx-auto px-4 py-16 md:py-20">
        <div class="text-center">
          <div class="inline-block bg-white/20 backdrop-blur px-4 py-1 rounded-full text-sm mb-4">
            🇬🇳 Diplomatie Guinéenne
          </div>
          <h1 class="text-4xl md:text-5xl font-bold mb-4">
            Relations bilatérales et multilatérales
          </h1>
          <p class="text-xl md:text-2xl max-w-3xl mx-auto opacity-90">
            La Guinée dans le monde : coopération internationale et partenariats stratégiques
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
      <!-- Introduction -->
      <div class="bg-white rounded-2xl shadow-xl p-8 mb-12">
        <div class="flex items-center gap-4 mb-6">
          <div class="bg-accent p-3 rounded-full">
            <svg class="w-8 h-8 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path
                stroke-linecap="round"
                stroke-linejoin="round"
                stroke-width="2"
                d="M21 12a9 9 0 01-9 9m9-9a9 9 0 00-9-9m9 9H3m9 9a9 9 0 01-9-9m9 9c1.66 0 3-4 3-9s-1.34-9-3-9m0 18c-1.66 0-3-4-3-9s1.34-9 3-9"
              ></path>
            </svg>
          </div>
          <h2 class="text-3xl font-bold text-gray-800">Coopération internationale de la Guinée</h2>
        </div>
        <p class="text-gray-700 text-lg leading-relaxed">
          La République de Guinée entretient des relations diplomatiques étroites avec de nombreux
          pays et institutions internationales. Notre politique étrangère, guidée par les principes
          de paix, de coopération et de développement mutuel, s'articule autour de partenariats
          stratégiques avec des pays clés et des organisations multilatérales.
        </p>
      </div>

      <!-- Relations bilatérales - Section -->
      <div class="mb-12">
        <h2 class="text-3xl font-bold text-gray-800 mb-8 flex items-center">
          <span class="bg-accent w-1 h-8 mr-3"></span>
          🤝 Relations bilatérales
        </h2>
        <p class="text-gray-600 mb-8">
          La Guinée a établi des relations diplomatiques avec plusieurs pays de notre juridiction,
          notamment :
        </p>

        <!-- Grille des pays -->
        <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          <!-- États-Unis -->
          <router-link to="/usa" class="group">
            <div
              class="bg-white rounded-2xl shadow-lg overflow-hidden hover:shadow-2xl transition-all hover:-translate-y-2"
            >
              <div class="h-2 bg-gradient-to-r from-accent to-primary-light"></div>
              <div class="p-6">
                <div class="text-5xl mb-4">🇺🇸</div>
                <h3
                  class="text-xl font-bold text-gray-800 mb-2 group-hover:text-accent transition-colors"
                >
                  États-Unis d'Amérique
                </h3>
                <p class="text-gray-600 text-sm mb-3">Depuis 1959</p>
                <p class="text-gray-500 text-xs">
                  Partenariat stratégique, coopération économique et sécuritaire
                </p>
                <div
                  class="mt-4 text-accent text-sm font-semibold flex items-center gap-1 group-hover:gap-2 transition-all"
                >
                  En savoir plus <span>→</span>
                </div>
              </div>
            </div>
          </router-link>

          <!-- Costa Rica -->
          <router-link to="/costa-rica" class="group">
            <div
              class="bg-white rounded-2xl shadow-lg overflow-hidden hover:shadow-2xl transition-all hover:-translate-y-2"
            >
              <div class="h-2 bg-gradient-to-r from-accent to-secondary"></div>
              <div class="p-6">
                <div class="text-5xl mb-4">🇨🇷</div>
                <h3
                  class="text-xl font-bold text-gray-800 mb-2 group-hover:text-accent transition-colors"
                >
                  Costa Rica
                </h3>
                <p class="text-gray-600 text-sm mb-3">Accréditation 2024</p>
                <p class="text-gray-500 text-xs">
                  Coopération environnementale, touristique et agricole
                </p>
                <div
                  class="mt-4 text-accent text-sm font-semibold flex items-center gap-1 group-hover:gap-2 transition-all"
                >
                  En savoir plus <span>→</span>
                </div>
              </div>
            </div>
          </router-link>

          <!-- Haïti -->
          <router-link to="/haiti" class="group">
            <div
              class="bg-white rounded-2xl shadow-lg overflow-hidden hover:shadow-2xl transition-all hover:-translate-y-2"
            >
              <div class="h-2 bg-gradient-to-r from-primary-light to-secondary"></div>
              <div class="p-6">
                <div class="text-5xl mb-4">🇭🇹</div>
                <h3
                  class="text-xl font-bold text-gray-800 mb-2 group-hover:text-accent transition-colors"
                >
                  Haïti
                </h3>
                <p class="text-gray-600 text-sm mb-3">Coopération multilatérale</p>
                <p class="text-gray-500 text-xs">
                  Engagement guinéen pour la stabilité, coopération à l'OIF et à l'ONU
                </p>
                <div
                  class="mt-4 text-accent text-sm font-semibold flex items-center gap-1 group-hover:gap-2 transition-all"
                >
                  En savoir plus <span>→</span>
                </div>
              </div>
            </div>
          </router-link>

          <!-- Bahamas -->
          <router-link to="/bahamas" class="group">
            <div
              class="bg-white rounded-2xl shadow-lg overflow-hidden hover:shadow-2xl transition-all hover:-translate-y-2"
            >
              <div class="h-2 bg-gradient-to-r from-secondary to-primary-light"></div>
              <div class="p-6">
                <div class="text-5xl mb-4">🇧🇸</div>
                <h3
                  class="text-xl font-bold text-gray-800 mb-2 group-hover:text-accent transition-colors"
                >
                  Bahamas
                </h3>
                <p class="text-gray-600 text-sm mb-3">Commonwealth britannique</p>
                <p class="text-gray-500 text-xs">
                  Coopération limitée à l'ONU, opportunités de développement
                </p>
                <div
                  class="mt-4 text-accent text-sm font-semibold flex items-center gap-1 group-hover:gap-2 transition-all"
                >
                  En savoir plus <span>→</span>
                </div>
              </div>
            </div>
          </router-link>
        </div>
      </div>

      <!-- Relations multilatérales - Section -->
      <div class="mb-12">
        <h2 class="text-3xl font-bold text-gray-800 mb-8 flex items-center">
          <span class="bg-primary-light w-1 h-8 mr-3"></span>
          🌍 Relations multilatérales
        </h2>
        <p class="text-gray-600 mb-8">
          La Guinée participe activement aux travaux des institutions internationales et entretient
          des relations étroites avec les organisations suivantes :
        </p>

        <div class="grid grid-cols-1 md:grid-cols-2 gap-8">
          <!-- Institutions de Bretton Woods -->
          <router-link to="/fond-monetaire" class="group">
            <div
              class="bg-white rounded-2xl shadow-lg overflow-hidden hover:shadow-2xl transition-all hover:-translate-y-2"
            >
              <div class="h-2 bg-gradient-to-r from-accent to-secondary"></div>
              <div class="p-6">
                <div class="flex items-center gap-4 mb-4">
                  <div class="text-4xl">🏦</div>
                  <h3
                    class="text-xl font-bold text-gray-800 group-hover:text-accent transition-colors"
                  >
                    Institutions de Bretton Woods
                  </h3>
                </div>
                <div class="grid grid-cols-2 gap-3 mb-4">
                  <div class="bg-gray-50 p-3 rounded-lg text-center">
                    <p class="font-bold text-accent">FMI</p>
                    <p class="text-xs">Appui technique et financier</p>
                  </div>
                  <div class="bg-gray-50 p-3 rounded-lg text-center">
                    <p class="font-bold text-primary-light">Banque Mondiale</p>
                    <p class="text-xs">907M$ d'engagements</p>
                  </div>
                </div>
                <div
                  class="mt-4 text-accent text-sm font-semibold flex items-center gap-1 group-hover:gap-2 transition-all"
                >
                  Découvrir la coopération <span>→</span>
                </div>
              </div>
            </div>
          </router-link>

          <!-- Autres organisations -->
          <div
            class="bg-gradient-to-r from-accent to-primary-light text-white rounded-2xl shadow-lg p-6"
          >
            <div class="flex items-center gap-4 mb-6">
              <div class="text-4xl">🇺🇳</div>
              <h3 class="text-2xl font-bold">Organisations internationales</h3>
            </div>
            <div class="space-y-3">
              <div class="bg-white/10 backdrop-blur rounded-lg p-3">
                <p class="font-semibold">Organisation des Nations Unies (ONU)</p>
                <p class="text-sm opacity-90">Membre actif, participation aux missions de paix</p>
              </div>
              <div class="bg-white/10 backdrop-blur rounded-lg p-3">
                <p class="font-semibold">Organisation Internationale de la Francophonie (OIF)</p>
                <p class="text-sm opacity-90">Coopération culturelle et linguistique</p>
              </div>
              <div class="bg-white/10 backdrop-blur rounded-lg p-3">
                <p class="font-semibold">Union Africaine (UA)</p>
                <p class="text-sm opacity-90">Intégration et développement continental</p>
              </div>
              <div class="bg-white/10 backdrop-blur rounded-lg p-3">
                <p class="font-semibold">CEDEAO</p>
                <p class="text-sm opacity-90">Intégration économique régionale</p>
              </div>
            </div>
          </div>
        </div>
      </div>

      <!-- Chiffres clés de la coopération -->
      <div class="bg-white rounded-2xl shadow-xl p-8 mb-12">
        <h2 class="text-2xl font-bold text-gray-800 mb-6 flex items-center">
          <span class="bg-secondary w-1 h-6 mr-3"></span>
          📊 Chiffres clés de la coopération
        </h2>

        <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          <div class="text-center p-4 bg-gray-50 rounded-xl">
            <div class="text-3xl font-bold text-accent">1959</div>
            <p class="text-sm text-gray-600">Établissement des relations Guinée-USA</p>
          </div>
          <div class="text-center p-4 bg-gray-50 rounded-xl">
            <div class="text-3xl font-bold text-accent">2024</div>
            <p class="text-sm text-gray-600">Accréditation au Costa Rica</p>
          </div>
          <div class="text-center p-4 bg-gray-50 rounded-xl">
            <div class="text-3xl font-bold text-accent">907M$</div>
            <p class="text-sm text-gray-600">Engagements Banque Mondiale</p>
          </div>
          <div class="text-center p-4 bg-gray-50 rounded-xl">
            <div class="text-3xl font-bold text-accent">1Md$</div>
            <p class="text-sm text-gray-600">Aide américaine (2024)</p>
          </div>
        </div>
      </div>

      <!-- Perspectives et coopération future -->
      <div class="bg-gradient-to-r from-accent to-primary-light text-white rounded-2xl p-8">
        <h3 class="text-2xl font-bold mb-4 flex items-center">
          <span class="bg-secondary w-1 h-6 mr-3"></span>
          🚀 Perspectives de coopération
        </h3>
        <div class="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div class="bg-white/10 backdrop-blur rounded-xl p-4">
            <span class="text-2xl block mb-2">🌱</span>
            <p class="font-semibold">Environnement</p>
            <p class="text-sm opacity-90">Coopération avec le Costa Rica</p>
          </div>
          <div class="bg-white/10 backdrop-blur rounded-xl p-4">
            <span class="text-2xl block mb-2">🕊️</span>
            <p class="font-semibold">Maintien de la paix</p>
            <p class="text-sm opacity-90">Engagement en Haïti</p>
          </div>
          <div class="bg-white/10 backdrop-blur rounded-xl p-4">
            <span class="text-2xl block mb-2">💼</span>
            <p class="font-semibold">Investissements</p>
            <p class="text-sm opacity-90">Guide d'investissement USA-Chamber</p>
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
.group:hover .group-hover\:gap-2 {
  gap: 0.5rem;
}

.hover\:-translate-y-2 {
  transition: transform 0.3s ease;
}
</style>
