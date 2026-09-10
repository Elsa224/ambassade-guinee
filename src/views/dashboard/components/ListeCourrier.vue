<template>
  <div class="min-h-screen p-6 flex flex-col">
    <!-- ===== BARRE D’ACTIONS ===== -->
    <div v-if="!courrierSelectionne" class="flex justify-between items-center mb-6">
      <!-- Barre de recherche -->
      <div class="w-full max-w-md">
        <input
          v-model="search"
          type="text"
          placeholder="Rechercher par objet ou destinateur..."
          class="w-full p-3 rounded-lg border border-gray-300 focus:border-primary focus:ring-2 focus:ring-primary focus:outline-none transition-all duration-200"
        />
      </div>
    </div>

    <!-- ===== LISTE ===== -->
    <div
      v-if="!courrierSelectionne"
      class="bg-white rounded-lg shadow-lg overflow-hidden flex-1 flex flex-col min-h-0"
    >
      <!-- Table Container -->
      <div class="overflow-auto flex-1">
        <table class="min-w-full text-left table-auto">
          <thead class="bg-primary text-white sticky top-0">
            <tr>
              <th class="px-4 py-3 font-semibold">ID</th>
              <th class="px-4 py-3 font-semibold">Objet</th>
              <th class="px-4 py-3 font-semibold">Destinateur</th>
              <th class="px-4 py-3 font-semibold">Contact</th>
              <th class="px-4 py-3 font-semibold">Date</th>
              <th class="px-4 py-3 font-semibold">Destinataire</th>
              <th class="px-4 py-3 font-semibold">Statut</th>
              <th class="px-4 py-3 font-semibold">Aperçu</th>
              <th class="px-4 py-3 font-semibold">Actions</th>
            </tr>
          </thead>

          <tbody class="divide-y divide-gray-200">
            <tr
              v-for="(courrier, index) in paginatedCourriers"
              :key="courrier.id"
              :class="index % 2 === 0 ? 'bg-gray-50 hover:bg-gray-100' : 'bg-white hover:bg-gray-100'"
              class="transition-colors duration-150"
            >
              <td class="px-4 py-3 text-sm font-medium text-gray-900">{{ courrier.id }}</td>
              <td class="px-4 py-3 text-sm text-gray-700 max-w-xs truncate">{{ courrier.objet }}</td>
              <td class="px-4 py-3 text-sm text-gray-700">{{ courrier.destinateur }}</td>
              <td class="px-4 py-3 text-sm text-gray-700">{{ courrier.contact }}</td>
              <td class="px-4 py-3 text-sm text-gray-700">{{ courrier.date }}</td>
              <td class="px-4 py-3 text-sm text-gray-700">{{ courrier.destinataire }}</td>
              <td class="px-4 py-3">
                <span
                  :class="[
                    'text-sm font-medium px-2 py-1 rounded-full',
                    courrier.statut === 'En attente'
                      ? 'bg-yellow-100 text-yellow-800'
                      : 'bg-green-100 text-green-800'
                  ]"
                >
                  {{ courrier.statut }}
                </span>
              </td>
              <td class="px-4 py-3">
                <button
                  @click="voirCourrier(courrier)"
                  class="text-sm font-medium text-primary hover:text-primary-dark hover:underline transition-colors duration-200"
                >
                  🧷
                </button>
              </td>

              <td class="px-4 py-3 relative">
                <button
                  @click.stop="toggleMenu(courrier.id)"
                  class="p-1 rounded-full hover:bg-gray-200 transition-colors duration-200"
                >
                  <i class="bx bx-dots-vertical-rounded text-lg text-gray-600"></i>
                </button>

                <!-- ===== MENU DÉROULANT ===== -->
                <div
                  v-if="activeMenu === courrier.id"
                  class="absolute right-0 top-full mt-1 w-48 bg-white rounded-lg shadow-lg border border-gray-200 z-20"
                >
                  <div class="py-1">
                    <!-- ✅ Ajouter -->
                    <button
                      @click="ajouter()"
                      class="flex items-center w-full px-4 py-2 text-sm text-primary hover:bg-green-50 transition-colors duration-150"
                    >
                      <i class="bx bx-plus-circle mr-2 text-primary"></i>
                      Ajouter
                    </button>

                    <!-- ✏️ Modifier -->
                    <button
                      @click="modifier(courrier)"
                      class="flex items-center w-full px-4 py-2 text-sm text-gray-700 hover:bg-gray-50 transition-colors duration-150"
                    >
                      <i class="bx bx-edit mr-2 text-yellow-600"></i>
                      Modifier
                    </button>

                    <!-- 🗑 Supprimer -->
                    <button
                      @click="supprimer(courrier.id)"
                      class="flex items-center w-full px-4 py-2 text-sm text-red-600 hover:bg-red-50 transition-colors duration-150"
                    >
                      <i class="bx bx-trash mr-2"></i>
                      Supprimer
                    </button>
                  </div>
                </div>
              </td>
            </tr>
          </tbody>
        </table>

        <!-- Message si aucun résultat -->
        <div v-if="paginatedCourriers.length === 0" class="text-center py-12 text-gray-500">
          <i class="bx bx-search text-4xl mb-3 opacity-50"></i>
          <p>Aucun courrier trouvé</p>
        </div>
      </div>

      <!-- ===== Pagination & Per-Page ===== -->
      <div
        class="flex flex-col sm:flex-row items-center justify-between px-6 py-4 bg-gray-50 border-t border-gray-200 gap-4"
      >
        <!-- Sélection du nombre d'éléments par page -->
        <div class="flex items-center gap-2">
          <span class="text-gray-600 text-sm">Afficher</span>
          <div class="relative">
            <button
              @click="perPageDropdown = !perPageDropdown"
              class="flex items-center gap-2 border border-gray-300 px-3 py-2 rounded-lg hover:bg-white transition-colors duration-200 bg-white"
            >
              <span class="text-sm font-medium">{{ perPage }}</span>
              <i
                class="bx bx-chevron-down text-gray-500 transition-transform duration-200"
                :class="{ 'rotate-180': perPageDropdown }"
              ></i>
            </button>

            <div
              v-if="perPageDropdown"
              class="absolute left-0 bottom-full mb-1 w-20 bg-white border border-gray-200 rounded-lg shadow-lg z-10"
            >
              <button
                v-for="option in [5, 10, 15]"
                :key="option"
                @click="setPerPage(option)"
                class="w-full px-3 py-2 text-sm text-left hover:bg-gray-50 first:rounded-t-lg last:rounded-b-lg transition-colors duration-150"
              >
                {{ option }}
              </button>
            </div>
          </div>
          <span class="text-gray-600 text-sm">courriers par page</span>
        </div>

        <!-- Pagination -->
        <div class="flex items-center gap-1">
          <button
            @click="goToPage(currentPage - 1)"
            :disabled="currentPage === 1"
            class="p-2 rounded-lg border border-gray-300 hover:bg-white disabled:opacity-50 disabled:cursor-not-allowed transition-colors duration-200"
          >
            <i class="bx bx-chevron-left text-xl"></i>
          </button>

          <button
            v-for="page in pageNumbers"
            :key="page"
            @click="goToPage(page)"
            :class="[
              'px-3 py-2 rounded-lg border border-gray-300 hover:bg-white transition-colors duration-200 min-w-10',
              currentPage === page
                ? 'bg-primary text-white border-primary hover:bg-primary-dark'
                : 'bg-white text-gray-700'
            ]"
          >
            {{ page }}
          </button>

          <button
            @click="goToPage(currentPage + 1)"
            :disabled="currentPage === totalPages"
            class="p-2 rounded-lg border border-gray-300 hover:bg-white disabled:opacity-50 disabled:cursor-not-allowed transition-colors duration-200"
          >
            <i class="bx bx-chevron-right text-xl"></i>
          </button>
        </div>
      </div>
    </div>

    <!-- ===== APERÇU LETTRE ===== -->
