<template>
  <div class="bg-white shadow-md rounded-lg p-4">

    <!-- Barre de recherche (responsive) -->
    <div class="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3 mb-4">
      <h3 class="text-lg font-semibold text-primary">Liste des Événements</h3>
      <div class="relative w-full sm:w-64">
        <input
          v-model="searchQuery"
          type="text"
          placeholder="Rechercher un événement..."
          class="border border-gray-300 rounded-lg px-10 py-2 w-full focus:outline-none focus:ring-2 focus:ring-primary"
        />
        <i class="bx bx-search absolute left-3 top-2.5 text-gray-400 text-lg"></i>
      </div>
    </div>

    <!-- Liste des événements -->
    <div v-if="activeTab === 'list'">

      <!-- === VUE MOBILE / TABLETTE : CARTES === -->
      <div class="block md:hidden space-y-4">
        <div
          v-for="event in paginatedEvents"
          :key="event.nom"
          class="bg-gray-50 rounded-lg p-4 shadow-sm border border-gray-200"
        >
          <div class="flex justify-between items-start">
            <div class="flex-1">
              <div class="flex items-center gap-2">
                <input type="checkbox" v-model="event.selected" class="h-4 w-4" />
                <span
                  class="text-blue-700 font-semibold hover:underline cursor-pointer"
                  @click="voirParticipants(event)"
                >
                  {{ event.nom }}
                </span>
              </div>
              <p class="text-sm text-gray-600 mt-1"><span class="font-medium">Entreprise :</span> {{ event.entreprise }}</p>
              <p class="text-sm text-gray-600"><span class="font-medium">Lieu :</span> {{ event.lieu }}</p>
              <p class="text-sm text-gray-600"><span class="font-medium">Date :</span> {{ event.date }} à {{ event.heure }}</p>
              <p class="text-sm text-gray-600"><span class="font-medium">Création :</span> {{ event.createdAt }}</p>
              <p class="text-sm text-gray-600"><span class="font-medium">Participants :</span>
                <button class="text-ink-light font-semibold hover:underline" @click="voirParticipants(event)">
                  {{ event.participation }}
                </button>
              </p>
              <div class="flex items-center gap-3 mt-1">
                <a :href="event.lien" class="text-blue-600 hover:underline text-sm">Voir le lien</a>
                <img :src="event.qrCode" class="h-8 w-8" />
              </div>
            </div>
            <div class="relative ml-2">
              <button
                @click="event.dropdown = !event.dropdown"
                class="p-1 rounded-full hover:bg-gray-200 transition"
              >
                <i class="bx bx-dots-vertical-rounded text-xl text-gray-600"></i>
              </button>
              <div
                v-if="event.dropdown"
                class="absolute right-0 mt-2 w-32 bg-white border rounded shadow-lg z-10"
              >
                <ul>
                  <li class="px-4 py-2 hover:bg-gray-100 cursor-pointer" @click="ajouterEvent(event)">
                    <i class='bx bx-plus'></i> Ajouter
                  </li>
                  <li class="px-4 py-2 hover:bg-gray-100 cursor-pointer" @click="modifierEvent(event)">
                    <i class='bx bx-edit'></i> Modifier
                  </li>
                  <li class="px-4 py-2 hover:bg-red-100 cursor-pointer text-red-600" @click="supprimerEvent(events.indexOf(event))">
                    <i class='bx bx-trash'></i> Supprimer
                  </li>
                </ul>
              </div>
            </div>
          </div>
        </div>
        <p v-if="paginatedEvents.length === 0" class="text-center text-gray-500 py-4">Aucun événement trouvé.</p>
      </div>

      <!-- === VUE DESKTOP : TABLEAU === -->
      <div class="hidden md:block overflow-x-auto">
        <table class="min-w-full border border-gray-200 rounded-lg">
          <thead class="bg-primary text-white">
            <tr>
              <th class="p-3 text-left">Nom</th>
              <th class="p-3 text-left">Entreprise</th>
              <th class="p-3 text-left">Lieu</th>
              <th class="p-3 text-left">Date</th>
              <th class="p-3 text-left">Heure</th>
              <th class="p-3 text-left">Création</th>
              <th class="p-3 text-left">Lien</th>
              <th class="p-3 text-left">Participation</th>
              <th class="p-3 text-left">QR Code</th>
              <th class="p-3 text-left">Action</th>
            </tr>
          </thead>
          <tbody>
            <tr v-for="(event, index) in paginatedEvents" :key="index" class="border-b hover:bg-gray-100">
              <td class="p-3 flex items-center gap-2">
                <input type="checkbox" v-model="event.selected"/>
                <span class="text-blue-700 font-semibold hover:underline cursor-pointer"
                      @click="voirParticipants(event)">
                  {{ event.nom }}
                </span>
              </td>
              <td class="p-3">{{ event.entreprise }}</td>
              <td class="p-3">{{ event.lieu }}</td>
              <td class="p-3">{{ event.date }}</td>
              <td class="p-3">{{ event.heure }}</td>
              <td class="p-3">{{ event.createdAt }}</td>
              <td class="p-3"><a :href="event.lien" class="text-blue-600 hover:underline">Voir</a></td>
              <td class="p-3">
                <button class="text-ink-light font-semibold hover:underline"
                        @click="voirParticipants(event)">
                  {{ event.participation }}
                </button>
              </td>
              <td class="p-3"><img :src="event.qrCode" class="h-10 w-10"/></td>
              <td class="p-3 relative">
                <div class="inline-block text-left">
                  <button @click="event.dropdown = !event.dropdown" class="px-2 py-1 rounded hover:bg-gray-200">
                    <i class='bx bx-dots-vertical-rounded text-xl'></i>
                  </button>
                  <div v-if="event.dropdown" class="absolute right-0 mt-2 w-32 bg-white border rounded shadow-lg z-10">
                    <ul>
                      <li class="px-4 py-2 hover:bg-gray-100 cursor-pointer" @click="ajouterEvent(event)">
                        <i class='bx bx-plus'></i> Ajouter
                      </li>
                      <li class="px-4 py-2 hover:bg-gray-100 cursor-pointer" @click="modifierEvent(event)">
                        <i class='bx bx-edit'></i> Modifier
                      </li>
                      <li class="px-4 py-2 hover:bg-red-100 cursor-pointer text-red-600" @click="supprimerEvent(index)">
                        <i class='bx bx-trash'></i> Supprimer
                      </li>
                    </ul>
                  </div>
                </div>
              </td>
            </tr>
          </tbody>
        </table>
      </div>

      <!-- Pagination (identique pour les deux vues) -->
      <div class="flex flex-col sm:flex-row justify-between items-center gap-3 mt-4">
        <div class="flex items-center gap-2">
          <span class="text-gray-600 text-sm">Afficher</span>
          <select v-model="perPage" class="border rounded p-1">
            <option v-for="n in [5,10,15]" :key="n" :value="n">{{ n }}</option>
          </select>
          <span class="text-gray-600 text-sm">événements par page</span>
        </div>
        <div class="flex gap-1 flex-wrap justify-center">
          <button :disabled="currentPage === 1" @click="currentPage--" class="px-3 py-1 border rounded hover:bg-gray-200 disabled:opacity-50">‹</button>
          <button v-for="page in totalPages" :key="page" @click="currentPage = page"
                  :class="['px-3 py-1 border rounded hover:bg-gray-200', currentPage === page ? 'bg-primary text-white' : '']">
            {{ page }}
          </button>
          <button :disabled="currentPage === totalPages" @click="currentPage++" class="px-3 py-1 border rounded hover:bg-gray-200 disabled:opacity-50">›</button>
        </div>
      </div>
    </div>

    <!-- Liste des participants (responsive) -->
    <div v-if="activeTab === 'participants'" class="bg-white shadow-md rounded-lg p-4">
      <div class="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3 mb-4">
        <h3 class="text-lg font-semibold text-primary">
          Participants de l'Événement : {{ selectedEvent?.nom || '' }}
        </h3>
        <button @click="activeTab = 'list'" class="bg-gray-200 text-gray-800 px-4 py-2 rounded-lg hover:bg-gray-300">
          Retour
        </button>
      </div>

      <!-- Version mobile : cartes -->
      <div class="block md:hidden space-y-4">
        <div v-for="visitor in selectedEvent?.visitors || []" :key="visitor.id" class="bg-gray-50 rounded-lg p-4 shadow-sm border border-gray-200">
          <div class="flex items-center gap-3">
            <img :src="visitor.image" class="h-12 w-12 rounded-full object-cover" />
            <div class="flex-1">
              <p class="font-semibold text-gray-800">{{ visitor.email }}</p>
              <p class="text-sm text-gray-600">ID : {{ visitor.id }}</p>
              <p class="text-sm text-gray-600">Adresse : {{ visitor.address }}</p>
              <p class="text-sm text-gray-600">Inscription : {{ visitor.createdAt }}</p>
            </div>
          </div>
        </div>
        <p v-if="(selectedEvent?.visitors || []).length === 0" class="text-center text-gray-500 py-4">Aucun participant.</p>
      </div>

      <!-- Version desktop : tableau -->
      <div class="hidden md:block overflow-x-auto">
        <table class="min-w-full border border-gray-200 rounded-lg">
          <thead class="bg-primary text-white">
            <tr>
              <th class="p-3 text-left">ID</th>
              <th class="p-3 text-left">Email</th>
              <th class="p-3 text-left">Image</th>
              <th class="p-3 text-left">Adresse</th>
              <th class="p-3 text-left">Date d’Inscription</th>
            </tr>
          </thead>
          <tbody>
            <tr v-for="(visitor, index) in selectedEvent?.visitors || []" :key="index" class="border-b hover:bg-gray-100">
              <td class="p-3">{{ visitor.id }}</td>
              <td class="p-3">{{ visitor.email }}</td>
              <td class="p-3"><img :src="visitor.image" class="h-10 w-10 rounded-full object-cover"/></td>
              <td class="p-3">{{ visitor.address }}</td>
              <td class="p-3">{{ visitor.createdAt }}</td>
            </tr>
          </tbody>
        </table>
      </div>
    </div>

  </div>
