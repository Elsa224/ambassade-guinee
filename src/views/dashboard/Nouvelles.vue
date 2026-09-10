<template>
  <div class="nouvelles-dashboard">
    <!-- En-tête -->
    <div class="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-6">
      <div>
        <h2 class="text-2xl font-bold text-gray-800">Gestion des demandes</h2>
        <p class="text-gray-600 mt-1">Gérez toutes les demandes des utilisateurs</p>
      </div>
      <div class="flex gap-3">
        <button
          @click="exportData"
          class="bg-white border border-primary text-primary px-4 py-2.5 rounded-lg hover:bg-primary hover:text-white transition-colors flex items-center gap-2"
        >
          <i class="bx bx-export text-xl"></i>
          Exporter
        </button>
        <button
          @click="openModal('add')"
          class="bg-primary text-white px-5 py-2.5 rounded-lg hover:bg-primary-dark transition-colors flex items-center gap-2 shadow-md"
        >
          <i class="bx bx-plus-circle text-xl"></i>
          Nouvelle demande
        </button>
      </div>
    </div>

    <!-- Statistiques -->
    <div class="grid grid-cols-2 sm:grid-cols-5 gap-4 mb-6">
      <div class="bg-white rounded-xl shadow-md p-4 text-center">
        <p class="text-2xl font-bold text-primary">{{ totalDemandes }}</p>
        <p class="text-sm text-gray-600">Total demandes</p>
      </div>
      <div class="bg-white rounded-xl shadow-md p-4 text-center">
        <p class="text-2xl font-bold text-yellow-600">{{ demandesEnAttente.length }}</p>
        <p class="text-sm text-gray-600">En attente</p>
      </div>
      <div class="bg-white rounded-xl shadow-md p-4 text-center">
        <p class="text-2xl font-bold text-blue-600">{{ demandesEnCours.length }}</p>
        <p class="text-sm text-gray-600">En cours</p>
      </div>
      <div class="bg-white rounded-xl shadow-md p-4 text-center">
        <p class="text-2xl font-bold text-green-600">{{ demandesTraitees.length }}</p>
        <p class="text-sm text-gray-600">Traitées</p>
      </div>
      <div class="bg-white rounded-xl shadow-md p-4 text-center">
        <p class="text-2xl font-bold text-red-600">{{ demandesRefusees.length }}</p>
        <p class="text-sm text-gray-600">Refusées</p>
      </div>
    </div>

    <!-- Filtres et recherche -->
    <div class="bg-white rounded-xl shadow-md p-4 mb-6">
      <div class="flex flex-col md:flex-row gap-4">
        <div class="flex-1 relative">
          <i
            class="bx bx-search absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400"
          ></i>
          <input
            v-model="searchQuery"
            type="text"
            placeholder="Rechercher par nom, email ou titre..."
            class="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-secondary"
          />
        </div>

        <select
          v-model="filtreType"
          class="px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-secondary"
        >
          <option value="">Tous les types</option>
          <option value="visa">Demande de visa</option>
          <option value="passeport">Demande de passeport</option>
          <option value="legalisation">Légalisation</option>
          <option value="inscription">Inscription consulaire</option>
          <option value="autre">Autre</option>
        </select>

        <select
          v-model="filtreStatut"
          class="px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-secondary"
        >
          <option value="">Tous les statuts</option>
          <option value="en_attente">En attente</option>
          <option value="en_cours">En cours</option>
          <option value="traitee">Traitée</option>
          <option value="refusee">Refusée</option>
        </select>

        <select
          v-model="tri"
          class="px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-secondary"
        >
          <option value="recent">Plus récentes</option>
          <option value="ancien">Plus anciennes</option>
          <option value="urgent">Plus urgentes</option>
        </select>
      </div>
    </div>

    <!-- Liste des demandes -->
    <div class="bg-white rounded-xl shadow-md overflow-hidden">
      <div class="overflow-x-auto">
        <table class="w-full">
          <thead class="bg-gray-50 border-b">
            <tr>
              <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">N°</th>
              <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                Demandeur
              </th>
              <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Type</th>
              <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Objet</th>
              <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                Statut
              </th>
              <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                Priorité
              </th>
              <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Date</th>
              <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                Actions
              </th>
            </tr>
          </thead>
          <tbody class="divide-y divide-gray-200">
            <tr
              v-for="demande in demandesPaginees"
              :key="demande.id"
              class="hover:bg-gray-50 transition-colors"
            >
              <td class="px-6 py-4 text-sm text-gray-500 font-mono">#{{ demande.id }}</td>
              <td class="px-6 py-4">
                <div class="flex items-center gap-3">
                  <div class="w-8 h-8 bg-gray-200 rounded-full flex items-center justify-center">
                    <i class="bx bx-user text-gray-500"></i>
                  </div>
                  <div>
                    <p class="text-sm font-medium text-gray-900">
                      {{ demande.nom }} {{ demande.prenom }}
                    </p>
                    <p class="text-xs text-gray-500">{{ demande.email }}</p>
                  </div>
                </div>
              </td>
              <td class="px-6 py-4">
                <span
                  :class="[
                    'px-2 py-1 text-xs rounded-full',
                    demande.type === 'visa'
                      ? 'bg-purple-100 text-purple-600'
                      : demande.type === 'passeport'
                        ? 'bg-blue-100 text-blue-600'
                        : demande.type === 'legalisation'
                          ? 'bg-green-100 text-green-600'
                          : demande.type === 'inscription'
                            ? 'bg-orange-100 text-orange-600'
                            : 'bg-gray-100 text-gray-600',
                  ]"
                >
                  {{ getTypeLabel(demande.type) }}
                </span>
              </td>
              <td class="px-6 py-4">
                <div class="text-sm text-gray-900">{{ demande.objet }}</div>
                <div class="text-xs text-gray-500 truncate max-w-xs">{{ demande.message }}</div>
              </td>
              <td class="px-6 py-4">
                <div class="relative">
                  <select
                    v-model="demande.statut"
                    @change="updateStatut(demande)"
                    :class="[
                      'px-2 py-1 text-xs rounded-full border-none cursor-pointer',
                      demande.statut === 'traitee'
                        ? 'bg-green-100 text-green-600'
                        : demande.statut === 'en_cours'
                          ? 'bg-blue-100 text-blue-600'
                          : demande.statut === 'refusee'
                            ? 'bg-red-100 text-red-600'
                            : 'bg-yellow-100 text-yellow-600',
                    ]"
                  >
                    <option value="en_attente">En attente</option>
                    <option value="en_cours">En cours</option>
                    <option value="traitee">Traitée</option>
                    <option value="refusee">Refusée</option>
                  </select>
                </div>
              </td>
              <td class="px-6 py-4">
                <div class="flex gap-1">
                  <button
                    v-for="p in ['haute', 'moyenne', 'basse']"
                    :key="p"
                    @click="updatePriorite(demande, p)"
                    :class="[
                      'w-6 h-6 rounded-full transition-all',
                      demande.priorite === p
                        ? p === 'haute'
                          ? 'bg-red-500 ring-2 ring-red-300'
                          : p === 'moyenne'
                            ? 'bg-orange-500 ring-2 ring-orange-300'
                            : 'bg-green-500 ring-2 ring-green-300'
                        : 'bg-gray-300 hover:bg-gray-400',
                    ]"
                    :title="
                      p === 'haute'
                        ? 'Haute priorité'
                        : p === 'moyenne'
                          ? 'Moyenne priorité'
                          : 'Basse priorité'
                    "
                  ></button>
                </div>
              </td>
              <td class="px-6 py-4 text-sm text-gray-500">
                {{ formatDate(demande.date) }}
              </td>
              <td class="px-6 py-4">
                <div class="flex gap-2">
                  <button @click="viewDemande(demande)" class="text-blue-600 hover:text-blue-800">
                    <i class="bx bx-show text-xl"></i>
                  </button>
                  <button
                    @click="editDemande(demande)"
                    class="text-secondary hover:text-secondary-dark"
                  >
                    <i class="bx bx-edit-alt text-xl"></i>
                  </button>
                  <button
                    @click="deleteDemande(demande.id)"
                    class="text-red-600 hover:text-red-800"
                  >
                    <i class="bx bx-trash text-xl"></i>
                  </button>
                </div>
              </td>
            </tr>
          </tbody>
        </table>
      </div>

      <!-- Pagination -->
      <div class="px-6 py-4 border-t flex items-center justify-between">
        <div class="text-sm text-gray-500">
          Affichage de {{ (pageCourante - 1) * itemsParPage + 1 }} à
          {{ Math.min(pageCourante * itemsParPage, demandesFiltrees.length) }} sur
          {{ demandesFiltrees.length }} demandes
        </div>
        <div class="flex gap-2">
          <button
            @click="pageCourante--"
            :disabled="pageCourante === 1"
            class="px-3 py-1 border rounded-lg hover:bg-gray-50 disabled:opacity-50"
          >
            <i class="bx bx-chevron-left"></i>
          </button>
          <span class="px-3 py-1 bg-primary text-white rounded-lg">{{ pageCourante }}</span>
          <button
            @click="pageCourante++"
            :disabled="pageCourante === totalPages"
            class="px-3 py-1 border rounded-lg hover:bg-gray-50 disabled:opacity-50"
          >
            <i class="bx bx-chevron-right"></i>
          </button>
        </div>
      </div>
    </div>

    <!-- ========== MODAL AJOUTER/MODIFIER DEMANDE ========== -->
    <Teleport to="body">
      <div v-if="showModal" class="modal-overlay" @click.self="closeModal">
        <div class="modal-container">
          <div class="modal-header">
            <h3 class="modal-title">{{ modalTitle }}</h3>
            <button @click="closeModal" class="modal-close">
              <i class="bx bx-x text-2xl"></i>
            </button>
          </div>

          <form @submit.prevent="saveDemande" class="modal-body">
            <div class="grid grid-cols-2 gap-4">
              <div class="form-group">
                <label class="form-label">Nom *</label>
                <input
                  v-model="formDemande.nom"
                  type="text"
                  required
                  class="form-input"
                  placeholder="Nom"
                />
              </div>
              <div class="form-group">
                <label class="form-label">Prénom *</label>
                <input
                  v-model="formDemande.prenom"
                  type="text"
                  required
                  class="form-input"
                  placeholder="Prénom"
                />
              </div>
            </div>

            <div class="grid grid-cols-2 gap-4">
              <div class="form-group">
                <label class="form-label">Email *</label>
                <input
                  v-model="formDemande.email"
                  type="email"
                  required
                  class="form-input"
                  placeholder="email@exemple.com"
                />
              </div>
              <div class="form-group">
                <label class="form-label">Téléphone</label>
                <input
                  v-model="formDemande.telephone"
                  type="tel"
                  class="form-input"
                  placeholder="+224 XX XXX XXXX"
                />
              </div>
            </div>

            <div class="grid grid-cols-2 gap-4">
              <div class="form-group">
                <label class="form-label">Type de demande *</label>
                <select v-model="formDemande.type" required class="form-input">
                  <option value="visa">Demande de visa</option>
                  <option value="passeport">Demande de passeport</option>
                  <option value="legalisation">Légalisation de documents</option>
                  <option value="inscription">Inscription consulaire</option>
                  <option value="autre">Autre</option>
                </select>
              </div>
              <div class="form-group">
                <label class="form-label">Priorité</label>
                <select v-model="formDemande.priorite" class="form-input">
                  <option value="basse">Basse</option>
                  <option value="moyenne">Moyenne</option>
                  <option value="haute">Haute</option>
                </select>
              </div>
            </div>

            <div class="form-group">
              <label class="form-label">Objet *</label>
              <input
                v-model="formDemande.objet"
                type="text"
                required
                class="form-input"
                placeholder="Objet de la demande"
              />
            </div>

            <div class="form-group">
              <label class="form-label">Message détaillé *</label>
              <textarea
                v-model="formDemande.message"
                rows="4"
                required
                class="form-input"
                placeholder="Décrivez votre demande en détail..."
              ></textarea>
            </div>

            <div class="form-group">
              <label class="form-label">Pièces jointes</label>
              <div class="upload-area" @dragover.prevent @drop.prevent="handleDrop">
                <input
                  type="file"
                  @change="handleFilesUpload"
                  multiple
                  accept=".pdf,.doc,.docx,.jpg,.png"
                  class="hidden"
                  ref="fileInput"
                />
                <div class="upload-content" @click="$refs.fileInput.click()">
                  <i class="bx bx-cloud-upload text-3xl text-primary"></i>
                  <p class="text-sm text-gray-600">Cliquez ou glissez-déposez des fichiers</p>
                  <p class="text-xs text-gray-400">PDF, DOC, JPG, PNG (Max 5MB)</p>
                </div>
              </div>
              <div v-if="uploadedFiles.length > 0" class="files-list mt-3">
                <div v-for="(file, index) in uploadedFiles" :key="index" class="file-item">
                  <i class="bx bxs-file-pdf text-red-500"></i>
                  <span class="text-sm text-gray-600 flex-1">{{ file.name }}</span>
                  <span class="text-xs text-gray-400">{{ formatFileSize(file.size) }}</span>
                  <button @click="removeFile(index)" class="text-red-500 hover:text-red-700">
                    <i class="bx bx-x"></i>
                  </button>
                </div>
              </div>
            </div>

            <div class="modal-footer">
              <button type="button" @click="closeModal" class="btn-cancel">Annuler</button>
              <button type="submit" class="btn-submit">{{ modalButtonText }}</button>
            </div>
          </form>
        </div>
      </div>
    </Teleport>

    <!-- ========== MODAL VOIR DEMANDE ========== -->
    <Teleport to="body">
      <div v-if="showViewModal" class="modal-overlay" @click.self="closeViewModal">
        <div class="modal-container-view">
          <div class="modal-header">
            <h3 class="modal-title">Détail de la demande #{{ viewDemandeData.id }}</h3>
            <button @click="closeViewModal" class="modal-close">
              <i class="bx bx-x text-2xl"></i>
            </button>
          </div>

          <div class="modal-body-view">
            <!-- Informations demandeur -->
            <div class="info-section">
              <h4 class="section-title">
                <i class="bx bx-user"></i>
                Informations du demandeur
              </h4>
              <div class="info-grid">
                <div>
                  <span class="info-label">Nom complet :</span> {{ viewDemandeData.nom }}
                  {{ viewDemandeData.prenom }}
                </div>
                <div><span class="info-label">Email :</span> {{ viewDemandeData.email }}</div>
                <div>
                  <span class="info-label">Téléphone :</span>
                  {{ viewDemandeData.telephone || 'Non renseigné' }}
                </div>
                <div>
                  <span class="info-label">Date de la demande :</span>
                  {{ formatDate(viewDemandeData.date) }}
                </div>
              </div>
            </div>

            <!-- Informations demande -->
            <div class="info-section">
              <h4 class="section-title">
                <i class="bx bx-info-circle"></i>
                Détails de la demande
              </h4>
              <div class="info-grid">
                <div>
                  <span class="info-label">Type :</span> {{ getTypeLabel(viewDemandeData.type) }}
                </div>
                <div>
                  <span class="info-label">Statut :</span>
                  <span
                    :class="[
                      'px-2 py-1 text-xs rounded-full',
                      viewDemandeData.statut === 'traitee'
                        ? 'bg-green-100 text-green-600'
                        : viewDemandeData.statut === 'en_cours'
                          ? 'bg-blue-100 text-blue-600'
                          : viewDemandeData.statut === 'refusee'
                            ? 'bg-red-100 text-red-600'
                            : 'bg-yellow-100 text-yellow-600',
                    ]"
                  >
                    {{ getStatutLabel(viewDemandeData.statut) }}
                  </span>
                </div>
                <div>
                  <span class="info-label">Priorité :</span>
                  <span
                    :class="[
                      'px-2 py-1 text-xs rounded-full',
                      viewDemandeData.priorite === 'haute'
                        ? 'bg-red-100 text-red-600'
                        : viewDemandeData.priorite === 'moyenne'
                          ? 'bg-orange-100 text-orange-600'
                          : 'bg-green-100 text-green-600',
                    ]"
                  >
                    {{ getPrioriteLabel(viewDemandeData.priorite) }}
                  </span>
                </div>
                <div><span class="info-label">Objet :</span> {{ viewDemandeData.objet }}</div>
              </div>
            </div>

            <!-- Message -->
            <div class="info-section">
              <h4 class="section-title">
                <i class="bx bx-message-detail"></i>
                Message
              </h4>
              <div class="message-content">
                {{ viewDemandeData.message }}
              </div>
            </div>

            <!-- Pièces jointes -->
            <div
              v-if="viewDemandeData.fichiers && viewDemandeData.fichiers.length"
              class="info-section"
            >
              <h4 class="section-title">
                <i class="bx bx-paperclip"></i>
                Pièces jointes
              </h4>
              <div class="files-list">
                <div
                  v-for="(file, index) in viewDemandeData.fichiers"
                  :key="index"
                  class="file-item"
                >
                  <i class="bx bxs-file-pdf text-red-500"></i>
                  <span class="text-sm text-gray-600 flex-1">{{ file.name }}</span>
                  <a :href="file.url" download class="text-blue-500 hover:text-blue-700">
                    <i class="bx bx-download"></i>
                  </a>
                </div>
              </div>
            </div>

            <!-- Historique -->
            <div class="info-section">
              <h4 class="section-title">
                <i class="bx bx-history"></i>
                Historique des actions
              </h4>
              <div class="timeline">
                <div
                  v-for="(action, index) in viewDemandeData.historique"
                  :key="index"
                  class="timeline-item"
                >
                  <div class="timeline-dot"></div>
                  <div class="timeline-content">
                    <p class="text-sm text-gray-800">{{ action.message }}</p>
                    <p class="text-xs text-gray-400">{{ action.date }}</p>
                  </div>
                </div>
              </div>
            </div>
          </div>

          <div class="modal-footer">
            <button @click="closeViewModal" class="btn-cancel">Fermer</button>
            <button @click="repondreDemande" class="btn-submit">
              <i class="bx bx-reply"></i>
              Répondre
            </button>
          </div>
        </div>
      </div>
    </Teleport>

    <!-- ========== MODAL RÉPONSE ========== -->
    <Teleport to="body">
      <div v-if="showReponseModal" class="modal-overlay" @click.self="closeReponseModal">
        <div class="modal-container-small">
          <div class="modal-header">
            <h3 class="modal-title">Répondre à la demande</h3>
            <button @click="closeReponseModal" class="modal-close">
              <i class="bx bx-x text-2xl"></i>
            </button>
          </div>
          <form @submit.prevent="envoyerReponse" class="modal-body">
            <div class="form-group">
              <label class="form-label">Objet du message</label>
              <input
                v-model="reponse.objet"
                type="text"
                class="form-input"
                placeholder="Re: {{ viewDemandeData.objet }}"
              />
            </div>
            <div class="form-group">
              <label class="form-label">Message *</label>
              <textarea
                v-model="reponse.message"
                rows="6"
                required
                class="form-input"
                placeholder="Votre réponse..."
              ></textarea>
            </div>
            <div class="modal-footer">
              <button type="button" @click="closeReponseModal" class="btn-cancel">Annuler</button>
              <button type="submit" class="btn-submit">Envoyer</button>
            </div>
          </form>
        </div>
      </div>
    </Teleport>
  </div>
