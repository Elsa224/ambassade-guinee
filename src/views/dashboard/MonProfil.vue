<script setup lang="ts">
import { computed, onMounted, ref } from 'vue'
import {
  LONGUEUR_MOT_DE_PASSE,
  changerMotDePasse,
  dateLisible,
  libelleRole,
  messageErreurCompte,
  modifierCompte,
  recupererCompte,
  type Compte,
} from '@/api/compte'
import { useAuthStore } from '@/stores/auth'

/**
 * Mon profil.
 *
 * Le seul ecran du back-office ouvert a TOUS les roles : un compte qui ne
 * peut pas changer son mot de passe est un compte qu'on ne peut pas
 * securiser. Il remplace trois ecrans herites qui mentaient — l'un affichait
 * « Mot de passe modifie avec succes ! » sans rien envoyer a personne,
 * l'autre annoncait une deconnexion sans effacer le jeton, le troisieme
 * affichait « John Doe » en dur.
 *
 * Aucune regle de robustesse n'est inventee ici. Le front verifie seulement
 * que les deux saisies coincident, pour eviter un aller-retour evident ; la
 * longueur minimale est celle que le back applique, et c'est lui qui refuse.
 */
const auth = useAuthStore()

const compte = ref<Compte | null>(null)
const chargement = ref(true)
const erreurChargement = ref('')

async function charger(): Promise<void> {
  chargement.value = true
  erreurChargement.value = ''
  try {
    compte.value = await recupererCompte()
    nom.value = compte.value.name
  } catch (souleve) {
    erreurChargement.value = messageErreurCompte(souleve)
  } finally {
    chargement.value = false
  }
}

onMounted(charger)

// --- Identite --------------------------------------------------------------

const nom = ref('')
const enregistrementNom = ref(false)
const erreurNom = ref('')
const nomEnregistre = ref(false)

const nomModifie = computed(() => compte.value !== null && nom.value.trim() !== compte.value.name)

async function enregistrerLeNom(): Promise<void> {
  if (enregistrementNom.value || !nomModifie.value) return
  enregistrementNom.value = true
  erreurNom.value = ''
  nomEnregistre.value = false
  try {
    const servi = await modifierCompte(nom.value.trim())
    compte.value = servi
    nom.value = servi.name
    // Le menu et l'en-tete lisent le store : sans cela, le nom change a
    // l'ecran mais reste l'ancien partout ailleurs jusqu'au rechargement.
    if (auth.utilisateur !== null) auth.utilisateur = { ...auth.utilisateur, name: servi.name }
    nomEnregistre.value = true
  } catch (souleve) {
    erreurNom.value = messageErreurCompte(souleve)
  } finally {
    enregistrementNom.value = false
  }
}

// --- Mot de passe ----------------------------------------------------------

const motDePasse = ref({ actuel: '', nouveau: '', confirmation: '' })
const enregistrementMdp = ref(false)
const erreurMdp = ref('')
const mdpChange = ref(false)

/**
 * La seule verification faite ici, et elle n'est pas une regle : elle evite
 * un aller-retour pour une faute de frappe evidente. Tout le reste — la
 * longueur, l'exactitude de l'ancien mot de passe — appartient au serveur,
 * qui repond en 422 avec son propre message.
 */
const confirmationDiverge = computed(
  () =>
    motDePasse.value.confirmation !== '' &&
    motDePasse.value.nouveau !== motDePasse.value.confirmation,
)

const mdpComplet = computed(
  () =>
    motDePasse.value.actuel !== '' &&
    motDePasse.value.nouveau !== '' &&
    motDePasse.value.confirmation !== '',
)

