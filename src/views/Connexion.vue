<template>
  <div class="min-h-screen flex flex-col md:flex-row">
    <!-- Formulaire -->
    <div class="flex w-full md:w-1/2 items-center justify-center bg-white order-2 md:order-1">
      <div class="p-8 w-full max-w-md">
        <div class="mb-6">
          <router-link
            to="/"
            class="inline-flex items-center gap-2 text-ink hover:text-primary transition-colors"
          >
            <i class="bx bx-arrow-back text-lg"></i>
            <span class="text-sm font-medium">Retour à l'accueil</span>
          </router-link>
        </div>

        <div class="flex flex-col items-center mb-8">
          <img v-if="logo" :src="logo" :alt="`Armoiries de ${nomCourt}`" class="w-40 h-auto mb-4" />
          <h1 class="text-2xl font-bold text-primary text-center">Espace administration</h1>
          <p class="text-sm text-gray-600 mt-1 text-center">
            Connectez-vous pour gérer le contenu du site.
          </p>
        </div>

        <form class="space-y-5" @submit.prevent="soumettre">
          <div
            v-if="auth.erreur"
            role="alert"
            class="rounded-lg border border-accent bg-accent/10 px-4 py-3 text-sm text-accent-dark"
          >
            {{ auth.erreur }}
          </div>

          <div>
            <label for="email" class="block text-sm font-medium text-gray-700 mb-1">
              Adresse électronique
            </label>
            <input
              id="email"
              v-model="email"
              type="email"
              autocomplete="username"
              required
              class="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary focus:border-primary focus:outline-none"
            />
          </div>

          <div>
            <label for="mot-de-passe" class="block text-sm font-medium text-gray-700 mb-1">
              Mot de passe
            </label>
            <div class="relative">
              <input
                id="mot-de-passe"
                v-model="password"
                :type="motDePasseVisible ? 'text' : 'password'"
                autocomplete="current-password"
                required
                class="w-full px-4 py-2 pr-10 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary focus:border-primary focus:outline-none"
              />
              <button
                type="button"
                :aria-label="motDePasseVisible ? 'Masquer le mot de passe' : 'Afficher le mot de passe'"
                class="absolute inset-y-0 right-0 flex items-center pr-3 text-gray-500 hover:text-primary"
                @click="motDePasseVisible = !motDePasseVisible"
              >
                <i :class="motDePasseVisible ? 'bx bx-hide' : 'bx bx-show'" class="text-lg"></i>
              </button>
            </div>
          </div>

          <button
            type="submit"
            :disabled="auth.chargement"
            class="w-full bg-primary hover:bg-primary-dark disabled:opacity-60 disabled:cursor-not-allowed text-white py-2.5 rounded-full font-semibold transition-colors"
          >
            {{ auth.chargement ? 'Connexion en cours...' : 'Se connecter' }}
          </button>
        </form>

        <p class="text-center text-gray-500 text-xs mt-8 leading-relaxed">
          Accès réservé aux personnels habilités de l'ambassade.
        </p>
      </div>
    </div>

    <!-- Illustration -->
    <div class="hidden md:flex md:w-1/2 relative overflow-hidden order-1 md:order-2 bg-primary/10">
      <img :src="illustration" alt="" aria-hidden="true" class="w-full h-full object-cover" />
      <div class="absolute inset-0 bg-primary/30"></div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, computed } from 'vue'
import { useRouter, useRoute } from 'vue-router'
import { useAuthStore } from '@/stores/auth'
import { useTenantStore } from '@/stores/tenant'
import illustration from '@/assets/images/hero3.jpg'
import logoParDefaut from '@/assets/images/logo.png'

const router = useRouter()
const route = useRoute()
const auth = useAuthStore()
const tenant = useTenantStore()

const email = ref('')
const password = ref('')
const motDePasseVisible = ref(false)

// Le logo vient du tenant ; l'image compilée sert de repli si le bootstrap a échoué.
const logo = computed(() => tenant.embassy?.logo_image || logoParDefaut)
const nomCourt = computed(() => tenant.nomCourt || "l'ambassade")

/**
 * `redirect` vient de l'URL. Il n'est pas exploitable via `router.push` (qui
 * ne résout que des routes internes), mais on valide quand même : seul un
 * chemin commençant par un seul `/` est accepté, jamais une URL absolue
 * déguisée en `//hôte/...`.
 */
function destinationSure(valeur: unknown): string {
  if (typeof valeur === 'string' && valeur.startsWith('/') && !valeur.startsWith('//')) {
    return valeur
  }
  return '/dashboard'
}

async function soumettre(): Promise<void> {
  const reussi = await auth.login(email.value, password.value)
  if (!reussi) return

  await router.push(destinationSure(route.query.redirect))
}
</script>
