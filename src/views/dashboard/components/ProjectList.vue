<!-- src/views/dashboard/components/ProjectList.vue -->
<template>
  <div class="min-h-screen bg-gray-50 p-6">
    <div class="max-w-5xl mx-auto">
      <!-- En-tête -->
      <div class="mb-8">
        <h1 class="text-3xl font-bold text-gray-900 mb-2">Liste des Projets</h1>
        <p class="text-gray-600 mb-4">Rechercher par titre, entreprise, statut</p>

        <!-- Barre de recherche et filtres -->
        <div class="flex gap-4 mb-6">
          <input
            type="text"
            placeholder="Rechercher..."
            class="flex-1 px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent"
            v-model="searchQuery"
          />
          <button
            class="px-6 py-2 bg-primary text-white rounded-lg hover:bg-primary-dark transition-colors"
          >
            Filtrer
          </button>
        </div>
      </div>

      <!-- Tableau des projets -->
      <div class="bg-white rounded-lg shadow overflow-hidden">
        <div class="overflow-x-auto hide-scrollbar">
          <table class="min-w-full divide-y divide-gray-200">
            <thead class="bg-gray-50">
              <tr>
                <th
                  class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider"
                >
                  Date Création
                </th>
                <th
                  class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider"
                >
                  Compagnie
                </th>
                <th
                  class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider"
                >
                  Titre
                </th>
                <th
                  class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider"
                >
                  Début
                </th>
                <th
                  class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider"
                >
                  Fin
                </th>
                <th
                  class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider"
                >
                  Status
                </th>
                <th
                  class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider"
                >
                  Progression
                </th>
                <th
                  class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider"
                >
                  Créé par
                </th>
                <th
                  class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider"
                >
                  Tâches
                </th>
                <th
                  class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider"
                >
                  Editer
                </th>
                <th
                  class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider"
                >
                  Document
                </th>
              </tr>
            </thead>
            <tbody class="bg-white divide-y divide-gray-200">
              <tr v-for="project in filteredProjects" :key="project.id" class="hover:bg-gray-50">
                <td class="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                  {{ project.creationDate }}
                </td>
                <td class="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                  {{ project.company }}
                </td>
                <td class="px-6 py-4 whitespace-nowrap text-sm font-medium text-primary">
                  {{ project.title }}
                </td>
                <td class="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                  {{ project.startDate }}
                </td>
                <td class="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                  {{ project.endDate }}
                </td>
                <td class="px-6 py-4 whitespace-nowrap">
                  <span
                    :class="getStatusClass(project.status)"
                    class="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium"
                  >
                    {{ project.status }}
                  </span>
                </td>
                <td class="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                  <div class="flex items-center">
                    <div class="w-16 bg-gray-200 rounded-full h-2 mr-2">
                      <div
                        class="bg-primary h-2 rounded-full"
                        :style="{ width: project.progress }"
                      ></div>
                    </div>
                    <span>{{ project.progress }}</span>
                  </div>
                </td>
                <td class="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                  {{ project.createdBy }}
                </td>
                <td class="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                  <button class="text-primary hover:text-primary-dark text-xl">
                    <svg class="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
                      <path
                        fill-rule="evenodd"
                        d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z"
                        clip-rule="evenodd"
                      />
                    </svg>
                  </button>
                </td>
                <td class="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                  <!-- Bouton Éditer avec navigation -->
                  <button
                    @click="editProject(project.id)"
                    class="text-primary hover:text-primary-dark text-xl"
                  >
                    <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path
                        stroke-linecap="round"
                        stroke-linejoin="round"
                        stroke-width="2"
                        d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z"
                      />
                    </svg>
                  </button>
                </td>
                <td class="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                  <!-- Bouton Document avec navigation -->
                  <button
                    @click="viewDocument(project.id)"
                    class="text-primary hover:text-primary-dark text-xl"
                  >
                    <i class="bx bx-file"></i>
                  </button>
                </td>
              </tr>
            </tbody>
          </table>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, computed } from 'vue'
import { useRouter } from 'vue-router'

const router = useRouter()
const searchQuery = ref('')

const projects = ref([
  {
    id: 1,
    creationDate: '27/10/2025',
    company: 'SCB',
    title: 'TAMARES',
    startDate: '27/10/2025',
    endDate: '31/12/2025',
    status: 'Planifié',
    progress: '0%',
    createdBy: 'Master Admin',
  },
  {
    id: 2,
    creationDate: '23/10/2025',
    company: 'SCB',
    title: 'Conseil Chekk',
    startDate: '03/11/2025',
    endDate: '21/11/2025',
    status: 'Planifié',
    progress: '0%',
    createdBy: 'Master Admin',
  },
  {
    id: 3,
    creationDate: '23/10/2025',
    company: 'SCB',
    title: 'Apollo',
    startDate: '23/10/2025',
    endDate: '31/10/2025',
    status: 'Planifié',
    progress: '0%',
    createdBy: 'Master Admin',
  },
  {
    id: 4,
    creationDate: '23/10/2025',
    company: 'SCB',
    title: 'BoursePay',
    startDate: '01/10/2025',
    endDate: '17/10/2025',
    status: 'Terminé',
    progress: '20%',
    createdBy: 'Employee Admin',
  },
  {
    id: 5,
    creationDate: '17/10/2025',
    company: 'SCB',
    title: 'SecureCheck',
    startDate: '17/10/2025',
    endDate: '17/10/2025',
    status: 'En cours',
    progress: '20%',
    createdBy: 'Employee Admin',
  },
])

const filteredProjects = computed(() => {
  if (!searchQuery.value) return projects.value
  return projects.value.filter(
    (project) =>
      project.title.toLowerCase().includes(searchQuery.value.toLowerCase()) ||
      project.company.toLowerCase().includes(searchQuery.value.toLowerCase()) ||
      project.status.toLowerCase().includes(searchQuery.value.toLowerCase()),
  )
})

const getStatusClass = (status) => {
  switch (status) {
    case 'Planifié':
      return 'bg-blue-100 text-blue-800'
    case 'En cours':
      return 'bg-yellow-100 text-yellow-800'
    case 'Terminé':
      return 'bg-green-100 text-green-800'
    default:
      return 'bg-gray-100 text-gray-800'
  }
}

// Navigation vers l'édition du projet
const editProject = (projectId) => {
  router.push({ name: 'EditProject', params: { id: projectId } })
}

// Navigation vers l'aperçu du document
const viewDocument = (projectId) => {
  router.push({ name: 'DocumentPreview', params: { id: projectId } })
}
</script>
<style scoped>
/* Cacher la scrollbar horizontale et verticale */
.hide-scrollbar::-webkit-scrollbar {
  display: none; /* Chrome, Safari, Opera */
}
.hide-scrollbar {
  -ms-overflow-style: none; /* IE & Edge */
  scrollbar-width: none; /* Firefox */
}
</style>
