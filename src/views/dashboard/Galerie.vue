<template>
  <div class="photos-dashboard">
    <!-- En-tête -->
    <div class="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-6">
      <div>
        <h2 class="text-2xl font-bold text-gray-800">Galerie photo</h2>
        <p class="text-gray-600 mt-1">Gérez toutes les photos de votre site</p>
      </div>
      <button
        @click="openModal('add')"
        class="bg-primary text-white px-5 py-2.5 rounded-lg hover:bg-primary-dark transition-colors flex items-center gap-2 shadow-md"
      >
        <i class='bx bx-plus-circle text-xl'></i>
        Ajouter des photos
      </button>
    </div>

    <!-- Statistiques -->
    <div class="grid grid-cols-2 sm:grid-cols-4 gap-4 mb-6">
      <div class="bg-white rounded-xl shadow-md p-4 text-center">
        <p class="text-2xl font-bold text-primary">{{ totalPhotos }}</p>
        <p class="text-sm text-gray-600">Total photos</p>
      </div>
      <div class="bg-white rounded-xl shadow-md p-4 text-center">
        <p class="text-2xl font-bold text-blue-600">{{ totalAlbums }}</p>
        <p class="text-sm text-gray-600">Albums</p>
      </div>
      <div class="bg-white rounded-xl shadow-md p-4 text-center">
        <p class="text-2xl font-bold text-green-600">{{ totalVues }}</p>
        <p class="text-sm text-gray-600">Total vues</p>
      </div>
      <div class="bg-white rounded-xl shadow-md p-4 text-center">
        <p class="text-2xl font-bold text-purple-600">{{ espaceUtilise }}</p>
        <p class="text-sm text-gray-600">Espace utilisé</p>
      </div>
    </div>

    <!-- Filtres -->
    <div class="bg-white rounded-xl shadow-md p-4 mb-6">
      <div class="flex flex-col md:flex-row gap-4">
        <div class="flex-1 relative">
          <i class='bx bx-search absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400'></i>
          <input
            v-model="searchQuery"
            type="text"
            placeholder="Rechercher une photo..."
            class="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-secondary"
          >
        </div>

        <select
          v-model="filtreAlbum"
          class="px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-secondary"
        >
          <option value="">Tous les albums</option>
          <option v-for="album in albums" :key="album.id" :value="album.id">
            {{ album.nom }}
          </option>
        </select>

        <select
          v-model="tri"
          class="px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-secondary"
        >
          <option value="recent">Plus récentes</option>
          <option value="ancien">Plus anciennes</option>
          <option value="vues">Plus vues</option>
          <option value="titre">Titre A-Z</option>
        </select>
      </div>
    </div>

    <!-- Grille des albums -->
    <div v-if="showAlbums" class="mb-8">
      <div class="flex items-center justify-between mb-4">
        <h3 class="text-lg font-semibold text-gray-800">Albums</h3>
        <button @click="openAlbumModal('add')" class="text-primary text-sm hover:underline flex items-center gap-1">
          <i class='bx bx-plus-circle'></i>
          Nouvel album
        </button>
      </div>
      <div class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
        <div
          v-for="album in albums"
          :key="album.id"
          class="bg-white rounded-xl shadow-md overflow-hidden hover:shadow-lg transition-all cursor-pointer group"
          @click="filterByAlbum(album.id)"
        >
          <div class="relative h-40 overflow-hidden">
            <img :src="album.couverture" alt="Album" class="w-full h-full object-cover group-hover:scale-110 transition-transform duration-300">
            <div class="absolute inset-0 bg-black/40 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
              <i class='bx bx-images text-white text-3xl'></i>
            </div>
          </div>
          <div class="p-4">
            <h4 class="font-semibold text-gray-800">{{ album.nom }}</h4>
            <p class="text-sm text-gray-500 mt-1">{{ album.nbPhotos }} photos</p>
            <div class="flex justify-between items-center mt-3">
              <span class="text-xs text-gray-400">{{ album.date }}</span>
              <div class="flex gap-2">
                <button @click.stop="editAlbum(album)" class="text-secondary hover:text-secondary-dark">
                  <i class='bx bx-edit-alt'></i>
                </button>
                <button @click.stop="deleteAlbum(album.id)" class="text-red-600 hover:text-red-800">
                  <i class='bx bx-trash'></i>
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>

    <!-- Grille des photos -->
    <div>
      <div class="flex items-center justify-between mb-4">
        <h3 class="text-lg font-semibold text-gray-800">
          {{ filtreAlbum ? getAlbumNom(filtreAlbum) : 'Toutes les photos' }}
          <span class="text-sm font-normal text-gray-500 ml-2">({{ photosFiltrees.length }} photos)</span>
        </h3>
        <div class="flex gap-2">
          <button
            @click="toggleViewMode"
            class="p-2 rounded-lg border hover:bg-gray-50"
            :class="viewMode === 'grid' ? 'bg-primary text-white' : 'text-gray-600'"
          >
            <i class='bx bx-grid-alt text-xl'></i>
          </button>
          <button
            @click="toggleViewMode"
            class="p-2 rounded-lg border hover:bg-gray-50"
            :class="viewMode === 'list' ? 'bg-primary text-white' : 'text-gray-600'"
          >
            <i class='bx bx-list-ul text-xl'></i>
          </button>
        </div>
      </div>

      <!-- Vue en grille -->
      <div v-if="viewMode === 'grid'" class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
        <div
          v-for="photo in photosPaginees"
          :key="photo.id"
          class="bg-white rounded-xl shadow-md overflow-hidden hover:shadow-xl transition-all group"
        >
          <div class="relative h-56 overflow-hidden">
            <img :src="photo.url" :alt="photo.titre" class="w-full h-full object-cover group-hover:scale-110 transition-transform duration-300">
            <div class="absolute inset-0 bg-black/50 flex items-center justify-center gap-3 opacity-0 group-hover:opacity-100 transition-opacity">
              <button @click="viewPhoto(photo)" class="bg-white text-primary p-2 rounded-full hover:scale-110 transition-transform">
                <i class='bx bx-show'></i>
              </button>
              <button @click="editPhoto(photo)" class="bg-white text-secondary p-2 rounded-full hover:scale-110 transition-transform">
                <i class='bx bx-edit-alt'></i>
              </button>
              <button @click="deletePhoto(photo.id)" class="bg-white text-red-600 p-2 rounded-full hover:scale-110 transition-transform">
                <i class='bx bx-trash'></i>
              </button>
            </div>
          </div>
          <div class="p-4">
            <h4 class="font-semibold text-gray-800 truncate">{{ photo.titre }}</h4>
            <p class="text-sm text-gray-500 mt-1 line-clamp-2">{{ photo.description }}</p>
            <div class="flex justify-between items-center mt-3">
              <span class="text-xs text-gray-400">{{ photo.albumNom }}</span>
              <span class="text-xs text-gray-400">{{ photo.vues }} vues</span>
            </div>
          </div>
        </div>
      </div>

      <!-- Vue en liste -->
      <div v-if="viewMode === 'list'" class="bg-white rounded-xl shadow-md overflow-hidden">
        <div class="overflow-x-auto">
          <table class="w-full">
            <thead class="bg-gray-50 border-b">
              <tr>
                <th class="px-6 py-3 text-left text-xs font-medium text-gray-500">Aperçu</th>
                <th class="px-6 py-3 text-left text-xs font-medium text-gray-500">Titre</th>
                <th class="px-6 py-3 text-left text-xs font-medium text-gray-500">Album</th>
                <th class="px-6 py-3 text-left text-xs font-medium text-gray-500">Date</th>
                <th class="px-6 py-3 text-left text-xs font-medium text-gray-500">Vues</th>
                <th class="px-6 py-3 text-left text-xs font-medium text-gray-500">Actions</th>
              </tr>
            </thead>
            <tbody class="divide-y divide-gray-200">
              <tr v-for="photo in photosPaginees" :key="photo.id" class="hover:bg-gray-50">
                <td class="px-6 py-4">
                  <img :src="photo.url" alt="Photo" class="w-12 h-12 rounded-lg object-cover">
                </td>
                <td class="px-6 py-4">
                  <div class="text-sm font-medium text-gray-900">{{ photo.titre }}</div>
                  <div class="text-xs text-gray-500">{{ photo.description }}</div>
                </td>
                <td class="px-6 py-4 text-sm text-gray-600">{{ photo.albumNom }}</td>
                <td class="px-6 py-4 text-sm text-gray-500">{{ formatDate(photo.date) }}</td>
                <td class="px-6 py-4 text-sm text-gray-500">{{ photo.vues }} vues</td>
                <td class="px-6 py-4">
                  <div class="flex gap-2">
                    <button @click="viewPhoto(photo)" class="text-blue-600 hover:text-blue-800">
                      <i class='bx bx-show text-xl'></i>
                    </button>
                    <button @click="editPhoto(photo)" class="text-secondary hover:text-secondary-dark">
                      <i class='bx bx-edit-alt text-xl'></i>
                    </button>
                    <button @click="deletePhoto(photo.id)" class="text-red-600 hover:text-red-800">
                      <i class='bx bx-trash text-xl'></i>
                    </button>
                  </div>
                </td>
              </tr>
            </tbody>
          </table>
        </div>
      </div>

      <!-- Pagination -->
      <div class="mt-6 flex items-center justify-between">
        <div class="text-sm text-gray-500">
          Affichage de {{ (pageCourante - 1) * itemsParPage + 1 }} à {{ Math.min(pageCourante * itemsParPage, photosFiltrees.length) }} sur {{ photosFiltrees.length }} photos
        </div>
        <div class="flex gap-2">
          <button
            @click="pageCourante--"
            :disabled="pageCourante === 1"
            class="px-3 py-1 border rounded-lg hover:bg-gray-50 disabled:opacity-50"
          >
            <i class='bx bx-chevron-left'></i>
          </button>
          <span class="px-3 py-1 bg-primary text-white rounded-lg">{{ pageCourante }}</span>
          <button
            @click="pageCourante++"
            :disabled="pageCourante === totalPages"
            class="px-3 py-1 border rounded-lg hover:bg-gray-50 disabled:opacity-50"
          >
            <i class='bx bx-chevron-right'></i>
          </button>
        </div>
      </div>
    </div>

    <!-- ========== MODAL AJOUTER PHOTO ========== -->
    <Teleport to="body">
      <div v-if="showModal" class="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
        <div class="bg-white rounded-lg w-full max-w-2xl max-h-[90vh] overflow-y-auto">
          <div class="flex justify-between items-center p-4 border-b">
            <h3 class="text-xl font-bold">{{ modalTitle }}</h3>
            <button @click="closeModal" class="text-gray-400 hover:text-gray-600">
              <i class='bx bx-x text-2xl'></i>
            </button>
          </div>

          <form @submit.prevent="savePhoto" class="p-4">
            <!-- Upload multiple -->
            <div v-if="modalMode === 'add'" class="mb-4">
              <label class="block text-sm font-medium text-gray-700 mb-1">Sélectionner des photos *</label>
              <div
                class="border-2 border-dashed border-gray-300 rounded-lg p-8 text-center cursor-pointer hover:border-primary hover:bg-gray-50 transition-all"
                @dragover.prevent
                @drop.prevent="handleDrop"
                @click="$refs.fileInput.click()"
              >
                <i class='bx bx-cloud-upload text-4xl text-primary'></i>
                <p class="mt-2 text-gray-600">Cliquez ou glissez-déposez des photos</p>
                <p class="text-xs text-gray-400">PNG, JPG, JPEG jusqu'à 5MB</p>
                <input
                  type="file"
                  @change="handleMultipleImageUpload"
                  accept="image/*"
                  multiple
                  class="hidden"
                  ref="fileInput"
                >
              </div>
              <div v-if="uploadedFiles.length > 0" class="grid grid-cols-4 gap-2 mt-4">
                <div v-for="(file, index) in uploadedFiles" :key="index" class="relative aspect-square rounded-lg overflow-hidden">
                  <img :src="file.preview" alt="Preview" class="w-full h-full object-cover">
                  <button @click="removeFile(index)" class="absolute top-1 right-1 bg-black/60 text-white rounded-full w-5 h-5 flex items-center justify-center hover:bg-red-600">
                    <i class='bx bx-x text-xs'></i>
                  </button>
                </div>
              </div>
            </div>

            <!-- Photo unique -->
            <div v-else class="mb-4">
              <label class="block text-sm font-medium text-gray-700 mb-1">Photo</label>
              <div class="flex items-center gap-4">
                <input type="file" @change="handleImageUpload" accept="image/*" class="flex-1">
                <div v-if="formPhoto.preview" class="w-16 h-16">
                  <img :src="formPhoto.preview" alt="Preview" class="w-full h-full object-cover rounded">
                </div>
              </div>
            </div>

            <!-- Titre -->
            <div class="mb-4">
              <label class="block text-sm font-medium text-gray-700 mb-1">Titre *</label>
              <input v-model="formPhoto.titre" type="text" required class="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-secondary" placeholder="Titre de la photo">
            </div>

            <!-- Description -->
            <div class="mb-4">
              <label class="block text-sm font-medium text-gray-700 mb-1">Description</label>
              <textarea v-model="formPhoto.description" rows="2" class="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-secondary" placeholder="Description de la photo..."></textarea>
            </div>

            <!-- Album -->
            <div class="mb-4">
              <label class="block text-sm font-medium text-gray-700 mb-1">Album</label>
              <select v-model="formPhoto.albumId" class="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-secondary">
                <option value="">Sans album</option>
                <option v-for="album in albums" :key="album.id" :value="album.id">{{ album.nom }}</option>
              </select>
            </div>

            <!-- Tags -->
            <div class="mb-4">
              <label class="block text-sm font-medium text-gray-700 mb-1">Tags (séparés par des virgules)</label>
              <input v-model="formPhoto.tags" type="text" class="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-secondary" placeholder="ex: événement, diplomatie, conférence">
            </div>

            <div class="flex justify-end gap-3 pt-4 border-t">
              <button type="button" @click="closeModal" class="px-4 py-2 bg-gray-200 text-gray-700 rounded-lg hover:bg-gray-300">Annuler</button>
              <button type="submit" class="px-4 py-2 bg-primary text-white rounded-lg hover:bg-primary-dark">{{ modalButtonText }}</button>
            </div>
          </form>
        </div>
      </div>
    </Teleport>

    <!-- ========== MODAL NOUVEL ALBUM ========== -->
    <Teleport to="body">
      <div v-if="showAlbumModal" class="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
        <div class="bg-white rounded-lg w-full max-w-lg max-h-[90vh] overflow-y-auto">
          <div class="flex justify-between items-center p-4 border-b">
            <h3 class="text-xl font-bold">{{ albumModalTitle }}</h3>
            <button @click="closeAlbumModal" class="text-gray-400 hover:text-gray-600">
              <i class='bx bx-x text-2xl'></i>
            </button>
          </div>
          <form @submit.prevent="saveAlbum" class="p-4">
            <div class="mb-4">
              <label class="block text-sm font-medium text-gray-700 mb-1">Nom de l'album *</label>
              <input v-model="formAlbum.nom" type="text" required class="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-secondary" placeholder="Ex: Visite officielle 2024">
            </div>
            <div class="mb-4">
              <label class="block text-sm font-medium text-gray-700 mb-1">Description</label>
              <textarea v-model="formAlbum.description" rows="2" class="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-secondary" placeholder="Description de l'album..."></textarea>
            </div>
            <div class="mb-4">
              <label class="block text-sm font-medium text-gray-700 mb-1">Photo de couverture</label>
              <input type="file" @change="handleCoverUpload" accept="image/*" class="w-full">
              <div v-if="formAlbum.coverPreview" class="mt-2">
                <img :src="formAlbum.coverPreview" alt="Cover" class="w-24 h-24 object-cover rounded-lg">
              </div>
            </div>
            <div class="flex justify-end gap-3 pt-4 border-t">
              <button type="button" @click="closeAlbumModal" class="px-4 py-2 bg-gray-200 text-gray-700 rounded-lg hover:bg-gray-300">Annuler</button>
              <button type="submit" class="px-4 py-2 bg-primary text-white rounded-lg hover:bg-primary-dark">{{ albumModalButtonText }}</button>
            </div>
          </form>
        </div>
      </div>
    </Teleport>

    <!-- ========== MODAL VOIR PHOTO ========== -->
    <Teleport to="body">
      <div v-if="showViewModal" class="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50" @click.self="closeViewModal">
        <div class="bg-white rounded-lg w-full max-w-3xl max-h-[90vh] overflow-y-auto">
          <div class="flex justify-between items-center p-4 border-b">
            <h3 class="text-xl font-bold">{{ viewPhotoData.titre }}</h3>
            <button @click="closeViewModal" class="text-gray-400 hover:text-gray-600">
              <i class='bx bx-x text-2xl'></i>
            </button>
          </div>
          <div class="p-4">
            <img :src="viewPhotoData.url" alt="Photo" class="w-full max-h-[400px] object-contain rounded-lg mb-4">
            <p class="text-gray-600 mb-4">{{ viewPhotoData.description }}</p>
            <div class="flex gap-4 text-sm text-gray-500 mb-4">
              <span><i class='bx bx-calendar'></i> {{ formatDate(viewPhotoData.date) }}</span>
              <span><i class='bx bx-photo-album'></i> {{ viewPhotoData.albumNom }}</span>
              <span><i class='bx bx-show'></i> {{ viewPhotoData.vues }} vues</span>
            </div>
            <div v-if="viewPhotoData.tags" class="pt-4 border-t">
              <span class="font-medium text-sm text-gray-600">Tags :</span>
              <div class="flex gap-2 mt-1 flex-wrap">
                <span v-for="tag in viewPhotoData.tags.split(',')" :key="tag" class="bg-gray-100 text-gray-700 px-2 py-1 rounded-full text-xs">
                  {{ tag.trim() }}
                </span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </Teleport>
  </div>
