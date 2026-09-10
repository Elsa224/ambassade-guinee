<template>
  <div class="min-h-screen bg-gray-50 p-6 overflow-hidden">
    <div class="max-w-4xl mx-auto">
      <!-- En-tête -->
      <div class="mb-8">
        <h1 class="text-3xl font-bold text-gray-900 mb-1">Liste des Demandes</h1>

        <div class="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
          <div class="relative w-full md:w-1/3 mt-5">
            <input
              v-model="searchQuery"
              type="text"
              placeholder="Search"
              class="w-full border border-gray-300 rounded-lg px-10 py-2 focus:outline-none focus:ring-2 focus:ring-ink"
            />
            <i class="bx bx-search absolute left-3 top-2.5 text-gray-400 text-lg"></i>
          </div>
        </div>
      </div>

      <!-- Tableau des demandes -->
      <div class="bg-white rounded-lg shadow overflow-hidden">
        <div class="overflow-x-auto">
          <table class="min-w-full divide-y divide-gray-200">
            <thead class="bg-primary text-white">
              <tr>
                <th
                  class="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider whitespace-nowrap"
                >
                  Visitor Email
                </th>
                <th
                  class="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider whitespace-nowrap"
                >
                  Contact
                </th>
                <th
                  class="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider whitespace-nowrap"
                >
                  Image
                </th>
                <th
                  class="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider whitespace-nowrap"
                >
                  Host
                </th>
                <th
                  class="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider whitespace-nowrap"
                >
                  Reason
                </th>
                <th
                  class="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider whitespace-nowrap"
                >
                  Status
                </th>
                <th
                  class="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider whitespace-nowrap"
                >
                  Date de création
                </th>
                <th
                  class="px-6 py-3 text-center text-xs font-medium uppercase tracking-wider whitespace-nowrap"
                >
                  Actions
                </th>
                <th
                  class="px-6 py-3 text-center text-xs font-medium uppercase tracking-wider whitespace-nowrap"
                >
                  Supprimer
                </th>
              </tr>
            </thead>
            <tbody class="bg-white divide-y divide-gray-200">
              <tr
                v-for="(request, index) in filteredRequests"
                :key="request.id"
                :class="index % 2 === 0 ? 'bg-white' : 'bg-gray-50'"
                class="hover:bg-gray-100"
              >
                <td class="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                  {{ request.email }}
                </td>
                <td class="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                  {{ request.contact }}
                </td>
                <td class="px-6 py-4 whitespace-nowrap">
                  <img :src="request.image" class="h-10 w-10 rounded-full object-cover" />
                </td>
                <td class="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                  {{ request.host }}
                </td>
                <td class="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                  {{ request.reason }}
                </td>
                <td class="px-6 py-4 whitespace-nowrap">
                  <span
                    :class="{
                      'text-green-600 font-semibold': request.status === 'Approved',
                      'text-yellow-600 font-semibold': request.status === 'Pending',
                      'text-red-600 font-semibold': request.status === 'Rejected',
                    }"
                  >
                    {{ request.status }}
                  </span>
                </td>
                <td class="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                  {{ request.createdAt }}
                </td>
                <td class="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                  <div class="flex justify-center">
                    <button
                      @click="openConfirmation(request)"
                      class="text-primary hover:text-primary-dark transition-colors p-1 rounded"
                      title="Voir détails"
                    >
                      <i class="bx bx-show text-xl"></i>
                    </button>
                  </div>
                </td>
                <td class="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                  <div class="flex justify-center">
                    <button
                      @click="removeRequest(request.id)"
                      class="text-red-600 hover:text-red-800 transition-colors p-1 rounded"
                      title="Supprimer"
                    >
                      <i class="bx bx-trash text-lg"></i>
                    </button>
                  </div>
                </td>
              </tr>
            </tbody>
          </table>
        </div>
      </div>
    </div>

    <!-- Page d'attente -->
    <div
      v-if="isConfirming"
      class="fixed inset-0 flex flex-col items-center justify-center bg-gray-50 text-center z-50"
    >
      <h2 class="text-2xl font-semibold text-primary mb-6">
        En attente de confirmation<span class="animate-pulse">...</span>
      </h2>
      <div class="flex space-x-6">
        <button
          @click="generateQrCard(selectedRequest!)"
          class="bg-primary text-white px-8 py-3 rounded-lg text-lg font-semibold hover:bg-primary-dark transition-colors"
        >
          Valider
        </button>
        <button
          @click="cancelConfirmation"
          class="bg-gray-400 text-white px-8 py-3 rounded-lg text-lg font-semibold hover:bg-gray-500 transition-colors"
        >
          Annuler
        </button>
      </div>
    </div>

    <!-- Affichage de la carte stylée -->
    <div
      v-if="showQrCard && selectedRequest"
      class="fixed inset-0 flex flex-col items-center min-h-screen bg-white z-50 overflow-y-auto pt-1"
    >
      <div class="self-start ml-6 mb-4">
        <button
          @click="showQrCard = false"
          class="flex items-center text-primary font-semibold hover:text-primary-dark transition-colors"
        >
          <i class="bx bx-arrow-back text-xl mr-2"></i> Retour
        </button>
      </div>

      <!-- Carte principale -->
      <div class="relative bg-primary text-white w-96 rounded-3xl shadow-lg overflow-hidden pt-2">
        <div class="flex justify-center">
          <div
            class="w-28 h-28 bg-white rounded-full flex items-center justify-center shadow-md border-4 border-primary -mt-14"
          >
            <img :src="logo" alt="Logo" class="w-20 h-20 object-contain mt-6" />
          </div>
        </div>

        <div class="relative mt-1 px-6">
          <div
            class="absolute top-1/2 left-0 transform -translate-y-1/2 bg-white rounded-r-full w-6 h-6"
          ></div>
          <div
            class="absolute top-1/2 right-0 transform -translate-y-1/2 bg-white rounded-l-full w-6 h-6"
          ></div>

          <div class="flex justify-center mb-4">
            <div class="bg-white p-4 rounded-xl">
              <img :src="qrCodeUrl" alt="QR Code" class="w-40 h-40" />
            </div>
          </div>

          <div class="flex justify-center mb-1">
            <div class="text-white font-medium">Ticket #{{ selectedRequest.id }}</div>
          </div>

          <div class="border-t-2 border-dashed border-white w-3/4 mx-auto mb-3"></div>

          <div class="grid grid-cols-2 gap-3 mb-6 text-sm">
            <div class="flex items-start space-x-2">
              <i class="bx bx-calendar text-xl"></i>
              <div>
                <h3 class="font-bold">Event</h3>
                <p>{{ selectedRequest.reason }}</p>
                <p class="text-xs">By {{ selectedRequest.host }}</p>
              </div>
            </div>

            <div class="flex items-start space-x-2">
              <i class="bx bx-envelope text-xl"></i>
              <div>
                <h3 class="font-bold">Email</h3>
                <p class="text-xs">{{ selectedRequest.email }}</p>
              </div>
            </div>

            <div class="flex items-start space-x-2">
              <i class="bx bx-phone text-xl"></i>
              <div>
                <h3 class="font-bold">Contact</h3>
                <p class="text-xs">{{ selectedRequest.contact }}</p>
              </div>
            </div>

            <div class="flex items-start space-x-2">
              <i class="bx bx-time text-xl"></i>
              <div>
                <h3 class="font-bold">Date</h3>
                <p>11 Octobre 2025</p>
                <p class="text-xs">13h00 - 14h00</p>
              </div>
            </div>
          </div>
        </div>
      </div>

      <div class="flex justify-center gap-4 mt-2 mb-8">
        <button
          class="bg-primary text-black px-6 py-3 rounded-lg flex items-center gap-2 shadow hover:bg-primary-dark hover:text-white transition-colors"
        >
          <i class="bx bx-share-alt"></i> Partager
        </button>
        <button
          class="bg-primary text-black px-6 py-3 rounded-lg flex items-center gap-2 shadow hover:bg-primary-dark hover:text-white transition-colors"
        >
          <i class="bx bx-download"></i> Capturer
        </button>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, computed } from 'vue'
