<template>
  <div class="min-h-screen bg-gray-50">
    <p v-if="chargement" class="text-gray-500 py-24 text-center">Chargement des consuls…</p>

    <!-- Discipline de retractation : sans consul servi, la page ne montre
         rien du gabarit. -->
    <div v-else-if="consuls.length === 0" class="max-w-3xl mx-auto px-4 py-24 text-center">
      <h1 class="text-2xl font-bold text-gray-800 mb-3">Rubrique en préparation</h1>
      <p class="text-gray-600 mb-8">La liste des consuls honoraires n'a pas encore été publiée.</p>
      <router-link to="/" class="text-accent font-semibold hover:underline">
        Retour à l'accueil
      </router-link>
    </div>

    <template v-else>
      <!-- Bandeau -->
      <div class="relative bg-gradient-to-r from-accent to-primary-light text-white">
        <div class="absolute inset-0 bg-black/20"></div>
        <div class="relative max-w-7xl mx-auto px-4 py-16 md:py-20">
          <div class="text-center">
            <div
              class="inline-flex items-center gap-2 bg-white/20 backdrop-blur px-4 py-1 rounded-full text-sm mb-4"
            >
              <img
                v-if="drapeau !== ''"
                :src="drapeau"
                :alt="`Drapeau ${articleDuPays(nomOfficiel)} ${nomOfficiel}`"
                class="w-5 h-auto rounded-sm"
              />
              {{ nomDeLAmbassade }}
            </div>
            <h1 class="text-4xl md:text-5xl font-bold mb-4">Consuls Honoraires</h1>
            <p class="text-xl md:text-2xl max-w-3xl mx-auto opacity-90">
              Représentants consulaires au service de nos ressortissants
            </p>
            <div class="flex justify-center gap-4 mt-8">
              <div class="w-16 h-1 bg-accent"></div>
              <div class="w-16 h-1 bg-secondary"></div>
              <div class="w-16 h-1 bg-primary-light"></div>
            </div>
          </div>
        </div>

        <div class="absolute bottom-0 left-0 right-0">
          <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 1440 120" class="w-full h-auto">
            <path
              fill="#f9fafb"
              fill-opacity="1"
              d="M0,64L80,69.3C160,75,320,85,480,80C640,75,800,53,960,48C1120,43,1280,53,1360,58.7L1440,64L1440,120L1360,120C1280,120,1120,120,960,120C800,120,640,120,480,120C320,120,160,120,80,120L0,120Z"
            ></path>
          </svg>
        </div>
      </div>

      <div class="max-w-7xl mx-auto px-4 py-12">
        <!-- Dans l'ordre servi par le CMS : `position` peut porter des trous -->
        <div class="grid grid-cols-1 lg:grid-cols-2 gap-8">
          <div
            v-for="(consul, rang) in consuls"
            :key="consul.id"
            class="bg-white rounded-2xl shadow-xl overflow-hidden hover:shadow-2xl transition-shadow"
          >
            <div class="h-3" :class="bandeauDuRang(rang)"></div>
            <div class="p-8">
              <div class="flex items-start justify-between gap-4 mb-6">
                <div class="flex items-center gap-3 min-w-0">
                  <div class="bg-accent/10 p-3 rounded-full shrink-0">
                    <i class="bx bx-user text-3xl text-accent" aria-hidden="true"></i>
                  </div>
                  <div class="min-w-0">
                    <span class="text-sm text-gray-500">{{ consul.role }}</span>
                    <h3 class="text-2xl font-bold text-gray-800 break-words">{{ consul.name }}</h3>
                  </div>
                </div>
                <div
                  class="text-white px-4 py-2 rounded-full text-sm font-semibold shrink-0"
                  :class="pastilleDuRang(rang)"
                >
                  {{ consul.city }}
                </div>
              </div>

              <div
                v-if="consul.address !== null || consul.phone !== null || consul.email !== null"
                class="bg-gray-50 rounded-xl p-6 space-y-4"
              >
                <div v-if="consul.address !== null" class="flex items-start gap-3">
                  <div class="bg-accent/10 p-2 rounded-lg shrink-0">
                    <i class="bx bx-map text-xl text-accent" aria-hidden="true"></i>
                  </div>
                  <div class="min-w-0">
                    <p class="text-sm text-gray-500">Adresse</p>
                    <!-- L'adresse peut porter des retours a la ligne : au
                         contrat, elle se rend telle qu'elle a ete saisie. -->
                    <p class="font-semibold text-gray-800 whitespace-pre-line break-words">
                      {{ consul.address }}
                    </p>
                  </div>
                </div>

                <div v-if="consul.phone !== null" class="flex items-start gap-3">
                  <div class="bg-primary-light/10 p-2 rounded-lg shrink-0">
                    <i class="bx bx-phone text-xl text-primary-light" aria-hidden="true"></i>
                  </div>
                  <div class="min-w-0">
                    <p class="text-sm text-gray-500">Téléphone</p>
                    <a
                      :href="`tel:${consul.phone}`"
                      class="font-semibold text-primary-light hover:underline text-xl break-all"
                    >
                      {{ consul.phone }}
                    </a>
                  </div>
                </div>

                <div v-if="consul.email !== null" class="flex items-start gap-3">
                  <div class="bg-secondary/10 p-2 rounded-lg shrink-0">
                    <i class="bx bx-envelope text-xl text-secondary" aria-hidden="true"></i>
                  </div>
                  <div class="min-w-0">
                    <p class="text-sm text-gray-500">Courriel</p>
                    <a
                      :href="`mailto:${consul.email}`"
                      class="font-semibold text-primary-light hover:underline break-all"
                    >
                      {{ consul.email }}
                    </a>
                  </div>
                </div>
              </div>

              <div v-if="consul.phone !== null" class="mt-6">
                <a
                  :href="`tel:${consul.phone}`"
                  class="block w-full bg-accent text-white text-center py-3 rounded-xl font-semibold hover:bg-accent-dark transition-colors"
                >
                  Contacter le consul
                </a>
              </div>
            </div>
          </div>
        </div>

        <!-- Coordonnees de l'ambassade, servies par le bootstrap -->
        <div v-if="telephone !== '' || courriel !== ''" class="mt-8 text-center">
          <p class="text-gray-600">
            Vous pouvez également contacter l'ambassade pour toute information complémentaire :
          </p>
          <div class="flex justify-center flex-wrap gap-4 mt-4">
            <a
              v-if="telephone !== ''"
              :href="`tel:${telephone}`"
              class="text-accent font-semibold hover:underline"
            >
              {{ telephone }}
            </a>
            <span v-if="telephone !== '' && courriel !== ''" class="text-gray-300">|</span>
            <a
              v-if="courriel !== ''"
              :href="`mailto:${courriel}`"
              class="text-primary-light font-semibold hover:underline"
            >
              {{ courriel }}
            </a>
          </div>
        </div>
      </div>
    </template>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, onMounted } from 'vue'