</template>

<script setup>
import { ref, computed, onMounted } from 'vue'

// ==================== IMPORT DES IMAGES ====================
// Photos principales
import rencontreOfficielleImage from '@/assets/images/activites.jpeg'
import signatureAccordImage from '@/assets/images/actualite1.jpg'
import feteNationalePhoto from '@/assets/images/actualite2.jpg'
import conferencePresseImage from '@/assets/images/actualite3.jpg'
import remiseLettresImage from '@/assets/images/actualite4.jpg'
import galaDiplomatiqueImage from '@/assets/images/ambassadeur.jpeg'
import seminaireEconomiqueImage from '@/assets/images/Cascade.jpg'
import visiteCulturelleImage from '@/assets/images/partenaire.jpg'

// Images de couverture des albums
import visitesOfficiellesCover from '@/assets/images/president.jpeg'
import ceremoniesCover from '@/assets/images/hero5.jpg'
import conferencesCover from '@/assets/images/hero6.jpg'

// Données
const photos = ref([])
const albums = ref([])
const searchQuery = ref('')
const filtreAlbum = ref('')
const tri = ref('recent')
const pageCourante = ref(1)
const itemsParPage = 12
const viewMode = ref('grid')
const showAlbums = ref(true)

// Modals
const showModal = ref(false)
const showViewModal = ref(false)
const showAlbumModal = ref(false)
const modalMode = ref('add')
const albumModalMode = ref('add')
const editId = ref(null)
const editAlbumId = ref(null)