</template>

<script setup lang="ts">
import { ref, computed } from 'vue'

// ---------- Types ----------
interface Visitor {
  id: string
  email: string
  image: string
  address: string
  createdAt: string
}

interface Event {
  entreprise: string
  nom: string
  lieu: string
  date: string
  heure: string
  createdAt: string
  lien: string
  participation: number
  qrCode: string
  selected: boolean
  dropdown: boolean
}

// ---------- State ----------
const activeTab = ref<'list' | 'participants'>('list')
const selectedEvent = ref<(Event & { visitors: Visitor[] }) | null>(null)
const perPage = ref(5)
const currentPage = ref(1)
const searchQuery = ref('')

// ---------- Données ----------
const visitorsData: Record<string, Visitor[]> = {
  'Forum Digital': [
    { id: 'V001', email: 'john@example.com', image: 'https://randomuser.me/api/portraits/men/1.jpg', address: 'Abidjan, Cocody', createdAt: '2025-10-10' },
    { id: 'V002', email: 'marie@example.com', image: 'https://randomuser.me/api/portraits/women/2.jpg', address: 'Yopougon, Abobo', createdAt: '2025-10-12' },
    { id: 'V003', email: 'patrick@example.com', image: 'https://randomuser.me/api/portraits/men/3.jpg', address: 'Marcory, Zone 4', createdAt: '2025-10-14' },
  ],
  'Conférence Élite': [
    { id: 'V006', email: 'luc@example.com', image: 'https://randomuser.me/api/portraits/men/6.jpg', address: 'Plateau, Abidjan', createdAt: '2025-10-20' },
    { id: 'V007', email: 'sophie@example.com', image: 'https://randomuser.me/api/portraits/women/7.jpg', address: 'Cocody, Riviera', createdAt: '2025-10-21' },
  ]
}

