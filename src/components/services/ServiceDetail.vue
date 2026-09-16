<template>
  <div class="min-h-screen bg-gray-50">
    <p v-if="chargement" class="text-gray-500 py-24 text-center">Chargement du service…</p>

    <!-- Un slug inconnu n'est pas une erreur : c'est un lien perime, ou un
         service que l'ambassade a retire. On le dit, et on renvoie vers la
         liste plutot que vers une page blanche. -->
    <div v-else-if="service === null" class="max-w-3xl mx-auto px-4 py-24 text-center">
      <h1 class="text-2xl font-bold text-gray-800 mb-3">Service introuvable</h1>
      <p class="text-gray-600 mb-8">Ce service n'est pas proposé, ou ne l'est plus.</p>
      <router-link to="/services" class="text-accent font-semibold hover:underline">
        Voir tous nos services
      </router-link>
    </div>

    <template v-else>
      <div class="bg-gradient-to-r from-primary to-primary-dark text-white">
        <div class="max-w-4xl mx-auto px-4 py-12 md:py-16">
          <router-link
            to="/services"
            class="inline-flex items-center gap-2 text-sm opacity-80 hover:opacity-100 mb-6"
          >
            <i class="bx bx-chevron-left" aria-hidden="true"></i>
            Nos services
          </router-link>

          <div class="flex items-start gap-5">
            <div
              class="w-16 h-16 rounded-2xl bg-white/15 flex items-center justify-center flex-shrink-0"
            >
              <IconeService :icone="service.icon" class="text-white" />
            </div>
            <div>
              <h1 class="text-3xl md:text-4xl font-bold mb-3">{{ service.title }}</h1>
              <p v-if="service.summary" class="text-lg opacity-90 max-w-2xl">
                {{ service.summary }}
              </p>
            </div>
          </div>
        </div>
      </div>

      <div class="max-w-4xl mx-auto px-4 py-12">
        <!-- Le bandeau ne parait que s'il y a de quoi le remplir : une
             ambassade qui ne publie ni delai ni tarif ne montre pas deux
             cases vides. -->
        <dl
          v-if="service.delay || service.fee"
          class="grid gap-4 sm:grid-cols-2 mb-10"
          :class="service.delay && service.fee ? '' : 'sm:max-w-sm'"
        >
          <div v-if="service.delay" class="bg-white rounded-xl p-5 border-l-4 border-primary">
            <dt class="text-xs uppercase tracking-wider text-gray-500 mb-1">Délai</dt>
            <dd class="text-lg font-semibold text-gray-800">{{ service.delay }}</dd>
          </div>
          <div v-if="service.fee" class="bg-white rounded-xl p-5 border-l-4 border-secondary">
            <dt class="text-xs uppercase tracking-wider text-gray-500 mb-1">Tarif</dt>
            <dd class="text-lg font-semibold text-gray-800">{{ service.fee }}</dd>
          </div>
        </dl>

        <!-- Le corps est assaini par le serveur : le contrat l'exige, le
             front ne peut pas etre la derniere defense. -->
        <div
          v-if="service.body_html"
          class="bg-white rounded-2xl shadow-sm p-8 md:p-10 contenu-cms text-gray-700"
          v-html="service.body_html"
        ></div>

        <BandeauPlateforme :plateforme="contenu.platform" class="mt-12" />

        <!-- Les autres services restent a portee : le visiteur qui s'est
             trompe de carte n'a pas a revenir en arriere deux fois. -->
        <nav v-if="autresServices.length" class="mt-12">
          <h2 class="text-sm uppercase tracking-wider text-gray-500 mb-4">Autres services</h2>
          <div class="flex flex-wrap gap-3">
            <router-link
              v-for="autre in autresServices"
              :key="autre.id"
              :to="`/services/${autre.slug}`"
              class="inline-flex items-center gap-2 bg-white border border-gray-200 rounded-full px-4 py-2 text-sm text-gray-700 hover:border-primary hover:text-primary transition-colors"
            >
              {{ autre.title }}
            </router-link>
          </div>
        </nav>
      </div>
    </template>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, onMounted } from 'vue'
import {
  recupererServices,
  serviceParSlug,
  SERVICES_VIDES,
  type ContenuServices,
} from '@/api/services'
import BandeauPlateforme from './BandeauPlateforme.vue'
import IconeService from './IconeService.vue'

/**
 * Le detail d'un service, designe par son slug dans l'URL.
 *
 * Tout vient du meme appel que la grille : le contrat ne sert pas les
 * services un par un, et une page de detail qui rechargerait la liste
 * entiere le fait de toute facon pour afficher ses voisins en pied.
 */
const proprietes = defineProps<{ slug: string }>()

const contenu = ref<ContenuServices>({ ...SERVICES_VIDES })
const chargement = ref(true)

const service = computed(() => serviceParSlug(contenu.value, proprietes.slug))

const autresServices = computed(() =>
  contenu.value.services.filter((autre) => autre.slug !== proprietes.slug),
)

onMounted(async () => {
  try {
    contenu.value = await recupererServices()
  } catch {
    // Le contenu reste vide, donc la page annonce un service introuvable.
    // C'est le bon message : le gabarit n'a rien a se mettre sous la dent, et
    // son repli n'est jamais le contenu d'une autre ambassade.
  }
  chargement.value = false
})
</script>
