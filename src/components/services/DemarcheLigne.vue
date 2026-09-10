<template>
  <div class="min-h-screen bg-gray-50">
    <!-- Hero section -->
    <div class="relative bg-gradient-to-r from-accent to-primary-light text-white">
      <div class="absolute inset-0 bg-black/20"></div>
      <div class="relative max-w-7xl mx-auto px-4 py-16 md:py-20">
        <div class="text-center">
          <div class="inline-block bg-white/20 backdrop-blur px-4 py-1 rounded-full text-sm mb-4">
            🇬🇳 Démarches en ligne
          </div>
          <h1 class="text-4xl md:text-5xl font-bold mb-4">Carte Consulaire</h1>
          <p class="text-xl md:text-2xl max-w-3xl mx-auto opacity-90">
            Obtenez votre carte consulaire en ligne en quelques étapes
          </p>
          <div class="flex justify-center gap-4 mt-8">
            <div class="w-16 h-1 bg-accent"></div>
            <div class="w-16 h-1 bg-secondary"></div>
            <div class="w-16 h-1 bg-primary-light"></div>
          </div>
        </div>
      </div>

      <!-- Wave decoration -->
      <div class="absolute bottom-0 left-0 right-0">
        <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 1440 120" class="w-full h-auto">
          <path
            fill="#f3f4f6"
            fill-opacity="1"
            d="M0,64L80,69.3C160,75,320,85,480,80C640,75,800,53,960,48C1120,43,1280,53,1360,58.7L1440,64L1440,120L1360,120C1280,120,1120,120,960,120C800,120,640,120,480,120C320,120,160,120,80,120L0,120Z"
          ></path>
        </svg>
      </div>
    </div>

    <!-- Contenu principal -->
    <div class="max-w-7xl mx-auto px-4 py-12">
      <!-- Barre de progression -->
      <div class="bg-white rounded-2xl shadow-xl p-6 mb-8">
        <div class="flex items-center justify-between relative">
          <div
            v-for="(step, index) in steps"
            :key="index"
            class="flex-1 relative flex flex-col items-center"
          >
            <!-- Cercle du numéro avec z-index élevé -->
            <div class="relative z-10">
              <div
                :class="[
                  'w-10 h-10 rounded-full flex items-center justify-center font-bold transition-all duration-300',
                  currentStep >= index + 1 ? 'bg-accent text-white' : 'bg-gray-200 text-gray-500',
                  currentStep > index + 1 ? 'ring-4 ring-accent/30' : '',
                ]"
              >
                {{ index + 1 }}
              </div>
            </div>
            <div
              class="text-xs mt-2 font-medium"
              :class="currentStep >= index + 1 ? 'text-accent' : 'text-gray-400'"
            >
              {{ step.title }}
            </div>
            <!-- Trait de connexion (derrière les cercles) -->
            <div
              v-if="index < steps.length - 1"
              class="absolute top-5 left-[calc(50%+20px)] right-[-calc(50%-20px)] h-0.5 -translate-y-1/2"
              :class="currentStep > index + 1 ? 'bg-accent' : 'bg-gray-200'"
              style="z-index: 1"
            ></div>
          </div>
        </div>
      </div>

      <!-- Formulaire principal -->
      <div class="bg-white rounded-2xl shadow-xl overflow-hidden mb-8">
        <div class="p-8">
          <!-- Étape 1: Formulaire de demande -->
          <div v-show="currentStep === 1" class="space-y-6">
            <div class="border-b border-gray-200 pb-4">
              <h2 class="text-2xl font-bold text-gray-800 flex items-center gap-2">
                <svg
                  class="w-6 h-6 text-accent"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    stroke-linecap="round"
                    stroke-linejoin="round"
                    stroke-width="2"
                    d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"
                  ></path>
                </svg>
                1. Formulaire de demande (à remplir en ligne)
              </h2>
              <p class="text-gray-600 mt-2">Veuillez remplir toutes les informations ci-dessous</p>
            </div>

            <div class="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <label class="block text-sm font-medium text-gray-700 mb-2">Nom complet *</label>
                <input
                  type="text"
                  v-model="form.fullname"
                  class="w-full border border-gray-300 rounded-lg px-4 py-3 focus:ring-2 focus:ring-accent focus:border-transparent transition"
                  placeholder="Ex: Mamadou Diallo"
                />
              </div>
              <div>
                <label class="block text-sm font-medium text-gray-700 mb-2">Prénom(s) *</label>
                <input
                  type="text"
                  v-model="form.firstname"
                  class="w-full border border-gray-300 rounded-lg px-4 py-3 focus:ring-2 focus:ring-accent focus:border-transparent transition"
                  placeholder="Prénom usuel"
                />
              </div>
              <div>
                <label class="block text-sm font-medium text-gray-700 mb-2"
                  >Date de naissance *</label
                >
                <input
                  type="date"
                  v-model="form.dob"
                  class="w-full border border-gray-300 rounded-lg px-4 py-3 focus:ring-2 focus:ring-accent focus:border-transparent transition"
                />
              </div>
              <div>
                <label class="block text-sm font-medium text-gray-700 mb-2"
                  >Lieu de naissance *</label
                >
                <input
                  type="text"
                  v-model="form.birthplace"
                  class="w-full border border-gray-300 rounded-lg px-4 py-3 focus:ring-2 focus:ring-accent focus:border-transparent transition"
                  placeholder="Ville, Pays"
                />
              </div>
              <div>
                <label class="block text-sm font-medium text-gray-700 mb-2">Email *</label>
                <input
                  type="email"
                  v-model="form.email"
                  class="w-full border border-gray-300 rounded-lg px-4 py-3 focus:ring-2 focus:ring-accent focus:border-transparent transition"
                  placeholder="exemple@domaine.com"
                />
              </div>
              <div>
                <label class="block text-sm font-medium text-gray-700 mb-2"
                  >Téléphone (USA) *</label
                >
                <input
                  type="tel"
                  v-model="form.phone"
                  class="w-full border border-gray-300 rounded-lg px-4 py-3 focus:ring-2 focus:ring-accent focus:border-transparent transition"
                  placeholder="+1 234 567 8900"
                />
              </div>
            </div>

            <div class="flex justify-end pt-4">
              <button
                @click="nextStep"
                :disabled="!isFormValid"
                class="bg-accent text-white px-6 py-3 rounded-lg font-semibold hover:bg-accent-dark transition disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
              >
                Suivant
                <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path
                    stroke-linecap="round"
                    stroke-linejoin="round"
                    stroke-width="2"
                    d="M9 5l7 7-7 7"
                  ></path>
                </svg>
              </button>
            </div>
          </div>

          <!-- Étape 2: Téléchargement des justificatifs -->
          <div v-show="currentStep === 2" class="space-y-6">
            <div class="border-b border-gray-200 pb-4">
              <h2 class="text-2xl font-bold text-gray-800 flex items-center gap-2">
                <svg
                  class="w-6 h-6 text-accent"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    stroke-linecap="round"
                    stroke-linejoin="round"
                    stroke-width="2"
                    d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-8l-4-4m0 0L8 8m4-4v12"
                  ></path>
                </svg>
                2. Téléchargement des justificatifs
              </h2>
              <p class="text-gray-600 mt-2">Les documents susmentionnés devront être téléchargés</p>
            </div>

            <div class="grid grid-cols-1 md:grid-cols-2 gap-6">
              <!-- Preuve de nationalité -->
              <div
                class="border-2 border-dashed border-gray-300 rounded-xl p-6 hover:border-accent transition"
              >
                <div class="text-center">
                  <svg
                    class="w-12 h-12 text-accent mx-auto mb-3"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      stroke-linecap="round"
                      stroke-linejoin="round"
                      stroke-width="2"
                      d="M15 9h3.75M15 12h3.75M15 15h3.75M4.5 19.5h15a2.25 2.25 0 002.25-2.25V6.75A2.25 2.25 0 0019.5 4.5h-15a2.25 2.25 0 00-2.25 2.25v10.5A2.25 2.25 0 004.5 19.5z"
                    ></path>
                  </svg>
                  <h3 class="font-semibold text-gray-800 mb-2">Preuve de nationalité *</h3>
                  <p class="text-sm text-gray-500 mb-3">
                    Extrait de naissance ou passeport (PDF, JPG, PNG, max 5 Mo)
                  </p>
                  <input
                    type="file"
                    @change="handleFileUpload($event, 'nationality')"
                    accept=".pdf,.jpg,.jpeg,.png"
                    class="hidden"
                    ref="nationalityInput"
                  />
                  <button
                    @click="$refs.nationalityInput.click()"
                    class="bg-gray-100 text-gray-700 px-4 py-2 rounded-lg hover:bg-gray-200 transition text-sm"
                  >
                    Choisir un fichier
                  </button>
                  <div
                    v-if="files.nationality.name"
                    class="mt-2 text-sm"
                    :class="files.nationality.valid ? 'text-green-600' : 'text-red-600'"
                  >
                    {{ files.nationality.name }} -
                    {{ files.nationality.valid ? '✓ Valide' : files.nationality.message }}
                  </div>
                </div>
              </div>

              <!-- Preuve de résidence USA -->
              <div
                class="border-2 border-dashed border-gray-300 rounded-xl p-6 hover:border-accent transition"
              >
                <div class="text-center">
                  <svg
                    class="w-12 h-12 text-accent mx-auto mb-3"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      stroke-linecap="round"
                      stroke-linejoin="round"
                      stroke-width="2"
                      d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6"
                    ></path>
                  </svg>
                  <h3 class="font-semibold text-gray-800 mb-2">Preuve de résidence aux USA *</h3>
                  <p class="text-sm text-gray-500 mb-3">
                    Pièce d'identité locale, facture, bail (PDF, JPG, PNG, max 5 Mo)
                  </p>
                  <input
                    type="file"
                    @change="handleFileUpload($event, 'residence')"
                    accept=".pdf,.jpg,.jpeg,.png"
                    class="hidden"
                    ref="residenceInput"
                  />
                  <button
                    @click="$refs.residenceInput.click()"
                    class="bg-gray-100 text-gray-700 px-4 py-2 rounded-lg hover:bg-gray-200 transition text-sm"
                  >
                    Choisir un fichier
                  </button>
                  <div
                    v-if="files.residence.name"
                    class="mt-2 text-sm"
                    :class="files.residence.valid ? 'text-green-600' : 'text-red-600'"
                  >
                    {{ files.residence.name }} -
                    {{ files.residence.valid ? '✓ Valide' : files.residence.message }}
                  </div>
                </div>
              </div>

              <!-- Photo d'identité fond blanc -->
              <div
                class="border-2 border-dashed border-gray-300 rounded-xl p-6 hover:border-accent transition"
              >
                <div class="text-center">
                  <svg
                    class="w-12 h-12 text-accent mx-auto mb-3"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      stroke-linecap="round"
                      stroke-linejoin="round"
                      stroke-width="2"
                      d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z"
                    ></path>
                  </svg>
                  <h3 class="font-semibold text-gray-800 mb-2">Photo d'identité fond blanc *</h3>
                  <p class="text-sm text-gray-500 mb-3">Format JPG/PNG, taille ≤ 200 Ko</p>
                  <input
                    type="file"
                    @change="handleFileUpload($event, 'photo')"
                    accept="image/jpeg,image/png"
                    class="hidden"
                    ref="photoInput"
                  />
                  <button
                    @click="$refs.photoInput.click()"
                    class="bg-gray-100 text-gray-700 px-4 py-2 rounded-lg hover:bg-gray-200 transition text-sm"
                  >
                    Choisir un fichier
                  </button>
                  <div
                    v-if="files.photo.name"
                    class="mt-2 text-sm"
                    :class="files.photo.valid ? 'text-green-600' : 'text-red-600'"
                  >
                    {{ files.photo.name }} -
                    {{ files.photo.valid ? '✓ Valide' : files.photo.message }}
                  </div>
                </div>
              </div>

              <!-- Frais d'établissement -->
              <div
                class="bg-gradient-to-r from-accent/10 to-primary-light/10 rounded-xl p-6 text-center"
              >
                <svg
                  class="w-12 h-12 text-accent mx-auto mb-3"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    stroke-linecap="round"
                    stroke-linejoin="round"
                    stroke-width="2"
                    d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
                  ></path>
                </svg>
                <h3 class="font-semibold text-gray-800 mb-2">Frais d'établissement</h3>
                <p class="text-3xl font-bold text-accent mb-2">50 USD</p>
                <p class="text-sm text-gray-600">Payable directement en ligne</p>
              </div>
            </div>

            <div class="bg-yellow-50 border-l-4 border-secondary p-4 rounded-r-xl">
              <div class="flex items-start gap-3">
                <svg
                  class="w-5 h-5 text-secondary flex-shrink-0 mt-0.5"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    stroke-linecap="round"
                    stroke-linejoin="round"
                    stroke-width="2"
                    d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
                  ></path>
                </svg>
                <div>
                  <p class="font-semibold text-gray-800">NB :</p>
                  <p class="text-gray-700">
                    Le délai de traitement est de <strong>(07) jours ouvrables</strong> après
                    validation du dossier complet.
                  </p>
                </div>
              </div>
            </div>

            <div class="flex justify-between pt-4">
              <button
                @click="prevStep"
                class="bg-gray-100 text-gray-700 px-6 py-3 rounded-lg font-semibold hover:bg-gray-200 transition flex items-center gap-2"
              >
                <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path
                    stroke-linecap="round"
                    stroke-linejoin="round"
                    stroke-width="2"
                    d="M15 19l-7-7 7-7"
                  ></path>
                </svg>
                Précédent
              </button>
              <button
                @click="nextStep"
                :disabled="!allFilesValid"
                class="bg-accent text-white px-6 py-3 rounded-lg font-semibold hover:bg-accent-dark transition disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
              >
                Suivant
                <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path
                    stroke-linecap="round"
                    stroke-linejoin="round"
                    stroke-width="2"
                    d="M9 5l7 7-7 7"
                  ></path>
                </svg>
              </button>
            </div>
          </div>

          <!-- Étape 3: Paiement et soumission -->
          <div v-show="currentStep === 3" class="space-y-6">
            <div class="border-b border-gray-200 pb-4">
              <h2 class="text-2xl font-bold text-gray-800 flex items-center gap-2">
                <svg
                  class="w-6 h-6 text-accent"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    stroke-linecap="round"
                    stroke-linejoin="round"
                    stroke-width="2"
                    d="M3 10h18M7 15h1m4 0h1m-7 4h12a3 3 0 003-3V8a3 3 0 00-3-3H6a3 3 0 00-3 3v8a3 3 0 003 3z"
                  ></path>
                </svg>
                3. Paiement sécurisé & Soumission
              </h2>
              <p class="text-gray-600 mt-2">Finalisez votre demande en effectuant le paiement</p>
            </div>

            <div class="bg-gray-50 rounded-xl p-6">
              <div class="flex items-center justify-between mb-4">
                <span class="text-lg font-semibold text-gray-800">Frais consulaires</span>
                <span class="text-2xl font-bold text-accent">50 USD</span>
              </div>

              <div class="border-t border-gray-200 pt-4 mb-4">
                <label class="flex items-center gap-3 cursor-pointer">
                  <input
                    type="checkbox"
                    v-model="paymentConfirmed"
                    class="w-5 h-5 text-accent rounded focus:ring-accent"
                  />
                  <span class="text-gray-700"
                    >Je confirme avoir lu les conditions et je m'engage à payer les 50 USD par carte
                    bancaire</span
                  >
                </label>
              </div>

              <button
                @click="simulatePayment"
                :disabled="!paymentConfirmed || paymentDone"
                class="w-full bg-primary-light text-white px-6 py-3 rounded-lg font-semibold hover:bg-primary-dark transition disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
              >
                <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path
                    stroke-linecap="round"
                    stroke-linejoin="round"
                    stroke-width="2"
                    d="M3 10h18M7 15h1m4 0h1m-7 4h12a3 3 0 003-3V8a3 3 0 00-3-3H6a3 3 0 00-3 3v8a3 3 0 003 3z"
                  ></path>
                </svg>
                {{ paymentDone ? 'Paiement effectué ✓' : 'Payer en ligne (50 USD)' }}
              </button>

              <div
                v-if="paymentDone"
                class="mt-4 p-3 bg-green-100 text-green-800 rounded-lg text-sm flex items-center gap-2"
              >
                <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path
                    stroke-linecap="round"
                    stroke-linejoin="round"
                    stroke-width="2"
                    d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"
                  ></path>
                </svg>
                Paiement simulé accepté ! Vous pouvez maintenant soumettre votre dossier.
              </div>
            </div>

            <div class="bg-red-50 border-l-4 border-accent p-4 rounded-r-xl">
              <div class="flex items-start gap-3">
                <svg
                  class="w-5 h-5 text-accent flex-shrink-0 mt-0.5"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    stroke-linecap="round"
                    stroke-linejoin="round"
                    stroke-width="2"
                    d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z"
                  ></path>
                </svg>
                <div>
                  <p class="font-bold text-gray-800">IMPORTANT :</p>
                  <p class="text-gray-700">
                    Les documents susmentionnés devront être ensuite téléchargés sur la plate-forme
                    <span class="font-mono font-bold text-accent">express54.org</span> après
                    validation de votre demande.
                  </p>
                </div>
              </div>
            </div>

            <div class="flex justify-between pt-4">
              <button
                @click="prevStep"
                class="bg-gray-100 text-gray-700 px-6 py-3 rounded-lg font-semibold hover:bg-gray-200 transition flex items-center gap-2"
              >
                <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path
                    stroke-linecap="round"
                    stroke-linejoin="round"
                    stroke-width="2"
                    d="M15 19l-7-7 7-7"
                  ></path>
                </svg>
                Précédent
              </button>
              <button
                @click="submitDossier"
                :disabled="!paymentDone"
                class="bg-accent text-white px-8 py-3 rounded-lg font-semibold hover:bg-accent-dark transition disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
              >
                <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path
                    stroke-linecap="round"
                    stroke-linejoin="round"
                    stroke-width="2"
                    d="M5 13l4 4L19 7"
                  ></path>
                </svg>
                Soumettre le dossier
              </button>
            </div>
          </div>
        </div>
      </div>

      <!-- Message de confirmation -->
      <div v-if="submitted" class="bg-green-50 border border-green-200 rounded-2xl p-6 text-center">
        <svg
          class="w-16 h-16 text-green-600 mx-auto mb-4"
          fill="none"
          stroke="currentColor"
          viewBox="0 0 24 24"
        >
          <path
            stroke-linecap="round"
            stroke-linejoin="round"
            stroke-width="2"
            d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"
          ></path>
        </svg>
        <h3 class="text-xl font-bold text-gray-800 mb-2">Dossier soumis avec succès !</h3>
        <p class="text-gray-600">
          Votre demande de Carte Consulaire a été enregistrée. Délai de traitement : 7 jours
          ouvrables.
        </p>
        <p class="text-gray-600 mt-2">
          Un email de confirmation vous parviendra avec les instructions pour finaliser sur
          express54.org.
        </p>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, computed } from 'vue'

