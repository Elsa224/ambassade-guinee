<template>
  <div class="p-4 md:p-6 bg-gray-100 min-h-screen">

    <!-- Barre recherche (responsive) -->
    <div class="flex flex-col sm:flex-row items-start sm:items-center gap-3 mb-4">
      <div class="relative w-full sm:w-1/2 md:w-1/3">
        <input
          v-model="searchQuery"
          type="text"
          placeholder="Rechercher..."
          class="border border-gray-300 rounded-lg px-10 py-2 w-full focus:outline-none focus:ring-2 focus:ring-primary focus:border-primary transition"
        />
        <i class="bx bx-search absolute left-3 top-2.5 text-gray-400 text-lg"></i>
      </div>
      <!-- Vous pouvez ajouter un bouton "Ajouter" ici si nécessaire -->
    </div>

    <!-- Conteneur principal -->
    <div class="bg-white rounded-xl shadow-md overflow-hidden w-full">

      <!-- === VUE MOBILE / TABLETTE : CARTES === -->
      <div class="block md:hidden p-4 space-y-4">
        <div
          v-for="card in paginatedCards"
          :key="card.qr"
          class="bg-gray-50 rounded-lg p-4 shadow-sm border border-gray-200"
        >
          <div class="flex justify-between items-start">
            <div class="flex-1">
              <p class="font-semibold text-gray-800">{{ card.nom }} {{ card.prenoms }}</p>
              <p class="text-sm text-gray-600"><span class="font-medium">Email :</span> {{ card.email }}</p>
              <p class="text-sm text-gray-600"><span class="font-medium">Contact :</span> {{ card.contact }}</p>
              <p class="text-sm text-gray-600"><span class="font-medium">Titre :</span> {{ card.titre }}</p>
              <p class="text-sm text-gray-600"><span class="font-medium">QR :</span> {{ card.qr }}</p>
            </div>
            <div class="relative ml-2">
              <button
                @click="card.showActions = !card.showActions"
                class="p-1 rounded-full hover:bg-gray-200 transition"
              >
                <i class="bx bx-dots-vertical text-xl text-gray-600"></i>
              </button>
              <div
                v-if="card.showActions"
                class="absolute right-0 mt-2 bg-white rounded-md shadow-md flex flex-col gap-1 w-36 z-10 border border-gray-100"
              >
                <button
                  @click="editCard(card)"
                  class="flex items-center gap-2 px-3 py-2 hover:bg-gray-100 text-black text-sm"
                >
                  <i class="bx bx-pencil"></i> Modifier
                </button>
                <button
                  @click="deleteCard(card)"
                  class="flex items-center gap-2 px-3 py-2 hover:bg-gray-100 text-black text-sm"
                >
                  <i class="bx bx-trash"></i> Supprimer
                </button>
              </div>
            </div>
          </div>
        </div>
        <p v-if="paginatedCards.length === 0" class="text-center text-gray-500 py-4">
          Aucune carte trouvée.
        </p>
      </div>

      <!-- === VUE DESKTOP : TABLEAU === -->
      <div class="hidden md:block overflow-x-auto w-full" style="max-height: 500px;">
        <table class="w-full text-left border-collapse min-w-max">
          <thead class="bg-primary text-white sticky top-0 z-10">
            <tr>
              <th class="p-4 border-none whitespace-nowrap">Nom</th>
              <th class="p-4 border-none whitespace-nowrap">Prénoms</th>
              <th class="p-4 border-none whitespace-nowrap">Email</th>
              <th class="p-4 border-none whitespace-nowrap">Contact</th>
              <th class="p-4 border-none whitespace-nowrap">Titre</th>
              <th class="p-4 border-none whitespace-nowrap">QR Code</th>
              <th class="p-4 border-none whitespace-nowrap">Actions</th>
            </tr>
          </thead>
          <tbody>
            <tr
              v-for="(card, index) in paginatedCards"
              :key="card.qr"
              :class="[index % 2 === 0 ? 'bg-gray-100' : 'bg-gray-200', 'hover:bg-gray-50']"
            >
              <td class="p-4 border-none whitespace-nowrap">{{ card.nom }}</td>
              <td class="p-4 border-none whitespace-nowrap">{{ card.prenoms }}</td>
              <td class="p-4 border-none whitespace-nowrap">{{ card.email }}</td>
              <td class="p-4 border-none whitespace-nowrap">{{ card.contact }}</td>
              <td class="p-4 border-none whitespace-nowrap">{{ card.titre }}</td>
              <td class="p-4 border-none whitespace-nowrap">{{ card.qr }}</td>
              <td class="p-4 text-gray-500 text-xl relative border-none whitespace-nowrap">
                <div class="relative">
                  <button
                    @click="card.showActions = !card.showActions"
                    class="flex items-center justify-center gap-1 px-3 py-1 hover:bg-gray-50 whitespace-nowrap"
                  >
                    <i class="bx bx-dots-vertical text-lg"></i>
                  </button>
                  <div
                    v-if="card.showActions"
                    class="absolute right-0 mt-2 bg-white rounded-md shadow-md flex flex-col gap-1 w-36 z-10"
                  >
                    <button
                      @click="editCard(card)"
                      class="flex items-center gap-2 px-3 py-2 hover:bg-gray-100 text-black text-sm whitespace-nowrap"
                    >
                      <i class="bx bx-pencil"></i> Modifier
                    </button>
                    <button
                      @click="deleteCard(card)"
                      class="flex items-center gap-2 px-3 py-2 hover:bg-gray-100 text-black text-sm whitespace-nowrap"
                    >
                      <i class="bx bx-trash"></i> Supprimer
                    </button>
                  </div>
                </div>
              </td>
            </tr>
            <tr v-if="paginatedCards.length === 0">
              <td colspan="7" class="p-6 text-center text-gray-500 border-none">Aucune carte trouvée.</td>
            </tr>
          </tbody>
        </table>
      </div>
    </div>

    <!-- Pagination (identique pour les deux vues) -->
    <div class="flex flex-col sm:flex-row items-center justify-between gap-3 px-4 py-3 bg-white border-t mt-4 rounded-b-xl">
      <div class="flex items-center gap-2">
        <span class="text-gray-600 text-sm">Afficher</span>
        <div class="relative">
          <button
            @click="togglePerPageDropdown"
            class="flex items-center gap-1 border border-gray-300 px-2 py-1 rounded-md hover:bg-gray-50"
          >
            <span class="text-sm font-medium">{{ perPage }}</span>
            <i class="bx bx-chevron-down text-gray-500"></i>
          </button>
          <div
            v-if="perPageDropdown"
            class="absolute left-0 mt-1 w-24 bg-white border rounded-md shadow-md z-10"
          >
            <button class="w-full px-3 py-1 text-left hover:bg-gray-100" @click="setPerPage(15)">15</button>
            <button class="w-full px-3 py-1 text-left hover:bg-gray-100" @click="setPerPage(10)">10</button>
            <button class="w-full px-3 py-1 text-left hover:bg-gray-100" @click="setPerPage(5)">5</button>
          </div>
        </div>
        <span class="text-gray-600 text-sm">cartes par page</span>
      </div>

      <div class="flex items-center gap-1 flex-wrap justify-center">
        <button
          @click="goToPage(currentPage - 1)"
          :disabled="currentPage === 1"
          class="px-3 py-1 rounded-md border border-gray-300 hover:bg-gray-50 disabled:opacity-50"
        >
          <i class="bx bx-chevron-left text-lg"></i>
        </button>

        <button
          v-for="page in pageNumbers"
          :key="page"
          @click="goToPage(page)"
          :class="[
            'px-3 py-1 rounded-md border border-gray-300 hover:bg-gray-50',
            currentPage === page ? 'bg-primary text-white border-primary' : '',
          ]"
        >
          {{ page }}
        </button>

        <button
          @click="goToPage(currentPage + 1)"
          :disabled="currentPage === totalPages"
          class="px-3 py-1 rounded-md border border-gray-300 hover:bg-gray-50 disabled:opacity-50"
        >
          <i class="bx bx-chevron-right text-lg"></i>
        </button>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, computed } from 'vue'

