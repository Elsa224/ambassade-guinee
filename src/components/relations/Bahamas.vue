<template>
  <div class="min-h-screen bg-gray-50">
    <!-- Hero section -->
    <div class="relative bg-gradient-to-r from-accent to-primary-light text-white">
      <div class="absolute inset-0 bg-black/20"></div>
      <div class="relative max-w-7xl mx-auto px-4 py-16 md:py-20">
        <div class="text-center">
          <div class="inline-block bg-white/20 backdrop-blur px-4 py-1 rounded-full text-sm mb-4">
            🤝 Relations bilatérales
          </div>
          <h1 class="text-4xl md:text-5xl font-bold mb-4">Le Commonwealth des Bahamas</h1>
          <p class="text-xl md:text-2xl max-w-3xl mx-auto opacity-90">
            Paradis des Caraïbes, perle du tourisme et des services financiers
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
      <!-- Présentation Générale -->
      <div class="bg-white rounded-2xl shadow-xl p-8 mb-8">
        <h2 class="text-3xl font-bold text-gray-800 mb-6 flex items-center">
          <span class="bg-accent w-1 h-8 mr-3"></span>
          Présentation Générale
        </h2>

        <div class="grid grid-cols-1 lg:grid-cols-3 gap-8">
          <!-- Infos clés -->
          <div class="lg:col-span-1 space-y-6">
            <div class="bg-gradient-to-br from-accent/10 to-primary-light/10 rounded-xl p-6">
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
                      d="M3.055 11H5a2 2 0 012 2v1a2 2 0 002 2 2 2 0 012 2v2.945M8 3.935V5.5A2.5 2.5 0 0010.5 8h.5a2 2 0 012 2 2 2 0 104 0 2 2 0 012-2h1.064M15 20.488V18a2 2 0 012-2h3.064M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
                    ></path>
                  </svg>
                </div>
                <h3 class="font-bold text-lg">Superficie</h3>
              </div>
              <p class="text-gray-700 text-3xl font-bold">13 880 km²</p>
              <p class="text-gray-500">Archipel des Caraïbes</p>
            </div>

            <div class="bg-gradient-to-br from-secondary/10 to-accent/10 rounded-xl p-6">
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
                      d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z"
                    ></path>
                  </svg>
                </div>
                <h3 class="font-bold text-lg">Population</h3>
              </div>
              <p class="text-gray-700 text-3xl font-bold">400 000</p>
              <p class="text-gray-500">(estimation 2024 - Banque mondiale)</p>
            </div>

            <div class="bg-gradient-to-br from-primary-light/10 to-secondary/10 rounded-xl p-6">
              <div class="flex items-center gap-3 mb-4">
                <div class="bg-primary-light p-2 rounded-full">
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
                      d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
                    ></path>
                  </svg>
                </div>
                <h3 class="font-bold text-lg">PIB (2023)</h3>
              </div>
              <p class="text-gray-700 text-3xl font-bold">14,34 milliards $</p>
              <p class="text-gray-500">Une des économies les plus riches des Caraïbes</p>
            </div>
          </div>

          <!-- Description générale -->
          <div class="lg:col-span-2">
            <div class="space-y-4 text-gray-700 leading-relaxed">
              <p>
                Les Bahamas sont un pays des Caraïbes relevant de la
                <span class="font-bold text-accent"
                  >monarchie parlementaire sous le Commonwealth britannique</span
                >, avec un système de gouvernement démocratique.
              </p>
              <div class="bg-blue-50 border-l-4 border-primary-light p-4 rounded-r-xl my-4">
                <div class="flex items-center gap-2">
                  <span class="text-2xl">👑</span>
                  <div>
                    <p class="font-semibold text-gray-800">Système politique</p>
                    <p class="text-gray-700">
                      Chef de l'État : <span class="font-bold">Roi Charles III</span>, représenté
                      par un Gouverneur Général
                    </p>
                    <p class="text-gray-700">
                      Chef du Gouvernement : <span class="font-bold">Premier Ministre</span>
                    </p>
                  </div>
                </div>
              </div>
              <p>
                La capitale des Bahamas est <span class="font-bold">Nassau</span> et l'<span
                  class="font-bold"
                  >anglais</span
                >
                est la langue officielle du pays.
              </p>
              <p>
                La population est essentiellement urbaine avec une densité concentrée dans les
                centres principaux.
              </p>
            </div>
          </div>
        </div>
      </div>

      <!-- Climat et Environnement -->
      <div class="grid grid-cols-1 lg:grid-cols-2 gap-8 mb-8">
        <div class="bg-white rounded-2xl shadow-xl p-8">
          <h3 class="text-xl font-bold text-gray-800 mb-4 flex items-center">
            <span class="bg-secondary w-1 h-6 mr-3"></span>
            🌴 Climat Tropical
          </h3>
          <div class="space-y-4">
            <div class="grid grid-cols-2 gap-3">
              <div class="p-3 bg-gray-50 rounded-lg text-center">
                <span class="font-semibold">Étés</span>
                <p class="text-accent">Chauds et humides</p>
              </div>
              <div class="p-3 bg-gray-50 rounded-lg text-center">
                <span class="font-semibold">Hivers</span>
                <p class="text-primary-light">Doux</p>
              </div>
            </div>
            <div class="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
              <span class="font-semibold">Saison des pluies</span>
              <span class="text-accent">Mai à Octobre</span>
            </div>
            <div class="bg-yellow-50 p-3 rounded-lg">
              <div class="flex items-center gap-2">
                <span class="text-2xl">🌀</span>
                <p class="text-sm">
                  Le pays est <span class="font-bold">vulnérable aux ouragans</span>,
                  particulièrement entre juillet et octobre.
                </p>
              </div>
            </div>
          </div>
        </div>

        <div class="bg-white rounded-2xl shadow-xl p-8">
          <h3 class="text-xl font-bold text-gray-800 mb-4 flex items-center">
            <span class="bg-primary-light w-1 h-6 mr-3"></span>
            🌿 Végétation
          </h3>
          <div class="space-y-3">
            <div class="bg-green-50 p-4 rounded-xl text-center">
              <p class="text-3xl font-bold text-primary-light">51%</p>
              <p class="text-sm text-gray-600">du territoire couvert de forêts</p>
            </div>
            <div class="grid grid-cols-3 gap-2 mt-3">
              <span class="bg-gray-50 px-3 py-2 rounded-lg text-center text-sm">🌴 Palmiers</span>
              <span class="bg-gray-50 px-3 py-2 rounded-lg text-center text-sm">🌲 Pins</span>
              <span class="bg-gray-50 px-3 py-2 rounded-lg text-center text-sm">🌊 Mangroves</span>
            </div>
            <p class="text-sm text-gray-600 mt-2">
              Flore tropicale adaptée aux sols calcaires et au climat maritime.
            </p>
          </div>
        </div>
      </div>

      <!-- Économie et Développement -->
      <div class="bg-white rounded-2xl shadow-xl p-8 mb-8">
        <h2 class="text-2xl font-bold text-gray-800 mb-6 flex items-center">
          <span class="bg-accent w-1 h-6 mr-3"></span>
          💰 Économie et Développement
        </h2>

        <div class="grid grid-cols-1 md:grid-cols-2 gap-8">
          <div>
            <h3 class="font-bold text-lg mb-3">Secteurs économiques clés</h3>
            <div class="space-y-4">
              <div class="bg-gray-50 p-4 rounded-lg">
                <div class="flex justify-between items-center mb-2">
                  <span class="font-semibold">Tourisme</span>
                  <span class="text-2xl font-bold text-accent">50%</span>
                </div>
                <div class="w-full bg-gray-200 rounded-full h-2">
                  <div class="bg-accent h-2 rounded-full" style="width: 50%"></div>
                </div>
                <p class="text-sm text-gray-600 mt-2">du PIB national</p>
              </div>

              <div class="bg-gray-50 p-4 rounded-lg">
                <div class="flex items-center gap-2 mb-2">
                  <span class="font-semibold">Services financiers offshore</span>
                </div>
                <p class="text-sm text-gray-600">Second pilier économique majeur</p>
              </div>
            </div>
          </div>

          <div>
            <h3 class="font-bold text-lg mb-3">Indicateurs sociaux</h3>
            <div class="space-y-4">
              <div class="bg-gray-50 p-4 rounded-lg">
                <div class="flex items-center gap-2 mb-2">
                  <span class="text-xl">📚</span>
                  <span class="font-semibold">Système éducatif</span>
                </div>
                <p>Taux d'alphabétisation élevé</p>
              </div>

              <div class="bg-yellow-50 p-4 rounded-lg">
                <div class="flex items-center gap-2 mb-2">
                  <span class="text-xl">🏥</span>
                  <span class="font-semibold">Système de santé</span>
                </div>
                <p class="text-sm">Défis persistants, notamment pour les îles plus isolées.</p>
              </div>
            </div>
          </div>
        </div>
      </div>

      <!-- Culture et Patrimoine -->
      <div class="bg-gradient-to-r from-accent to-primary-light text-white rounded-2xl p-8 mb-8">
        <h2 class="text-3xl font-bold mb-6 flex items-center">
          <span class="bg-secondary w-1 h-8 mr-3"></span>
          🎭 Culture Bahaméenne
        </h2>

        <div class="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div class="bg-white/10 backdrop-blur rounded-xl p-4 text-center">
            <span class="text-3xl mb-2 block">🌍</span>
            <h3 class="font-bold">Influences</h3>
            <p class="text-sm">Africaines, britanniques et américaines</p>
          </div>

          <div class="bg-white/10 backdrop-blur rounded-xl p-4 text-center">
            <span class="text-3xl mb-2 block">⛪</span>
            <h3 class="font-bold">Religion</h3>
            <p class="text-sm">Majorité chrétiens évangéliques</p>
          </div>

          <div class="bg-white/10 backdrop-blur rounded-xl p-4 text-center">
            <span class="text-3xl mb-2 block">🏝️</span>
            <h3 class="font-bold">Identité</h3>
            <p class="text-sm">Fierté caribéenne et héritage colonial britannique</p>
          </div>
        </div>

        <div class="mt-6 p-4 bg-white/10 backdrop-blur rounded-xl text-center">
          <p class="text-lg">🇧🇸 Un melting-pot culturel unique au cœur des Caraïbes 🇧🇸</p>
        </div>
      </div>

      <!-- Coopération bilatérale -->
      <div class="bg-white rounded-2xl shadow-xl p-8 mb-8">
        <h2 class="text-3xl font-bold text-gray-800 mb-6 flex items-center">
          <span class="bg-primary-light w-1 h-8 mr-3"></span>
          Coopération bilatérale Guinée - Bahamas
        </h2>

        <div class="space-y-6">
          <div class="bg-gray-50 p-6 rounded-xl">
            <div class="flex items-center gap-3 mb-4">
              <div class="bg-primary-light p-2 rounded-full">
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
                    d="M21 12a9 9 0 01-9 9m9-9a9 9 0 00-9-9m9 9H3m9 9a9 9 0 01-9-9m9 9c1.66 0 3-4 3-9s-1.34-9-3-9m0 18c-1.66 0-3-4-3-9s1.34-9 3-9"
                  ></path>
                </svg>
              </div>
              <h3 class="text-xl font-bold text-gray-800">État des relations</h3>
            </div>
            <p class="text-gray-700 text-lg">
              La coopération bilatérale entre la République de Guinée et le Commonwealth des Bahamas
              reste <span class="font-bold text-accent">limitée</span> dans les instances de l'<span
                class="font-bold"
                >Organisation des Nations Unies</span
              >.
            </p>
          </div>

          <div class="bg-blue-50 border-l-4 border-primary-light p-4 rounded-r-xl">
            <div class="flex items-start gap-3">
              <svg
                class="w-6 h-6 text-primary-light flex-shrink-0 mt-1"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  stroke-linecap="round"
                  stroke-linejoin="round"
                  stroke-width="2"
                  d="M3.055 11H5a2 2 0 012 2v1a2 2 0 002 2 2 2 0 012 2v2.945M8 3.935V5.5A2.5 2.5 0 0010.5 8h.5a2 2 0 012 2 2 2 0 104 0 2 2 0 012-2h1.064M15 20.488V18a2 2 0 012-2h3.064M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
                ></path>
              </svg>
              <div>
                <p class="font-semibold text-gray-800">Perspectives de coopération</p>
                <p class="text-gray-700">
                  Des opportunités de renforcement des liens existent, notamment dans les domaines
                  du <span class="font-bold">tourisme</span>, des
                  <span class="font-bold">services financiers</span> et de la
                  <span class="font-bold">coopération multilatérale</span> au sein des Nations
                  Unies.
                </p>
              </div>
            </div>
          </div>

          <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div class="bg-gray-50 rounded-xl p-4 text-center">
              <span class="text-3xl">🇺🇳</span>
              <p class="font-semibold mt-2">Nations Unies</p>
              <p class="text-sm text-gray-600">Principal cadre de coopération</p>
            </div>
            <div class="bg-gray-50 rounded-xl p-4 text-center">
              <span class="text-3xl">🤝</span>
              <p class="font-semibold mt-2">Perspectives</p>
              <p class="text-sm text-gray-600">Renforcement des liens bilatéraux</p>
            </div>
          </div>
        </div>
      </div>

      <!-- Atouts des Bahamas -->
      <div class="bg-gradient-to-r from-accent to-primary-light text-white rounded-2xl p-8">
        <h3 class="text-2xl font-bold mb-6 flex items-center">
          <span class="bg-secondary w-1 h-6 mr-3"></span>
          ✨ Les atouts des Bahamas
        </h3>

        <div class="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div class="bg-white/10 backdrop-blur rounded-xl p-4 text-center">
            <div class="text-3xl mb-2">🏖️</div>
            <h4 class="font-bold">Tourisme de luxe</h4>
            <p class="text-sm">50% du PIB, destination mondiale</p>
          </div>
          <div class="bg-white/10 backdrop-blur rounded-xl p-4 text-center">
            <div class="text-3xl mb-2">💰</div>
            <h4 class="font-bold">Centre financier</h4>
            <p class="text-sm">Services offshore de premier plan</p>
          </div>
          <div class="bg-white/10 backdrop-blur rounded-xl p-4 text-center">
            <div class="text-3xl mb-2">🌴</div>
            <h4 class="font-bold">Biodiversité</h4>
            <p class="text-sm">51% de forêts, écosystème unique</p>
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
/* Animations */
.hover\:scale-105 {
  transition: transform 0.3s ease;
}

.bg-white\/10 {
  backdrop-filter: blur(4px);
}
</style>
