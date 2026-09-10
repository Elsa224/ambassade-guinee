<template>
  <div
    v-if="company"
    class="fixed inset-0 bg-black/50 backdrop-blur-sm flex justify-center items-center z-50 p-4"
  >
    <div class="bg-white rounded-xl shadow-2xl w-full max-w-2xl max-h-[90vh] overflow-hidden">
      <!-- En-tête du modal -->
      <div class="bg-gradient-to-r from-ink to-ink-light p-4">
        <div class="flex justify-between items-center">
          <h2 class="text-xl font-bold text-white">
            Éditer {{ editedCompany.nom || company.nom }}
          </h2>
          <button
            @click="$emit('close')"
            class="text-white hover:bg-white/20 rounded-full w-8 h-8 flex items-center justify-center transition-colors"
          >
            <i class="bx bx-x text-lg"></i>
          </button>
        </div>
      </div>

      <!-- Contenu défilant -->
      <div class="overflow-y-auto max-h-[calc(90vh-80px)]">
        <form @submit.prevent="submitForm" class="p-6 space-y-6">
          <!-- Section Logo -->
          <div class="border-b pb-4">
            <h3 class="text-sm font-semibold text-gray-700 mb-3 uppercase tracking-wide">
              Logo de l'entreprise
            </h3>
            <div class="flex items-center gap-4">
              <div class="w-16 h-16 bg-gray-100 rounded-lg border flex items-center justify-center">
                <i class="bx bx-building text-gray-400 text-2xl"></i>
              </div>
              <div class="flex-1">
                <label class="block mb-2 text-sm font-medium text-gray-700">Changer le logo</label>
                <input
                  type="file"
                  @change="onFileChange"
                  class="w-full text-sm text-gray-500 file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:text-sm file:font-semibold file:bg-ink file:text-white hover:file:bg-ink-dark"
                  accept="image/*"
                />
              </div>
            </div>
          </div>

          <!-- Section Informations de base -->
          <div class="border-b pb-4">
            <h3 class="text-sm font-semibold text-gray-700 mb-3 uppercase tracking-wide">
              Informations de base
            </h3>
            <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label class="block mb-2 text-sm font-medium text-gray-700"
                  >Nom de l'entreprise</label
                >
                <input
                  v-model="editedCompany.nom"
                  type="text"
                  class="w-full border border-gray-300 rounded-lg px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-ink focus:border-transparent"
                  placeholder="Entrez le nom"
                />
              </div>

              <div>
                <label class="block mb-2 text-sm font-medium text-gray-700"
                  >Numéro d'identification</label
                >
                <input
                  v-model="editedCompany.idNumber"
                  type="text"
                  class="w-full border border-gray-300 rounded-lg px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-ink focus:border-transparent"
                  placeholder="ID de l'entreprise"
                />
              </div>

              <div>
                <label class="block mb-2 text-sm font-medium text-gray-700"
                  >Secteur d'activité</label
                >
                <input
                  v-model="editedCompany.industry"
                  type="text"
                  class="w-full border border-gray-300 rounded-lg px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-ink focus:border-transparent"
                  placeholder="Industrie"
                />
              </div>

              <div>
                <label class="block mb-2 text-sm font-medium text-gray-700"
                  >Nombre d'employés</label
                >
                <select
                  v-model="editedCompany.numEmployees"
                  class="w-full border border-gray-300 rounded-lg px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-ink focus:border-transparent"
                >
                  <option value="" disabled>Sélectionnez</option>
                  <option v-for="n in 100" :key="n" :value="n">
                    {{ n }} employé{{ n > 1 ? 's' : '' }}
                  </option>
                </select>
              </div>
            </div>
          </div>

          <!-- Section Adresse -->
          <div class="border-b pb-4">
            <h3 class="text-sm font-semibold text-gray-700 mb-3 uppercase tracking-wide">
              Adresse
            </h3>
            <div class="space-y-4">
              <div>
                <label class="block mb-2 text-sm font-medium text-gray-700">Adresse complète</label>
                <input
                  v-model="editedCompany.address"
                  type="text"
                  class="w-full border border-gray-300 rounded-lg px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-ink focus:border-transparent"
                  placeholder="Adresse"
                />
              </div>

              <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label class="block mb-2 text-sm font-medium text-gray-700">Ville</label>
                  <input
                    v-model="editedCompany.city"
                    type="text"
                    class="w-full border border-gray-300 rounded-lg px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-ink focus:border-transparent"
                    placeholder="Ville"
                  />
                </div>

                <div>
                  <label class="block mb-2 text-sm font-medium text-gray-700">Région/État</label>
                  <input
                    v-model="editedCompany.region"
                    type="text"
                    class="w-full border border-gray-300 rounded-lg px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-ink focus:border-transparent"
                    placeholder="Région"
                  />
                </div>

                <div>
                  <label class="block mb-2 text-sm font-medium text-gray-700">Pays</label>
                  <select
                    v-model="editedCompany.country"
                    class="w-full border border-gray-300 rounded-lg px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-ink focus:border-transparent"
                  >
                    <option>USA</option>
                    <option>France</option>
                    <option>Côte d'Ivoire</option>
                  </select>
                </div>

                <div>
                  <label class="block mb-2 text-sm font-medium text-gray-700">Code postal</label>
                  <input
                    v-model="editedCompany.zip"
                    type="text"
                    class="w-full border border-gray-300 rounded-lg px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-ink focus:border-transparent"
                    placeholder="Code postal"
                  />
                </div>
              </div>
            </div>
          </div>

          <!-- Section Contact -->
          <div>
            <h3 class="text-sm font-semibold text-gray-700 mb-3 uppercase tracking-wide">
              Personne à contacter
            </h3>
            <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label class="block mb-2 text-sm font-medium text-gray-700">Nom du contact</label>
                <input
                  v-model="editedCompany.contact"
                  type="text"
                  class="w-full border border-gray-300 rounded-lg px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-ink focus:border-transparent"
                  placeholder="Personne à contacter"
                />
              </div>

              <div>
                <label class="block mb-2 text-sm font-medium text-gray-700">Titre</label>
                <input
                  v-model="editedCompany.title"
                  type="text"
                  class="w-full border border-gray-300 rounded-lg px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-ink focus:border-transparent"
                  placeholder="Titre/fonction"
                />
              </div>

              <div>
                <label class="block mb-2 text-sm font-medium text-gray-700">Email</label>
                <input
                  v-model="editedCompany.email"
                  type="email"
                  class="w-full border border-gray-300 rounded-lg px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-ink focus:border-transparent"
                  placeholder="email@exemple.com"
                />
              </div>

              <div>
                <label class="block mb-2 text-sm font-medium text-gray-700">Téléphone</label>
                <input
                  v-model="editedCompany.phone"
                  type="text"
                  class="w-full border border-gray-300 rounded-lg px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-ink focus:border-transparent"
                  placeholder="Numéro de téléphone"
                />
              </div>
            </div>
          </div>

          <!-- Boutons d'action -->
          <div class="flex justify-end gap-3 pt-4">
            <button
              type="button"
              @click="$emit('close')"
              class="px-6 py-2.5 border border-gray-300 rounded-lg text-sm font-medium text-gray-700 hover:bg-gray-50 transition-colors"
            >
              Annuler
            </button>
            <button
              type="submit"
              class="px-6 py-2.5 bg-ink text-white rounded-lg text-sm font-medium hover:bg-ink-dark transition-colors flex items-center gap-2"
            >
              <i class="bx bx-check"></i>
              Soumettre
            </button>
          </div>
        </form>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { reactive, watch } from 'vue'

interface Company {
  nom?: string
  idNumber?: string
  industry?: string
  numEmployees?: string
  address?: string
  city?: string
  region?: string
  country?: string
  zip?: string
  contact?: string
  title?: string
  email?: string
  phone?: string
  logo?: string
}

const props = defineProps<{ company: Company }>()
const emit = defineEmits(['submit', 'close'])

const editedCompany = reactive({ ...props.company })

watch(
  () => props.company,
  (newCompany) => {
    if (newCompany) Object.assign(editedCompany, newCompany)
  },
  { immediate: true },
)

function onFileChange(e: Event) {
  const file = (e.target as HTMLInputElement).files?.[0]
  if (file) editedCompany.logo = URL.createObjectURL(file)
}

function submitForm() {
  emit('submit', { ...editedCompany })
}
</script>

<style scoped>
@import url('https://unpkg.com/boxicons@2.1.4/css/boxicons.min.css');
</style>