// Upload multiple
const uploadedFiles = ref([])
const fileInput = ref(null)

// Formulaires
const formPhoto = ref({
  titre: '',
  description: '',
  albumId: '',
  tags: '',
  preview: '',
  file: null
})

const formAlbum = ref({
  nom: '',
  description: '',
  coverPreview: '',
  coverFile: null
})

const viewPhotoData = ref({})

// Computed
const totalPhotos = computed(() => photos.value.length)
const totalAlbums = computed(() => albums.value.length)
const totalVues = computed(() => photos.value.reduce((sum, p) => sum + p.vues, 0))
const espaceUtilise = computed(() => {
  const totalSize = photos.value.reduce((sum, p) => sum + (p.size || 0), 0)
  if (totalSize < 1024) return `${totalSize} KB`
  if (totalSize < 1048576) return `${(totalSize / 1024).toFixed(1)} MB`
  return `${(totalSize / 1048576).toFixed(1)} GB`
})

const modalTitle = computed(() => modalMode.value === 'add' ? 'Ajouter des photos' : 'Modifier la photo')
const modalButtonText = computed(() => modalMode.value === 'add' ? 'Ajouter' : 'Enregistrer')
const albumModalTitle = computed(() => albumModalMode.value === 'add' ? 'Nouvel album' : 'Modifier l\'album')
const albumModalButtonText = computed(() => albumModalMode.value === 'add' ? 'Créer' : 'Modifier')

