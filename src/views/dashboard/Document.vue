<template>
  <div class="min-h-screen bg-gray-100 p-6">
    <div class="max-w-7xl mx-auto">
      <!-- Header -->
      <div class="flex flex-col md:flex-row items-center justify-between mb-6 gap-4">
        <h2 class="text-2xl md:text-3xl font-bold flex items-center gap-2">Liste des Documents</h2>
        <button
          @click="showAdd = true"
          class="bg-primary text-white px-5 py-2 rounded-lg shadow hover:bg-primary-dark transition flex items-center gap-2"
        >
          <span class="text-xl font-bold">+</span> Soumettre un document
        </button>
      </div>

      <!-- Search -->
      <div class="mb-4">
        <input
          v-model="search"
          type="text"
          placeholder=" Rechercher par titre, entreprise, statut"
          class="w-full md:w-1/2 px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary outline-none"
        />
      </div>

      <!-- Table -->
      <div class="bg-white shadow-md rounded-lg overflow-x-auto">
        <table class="w-full border-collapse text-sm">
          <thead class="bg-primary text-white uppercase">
            <tr>
              <th class="p-3 text-left">Date Emission</th>
              <th class="p-3 text-left">Compagnie</th>
              <th class="p-3 text-left">Emetteur</th>
              <th class="p-3 text-left">Titre</th>
              <th class="p-3 text-left">Status Superviseur</th>
              <th class="p-3 text-left">Date Approbation</th>
              <th class="p-3 text-left">Approuvé par</th>
              <th class="p-3 text-left">Status Approbation</th>
              <th class="p-3 text-center">Aperçu</th>
              <th class="p-3 text-center">Éditer</th>
            </tr>
          </thead>
          <tbody>
            <tr
              v-for="(doc, index) in filteredDocs"
              :key="index"
              class="even:bg-gray-100 odd:bg-gray-200 hover:bg-gray-200 transition-colors cursor-pointer"
            >
              <td class="p-3">{{ doc.dateEmission }}</td>
              <td class="p-3 font-semibold">{{ doc.compagnie }}</td>
              <td class="p-3">{{ doc.emetteur }}</td>
              <td class="p-3">{{ doc.titre }}</td>
              <td class="p-3" v-html="doc.statusSuperviseur"></td>
              <td class="p-3">{{ doc.dateApprobation }}</td>
              <td class="p-3">{{ doc.approuvePar }}</td>
              <td class="p-3" v-html="doc.statusApprobation"></td>
              <td class="p-3 text-center">
                <button
                  @click="showPreview = true"
                  class="text-gray-500 hover:text-ink text-lg transition"
                >
                  📎
                </button>
              </td>
              <td class="p-3 text-center">
                <button
                  @click="showEdit = true"
                  class="text-gray-500 hover:text-yellow-600 text-lg transition"
                >
                  ✏️
                </button>
              </td>
            </tr>
          </tbody>
        </table>
      </div>
    </div>

    <!-- Preview Modal -->
    <div
      v-if="showPreview"
      class="fixed inset-0 flex items-center justify-center bg-black/60 backdrop-blur-sm z-50 p-4"
    >
      <div
        class="bg-white rounded-2xl w-full max-w-4xl shadow-2xl relative overflow-hidden border border-gray-100 max-h-[90vh] overflow-y-auto"
      >
        <!-- En-tête avec dégradé -->
        <div class="bg-primary p-6 text-white sticky top-0 z-10">
          <div class="flex justify-between items-center">
            <div class="flex items-center gap-3">
              <div class="w-10 h-10 bg-white/20 rounded-lg flex items-center justify-center">
                <span class="text-lg">📄</span>
              </div>
              <div>
                <h3 class="text-xl font-bold">Aperçu du Document</h3>
                <p class="text-green-100 text-sm mt-1">Visualisation du document sélectionné</p>
              </div>
            </div>
            <button
              @click="showPreview = false"
              class="w-8 h-8 bg-white/20 hover:bg-white/30 rounded-full flex items-center justify-center transition-all duration-300 hover:scale-110"
            >
              <span class="text-white text-lg font-bold">✖</span>
            </button>
          </div>
        </div>

        <!-- Contenu du document -->
        <div class="p-8">
          <!-- En-tête document -->
          <div class="text-center mb-8">
            <div class="flex justify-center mb-4">
              <div class="bg-primary p-3 rounded-lg">
                <!-- Maquette de bulletin : l'entete portait le logo Orange
                     charge depuis Wikimedia. Le texte evite cette requete
                     externe en attendant le logo fourni par l'ambassade. -->
                <span class="text-white font-bold text-xl tracking-wide">Orange</span>
              </div>
            </div>
            <h1 class="text-3xl font-bold text-gray-800 mb-2">PAIEMENT DE SALAIRE</h1>
            <div class="w-20 h-1 bg-primary mx-auto"></div>
          </div>

          <!-- Section Comment -->
          <div class="mb-8">
            <h2 class="text-xl font-semibold text-gray-700 mb-4 border-b pb-2">Comment</h2>
            <div class="bg-gray-50 rounded-lg p-4">
              <div class="flex justify-between items-center mb-2">
                <span class="font-medium">ScB</span>
                <span class="text-primary font-semibold">1 sur 12</span>
              </div>
              <div class="space-y-2 text-sm text-gray-600">
                <div class="flex justify-between">
                  <span>SCB</span>
                  <span>2.0mm automatique</span>
                </div>
                <div class="flex justify-between">
                  <span>SCB</span>
                  <span>3.0mm automatique</span>
                </div>
                <div class="flex justify-between">
                  <span>SCB</span>
                  <span>4.0mm automatique</span>
                </div>
              </div>
            </div>
          </div>

          <!-- Section Statut et Métadonnées -->
          <div class="grid md:grid-cols-2 gap-6 mb-8">
            <div class="bg-green-50 rounded-xl p-4 border border-green-200">
              <h3 class="font-semibold text-green-800 mb-2">Statut du document</h3>
              <div class="flex items-center gap-2">
                <div class="w-3 h-3 bg-green-500 rounded-full"></div>
                <span class="text-green-700 font-medium">Validé</span>
              </div>
              <p class="text-sm text-green-600 mt-2">Date de création 02/09/2019</p>
            </div>

            <div class="bg-primary/10 rounded-xl p-4 border border-primary/20">
              <h3 class="font-semibold text-primary mb-2">OMCUT technique</h3>
              <p class="text-primary">SPECIFICATIONS API</p>
            </div>
          </div>

          <!-- Section Index -->
          <div class="mb-8">
            <h3 class="font-semibold text-gray-700 mb-3">INDEX :</h3>
            <div class="bg-gray-50 rounded-lg p-4">
              <span class="text-gray-700 font-medium">CCH</span>
            </div>
          </div>

          <!-- Section Éditeur -->
          <div class="bg-primary/10 rounded-xl p-4 border border-primary/20 mb-8">
            <h3 class="font-semibold text-primary mb-3">Éditeur</h3>
            <div class="flex gap-3">
              <button
                class="bg-primary text-white px-4 py-2 rounded-lg hover:bg-primary-dark transition-colors text-sm font-medium"
              >
                Approuver
              </button>
              <button
                class="bg-gray-500 text-white px-4 py-2 rounded-lg hover:bg-gray-600 transition-colors text-sm font-medium"
              >
                Éditer
              </button>
            </div>
          </div>

          <!-- Section Spécifications -->
          <div class="bg-primary/10 rounded-xl p-4 border border-primary/20">
            <h3 class="font-semibold text-primary mb-3">SPECIFICATIONS API</h3>
            <div class="text-primary">
              <p class="text-sm">Document technique contenant les spécifications détaillées...</p>
            </div>
          </div>
        </div>

        <!-- Actions principales -->
        <div class="bg-gray-50 px-6 py-4 border-t border-gray-200 sticky bottom-0">
          <div class="flex flex-col sm:flex-row justify-between items-center gap-4">
            <button
              @click="showPreview = false"
              class="flex items-center gap-2 text-gray-600 hover:text-gray-800 font-medium transition-all duration-300 hover:gap-3 px-6 py-3 rounded-lg hover:bg-gray-200 border border-gray-300"
            >
              <span>←</span>
              Retour à la liste
            </button>
            <div class="flex gap-3">
              <button
                @click="showPreview = false"
                class="bg-gradient-to-r from-red-500 to-red-600 text-white px-8 py-3 rounded-xl hover:from-red-600 hover:to-red-700 transition-all duration-300 shadow-lg hover:shadow-xl font-semibold flex items-center gap-2"
              >
                <span>✕</span>
                Annuler
              </button>
              <button
                @click="showPreview = false"
                class="bg-gradient-to-r from-primary to-primary-dark text-white px-8 py-3 rounded-xl hover:from-primary-dark hover:to-primary-dark transition-all duration-300 shadow-lg hover:shadow-xl font-semibold flex items-center gap-2"
              >
                <span>✓</span>
                Approuver le document
              </button>
            </div>
          </div>
        </div>

        <!-- Effet de brillance -->
        <div class="absolute top-0 left-0 w-full h-1 bg-primary"></div>
      </div>
    </div>

    <!-- Edit Modal -->
    <div v-if="showEdit" class="fixed inset-0 flex items-center justify-center bg-black/40 z-50">
      <div class="bg-white rounded-xl w-[90%] md:w-[60%] p-8 shadow-lg relative">
        <h3 class="text-2xl font-bold mb-6 text-center text-primary">✏️ Éditer un document</h3>
        <form class="space-y-6">
          <div class="grid md:grid-cols-2 gap-4">
            <div>
              <label class="font-semibold text-primary">Entreprise destinataire :</label>
              <input
                type="text"
                placeholder="Ex: SCB"
                class="w-full border rounded-lg px-3 py-2 mt-1 outline-none focus:ring-2 focus:ring-primary"
              />
            </div>
            <div>
              <label class="font-semibold text-primary">Titre :</label>
              <input
                type="text"
                placeholder="Permission RE"
                class="w-full border rounded-lg px-3 py-2 mt-1 outline-none focus:ring-2 focus:ring-primary"
              />
            </div>
          </div>
          <div>
            <label class="font-semibold text-primary">Document :</label>
            <input type="file" class="w-full border rounded-lg px-3 py-2 mt-1" />
          </div>
          <div>
            <label class="font-semibold text-primary">Description :</label>
            <textarea
              rows="3"
              placeholder="Permission"
              class="w-full border rounded-lg px-3 py-2 mt-1 outline-none focus:ring-2 focus:ring-primary"
            ></textarea>
          </div>
          <div class="flex justify-between gap-4">
            <button
              @click="showEdit = false"
              type="button"
              class="bg-gray-300 text-gray-700 px-6 py-2 rounded-lg hover:bg-gray-400 transition"
            >
              ← Retour à la liste
            </button>
            <div class="flex gap-2">
              <button
                type="button"
                @click="showEdit = false"
                class="bg-red-500 text-white px-6 py-2 rounded-lg hover:bg-red-600 transition"
              >
                Annuler
              </button>
              <button
                type="submit"
                class="bg-primary text-white px-6 py-2 rounded-lg hover:bg-primary-dark transition"
              >
                Soumettre
              </button>
            </div>
          </div>
        </form>
      </div>
    </div>

    <!-- Add Modal -->
    <div v-if="showAdd" class="fixed inset-0 flex items-center justify-center bg-black/40 z-50">
      <div class="bg-white rounded-xl w-[90%] md:w-[60%] p-8 shadow-lg relative">
        <h3 class="text-2xl font-bold mb-6 text-center text-primary">📝 Soumettre un document</h3>
        <form class="space-y-6" @submit.prevent="addDocument">
          <div class="grid md:grid-cols-2 gap-4">
            <div>
              <label class="font-semibold text-primary">Entreprise destinataire :</label>
              <input
                v-model="newDoc.compagnie"
                type="text"
                placeholder="Ex: SCB"
                class="w-full border rounded-lg px-3 py-2 mt-1 outline-none focus:ring-2 focus:ring-primary"
              />
            </div>
            <div>
              <label class="font-semibold text-primary">Titre :</label>
              <input
                v-model="newDoc.titre"
                type="text"
                placeholder="Permission RE"
                class="w-full border rounded-lg px-3 py-2 mt-1 outline-none focus:ring-2 focus:ring-primary"
              />
            </div>
          </div>
          <div>
            <label class="font-semibold text-primary">Document :</label>
            <input type="file" class="w-full border rounded-lg px-3 py-2 mt-1" />
          </div>
          <div>
            <label class="font-semibold text-primary">Description :</label>
            <textarea
              v-model="newDoc.description"
              rows="3"
              placeholder="Permission"
              class="w-full border rounded-lg px-3 py-2 mt-1 outline-none focus:ring-2 focus:ring-primary"
            ></textarea>
          </div>
          <div class="flex justify-between gap-4">
            <button
              @click="showAdd = false"
              type="button"
              class="bg-gray-300 text-gray-700 px-6 py-2 rounded-lg hover:bg-gray-400 transition"
            >
              ← Retour à la liste
            </button>
            <div class="flex gap-2">
              <button
                type="button"
                @click="showAdd = false"
                class="bg-red-500 text-white px-6 py-2 rounded-lg hover:bg-red-600 transition"
              >
                Annuler
              </button>
              <button
                type="submit"
                class="bg-primary text-white px-6 py-2 rounded-lg hover:bg-primary-dark transition"
              >
                Soumettre
              </button>
            </div>
          </div>
        </form>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, computed } from 'vue'

