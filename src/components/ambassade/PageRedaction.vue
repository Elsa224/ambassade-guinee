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
        <div class="relative max-w-7xl mx-auto px-4 py-12 md:py-16">
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

      <!-- Le chapeau, et les chiffres a cote de lui plutot qu'en pied de
           page : places apres 8 000 caracteres, personne ne les atteignait.
           Quand le corps s'ouvre directement sur un titre, il n'y a pas de
           chapeau a border : les chiffres passent alors en bande. -->
      <div
        v-if="decoupe.chapeau !== '' || chiffresAffiches"
        class="max-w-7xl mx-auto px-4 pt-10 md:pt-14"
      >
        <div class="grid grid-cols-1 gap-8 items-start" :class="colonnesDuChapeau">
          <div
            v-if="decoupe.chapeau !== ''"
            class="contenu-cms contenu-chapeau text-gray-700"
            :class="chiffresAffiches ? '' : 'max-w-3xl'"
            v-html="decoupe.chapeau"
          ></div>

          <div
            v-if="chiffresAffiches"
            class="bg-white rounded-xl shadow-sm border-t-2 border-secondary"
            :class="
              chiffresEnBande
                ? `grid gap-px bg-gray-100 ${colonnesDesChiffres}`
                : 'divide-y divide-gray-100'
            "
          >
            <div
              v-for="chiffre in contenu.figures"
              :key="chiffre.label"
              class="bg-white px-5 py-4 flex items-baseline gap-4"
            >
              <p class="text-3xl font-bold text-accent tabular-nums leading-none">
                {{ chiffre.value }}
              </p>
              <p class="text-sm text-gray-500 leading-snug">{{ chiffre.label }}</p>
            </div>
          </div>
        </div>
      </div>

      <template v-for="(bloc, rang) in decoupe.blocs" :key="rang">
        <!-- Quatre sections et plus : une grille. Les missions d'une
             ambassade sont paralleles, pas sequentielles — un rouleau dirait
             le contraire de ce que le texte enonce. -->
        <div v-if="bloc.genre === 'grille'" class="max-w-7xl mx-auto px-4 py-10 md:py-12">
          <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
            <article
              v-for="(section, place) in bloc.sections"
              :key="section.titre"
              class="relative bg-white rounded-lg border border-gray-200 p-6 pt-7"
              :class="place === bloc.sections.length - 1 ? ligneDeFin(bloc.sections.length) : ''"
            >
              <span class="absolute top-0 left-0 w-11 h-0.5 bg-primary" aria-hidden="true"></span>
              <p
                v-if="section.numero !== null"
                class="text-xs font-bold tracking-widest text-primary-dark tabular-nums mb-2"
              >
                {{ section.numero.padStart(2, '0') }}
              </p>
              <h2 class="text-lg font-bold text-gray-900 leading-snug mb-3">{{ section.titre }}</h2>
              <div class="contenu-cms contenu-carte text-gray-600" v-html="section.html"></div>
            </article>
          </div>
        </div>

        <!-- Moins de quatre sections : un texte suivi, simplement rythme. Une
             grille de deux cases n'aurait rien a equilibrer. -->
        <div v-else-if="bloc.genre === 'sections'" class="max-w-7xl mx-auto px-4 py-10 md:py-12">
          <div class="max-w-3xl">
            <section v-for="section in bloc.sections" :key="section.titre" class="mb-10 last:mb-0">
              <h2 class="text-2xl font-bold text-primary-dark mb-3">
                <span v-if="section.numero !== null" class="tabular-nums"
                  >{{ section.numero }}.</span
                >
                {{ section.titre }}
              </h2>
              <div class="contenu-cms text-gray-700" v-html="section.html"></div>
            </section>
          </div>
        </div>

        <!-- Une section d'un autre registre que ses voisines : elle se
             detache. Le flanc de la mission rejoint la derniere d'entre
             elles, la ou la page se referme. -->
        <section v-else class="relative text-white bg-primary-dark mt-4">
          <div class="absolute inset-0 bg-black/30"></div>
          <div
            class="relative max-w-7xl mx-auto px-4 py-12 md:py-14 grid grid-cols-1 gap-10 items-start"
            :class="rang === rangDuFlanc ? 'lg:grid-cols-[16rem_minmax(0,1fr)]' : ''"
          >
            <div>
              <h2 class="text-3xl font-bold mb-4">{{ bloc.section.titre }}</h2>
              <div v-if="rang === rangDuFlanc" class="pt-5 mt-5 border-t border-white/20 space-y-5">
                <div v-if="adresse !== ''">
                  <h3 class="text-xs uppercase tracking-wider text-white/60 mb-1">Adresse</h3>
                  <p class="text-white/90 whitespace-pre-line">{{ adresse }}</p>
                </div>
                <div v-if="contenu.jurisdiction.length > 0">
                  <h3 class="text-xs uppercase tracking-wider text-white/60 mb-1">Juridiction</h3>
                  <ul>
                    <li v-for="pays in contenu.jurisdiction" :key="pays" class="text-white">
                      {{ pays }}
                    </li>
                  </ul>
                </div>
                <slot name="flanc"></slot>
              </div>
            </div>
            <div class="contenu-cms contenu-bande" v-html="bloc.section.html"></div>
          </div>
        </section>
      </template>

      <!-- Aucune bande ou se poser : le flanc ferme alors la page seul. -->
      <div v-if="aUnFlanc && rangDuFlanc === null" class="max-w-7xl mx-auto px-4 py-10 md:py-12">
        <div class="bg-white rounded-xl shadow-sm p-6 md:p-8 grid grid-cols-1 sm:grid-cols-2 gap-8">
          <div v-if="adresse !== ''">
            <h2 class="text-xs uppercase tracking-wider text-gray-500 mb-2">Adresse</h2>
            <p class="text-gray-700 whitespace-pre-line">{{ adresse }}</p>
          </div>
          <div v-if="contenu.jurisdiction.length > 0">
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
 * La mise en page se DEDUIT du texte : voir `@/contenu/decoupage`. Rien n'est
 * demande au serveur pour cela — le contrat est inchange.
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
import { decouperContenu, CONTENU_VIDE } from '@/contenu/decoupage'
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
    /**
     * Cette page montre l'adresse de la mission et sa juridiction.
     *
     * Elles ferment la page plutot que de border le texte : un flanc colle au
     * chapeau depasse sous lui des que la mission a saisi trois chiffres, et
     * laisse un vide inexplique au bas de la colonne de lecture.
     */
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

