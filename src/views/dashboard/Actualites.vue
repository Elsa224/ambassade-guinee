<template>
  <div class="actualites-dashboard">
    <!-- En-tête -->
    <div class="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-6">
      <div>
        <h2 class="text-2xl font-bold text-gray-800">Gestion des actualités</h2>
        <p class="text-gray-600 mt-1">Gérez toutes les actualités de votre site</p>
      </div>
      <button
        @click="openModal('add')"
        class="bg-primary text-white px-5 py-2.5 rounded-lg hover:bg-primary-dark transition-colors flex items-center gap-2 shadow-md"
      >
        <i class="bx bx-plus-circle text-xl"></i>
        Nouvelle actualité
      </button>
    </div>

    <!-- Filtres et recherche -->
    <div class="bg-white rounded-xl shadow-md p-4 mb-6">
      <div class="flex flex-col md:flex-row gap-4">
        <!-- Recherche -->
        <div class="flex-1 relative">
          <i
            class="bx bx-search absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400"
          ></i>
          <input
            v-model="searchQuery"
            type="text"
            placeholder="Rechercher une actualité..."
            class="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-secondary focus:border-secondary"
          />
        </div>

        <!-- Filtre type -->
        <ChampSelect v-model="filtreType" :options="OPTIONS_FILTRETYPE" />

        <!-- Filtre statut -->
        <ChampSelect v-model="filtreStatut" :options="OPTIONS_FILTRESTATUT" />

        <!-- Trier par -->
        <ChampSelect v-model="tri" :options="OPTIONS_TRI" />
      </div>
    </div>

    <!-- Statistiques -->
    <div class="grid grid-cols-2 sm:grid-cols-4 gap-4 mb-6">
      <div class="bg-white rounded-xl shadow-md p-4 text-center">
        <p class="text-2xl font-bold text-primary">{{ actualitesFiltrees.length }}</p>
        <p class="text-sm text-gray-600">Total actualités</p>
      </div>
      <div class="bg-white rounded-xl shadow-md p-4 text-center">
        <p class="text-2xl font-bold text-green-600">{{ actualitesPubliees.length }}</p>
        <p class="text-sm text-gray-600">Publiées</p>
      </div>
      <div class="bg-white rounded-xl shadow-md p-4 text-center">
        <p class="text-2xl font-bold text-yellow-600">{{ actualitesBrouillons.length }}</p>
        <p class="text-sm text-gray-600">Brouillons</p>
      </div>
      <div class="bg-white rounded-xl shadow-md p-4 text-center">
        <p class="text-2xl font-bold text-primary">{{ totalVues }}</p>
        <p class="text-sm text-gray-600">Total vues</p>
      </div>
    </div>

    <!-- État de chargement / erreur -->
    <p v-if="chargement" class="text-gray-500 py-4">Chargement en cours...</p>

    <div
      v-else-if="erreurApi"
      role="alert"
      class="rounded-lg border border-accent bg-accent/10 px-4 py-3 text-sm text-accent-dark mb-4"
    >
      {{ erreurApi }}
    </div>

    <!-- Liste des actualités -->
    <div class="bg-white rounded-xl shadow-md overflow-hidden">
      <div class="overflow-x-auto">
        <table class="w-full">
          <thead class="bg-gray-50 border-b">
            <tr>
              <th
                class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider"
              >
                Image
              </th>
              <th
                class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider"
              >
                Titre
              </th>
              <th
                class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider"
              >
                Type
              </th>
              <th
                class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider"
              >
                Statut
              </th>
              <th
                class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider"
              >
                Date
              </th>
              <th
                class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider"
              >
                Vues
              </th>
              <th
                class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider"
              >
                Actions
              </th>
            </tr>
          </thead>
          <tbody class="divide-y divide-gray-200">
            <tr
              v-for="actualite in actualitesPaginees"
              :key="actualite.id"
              class="hover:bg-gray-50 transition-colors"
            >
              <td class="px-6 py-4">
                <img :src="actualite.image" alt="Image" class="w-12 h-12 rounded-lg object-cover" />
              </td>
              <td class="px-6 py-4">
                <div class="text-sm font-medium text-gray-900">{{ actualite.titre }}</div>
                <div class="text-xs text-gray-500 mt-1">{{ actualite.resume }}</div>
              </td>
              <td class="px-6 py-4">
                <span :class="['px-2 py-1 text-xs rounded-full', 'bg-gray-100 text-gray-700']">
                  {{ getTypeLabel(actualite.type) }}
                </span>
              </td>
              <td class="px-6 py-4">
                <span
                  :class="[
                    'px-2 py-1 text-xs rounded-full',
                    actualite.statut === 'Publié'
                      ? 'bg-green-100 text-green-600'
                      : actualite.statut === 'Brouillon'
                        ? 'bg-yellow-100 text-yellow-600'
                        : 'bg-gray-100 text-gray-600',
                  ]"
                >
                  {{ actualite.statut }}
                </span>
              </td>
              <td class="px-6 py-4 text-sm text-gray-500">
                {{ formatDate(actualite.date) }}
              </td>
              <td class="px-6 py-4 text-sm text-gray-500">{{ actualite.vues }} vues</td>
              <td class="px-6 py-4">
                <div class="flex gap-2">
                  <button
                    @click="viewActualite(actualite)"
                    class="text-primary hover:text-primary-dark"
                  >
                    <i class="bx bx-show text-xl"></i>
                  </button>
                  <button
                    @click="editActualite(actualite)"
                    class="text-secondary hover:text-secondary-dark"
                  >
                    <i class="bx bx-edit-alt text-xl"></i>
                  </button>
                  <button
                    @click="deleteActualite(actualite.id)"
                    class="text-red-600 hover:text-red-800"
                  >
                    <i class="bx bx-trash text-xl"></i>
                  </button>
                </div>
              </td>
              '
            </tr>
          </tbody>
        </table>
      </div>

      <Pagination
        :pagination="pagination"
        libelle-vide="Aucune actualité"
        @page="pageCourante = $event"
        @limite="changerLignesParPage"
      />
    </div>

    <!-- ========== MODAL AJOUTER/MODIFIER - CENTRÉE ========== -->
    <Teleport to="body">
      <div
        v-if="showModal"
        class="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50"
      >
        <div class="bg-white rounded-lg w-full max-w-2xl max-h-[90vh] overflow-y-auto">
          <div class="flex justify-between items-center p-4 border-b">
            <h3 class="text-xl font-bold">{{ modalTitle }}</h3>
            <button @click="closeModal" class="text-gray-400 hover:text-gray-600">
              <i class="bx bx-x text-2xl"></i>
            </button>
          </div>

          <form @submit.prevent="saveActualite" class="p-4">
            <!-- Titre -->
            <div class="mb-4">
              <label class="block text-sm font-medium text-gray-700 mb-1"
                >Titre de l'actualité *</label
              >
              <input
                v-model="formActualite.titre"
                type="text"
                required
                class="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-secondary"
                placeholder="Entrez le titre de l'actualité"
              />
            </div>

            <!-- Type d'actualité -->
            <div class="mb-4">
              <label class="block text-sm font-medium text-gray-700 mb-1">Type d'actualité *</label>
              <ChampSelect v-model="formActualite.type" :options="OPTIONS_FORMACTUALITE_TYPE" />
            </div>

            <!-- Résumé -->
            <div class="mb-4">
              <label class="block text-sm font-medium text-gray-700 mb-1">Résumé</label>
              <textarea
                v-model="formActualite.resume"
                rows="2"
                class="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-secondary"
                placeholder="Petite description de l'actualité..."
              ></textarea>
            </div>

            <!-- Contenu -->
            <div class="mb-4">
              <label class="block text-sm font-medium text-gray-700 mb-1">Contenu *</label>
              <textarea
                v-model="formActualite.contenu"
                rows="6"
                required
                class="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-secondary"
                placeholder="Contenu détaillé de l'actualité..."
              ></textarea>
            </div>

            <!-- Image -->
            <div class="mb-4">
              <label class="block text-sm font-medium text-gray-700 mb-1">Image principale</label>
              <div class="flex items-center gap-4">
                <input type="file" @change="handleImageUpload" accept="image/*" class="flex-1" />
                <div v-if="formActualite.imagePreview" class="w-16 h-16">
                  <img
                    :src="formActualite.imagePreview"
                    alt="Preview"
                    class="w-full h-full object-cover rounded"
                  />
                </div>
              </div>
            </div>

            <!-- Statut et date -->
            <div class="grid grid-cols-2 gap-4 mb-4">
              <div>
                <label class="block text-sm font-medium text-gray-700 mb-1">Statut</label>
                <ChampSelect
                  v-model="formActualite.statut"
                  :options="OPTIONS_FORMACTUALITE_STATUT"
                />
              </div>
              <div>
                <label class="block text-sm font-medium text-gray-700 mb-1"
                  >Date de publication</label
                >
                <ChampDate v-model="formActualite.date" />
              </div>
            </div>

            <!-- Mots-clés -->
            <div class="mb-4">
              <label class="block text-sm font-medium text-gray-700 mb-1"
                >Mots-clés (séparés par des virgules)</label
              >
              <input
                v-model="formActualite.tags"
                type="text"
                class="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-secondary"
                placeholder="ex: diplomatie, coopération, économie"
              />
              <div v-if="formActualite.tags" class="flex gap-2 mt-2 flex-wrap">
                <span
                  v-for="tag in formActualite.tags.split(',')"
                  :key="tag"
                  class="bg-gray-100 text-gray-700 px-2 py-1 rounded-full text-xs"
                >
                  {{ tag.trim() }}
                </span>
              </div>
            </div>

            <!-- Boutons -->
            <div class="flex justify-end gap-3 pt-4 border-t">
              <button
                type="button"
                @click="closeModal"
                class="px-4 py-2 bg-gray-200 text-gray-700 rounded-lg hover:bg-gray-300"
              >
                Annuler
              </button>
              <button
                type="submit"
                class="px-4 py-2 bg-primary text-white rounded-lg hover:bg-primary-dark"
              >
                {{ modalButtonText }}
              </button>
            </div>
          </form>
        </div>
      </div>
    </Teleport>

    <!-- ========== MODAL VOIR ACTUALITÉ - CENTRÉE ========== -->
    <Teleport to="body">
      <div
        v-if="showViewModal"
        class="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50"
      >
        <div class="bg-white rounded-lg w-full max-w-3xl max-h-[90vh] overflow-y-auto">
          <div class="flex justify-between items-center p-4 border-b">
            <h3 class="text-xl font-bold">Aperçu de l'actualité</h3>
            <button @click="closeViewModal" class="text-gray-400 hover:text-gray-600">
              <i class="bx bx-x text-2xl"></i>
            </button>
          </div>

          <div class="p-4">
            <img
              :src="viewActualiteData.image"
              alt="Image"
              class="w-full h-64 object-cover rounded-lg mb-4"
            />
            <h2 class="text-2xl font-bold text-gray-800 mb-2">{{ viewActualiteData.titre }}</h2>
            <div class="flex gap-4 text-sm text-gray-500 mb-4">
              <span>{{ formatDate(viewActualiteData.date) }}</span>
              <span :class="['px-2 py-1 text-xs rounded-full', 'bg-gray-100 text-gray-700']">
                {{ getTypeLabel(viewActualiteData.type) }}
              </span>
              <span>{{ viewActualiteData.vues }} vues</span>
            </div>
            <p class="text-gray-600 italic bg-gray-50 p-3 rounded-lg mb-4">
              {{ viewActualiteData.resume }}
            </p>
            <div class="text-gray-700 whitespace-pre-wrap">{{ viewActualiteData.contenu }}</div>
            <div v-if="viewActualiteData.tags" class="mt-4 pt-4 border-t">
              <span class="font-medium text-sm text-gray-600">Mots-clés :</span>
              <div class="flex gap-2 mt-1 flex-wrap">
                <span
                  v-for="tag in viewActualiteData.tags.split(',')"
                  :key="tag"
                  class="bg-gray-100 text-gray-700 px-2 py-1 rounded-full text-xs"
                >
                  {{ tag.trim() }}
                </span>
              </div>
            </div>
          </div>

          <div class="flex justify-end p-4 border-t">
            <button
              @click="closeViewModal"
              class="px-4 py-2 bg-gray-200 text-gray-700 rounded-lg hover:bg-gray-300"
            >
              Fermer
            </button>
          </div>
        </div>
      </div>
    </Teleport>
  </div>
