<template>
  <div class="p-6 bg-gray-100 min-h-screen">
    <h2 class="text-2xl font-bold text-primary mb-4">Liste de Présence</h2>

    <!-- Barre de recherche -->
    <div class="mb-4">
      <input
        v-model="search"
        type="text"
        placeholder="Rechercher un utilisateur..."
        class="p-2 border rounded-lg focus:ring-2 focus:ring-primary"
      />
    </div>

    <!-- Tableau utilisateur -->
    <div class="overflow-x-auto bg-white shadow-lg rounded-xl">
      <table class="min-w-full border border-gray-200">
        <thead class="bg-primary text-white">
          <tr>
            <th class="p-3 text-left">Nom</th>
            <th class="p-3 text-left">Email</th>
            <th class="p-3 text-left">Contact</th>
            <th class="p-3 text-left">Check In/Out</th>
            <th class="p-3 text-left">Date</th>
            <th class="p-3 text-left">Actions</th>
          </tr>
        </thead>
        <tbody>
          <tr
            v-for="(user, index) in filteredList"
            :key="user.id"
            :class="index % 2 === 0 ? 'bg-white' : 'bg-gray-50'"
            class="hover:bg-gray-200 transition-colors relative"
          >
            <!-- Image + Nom -->
            <td class="p-3 font-medium flex items-center space-x-3">
              <img :src="user.image" class="h-10 w-10 rounded-full object-cover shadow-sm" />
              <span>{{ user.name }}</span>
            </td>

            <td class="p-3">{{ user.email }}</td>
            <td class="p-3">{{ user.contact }}</td>

            <!-- Check In / Check Out -->
            <td class="p-3 text-center">
              <!-- Contenu à ajouter si besoin -->
            </td>

            <td class="p-3">{{ formatDate(user.date) }}</td>

            <!-- Actions -->
            <td class="p-3 relative">
              <button
                @click="toggleActionMenu(user.id)"
                class="text-gray-600 hover:text-gray-900 px-2 py-1 rounded-full"
              >
                ⋮
              </button>

              <div
                v-if="activeMenu === user.id"
                class="absolute right-0 mt-2 w-36 bg-white border rounded-lg shadow-lg z-10"
              >
                <ul class="flex flex-col">
                  <li>
                    <button
                      @click="modifier(user)"
                      class="w-full text-left px-4 py-2 hover:bg-gray-100"
                    >
                      Modifier
                    </button>
                  </li>
                  <li>
                    <button
                      @click="supprimer(user.id)"
                      class="w-full text-left px-4 py-2 hover:bg-gray-100 text-red-600"
                    >
                      Supprimer
                    </button>
                  </li>
                  <li>
                    <button
                      @click="ajouter()"
                      class="w-full text-left px-4 py-2 hover:bg-gray-100 text-green-600"
                    >
                      Ajouter
                    </button>
                  </li>
                </ul>
              </div>
            </td>
          </tr>

          <tr v-if="filteredList.length === 0">
            <td colspan="6" class="text-center p-4 text-gray-500">Aucun utilisateur trouvé</td>
          </tr>
        </tbody>
      </table>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, computed } from 'vue'

const attendanceList = ref([
  {
    id: 'U001',
    name: 'John Doe',
    email: 'john@example.com',
    contact: '+225 0700000001',
    image: 'https://randomuser.me/api/portraits/men/1.jpg',
    date: '2025-10-15',
  },
  {
    id: 'U002',
    name: 'Marie Claire',
    email: 'marie@example.com',
    contact: '+225 0700000002',
    image: 'https://randomuser.me/api/portraits/women/2.jpg',
    date: '2025-10-14',
  },
  {
    id: 'U003',
    name: 'Paul Etienne',
    email: 'paul@example.com',
    contact: '+225 0700000003',
    image: 'https://randomuser.me/api/portraits/men/3.jpg',
    date: '2025-10-13',
  },
  {
    id: 'U004',
    name: 'Sophie M.',
    email: 'sophie@example.com',
    contact: '+225 0700000004',
    image: 'https://randomuser.me/api/portraits/women/4.jpg',
    date: '2025-10-12',
  },
  {
    id: 'U005',
    name: 'David K.',
    email: 'david@example.com',
    contact: '+225 0700000005',
    image: 'https://randomuser.me/api/portraits/men/5.jpg',
    date: '2025-10-11',
  },
  {
    id: 'U006',
    name: 'Linda A.',
    email: 'linda@example.com',
    contact: '+225 0700000006',
    image: 'https://randomuser.me/api/portraits/women/6.jpg',
    date: '2025-10-10',
  },
  {
    id: 'U007',
    name: 'Thomas R.',
    email: 'thomas@example.com',
    contact: '+225 0700000007',
    image: 'https://randomuser.me/api/portraits/men/7.jpg',
    date: '2025-10-09',
  },
  {
    id: 'U008',
    name: 'Camille B.',
    email: 'camille@example.com',
    contact: '+225 0700000008',
    image: 'https://randomuser.me/api/portraits/women/8.jpg',
    date: '2025-10-08',
  },
  {
    id: 'U009',
    name: 'Alex M.',
    email: 'alex@example.com',
    contact: '+225 0700000009',
    image: 'https://randomuser.me/api/portraits/men/9.jpg',
    date: '2025-10-07',
  },
  {
    id: 'U010',
    name: 'Chloe T.',
    email: 'chloe@example.com',
    contact: '+225 0700000010',
    image: 'https://randomuser.me/api/portraits/women/10.jpg',
    date: '2025-10-06',
  },
])

const search = ref('')
const activeMenu = ref<string | null>(null)

function toggleActionMenu(id: string) {
  activeMenu.value = activeMenu.value === id ? null : id
}

function supprimer(id: string) {
  attendanceList.value = attendanceList.value.filter((user) => user.id !== id)
  activeMenu.value = null
}

function modifier(user: (typeof attendanceList.value)[number]) {
  alert(`Modifier ${user.name}`)
  activeMenu.value = null
}

function ajouter() {
  alert('Ajouter un nouvel utilisateur')
  activeMenu.value = null
}

const filteredList = computed(() => {
  if (!search.value) return attendanceList.value
  return attendanceList.value.filter(
    (user) =>
      user.name.toLowerCase().includes(search.value.toLowerCase()) ||
      user.email.toLowerCase().includes(search.value.toLowerCase()) ||
      user.contact.includes(search.value),
  )
})

function formatDate(dateStr: string) {
  const d = new Date(dateStr)
  const day = String(d.getDate()).padStart(2, '0')
  const month = String(d.getMonth() + 1).padStart(2, '0')
  const year = d.getFullYear()
  return `${day}/${month}/${year}`
}
</script>
