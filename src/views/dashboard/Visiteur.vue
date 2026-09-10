<template>
  <div class="flex min-h-screen bg-gray-50 font-sans">
    <main class="flex-1 p-8 overflow-hidden">
      <!-- Page header -->
      <div class="flex items-center justify-between mb-6">
        <h2 class="text-3xl font-bold text-primary">Attendance</h2>
        <div class="flex items-center gap-4">
          <button
            class="rounded-full w-10 h-10 bg-white shadow flex items-center justify-center hover:bg-gray-100"
          >
            <i class="bx bx-bell text-2xl text-gray-600"></i>
          </button>
          <img :src="avatarDefaut" class="w-10 h-10 rounded-full object-cover" alt="profile" />
        </div>
      </div>

      <!-- Statistic cards -->
      <div class="grid grid-cols-4 gap-6 mb-8">
        <div class="bg-white p-5 rounded-xl shadow-md">
          <p class="text-gray-500 text-sm">Total Employee</p>
          <h3 class="text-2xl font-bold">32</h3>
          <p class="text-green-500 text-sm mt-1">
            <i class="bx bx-up-arrow-alt"></i> 12.04% Last 30 days
          </p>
        </div>
        <div class="bg-white p-5 rounded-xl shadow-md">
          <p class="text-gray-500 text-sm">Total Presents</p>
          <h3 class="text-2xl font-bold">19</h3>
          <p class="text-green-500 text-sm mt-1">
            <i class="bx bx-up-arrow-alt"></i> 28.00% Last 30 days
          </p>
        </div>
        <div class="bg-white p-5 rounded-xl shadow-md">
          <p class="text-gray-500 text-sm">Total Absents</p>
          <h3 class="text-2xl font-bold">05</h3>
          <p class="text-green-500 text-sm mt-1">
            <i class="bx bx-up-arrow-alt"></i> 14.11% Last 30 days
          </p>
        </div>
        <div class="bg-white p-5 rounded-xl shadow-md">
          <p class="text-gray-500 text-sm">Total Leave</p>
          <h3 class="text-2xl font-bold">08</h3>
          <p class="text-red-500 text-sm mt-1">
            <i class="bx bx-down-arrow-alt"></i> 4.06% Last 30 days
          </p>
        </div>
      </div>

      <!-- Liste des utilisateurs -->
      <div v-if="showList" class="p-6">
        <!-- Header de la table -->
        <div class="flex items-center justify-between mb-4">
          <div class="flex items-center gap-3">
            <div class="flex items-center gap-2 bg-white px-4 py-2 rounded-lg shadow-sm">
              <button @click="prevDay" class="p-1 rounded-md hover:bg-gray-100">
                <i class="bx bx-chevron-left text-xl text-gray-600"></i>
              </button>
              <div class="text-gray-700 font-medium">
                <div class="text-sm">{{ formattedDate }}</div>
              </div>
              <button @click="nextDay" class="p-1 rounded-md hover:bg-gray-100">
                <i class="bx bx-chevron-right text-xl text-gray-600"></i>
              </button>

              <div class="ml-3 relative">
                <button
                  @click="toggleYearDropdown"
                  class="flex items-center gap-2 text-gray-700 px-3 py-1 rounded-md hover:bg-gray-50"
                >
                  <span class="font-medium">{{ year }}</span>
                  <i class="bx bx-chevron-down text-gray-600"></i>
                </button>
                <div
                  v-if="yearDropdown"
                  class="absolute left-0 mt-2 bg-white border rounded-md shadow-md py-2 w-28 z-10"
                >
                  <button
                    class="w-full text-left px-3 py-1 hover:bg-gray-100"
                    @click="selectYear(2024)"
                  >
                    2024
                  </button>
                  <button
                    class="w-full text-left px-3 py-1 hover:bg-gray-100"
                    @click="selectYear(2025)"
                  >
                    2025
                  </button>
                  <button
                    class="w-full text-left px-3 py-1 hover:bg-gray-100"
                    @click="selectYear(2026)"
                  >
                    2026
                  </button>
                </div>
              </div>
            </div>
          </div>

          <div class="flex items-center gap-3">
            <div class="relative">
              <input
                v-model="searchQuery"
                type="text"
                placeholder="Search"
                class="border border-gray-300 rounded-lg px-10 py-2 focus:outline-none focus:ring-2 focus:ring-ink"
              />
              <i class="bx bx-search absolute left-3 top-2.5 text-gray-400 text-lg"></i>
            </div>

            <button
              @click="toggleFilter"
              class="flex items-center gap-2 border border-gray-300 px-3 py-2 rounded-lg hover:bg-gray-50"
            >
              <i class="bx bx-filter-alt text-gray-600"></i>
              <span class="text-sm">Filter</span>
            </button>

            <router-link
              to="/dashboard/utilisateur/ajouter"
              class="bg-primary text-white px-4 py-2 rounded-lg shadow-md hover:bg-primary-dark transition flex items-center gap-2"
            >
              <i class="bx bx-plus text-lg"></i>
              Add New Employee
            </router-link>
          </div>
        </div>

        <div class="bg-white rounded-xl shadow-md w-full overflow-hidden">
          <table class="w-full text-left border-collapse min-w-max">
            <thead class="bg-primary text-white">
              <tr>
                <th class="p-4 border-none whitespace-nowrap">Employee name</th>
                <th class="p-4 border-none whitespace-nowrap">Clock-in & Out</th>
                <th class="p-4 border-none whitespace-nowrap">Break time</th>
                <th class="p-4 border-none whitespace-nowrap">Overtime</th>
                <th class="p-4 border-none whitespace-nowrap">Status</th>
                <th class="p-4 border-none whitespace-nowrap">Action</th>
              </tr>
            </thead>
            <tbody>
              <tr
                v-for="(emp, index) in paginatedEmployees"
                :key="emp.id"
                :class="[index % 2 === 0 ? 'bg-gray-100' : 'bg-gray-200', 'hover:bg-gray-50']"
              >
                <td class="p-4 flex items-center gap-3 border-none whitespace-nowrap">
                  <input type="checkbox" class="h-4 w-4" />
                  <img :src="emp.image" alt="avatar" class="h-10 w-10 rounded-full object-cover" />
                  <div>
                    <p class="font-semibold text-gray-800">{{ emp.name }}</p>
                    <p class="text-gray-400 text-sm">{{ emp.email }}</p>
                  </div>
                </td>
                <td class="p-4 border-none whitespace-nowrap">
                  <div class="text-sm">{{ emp.clockIn }} — {{ emp.clockOut }}</div>
                  <div class="text-xs text-gray-400">{{ emp.totalHours }}</div>
                </td>
                <td class="p-4 border-none whitespace-nowrap">{{ emp.breakTime }}</td>
                <td class="p-4 border-none whitespace-nowrap">{{ emp.overtime }}</td>
                <td class="p-4 border-none whitespace-nowrap">
                  <span
                    :class="
                      emp.status === 'On time'
                        ? 'bg-green-100 text-green-600'
                        : 'bg-red-100 text-red-600'
                    "
                    class="px-3 py-1 rounded-full text-sm font-medium whitespace-nowrap"
                  >
                    {{ emp.status }}
                  </span>
                </td>
                <td class="p-4 text-gray-500 text-xl relative border-none whitespace-nowrap">
                  <div class="relative">
                    <button
                      @click="toggleActions(emp.id)"
                      class="flex items-center justify-center gap-1 px-3 py-1 hover:bg-gray-50 whitespace-nowrap"
                    >
                      <i class="bx bx-dots-vertical text-lg"></i>
                    </button>
                    <div
                      v-if="activeMenuId === emp.id"
                      class="absolute right-0 mt-2 bg-white rounded-md shadow-md flex flex-col gap-1 w-36 z-10"
                    >
                      <button
                        @click="editEmployee(emp)"
                        class="flex items-center gap-2 px-3 py-2 hover:bg-gray-100 text-black text-sm whitespace-nowrap"
                      >
                        <i class="bx bx-pencil"></i> Modifier
                      </button>
                      <button
                        @click="deleteEmployee(emp)"
                        class="flex items-center gap-2 px-3 py-2 hover:bg-gray-100 text-black text-sm whitespace-nowrap"
                      >
                        <i class="bx bx-trash"></i> Supprimer
                      </button>
                      <button
                        @click="addEmployee(emp)"
                        class="flex items-center gap-2 px-3 py-2 hover:bg-gray-100 text-black text-sm whitespace-nowrap"
                      >
                        <i class="bx bx-plus-circle"></i> Ajouter
                      </button>
                    </div>
                  </div>
                </td>
              </tr>
              <tr v-if="paginatedEmployees.length === 0">
                <td colspan="6" class="p-6 text-center text-gray-500 border-none">
                  No visitors found.
                </td>
              </tr>
            </tbody>
          </table>
        </div>

        <!-- Pagination -->
        <div class="flex items-center justify-between px-4 py-3 bg-white border-t mt-4">
          <div class="flex items-center gap-2">
            <span class="text-gray-600 text-sm">Show</span>
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
                <button
                  class="w-full px-3 py-1 text-left hover:bg-gray-100"
                  @click="setPerPage(15)"
                >
                  15
                </button>
                <button
                  class="w-full px-3 py-1 text-left hover:bg-gray-100"
                  @click="setPerPage(10)"
                >
                  10
                </button>
                <button class="w-full px-3 py-1 text-left hover:bg-gray-100" @click="setPerPage(5)">
                  5
                </button>
              </div>
            </div>
            <span class="text-gray-600 text-sm">Employees per page</span>
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
    </main>
  </div>
