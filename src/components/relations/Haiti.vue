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
          <h1 class="text-4xl md:text-5xl font-bold mb-4">La République d'Haïti</h1>
          <p class="text-xl md:text-2xl max-w-3xl mx-auto opacity-90">
            Premier pays indépendant des Caraïbes, riche d'un patrimoine culturel unique
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
                  <svg class="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M3.055 11H5a2 2 0 012 2v1a2 2 0 002 2 2 2 0 012 2v2.945M8 3.935V5.5A2.5 2.5 0 0010.5 8h.5a2 2 0 012 2 2 2 0 104 0 2 2 0 012-2h1.064M15 20.488V18a2 2 0 012-2h3.064M21 12a9 9 0 11-18 0 9 9 0 0118 0z"></path>
                  </svg>
                </div>
                <h3 class="font-bold text-lg">Superficie</h3>
              </div>
              <p class="text-gray-700 text-3xl font-bold">27 750 km²</p>
              <p class="text-gray-500">3ème pays de notre juridiction</p>
            </div>

            <div class="bg-gradient-to-br from-secondary/10 to-accent/10 rounded-xl p-6">
              <div class="flex items-center gap-3 mb-4">
                <div class="bg-secondary p-2 rounded-full">
                  <svg class="w-6 h-6 text-gray-800" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z"></path>
                  </svg>
                </div>
                <h3 class="font-bold text-lg">Population</h3>
              </div>
              <p class="text-gray-700 text-3xl font-bold">11 millions</p>
              <p class="text-gray-500">396 habitants/km²</p>
            </div>

            <div class="bg-gradient-to-br from-primary-light/10 to-secondary/10 rounded-xl p-6">
              <div class="flex items-center gap-3 mb-4">
                <div class="bg-primary-light p-2 rounded-full">
                  <svg class="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z"></path>
                  </svg>
                </div>
                <h3 class="font-bold text-lg">PIB (2023)</h3>
              </div>
              <p class="text-gray-700 text-3xl font-bold">38,18 milliards $</p>
              <p class="text-gray-500">Banque mondiale</p>
            </div>
          </div>

          <!-- Description générale -->
          <div class="lg:col-span-2">
            <div class="space-y-4 text-gray-700 leading-relaxed">
              <p>
                La République d'Haïti est le <span class="font-bold text-accent">troisième plus grand pays de notre juridiction</span>. Située dans les Caraïbes, elle est le premier pays indépendant d'Amérique latine et des Caraïbes.
              </p>
              <div class="bg-red-50 border-l-4 border-accent p-4 rounded-r-xl my-4">
                <p class="font-semibold text-gray-800">⚠️ Situation actuelle</p>
                <p class="text-gray-700">Haïti traverse actuellement une période de transition et est confrontée à une insécurité provoquée par les gangs. Les Nations Unies ont déployé une force multinationale dirigée par le Kenya pour soutenir la police nationale.</p>
              </div>
              <p>
                La capitale d'Haïti est <span class="font-bold">Port-au-Prince</span> et les langues officielles sont le <span class="font-bold">français</span> et le <span class="font-bold">créole</span> (parlé par la majorité de la population).
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
            🌤️ Climat et Saisons
          </h3>
          <div class="space-y-3">
            <div class="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
              <span class="font-semibold">Saison humide</span>
              <span class="text-primary-light">Avril à Novembre</span>
            </div>
            <div class="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
              <span class="font-semibold">Saison sèche</span>
              <span class="text-accent">Décembre à Mars</span>
            </div>
            <div class="bg-yellow-50 p-3 rounded-lg mt-3">
              <div class="flex items-center gap-2">
                <span class="text-2xl">🌀</span>
                <p class="text-sm">Le pays est régulièrement exposé aux <span class="font-bold">ouragans</span>, qui causent des dégâts importants.</p>
              </div>
            </div>
          </div>
        </div>

        <div class="bg-white rounded-2xl shadow-xl p-8">
          <h3 class="text-xl font-bold text-gray-800 mb-4 flex items-center">
            <span class="bg-primary-light w-1 h-6 mr-3"></span>
            🌳 Végétation et Environnement
          </h3>
          <p class="text-gray-700 mb-3">
            La végétation est constituée de zones montagneuses, de vallées, de plaines côtières et de rivières.
          </p>
          <div class="bg-orange-50 p-4 rounded-xl">
            <div class="flex items-center gap-2">
              <span class="text-2xl">⚠️</span>
              <p class="text-sm text-gray-700">
                Menacée par une <span class="font-bold">déforestation massive</span> en raison de l'exploitation des ressources forestières pour la production de charbon de bois.
              </p>
            </div>
          </div>
        </div>
      </div>

      <!-- Situation Économique et Sociale -->
      <div class="bg-white rounded-2xl shadow-xl p-8 mb-8">
        <h2 class="text-2xl font-bold text-gray-800 mb-6 flex items-center">
          <span class="bg-accent w-1 h-6 mr-3"></span>
          Situation Économique et Sociale
        </h2>

        <div class="grid grid-cols-1 md:grid-cols-2 gap-8">
          <div>
            <h3 class="font-bold text-lg mb-3">📊 Économie</h3>
            <div class="bg-gray-50 p-4 rounded-lg mb-4">
              <p class="text-center text-2xl font-bold text-accent">Plus pauvre du continent</p>
              <p class="text-center text-sm text-gray-600">Haïti est l'un des pays les plus pauvres du continent américain</p>
            </div>
            <div class="space-y-2">
              <div class="flex items-center gap-2">
                <span class="w-2 h-2 bg-accent rounded-full"></span>
                <span>Économie repose essentiellement sur l'<span class="font-bold">agriculture</span></span>
              </div>
              <div class="flex items-center gap-2">
                <span class="w-2 h-2 bg-secondary rounded-full"></span>
                <span>Services publics limités</span>
              </div>
              <div class="flex items-center gap-2">
                <span class="w-2 h-2 bg-primary-light rounded-full"></span>
                <span>Inégalités sociales très prononcées</span>
              </div>
            </div>
          </div>

          <div>
            <h3 class="font-bold text-lg mb-3">👥 Conditions de vie</h3>
            <div class="space-y-4">
              <div class="bg-gray-50 p-4 rounded-lg">
                <div class="flex justify-between mb-2">
                  <span class="text-sm">Taux de chômage</span>
                  <span class="font-bold text-accent">Élevé</span>
                </div>
                <p class="text-sm text-gray-600">
                  De nombreuses familles dépendent des <span class="font-bold">remises d'argent</span> envoyées par la diaspora haïtienne établie aux États-Unis, au Canada et dans les Caraïbes.
                </p>
              </div>
              <div class="bg-blue-50 p-4 rounded-lg">
                <div class="flex items-start gap-2">
                  <svg class="w-5 h-5 text-accent mt-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"></path>
                  </svg>
                  <p class="text-sm">
                    <span class="font-bold">Conditions précaires</span> : faible accès aux services de santé, d'éducation et insécurité généralisée.
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      <!-- Culture et Patrimoine -->
      <div class="bg-gradient-to-r from-accent to-primary-light text-white rounded-2xl p-8 mb-8">
        <h2 class="text-3xl font-bold mb-6 flex items-center">
          <span class="bg-secondary w-1 h-8 mr-3"></span>
          🎨 Richesse Culturelle
        </h2>

        <div class="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div>
            <h3 class="font-bold text-xl mb-3">Influences culturelles</h3>
            <div class="space-y-2">
              <div class="flex items-center gap-2">
                <span class="text-secondary">✓</span>
                <span>Traditions africaines</span>
              </div>
              <div class="flex items-center gap-2">
                <span class="text-secondary">✓</span>
                <span>Héritage européen</span>
              </div>
              <div class="flex items-center gap-2">
                <span class="text-secondary">✓</span>
                <span>Influences indigènes</span>
              </div>
            </div>
          </div>

          <div>
            <h3 class="font-bold text-xl mb-3">Expressions artistiques</h3>
            <div class="grid grid-cols-2 gap-2">
              <span class="bg-white/20 px-3 py-1 rounded-full text-sm text-center">Musique (Compas, Rara)</span>
              <span class="bg-white/20 px-3 py-1 rounded-full text-sm text-center">Danses traditionnelles</span>
              <span class="bg-white/20 px-3 py-1 rounded-full text-sm text-center">Littérature</span>
              <span class="bg-white/20 px-3 py-1 rounded-full text-sm text-center">Peinture haïtienne</span>
            </div>
          </div>
        </div>

        <div class="mt-6 p-4 bg-white/10 backdrop-blur rounded-xl">
          <div class="flex items-center gap-3">
            <span class="text-3xl">⛪</span>
            <div>
              <p class="font-bold">Religions pratiquées</p>
              <p>Le vaudou et le catholicisme jouent un rôle important dans la culture haïtienne.</p>
            </div>
          </div>
        </div>
      </div>

      <!-- Coopération bilatérale -->
      <div class="bg-white rounded-2xl shadow-xl p-8 mb-8">
        <h2 class="text-3xl font-bold text-gray-800 mb-6 flex items-center">
          <span class="bg-primary-light w-1 h-8 mr-3"></span>
          Coopération bilatérale Guinée - Haïti
        </h2>

        <div class="space-y-6">
          <div class="bg-gray-50 p-6 rounded-xl">
            <p class="text-gray-700 mb-4">
              La coopération bilatérale entre la République de Guinée et la République d'Haïti n'a pas évolué depuis l'établissement des relations diplomatiques entre les deux pays.
            </p>
          </div>

          <div class="bg-gradient-to-r from-accent/10 to-primary-light/10 rounded-xl p-6">
            <div class="flex items-center gap-4 mb-4">
              <div class="bg-accent p-3 rounded-full">
                <svg class="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z"></path>
                </svg>
              </div>
              <div>
                <p class="text-sm text-gray-600">Annonce historique</p>
                <p class="text-xl font-bold text-accent">2024 - Tribune des Nations Unies</p>
              </div>
            </div>
            <p class="text-gray-700">
              Monsieur <span class="font-bold">Amadou Oury BAH</span>, Premier Ministre, Chef du Gouvernement, a annoncé la prédisposition de la Guinée de <span class="font-bold text-accent">déployer des agents de sécurité en Haïti</span> dans le cadre de la Mission multinationale des Nations Unies dans le pays.
            </p>
          </div>

          <div class="bg-blue-50 border-l-4 border-primary-light p-4 rounded-r-xl">
            <div class="flex items-start gap-3">
              <svg class="w-6 h-6 text-primary-light flex-shrink-0 mt-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M3.055 11H5a2 2 0 012 2v1a2 2 0 002 2 2 2 0 012 2v2.945M8 3.935V5.5A2.5 2.5 0 0010.5 8h.5a2 2 0 012 2 2 2 0 104 0 2 2 0 012-2h1.064M15 20.488V18a2 2 0 012-2h3.064M21 12a9 9 0 11-18 0 9 9 0 0118 0z"></path>
              </svg>
              <div>
                <p class="font-semibold text-gray-800">Coopération multilatérale</p>
                <p class="text-gray-700">
                  La coopération entre Haïti et la Guinée est limitée au sein des instances internationales, notamment à l'<span class="font-bold">Organisation Internationale de la Francophonie</span> et à l'<span class="font-bold">Organisation des Nations Unies</span>.
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>

      <!-- Forces multilatérales -->
      <div class="bg-gradient-to-r from-accent to-primary-light text-white rounded-2xl p-8">
        <h3 class="text-2xl font-bold mb-4 flex items-center">
          <span class="bg-secondary w-1 h-6 mr-3"></span>
          🇺🇳 Mission multinationale en Haïti
        </h3>
        <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div class="bg-white/10 backdrop-blur rounded-xl p-4">
            <p class="font-bold">Force multinationale</p>
            <p>Dirigée par le Kenya pour soutenir la police nationale haïtienne</p>
          </div>
          <div class="bg-white/10 backdrop-blur rounded-xl p-4">
            <p class="font-bold">Engagement guinéen</p>
            <p>Prédisposition annoncée par le Premier ministre Amadou Oury BAH en 2024</p>
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
