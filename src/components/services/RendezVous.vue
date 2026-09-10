<template>
  <div class="min-h-screen bg-gray-50">
    <!-- Hero section -->
    <div class="relative bg-gradient-to-r from-accent to-primary-light text-white">
      <div class="absolute inset-0 bg-black/20"></div>
      <div class="relative max-w-7xl mx-auto px-4 py-16 md:py-20">
        <div class="text-center">
          <div class="inline-block bg-white/20 backdrop-blur px-4 py-1 rounded-full text-sm mb-4">
            🇬🇳 Service aux citoyens
          </div>
          <h1 class="text-4xl md:text-5xl font-bold mb-4">Prise de rendez-vous</h1>
          <p class="text-xl md:text-2xl max-w-3xl mx-auto opacity-90">
            Prenez rendez-vous avec les services consulaires de l'Ambassade
          </p>
          <div class="flex justify-center gap-4 mt-8">
            <div class="w-16 h-1 bg-accent "></div>
            <div class="w-16 h-1 bg-secondary"></div>
            <div class="w-16 h-1 bg-primary-light"></div>
          </div>
        </div>
      </div>

      <!-- Wave decoration -->
      <div class="absolute bottom-0 left-0 right-0">
        <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 1440 120" class="w-full h-auto">
          <path fill="#f3f4f6" fill-opacity="1" d="M0,64L80,69.3C160,75,320,85,480,80C640,75,800,53,960,48C1120,43,1280,53,1360,58.7L1440,64L1440,120L1360,120C1280,120,1120,120,960,120C800,120,640,120,480,120C320,120,160,120,80,120L0,120Z"></path>
        </svg>
      </div>
    </div>

    <!-- Contenu principal -->
    <div class="max-w-7xl mx-auto px-4 py-12">
      <div class="grid grid-cols-1 lg:grid-cols-3 gap-8">
        <!-- Formulaire de rendez-vous -->
        <div class="lg:col-span-2">
          <div class="bg-white rounded-2xl shadow-xl p-8">
            <h2 class="text-2xl font-bold text-gray-800 mb-6 flex items-center">
              <span class="bg-accent w-1 h-6 mr-3"></span>
              Formulaire de rendez-vous
            </h2>

            <form @submit.prevent="submitRendezVous" class="space-y-6">
              <!-- Type de service -->
              <div>
                <label class="block text-sm font-semibold text-gray-700 mb-2">
                  Type de service *
                </label>
                <select
                  v-model="formData.service"
                  class="w-full px-4 py-3 rounded-lg border border-gray-300 focus:outline-none focus:ring-2 focus:ring-accent focus:border-transparent"
                  required
                >
                  <option value="">Sélectionnez un service</option>
                  <option value="consulat">Services consulaires</option>
                  <option value="passeport">Demande de passeport</option>
                  <option value="carte-consulaire">Carte consulaire</option>
                  <option value="etat-civil">Actes d'état civil</option>
                  <option value="legalisation">Légalisation de documents</option>
                  <option value="visa">Information visa</option>
                  <option value="ambassadeur">Audience avec l'Ambassadeur</option>
                  <option value="autre">Autre service</option>
                </select>
              </div>

              <!-- Informations personnelles -->
              <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label class="block text-sm font-semibold text-gray-700 mb-2">
                    Nom *
                  </label>
                  <input
                    type="text"
                    v-model="formData.nom"
                    class="w-full px-4 py-3 rounded-lg border border-gray-300 focus:outline-none focus:ring-2 focus:ring-accent focus:border-transparent"
                    required
                  >
                </div>
                <div>
                  <label class="block text-sm font-semibold text-gray-700 mb-2">
                    Prénom(s) *
                  </label>
                  <input
                    type="text"
                    v-model="formData.prenom"
                    class="w-full px-4 py-3 rounded-lg border border-gray-300 focus:outline-none focus:ring-2 focus:ring-accent focus:border-transparent"
                    required
                  >
                </div>
              </div>

              <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label class="block text-sm font-semibold text-gray-700 mb-2">
                    Email *
                  </label>
                  <input
                    type="email"
                    v-model="formData.email"
                    class="w-full px-4 py-3 rounded-lg border border-gray-300 focus:outline-none focus:ring-2 focus:ring-accent focus:border-transparent"
                    required
                  >
                </div>
                <div>
                  <label class="block text-sm font-semibold text-gray-700 mb-2">
                    Téléphone *
                  </label>
                  <input
                    type="tel"
                    v-model="formData.telephone"
                    class="w-full px-4 py-3 rounded-lg border border-gray-300 focus:outline-none focus:ring-2 focus:ring-accent focus:border-transparent"
                    required
                  >
                </div>
              </div>

              <!-- Date et heure -->
              <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label class="block text-sm font-semibold text-gray-700 mb-2">
                    Date souhaitée *
                  </label>
                  <input
                    type="date"
                    v-model="formData.date"
                    :min="dateMin"
                    class="w-full px-4 py-3 rounded-lg border border-gray-300 focus:outline-none focus:ring-2 focus:ring-accent focus:border-transparent"
                    required
                  >
                </div>
                <div>
                  <label class="block text-sm font-semibold text-gray-700 mb-2">
                    Heure souhaitée *
                  </label>
                  <select
                    v-model="formData.heure"
                    class="w-full px-4 py-3 rounded-lg border border-gray-300 focus:outline-none focus:ring-2 focus:ring-accent focus:border-transparent"
                    required
                  >
                    <option value="">Sélectionnez une heure</option>
                    <option value="09:00">09:00</option>
                    <option value="09:30">09:30</option>
                    <option value="10:00">10:00</option>
                    <option value="10:30">10:30</option>
                    <option value="11:00">11:00</option>
                    <option value="11:30">11:30</option>
                    <option value="14:00">14:00</option>
                    <option value="14:30">14:30</option>
                    <option value="15:00">15:00</option>
                    <option value="15:30">15:30</option>
                    <option value="16:00">16:00</option>
                  </select>
                </div>
              </div>

              <!-- Documents -->
              <div>
                <label class="block text-sm font-semibold text-gray-700 mb-2">
                  Documents à apporter *
                </label>
                <textarea
                  v-model="formData.documents"
                  rows="3"
                  class="w-full px-4 py-3 rounded-lg border border-gray-300 focus:outline-none focus:ring-2 focus:ring-accent focus:border-transparent"
                  placeholder="Listez les documents que vous apporterez (passeport, formulaire, etc.)"
                  required
                ></textarea>
              </div>

              <!-- Message -->
              <div>
                <label class="block text-sm font-semibold text-gray-700 mb-2">
                  Message (optionnel)
                </label>
                <textarea
                  v-model="formData.message"
                  rows="3"
                  class="w-full px-4 py-3 rounded-lg border border-gray-300 focus:outline-none focus:ring-2 focus:ring-accent focus:border-transparent"
                  placeholder="Informations complémentaires..."
                ></textarea>
              </div>

              <!-- Bouton soumission - CENTRÉ -->
              <div class="flex justify-center pt-4">
                <button
                  type="submit"
                  :disabled="isSubmitting"
                  class="bg-accent text-white px-10 py-4 rounded-lg font-semibold hover:bg-accent-dark transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-3 text-lg shadow-lg hover:shadow-xl"
                >
                  <svg v-if="isSubmitting" class="animate-spin h-5 w-5" fill="none" viewBox="0 0 24 24">
                    <circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4"></circle>
                    <path class="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                  </svg>
                  <span v-else>📅 Demander un rendez-vous</span>
                </button>
              </div>
            </form>
          </div>
        </div>

        <!-- Sidebar informations -->
        <div class="space-y-6">
          <!-- Horaires d'ouverture -->
          <div class="bg-white rounded-2xl shadow-xl p-6">
            <h3 class="text-xl font-bold text-gray-800 mb-4 flex items-center">
              <svg class="w-6 h-6 text-accent mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z"></path>
              </svg>
              Horaires d'ouverture
            </h3>
            <div class="space-y-2">
              <div class="flex justify-between py-2 border-b border-gray-100">
                <span class="text-gray-600">Lundi - Jeudi</span>
                <span class="font-semibold">09:00 - 16:00</span>
              </div>
              <div class="flex justify-between py-2 border-b border-gray-100">
                <span class="text-gray-600">Vendredi</span>
                <span class="font-semibold">09:00 - 13:00</span>
              </div>
              <div class="flex justify-between py-2">
                <span class="text-gray-600">Samedi - Dimanche</span>
                <span class="font-semibold text-accent">Fermé</span>
              </div>
            </div>
          </div>

          <!-- Coordonnées -->
          <div class="bg-white rounded-2xl shadow-xl p-6">
            <h3 class="text-xl font-bold text-gray-800 mb-4 flex items-center">
              <svg class="w-6 h-6 text-accent mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z"></path>
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 11a3 3 0 11-6 0 3 3 0 016 0z"></path>
              </svg>
              Nous contacter
            </h3>
            <div class="space-y-3">
              <div class="flex items-start gap-3">
                <svg class="w-5 h-5 text-accent mt-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z"></path>
                </svg>
                <div>
                  <p class="font-semibold">Téléphone</p>
                  <p class="text-gray-600">+1 (202) 986-4300</p>
                </div>
              </div>
              <div class="flex items-start gap-3">
                <svg class="w-5 h-5 text-accent mt-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z"></path>
                </svg>
                <div>
                  <p class="font-semibold">Email</p>
                  <p class="text-gray-600">consulat@ambaguinee-usa.org</p>
                </div>
              </div>
              <div class="flex items-start gap-3">
                <svg class="w-5 h-5 text-accent mt-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z"></path>
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 11a3 3 0 11-6 0 3 3 0 016 0z"></path>
                </svg>
                <div>
                  <p class="font-semibold">Adresse</p>
                  <p class="text-gray-600">2112 Leroy Place, NW<br>Washington, D.C. 20008</p>
                </div>
              </div>
            </div>
          </div>

          <!-- Documents requis -->
          <div class="bg-gradient-to-r from-accent to-primary-light text-white rounded-2xl p-6">
            <h3 class="text-xl font-bold mb-4 flex items-center">
              <svg class="w-6 h-6 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"></path>
              </svg>
              Documents requis
            </h3>
            <ul class="space-y-2 text-sm">
              <li class="flex items-start gap-2">
                <span class="text-secondary">✓</span>
                <span>Pièce d'identité valide (passeport, carte consulaire)</span>
              </li>
              <li class="flex items-start gap-2">
                <span class="text-secondary">✓</span>
                <span>Formulaire de rendez-vous rempli</span>
              </li>
              <li class="flex items-start gap-2">
                <span class="text-secondary">✓</span>
                <span>Documents spécifiques selon le service demandé</span>
              </li>
              <li class="flex items-start gap-2">
                <span class="text-secondary">✓</span>
                <span>Preuve de résidence aux États-Unis</span>
              </li>
            </ul>
          </div>
        </div>
      </div>

      <!-- Modal de confirmation -->
      <div v-if="showModal" class="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
        <div class="bg-white rounded-2xl max-w-md w-full p-8 text-center">
          <div class="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
            <svg class="w-8 h-8 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M5 13l4 4L19 7"></path>
            </svg>
          </div>
          <h3 class="text-2xl font-bold text-gray-800 mb-2">Demande envoyée !</h3>
          <p class="text-gray-600 mb-6">
            Votre demande de rendez-vous a été enregistrée avec succès.<br>
            Nous vous contacterons sous 48h pour confirmer votre rendez-vous.
          </p>
          <button
            @click="closeModal"
            class="bg-accent text-white px-6 py-3 rounded-lg font-semibold hover:bg-accent-dark transition-colors"
          >
            Fermer
          </button>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, reactive } from 'vue'