</template>

<script setup lang="ts">
import avatarDefaut from '@/assets/avatar-defaut.svg'
import { ref, computed } from 'vue'

// Interface pour un employé
interface Employee {
  id: string
  name: string
  email: string
  image: string
  clockIn: string
  clockOut: string
  totalHours: string
  breakTime: string
  overtime: string
  status: 'On time' | 'Late'
  dept: string
}

/* UI state */
const showList = ref(true)
const searchQuery = ref('')
const showFilterPanel = ref(false)
const yearDropdown = ref(false)
const perPageDropdown = ref(false)
const perPage = ref(15)
const currentPage = ref(1)
const filterStatus = ref('')
const filterDept = ref('')
const year = ref(2025)
const activeMenuId = ref<string | null>(null)

/* Date handling - dynamic */
const currentDate = ref(new Date()) // objet Date réel

// Formate la date en "Monday 05 October"
const formattedDate = computed(() => {
  const date = currentDate.value
  const options: Intl.DateTimeFormatOptions = {
    weekday: 'long',
    day: 'numeric',
    month: 'long',
  }
  return date.toLocaleDateString('en-US', options)
})

function prevDay() {
  const newDate = new Date(currentDate.value)
  newDate.setDate(newDate.getDate() - 1)
  currentDate.value = newDate
}

