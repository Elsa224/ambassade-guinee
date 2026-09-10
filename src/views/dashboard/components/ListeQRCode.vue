<template>
  <div class="overflow-x-auto bg-white rounded-lg shadow-md">
    <table class="min-w-full divide-y divide-gray-200">
      <thead class="bg-primary text-white">
        <tr>
          <th class="px-6 py-3 text-left text-sm font-semibold">Nom</th>
          <th class="px-6 py-3 text-left text-sm font-semibold">Prénom</th>
          <th class="px-6 py-3 text-left text-sm font-semibold">Email</th>
          <th class="px-6 py-3 text-left text-sm font-semibold">Contact</th>
          <th class="px-6 py-3 text-left text-sm font-semibold">Image</th>
          <th class="px-6 py-3 text-left text-sm font-semibold">QR Code</th>
          <th class="px-6 py-3 text-center text-sm font-semibold">Actions</th>
        </tr>
      </thead>

      <tbody class="divide-y divide-gray-200">
        <tr v-for="(item, index) in paginatedQrList" :key="index" class="hover:bg-gray-50">
          <td class="px-6 py-3 flex items-center gap-3">
            <input type="checkbox" class="h-4 w-4" />
            <span class="text-gray-800 font-medium">{{ item.nom }}</span>
          </td>
          <td class="px-6 py-3 text-gray-700">{{ item.prenom }}</td>
          <td class="px-6 py-3 text-gray-700">{{ item.email }}</td>
          <td class="px-6 py-3 text-gray-700">{{ item.contact }}</td>
          <td class="px-6 py-3">
            <img :src="item.image" class="h-10 w-10 rounded-full object-cover" />
          </td>
          <td class="px-6 py-3">
            <img :src="item.qrCode" class="h-12 w-12 object-contain" />
          </td>
          <td class="px-6 py-3 text-center relative">
            <button @click="item.showActions = !item.showActions" class="flex items-center justify-center w-full">
              <i class="bx bx-dots-vertical text-xl text-gray-600 hover:text-primary"></i>
            </button>

            <div
              v-if="item.showActions"
              class="absolute right-4 mt-2 bg-white border rounded-md shadow-md flex flex-col gap-1 w-36 z-10"
            >
              <button @click="editItem(item)" class="flex items-center gap-2 px-3 py-2 hover:bg-gray-100 text-sm">
                <i class="bx bx-pencil text-blue-500"></i> Modifier
              </button>
              <button @click="deleteItem(item)" class="flex items-center gap-2 px-3 py-2 hover:bg-gray-100 text-sm">
                <i class="bx bx-trash text-red-500"></i> Supprimer
              </button>
              <button @click="addItem(item)" class="flex items-center gap-2 px-3 py-2 hover:bg-gray-100 text-sm">
                <i class="bx bx-plus-circle text-green-500"></i> Ajouter
              </button>
            </div>
          </td>
        </tr>

        <tr v-if="paginatedQrList.length === 0">
          <td colspan="7" class="text-center py-4 text-gray-500">Aucun QR Code trouvé.</td>
        </tr>
      </tbody>
    </table>

    <!-- Pagination -->
    <div class="flex items-center justify-between px-4 py-3 border-t bg-gray-50">
      <div class="flex items-center gap-2 text-sm text-gray-700">
        <span>Afficher</span>
        <select v-model="perPage" class="border border-gray-300 rounded-md px-2 py-1">
          <option v-for="n in [5, 10, 15]" :key="n" :value="n">{{ n }}</option>
        </select>
        <span>par page</span>
      </div>

      <div class="flex items-center gap-1">
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
            currentPage === page ? 'bg-primary text-white border-primary' : ''
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

const qrList = ref(
  Array.from({ length: 10 }, (_, i) => ({
    nom: `Nom${i + 1}`,
    prenom: `Prénom${i + 1}`,
    email: `email${i + 1}@exemple.com`,
    contact: `+225000000${i + 1}`,
    image: `https://i.pravatar.cc/150?img=${i + 10}`,
    qrCode: `https://api.qrserver.com/v1/create-qr-code/?size=100x100&data=QR${i + 1}`,
    showActions: false
  }))
)

const currentPage = ref(1)
const perPage = ref(5)
const totalPages = computed(() => Math.ceil(qrList.value.length / perPage.value))
const paginatedQrList = computed(() => {
  const start = (currentPage.value - 1) * perPage.value
  return qrList.value.slice(start, start + perPage.value)
})

const pageNumbers = computed(() => {
  const total = totalPages.value
  const current = currentPage.value
  let start = Math.max(1, current - 1)
  let end = Math.min(total, start + 2)
  if (end - start < 2) start = Math.max(1, end - 2)
  return Array.from({ length: end - start + 1 }, (_, i) => start + i)
})

function goToPage(page: number) {
  if (page >= 1 && page <= totalPages.value) currentPage.value = page
}
function editItem(item: any) { alert(`Modifier ${item.nom}`) }
function deleteItem(item: any) { alert(`Supprimer ${item.nom}`) }
function addItem(item: any) { alert(`Ajouter ${item.nom}`) }
</script>