// État du formulaire
const formData = reactive({
  service: '',
  nom: '',
  prenom: '',
  email: '',
  telephone: '',
  date: '',
  heure: '',
  documents: '',
  message: ''
})

// État de soumission
const isSubmitting = ref(false)
const showModal = ref(false)

// Date minimale (aujourd'hui + 2 jours ouvrés)
const dateMin = ref(new Date(Date.now() + 2 * 24 * 60 * 60 * 1000).toISOString().split('T')[0])

// Soumission du formulaire
const submitRendezVous = async () => {
  isSubmitting.value = true

  // Simuler l'envoi au serveur (à remplacer par votre API)
  try {
    await new Promise(resolve => setTimeout(resolve, 1500))
    console.log('Rendez-vous demandé:', formData)

    // Réinitialiser le formulaire
    Object.keys(formData).forEach(key => {
      formData[key] = ''
    })

    // Afficher le modal de confirmation
    showModal.value = true
  } catch (error) {
    console.error('Erreur lors de l\'envoi:', error)
    alert('Une erreur est survenue. Veuillez réessayer.')
  } finally {
    isSubmitting.value = false
  }
}

// Fermer le modal
const closeModal = () => {
  showModal.value = false
}
</script>

<style scoped>
.animate-spin {
  animation: spin 1s linear infinite;
}

@keyframes spin {
  from {
    transform: rotate(0deg);
  }
  to {
    transform: rotate(360deg);
  }
}

.hover\:shadow-md {
  transition: all 0.3s ease;
}
</style>