<div v-else class="bg-white rounded-lg shadow-lg p-8 flex-1 relative max-w-4xl mx-auto">
   <!-- Bouton Retour à la liste en haut -->
  <div class="mb-4">
    <button
      @click="retourListe"
      class="flex items-center gap-2 text-primary hover:text-primary-dark text-lg font-semibold transition-colors duration-200"
    >
      <i class="bx bx-arrow-back"></i>
      Retour à la liste
    </button>
  </div>

  <!-- Entête -->
  <div class="flex justify-between mb-6">
    <!-- Destinateur -->
    <div class="space-y-1">
      <p class="text-xl font-bold text-primary">{{ courrierSelectionne.destinateur }}</p>
      <p class="text-gray-600">{{ courrierSelectionne.contact }}</p>
      <p class="text-gray-600">{{ courrierSelectionne.adresse || 'Abidjan, Côte d’Ivoire' }}</p>
    </div>
    <!-- Date -->
    <p class="text-right text-lg font-medium text-gray-700">{{ courrierSelectionne.date }}</p>
  </div>

  <!-- À l’attention de -->
  <div class="mb-6 text-right">
    <p class="font-semibold text-lg">À l’attention de :</p>
    <p class="text-lg">{{ courrierSelectionne.destinataire }}</p>
  </div>

  <!-- Objet -->
  <h3 class="text-xl font-bold mb-6 text-primary border-b-2 border-primary pb-2">
    Objet : {{ courrierSelectionne.objet }}
  </h3>

  <!-- Contenu du courrier -->
  <div class="space-y-4 text-justify mb-12">
    <p>
      Cher(e) {{ courrierSelectionne.destinataire }},<br /><br />
      Je me permets de vous adresser ce courrier afin d'attirer votre attention sur l'objet
      mentionné ci-dessus. Nous espérons pouvoir bénéficier de votre considération à ce sujet
      et restons à votre disposition pour tout complément d'information.
    </p>

    <p>
      Dans l'attente de votre retour, je vous prie d'agréer,
      {{ courrierSelectionne.destinataire }}, l'expression de mes salutations distinguées.
    </p>
  </div>

  <!-- Signature -->
  <div class="mb-12">
    <p class="font-bold text-lg text-primary">Cordialement,</p>
    <p class="text-xl font-semibold mt-2">{{ courrierSelectionne.destinateur }}</p>
  </div>

  <!-- Boutons en bas à droite -->
  <div class="flex justify-center gap-3">
    <button
      @click="telecharger(courrierSelectionne)"
      class="px-4 py-2 bg-primary text-white rounded-lg hover:bg-primary-dark transition"
    >
      Télécharger
    </button>
    <button
      @click="annuler(courrierSelectionne)"
      class="px-4 py-2 bg-gray-400 text-white rounded-lg hover:bg-gray-500 transition"
    >
      Annuler
    </button>
    <button
      @click="approuver(courrierSelectionne)"
      class="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition"
    >
      Approuver
    </button>
  </div>