function nextDay() {
  const newDate = new Date(currentDate.value)
  newDate.setDate(newDate.getDate() + 1)
  currentDate.value = newDate
}

/* Dropdowns */
function toggleYearDropdown() {
  yearDropdown.value = !yearDropdown.value
}
function selectYear(y: number) {
  year.value = y
  yearDropdown.value = false
}
function toggleFilter() {
  showFilterPanel.value = !showFilterPanel.value
}
function togglePerPageDropdown() {
  perPageDropdown.value = !perPageDropdown.value
}
function setPerPage(n: number) {
  perPage.value = n
  perPageDropdown.value = false
  currentPage.value = 1
}
function goToPage(n: number) {
  if (n < 1) n = 1
  if (n > totalPages.value) n = totalPages.value
  currentPage.value = n
}

// Gestion du menu d'actions
function toggleActions(id: string) {
  activeMenuId.value = activeMenuId.value === id ? null : id
}

/* Actions */
function editEmployee(emp: Employee) {
  alert(`Modifier ${emp.name}`)
  activeMenuId.value = null
}
function deleteEmployee(emp: Employee) {
  alert(`Supprimer ${emp.name}`)
  activeMenuId.value = null
}
function addEmployee(emp: Employee) {
  alert(`Ajouter ${emp.name}`)
  activeMenuId.value = null
}