</template>

<script setup>
import { ref, computed, onMounted } from 'vue'

// Données
const demandes = ref([])
const searchQuery = ref('')
const filtreType = ref('')
const filtreStatut = ref('')
const tri = ref('recent')
const pageCourante = ref(1)
const itemsParPage = 10

// Modals
const showModal = ref(false)
const showViewModal = ref(false)
const showReponseModal = ref(false)
const modalMode = ref('add')
const editId = ref(null)

// Upload
const uploadedFiles = ref([])
const fileInput = ref(null)

// Formulaires
const formDemande = ref({
  nom: '',
  prenom: '',
  email: '',
  telephone: '',
  type: 'visa',
  objet: '',
  message: '',
  priorite: 'moyenne',
  statut: 'en_attente',
})

const viewDemandeData = ref({})
const reponse = ref({
  objet: '',
  message: '',
})

// Computed
const totalDemandes = computed(() => demandes.value.length)
const demandesEnAttente = computed(() => demandes.value.filter((d) => d.statut === 'en_attente'))
const demandesEnCours = computed(() => demandes.value.filter((d) => d.statut === 'en_cours'))
const demandesTraitees = computed(() => demandes.value.filter((d) => d.statut === 'traitee'))
const demandesRefusees = computed(() => demandes.value.filter((d) => d.statut === 'refusee'))