</template>

<script setup>
import { ref, computed, onMounted } from 'vue'

import {
  listerArticles,
  creerArticle,
  modifierArticle,
  supprimerArticle,
  libelleStatut,
  statutDepuisLibelle,
} from '@/api/articles'
import ChampSelect from '@/components/ui/ChampSelect.vue'
import ChampDate from '@/components/ui/ChampDate.vue'
import Pagination from '@/components/ui/Pagination.vue'
import { paginerEnMemoire } from '@/components/ui/pagination'

/** Dix lignes tenaient dans la page ; le lecteur peut desormais en demander plus. */
const LIGNES_PAR_DEFAUT = 10
const OPTIONS_FILTRETYPE = [
  { valeur: '', libelle: 'Tous les types' },
  { valeur: 'actualites-ambassade', libelle: 'Actualités Ambassade' },
  { valeur: 'actualites-diplomatique', libelle: 'Actualités Diplomatiques' },
  { valeur: 'actualites-gouvernementale', libelle: 'Actualités Gouvernementales' },
]

const OPTIONS_FILTRESTATUT = [
  { valeur: '', libelle: 'Tous les statuts' },
  { valeur: 'Publié', libelle: 'Publié' },
  { valeur: 'Brouillon', libelle: 'Brouillon' },
  { valeur: 'À valider', libelle: 'À valider' },
]