/* Employees data */
const employees = ref<Employee[]>([
  {
    id: 'E01',
    name: 'Jerome Bell',
    email: 'nuray@alignui.com',
    image: 'https://randomuser.me/api/portraits/men/1.jpg',
    clockIn: '10:02 AM',
    clockOut: '09:10 PM',
    totalHours: '8h 58m',
    breakTime: '10:00–10:15',
    overtime: '2h 10',
    status: 'On time',
    dept: 'Engineering',
  },
  {
    id: 'E02',
    name: 'Liam Carter',
    email: 'liam@alignui.com',
    image: 'https://randomuser.me/api/portraits/men/2.jpg',
    clockIn: '12:02 PM',
    clockOut: '09:00 PM',
    totalHours: '8h 58m',
    breakTime: '11:00–11:10',
    overtime: '-',
    status: 'Late',
    dept: 'Sales',
  },
  {
    id: 'E03',
    name: 'Maya Ross',
    email: 'maya@alignui.com',
    image: 'https://randomuser.me/api/portraits/women/3.jpg',
    clockIn: '10:02 AM',
    clockOut: '09:10 PM',
    totalHours: '8h 58m',
    breakTime: '11:00–11:10',
    overtime: '2h 10',
    status: 'Late',
    dept: 'Design',
  },
  {
    id: 'E04',
    name: 'Ethan Cole',
    email: 'ethan@alignui.com',
    image: 'https://randomuser.me/api/portraits/men/4.jpg',
    clockIn: '10:02 AM',
    clockOut: '09:10 PM',
    totalHours: '8h 58m',
    breakTime: '12:00–12:20',
    overtime: '2h 10',
    status: 'On time',
    dept: 'Engineering',
  },
  {
    id: 'E05',
    name: 'Ava Brooks',
    email: 'ava@alignui.com',
    image: 'https://randomuser.me/api/portraits/women/5.jpg',
    clockIn: '10:02 AM',
    clockOut: '07:00 PM',
    totalHours: '8h 58m',
    breakTime: '10:00–10:15',
    overtime: '-',
    status: 'On time',
    dept: 'Sales',
  },
  {
    id: 'E06',
    name: 'Noah Reed',
    email: 'noah@alignui.com',
    image: 'https://randomuser.me/api/portraits/men/6.jpg',
    clockIn: '10:02 AM',
    clockOut: '09:10 PM',
    totalHours: '8h 58m',
    breakTime: '11:00–11:10',
    overtime: '2h 10',
    status: 'On time',
    dept: 'Design',
  },
  {
    id: 'E07',
    name: 'Chloe Dean',
    email: 'chloe@alignui.com',
    image: 'https://randomuser.me/api/portraits/women/7.jpg',
    clockIn: '10:02 AM',
    clockOut: '07:00 PM',
    totalHours: '8h 58m',
    breakTime: '12:00–12:20',
    overtime: '-',
    status: 'On time',
    dept: 'Engineering',
  },
  {
    id: 'E08',
    name: 'Owen Hayes',
    email: 'owen@alignui.com',
    image: 'https://randomuser.me/api/portraits/men/8.jpg',
    clockIn: '10:02 AM',
    clockOut: '09:10 PM',
    totalHours: '8h 58m',
    breakTime: '10:00–10:15',
    overtime: '2h 10',
    status: 'On time',
    dept: 'Sales',
  },
  {
    id: 'E09',
    name: 'Zara Lane',
    email: 'zara@alignui.com',
    image: 'https://randomuser.me/api/portraits/women/9.jpg',
    clockIn: '09:30 AM',
    clockOut: '06:30 PM',
    totalHours: '9h 0m',
    breakTime: '11:30–11:50',
    overtime: '-',
    status: 'Late',
    dept: 'Design',
  },
  {
    id: 'E10',
    name: 'Lucas Ford',
    email: 'lucas@alignui.com',
    image: 'https://randomuser.me/api/portraits/men/10.jpg',
    clockIn: '09:30 AM',
    clockOut: '06:30 PM',
    totalHours: '9h 0m',
    breakTime: '11:30–11:50',
    overtime: '-',
    status: 'Late',
    dept: 'Design',
  },
])

/* Computed filtered + paginated */
const filteredEmployees = computed(() => {
  return employees.value.filter(
    (emp) =>
      emp.name.toLowerCase().includes(searchQuery.value.toLowerCase()) &&
      (filterStatus.value ? emp.status === filterStatus.value : true) &&
      (filterDept.value ? emp.dept === filterDept.value : true),
  )
})
const totalPages = computed(() => Math.ceil(filteredEmployees.value.length / perPage.value))
const paginatedEmployees = computed(() => {
  const start = (currentPage.value - 1) * perPage.value
  return filteredEmployees.value.slice(start, start + perPage.value)
})
const pageNumbers = computed(() => Array.from({ length: totalPages.value }, (_, i) => i + 1))
</script>

<style scoped>
body {
  font-family: 'Poppins', sans-serif;
}
</style>