const modalTitle = computed(() =>
  modalMode.value === 'add' ? 'Nouvelle demande' : 'Modifier la demande',
)
const modalButtonText = computed(() =>
  modalMode.value === 'add' ? 'Créer la demande' : 'Enregistrer',
)

const demandesFiltrees = computed(() => {
  let result = [...demandes.value]

  if (searchQuery.value) {
    const query = searchQuery.value.toLowerCase()
    result = result.filter(
      (d) =>
        d.nom.toLowerCase().includes(query) ||
        d.prenom.toLowerCase().includes(query) ||
        d.email.toLowerCase().includes(query) ||
        d.objet.toLowerCase().includes(query),
    )
  }

  if (filtreType.value) {
    result = result.filter((d) => d.type === filtreType.value)
  }

  if (filtreStatut.value) {
    result = result.filter((d) => d.statut === filtreStatut.value)
  }

  switch (tri.value) {
    case 'recent':
      result.sort((a, b) => new Date(b.date) - new Date(a.date))
      break
    case 'ancien':
      result.sort((a, b) => new Date(a.date) - new Date(b.date))
      break
    case 'urgent':
      const prioriteOrder = { haute: 0, moyenne: 1, basse: 2 }
      result.sort((a, b) => prioriteOrder[a.priorite] - prioriteOrder[b.priorite])
      break
  }

  return result
})