const OPTIONS_TRI = [
  { valeur: 'recent', libelle: 'Plus récent' },
  { valeur: 'ancien', libelle: 'Plus ancien' },
  { valeur: 'titre', libelle: 'Titre A-Z' },
  { valeur: 'vues', libelle: 'Plus vues' },
]

const OPTIONS_FORMACTUALITE_TYPE = [
  { valeur: 'actualites-ambassade', libelle: "Actualités de l'Ambassade" },
  { valeur: 'actualites-diplomatique', libelle: 'Actualités diplomatiques' },
  { valeur: 'actualites-gouvernementale', libelle: 'Actualités gouvernementales' },
]

const OPTIONS_FORMACTUALITE_STATUT = [
  { valeur: 'Brouillon', libelle: 'Brouillon' },
  { valeur: 'Publié', libelle: 'Publié' },
  { valeur: 'À valider', libelle: 'À valider' },
]

// Données des actualités
const actualites = ref([])
const chargement = ref(false)
const erreurApi = ref(null)
const searchQuery = ref('')
const filtreType = ref('')
const filtreStatut = ref('')
const tri = ref('recent')
const pageCourante = ref(1)
const itemsParPage = ref(LIGNES_PAR_DEFAUT)

// Modal
const showModal = ref(false)
const showViewModal = ref(false)
const modalMode = ref('add')
const editId = ref(null)