async function changerLeMotDePasse(): Promise<void> {
  if (enregistrementMdp.value || !mdpComplet.value || confirmationDiverge.value) return
  enregistrementMdp.value = true
  erreurMdp.value = ''
  mdpChange.value = false
  try {
    await changerMotDePasse({
      current_password: motDePasse.value.actuel,
      password: motDePasse.value.nouveau,
      password_confirmation: motDePasse.value.confirmation,
    })
    motDePasse.value = { actuel: '', nouveau: '', confirmation: '' }
    mdpChange.value = true
    // La date affichee vient du back, jamais d'une horloge locale : on la
    // relit plutot que de la supposer.
    await charger()
  } catch (souleve) {
    erreurMdp.value = messageErreurCompte(souleve)
  } finally {
    enregistrementMdp.value = false
  }
}

const derniereConnexion = computed(() => dateLisible(compte.value?.last_login_at ?? null))
const dernierChangement = computed(() => dateLisible(compte.value?.password_changed_at ?? null))
</script>

<template>
  <div class="max-w-2xl">
    <header class="mb-6">
      <h2 class="text-2xl font-bold text-gray-800">Mon profil</h2>
      <p class="text-gray-600 mt-1">Votre nom, et le mot de passe de votre compte.</p>
    </header>

    <p v-if="chargement" class="py-20 text-center text-gray-500">Chargement du compte…</p>

    <p
      v-else-if="erreurChargement"
      class="rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-red-800"
      role="alert"
    >
      {{ erreurChargement }}
      <button type="button" class="ml-2 font-medium underline" @click="charger()">Réessayer</button>
    </p>

    <div v-else-if="compte" class="space-y-6">
      <!-- IDENTITE -->
      <section class="space-y-5 rounded-xl border border-gray-200 bg-white p-6">
        <div>
          <h3 class="font-semibold text-gray-800">Identité</h3>
          <p class="text-sm text-gray-600">Le nom affiché dans le menu et sur les écrans.</p>
        </div>

        <form class="space-y-5" @submit.prevent="enregistrerLeNom">
          <div>
            <label class="mb-1.5 block text-sm font-medium text-gray-700" for="profil-nom">
              Nom <span class="text-red-600" aria-hidden="true">*</span>
            </label>
            <input
              id="profil-nom"
              v-model="nom"
              type="text"
              required
              autocomplete="name"
              class="w-full rounded-lg border border-gray-300 px-4 py-2.5 focus:outline-2 focus:outline-offset-2 focus:outline-primary"
            />
          </div>

          <div>
            <label class="mb-1.5 block text-sm font-medium text-gray-700" for="profil-courriel">
              Adresse électronique
            </label>
            <input
              id="profil-courriel"
              :value="compte.email"
              type="email"
              readonly
              class="w-full cursor-not-allowed rounded-lg border border-gray-200 bg-gray-50 px-4 py-2.5 text-gray-600"
            />
            <!-- La raison est dite, pas seulement la restriction : un champ
                 grise sans explication passe pour une panne. -->
            <p class="mt-1.5 text-xs text-gray-500">
              Le courriel sert à vous connecter. Le changer demande une vérification, et se fait
              donc ailleurs.
            </p>
          </div>

          <dl class="grid gap-4 text-sm sm:grid-cols-2">
            <div>
              <dt class="text-gray-500">Rôle</dt>
              <dd class="font-medium text-gray-800">{{ libelleRole(compte.role) }}</dd>
            </div>
            <div v-if="derniereConnexion">
              <dt class="text-gray-500">Dernière connexion</dt>
              <dd class="font-medium text-gray-800">{{ derniereConnexion }}</dd>
            </div>
          </dl>

          <p v-if="erreurNom" class="text-sm text-red-700" role="alert">{{ erreurNom }}</p>
          <p v-else-if="nomEnregistre" class="text-sm text-emerald-700" role="status">
            Nom enregistré.
          </p>

          <div class="flex justify-end">
            <button
              type="submit"
              :disabled="!nomModifie || enregistrementNom"
              class="rounded-lg bg-primary px-5 py-2.5 font-medium text-white transition-colors hover:bg-primary-dark disabled:opacity-60"
            >
              {{ enregistrementNom ? 'Enregistrement…' : 'Enregistrer' }}
            </button>
          </div>
        </form>
      </section>

      <!-- MOT DE PASSE -->
      <section class="space-y-5 rounded-xl border border-gray-200 bg-white p-6">
        <div>
          <h3 class="font-semibold text-gray-800">Mot de passe</h3>
          <p v-if="dernierChangement" class="text-sm text-gray-600">
            Changé pour la dernière fois le {{ dernierChangement }}.
          </p>
          <p v-else class="text-sm text-gray-600">
            Jamais changé depuis la mise en service de votre compte.
          </p>
        </div>

        <!-- Les deux effets sont annonces AVANT le bouton, pas apres : une
             deconnexion sur un autre appareil et un courriel inattendu
             passeraient sinon pour un incident. -->
        <div class="rounded-lg bg-gray-50 px-4 py-3 text-sm text-gray-700">
          <p class="font-medium">Ce que le changement entraîne</p>
          <ul class="mt-1.5 list-disc space-y-1 pl-5">
            <li>Vos autres appareils seront déconnectés. Celui-ci reste connecté.</li>
            <li>Un courriel de confirmation partira à {{ compte.email }}.</li>
          </ul>
        </div>

        <form class="space-y-5" @submit.prevent="changerLeMotDePasse">
          <div>
            <label class="mb-1.5 block text-sm font-medium text-gray-700" for="mdp-actuel">
              Mot de passe actuel <span class="text-red-600" aria-hidden="true">*</span>
            </label>
            <input
              id="mdp-actuel"
              v-model="motDePasse.actuel"
              type="password"
              required
              autocomplete="current-password"
              class="w-full rounded-lg border border-gray-300 px-4 py-2.5 focus:outline-2 focus:outline-offset-2 focus:outline-primary"
            />
          </div>

          <div class="grid gap-5 sm:grid-cols-2">
            <div>
              <label class="mb-1.5 block text-sm font-medium text-gray-700" for="mdp-nouveau">
                Nouveau mot de passe <span class="text-red-600" aria-hidden="true">*</span>
              </label>
              <input
                id="mdp-nouveau"
                v-model="motDePasse.nouveau"
                type="password"
                required
                autocomplete="new-password"
                class="w-full rounded-lg border border-gray-300 px-4 py-2.5 focus:outline-2 focus:outline-offset-2 focus:outline-primary"
              />
              <p class="mt-1.5 text-xs text-gray-500">
                {{ LONGUEUR_MOT_DE_PASSE }} caractères au minimum.
              </p>
            </div>
            <div>
              <label class="mb-1.5 block text-sm font-medium text-gray-700" for="mdp-confirmation">
                Confirmation <span class="text-red-600" aria-hidden="true">*</span>
              </label>
              <input
                id="mdp-confirmation"
                v-model="motDePasse.confirmation"
                type="password"
                required
                autocomplete="new-password"
                class="w-full rounded-lg border border-gray-300 px-4 py-2.5 focus:outline-2 focus:outline-offset-2 focus:outline-primary"
              />
              <p v-if="confirmationDiverge" class="mt-1.5 text-xs text-red-700">
                Les deux mots de passe ne correspondent pas.
              </p>
            </div>
          </div>

          <p v-if="erreurMdp" class="text-sm text-red-700" role="alert">{{ erreurMdp }}</p>
          <p v-else-if="mdpChange" class="text-sm text-emerald-700" role="status">
            Mot de passe changé. Vos autres appareils ont été déconnectés.
          </p>

          <div class="flex justify-end">
            <button
              type="submit"
              :disabled="!mdpComplet || confirmationDiverge || enregistrementMdp"
              class="rounded-lg bg-primary px-5 py-2.5 font-medium text-white transition-colors hover:bg-primary-dark disabled:opacity-60"
            >
              {{ enregistrementMdp ? 'Changement…' : 'Changer le mot de passe' }}
            </button>
          </div>
        </form>
      </section>
    </div>
  </div>
</template>