const photosFiltrees = computed(() => {
  let result = [...photos.value]

  if (searchQuery.value) {
    result = result.filter(p =>
      p.titre.toLowerCase().includes(searchQuery.value.toLowerCase()) ||
      p.description.toLowerCase().includes(searchQuery.value.toLowerCase())
    )
  }

  if (filtreAlbum.value) {
    result = result.filter(p => p.albumId === filtreAlbum.value)
  }

  switch(tri.value) {
    case 'recent':
      result.sort((a, b) => new Date(b.date) - new Date(a.date))
      break
    case 'ancien':
      result.sort((a, b) => new Date(a.date) - new Date(b.date))
      break
    case 'vues':
      result.sort((a, b) => b.vues - a.vues)
      break
    case 'titre':
      result.sort((a, b) => a.titre.localeCompare(b.titre))
      break
  }

  return result
})

const photosPaginees = computed(() => {
  const start = (pageCourante.value - 1) * itemsParPage
  const end = start + itemsParPage
  return photosFiltrees.value.slice(start, end)
})

const totalPages = computed(() => Math.ceil(photosFiltrees.value.length / itemsParPage))

// Fonctions
const formatDate = (date) => {
  return new Date(date).toLocaleDateString('fr-FR', {
    day: 'numeric',
    month: 'long',
    year: 'numeric'
  })
}