const demandesPaginees = computed(() => {
  const start = (pageCourante.value - 1) * itemsParPage
  const end = start + itemsParPage
  return demandesFiltrees.value.slice(start, end)
})

const totalPages = computed(() => Math.ceil(demandesFiltrees.value.length / itemsParPage))

// Fonctions utilitaires
const getTypeLabel = (type) => {
  const labels = {
    visa: 'Demande de visa',
    passeport: 'Demande de passeport',
    legalisation: 'Légalisation',
    inscription: 'Inscription consulaire',
    autre: 'Autre',
  }
  return labels[type] || type
}

const getStatutLabel = (statut) => {
  const labels = {
    en_attente: 'En attente',
    en_cours: 'En cours',
    traitee: 'Traitée',
    refusee: 'Refusée',
  }
  return labels[statut] || statut
}

const getPrioriteLabel = (priorite) => {
  const labels = {
    haute: 'Haute priorité',
    moyenne: 'Moyenne priorité',
    basse: 'Basse priorité',
  }
  return labels[priorite] || priorite
}

const formatDate = (date) => {
  return new Date(date).toLocaleDateString('fr-FR', {
    day: 'numeric',
    month: 'long',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  })
}

const formatFileSize = (bytes) => {
  if (bytes < 1024) return bytes + ' B'
  if (bytes < 1048576) return (bytes / 1024).toFixed(1) + ' KB'
  return (bytes / 1048576).toFixed(1) + ' MB'
}