import logo from '@/assets/images/logo.webp'

// Types
const statusValues = ['Pending', 'Approved', 'Rejected'] as const
type Status = (typeof statusValues)[number]

// Interface pour une demande
interface Request {
  id: string
  email: string
  contact: string
  image: string
  host: string
  reason: string
  status: Status
  createdAt: string
}

// Données constantes typées avec `as const` pour garantir des tuples
const hosts = ['Mozar Group', 'Tech CI', 'Masek Holding'] as const
const reasons = ['Visite', 'Réunion', 'Inspection'] as const

// État
const searchQuery = ref<string>('')
const selectedRequest = ref<Request | null>(null)
const isConfirming = ref<boolean>(false)
const showQrCard = ref<boolean>(false)
const qrCodeUrl = ref<string>('')

// Génération des 15 demandes - avec cast explicite pour rassurer TypeScript
const requests = ref<Request[]>(
  Array.from({ length: 15 }, (_, i): Request => {
    const statusIndex = (i % 3) as 0 | 1 | 2
    return {
      id: `R00${i + 1}`,
      email: `user${i + 1}@example.com`,
      contact: `+225 07000000${i + 1}`,
      image: `https://randomuser.me/api/portraits/${i % 2 ? 'women' : 'men'}/${i + 1}.jpg`,
      host: hosts[i % 3] as string,
      reason: reasons[i % 3] as string,
      status: statusValues[statusIndex],
      createdAt: `2025-10-${10 + i}`,
    }
  }),
)

// Filtrage
const filteredRequests = computed<Request[]>(() => {
  if (!searchQuery.value) return requests.value
  const query = searchQuery.value.toLowerCase()
  return requests.value.filter(
    (request) =>
      request.email.toLowerCase().includes(query) ||
      request.contact.toLowerCase().includes(query) ||
      request.host.toLowerCase().includes(query) ||
      request.reason.toLowerCase().includes(query),
  )
})

// Méthodes
function openConfirmation(request: Request): void {
  selectedRequest.value = request
  isConfirming.value = true
}

function cancelConfirmation(): void {
  selectedRequest.value = null
  isConfirming.value = false
}

function removeRequest(id: string): void {
  requests.value = requests.value.filter((r) => r.id !== id)
  if (selectedRequest.value && selectedRequest.value.id === id) {
    selectedRequest.value = null
    isConfirming.value = false
    showQrCard.value = false
  }
}

function generateQrCard(request: Request): void {
  qrCodeUrl.value = `https://api.qrserver.com/v1/create-qr-code/?size=200x200&data=${encodeURIComponent(
    `Accès validé pour ${request.email}`,
  )}`
  isConfirming.value = false
  showQrCard.value = true
}
</script>

<style scoped>
.overflow-x-auto::-webkit-scrollbar {
  height: 8px;
}
.overflow-x-auto::-webkit-scrollbar-track {
  background: #f1f1f1;
  border-radius: 4px;
}
.overflow-x-auto::-webkit-scrollbar-thumb {
  background: #c1c1c1;
  border-radius: 4px;
}
.overflow-x-auto::-webkit-scrollbar-thumb:hover {
  background: #a8a8a8;
}
.min-h-screen {
  overflow: hidden;
}
</style>