import { recupererAnnuaire, ANNUAIRE_VIDE, type Annuaire } from '@/api/annuaire'
import { useIdentite, articleDuPays } from '@/tenant/identite'

/**
 * La page portait en dur les deux consuls honoraires de l'ambassade de Guinee
 * aux Etats-Unis, leurs adresses americaines, leurs numeros, leurs zones de
 * couverture et le telephone de Washington : c'etait l'une des fuites
 * d'identite du gabarit.
 *
 * Tout vient desormais de `GET /api/content/directory` pour les consuls et du
 * bootstrap pour les coordonnees de l'ambassade. Sur un echec, la liste reste
 * vide et la page se retracte.
 *
 * Le texte de presentation consulaire et la note d'information ont ete
 * retires sans remplacement : ils ne relevent d'aucun contrat aujourd'hui.
 */
const annuaire = ref<Annuaire>({ ...ANNUAIRE_VIDE })
const chargement = ref(true)

const { nomOfficiel, nomDeLAmbassade, drapeau, telephone, courriel } = useIdentite()

/** L'ordre servi fait foi : `position` peut porter des trous. */
const consuls = computed(() => annuaire.value.consuls)

const BANDEAUX = [
  'bg-gradient-to-r from-accent to-accent-deep',
  'bg-gradient-to-r from-primary-light to-primary-dark',
] as const
const PASTILLES = ['bg-accent', 'bg-primary-light'] as const
const bandeauDuRang = (rang: number) => BANDEAUX[rang % BANDEAUX.length]
const pastilleDuRang = (rang: number) => PASTILLES[rang % PASTILLES.length]

onMounted(async () => {
  try {
    annuaire.value = await recupererAnnuaire()
  } catch {
    // La liste reste vide : la page affiche « Rubrique en preparation ».
  } finally {
    chargement.value = false
  }
})
</script>

<style scoped>
a[href^='tel'] {
  transition: color 0.2s ease;
}
</style>
