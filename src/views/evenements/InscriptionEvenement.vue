<template>
  <section class="min-h-[70vh] bg-gray-50 px-4 py-10">
    <div class="max-w-lg mx-auto">
      <p v-if="chargement" class="text-center text-gray-500 py-20">Chargement de l'évènement…</p>

      <!-- 404 : evenement inexistant, non publie, ou module inactif. Le
           visiteur n'a pas a connaitre la difference. -->
      <div v-else-if="!evenement" class="bg-white rounded-2xl shadow-sm p-8 text-center">
        <span
          class="inline-flex items-center justify-center w-14 h-14 rounded-full bg-gray-100 text-gray-400 mb-5"
          aria-hidden="true"
        >
          <i class="bx bx-calendar-x text-3xl"></i>
        </span>
        <h1 class="text-xl font-bold text-ink-dark mb-2">Cet évènement n'est pas disponible</h1>
        <p class="text-gray-600 mb-6">{{ messageDeChargement }}</p>
        <router-link
          to="/"
          class="inline-block bg-primary hover:bg-primary-dark text-white px-6 py-2.5 rounded-full font-semibold transition-colors"
        >
          Retour à l'accueil
        </router-link>
      </div>

      <div v-else class="bg-white rounded-2xl shadow-sm overflow-hidden">
        <!-- Carte de l'evenement -->
        <div class="p-6 sm:p-8 border-b border-gray-100">
          <img
            v-if="evenement.logoUrl"
            :src="evenement.logoUrl"
            alt=""
            class="h-16 w-auto mb-6 object-contain"
          />

          <p
            v-if="evenement.typeLabel"
            class="text-xs font-semibold uppercase tracking-widest text-accent mb-2"
          >
            {{ evenement.typeLabel }}
          </p>

          <h1 class="text-2xl sm:text-3xl font-bold text-ink-dark leading-tight mb-5">
            {{ evenement.name }}
          </h1>

          <dl class="space-y-2.5 text-sm">
            <div class="flex gap-3">
              <dt class="text-gray-400 shrink-0">
                <i class="bx bx-calendar" aria-hidden="true"></i>
              </dt>
              <dd class="text-gray-700">
                {{ dateLisible }}
                <span v-if="evenement.time"> à {{ evenement.time }}</span>
              </dd>
            </div>
            <div v-if="evenement.location" class="flex gap-3">
              <dt class="text-gray-400 shrink-0"><i class="bx bx-map" aria-hidden="true"></i></dt>
              <dd class="text-gray-700">{{ evenement.location }}</dd>
            </div>
            <div v-if="evenement.spotsRemaining !== null" class="flex gap-3">
              <dt class="text-gray-400 shrink-0"><i class="bx bx-group" aria-hidden="true"></i></dt>
              <dd class="text-gray-700">
                {{ evenement.spotsRemaining }} place{{
                  evenement.spotsRemaining > 1 ? 's' : ''
                }}
                restante{{ evenement.spotsRemaining > 1 ? 's' : '' }}
              </dd>
            </div>
          </dl>

          <p
            v-if="evenement.description"
            class="text-gray-600 leading-relaxed mt-5 whitespace-pre-line"
          >
            {{ evenement.description }}
          </p>
        </div>

        <!-- Confirmation -->
        <div v-if="inscrit" class="p-6 sm:p-8 text-center">
          <span
            class="inline-flex items-center justify-center w-14 h-14 rounded-full bg-primary/10 text-primary mb-5"
            aria-hidden="true"
          >
            <i class="bx bx-check text-3xl"></i>
          </span>
          <h2 class="text-xl font-bold text-ink-dark mb-2">Votre inscription est enregistrée</h2>
          <!-- Ne promet pas de courriel de confirmation : le contrat du back
               n'en mentionne aucun, et annoncer un message qui n'arrive
               jamais ferait douter le visiteur de son inscription. -->
          <p class="text-gray-600">
            Nous avons enregistré l'inscription de {{ courrielInscrit }}. Présentez-vous à l'accueil
            le jour de l'évènement.
          </p>
        </div>

        <!-- Inscriptions closes : la carte reste visible, sans formulaire. -->
        <div v-else-if="evenement.isRegistrationClosed" class="p-6 sm:p-8">
          <div class="flex gap-3 bg-gray-50 border border-gray-200 rounded-xl p-4">
            <i class="bx bx-lock-alt text-xl text-gray-400 shrink-0" aria-hidden="true"></i>
            <div>
              <p class="font-semibold text-gray-800">Les inscriptions sont closes</p>
              <p class="text-sm text-gray-600 mt-0.5">
                Vous pouvez contacter l'ambassade si vous souhaitez assister à cet évènement.
              </p>
            </div>
          </div>
        </div>

        <!-- Formulaire -->
        <form v-else class="p-6 sm:p-8 space-y-5" novalidate @submit.prevent="envoyer">
          <h2 class="text-lg font-bold text-ink-dark">S'inscrire à cet évènement</h2>

          <!-- Panne de service : jamais presentee comme une faute de saisie. -->
          <p
            v-if="erreurGenerale"
            class="bg-red-50 border border-red-200 text-red-800 rounded-xl px-4 py-3 text-sm"
            role="alert"
          >
            {{ erreurGenerale }}
          </p>

          <div>
            <label for="nom" class="block text-sm font-medium text-gray-700 mb-1.5">
              Nom complet <span class="text-red-600" aria-hidden="true">*</span>
            </label>
            <input
              id="nom"
              v-model.trim="formulaire.fullName"
              type="text"
              maxlength="191"
              required
              autocomplete="name"
              :aria-invalid="Boolean(erreurs.fullName)"
              :aria-describedby="erreurs.fullName ? 'erreur-nom' : undefined"
              class="w-full border border-gray-300 rounded-lg px-4 py-2.5 focus:outline-none focus:ring-2 focus:ring-primary/40 focus:border-primary"
            />
            <p v-if="erreurs.fullName" id="erreur-nom" class="text-sm text-red-700 mt-1.5">
              {{ erreurs.fullName }}
            </p>
          </div>

          <div>
            <label for="courriel" class="block text-sm font-medium text-gray-700 mb-1.5">
              Adresse électronique <span class="text-red-600" aria-hidden="true">*</span>
            </label>
            <input
              id="courriel"
              v-model.trim="formulaire.email"
              type="email"
              maxlength="255"
              required
              autocomplete="email"
              :aria-invalid="Boolean(erreurs.email)"
              :aria-describedby="erreurs.email ? 'erreur-courriel' : undefined"
              class="w-full border border-gray-300 rounded-lg px-4 py-2.5 focus:outline-none focus:ring-2 focus:ring-primary/40 focus:border-primary"
            />
            <p v-if="erreurs.email" id="erreur-courriel" class="text-sm text-red-700 mt-1.5">
              {{ erreurs.email }}
            </p>
          </div>

          <div>
            <label for="telephone" class="block text-sm font-medium text-gray-700 mb-1.5">
              Téléphone <span class="text-gray-400 font-normal">(facultatif)</span>
            </label>
            <input
              id="telephone"
              v-model.trim="formulaire.phone"
              type="tel"
              maxlength="32"
              autocomplete="tel"
              class="w-full border border-gray-300 rounded-lg px-4 py-2.5 focus:outline-none focus:ring-2 focus:ring-primary/40 focus:border-primary"
            />
          </div>

          <button
            type="submit"
            :disabled="envoiEnCours"
            class="w-full bg-primary hover:bg-primary-dark disabled:opacity-60 disabled:cursor-not-allowed text-white font-semibold px-6 py-3 rounded-full transition-colors"
          >
            {{ envoiEnCours ? 'Envoi en cours…' : 'Confirmer mon inscription' }}
          </button>
        </form>
      </div>
    </div>
  </section>
