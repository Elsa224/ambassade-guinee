<template>
  <div class="min-h-screen flex flex-col md:flex-row">
    <div class="flex w-full md:w-1/2 items-center justify-center bg-white order-2 md:order-1">
      <div class="p-8 w-full max-w-md">
        <div class="flex flex-col items-center mb-8">
          <img v-if="logo" :src="logo" :alt="`Armoiries de ${nomCourt}`" class="w-40 h-auto mb-4" />
          <h1 class="text-2xl font-bold text-primary text-center">Activer votre accès</h1>
          <p class="text-sm text-gray-600 mt-1 text-center">
            Espace d'administration du site de {{ nomCourt }}.
          </p>
        </div>

        <p v-if="chargement" class="text-center text-gray-500 py-10">Vérification du lien…</p>

        <!-- Un lien qui ne vaut plus ne propose pas de formulaire : un
             formulaire qu'on remplit avant d'apprendre que rien ne sera
             enregistre est pire qu'un refus annonce d'emblee. -->
        <div
          v-else-if="lienInvalide"
          class="rounded-lg border border-accent bg-accent/10 px-4 py-4 text-sm text-accent-dark"
          role="alert"
        >
          <p>{{ lienInvalide }}</p>
          <router-link to="/connexion" class="mt-3 inline-block font-semibold underline">
            Aller à la page de connexion
          </router-link>
        </div>

        <form v-else class="space-y-5" @submit.prevent="soumettre">
          <p class="rounded-lg bg-gray-50 px-4 py-3 text-sm text-gray-700">
            Bonjour <span class="font-semibold">{{ invitee?.name }}</span
            >. Choisissez votre mot de passe pour activer le compte
            <span class="font-medium">{{ invitee?.email }}</span
            >.
          </p>

          <div
            v-if="erreur"
            role="alert"
            class="rounded-lg border border-accent bg-accent/10 px-4 py-3 text-sm text-accent-dark"
          >
            {{ erreur }}
          </div>

          <div>
            <label for="mot-de-passe" class="block text-sm font-medium text-gray-700 mb-1">
              Mot de passe
            </label>
            <input
              id="mot-de-passe"
              v-model="password"
              type="password"
              autocomplete="new-password"
              required
              class="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary focus:border-primary focus:outline-none"
            />
            <p class="mt-1.5 text-xs text-gray-500">
              Au moins {{ LONGUEUR_MOT_DE_PASSE }} caractères.
            </p>
          </div>

          <div>
            <label for="confirmation" class="block text-sm font-medium text-gray-700 mb-1">
              Confirmer le mot de passe
            </label>
            <input
              id="confirmation"
              v-model="confirmation"
              type="password"
              autocomplete="new-password"
              required
              class="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary focus:border-primary focus:outline-none"
            />
            <p v-if="confirmationDiverge" class="mt-1.5 text-xs text-red-700">
              Les deux mots de passe ne correspondent pas.
            </p>
          </div>

          <button
            type="submit"
            :disabled="envoi"
            class="w-full bg-primary hover:bg-primary-dark disabled:opacity-60 disabled:cursor-not-allowed text-white py-2.5 rounded-full font-semibold transition-colors"
          >
            {{ envoi ? 'Activation en cours…' : 'Activer mon accès' }}
          </button>
        </form>

        <p class="text-center text-gray-500 text-xs mt-8 leading-relaxed">
          Accès réservé aux personnels habilités de l'ambassade.
        </p>
      </div>
    </div>

    <div
      class="hidden md:flex md:w-1/2 relative overflow-hidden order-1 md:order-2 bg-gradient-to-br from-primary to-primary-dark"
    >
      <img
        v-if="drapeau"
        :src="drapeau"
        alt=""
        aria-hidden="true"
        class="w-full h-full object-cover"
      />
      <div class="absolute inset-0 bg-primary/30"></div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { computed, onMounted, ref } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { useAuthStore } from '@/stores/auth'
import { useTenantStore } from '@/stores/tenant'
import { LONGUEUR_MOT_DE_PASSE } from '@/api/compte'
import {
  accepterInvitation,
  messageErreurInvitation,
  recupererInvitation,
  type Invitee,
} from '@/api/invitation'

/**
 * La page qu'ouvre le lien d'invitation.
 *
 * Elle est **publique** : c'est precisement le moment ou la personne n'a pas
 * encore de compte utilisable. Son chemin est impose par le back, qui batit
 * l'URL du courriel sur `INVITATION_PATH` (`/invitation/{token}`) et sur le
 * domaine de l'ambassade du compte invite — jamais sur l'en-tete `Host` de la
 * requete. Ce chemin doit donc correspondre exactement, comme celui du QR
 * d'inscription aux evenements : sans cette page, creer un compte n'aboutit a
 * rien, chaque invitation menant a une adresse introuvable.
 */

const route = useRoute()
const router = useRouter()
const auth = useAuthStore()
const tenant = useTenantStore()

const jeton = String(route.params.token ?? '')

const invitee = ref<Invitee | null>(null)
const chargement = ref(true)
const lienInvalide = ref<string | null>(null)
const erreur = ref<string | null>(null)
const password = ref('')
const confirmation = ref('')
const envoi = ref(false)

const logo = computed(() => tenant.embassy?.logo_image ?? '')
const drapeau = computed(() => tenant.embassy?.flag_image ?? '')
const nomCourt = computed(() => tenant.nomCourt || "l'ambassade")

/**
 * La seule verification posee ici, et c'est la meme que sur l'ecran de profil :
 * elle evite un aller-retour evident. La longueur, elle, appartient au serveur
 * — l'ecran l'affiche, il ne la fait pas respecter.
 */
const confirmationDiverge = computed(
  () => confirmation.value !== '' && confirmation.value !== password.value,
)

async function soumettre(): Promise<void> {
  erreur.value = null
  if (confirmationDiverge.value) return

  envoi.value = true
  try {
    const session = await accepterInvitation(jeton, {
      password: password.value,
      password_confirmation: confirmation.value,
    })
    // La session s'ouvre sur place : redemander de se connecter juste apres
    // avoir choisi son mot de passe n'ajouterait qu'une occasion de se
    // tromper.
    auth.ouvrirSession(session.token, session.user)
    await router.push('/dashboard')
  } catch (souleve) {
    erreur.value = messageErreurInvitation(souleve)
  } finally {
    envoi.value = false
  }
}

onMounted(async () => {
  try {
    invitee.value = await recupererInvitation(jeton)
  } catch (souleve) {
    lienInvalide.value = messageErreurInvitation(souleve)
  } finally {
    chargement.value = false
  }
})
</script>