interface Card {
  nom: string
  prenoms: string
  email: string
  contact: string
  titre: string
  qr: string
  showActions?: boolean
}

const cards = ref<Card[]>(
  Array.from({ length: 25 }, (_, i) => ({
    nom: `Nom${i + 1}`,
    prenoms: `Prenom${i + 1}`,
    email: `email${i + 1}@exemple.com`,
    contact: `+225000000${i + 1}`,
    titre: `Titre ${i + 1}`,
    qr: `QR${i + 1}`,
    showActions: false,
  }))
)

const searchQuery = ref('')
const perPage = ref(5)
const currentPage = ref(1)
const perPageDropdown = ref(false)

const filteredCards = computed(() => {
  const q = searchQuery.value.toLowerCase()
  return cards.value.filter(
    (c) =>
      c.nom.toLowerCase().includes(q) ||
      c.prenoms.toLowerCase().includes(q) ||
      c.email.toLowerCase().includes(q) ||
      c.contact.includes(q) ||
      c.titre.toLowerCase().includes(q)
  )
})

const totalPages = computed(() => Math.ceil(filteredCards.value.length / perPage.value))
const paginatedCards = computed(() => {
  const start = (currentPage.value - 1) * perPage.value
  return filteredCards.value.slice(start, start + perPage.value)
})

const pageNumbers = computed(() => {
  const pages = []
  for (let i = 1; i <= totalPages.value; i++) pages.push(i)
  return pages
})

function togglePerPageDropdown() {
  perPageDropdown.value = !perPageDropdown.value
}
function setPerPage(n: number) {
  perPage.value = n
  currentPage.value = 1
  perPageDropdown.value = false
}
function goToPage(n: number) {
  if (n < 1) n = 1
  if (n > totalPages.value) n = totalPages.value
  currentPage.value = n
}

function editCard(card: Card) {
  alert(`Modifier ${card.nom} ${card.prenoms}`)
}
function deleteCard(card: Card) {
  alert(`Supprimer ${card.nom} ${card.prenoms}`)
}
</script>

<style scoped>
@import url("https://unpkg.com/boxicons@2.1.4/css/boxicons.min.css");

/* Styles de la scrollbar (tableau) */
.overflow-x-auto::-webkit-scrollbar {
  height: 12px;
}
.overflow-x-auto::-webkit-scrollbar-track {
  background: #f1f5f9;
  border-radius: 6px;
}
.overflow-x-auto::-webkit-scrollbar-thumb {
  background: #cbd5e1;
  border-radius: 6px;
  border: 2px solid #f1f5f9;
}
.overflow-x-auto::-webkit-scrollbar-thumb:hover {
  background: #94a3b8;
}
.overflow-x-auto {
  scrollbar-width: thin;
  scrollbar-color: #cbd5e1 #f1f5f9;
}

/* Pour que le tableau soit scrollable verticalement */
.sticky {
  position: sticky;
  top: 0;
}
</style>