const showAdd = ref(false)
const showPreview = ref(false)
const showEdit = ref(false)
const search = ref('')

const documents = ref([
  {
    dateEmission: '22/10/2025',
    compagnie: 'SCB',
    emetteur: 'Front Desk',
    titre: 'Permission RE',
    statusSuperviseur: '✅ Validé',
    dateApprobation: '22/10/2025',
    approuvePar: 'DG Manager',
    statusApprobation: '✅ Validé',
  },
  {
    dateEmission: '22/10/2025',
    compagnie: 'SCB',
    emetteur: 'Front Desk',
    titre: 'Permission',
    statusSuperviseur: '⏳ En attente',
    dateApprobation: '22/10/2025',
    approuvePar: 'DG Manager',
    statusApprobation: '✅ Validé',
  },
  {
    dateEmission: '22/10/2025',
    compagnie: 'SCB',
    emetteur: 'Employee Admin',
    titre: 'Demande de congés annuels',
    statusSuperviseur: '✅ Validé',
    dateApprobation: '22/10/2025',
    approuvePar: 'Employee Admin',
    statusApprobation: '❌ Refusé',
  },
])

const newDoc = ref({ compagnie: '', titre: '', description: '' })

const addDocument = () => {
  documents.value.push({
    dateEmission: new Date().toLocaleDateString(),
    compagnie: newDoc.value.compagnie,
    emetteur: 'Utilisateur',
    titre: newDoc.value.titre,
    statusSuperviseur: '⏳ En attente',
    dateApprobation: '-',
    approuvePar: '-',
    statusApprobation: '⏳ En attente',
  })
  newDoc.value = { compagnie: '', titre: '', description: '' }
  showAdd.value = false
}

const filteredDocs = computed(() => {
  return documents.value.filter((d) =>
    Object.values(d).some((val) => val.toLowerCase().includes(search.value.toLowerCase())),
  )
})
</script>