</template>

<script setup lang="ts">
import { ref, reactive, computed, watch } from 'vue'
import { useRoute } from 'vue-router'
import {
  recupererEvenement,
  inscrireAEvenement,
  genreErreur,
  messageErreur,
  type EvenementPublic,
  type DemandeInscription,
} from '@/api/evenements'

const route = useRoute()

const evenement = ref<EvenementPublic | null>(null)
const chargement = ref(true)
const messageDeChargement = ref('')

const formulaire = reactive<DemandeInscription>({ fullName: '', email: '', phone: '' })
const erreurs = reactive<Record<string, string>>({})
const erreurGenerale = ref('')
const envoiEnCours = ref(false)
const inscrit = ref(false)
const courrielInscrit = ref('')

const dateLisible = computed(() => {
  const brut = evenement.value?.date
  if (!brut) return ''
  const date = new Date(brut)
  if (Number.isNaN(date.getTime())) return brut
  return date.toLocaleDateString('fr-FR', {
    weekday: 'long',
    day: 'numeric',
    month: 'long',
    year: 'numeric',
  })
})

async function charger(token: string): Promise<void> {
  chargement.value = true
  evenement.value = null
  messageDeChargement.value = ''
  try {
    evenement.value = await recupererEvenement(token)
  } catch (souleve) {
    // Le back rend 404 aussi bien pour un module inactif que pour un
    // evenement non publie : dans les deux cas le visiteur ne peut rien
    // faire, et le detail ne le regarde pas.
    messageDeChargement.value =
      genreErreur(souleve) === 'introuvable'
        ? "Ce lien n'est plus valable, ou l'évènement a été retiré."
        : messageErreur(souleve)
  } finally {
    chargement.value = false
  }
}

/**
 * Controle de surface, pour eviter un aller-retour evident. Le serveur reste
 * l'autorite : un 422 reaffiche ses propres messages.
 */
function valider(): boolean {
  for (const cle of Object.keys(erreurs)) delete erreurs[cle]

  if (!formulaire.fullName) erreurs.fullName = 'Indiquez votre nom complet.'
  if (!formulaire.email) {
    erreurs.email = 'Indiquez votre adresse électronique.'
  } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formulaire.email)) {
    erreurs.email = "Cette adresse électronique n'est pas valide."
  }

  return Object.keys(erreurs).length === 0
}

async function envoyer(): Promise<void> {
  erreurGenerale.value = ''
  if (!valider() || !evenement.value) return

  envoiEnCours.value = true
  try {
    await inscrireAEvenement(evenement.value.publicToken, {
      fullName: formulaire.fullName,
      email: formulaire.email,
      ...(formulaire.phone ? { phone: formulaire.phone } : {}),
    })
    courrielInscrit.value = formulaire.email
    inscrit.value = true
  } catch (souleve) {
    const genre = genreErreur(souleve)
    if (genre === 'impossible') {
      // Capacite atteinte ou echeance passee pendant la saisie : la carte
      // doit refleter le nouvel etat, sinon le formulaire reste ouvert sur
      // un evenement qui n'accepte plus personne.
      erreurGenerale.value = messageErreur(souleve)
      await charger(String(route.params.token))
    } else {
      erreurGenerale.value = messageErreur(souleve)
    }
  } finally {
    envoiEnCours.value = false
  }
}

watch(
  () => route.params.token,
  (token) => {
    inscrit.value = false
    void charger(String(token))
  },
  { immediate: true },
)
</script>