const decoupe = computed(() =>
  page.value === null ? CONTENU_VIDE : decouperContenu(page.value.body_html),
)

/**
 * Les chiffres ne s'affichent que si l'ambassade en a saisi : un bandeau a
 * cases vides se lit comme une donnee manquante alors que la mission a
 * simplement saisi ce qu'elle savait.
 */
const chiffresAffiches = computed(() => props.chiffresVisibles && contenu.value.figures.length > 0)

/**
 * Sans chapeau a border, les chiffres ne sont plus une colonne mais une bande.
 *
 * Le cas se produit des qu'un corps s'ouvre directement sur un titre de
 * section : garder la colonne laisserait les chiffres seuls dans une gouttiere
 * de vingt rem, en face de rien.
 */
const chiffresEnBande = computed(() => chiffresAffiches.value && decoupe.value.chapeau === '')

const colonnesDuChapeau = computed(() =>
  chiffresAffiches.value && decoupe.value.chapeau !== ''
    ? 'lg:grid-cols-[minmax(0,1fr)_20rem]'
    : '',
)

/**
 * En bande, le nombre de colonnes suit le nombre de chiffres saisis.
 *
 * Quatre cases pour trois chiffres laisseraient une case vide en bout de
 * ligne, ce qui se lit comme une donnee manquante.
 */
const colonnesDesChiffres = computed(() => {
  const nombre = Math.min(contenu.value.figures.length, 4)
  return ['', 'grid-cols-1', 'sm:grid-cols-2', 'sm:grid-cols-3', 'sm:grid-cols-2 lg:grid-cols-4'][
    nombre
  ]
})

/**
 * La derniere carte occupe toute sa ligne quand elle y serait seule.
 *
 * Sept sections sur trois colonnes laissent une carte isolee devant deux
 * cases vides, ce qui se lit comme une section manquante. Le nombre de
 * colonnes n'etant pas le meme selon la largeur, la condition est verifiee
 * pour chacune : sept est orphelin sur deux colonnes comme sur trois, neuf ne
 * l'est que sur deux.
 */
function ligneDeFin(nombre: number): string {
  return [nombre % 2 === 1 ? 'md:col-span-2' : '', nombre % 3 === 1 ? 'lg:col-span-3' : '']
    .filter((classe) => classe !== '')
    .join(' ')
}

/** Le flanc disparait entierement quand il n'aurait rien a montrer. */
const aUnFlanc = computed(
  () => props.flanc && (adresse.value !== '' || contenu.value.jurisdiction.length > 0),
)

/**
 * La bande qui ferme la page, quand il y en a une.
 *
 * Le flanc s'y range : sur la presentation du Gabon, c'est « Le Gabon » qui
 * conclut, et l'adresse comme la juridiction y trouvent leur place naturelle
 * plutot que dans un bloc de plus.
 */
const rangDuFlanc = computed<number | null>(() => {
  if (!aUnFlanc.value) return null
  const dernier = decoupe.value.blocs.length - 1
  return decoupe.value.blocs[dernier]?.genre === 'bande' ? dernier : null
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