// CRUD Operations
const openModal = (mode, demande = null) => {
  modalMode.value = mode
  uploadedFiles.value = []

  if (mode === 'add') {
    formDemande.value = {
      nom: '',
      prenom: '',
      email: '',
      telephone: '',
      type: 'visa',
      objet: '',
      message: '',
      priorite: 'moyenne',
      statut: 'en_attente',
    }
    editId.value = null
  } else if (mode === 'edit' && demande) {
    formDemande.value = { ...demande }
    editId.value = demande.id
  }
  showModal.value = true
}

const closeModal = () => {
  showModal.value = false
}

const saveDemande = () => {
  if (modalMode.value === 'add') {
    const newDemande = {
      id: Date.now(),
      ...formDemande.value,
      date: new Date().toISOString(),
      fichiers: uploadedFiles.value,
      historique: [{ message: 'Demande créée', date: new Date().toLocaleString() }],
    }
    demandes.value.unshift(newDemande)
  } else {
    const index = demandes.value.findIndex((d) => d.id === editId.value)
    if (index !== -1) {
      demandes.value[index] = {
        ...demandes.value[index],
        ...formDemande.value,
        historique: [
          ...demandes.value[index].historique,
          { message: 'Demande modifiée', date: new Date().toLocaleString() },
        ],
      }
    }
  }
  closeModal()
}

