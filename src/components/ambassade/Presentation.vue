<template>
  <div class="min-h-screen bg-gray-50">
    <!-- Hero Section avec image de fond et dégradé -->
    <div class="relative h-[500px] bg-cover bg-center" :style="{ backgroundImage: 'url(https://images.unsplash.com/photo-1574457545171-cb9a5e4f3b7a?w=1400)' }">
      <div class="absolute inset-0 bg-gradient-to-r from-accent/90 to-primary-light/80"></div>
      <div class="absolute inset-0 bg-black/30"></div>

      <div class="relative h-full max-w-7xl mx-auto px-4 flex flex-col justify-center items-center text-center text-white">
        <div class="flex gap-4 mb-6">
          <div class="w-20 h-20 bg-white/20 backdrop-blur rounded-full flex items-center justify-center">
            <img :src="logo1" alt="Logo" class="h-12 w-auto">
          </div>
          <div class="w-20 h-20 bg-white/20 backdrop-blur rounded-full flex items-center justify-center">
            <img :src="logoSimandou" alt="Simandou" class="h-12 w-auto">
          </div>
        </div>
        <h1 class="text-5xl md:text-6xl font-bold mb-4">Ambassade de la République de Guinée</h1>
        <p class="text-xl md:text-2xl mb-8 max-w-3xl">aux États-Unis d'Amérique - Washington DC</p>
        <div class="flex gap-4">
          <div class="w-16 h-1 bg-accent"></div>
          <div class="w-16 h-1 bg-secondary"></div>
          <div class="w-16 h-1 bg-primary-light"></div>
        </div>
      </div>

      <!-- Wave en bas du hero -->
      <div class="absolute bottom-0 left-0 right-0">
        <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 1440 120" class="w-full h-auto">
          <path fill="#f3f4f6" fill-opacity="1" d="M0,64L80,69.3C160,75,320,85,480,80C640,75,800,53,960,48C1120,43,1280,53,1360,58.7L1440,64L1440,120L1360,120C1280,120,1120,120,960,120C800,120,640,120,480,120C320,120,160,120,80,120L0,120Z"></path>
        </svg>
      </div>
    </div>

    <!-- Contenu principal -->
    <div class="max-w-7xl mx-auto px-4 py-12">
      <!-- Section adresse et informations -->
      <div class="bg-white rounded-2xl shadow-xl p-8 mb-12 -mt-20 relative z-10">
        <div class="grid grid-cols-1 md:grid-cols-2 gap-8">
          <div class="flex items-start gap-4">
            <div class="bg-accent p-4 rounded-full">
              <svg class="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z"></path>
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 11a3 3 0 11-6 0 3 3 0 016 0z"></path>
              </svg>
            </div>
            <div>
              <h3 class="text-xl font-bold text-gray-800 mb-2">Notre adresse</h3>
              <p class="text-gray-600 text-lg">2112 Leroy Place, NW</p>
              <p class="text-gray-600">Washington, DC, 20008</p>
              <a href="#" class="text-accent hover:underline mt-2 inline-block">Voir sur Google Maps →</a>
            </div>
          </div>

          <div class="flex items-start gap-4">
            <div class="bg-primary-light p-4 rounded-full">
              <svg class="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M3.055 11H5a2 2 0 012 2v1a2 2 0 002 2 2 2 0 012 2v2.945M8 3.935V5.5A2.5 2.5 0 0010.5 8h.5a2 2 0 012 2 2 2 0 104 0 2 2 0 012-2h1.064M15 20.488V18a2 2 0 012-2h3.064M21 12a9 9 0 11-18 0 9 9 0 0118 0z"></path>
              </svg>
            </div>
            <div>
              <h3 class="text-xl font-bold text-gray-800 mb-2">Juridiction</h3>
              <p class="text-gray-600">États-Unis, Costa-Rica, Haïti, Bahamas</p>
              <p class="text-gray-600 text-sm mt-1">+ Institutions Internationales (BM, FMI)</p>
            </div>
          </div>
        </div>
      </div>

      <!-- Section présentation -->
      <div class="grid grid-cols-1 lg:grid-cols-3 gap-8 mb-16">
        <div class="lg:col-span-2">
          <h2 class="text-3xl font-bold text-gray-800 mb-6 flex items-center">
            <span class="bg-secondary w-1 h-8 mr-3"></span>
            Présentation de l'Ambassade
          </h2>

          <div class="prose prose-lg max-w-none">
            <p class="text-gray-700 leading-relaxed mb-4">
              <span class="font-bold text-accent">L'Ambassade de la République de Guinée aux États-Unis</span> est la représentation diplomatique de la Guinée auprès des États-Unis d'Amérique. Établie depuis 1959, un an après l'accession de notre pays à l'indépendance, elle incarne les relations étroites et durables entre nos deux nations.
            </p>

            <p class="text-gray-700 leading-relaxed mb-4">
              Située au cœur de la capitale américaine, l'Ambassade de la République de Guinée à Washington, DC est l'une des 1818 représentations étrangères aux États-Unis et l'une des 186 représentations étrangères à Washington, D.C.
            </p>

            <div class="bg-gray-50 p-6 rounded-xl border-l-4 border-secondary my-6">
              <p class="text-gray-700 italic">
                "La République de Guinée et les États-Unis entretiennent d'étroites relations bilatérales, ce, depuis 1959, un an après l'accession de notre pays à l'indépendance."
              </p>
            </div>
          </div>
        </div>

        <!-- Carte des pays sous juridiction -->
        <div class="bg-gradient-to-br from-accent to-accent-deep text-white rounded-2xl p-6 shadow-xl">
          <h3 class="text-xl font-bold mb-4 flex items-center gap-2">
            <svg class="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M3.055 11H5a2 2 0 012 2v1a2 2 0 002 2 2 2 0 012 2v2.945M8 3.935V5.5A2.5 2.5 0 0010.5 8h.5a2 2 0 012 2 2 2 0 104 0 2 2 0 012-2h1.064M15 20.488V18a2 2 0 012-2h3.064M21 12a9 9 0 11-18 0 9 9 0 0118 0z"></path>
            </svg>
            Notre Juridiction
          </h3>
          <ul class="space-y-3 mb-6">
            <li class="flex items-center gap-2">
              <span class="w-2 h-2 bg-secondary rounded-full"></span>
              <span>États-Unis d'Amérique</span>
            </li>
            <li class="flex items-center gap-2">
              <span class="w-2 h-2 bg-secondary rounded-full"></span>
              <span>République du Costa-Rica</span>
            </li>
            <li class="flex items-center gap-2">
              <span class="w-2 h-2 bg-secondary rounded-full"></span>
              <span>République d'Haïti</span>
            </li>
            <li class="flex items-center gap-2">
              <span class="w-2 h-2 bg-secondary rounded-full"></span>
              <span>Commonwealth des Bahamas</span>
            </li>
          </ul>

          <div class="border-t border-white/20 pt-4">
            <h4 class="font-semibold mb-2">Institutions Internationales</h4>
            <p class="text-sm opacity-90">Banque Mondiale • Fonds Monétaire International</p>
          </div>
        </div>
      </div>

      <!-- Notre Mission -->
      <div class="mb-16">
        <h2 class="text-3xl font-bold text-gray-800 mb-6 flex items-center">
          <span class="bg-primary-light w-1 h-8 mr-3"></span>
          Notre Mission
        </h2>

        <p class="text-gray-700 text-lg mb-8 max-w-4xl">
          L'Ambassade de la République de Guinée aux États-Unis est constituée d'une équipe de diplomates qui a pour mission de suivre l'évolution politique, économique et sociale, ainsi que la politique extérieure des États-Unis.
        </p>

        <!-- 4 piliers de la mission -->
        <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-12">
          <div class="bg-white p-6 rounded-xl shadow-lg hover:shadow-xl transition-shadow border-t-4 border-accent">
            <div class="bg-accent/10 w-16 h-16 rounded-full flex items-center justify-center mb-4">
              <svg class="w-8 h-8 text-accent" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z"></path>
              </svg>
            </div>
            <h3 class="text-xl font-bold text-gray-800 mb-2">Représenter</h3>
            <p class="text-gray-600">L'ambassade représente la République de Guinée aux États-Unis d'Amérique et facilite les relations entre les deux pays.</p>
          </div>

          <div class="bg-white p-6 rounded-xl shadow-lg hover:shadow-xl transition-shadow border-t-4 border-secondary">
            <div class="bg-secondary/10 w-16 h-16 rounded-full flex items-center justify-center mb-4">
              <svg class="w-8 h-8 text-secondary" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"></path>
              </svg>
            </div>
            <h3 class="text-xl font-bold text-gray-800 mb-2">Informer</h3>
            <p class="text-gray-600">Elle informe les autorités publiques Guinéennes sur l'environnement politique, économique et social des États-Unis.</p>
          </div>

          <div class="bg-white p-6 rounded-xl shadow-lg hover:shadow-xl transition-shadow border-t-4 border-primary-light">
            <div class="bg-primary-light/10 w-16 h-16 rounded-full flex items-center justify-center mb-4">
              <svg class="w-8 h-8 text-primary-light" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M8 7h12m0 0l-4-4m4 4l-4 4m0 6H4m0 0l4 4m-4-4l4-4"></path>
              </svg>
            </div>
            <h3 class="text-xl font-bold text-gray-800 mb-2">Négocier</h3>
            <p class="text-gray-600">Sur instructions du Gouvernement Guinéen, elle négocie les traités et accords bilatéraux.</p>
          </div>

          <div class="bg-white p-6 rounded-xl shadow-lg hover:shadow-xl transition-shadow border-t-4 border-accent">
            <div class="bg-accent/10 w-16 h-16 rounded-full flex items-center justify-center mb-4">
              <svg class="w-8 h-8 text-accent" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z"></path>
              </svg>
            </div>
            <h3 class="text-xl font-bold text-gray-800 mb-2">Protéger</h3>
            <p class="text-gray-600">Elle protège les ressortissants Guinéens établis dans sa juridiction, en étroite collaboration avec le Consulat.</p>
          </div>
        </div>

        <p class="text-gray-700 text-lg border-l-4 border-secondary pl-6 py-2 bg-gray-50 rounded-r-lg">
          L'Ambassade de la République de Guinée aux États-Unis représente la Guinée auprès des Organisations Internationales comme la Banque Mondiale et le Fonds Monétaire International.
        </p>
      </div>

      <!-- Chiffres clés -->
      <div class="bg-gradient-to-r from-accent to-primary-light text-white rounded-2xl p-8 mb-16">
        <h3 class="text-2xl font-bold text-center mb-8">L'Ambassade en chiffres</h3>
        <div class="grid grid-cols-2 md:grid-cols-4 gap-6 text-center">
          <div>
            <div class="text-4xl font-bold mb-2">1959</div>
            <p class="text-sm opacity-90">Année d'établissement</p>
          </div>
          <div>
            <div class="text-4xl font-bold mb-2">1818</div>
            <p class="text-sm opacity-90">Représentations étrangères aux USA</p>
          </div>
          <div>
            <div class="text-4xl font-bold mb-2">186</div>
            <p class="text-sm opacity-90">Ambassades à Washington DC</p>
          </div>
          <div>
            <div class="text-4xl font-bold mb-2">4</div>
            <p class="text-sm opacity-90">Pays sous juridiction</p>
          </div>
        </div>
      </div>

      <!-- Section institutions internationales -->
      <div class="bg-white rounded-2xl shadow-lg p-8">
        <h3 class="text-2xl font-bold text-gray-800 mb-6 flex items-center">
          <span class="bg-secondary w-1 h-8 mr-3"></span>
          Représentation auprès des Institutions Internationales
        </h3>

        <div class="grid grid-cols-1 md:grid-cols-2 gap-8">
          <div class="flex items-center gap-4 p-4 bg-gray-50 rounded-xl">
            <div class="bg-accent p-3 rounded-full">
              <svg class="w-8 h-8 text-white" viewBox="0 0 24 24" fill="currentColor">
                <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm-1 14H9V8h2v8zm4 0h-2V8h2v8z"/>
              </svg>
            </div>
            <div>
              <h4 class="font-bold text-lg">Banque Mondiale</h4>
              <p class="text-gray-600">Coopération économique et financière</p>
            </div>
          </div>

          <div class="flex items-center gap-4 p-4 bg-gray-50 rounded-xl">
            <div class="bg-primary-light p-3 rounded-full">
              <svg class="w-8 h-8 text-white" viewBox="0 0 24 24" fill="currentColor">
                <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm1 15h-2v-2h2v2zm0-4h-2V7h2v6z"/>
              </svg>
            </div>
            <div>
              <h4 class="font-bold text-lg">Fonds Monétaire International</h4>
              <p class="text-gray-600">Politiques monétaires et financières</p>
            </div>
          </div>
        </div>
      </div>
    </div>

    <!-- Call to action contact -->
    <div class="bg-gray-900 text-white py-16 mt-16">
      <div class="max-w-7xl mx-auto px-4 text-center">
        <h3 class="text-3xl font-bold mb-4">Besoin d'informations ?</h3>
        <p class="text-xl mb-8 text-gray-300">Notre équipe diplomatique est à votre disposition</p>
        <div class="flex flex-col sm:flex-row gap-4 justify-center">
          <router-link to="/contact" class="bg-accent text-white px-8 py-3 rounded-full font-semibold hover:bg-accent-dark transition-colors inline-flex items-center gap-2">
            <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z"></path>
            </svg>
            Nous contacter
          </router-link>
          <router-link to="/services" class="bg-transparent border-2 border-white text-white px-8 py-3 rounded-full font-semibold hover:bg-white hover:text-gray-900 transition-colors">
            Nos services consulaires
          </router-link>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref } from 'vue'
import logo1 from '@/assets/images/logo.png'
import logoSimandou from '@/assets/images/masque.png'

// Données pour les stats (optionnel, pour animation plus tard)
const stats = ref([
  { nombre: 1959, label: "Année d'établissement" },
  { nombre: 1818, label: "Représentations étrangères aux USA" },
  { nombre: 186, label: "Ambassades à Washington DC" },
  { nombre: 4, label: "Pays sous juridiction" }
])
</script>

<style scoped>
/* Styles pour les animations si besoin */
.hover\:shadow-xl {
  transition: all 0.3s ease;
}

/* Dégradé personnalisé */
.bg-gradient-hero {
  background: linear-gradient(135deg, var(--color-accent) 0%, var(--color-accent-deep) 50%, var(--color-primary-light) 100%);
}

/* Animation pour les cartes */
.rotate-hover:hover {
  transform: rotate(1deg);
}

/* Style pour la police */
.prose p {
  margin-bottom: 1.2rem;
}
</style>
