<template>
  <div class="min-h-screen bg-gray-50 p-6">
    <div class="max-w-5xl mx-auto overflow-hidden">
      <!-- En-tête avec bouton Ajouter -->
      <div class="mb-8">
        <div class="flex justify-between items-center mb-4">
          <h1 class="text-3xl font-bold text-gray-900">Liste des Tâches - SecureCheck</h1>
          <button
            @click="addTask"
            class="px-6 py-2 bg-primary text-white rounded-lg hover:bg-primary-dark transition-colors flex items-center gap-2"
          >
            <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path
                stroke-linecap="round"
                stroke-linejoin="round"
                stroke-width="2"
                d="M12 4v16m8-8H4"
              />
            </svg>
            Ajouter une Tâche
          </button>
        </div>

        <p class="text-gray-600 mb-4">A. Rechercher par nom, objet ou email,</p>

        <!-- Barre de recherche et filtres -->
        <div class="flex flex-col sm:flex-row gap-4 mb-6">
          <input
            type="text"
            placeholder="Rechercher..."
            class="flex-1 px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent"
            v-model="searchQuery"
          />
          <input
            type="date"
            class="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent"
            v-model="dateFilter"
          />
          <button
            class="px-6 py-2 bg-primary text-white rounded-lg hover:bg-primary-dark transition-colors"
          >
            Filtrer
          </button>
        </div>
      </div>

      <!-- Tableau des tâches -->
      <div class="bg-white rounded-lg shadow overflow-hidden">
        <div class="overflow-x-auto scrollbar-hide w-full max-w-full">
          <table class="min-w-full divide-y divide-gray-200">
            <thead class="bg-gray-50">
              <tr>
                <th
                  class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider"
                >
                  Date création
                </th>
                <th
                  class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider"
                >
                  Parent
                </th>
                <th
                  class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider"
                >
                  Titre
                </th>
                <th
                  class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider"
                >
                  Assigné à
                </th>
                <th
                  class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider"
                >
                  Priorité
                </th>
                <th
                  class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider"
                >
                  Date début
                </th>
                <th
                  class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider"
                >
                  Date fin
                </th>
                <th
                  class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider"
                >
                  Temps prévue (heure)
                </th>
                <th
                  class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider"
                >
                  Temps réel d'exécution (heure)
                </th>
                <th
                  class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider"
                >
                  Status
                </th>
                <th
                  class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider"
                >
                  Créée par
                </th>
                <th
                  class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider"
                >
                  Actions
                </th>
              </tr>
            </thead>
            <tbody class="bg-white divide-y divide-gray-200">
              <tr v-for="task in filteredTasks" :key="task.id" class="hover:bg-gray-50">
                <td class="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                  {{ task.creationDate }}
                </td>
                <td class="px-6 py-4 whitespace-nowrap text-sm text-gray-900">{{ task.parent }}</td>
                <td class="px-6 py-4 whitespace-nowrap text-sm font-medium text-primary">
                  {{ task.title }}
                </td>
                <td class="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                  {{ task.assignedTo }}
                </td>
                <td class="px-6 py-4 whitespace-nowrap">
                  <span
                    :class="getPriorityClass(task.priority)"
                    class="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium"
                  >
                    {{ task.priority }}
                  </span>
                </td>
                <td class="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                  {{ task.startDate }}
                </td>
                <td class="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                  {{ task.endDate }}
                </td>
                <td class="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                  {{ task.estimatedTime }}
                </td>
                <td class="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                  <div class="flex items-center gap-2">
                    {{ task.actualTime }}
                    <!-- Icône horloge cliquable -->
                    <button
                      @click="viewTimeEntries(task.id)"
                      class="text-primary hover:text-primary-dark p-1 rounded"
                      title="Voir le temps réel"
                    >
                      <i class="bx bx-time text-lg"></i>
                    </button>
                  </div>
                </td>
                <td class="px-6 py-4 whitespace-nowrap">
                  <span
                    :class="getStatusClass(task.status)"
                    class="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium"
                  >
                    {{ task.status }}
                  </span>
                </td>
                <td class="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                  {{ task.createdBy }}
                </td>
                <td class="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                  <div class="flex items-center gap-2">
                    <!-- Bouton Éditer -->
                    <button
                      @click="editTask(task.id)"
                      class="text-primary hover:text-primary-dark p-1 rounded"
                      title="Éditer"
                    >
                      <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path
                          stroke-linecap="round"
                          stroke-linejoin="round"
                          stroke-width="2"
                          d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z"
                        />
                      </svg>
                    </button>

                    <!-- Bouton Commentaire -->
                    <button
                      @click="viewComments(task.id)"
                      class="text-primary hover:text-primary-dark p-1 rounded"
                      title="Commentaire"
                    >
                      <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path
                          stroke-linecap="round"
                          stroke-linejoin="round"
                          stroke-width="2"
                          d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z"
                        />
                      </svg>
                    </button>
                  </div>
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
const dateFilter = ref('')