const viewDemande = (demande) => {
  viewDemandeData.value = demande
  showViewModal.value = true
}

const closeViewModal = () => {
  showViewModal.value = false
}

const editDemande = (demande) => {
  openModal('edit', demande)
}

const deleteDemande = (id) => {
  if (confirm('Supprimer cette demande ?')) {
    demandes.value = demandes.value.filter((d) => d.id !== id)
  }
}

const updateStatut = (demande) => {
  demande.historique = demande.historique || []
  demande.historique.push({
    message: `Statut changé vers ${getStatutLabel(demande.statut)}`,
    date: new Date().toLocaleString(),
  })
}

const updatePriorite = (demande, priorite) => {
  demande.priorite = priorite
  demande.historique = demande.historique || []
  demande.historique.push({
    message: `Priorité changée vers ${getPrioriteLabel(priorite)}`,
    date: new Date().toLocaleString(),
  })
}

// Gestion fichiers
const handleFilesUpload = (event) => {
  const files = Array.from(event.target.files)
  files.forEach((file) => {
    uploadedFiles.value.push({
      name: file.name,
      size: file.size,
      type: file.type,
      url: URL.createObjectURL(file),
    })
  })
}

const handleDrop = (event) => {
  const files = Array.from(event.dataTransfer.files)
  files.forEach((file) => {
    uploadedFiles.value.push({
      name: file.name,
      size: file.size,
      type: file.type,
      url: URL.createObjectURL(file),
    })
  })
}

const removeFile = (index) => {
  uploadedFiles.value.splice(index, 1)
}

// Réponse
const repondreDemande = () => {
  reponse.value = {
    objet: `Re: ${viewDemandeData.value.objet}`,
    message: '',
  }
  showReponseModal.value = true
  closeViewModal()
}

