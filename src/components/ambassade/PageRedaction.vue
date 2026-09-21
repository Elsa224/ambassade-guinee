<template>
  <div class="min-h-screen bg-gray-50">
    <p v-if="chargement" class="text-gray-500 py-24 text-center">Chargement…</p>

    <!-- Discipline de retractation : tant que le CMS ne sert pas cette page,
         on n'affiche rien du gabarit. L'adresse reste atteignable a la main,
         on explique donc plutot que de montrer une page vide. -->
    <div v-else-if="page === null" class="max-w-3xl mx-auto px-4 py-24 text-center">
      <h1 class="text-2xl font-bold text-gray-800 mb-3">Rubrique en préparation</h1>
      <p class="text-gray-600 mb-8">Cette page n'a pas encore été publiée.</p>
      <router-link to="/" class="text-accent font-semibold hover:underline">
        Retour à l'accueil
      </router-link>
    </div>

    <template v-else>
      <div class="relative text-white" :class="degrade">
        <img
          v-if="page.hero_image_url !== null"
          :src="page.hero_image_url"
          alt=""
          class="absolute inset-0 w-full h-full object-cover"
        />
        <div class="absolute inset-0 bg-black/40"></div>
        <div class="relative max-w-7xl mx-auto px-4 py-16 md:py-20">
          <div
            class="inline-flex items-center gap-2 bg-white/20 backdrop-blur px-4 py-1 rounded-full text-sm mb-4"
          >
            <img
              v-if="drapeau !== ''"
              :src="drapeau"
              alt=""
              class="h-4 w-6 object-cover rounded-sm"
            />
            {{ macaron }}
          </div>
          <h1 class="text-4xl md:text-5xl font-bold mb-4 max-w-4xl">{{ page.title }}</h1>
          <p v-if="page.subtitle !== null" class="text-lg text-white/90 max-w-3xl">
            {{ page.subtitle }}
          </p>
        </div>
      </div>

      <!-- Avertissement porte par le CADRE et non par le texte : la page
           d'ambition numerique annonce des services qui n'existent pas
           encore, et le texte officiel n'est pas reecrit pour autant. -->
      <div v-if="avertissement !== ''" class="bg-secondary/10 border-b border-secondary/30">
        <p class="max-w-7xl mx-auto px-4 py-3 text-sm text-gray-700 flex items-start gap-2">
          <i class="bx bx-info-circle text-secondary text-lg shrink-0" aria-hidden="true"></i>
          <span>{{ avertissement }}</span>
        </p>
      </div>

      <div class="max-w-7xl mx-auto px-4 py-12 md:py-16">
        <!-- Une seule colonne quand il n'y a pas de flanc : garder la
             gouttiere reservee laisserait le texte s'arreter au milieu de
             l'ecran devant un vide inexplique. -->
        <div
          class="grid grid-cols-1 gap-10 items-start"
          :class="aUnFlanc ? 'lg:grid-cols-[minmax(0,1fr)_18rem]' : ''"
        >
          <div
            v-if="page.body_html"
            class="bg-white rounded-2xl shadow-sm p-6 md:p-10 contenu-cms text-gray-700"
            v-html="page.body_html"
          ></div>
          <div v-else></div>

          <aside v-if="aUnFlanc" class="space-y-5 lg:sticky lg:top-24">
            <div v-if="adresse !== ''" class="bg-white rounded-xl shadow-sm p-5">
              <h2 class="text-xs uppercase tracking-wider text-gray-500 mb-2">Adresse</h2>
              <p class="text-gray-700 whitespace-pre-line">{{ adresse }}</p>
            </div>

            <div v-if="contenu.jurisdiction.length > 0" class="bg-white rounded-xl shadow-sm p-5">
              <h2 class="text-xs uppercase tracking-wider text-gray-500 mb-2">Juridiction</h2>
              <ul class="space-y-1.5">
                <li
                  v-for="pays in contenu.jurisdiction"
                  :key="pays"
                  class="flex items-baseline gap-2 text-gray-700"
                >
                  <span class="w-1.5 h-1.5 rounded-full bg-primary-light shrink-0"></span>
                  {{ pays }}
                </li>
              </ul>
            </div>

            <slot name="flanc"></slot>
          </aside>
        </div>

        <!-- Les chiffres ne s'affichent que si l'ambassade en a saisi : un
             bandeau a cases vides vaut moins que pas de bandeau du tout. -->
        <div
          v-if="chiffresVisibles && contenu.figures.length > 0"
          class="mt-12 grid gap-px bg-gray-200 border border-gray-200 rounded-2xl overflow-hidden"
          :class="colonnesDesChiffres"
        >
          <div v-for="chiffre in contenu.figures" :key="chiffre.label" class="bg-white p-6">
            <p class="text-3xl md:text-4xl font-bold text-accent tabular-nums mb-1">
              {{ chiffre.value }}
            </p>
            <p class="text-sm text-gray-500">{{ chiffre.label }}</p>
          </div>
        </div>
      </div>
    </template>
  </div>