const events = ref<Event[]>([
  { entreprise: 'Mozar Group', nom: 'Forum Digital', lieu: 'Abidjan', date: '2025-11-01', heure: '09:00', createdAt: '2025-09-30', lien: '#', participation: 124, qrCode: 'https://api.qrserver.com/v1/create-qr-code/?size=80x80&data=Forum+Digital', selected: false, dropdown: false },
  { entreprise: 'Masek Holding', nom: 'Conférence Élite', lieu: 'Plateau', date: '2025-12-05', heure: '14:00', createdAt: '2025-10-05', lien: '#', participation: 58, qrCode: 'https://api.qrserver.com/v1/create-qr-code/?size=80x80&data=Conference+Elite', selected: false, dropdown: false },
])

// ---------- Filtrage ----------
const filteredEvents = computed(() => {
  const q = searchQuery.value.toLowerCase().trim()
  if (!q) return events.value
  return events.value.filter(e =>
    e.nom.toLowerCase().includes(q) ||
    e.entreprise.toLowerCase().includes(q) ||
    e.lieu.toLowerCase().includes(q)
  )
})

// ---------- Pagination ----------
const totalPages = computed(() => Math.ceil(filteredEvents.value.length / perPage.value))
const paginatedEvents = computed(() => {
  const start = (currentPage.value - 1) * perPage.value
  return filteredEvents.value.slice(start, start + perPage.value)
})

// ---------- Méthodes ----------
function voirParticipants(event: Event) {
  const visitors = visitorsData[event.nom] || []
  selectedEvent.value = { ...event, visitors }
  activeTab.value = 'participants'
}

function ajouterEvent(event: Event) { alert(`Ajouter pour ${event.nom}`) }
function modifierEvent(event: Event) { alert(`Modifier ${event.nom}`) }
function supprimerEvent(index: number) {
  if (confirm('Supprimer cet événement ?')) {
    events.value.splice(index, 1)
    // Si on supprime le dernier élément de la page, ajuster la page courante
    if (paginatedEvents.value.length === 0 && currentPage.value > 1) {
      currentPage.value--
    }
  }
}
</script>

<style scoped>
@import url("https://unpkg.com/boxicons@2.1.4/css/boxicons.min.css");

/* Pour le tableau, une scrollbar fine */
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
</style>