const closeReponseModal = () => {
  showReponseModal.value = false
}

const envoyerReponse = () => {
  alert(
    `Réponse envoyée à ${viewDemandeData.value.email}\n\nObjet: ${reponse.value.objet}\nMessage: ${reponse.value.message}`,
  )
  closeReponseModal()
}

// Export
const exportData = () => {
  const data = demandesFiltrees.value.map((d) => ({
    'N°': d.id,
    Nom: d.nom,
    Prénom: d.prenom,
    Email: d.email,
    Téléphone: d.telephone,
    Type: getTypeLabel(d.type),
    Objet: d.objet,
    Statut: getStatutLabel(d.statut),
    Priorité: getPrioriteLabel(d.priorite),
    Date: formatDate(d.date),
  }))

  const csv = convertToCSV(data)
  const blob = new Blob([csv], { type: 'text/csv' })
  const url = URL.createObjectURL(blob)
  const a = document.createElement('a')
  a.href = url
  a.download = `demandes_${new Date().toISOString().split('T')[0]}.csv`
  a.click()
  URL.revokeObjectURL(url)
}

const convertToCSV = (data) => {
  const headers = Object.keys(data[0])
  const csvRows = [headers.join(',')]
  for (const row of data) {
    const values = headers.map((header) => `"${row[header] || ''}"`)
    csvRows.push(values.join(','))
  }
  return csvRows.join('\n')
}

// Charger données de test
const loadDemandes = () => {
  demandes.value = [
    {
      id: 1001,
      nom: 'Diallo',
      prenom: 'Mamadou',
      email: 'mamadou.diallo@email.com',
      telephone: '+224 622 123 456',
      type: 'visa',
      objet: 'Demande de visa touristique',
      message:
        'Je souhaite obtenir un visa pour voyager aux États-Unis pour une durée de 2 semaines.',
      statut: 'en_attente',
      priorite: 'haute',
      date: '2024-01-15T10:30:00',
      historique: [{ message: 'Demande créée', date: '15/01/2024 10:30' }],
    },
    {
      id: 1002,
      nom: 'Camara',
      prenom: 'Aissatou',
      email: 'aissatou.camara@email.com',
      telephone: '+224 633 456 789',
      type: 'passeport',
      objet: 'Renouvellement passeport',
      message: 'Mon passeport expire dans 3 mois, je souhaite le renouveler.',
      statut: 'en_cours',
      priorite: 'moyenne',
      date: '2024-01-14T14:20:00',
      historique: [
        { message: 'Demande créée', date: '14/01/2024 14:20' },
        { message: 'En cours de traitement', date: '15/01/2024 09:00' },
      ],
    },
    {
      id: 1003,
      nom: 'Sow',
      prenom: 'Ibrahim',
      email: 'ibrahim.sow@email.com',
      telephone: '+224 655 789 012',
      type: 'legalisation',
      objet: 'Légalisation de diplôme',
      message: 'Besoin de légaliser mon diplôme pour continuer mes études.',
      statut: 'traitee',
      priorite: 'basse',
      date: '2024-01-13T09:15:00',
      historique: [
        { message: 'Demande créée', date: '13/01/2024 09:15' },
        { message: 'Documents vérifiés', date: '14/01/2024 10:00' },
        { message: 'Demande traitée avec succès', date: '15/01/2024 11:30' },
      ],
    },
  ]
}

onMounted(() => {
  loadDemandes()
})
</script>

<style scoped>
.nouvelles-dashboard {
  @apply max-w-full;
}

/* Modal styles */
.modal-overlay {
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background-color: rgba(0, 0, 0, 0.6);
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 9999;
  backdrop-filter: blur(4px);
}

.modal-container,
.modal-container-view {
  background: white;
  border-radius: 1rem;
  width: 90%;
  max-width: 700px;
  max-height: 90vh;
  overflow-y: auto;
  box-shadow: 0 25px 50px -12px rgba(0, 0, 0, 0.25);
  animation: fadeIn 0.2s ease-out;
}

.modal-container-small {
  background: white;
  border-radius: 1rem;
  width: 90%;
  max-width: 500px;
  max-height: 90vh;
  overflow-y: auto;
  animation: fadeIn 0.2s ease-out;
}

@keyframes fadeIn {
  from {
    opacity: 0;
    transform: scale(0.95);
  }
  to {
    opacity: 1;
    transform: scale(1);
  }
}

.modal-header {
  position: sticky;
  top: 0;
  background: white;
  border-bottom: 1px solid #e5e7eb;
  padding: 1rem 1.5rem;
  display: flex;
  justify-content: space-between;
  align-items: center;
  z-index: 10;
}

