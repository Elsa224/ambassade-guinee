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
          <h1 class="text-4xl md:text-5xl font-bold mb-4">Calendrier des Fêtes Légales</h1>
          <p class="text-xl md:text-2xl max-w-3xl mx-auto opacity-90">
            Jours fériés et commémorations officielles de la République de Guinée
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
      <!-- Année et décret -->
      <div class="bg-white rounded-2xl shadow-lg p-8 mb-8">
        <div class="flex flex-col md:flex-row justify-between items-center gap-6">
          <div class="flex items-center gap-4">
            <div class="bg-accent p-4 rounded-full">
              <svg class="w-8 h-8 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z"></path>
              </svg>
            </div>
            <div>
              <span class="text-sm text-gray-500">Calendrier officiel</span>
              <h2 class="text-4xl font-bold text-accent">2023</h2>
            </div>
          </div>
          <div class="bg-secondary/10 p-4 rounded-xl max-w-2xl">
            <p class="text-sm text-gray-700">
              <span class="font-bold">Conformément au décret D/2022/0526/PRG/CNRD/SGG du 2 novembre 2022</span>,
              modifiant le décret D/250/PRG/SGG du 1er août 1995 concernant les fêtes légales,
              chômées et payées en République de Guinée.
            </p>
          </div>
        </div>
      </div>

      <!-- Grille des calendriers -->
      <div class="grid grid-cols-1 lg:grid-cols-2 gap-8 mb-12">
        <!-- Calendrier principal (liste) -->
        <div class="bg-white rounded-2xl shadow-xl overflow-hidden">
          <div class="bg-gradient-to-r from-accent to-primary-light p-6">
            <h3 class="text-2xl font-bold text-white flex items-center gap-2">
              <svg class="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z"></path>
              </svg>
              Calendrier des fêtes légales 2023
            </h3>
          </div>

          <div class="p-6">
            <!-- Liste des mois -->
            <div class="space-y-4">
              <!-- Janvier -->
              <div class="border-l-4 border-accent pl-4 py-2 hover:bg-gray-50 transition-colors">
                <div class="flex justify-between items-center">
                  <div>
                    <span class="font-bold text-lg">1er janvier</span>
                    <span class="ml-3 text-gray-600">Jour de l'An</span>
                  </div>
                  <span class="bg-accent/10 text-accent px-3 py-1 rounded-full text-sm font-medium">Fête légale</span>
                </div>
              </div>

              <!-- Mars -->
              <div class="border-l-4 border-secondary pl-4 py-2 hover:bg-gray-50 transition-colors">
                <div class="flex justify-between items-center">
                  <div>
                    <span class="font-bold text-lg">20 mars</span>
                    <span class="ml-3 text-gray-600">Anniversaire de l'investiture du Président de la République</span>
                  </div>
                  <span class="bg-secondary/10 text-secondary px-3 py-1 rounded-full text-sm font-medium">Fête nationale</span>
                </div>
              </div>

              <!-- Avril -->
              <div class="border-l-4 border-primary-light pl-4 py-2 hover:bg-gray-50 transition-colors">
                <div class="flex justify-between items-center">
                  <div>
                    <span class="font-bold text-lg">avril</span>
                    <span class="ml-3 text-gray-600">Lundi de Pâques</span>
                  </div>
                  <span class="bg-primary-light/10 text-primary-light px-3 py-1 rounded-full text-sm font-medium">Fête religieuse</span>
                </div>
              </div>

              <!-- Mai -->
              <div class="border-l-4 border-accent pl-4 py-2 hover:bg-gray-50 transition-colors">
                <div class="flex justify-between items-center">
                  <div>
                    <span class="font-bold text-lg">1er mai</span>
                    <span class="ml-3 text-gray-600">Fête du Travail</span>
                  </div>
                  <span class="bg-accent/10 text-accent px-3 py-1 rounded-full text-sm font-medium">Fête légale</span>
                </div>
              </div>

              <div class="border-l-4 border-secondary pl-4 py-2 hover:bg-gray-50 transition-colors">
                <div class="flex justify-between items-center">
                  <div>
                    <span class="font-bold text-lg">mai</span>
                    <span class="ml-3 text-gray-600">Jeudi de l'Ascension</span>
                  </div>
                  <span class="bg-secondary/10 text-secondary px-3 py-1 rounded-full text-sm font-medium">Fête religieuse</span>
                </div>
              </div>

              <div class="border-l-4 border-primary-light pl-4 py-2 hover:bg-gray-50 transition-colors">
                <div class="flex justify-between items-center">
                  <div>
                    <span class="font-bold text-lg">mai</span>
                    <span class="ml-3 text-gray-600">Lundi de Pentecôte</span>
                  </div>
                  <span class="bg-primary-light/10 text-primary-light px-3 py-1 rounded-full text-sm font-medium">Fête religieuse</span>
                </div>
              </div>

              <!-- Juin -->
              <div class="border-l-4 border-accent pl-4 py-2 hover:bg-gray-50 transition-colors">
                <div class="flex justify-between items-center">
                  <div>
                    <span class="font-bold text-lg">juin</span>
                    <span class="ml-3 text-gray-600">Fête de la Tabaski (Aïd el-Kébir)</span>
                  </div>
                  <span class="bg-accent/10 text-accent px-3 py-1 rounded-full text-sm font-medium">Fête musulmane</span>
                </div>
              </div>

              <!-- Août -->
              <div class="border-l-4 border-secondary pl-4 py-2 hover:bg-gray-50 transition-colors">
                <div class="flex justify-between items-center">
                  <div>
                    <span class="font-bold text-lg">15 août</span>
                    <span class="ml-3 text-gray-600">Assomption</span>
                  </div>
                  <span class="bg-secondary/10 text-secondary px-3 py-1 rounded-full text-sm font-medium">Fête religieuse</span>
                </div>
              </div>

              <!-- Septembre -->
              <div class="border-l-4 border-primary-light pl-4 py-2 hover:bg-gray-50 transition-colors">
                <div class="flex justify-between items-center">
                  <div>
                    <span class="font-bold text-lg">septembre</span>
                    <span class="ml-3 text-gray-600">Maouloud (Naissance du Prophète)</span>
                  </div>
                  <span class="bg-primary-light/10 text-primary-light px-3 py-1 rounded-full text-sm font-medium">Fête musulmane</span>
                </div>
              </div>

              <!-- Octobre -->
              <div class="border-l-4 border-accent pl-4 py-2 hover:bg-gray-50 transition-colors">
                <div class="flex justify-between items-center">
                  <div>
                    <span class="font-bold text-lg">2 octobre</span>
                    <span class="ml-3 text-gray-600">Anniversaire de l'Indépendance</span>
                  </div>
                  <span class="bg-accent/10 text-accent px-3 py-1 rounded-full text-sm font-medium">Fête nationale</span>
                </div>
              </div>

              <!-- Novembre -->
              <div class="border-l-4 border-secondary pl-4 py-2 hover:bg-gray-50 transition-colors">
                <div class="flex justify-between items-center">
                  <div>
                    <span class="font-bold text-lg">1er novembre</span>
                    <span class="ml-3 text-gray-600">Toussaint</span>
                  </div>
                  <span class="bg-secondary/10 text-secondary px-3 py-1 rounded-full text-sm font-medium">Fête religieuse</span>
                </div>
              </div>

              <!-- Décembre -->
              <div class="border-l-4 border-primary-light pl-4 py-2 hover:bg-gray-50 transition-colors">
                <div class="flex justify-between items-center">
                  <div>
                    <span class="font-bold text-lg">25 décembre</span>
                    <span class="ml-3 text-gray-600">Noël</span>
                  </div>
                  <span class="bg-primary-light/10 text-primary-light px-3 py-1 rounded-full text-sm font-medium">Fête religieuse</span>
                </div>
              </div>

              <div class="border-l-4 border-accent pl-4 py-2 hover:bg-gray-50 transition-colors">
                <div class="flex justify-between items-center">
                  <div>
                    <span class="font-bold text-lg">décembre</span>
                    <span class="ml-3 text-gray-600">Fête de la Raison (Aïd el-Fitr)</span>
                  </div>
                  <span class="bg-accent/10 text-accent px-3 py-1 rounded-full text-sm font-medium">Fête musulmane</span>
                </div>
              </div>
            </div>

            <!-- Note sur les dates variables -->
            <div class="mt-6 p-4 bg-gray-50 rounded-xl">
              <div class="flex items-start gap-3">
                <svg class="w-5 h-5 text-secondary mt-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"></path>
                </svg>
                <p class="text-sm text-gray-600">
                  <span class="font-bold">Note :</span> Les dates des fêtes religieuses (musulmanes et chrétiennes) sont variables
                  et confirmées chaque année par les autorités religieuses compétentes.
                </p>
              </div>
            </div>
          </div>
        </div>

        <!-- Image du calendrier -->
        <div class="bg-white rounded-2xl shadow-xl overflow-hidden">
          <div class="bg-gradient-to-r from-secondary to-accent p-6">
            <h3 class="text-2xl font-bold text-white flex items-center gap-2">
              <svg class="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z"></path>
              </svg>
              Aperçu du calendrier officiel
            </h3>
          </div>

          <div class="p-6">
            <div class="bg-gray-100 rounded-xl overflow-hidden border border-gray-200">
              <img
                :src="calendrierImage"
                alt="Calendrier des congés et jours fériés 2023"
                class="w-full h-auto object-cover hover:scale-105 transition-transform duration-500"
              >
            </div>

            <!-- Légende -->
            <div class="mt-6 grid grid-cols-2 gap-4">
              <div class="flex items-center gap-2">
                <div class="w-4 h-4 bg-accent rounded"></div>
                <span class="text-sm">Fêtes nationales</span>
              </div>
              <div class="flex items-center gap-2">
                <div class="w-4 h-4 bg-secondary rounded"></div>
                <span class="text-sm">Fêtes religieuses</span>
              </div>
              <div class="flex items-center gap-2">
                <div class="w-4 h-4 bg-primary-light rounded"></div>
                <span class="text-sm">Jours fériés légaux</span>
              </div>
              <div class="flex items-center gap-2">
                <div class="w-4 h-4 bg-gray-400 rounded"></div>
                <span class="text-sm">Week-ends</span>
              </div>
            </div>
          </div>
        </div>
      </div>

      <!-- Tableau récapitulatif -->
      <div class="bg-white rounded-2xl shadow-xl p-8 mb-8">
        <h3 class="text-2xl font-bold text-gray-800 mb-6 flex items-center">
          <span class="bg-accent w-1 h-8 mr-3"></span>
          Récapitulatif des jours fériés 2023
        </h3>

        <div class="overflow-x-auto">
          <table class="w-full">
            <thead class="bg-gray-50">
              <tr>
                <th class="px-4 py-3 text-left text-sm font-semibold text-gray-600">Date</th>
                <th class="px-4 py-3 text-left text-sm font-semibold text-gray-600">Fête</th>
                <th class="px-4 py-3 text-left text-sm font-semibold text-gray-600">Type</th>
              </tr>
            </thead>
            <tbody class="divide-y divide-gray-200">
              <tr class="hover:bg-gray-50">
                <td class="px-4 py-3 font-medium">1er janvier</td>
                <td class="px-4 py-3">Jour de l'An</td>
                <td class="px-4 py-3"><span class="bg-accent/10 text-accent px-2 py-1 rounded-full text-xs">Fête légale</span></td>
              </tr>
              <tr class="hover:bg-gray-50">
                <td class="px-4 py-3 font-medium">20 mars</td>
                <td class="px-4 py-3">Anniversaire de l'investiture du Président</td>
                <td class="px-4 py-3"><span class="bg-secondary/10 text-secondary px-2 py-1 rounded-full text-xs">Fête nationale</span></td>
              </tr>
              <tr class="hover:bg-gray-50">
                <td class="px-4 py-3 font-medium">Variable (avril)</td>
                <td class="px-4 py-3">Lundi de Pâques</td>
                <td class="px-4 py-3"><span class="bg-primary-light/10 text-primary-light px-2 py-1 rounded-full text-xs">Fête religieuse</span></td>
              </tr>
              <tr class="hover:bg-gray-50">
                <td class="px-4 py-3 font-medium">1er mai</td>
                <td class="px-4 py-3">Fête du Travail</td>
                <td class="px-4 py-3"><span class="bg-accent/10 text-accent px-2 py-1 rounded-full text-xs">Fête légale</span></td>
              </tr>
              <tr class="hover:bg-gray-50">
                <td class="px-4 py-3 font-medium">Variable (mai)</td>
                <td class="px-4 py-3">Jeudi de l'Ascension</td>
                <td class="px-4 py-3"><span class="bg-secondary/10 text-secondary px-2 py-1 rounded-full text-xs">Fête religieuse</span></td>
              </tr>
              <tr class="hover:bg-gray-50">
                <td class="px-4 py-3 font-medium">Variable (mai)</td>
                <td class="px-4 py-3">Lundi de Pentecôte</td>
                <td class="px-4 py-3"><span class="bg-primary-light/10 text-primary-light px-2 py-1 rounded-full text-xs">Fête religieuse</span></td>
              </tr>
              <tr class="hover:bg-gray-50">
                <td class="px-4 py-3 font-medium">Variable (juin)</td>
                <td class="px-4 py-3">Tabaski (Aïd el-Kébir)</td>
                <td class="px-4 py-3"><span class="bg-accent/10 text-accent px-2 py-1 rounded-full text-xs">Fête musulmane</span></td>
              </tr>
              <tr class="hover:bg-gray-50">
                <td class="px-4 py-3 font-medium">15 août</td>
                <td class="px-4 py-3">Assomption</td>
                <td class="px-4 py-3"><span class="bg-secondary/10 text-secondary px-2 py-1 rounded-full text-xs">Fête religieuse</span></td>
              </tr>
              <tr class="hover:bg-gray-50">
                <td class="px-4 py-3 font-medium">Variable (septembre)</td>
                <td class="px-4 py-3">Maouloud</td>
                <td class="px-4 py-3"><span class="bg-primary-light/10 text-primary-light px-2 py-1 rounded-full text-xs">Fête musulmane</span></td>
              </tr>
              <tr class="hover:bg-gray-50">
                <td class="px-4 py-3 font-medium">2 octobre</td>
                <td class="px-4 py-3">Anniversaire de l'Indépendance</td>
                <td class="px-4 py-3"><span class="bg-accent/10 text-accent px-2 py-1 rounded-full text-xs">Fête nationale</span></td>
              </tr>
              <tr class="hover:bg-gray-50">
                <td class="px-4 py-3 font-medium">1er novembre</td>
                <td class="px-4 py-3">Toussaint</td>
                <td class="px-4 py-3"><span class="bg-secondary/10 text-secondary px-2 py-1 rounded-full text-xs">Fête religieuse</span></td>
              </tr>
              <tr class="hover:bg-gray-50">
                <td class="px-4 py-3 font-medium">25 décembre</td>
                <td class="px-4 py-3">Noël</td>
                <td class="px-4 py-3"><span class="bg-primary-light/10 text-primary-light px-2 py-1 rounded-full text-xs">Fête religieuse</span></td>
              </tr>
              <tr class="hover:bg-gray-50">
                <td class="px-4 py-3 font-medium">Variable (décembre)</td>
                <td class="px-4 py-3">Fête de la Raison (Aïd el-Fitr)</td>
                <td class="px-4 py-3"><span class="bg-accent/10 text-accent px-2 py-1 rounded-full text-xs">Fête musulmane</span></td>
              </tr>
            </tbody>
          </table>
        </div>
      </div>

      <!-- Téléchargement PDF -->
      <div class="bg-gradient-to-r from-accent to-primary-light text-white rounded-2xl p-8 text-center">
        <h3 class="text-2xl font-bold mb-4">Télécharger le calendrier officiel</h3>
        <p class="mb-6 opacity-90">Calendrier complet des fêtes légales et jours fériés 2023 au format PDF</p>
        <button class="bg-white text-accent px-8 py-3 rounded-full font-semibold hover:bg-gray-100 transition-colors inline-flex items-center gap-2">
          <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 10v6m0 0l-3-3m3 3l3-3m2 8H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"></path>
          </svg>
          Télécharger le PDF
        </button>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref } from 'vue'