const getAlbumNom = (albumId) => {
  const album = albums.value.find(a => a.id === albumId)
  return album ? album.nom : 'Tous'
}

const filterByAlbum = (albumId) => {
  filtreAlbum.value = filtreAlbum.value === albumId ? '' : albumId
  pageCourante.value = 1
}

const toggleViewMode = () => {
  viewMode.value = viewMode.value === 'grid' ? 'list' : 'grid'
}

// Gestion des fichiers
const handleMultipleImageUpload = (event) => {
  const files = Array.from(event.target.files)
  files.forEach(file => {
    if (file.type.startsWith('image/')) {
      const reader = new FileReader()
      reader.onload = (e) => {
        uploadedFiles.value.push({
          file: file,
          preview: e.target.result,
          titre: file.name.replace(/\.[^/.]+$/, ''),
          description: ''
        })
      }
      reader.readAsDataURL(file)
    }
  })
}

const handleDrop = (event) => {
  const files = Array.from(event.dataTransfer.files)
  files.forEach(file => {
    if (file.type.startsWith('image/')) {
      const reader = new FileReader()
      reader.onload = (e) => {
        uploadedFiles.value.push({
          file: file,
          preview: e.target.result,
          titre: file.name.replace(/\.[^/.]+$/, ''),
          description: ''
        })
      }
      reader.readAsDataURL(file)
    }
  })
}