// Formulaire
const formActualite = ref({
  titre: '',
  type: 'actualites-ambassade',
  resume: '',
  contenu: '',
  statut: 'Brouillon',
  date: new Date().toISOString().split('T')[0],
  tags: '',
  image: '',
  imagePreview: '',
  imageFile: null,
})

// Vue actualité
const viewActualiteData = ref({})

// Computed
const modalTitle = computed(() =>
  modalMode.value === 'add' ? 'Ajouter une actualité' : "Modifier l'actualité",
)
const modalButtonText = computed(() =>
  modalMode.value === 'add' ? "Publier l'actualité" : 'Enregistrer les modifications',
)

// Filtres et tris
const actualitesFiltrees = computed(() => {
  let result = [...actualites.value]

  if (searchQuery.value) {
    result = result.filter(
      (a) =>
        a.titre.toLowerCase().includes(searchQuery.value.toLowerCase()) ||
        a.resume.toLowerCase().includes(searchQuery.value.toLowerCase()),
    )
  }

  if (filtreType.value) {
    result = result.filter((a) => a.type === filtreType.value)
  }

  if (filtreStatut.value) {
    result = result.filter((a) => a.statut === filtreStatut.value)
  }

  switch (tri.value) {
    case 'recent':
      result.sort((a, b) => new Date(b.date) - new Date(a.date))
      break
    case 'ancien':
      result.sort((a, b) => new Date(a.date) - new Date(b.date))
      break
    case 'titre':
      result.sort((a, b) => a.titre.localeCompare(b.titre))
      break
    case 'vues':
      result.sort((a, b) => b.vues - a.vues)
      break
  }

  return result
})

const actualitesPaginees = computed(() => {
  const start = (pageCourante.value - 1) * itemsParPage.value
  const end = start + itemsParPage.value
  return actualitesFiltrees.value.slice(start, end)
})

