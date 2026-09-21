<template>
  <div class="max-w-4xl">
    <header class="mb-8">
      <h1 class="text-2xl font-bold text-gray-800 mb-1">Pages de l'ambassade</h1>
      <p class="text-gray-600">
        Le texte des pages « Présentation », « La Chancellerie », « Relations bilatérales » et «
        Notre ambition numérique ». Une page non publiée n'apparaît pas sur le site.
      </p>
    </header>

    <p v-if="chargement" class="text-gray-500 py-12 text-center">Chargement…</p>

    <template v-else>
      <p v-if="succes" class="mb-6 text-sm text-primary-dark bg-primary/10 rounded-lg px-4 py-3">
        {{ succes }}
      </p>
      <p
        v-if="erreur"
        class="mb-6 text-sm text-red-700 bg-red-50 rounded-lg px-4 py-3"
        role="alert"
      >
        {{ erreur }}
      </p>

      <section class="space-y-4 mb-12">
        <article
          v-for="descripteur in PAGES_DU_GABARIT"
          :key="descripteur.slug"
          class="bg-white rounded-xl shadow-sm border border-gray-100 p-5"
        >
          <div class="flex items-start justify-between gap-4 mb-2">
            <div class="min-w-0">
              <h2 class="font-semibold text-gray-800">{{ descripteur.libelle }}</h2>
              <p class="text-sm text-gray-500 truncate">{{ descripteur.chemin }}</p>
            </div>
            <EtatSection :rempli="estVisible(descripteur.slug)" />
          </div>
          <p class="text-sm text-gray-600 mb-4">{{ descripteur.aide }}</p>
          <button
            type="button"
            class="text-sm font-semibold text-primary-dark hover:underline"
            @click="ouvrir(descripteur.slug)"
          >
            {{ pageDe(descripteur.slug) === null ? 'Rédiger cette page' : 'Modifier' }}
          </button>
        </article>
      </section>

      <!-- Juridiction et chiffres sont globaux a l'ambassade et non attaches a
           une page : la juridiction s'affiche a la fois sur « Présentation » et
           sur « La Chancellerie », et la saisir deux fois garantirait qu'elle
           diverge. -->
      <section class="bg-white rounded-xl shadow-sm border border-gray-100 p-5 mb-6">
        <h2 class="font-semibold text-gray-800 mb-1">Juridiction</h2>
        <p class="text-sm text-gray-600 mb-4">
          Les pays couverts par la mission. Ils s'affichent sur « Présentation » et sur « La
          Chancellerie ».
        </p>

        <div v-for="(pays, rang) in juridiction" :key="rang" class="flex gap-2 mb-2">
          <input
            v-model.trim="juridiction[rang]"
            type="text"
            :maxlength="LONGUEUR_PAYS_MAX"
            :aria-label="`Pays ${rang + 1}`"
            class="flex-1 border border-gray-300 rounded-lg px-4 py-2.5 focus:outline-none focus:ring-2 focus:ring-primary/40 focus:border-primary"
          />
          <button
            type="button"
            class="px-3 text-gray-500 hover:text-red-600"
            :aria-label="`Retirer le pays ${rang + 1}`"
            @click="juridiction.splice(rang, 1)"
          >
            <i class="bx bx-trash text-xl" aria-hidden="true"></i>
          </button>
        </div>

        <button
          type="button"
          class="text-sm font-semibold text-primary-dark hover:underline"
          @click="juridiction.push('')"
        >
          Ajouter un pays
        </button>
      </section>

      <section class="bg-white rounded-xl shadow-sm border border-gray-100 p-5 mb-6">
        <h2 class="font-semibold text-gray-800 mb-1">Chiffres marquants</h2>
        <p class="text-sm text-gray-600 mb-4">
          Affichés en bas de la page « Présentation ». N'en saisissez que ce que vous savez&nbsp;:
          le site affiche exactement le nombre de chiffres saisis, sans case de complément.
        </p>

        <div v-for="(chiffre, rang) in chiffres" :key="rang" class="flex gap-2 mb-2">
          <input
            v-model.trim="chiffre.value"
            type="text"
            :maxlength="LONGUEUR_VALEUR_MAX"
            placeholder="2026"
            :aria-label="`Valeur du chiffre ${rang + 1}`"
            class="w-28 border border-gray-300 rounded-lg px-3 py-2.5 focus:outline-none focus:ring-2 focus:ring-primary/40 focus:border-primary"
          />
          <input
            v-model.trim="chiffre.label"
            type="text"
            :maxlength="LONGUEUR_LIBELLE_MAX"
            placeholder="Année d'ouverture de la mission"
            :aria-label="`Libellé du chiffre ${rang + 1}`"
            class="flex-1 border border-gray-300 rounded-lg px-4 py-2.5 focus:outline-none focus:ring-2 focus:ring-primary/40 focus:border-primary"
          />
          <button
            type="button"
            class="px-3 text-gray-500 hover:text-red-600"
            :aria-label="`Retirer le chiffre ${rang + 1}`"
            @click="chiffres.splice(rang, 1)"
          >
            <i class="bx bx-trash text-xl" aria-hidden="true"></i>
          </button>
        </div>

        <button
          v-if="chiffres.length < CHIFFRES_MAX"
          type="button"
          class="text-sm font-semibold text-primary-dark hover:underline"
          @click="chiffres.push({ value: '', label: '' })"
        >
          Ajouter un chiffre
        </button>
      </section>

      <button
        type="button"
        class="bg-primary text-white font-semibold rounded-lg px-6 py-2.5 hover:bg-primary/90 disabled:opacity-60"
        :disabled="enregistrement"
        @click="enregistrerParametres"
      >
        {{ enregistrement ? 'Enregistrement…' : 'Enregistrer juridiction et chiffres' }}
      </button>
    </template>

    <Boite v-if="slugOuvert !== null" :titre="libelleDe(slugOuvert)" @fermer="slugOuvert = null">
      <form class="space-y-5" @submit.prevent="enregistrer">
        <div>
          <label for="titre-page" class="block text-sm font-medium text-gray-700 mb-1.5">
            Titre <span class="text-red-600" aria-hidden="true">*</span>
          </label>
          <input
            id="titre-page"
            v-model.trim="saisie.title"
            type="text"
            :maxlength="LONGUEUR_TITRE_MAX"
            class="w-full border border-gray-300 rounded-lg px-4 py-2.5 focus:outline-none focus:ring-2 focus:ring-primary/40 focus:border-primary"
          />
          <p v-if="erreursDeChamp.title" class="text-sm text-red-700 mt-1.5" role="alert">
            {{ erreursDeChamp.title }}
          </p>
        </div>

        <div>
          <label for="sous-titre-page" class="block text-sm font-medium text-gray-700 mb-1.5">
            Sous-titre <span class="text-gray-400 font-normal">(facultatif)</span>
          </label>
          <input
            id="sous-titre-page"
            v-model.trim="saisie.subtitle"
            type="text"
            :maxlength="LONGUEUR_SOUS_TITRE_MAX"
            class="w-full border border-gray-300 rounded-lg px-4 py-2.5 focus:outline-none focus:ring-2 focus:ring-primary/40 focus:border-primary"
          />
        </div>

        <ChampImage v-model="saisie.hero_image_url" libelle="Image du bandeau" />

        <div>
          <label for="corps-page" class="block text-sm font-medium text-gray-700 mb-1.5">
            Texte de la page
          </label>
          <textarea
            id="corps-page"
            v-model="saisie.body_html"
            rows="14"
            class="w-full border border-gray-300 rounded-lg px-4 py-2.5 font-mono text-sm focus:outline-none focus:ring-2 focus:ring-primary/40 focus:border-primary"
          ></textarea>
          <!-- L'avertissement n'est pas decoratif : le texte officiel arrive
               d'un traitement de texte, et l'assainissement du serveur retire
               les images en ligne et la mise en forme d'origine. Mieux vaut le
               savoir avant la saisie qu'apres. -->
          <p class="text-xs text-gray-500 mt-1.5">
            Titres, listes, liens, gras et tableaux sont conservés. Les images collées dans le texte
            et la mise en forme d'un traitement de texte ne le sont pas&nbsp;: ajoutez les images
            par le bandeau.
          </p>
          <p v-if="erreursDeChamp.body_html" class="text-sm text-red-700 mt-1.5" role="alert">
            {{ erreursDeChamp.body_html }}
          </p>
        </div>

        <label class="flex items-start gap-3">
          <input v-model="saisie.published" type="checkbox" class="mt-1" />
          <span class="text-sm text-gray-700">
            Publier cette page
            <span class="block text-gray-500">
              Tant qu'elle n'est pas publiée, les visiteurs voient « Rubrique en préparation ».
            </span>
          </span>
        </label>

        <p v-if="erreurBoite" class="text-sm text-red-700" role="alert">{{ erreurBoite }}</p>

        <div class="flex justify-end gap-3 pt-2">
          <button
            type="button"
            class="px-4 py-2 rounded-lg text-gray-700 hover:bg-gray-100"
            @click="slugOuvert = null"
          >
            Annuler
          </button>
          <button
            type="submit"
            class="bg-primary text-white font-semibold rounded-lg px-5 py-2 hover:bg-primary/90 disabled:opacity-60"
            :disabled="enregistrement"
          >
            {{ enregistrement ? 'Enregistrement…' : 'Enregistrer' }}
          </button>
        </div>
      </form>
    </Boite>
  </div>