const handleImageUpload = (event) => {
  const file = event.target.files[0]
  if (file) {
    formPhoto.value.file = file
    const reader = new FileReader()
    reader.onload = (e) => {
      formPhoto.value.preview = e.target.result
    }
    reader.readAsDataURL(file)
  }
}

const handleCoverUpload = (event) => {
  const file = event.target.files[0]
  if (file) {
    formAlbum.value.coverFile = file
    const reader = new FileReader()
    reader.onload = (e) => {
      formAlbum.value.coverPreview = e.target.result
    }
    reader.readAsDataURL(file)
  }
}

const removeFile = (index) => {
  uploadedFiles.value.splice(index, 1)
}

// CRUD Photos
const openModal = (mode, photo = null) => {
  modalMode.value = mode
  if (mode === 'add') {
    uploadedFiles.value = []
    formPhoto.value = {
      titre: '',
      description: '',
      albumId: '',
      tags: '',
      preview: '',
      file: null
    }
  } else if (mode === 'edit' && photo) {
    formPhoto.value = {
      titre: photo.titre,
      description: photo.description,
      albumId: photo.albumId,
      tags: photo.tags,
      preview: photo.url,
      file: null
    }
    editId.value = photo.id
  }
  showModal.value = true
}

const closeModal = () => {
  showModal.value = false
  uploadedFiles.value = []
}