import calendrierImage from '@/assets/images/calendrierjoursferiesguinee.jpeg' // Import de l'image du calendrier

// Vous pouvez aussi définir un tableau de données pour les jours fériés
const joursFeries = ref([
  { date: '1er janvier', nom: 'Jour de l\'An', type: 'Fête légale', couleur: 'ce1126' },
  { date: '20 mars', nom: 'Anniversaire de l\'investiture du Président', type: 'Fête nationale', couleur: 'fcd116' },
  { date: 'Variable (avril)', nom: 'Lundi de Pâques', type: 'Fête religieuse', couleur: '009460' },
  { date: '1er mai', nom: 'Fête du Travail', type: 'Fête légale', couleur: 'ce1126' },
  { date: 'Variable (mai)', nom: 'Jeudi de l\'Ascension', type: 'Fête religieuse', couleur: 'fcd116' },
  { date: 'Variable (mai)', nom: 'Lundi de Pentecôte', type: 'Fête religieuse', couleur: '009460' },
  { date: 'Variable (juin)', nom: 'Tabaski (Aïd el-Kébir)', type: 'Fête musulmane', couleur: 'ce1126' },
  { date: '15 août', nom: 'Assomption', type: 'Fête religieuse', couleur: 'fcd116' },
  { date: 'Variable (septembre)', nom: 'Maouloud', type: 'Fête musulmane', couleur: '009460' },
  { date: '2 octobre', nom: 'Anniversaire de l\'Indépendance', type: 'Fête nationale', couleur: 'ce1126' },
  { date: '1er novembre', nom: 'Toussaint', type: 'Fête religieuse', couleur: 'fcd116' },
  { date: '25 décembre', nom: 'Noël', type: 'Fête religieuse', couleur: '009460' },
  { date: 'Variable (décembre)', nom: 'Fête de la Raison (Aïd el-Fitr)', type: 'Fête musulmane', couleur: 'ce1126' }
])
</script>

<style scoped>
.hover\:scale-105 {
  transition: transform 0.5s ease;
}

.border-l-4 {
  transition: all 0.3s ease;
}

.border-l-4:hover {
  transform: translateX(5px);
}

/* Animation pour le tableau */
tbody tr {
  transition: background-color 0.2s ease;
}
</style>