</div>

  </div>
</template>

<script setup lang="ts">
import { ref, computed, onMounted, onUnmounted } from 'vue'

interface Courrier {
  id: number
  objet: string
  destinateur: string
  contact: string
  date: string
  destinataire: string
  statut: string
  adresse?: string
}

const courrierSelectionne = ref<Courrier | null>(null)
const activeMenu = ref<number | null>(null)
const search = ref('')
const currentPage = ref(1)
const perPage = ref(10)
const perPageDropdown = ref(false)

// Fermer le menu déroulant quand on clique ailleurs
const closeDropdowns = () => {
  perPageDropdown.value = false
  activeMenu.value = null
}

onMounted(() => {
  document.addEventListener('click', closeDropdowns)
})

onUnmounted(() => {
  document.removeEventListener('click', closeDropdowns)
})

const courriers = ref<Courrier[]>(
  Array.from({ length: 50 }, (_, i) => ({
    id: i + 1,
    objet: `Demande de rendez-vous ${i + 1}`,
    destinateur: 'Entreprise ' + (i + 1),
    contact: '07 00 00 ' + (i + 1).toString().padStart(2, '0'),
    date: '2025-10-' + (10 + (i % 20)).toString().padStart(2, '0'),
    destinataire:
      i % 3 === 0
        ? 'Monsieur Dupont'
        : i % 3 === 1
        ? 'Madame Martin'
        : 'Docteur Lambert',
    statut: i % 4 === 0 ? 'En attente' : 'Validé',
    adresse: i % 2 === 0 ? 'Abidjan Plateau' : undefined,
  }))
)

const filteredCourriers = computed(() =>
  courriers.value.filter(
    (c) =>
      c.objet.toLowerCase().includes(search.value.toLowerCase()) ||
      c.destinateur.toLowerCase().includes(search.value.toLowerCase()) ||
      c.destinataire.toLowerCase().includes(search.value.toLowerCase())
  )
)

const totalPages = computed(() => Math.ceil(filteredCourriers.value.length / perPage.value))

const paginatedCourriers = computed(() => {
  const start = (currentPage.value - 1) * perPage.value
  return filteredCourriers.value.slice(start, start + perPage.value)
})

const pageNumbers = computed(() => {
  const maxVisiblePages = 5
  const pages: number[] = []

  if (totalPages.value <= maxVisiblePages) {
    for (let i = 1; i <= totalPages.value; i++) pages.push(i)
  } else {
    const start = Math.max(1, currentPage.value - 2)
    const end = Math.min(totalPages.value, start + maxVisiblePages - 1)
    for (let i = start; i <= end; i++) pages.push(i)
  }

  return pages
})

const setPerPage = (count: number) => {
  perPage.value = count
  perPageDropdown.value = false
  currentPage.value = 1
}

const goToPage = (page: number) => {
  if (page >= 1 && page <= totalPages.value) {
    currentPage.value = page
  }
}

const voirCourrier = (courrier: Courrier) => {
  courrierSelectionne.value = courrier
  activeMenu.value = null
}

const retourListe = () => {
  courrierSelectionne.value = null
  activeMenu.value = null
}

const toggleMenu = (id: number) => {
  activeMenu.value = activeMenu.value === id ? null : id
}

const ajouter = () => {
  alert('Ajouter un nouveau courrier')
  activeMenu.value = null
}

const modifier = (courrier: Courrier) => {
  alert(`Modifier ${courrier.objet}`)
  activeMenu.value = null
}

const supprimer = (id: number) => {
  if (confirm('Êtes-vous sûr de vouloir supprimer ce courrier ?')) {
    alert(`Supprimer courrier ${id}`)
  }
  activeMenu.value = null
}
const telecharger = (courrier: Courrier | null) => {
  if (!courrier) return;
  alert(`Télécharger ${courrier.objet}`);
};

const annuler = (courrier: Courrier | null) => {
  if (!courrier) return;
  alert(`Annuler ${courrier.objet}`);
};

const approuver = (courrier: Courrier | null) => {
  if (!courrier) return;
  alert(`Approuver ${courrier.objet}`);
};

</script>

<style scoped>
.rotate-180 {
  transform: rotate(180deg);
}
.table-auto {
  table-layout: auto;
}
.min-h-0 {
  min-height: 0;
}
</style>