const tasks = ref([
  {
    id: 1,
    creationDate: '23/10/2025',
    parent: 'API List',
    title: 'Update liste',
    assignedTo: 'Employee Admin',
    priority: 'Urgente',
    startDate: '23/10/2025',
    endDate: '23/10/2025',
    estimatedTime: 4,
    actualTime: 15,
    status: 'Terminé',
    createdBy: 'Employee Admin',
  },
  {
    id: 2,
    creationDate: '23/10/2025',
    parent: 'Accune',
    title: 'Edit List',
    assignedTo: 'Employee Admin',
    priority: 'Urgente',
    startDate: '23/10/2025',
    endDate: '23/10/2025',
    estimatedTime: 1,
    actualTime: 1,
    status: 'Terminé',
    createdBy: 'Employee Admin',
  },
  {
    id: 3,
    creationDate: '23/10/2025',
    parent: 'Accune',
    title: 'API List',
    assignedTo: 'Employee Admin',
    priority: 'Urgente',
    startDate: '23/10/2025',
    endDate: '23/10/2025',
    estimatedTime: 0,
    actualTime: 0,
    status: 'A faire',
    createdBy: 'Employee Admin',
  },
  {
    id: 4,
    creationDate: '17/10/2025',
    parent: 'Accune',
    title: 'Api create',
    assignedTo: 'Employee Admin',
    priority: 'Urgente',
    startDate: '17/10/2025',
    endDate: '17/10/2025',
    estimatedTime: 2,
    actualTime: 0,
    status: 'A faire',
    createdBy: 'Employee Admin',
  },
])

const filteredTasks = computed(() => {
  let filtered = tasks.value

  if (searchQuery.value) {
    filtered = filtered.filter(
      (task) =>
        task.title.toLowerCase().includes(searchQuery.value.toLowerCase()) ||
        task.parent.toLowerCase().includes(searchQuery.value.toLowerCase()) ||
        task.assignedTo.toLowerCase().includes(searchQuery.value.toLowerCase()),
    )
  }

  if (dateFilter.value) {
    filtered = filtered.filter((task) => task.creationDate === dateFilter.value)
  }

  return filtered
})

const getPriorityClass = () => {
  return 'bg-red-100 text-red-800'
}

const getStatusClass = (status) => {
  switch (status) {
    case 'Terminé':
      return 'bg-green-100 text-green-800'
    case 'A faire':
      return 'bg-gray-100 text-gray-800'
    case 'En cours':
      return 'bg-yellow-100 text-yellow-800'
    default:
      return 'bg-gray-100 text-gray-800'
  }
}

const addTask = () => {
  router.push({ name: 'AddTask' })
}

const editTask = (taskId) => {
  router.push({ name: 'EditTask', params: { id: taskId } })
}

const viewTimeEntries = (taskId) => {
  router.push({ name: 'TimeEntries', params: { id: taskId } })
}

const viewComments = (taskId) => {
  router.push({ name: 'TaskComments', params: { id: taskId } })
}
</script>

<style scoped>
/* Masquer la scrollbar pour tous les navigateurs */
.scrollbar-hide::-webkit-scrollbar {
  display: none;
}
.scrollbar-hide {
  -ms-overflow-style: none; /* IE et Edge */
  scrollbar-width: none; /* Firefox */
}
</style>