</template>

<script setup lang="ts">
/**
 * Saisie des pages redactionnelles de l'ambassade.
 *
 * La liste des pages est FERMEE : chaque slug correspond a une route du site,
 * et l'ecran les presente toutes, y compris celles que l'ambassade n'a pas
 * encore redigees. C'est ce qui fait de cet ecran un inventaire plutot qu'une
 * liste de ce qui existe deja : sans cela, personne ne saurait que la page
 * « Notre ambition numerique » peut etre remplie.
 *
 * Le contrat est `docs/contrat-contenu-redactionnel.md`.
 */
import { ref, reactive, onMounted } from 'vue'
import Boite from './Boite.vue'
import EtatSection from './EtatSection.vue'
import ChampImage from '@/components/ui/ChampImage.vue'
import { messageErreurContenu } from '@/api/contenu'
import { ApiError } from '@/api/client'
import {
  recupererPagesAdmin,
  enregistrerPage,
  enregistrerParametresDesPages,
  pageParSlug,
  PAGES_VIDES,
  type ContenuDesPages,
  type SlugDePage,
  type ChiffreMarquant,
} from '@/api/pages'

/** Ce que l'ecran dit de chaque page, dans l'ordre du menu du site. */
const PAGES_DU_GABARIT: {
  slug: SlugDePage
  libelle: string
  chemin: string
  aide: string
}[] = [
  {
    slug: 'presentation',
    libelle: 'Présentation',
    chemin: '/presentation',
    aide: "Les missions de l'Ambassade et la présentation du pays.",
  },
  {
    slug: 'chancellerie',
    libelle: 'La Chancellerie',
    chemin: '/chancellerie',
    aide: "Le texte de présentation. L'équipe vient de l'annuaire, pas d'ici.",
  },
  {
    slug: 'relations-bilaterales',
    libelle: 'Relations bilatérales',
    chemin: '/relations-bilaterales',
    aide: 'La relation avec le pays hôte et les domaines de coopération.',
  },
  {
    slug: 'ambition-numerique',
    libelle: 'Notre ambition numérique',
    chemin: '/ambition-numerique',
    aide: "Les projets numériques. La page annonce d'elle-même que les services décrits ne sont pas encore ouverts.",
  },
]