.modal-title {
  font-size: 1.25rem;
  font-weight: bold;
  color: #1f2937;
}

.modal-close {
  background: none;
  border: none;
  cursor: pointer;
  color: #9ca3af;
}

.modal-body,
.modal-body-view {
  padding: 1.5rem;
}

.modal-footer {
  padding: 1rem 1.5rem;
  border-top: 1px solid #e5e7eb;
  display: flex;
  justify-content: flex-end;
  gap: 0.75rem;
  background: white;
  position: sticky;
  bottom: 0;
}

.form-group {
  margin-bottom: 1.25rem;
}

.form-label {
  display: block;
  font-size: 0.875rem;
  font-weight: 500;
  color: #374151;
  margin-bottom: 0.5rem;
}

.form-input {
  width: 100%;
  padding: 0.5rem 1rem;
  border: 1px solid #d1d5db;
  border-radius: 0.5rem;
  outline: none;
}

.form-input:focus {
  border-color: var(--color-secondary);
  ring: 2px solid rgba(252, 209, 22, 0.2);
}

.btn-submit {
  background-color: var(--color-primary);
  color: white;
  padding: 0.5rem 1.5rem;
  border-radius: 0.5rem;
  border: none;
  cursor: pointer;
}

.btn-submit:hover {
  background-color: var(--color-primary-dark);
}

.btn-cancel {
  background-color: #e5e7eb;
  color: #374151;
  padding: 0.5rem 1.5rem;
  border-radius: 0.5rem;
  border: none;
  cursor: pointer;
}

.btn-cancel:hover {
  background-color: #d1d5db;
}

/* Upload area */
.upload-area {
  border: 2px dashed #d1d5db;
  border-radius: 0.75rem;
  padding: 1.5rem;
  text-align: center;
  cursor: pointer;
  transition: all 0.2s;
}

.upload-area:hover {
  border-color: var(--color-primary);
  background-color: #f9fafb;
}

.files-list {
  display: flex;
  flex-direction: column;
  gap: 0.5rem;
}

.file-item {
  display: flex;
  align-items: center;
  gap: 0.75rem;
  padding: 0.5rem;
  background-color: #f9fafb;
  border-radius: 0.5rem;
}

/* Info section */
.info-section {
  margin-bottom: 1.5rem;
}

.section-title {
  font-size: 1rem;
  font-weight: 600;
  color: var(--color-primary);
  margin-bottom: 0.75rem;
  display: flex;
  align-items: center;
  gap: 0.5rem;
}

.info-grid {
  display: grid;
  grid-template-columns: repeat(2, 1fr);
  gap: 0.75rem;
  background-color: #f9fafb;
  padding: 1rem;
  border-radius: 0.5rem;
}

.info-label {
  font-weight: 500;
  color: #6b7280;
}

.message-content {
  background-color: #f9fafb;
  padding: 1rem;
  border-radius: 0.5rem;
  line-height: 1.5;
  white-space: pre-wrap;
}

/* Timeline */
.timeline {
  position: relative;
  padding-left: 1.5rem;
}

.timeline-item {
  position: relative;
  padding-bottom: 1rem;
}

.timeline-dot {
  position: absolute;
  left: -1.5rem;
  top: 0.25rem;
  width: 0.75rem;
  height: 0.75rem;
  border-radius: 50%;
  background-color: var(--color-primary);
}

.timeline-item::before {
  content: '';
  position: absolute;
  left: -1.125rem;
  top: 1rem;
  width: 2px;
  height: calc(100% - 0.5rem);
  background-color: #e5e7eb;
}

.timeline-item:last-child::before {
  display: none;
}

.timeline-content {
  background-color: #f9fafb;
  padding: 0.75rem;
  border-radius: 0.5rem;
}

/* Scrollbar */
.modal-container::-webkit-scrollbar,
.modal-container-view::-webkit-scrollbar {
  width: 6px;
}

.modal-container::-webkit-scrollbar-track,
.modal-container-view::-webkit-scrollbar-track {
  background: #f1f1f1;
}

.modal-container::-webkit-scrollbar-thumb,
.modal-container-view::-webkit-scrollbar-thumb {
  background: #c1c1c1;
  border-radius: 3px;
}

@media (max-width: 640px) {
  .modal-container,
  .modal-container-view {
    width: 95%;
    margin: 1rem;
  }

  .info-grid {
    grid-template-columns: 1fr;
  }
}
</style>