const savePhoto = async () => {
  if (modalMode.value === 'add') {
    uploadedFiles.value.forEach(file => {
      const newPhoto = {
        id: Date.now() + Math.random(),
        titre: file.titre,
        description: file.description,
        albumId: formPhoto.value.albumId,
        tags: formPhoto.value.tags,
        url: file.preview,
        date: new Date().toISOString().split('T')[0],
        vues: 0,
        size: file.file.size,
        albumNom: getAlbumNom(formPhoto.value.albumId)
      }
      photos.value.unshift(newPhoto)

      if (formPhoto.value.albumId) {
        const album = albums.value.find(a => a.id === formPhoto.value.albumId)
        if (album) {
          album.nbPhotos = (album.nbPhotos || 0) + 1
        }
      }
    })
  } else {
    const index = photos.value.findIndex(p => p.id === editId.value)
    if (index !== -1) {
      photos.value[index] = {
        ...photos.value[index],
        titre: formPhoto.value.titre,
        description: formPhoto.value.description,
        albumId: formPhoto.value.albumId,
        tags: formPhoto.value.tags,
        url: formPhoto.value.preview,
        albumNom: getAlbumNom(formPhoto.value.albumId)
      }
    }
  }
  closeModal()
}

const viewPhoto = (photo) => {
  viewPhotoData.value = photo
  showViewModal.value = true
  const p = photos.value.find(p => p.id === photo.id)
  if (p) p.vues++
}

const closeViewModal = () => {
  showViewModal.value = false
}

const editPhoto = (photo) => {
  openModal('edit', photo)
}

const deletePhoto = (id) => {
  if (confirm('Supprimer cette photo ?')) {
    const photo = photos.value.find(p => p.id === id)
    if (photo && photo.albumId) {
      const album = albums.value.find(a => a.id === photo.albumId)
      if (album) album.nbPhotos--
    }
    photos.value = photos.value.filter(p => p.id !== id)
  }
}

// CRUD Albums
const openAlbumModal = (mode, album = null) => {
  albumModalMode.value = mode
  if (mode === 'add') {
    formAlbum.value = {
      nom: '',
      description: '',
      coverPreview: '',
      coverFile: null
    }
  } else if (mode === 'edit' && album) {
    formAlbum.value = {
      nom: album.nom,
      description: album.description,
      coverPreview: album.couverture,
      coverFile: null
    }
    editAlbumId.value = album.id
  }
  showAlbumModal.value = true
}

const closeAlbumModal = () => {
  showAlbumModal.value = false
}