const LONGUEUR_TITRE_MAX = 180
const LONGUEUR_SOUS_TITRE_MAX = 200
const LONGUEUR_PAYS_MAX = 120
const LONGUEUR_VALEUR_MAX = 12
const LONGUEUR_LIBELLE_MAX = 80
const CHIFFRES_MAX = 8

const contenu = ref<ContenuDesPages>({ ...PAGES_VIDES })
const chargement = ref(true)
const enregistrement = ref(false)
const succes = ref('')
const erreur = ref('')
const erreurBoite = ref('')
const erreursDeChamp = reactive<Record<string, string>>({})

const slugOuvert = ref<SlugDePage | null>(null)
const saisie = reactive({
  title: '',
  subtitle: '',
  hero_image_url: '',
  body_html: '',
  published: false,
})

const juridiction = ref<string[]>([])
const chiffres = ref<ChiffreMarquant[]>([])

const pageDe = (slug: SlugDePage) => pageParSlug(contenu.value, slug)
const libelleDe = (slug: SlugDePage) =>
  PAGES_DU_GABARIT.find((p) => p.slug === slug)?.libelle ?? slug

/**
 * Une page compte comme visible seulement si elle est publiee ET porte du
 * texte : publiee mais vide, elle affiche « Rubrique en preparation », et
 * l'annoncer comme visible serait un mensonge.
 */