const steps = [{ title: 'Formulaire' }, { title: 'Documents' }, { title: 'Paiement' }]

const currentStep = ref(1)
const submitted = ref(false)
const paymentConfirmed = ref(false)
const paymentDone = ref(false)

// Formulaire
const form = ref({
  fullname: '',
  firstname: '',
  dob: '',
  birthplace: '',
  email: '',
  phone: '',
})

// Fichiers
const files = ref({
  nationality: { name: null, file: null, valid: false, message: '' },
  residence: { name: null, file: null, valid: false, message: '' },
  photo: { name: null, file: null, valid: false, message: '' },
})

// Validations
const isFormValid = computed(() => {
  return (
    form.value.fullname.trim() !== '' &&
    form.value.firstname.trim() !== '' &&
    form.value.dob !== '' &&
    form.value.birthplace.trim() !== '' &&
    form.value.email.trim() !== '' &&
    form.value.email.includes('@') &&
    form.value.phone.trim() !== ''
  )
})

const allFilesValid = computed(() => {
  return files.value.nationality.valid && files.value.residence.valid && files.value.photo.valid
})

// Gestion fichiers
const handleFileUpload = (event, type) => {
  const file = event.target.files[0]
  if (!file) return

  let validation = { valid: false, message: '' }

  if (type === 'nationality' || type === 'residence') {
    const maxSize = 5 * 1024 * 1024
    if (file.size > maxSize) {
      validation = { valid: false, message: 'Fichier > 5 Mo' }
    } else {
      validation = { valid: true, message: 'Valide' }
    }
  } else if (type === 'photo') {
    const maxSize = 200 * 1024
    const allowedTypes = ['image/jpeg', 'image/png']
    if (!allowedTypes.includes(file.type)) {
      validation = { valid: false, message: 'Format JPEG ou PNG uniquement' }
    } else if (file.size > maxSize) {
      validation = { valid: false, message: `Photo > 200 Ko (${(file.size / 1024).toFixed(1)} Ko)` }
    } else {
      validation = { valid: true, message: 'Valide' }
    }
  }

  files.value[type] = {
    name: file.name,
    file: file,
    valid: validation.valid,
    message: validation.message,
  }
}

// Navigation
const nextStep = () => {
  if (currentStep.value < 3) {
    currentStep.value++
  }
}

const prevStep = () => {
  if (currentStep.value > 1) {
    currentStep.value--
  }
}

// Simulation paiement
const simulatePayment = () => {
  if (!paymentConfirmed.value) return

  // Simulation de traitement
  setTimeout(() => {
    paymentDone.value = true
  }, 500)
}

// Soumission finale
const submitDossier = () => {
  if (!paymentDone.value) return

  // Simulation d'envoi
  setTimeout(() => {
    submitted.value = true
  }, 500)
}
</script>

<style scoped>
.hover\:shadow-md {
  transition: all 0.3s ease;
}

.bg-white\/10 {
  backdrop-filter: blur(4px);
}

input:focus {
  outline: none;
}
</style>
