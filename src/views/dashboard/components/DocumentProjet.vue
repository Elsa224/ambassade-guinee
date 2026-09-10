<template>
  <div class="min-h-screen bg-gray-50 p-6">
    <div class="max-w-4xl mx-auto bg-white rounded-lg shadow-lg">
      <!-- En-tête du document -->
      <div class="border-b border-gray-200 p-6 flex items-center justify-between">
        <div>
          <h1 class="text-3xl font-bold text-gray-900 mb-2">Liste des Projets</h1>
          <p class="text-gray-600 mb-4">Aperçu du Document</p>
        </div>
        <div class="flex items-center gap-2">
          <!-- Bouton Retour dynamique -->
          <button
            @click="goBack"
            class="px-4 py-2 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50 transition-colors"
          >
            ← Retour à la liste des projets
          </button>
          <!-- Bouton Télécharger -->
          <button
            class="px-4 py-2 bg-primary text-white rounded-lg hover:bg-primary-dark transition-colors"
          >
            Télécharger
          </button>
        </div>
      </div>

      <!-- Contenu du document -->
      <div class="p-6 space-y-8">
        <!-- Section TANARES -->
        <div>
          <h2 class="text-xl font-bold text-gray-900 mb-4 border-b pb-2">TANARES</h2>
          <div class="overflow-x-auto">
            <table class="min-w-full border border-gray-300">
              <thead class="bg-gray-50">
                <tr>
                  <th class="border border-gray-300 px-4 py-2 text-left font-medium">Date</th>
                  <th class="border border-gray-300 px-4 py-2 text-left font-medium">Compagné</th>
                </tr>
              </thead>
              <tbody>
                <tr v-for="(item, index) in tanaresDates" :key="index">
                  <td class="border border-gray-300 px-4 py-2">{{ item.date }}</td>
                  <td class="border border-gray-300 px-4 py-2">{{ item.company }}</td>
                </tr>
              </tbody>
            </table>
          </div>
        </div>

        <!-- Informations supplémentaires -->
        <div class="grid grid-cols-2 gap-8">
          <div class="space-y-6">
            <div>
              <h3 class="font-semibold text-gray-900 mb-2">DATE</h3>
              <p class="text-gray-700">10/10/2025</p>
            </div>
            <div>
              <h3 class="font-semibold text-gray-900 mb-2">CAHIER DE CHARGE</h3>
              <p class="text-gray-700">10M100325A</p>
            </div>
          </div>

          <div>
            <h3 class="font-semibold text-gray-900 mb-2">SCB SYSTEMS</h3>
            <div class="text-gray-700 space-y-1">
              <p>4809 Bennington Place E, Jefferson, MD 21755</p>
              <p>+1571-524-0144</p>
              <p>admin@sclosystems.org</p>
            </div>
          </div>
        </div>

        <!-- Introduction -->
        <div>
          <h3 class="text-lg font-bold text-gray-900 mb-4">Introduction</h3>
          <div class="text-gray-700 space-y-4">
            <p>
              Nous avons été choisis pour réaliser le TANARES de l'AIGF (Agence Ivoirienne de Gestion des Fréquences).
              Le TANARES est le Tableau National de Répartition des Spectres et Fréquences de l'Agence Ivoirienne de Gestion des Fréquences.
            </p>
            <p>
              Les ondes radioélectriques utilisent le spectre électromagnétique. Aux fréquences les plus basses correspondent
              les ondes radio les plus longues et aux fréquences les plus élevées, les ondes radio les plus courtes.
              Les ondes radio se caractérisent par leur fréquence, qui se mesure en hertz (Hz).
              La fréquence est déterminée par le nombre d'ondes complète franchissant un point fixe d'un support en une seconde.
              On dira donc d'un signal pour lequel une onde franchit un point fixe en une seconde qu'il a une fréquence de : hertz.
              Le kilohertz (kHz) équivaut à 1 000 ondes par seconde, soit 1 000 hertz, le mégâhertz, à 1 000 kilohertz et
            </p>
          </div>
        </div>
      </div>

      <!-- Pied de page -->
      <div class="border-t border-gray-200 p-6 text-center text-gray-500 text-sm">
        Document généré le {{ currentDate }} | SCB Systems
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref } from 'vue'
import { useRouter } from 'vue-router'

const router = useRouter()

const currentDate = ref(new Date().toLocaleDateString('fr-FR'))

const tanaresDates = ref([
  { date: '27/10/2025', company: 'SCB' },
  { date: '23/10/2025', company: 'SCB' },
  { date: '23/10/2025', company: 'SCB' },
  { date: '23/10/2025', company: 'SCB' },
  { date: '17/10/2025', company: 'SCB' }
])

// Bouton dynamique pour retourner à la liste
const goBack = () => router.push({ name: 'ProjectList' })
</script>