function estVisible(slug: SlugDePage): boolean {
  const page = pageDe(slug)
  return page !== null && page.published && (page.body_html ?? '') !== ''
}

function ouvrir(slug: SlugDePage): void {
  const page = pageDe(slug)
  erreurBoite.value = ''
  for (const cle of Object.keys(erreursDeChamp)) delete erreursDeChamp[cle]
  saisie.title = page?.title ?? ''
  saisie.subtitle = page?.subtitle ?? ''
  saisie.hero_image_url = page?.hero_image_url ?? ''
  saisie.body_html = page?.body_html ?? ''
  saisie.published = page?.published ?? false
  slugOuvert.value = slug
}

/**
 * Range les messages d'un 422 par champ.
 *
 * Le detail par champ passe AVANT l'agregat : un « Le titre est obligatoire »
 * pose sous le champ vaut mieux qu'un message general en tete de formulaire,
 * ou personne ne le relie a la case a corriger.
 */
function rangerLesErreurs(souleve: unknown): void {
  for (const cle of Object.keys(erreursDeChamp)) delete erreursDeChamp[cle]
  if (souleve instanceof ApiError && souleve.statut === 422) {
    const corps = souleve.corps as { errors?: Record<string, string[]> } | null
    for (const [champ, messages] of Object.entries(corps?.errors ?? {})) {
      const premier = messages[0]
      if (premier !== undefined) erreursDeChamp[champ] = premier
    }
    if (Object.keys(erreursDeChamp).length > 0) return
  }
  erreurBoite.value = messageErreurContenu(souleve)
}

async function enregistrer(): Promise<void> {
  const slug = slugOuvert.value
  if (slug === null) return
  if (saisie.title === '') {
    erreursDeChamp.title = 'Le titre est obligatoire.'
    return
  }
  enregistrement.value = true
  erreurBoite.value = ''
  try {
    // Remplacement COMPLET : tous les champs partent, y compris ceux laisses
    // vides, pour qu'un champ efface le soit vraiment.
    await enregistrerPage(slug, {
      title: saisie.title,
      subtitle: saisie.subtitle === '' ? null : saisie.subtitle,
      hero_image_url: saisie.hero_image_url === '' ? null : saisie.hero_image_url,
      body_html: saisie.body_html === '' ? null : saisie.body_html,
      published: saisie.published,
    })
    contenu.value = await recupererPagesAdmin()
    succes.value = 'Page enregistrée.'
    erreur.value = ''
    slugOuvert.value = null
  } catch (souleve) {
    rangerLesErreurs(souleve)
  } finally {
    enregistrement.value = false
  }
}

async function enregistrerParametres(): Promise<void> {
  enregistrement.value = true
  erreur.value = ''
  try {
    // Les lignes laissees vides ne partent pas : une case oubliee ne doit pas
    // devenir un pays sans nom sur le site public.
    await enregistrerParametresDesPages({
      jurisdiction: juridiction.value.filter((pays) => pays !== ''),
      figures: chiffres.value.filter((c) => c.value !== '' && c.label !== ''),
    })
    contenu.value = await recupererPagesAdmin()
    reprendreLesParametres()
    succes.value = 'Juridiction et chiffres enregistrés.'
  } catch (souleve) {
    erreur.value = messageErreurContenu(souleve)
    succes.value = ''
  } finally {
    enregistrement.value = false
  }
}

function reprendreLesParametres(): void {
  juridiction.value = [...contenu.value.jurisdiction]
  chiffres.value = contenu.value.figures.map((c) => ({ ...c }))
}

onMounted(async () => {
  try {
    contenu.value = await recupererPagesAdmin()
    reprendreLesParametres()
  } catch (souleve) {
    erreur.value = messageErreurContenu(souleve)
  }
  chargement.value = false
})
</script>
