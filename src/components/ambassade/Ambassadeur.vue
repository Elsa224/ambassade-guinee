<template>
  <div class="min-h-screen bg-gray-50">
 <!-- Hero section avec photo de l'ambassadeur -->
<div class="relative bg-gradient-to-r from-accent to-primary-light text-white">
  <div class="absolute inset-0 bg-black/20"></div>
  <div class="relative max-w-7xl mx-auto px-4 py-16 md:py-24">
    <div class="flex flex-col md:flex-row items-center gap-8 md:gap-12">
      <!-- Photo de l'ambassadeur (agrandie) -->
      <div class="relative flex-shrink-0">
        <div class="w-56 h-56 md:w-80 md:h-80 rounded-full border-4 border-white shadow-2xl overflow-hidden bg-gray-200">
          <img
            :src="ambassadeurPhoto"
            :alt="`Chargé d'affaires ${ambassadeur.nom}`"
            class="w-full h-full object-cover object-center hover:scale-110 transition-transform duration-500"
          />
        </div>
        <div class="absolute -bottom-2 -right-2 bg-secondary text-gray-800 px-4 py-2 rounded-full font-bold shadow-lg text-sm">
          Chargé d'affaires a.i.
        </div>
      </div>

      <!-- Titre et fonction (inchangé) -->
      <div class="text-center md:text-left">
        <div class="inline-block bg-white/20 backdrop-blur px-4 py-1 rounded-full text-sm mb-4">
          🇬🇳 Ambassade de Guinée aux États-Unis
        </div>
        <h1 class="text-4xl md:text-5xl font-bold mb-3">
          {{ ambassadeur.nom }}
        </h1>
        <p class="text-2xl md:text-3xl mb-4 text-secondary font-semibold">
          Chargé d'affaires a.i.
        </p>
        <p class="text-xl opacity-90">
          près les États-Unis d'Amérique
        </p>
        <div class="flex flex-wrap gap-4 mt-6 justify-center md:justify-start">
          <span class="bg-white/20 px-4 py-2 rounded-full text-sm flex items-center gap-2">
            <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M21 13.255A23.931 23.931 0 0112 15c-3.183 0-6.22-.62-9-1.745M16 6V4a2 2 0 00-2-2h-4a2 2 0 00-2 2v2m4 6h.01M5 20h14a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z"></path>
            </svg>
            Ingénieur et Diplomate
          </span>
          <span class="bg-white/20 px-4 py-2 rounded-full text-sm flex items-center gap-2">
            <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z"></path>
            </svg>
            En poste depuis 2024
          </span>
        </div>
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
      <!-- Badge de présentation -->
      <div class="bg-gradient-to-r from-secondary to-accent text-white rounded-2xl p-6 mb-12 shadow-xl">
        <div class="flex items-center gap-4">
          <div class="bg-white/20 p-3 rounded-full">
            <svg class="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 6v6m0 0v6m0-6h6m-6 0H6"></path>
            </svg>
          </div>
          <p class="text-lg md:text-xl font-semibold">
            🎯 Un diplomate de haut rang, fort d'une double compétence d'ingénieur et de manager, au service de la Guinée aux États-Unis.
          </p>
        </div>
      </div>

      <!-- Grille principale -->
      <div class="grid grid-cols-1 lg:grid-cols-3 gap-8">
        <!-- Colonne principale (bio détaillée) -->
        <div class="lg:col-span-2 space-y-8">
          <!-- Section biographie -->
          <div class="bg-white rounded-2xl shadow-lg p-8">
            <h2 class="text-3xl font-bold text-gray-800 mb-6 flex items-center">
              <span class="bg-accent w-1 h-8 mr-3"></span>
              Biographie
            </h2>

            <div class="prose prose-lg max-w-none">
              <div class="flex items-center gap-3 bg-gray-50 p-4 rounded-xl mb-6">
                <span class="text-2xl">📍</span>
                <span class="text-gray-700"><strong>Né à Mamou</strong>, en République de Guinée</span>
              </div>

              <h3 class="text-xl font-bold text-accent mb-3">Formation</h3>
              <div class="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
                <div class="bg-gray-50 p-4 rounded-lg border-l-4 border-secondary">
                  <p class="font-semibold">📚 Ingénieur d'État</p>
                  <p class="text-gray-600">Génie Électrique – École Mohammedia d'Ingénieurs (EMI), Rabat, Maroc (2004)</p>
                </div>
                <div class="bg-gray-50 p-4 rounded-lg border-l-4 border-primary-light">
                  <p class="font-semibold">📊 Master</p>
                  <p class="text-gray-600">Management et Administration des Entreprises – Université Pierre Mendes de Grenoble, France</p>
                </div>
              </div>

              <h3 class="text-xl font-bold text-accent mb-3">Carrière diplomatique</h3>
              <p class="text-gray-700 mb-4">
                Fort d'une solide expérience dans les secteurs public et privé, M. Ibrahima N'Daïry Diallo a été nommé <span class="font-bold text-accent">Conseiller Ministre</span> puis <span class="font-bold text-primary-light">Chargé d'affaires a.i.</span> à l'Ambassade de Guinée à Washington D.C.[reference:4]. C'est à ce titre qu'il représente aujourd'hui la Guinée aux États-Unis.
              </p>

              <h3 class="text-xl font-bold text-accent mb-3">Parcours professionnel</h3>
              <div class="space-y-3">
                <div class="flex items-start gap-3">
                  <span class="text-accent font-bold">2024</span>
                  <span>Nomination en tant que Chargé d'affaires a.i. près les États-Unis</span>
                </div>
                <div class="flex items-start gap-3">
                  <span class="text-secondary font-bold">2022-2024</span>
                  <span>Directeur Général de la SNCFG (Société Nationale des Chemins de Fer de Guinée)</span>
                </div>
                <div class="flex items-start gap-3">
                  <span class="text-primary-light font-bold">2015-2022</span>
                  <span>Directeur des Systèmes d'Information d'EDG S.A, Assistant du Ministre du Budget, Conseiller Économique et Financier</span>
                </div>
                <div class="flex items-start gap-3">
                  <span class="text-accent font-bold">2004-2015</span>
                  <span>Ingénieur en conception de circuits intégrés chez STMicroelectronics et Texas Instruments (Maroc, France)</span>
                </div>
              </div>
            </div>
          </div>

          <!-- Distinctions -->
          <div class="bg-gradient-to-br from-gray-900 to-gray-800 text-white rounded-2xl shadow-lg p-8">
            <h2 class="text-3xl font-bold mb-6 flex items-center">
              <span class="bg-secondary w-1 h-8 mr-3"></span>
              Distinctions et Décorations
            </h2>

            <div class="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div class="flex items-center gap-4">
                <div class="bg-secondary p-3 rounded-full">
                  <svg class="w-6 h-6 text-gray-800" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M5 3v4M3 5h4M6 17v4m-2-2h4m5-16l2.286 6.857L21 12l-5.714 2.143L13 21l-2.286-6.857L5 12l5.714-2.143L13 3z"></path>
                  </svg>
                </div>
                <div>
                  <p class="font-semibold">Médaille d'Or</p>
                  <p class="text-sm text-gray-300">Festival du Mérite du Ministère Marocain de l'Enseignement Supérieur</p>
                </div>
              </div>

              <div class="flex items-center gap-4">
                <div class="bg-primary-light p-3 rounded-full">
                  <svg class="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z"></path>
                  </svg>
                </div>
                <div>
                  <p class="font-semibold">Félicitations Royales</p>
                  <p class="text-sm text-gray-300">Du Roi Mohammed VI du Maroc (2004)</p>
                </div>
              </div>
            </div>
          </div>
        </div>

        <!-- Sidebar (infos personnelles et compétences) -->
        <div class="space-y-6">
          <!-- Carte d'identité -->
          <div class="bg-white rounded-2xl shadow-lg p-6">
            <h3 class="text-xl font-bold text-gray-800 mb-4 pb-2 border-b-2 border-accent">
              Informations personnelles
            </h3>

            <div class="space-y-4">
              <div>
                <p class="text-sm text-gray-500">Nom complet</p>
                <p class="font-semibold">Ibrahima N'Daïry Diallo</p>
              </div>

              <div>
                <p class="text-sm text-gray-500">Lieu de naissance</p>
                <p class="font-semibold">Mamou, République de Guinée</p>
              </div>

              <div>
                <p class="text-sm text-gray-500">Langues parlées</p>
                <div class="flex gap-2 mt-1">
                  <span class="bg-accent/10 text-accent px-3 py-1 rounded-full text-sm font-medium">Français</span>
                  <span class="bg-primary-light/10 text-primary-light px-3 py-1 rounded-full text-sm font-medium">Anglais</span>
                  <span class="bg-secondary/20 text-gray-800 px-3 py-1 rounded-full text-sm font-medium">Arabe</span>
                </div>
              </div>
            </div>
          </div>

          <!-- Expertise -->
          <div class="bg-white rounded-2xl shadow-lg p-6">
            <h3 class="text-xl font-bold text-gray-800 mb-4 pb-2 border-b-2 border-secondary">
              Domaines d'expertise
            </h3>

            <div class="space-y-3">
              <div class="flex items-center gap-2">
                <span class="w-2 h-2 bg-accent rounded-full"></span>
                <span>Diplomatie et Relations Internationales</span>
              </div>
              <div class="flex items-center gap-2">
                <span class="w-2 h-2 bg-secondary rounded-full"></span>
                <span>Management et Administration</span>
              </div>
              <div class="flex items-center gap-2">
                <span class="w-2 h-2 bg-primary-light rounded-full"></span>
                <span>Gestion de Projets et Stratégie</span>
              </div>
              <div class="flex items-center gap-2">
                <span class="w-2 h-2 bg-accent rounded-full"></span>
                <span>Négociation et Plaidoyer</span>
              </div>
            </div>
          </div>

          <!-- Organisations internationales -->
          <div class="bg-gradient-to-br from-accent to-accent-deep text-white rounded-2xl shadow-lg p-6">
            <h3 class="text-xl font-bold mb-4">Représentations</h3>

            <div class="space-y-4">
              <div class="flex items-center gap-3">
                <div class="w-10 h-10 bg-white/20 rounded-full flex items-center justify-center">
                  <span class="text-lg">🇺🇳</span>
                </div>
                <div>
                  <p class="font-semibold">Nations Unies</p>
                  <p class="text-sm opacity-90">Représentant de la Guinée</p>
                </div>
              </div>

              <div class="flex items-center gap-3">
                <div class="w-10 h-10 bg-white/20 rounded-full flex items-center justify-center">
                  <span class="text-lg">🌍</span>
                </div>
                <div>
                  <p class="font-semibold">Union Africaine</p>
                  <p class="text-sm opacity-90">Participation active aux sommets</p>
                </div>
              </div>
            </div>
          </div>

          <!-- Lien vers liste des ambassadeurs -->
          <router-link
            to="/ambassade/anciens-ambassadeurs"
            class="block bg-gray-100 hover:bg-gray-200 rounded-2xl p-6 text-center transition-colors group"
          >
            <svg class="w-12 h-12 mx-auto text-accent mb-3 group-hover:scale-110 transition-transform" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z"></path>
            </svg>
            <h4 class="font-bold text-gray-800 text-lg mb-1">Liste des Ambassadeurs</h4>
            <p class="text-sm text-gray-600">aux États-Unis d'Amérique</p>
            <span class="text-accent font-semibold mt-2 inline-block group-hover:translate-x-2 transition-transform">
              Voir la liste →
            </span>
          </router-link>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref } from 'vue'
import ambassadeurPhoto from '@/assets/images/ambassadeur.webp' // Assurez-vous que le chemin est correct

// Données de l'ambassadeur
const ambassadeur = ref({
  nom: "Ibrahima N'Daïry Diallo",
  titre: "Chargé d'affaires a.i."
})
</script>

<style scoped>
/* Styles pour les animations */
.hover\:scale-110 {
  transition: transform 0.3s ease;
}

.group:hover .group-hover\:translate-x-2 {
  transform: translateX(0.5rem);
}

/* Style pour la timeline */
.border-l-4 {
  transition: all 0.3s ease;
}

/* Animation pour les badges */
.bg-white\/20 {
  backdrop-filter: blur(4px);
}
</style>