</template>

<script setup lang="ts">
/**
 * Une page redactionnelle servie par le CMS.
 *
 * Les trois pages qu'elle remplace portaient leur texte ecrit en dur, celui
 * de l'ambassade de Guinee aux Etats-Unis. Le corps est un `body_html` libre
 * et assaini par le serveur : la fiche gabonaise decrit ses missions en neuf
 * sections, la maquette d'origine en imposait quatre, et un schema rigide
 * aurait force chaque ambassade a retrancher son texte.
 *
 * Le contrat est `docs/contrat-contenu-redactionnel.md`.
 */
import { ref, computed, onMounted } from 'vue'
import {
  recupererPages,
  pageParSlug,
  PAGES_VIDES,
  type ContenuDesPages,
  type SlugDePage,
} from '@/api/pages'
import { useIdentite } from '@/tenant/identite'

const props = withDefaults(
  defineProps<{
    slug: SlugDePage
    /** Le texte de la pastille du bandeau. */
    macaron: string
    /** Degrade du bandeau, pour distinguer les rubriques entre elles. */
    degrade?: string
    /** Phrase affichee sous le bandeau, quand la page doit se situer. */
    avertissement?: string
    /** La juridiction et l'adresse ne concernent pas toutes les pages. */
    flanc?: boolean
    chiffresVisibles?: boolean
  }>(),
  {
    degrade: 'bg-gradient-to-r from-accent to-primary-light',
    avertissement: '',
    flanc: false,
    chiffresVisibles: false,
  },
)

const contenu = ref<ContenuDesPages>({ ...PAGES_VIDES })
const chargement = ref(true)

const { drapeau, adresse } = useIdentite()

const page = computed(() => pageParSlug(contenu.value, props.slug))

/** Le flanc disparait entierement quand il n'aurait rien a montrer. */
const aUnFlanc = computed(
  () => props.flanc && (adresse.value !== '' || contenu.value.jurisdiction.length > 0),
)

/**
 * Le nombre de colonnes suit le nombre de chiffres saisis.
 *
 * Quatre cases pour trois chiffres laisseraient une case vide en bout de
 * ligne, ce qui se lit comme une donnee manquante alors que l'ambassade a
 * simplement saisi ce qu'elle savait.
 */
const colonnesDesChiffres = computed(() => {
  const nombre = Math.min(contenu.value.figures.length, 4)
  return [
    '',
    'grid-cols-1',
    'grid-cols-2',
    'grid-cols-2 md:grid-cols-3',
    'grid-cols-2 md:grid-cols-4',
  ][nombre]
})

onMounted(async () => {
  try {
    contenu.value = await recupererPages()
  } catch {
    // Sur un echec, la page se retracte : elle ne se rabat jamais sur le
    // contenu d'une autre ambassade.
    contenu.value = { ...PAGES_VIDES }
  }
  chargement.value = false
})
</script>