const actualitesPubliees = computed(() => actualites.value.filter((a) => a.statut === 'Publié'))
const actualitesBrouillons = computed(() =>
  actualites.value.filter((a) => a.statut === 'Brouillon'),
)
const totalVues = computed(() => actualites.value.reduce((sum, a) => sum + a.vues, 0))
/**
 * La barre de pagination attend la meme forme que celle servie par le back
 * pour les evenements. `paginerEnMemoire` la construit ici, ou actualitesFiltrees
 * est deja en memoire, et garantit au passage `totalPages >= 1` : l'ancien
 * calcul rendait zero sur une liste vide, ce qui laissait le bouton
 * « suivant » actif et permettait d'avancer dans le neant.
 */
const pagination = computed(() =>
  paginerEnMemoire(actualitesFiltrees.value.length, pageCourante.value, itemsParPage.value),
)

function changerLignesParPage(lignes) {
  itemsParPage.value = lignes
  pageCourante.value = 1
}

// Fonctions utilitaires
const getTypeLabel = (type) => {
  const labels = {
    'actualites-ambassade': 'Ambassade',
    'actualites-diplomatique': 'Diplomatique',
    'actualites-gouvernementale': 'Gouvernementale',
  }
  return labels[type] || type
}

const formatDate = (date) => {
  return new Date(date).toLocaleDateString('fr-FR', {
    day: 'numeric',
    month: 'long',
    year: 'numeric',
  })
}

// Gestion image
const handleImageUpload = (event) => {
  const file = event.target.files[0]
  if (file) {
    formActualite.value.imageFile = file
    const reader = new FileReader()
    reader.onload = (e) => {
      formActualite.value.imagePreview = e.target.result
    }
    reader.readAsDataURL(file)
  }
}

// CRUD Operations
const openModal = (mode, actualite = null) => {
  modalMode.value = mode
  if (mode === 'add') {
    formActualite.value = {
      titre: '',
      type: 'actualites-ambassade',
      resume: '',
      contenu: '',
      statut: 'Brouillon',
      date: new Date().toISOString().split('T')[0],
      tags: '',
      image: '',
      imagePreview: '',
      imageFile: null,
    }
    editId.value = null
  } else if (mode === 'edit' && actualite) {
    formActualite.value = {
      titre: actualite.titre,
      type: actualite.type,
      resume: actualite.resume,
      contenu: actualite.contenu,
      statut: actualite.statut,
      date: actualite.date,
      tags: actualite.tags || '',
      image: actualite.image,
      imagePreview: actualite.image,
      imageFile: null,
    }
    editId.value = actualite.id
  }
  showModal.value = true
}

const closeModal = () => {
  showModal.value = false
}

const saveActualite = async () => {
  const brouillon = {
    titre: formActualite.value.titre,
    resume: formActualite.value.resume,
    contenu: formActualite.value.contenu,
    categorie_slug: formActualite.value.type,
    statut: statutDepuisLibelle(formActualite.value.statut),
    date_publication: formActualite.value.date,
    image: formActualite.value.imagePreview || undefined,
  }

  try {
    if (modalMode.value === 'add') {
      await creerArticle(brouillon)
    } else {
      await modifierArticle(editId.value, brouillon)
    }
    closeModal()
    await chargerActualites()
  } catch (souleve) {
    erreurApi.value = 'Enregistrement impossible. Vérifiez les champs et réessayez.'
    console.error("Échec de l'enregistrement de l'actualité :", souleve)
  }
}

const viewActualite = (actualite) => {
  viewActualiteData.value = actualite
  showViewModal.value = true
}

const closeViewModal = () => {
  showViewModal.value = false
  viewActualiteData.value = {}
}

const editActualite = (actualite) => {
  openModal('edit', actualite)
}

const deleteActualite = async (id) => {
  if (!confirm('Êtes-vous sûr de vouloir supprimer cette actualité ?')) return

  try {
    await supprimerArticle(id)
    await chargerActualites()
  } catch (souleve) {
    erreurApi.value = 'Suppression impossible.'
    console.error("Échec de la suppression de l'actualité :", souleve)
  }
}

const versVue = (article) => ({
  ...article,
  type: article.categorie?.slug ?? '',
  statut: libelleStatut(article.statut),
  date: article.date_publication,
})

const chargerActualites = async () => {
  chargement.value = true
  erreurApi.value = null
  try {
    actualites.value = (await listerArticles()).map(versVue)
  } catch (souleve) {
    erreurApi.value = 'Impossible de charger les actualités.'
    console.error('Échec du chargement des actualités :', souleve)
  } finally {
    chargement.value = false
  }
}

onMounted(chargerActualites)
</script>

<style scoped>
.actualites-dashboard {
  max-width: 100%;
}
</style>