const saveAlbum = () => {
  if (albumModalMode.value === 'add') {
    const newAlbum = {
      id: Date.now(),
      nom: formAlbum.value.nom,
      description: formAlbum.value.description,
      couverture: formAlbum.value.coverPreview || 'https://placehold.co/200x150/006633/white?text=Album',
      date: new Date().toISOString().split('T')[0],
      nbPhotos: 0
    }
    albums.value.push(newAlbum)
  } else {
    const index = albums.value.findIndex(a => a.id === editAlbumId.value)
    if (index !== -1) {
      albums.value[index] = {
        ...albums.value[index],
        nom: formAlbum.value.nom,
        description: formAlbum.value.description,
        couverture: formAlbum.value.coverPreview || albums.value[index].couverture
      }
    }
  }
  closeAlbumModal()
}

const editAlbum = (album) => {
  openAlbumModal('edit', album)
}

const deleteAlbum = (id) => {
  if (confirm('Supprimer cet album ? Les photos seront déplacées vers "Sans album"')) {
    photos.value.forEach(p => {
      if (p.albumId === id) p.albumId = ''
    })
    albums.value = albums.value.filter(a => a.id !== id)
    if (filtreAlbum.value === id) filtreAlbum.value = ''
  }
}

// Chargement des données avec les images importées
const loadData = () => {
  albums.value = [
    { id: 1, nom: 'Visites officielles', description: 'Photos des visites officielles', couverture: visitesOfficiellesCover, date: '2024-01-15', nbPhotos: 4 },
    { id: 2, nom: 'Cérémonies', description: 'Cérémonies à l\'ambassade', couverture: ceremoniesCover, date: '2024-01-10', nbPhotos: 3 },
    { id: 3, nom: 'Conférences', description: 'Conférences diplomatiques', couverture: conferencesCover, date: '2024-01-05', nbPhotos: 3 }
  ]

  photos.value = [
    { id: 1, titre: 'Rencontre avec l\'ambassadeur', description: 'Photo officielle de la rencontre', albumId: 1, albumNom: 'Visites officielles', tags: 'diplomatie,ambassadeur', url: rencontreOfficielleImage, date: '2024-01-15', vues: 245, size: 512000 },
    { id: 2, titre: 'Signature d\'accord', description: 'Cérémonie de signature', albumId: 1, albumNom: 'Visites officielles', tags: 'accord,coopération', url: signatureAccordImage, date: '2024-01-14', vues: 189, size: 478000 },
    { id: 3, titre: 'Cérémonie de la fête nationale', description: 'Célébration à l\'ambassade', albumId: 2, albumNom: 'Cérémonies', tags: 'fête nationale', url: feteNationalePhoto, date: '2024-01-12', vues: 356, size: 623000 },
    { id: 4, titre: 'Conférence de presse', description: 'Point de presse', albumId: 3, albumNom: 'Conférences', tags: 'conférence,presse', url: conferencePresseImage, date: '2024-01-10', vues: 178, size: 345000 },
    { id: 5, titre: 'Remise des lettres', description: 'Remise des lettres de créance', albumId: 1, albumNom: 'Visites officielles', tags: 'diplomatie', url: remiseLettresImage, date: '2024-01-08', vues: 98, size: 512000 },
    { id: 6, titre: 'Gala diplomatique', description: 'Soirée de gala', albumId: 2, albumNom: 'Cérémonies', tags: 'gala,soirée', url: galaDiplomatiqueImage, date: '2024-01-05', vues: 234, size: 789000 },
    { id: 7, titre: 'Séminaire économique', description: 'Séminaire sur l\'économie', albumId: 3, albumNom: 'Conférences', tags: 'économie', url: seminaireEconomiqueImage, date: '2024-01-03', vues: 145, size: 432000 },
    { id: 8, titre: 'Visite culturelle', description: 'Découverte culturelle', albumId: '', albumNom: 'Sans album', tags: 'culture', url: visiteCulturelleImage, date: '2024-01-01', vues: 67, size: 298000 }
  ]
}

onMounted(() => {
  loadData()
})
</script>

<style scoped>
.photos-dashboard {
  @apply max-w-full;
}

/* Line clamp */
.line-clamp-2 {
  display: -webkit-box;
  -webkit-line-clamp: 2;
  -webkit-box-orient: vertical;
  overflow: hidden;
}
</style>
