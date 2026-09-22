<script setup lang="ts">
import { computed, onMounted, ref } from 'vue'
import {
  creerArticle,
  creerCategorie,
  libelleStatut,
  listerArticlesAdmin,
  listerCategories,
  modifierArticle,
  supprimerArticle,
  type Article,
  type BrouillonArticle,
  type Categorie,
  type StatutArticle,
} from '@/api/articles'
import { televerserMedia, TAILLE_MEDIA_MAX } from '@/api/medias'
import ChampSelect from '@/components/ui/ChampSelect.vue'
import ChampDate from '@/components/ui/ChampDate.vue'
import ChampImage from '@/components/ui/ChampImage.vue'
import Pagination from '@/components/ui/Pagination.vue'
import PastilleEtat from '@/components/ui/PastilleEtat.vue'
import { paginerEnMemoire } from '@/components/ui/pagination'

/**
 * Gestion des articles.
 *
 * Cet ecran est le SEUL a ecrire dans /api/articles. Il a longtemps eu un
 * jumeau, « Actualites », qui appelait exactement les memes routes sur la
 * meme table en rebaptisant `categorie` en « type » : publier d'un cote
 * faisait apparaitre la ligne de l'autre, et son champ « mots-cles » n'etait
 * envoye nulle part. Les deux ecrans ont ete fondus ici.
 *
 * Les libelles de statut n'existent qu'a l'affichage. L'etat de l'ecran porte
 * les valeurs de l'API (`brouillon`, `a_valider`, `publie`) : c'est ce que le
 * back attend, et une chaine accentuee comparee a la main etait la porte
 * ouverte au filtre qui ne filtre rien.
 */

/**
 * Les categories viennent du serveur, jamais d'une liste ecrite ici.
 *
 * Le gabarit en portait trois en dur — `actualites-ambassade`,
 * `actualites-diplomatique`, `actualites-gouvernementale` — qui ne
 * correspondaient a rien : les categories sont des lignes propres a chaque
 * ambassade, creees a la demande. Un article enregistre avec l'un de ces
 * slugs ressortait sans categorie, en silence.
 */
const categories = ref<Categorie[]>([])

const STATUTS: readonly StatutArticle[] = ['brouillon', 'a_valider', 'publie']

/** Dix lignes tenaient dans la page ; le lecteur peut en demander plus. */
const LIGNES_PAR_DEFAUT = 10

const OPTIONS_CATEGORIE = computed(() =>
  categories.value.map((c) => ({ valeur: String(c.id), libelle: c.nom })),
)
const OPTIONS_STATUT = STATUTS.map((statut) => ({ valeur: statut, libelle: libelleStatut(statut) }))

const OPTIONS_FILTRE_CATEGORIE = computed(() => [
  { valeur: '', libelle: 'Toutes les catégories' },
  ...categories.value.map((c) => ({ valeur: c.slug, libelle: c.nom })),
])
const OPTIONS_FILTRE_STATUT = [{ valeur: '', libelle: 'Tous les statuts' }, ...OPTIONS_STATUT]

const OPTIONS_TRI = [
  { valeur: 'recent', libelle: 'Plus récent' },
  { valeur: 'ancien', libelle: 'Plus ancien' },
  { valeur: 'titre', libelle: 'Titre A-Z' },
  { valeur: 'vues', libelle: 'Plus vus' },
] as const

type Tri = (typeof OPTIONS_TRI)[number]['valeur']

/** L'article tel que l'ecran le manipule : les champs qu'il affiche ou ecrit. */
interface ArticleEnListe {
  id: number
  titre: string
  resume: string
  contenu: string
  image: string
  /** Le slug, pour le filtre et la pastille. */
  categorie: string
  /** L'identifiant, pour reouvrir le formulaire sur la bonne valeur. */
  categorieId: number | null
  statut: StatutArticle
  date: string
  vues: number
}

function versEcran(article: Article): ArticleEnListe {
  return {
    id: article.id,
    titre: article.titre,
    resume: article.resume,
    contenu: article.contenu,
    image: article.image,
    categorie: article.categorie?.slug ?? '',
    categorieId: article.categorie?.id ?? null,
    statut: article.statut,
    date: article.date_publication,
    vues: article.vues,
  }
}

const articles = ref<ArticleEnListe[]>([])
const chargement = ref(false)
const erreurApi = ref('')

const recherche = ref('')
const filtreCategorie = ref('')
const filtreStatut = ref<'' | StatutArticle>('')
const tri = ref<Tri>('recent')
const pageCourante = ref(1)
const lignesParPage = ref(LIGNES_PAR_DEFAUT)

/**
 * Repli des accents avant comparaison.
 *
 * Personne ne tape « Ceremonie du 2 octobre » avec les accents pour retrouver
 * un article : la recherche accentuee ne trouvait rien et laissait croire que
 * l'article n'existait pas.
 */
function sansAccent(texte: string): string {
  return texte
    .normalize('NFD')
    .replace(/\p{Diacritic}/gu, '')
    .toLowerCase()
}

const articlesFiltres = computed(() => {
  const terme = sansAccent(recherche.value.trim())
  const retenus = articles.value.filter((article) => {
    if (terme && !sansAccent(`${article.titre} ${article.resume}`).includes(terme)) return false
    if (filtreCategorie.value && article.categorie !== filtreCategorie.value) return false
    if (filtreStatut.value && article.statut !== filtreStatut.value) return false
    return true
  })

  return retenus.sort(COMPARATEURS[tri.value])
})

const COMPARATEURS: Record<Tri, (a: ArticleEnListe, b: ArticleEnListe) => number> = {
  recent: (a, b) => horodatage(b.date) - horodatage(a.date),
  ancien: (a, b) => horodatage(a.date) - horodatage(b.date),
  titre: (a, b) => a.titre.localeCompare(b.titre, 'fr'),
  vues: (a, b) => b.vues - a.vues,
}

/** Une date illisible vaut zero : elle finit en bas du tri, elle ne le casse pas. */
function horodatage(date: string): number {
  const valeur = new Date(date).getTime()
  return Number.isNaN(valeur) ? 0 : valeur
}

/**
 * La barre de pagination attend la meme forme que celle servie par le back
 * pour les evenements. `paginerEnMemoire` la construit ici et garantit au
 * passage `totalPages >= 1` : l'ancien calcul rendait zero sur une liste
 * vide, ce qui laissait le bouton « suivant » actif.
 */
const pagination = computed(() =>
  paginerEnMemoire(articlesFiltres.value.length, pageCourante.value, lignesParPage.value),
)

const articlesPagines = computed(() => {
  const debut = (pagination.value.page - 1) * pagination.value.limit
  return articlesFiltres.value.slice(debut, debut + pagination.value.limit)
})

/**
 * Les quatre compteurs portent sur TOUT le fonds, pas sur la page ni sur le
 * filtre courant. Un « total » qui bouge quand on tape dans la recherche ne
 * dit plus combien d'articles l'ambassade possede.
 */
const compteurs = computed(() => ({
  total: articles.value.length,
  publies: articles.value.filter((a) => a.statut === 'publie').length,
  brouillons: articles.value.filter((a) => a.statut === 'brouillon').length,
  vues: articles.value.reduce((somme, a) => somme + a.vues, 0),
}))

function libelleCategorie(slug: string): string {
  if (slug === '') return 'Sans catégorie'
  return categories.value.find((c) => c.slug === slug)?.nom ?? slug
}

/**
 * Forme courte, pour la colonne du tableau : la colonne s'intitule deja
 * « Categorie », repeter « Actualites… » sur chaque ligne faisait passer la
 * pastille sur deux lignes et rendait la hauteur des lignes irreguliere.
 */
function categorieCourte(slug: string): string {
  const nom = libelleCategorie(slug)
  // « Actualites de l'ambassade » -> « Ambassade ». Le prefixe est retire
  // quand il existe, jamais impose : les noms appartiennent a l'ambassade.
  const abrege = nom.replace(/^actualit[ée]s?\s+(?:de\s+l['’])?/i, '')
  return abrege === '' ? nom : abrege.charAt(0).toUpperCase() + abrege.slice(1)
}

/** Le statut porte un etat : c'est la seule chose qui a droit a la couleur. */
function tonDuStatut(statut: StatutArticle): 'positif' | 'attention' | 'eteint' {
  if (statut === 'publie') return 'positif'
  if (statut === 'a_valider') return 'attention'
  return 'eteint'
}

function dateLisible(date: string): string {
  const valeur = new Date(date)
  if (Number.isNaN(valeur.getTime())) return date
  return valeur.toLocaleDateString('fr-FR', { day: 'numeric', month: 'long', year: 'numeric' })
}

function changerLignesParPage(lignes: number): void {
  lignesParPage.value = lignes
  pageCourante.value = 1
}

/** Toute retouche de filtre ramene en page 1 : sinon la liste parait vide. */
function filtrer(): void {
  pageCourante.value = 1
}

// --- Formulaire -----------------------------------------------------------

interface SaisieArticle {
  titre: string
  /** L'identifiant de la categorie, sous forme de chaine pour le `select`. */
  categorie: string
  resume: string
  contenu: string
  statut: StatutArticle
  date: string
  /**
   * La CLE du media, renseignee seulement par un nouveau televersement.
   *
   * Vide, elle signifie « ne touche pas a l'image » : le champ est alors
   * absent du corps envoye. La lecture ne rend que l'adresse d'affichage, et
   * la cle ne s'en deduit pas.
   */
  image: string
  /** L'adresse montree dans la vignette, qui n'est jamais enregistree. */
  apercuImage: string
}

function saisieVierge(): SaisieArticle {
  return {
    titre: '',
    categorie: '',
    resume: '',
    contenu: '',
    statut: 'brouillon',
    date: new Date().toISOString().slice(0, 10),
    image: '',
    apercuImage: '',
  }
}

const formulaireOuvert = ref(false)
const modeEdition = ref(false)
const idEnCours = ref<number | null>(null)
const saisie = ref<SaisieArticle>(saisieVierge())
const enregistrement = ref(false)

const titreDuFormulaire = computed(() =>
  modeEdition.value ? "Modifier l'article" : 'Nouvel article',
)

function ouvrirCreation(): void {
  modeEdition.value = false
  idEnCours.value = null
  saisie.value = saisieVierge()
  saisie.value.categorie = categories.value[0] ? String(categories.value[0].id) : ''
  erreurApi.value = ''
  formulaireOuvert.value = true
}

function ouvrirEdition(article: ArticleEnListe): void {
  modeEdition.value = true
  idEnCours.value = article.id
  saisie.value = {
    titre: article.titre,
    categorie: article.categorieId === null ? '' : String(article.categorieId),
    resume: article.resume,
    contenu: article.contenu,
    statut: article.statut,
    date: article.date,
    image: '',
    apercuImage: article.image,
  }
  erreurApi.value = ''
  formulaireOuvert.value = true
}

function fermerFormulaire(): void {
  formulaireOuvert.value = false
  annulerCreationCategorie()
  saisie.value = saisieVierge()
  idEnCours.value = null
}

async function enregistrer(): Promise<void> {
  if (enregistrement.value) return
  enregistrement.value = true
  erreurApi.value = ''

  const brouillon: BrouillonArticle = {
    titre: saisie.value.titre,
    resume: saisie.value.resume,
    contenu: saisie.value.contenu,
    categorie_id: saisie.value.categorie === '' ? null : Number(saisie.value.categorie),
    statut: saisie.value.statut,
    date_publication: saisie.value.date,
    // Absent quand aucune image neuve n'a ete choisie : le serveur laisse
    // alors celle qui est deja posee.
    image: saisie.value.image || undefined,
  }

  try {
    if (modeEdition.value && idEnCours.value !== null) {
      await modifierArticle(idEnCours.value, brouillon)
    } else {
      await creerArticle(brouillon)
    }
    fermerFormulaire()
    await charger()
  } catch {
    erreurApi.value = 'Enregistrement impossible. Vérifiez les champs et réessayez.'
  } finally {
    enregistrement.value = false
  }
}

// --- Creation de categorie ------------------------------------------------

/**
 * Le menu ne peut proposer que ce qui existe en base, et aucun autre ecran
 * ne cree de categorie. Sans ce controle, une ambassade neuve n'a aucune
 * facon d'en obtenir une : tous ses articles partent sans categorie, en
 * silence, puisque le serveur accepte `categorie_id: null`.
 */
const creationCategorie = ref(false)
const nomNouvelleCategorie = ref('')
const erreurCategorie = ref('')
const ajoutEnCours = ref(false)

function ouvrirCreationCategorie(): void {
  creationCategorie.value = true
  nomNouvelleCategorie.value = ''
  erreurCategorie.value = ''
}

function annulerCreationCategorie(): void {
  creationCategorie.value = false
  nomNouvelleCategorie.value = ''
  erreurCategorie.value = ''
}

async function ajouterCategorie(): Promise<void> {
  const nom = nomNouvelleCategorie.value.trim()
  if (nom === '' || ajoutEnCours.value) return
  ajoutEnCours.value = true
  erreurCategorie.value = ''
  try {
    const creee = await creerCategorie(nom)
    categories.value = [...categories.value, creee].sort((a, b) => a.nom.localeCompare(b.nom, 'fr'))
    // Choisie d'office : on vient de la creer pour l'article en cours.
    saisie.value.categorie = String(creee.id)
    creationCategorie.value = false
    nomNouvelleCategorie.value = ''
  } catch {
    erreurCategorie.value = 'Création impossible. Ce nom est peut-être déjà pris.'
  } finally {
    ajoutEnCours.value = false
  }
}

async function supprimer(article: ArticleEnListe): Promise<void> {
  if (!window.confirm(`Supprimer « ${article.titre} » ? Cette action est définitive.`)) return
  try {
    await supprimerArticle(article.id)
    await charger()
  } catch {
    erreurApi.value = 'Suppression impossible.'
  }
}

// --- Apercu ---------------------------------------------------------------

const poidsMaximalDuMedia = Math.round(TAILLE_MEDIA_MAX / (1024 * 1024))

const apercu = ref<ArticleEnListe | null>(null)

function ouvrirApercu(article: ArticleEnListe): void {
  apercu.value = article
}

function fermerApercu(): void {
  apercu.value = null
}

// --- Chargement -----------------------------------------------------------

async function charger(): Promise<void> {
  chargement.value = true
  erreurApi.value = ''
  try {
    // Les deux vont ensemble : sans la taxonomie, la colonne « Categorie »
    // n'aurait que des slugs a montrer et le formulaire un menu vide.
    const [liste, taxonomie] = await Promise.all([listerArticlesAdmin(), listerCategories()])
    articles.value = liste.map(versEcran)
    categories.value = taxonomie
  } catch {
    erreurApi.value = 'Impossible de charger les articles.'
    articles.value = []
  } finally {
    chargement.value = false
  }
}

/**
 * Televerse et garde la CLE du media, l'adresse ne servant qu'a l'apercu.
 *
 * C'est ce que la route d'article attend : elle rebatit l'adresse a la
 * lecture. Lui rendre l'URL absolue la faisait prefixer deux fois.
 */
async function televerserPourArticle(fichier: File) {
  const media = await televerserMedia(fichier)
  return { valeur: media.cle, apercu: media.url }
}

onMounted(charger)
</script>

<template>
  <div>
    <header class="mb-6 flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
      <div>
        <h2 class="text-2xl font-bold text-gray-800">Gestion des articles</h2>
        <p class="text-gray-600 mt-1">Les articles publiés sur le site de l'ambassade.</p>
      </div>
      <button
        type="button"
        class="flex items-center gap-2 rounded-lg bg-primary px-5 py-2.5 font-medium text-white transition-colors hover:bg-primary-dark"
        @click="ouvrirCreation"
      >
        <i class="bx bx-plus-circle text-xl" aria-hidden="true"></i>
        Nouvel article
      </button>
    </header>

    <!-- Filtres -->
    <div class="mb-6 rounded-xl bg-white p-4 shadow-sm">
      <div class="flex flex-col gap-4 md:flex-row">
        <div class="relative flex-1">
          <label class="sr-only" for="recherche-articles">Rechercher un article</label>
          <i
            class="bx bx-search pointer-events-none absolute top-1/2 left-3 -translate-y-1/2 text-gray-400"
            aria-hidden="true"
          ></i>
          <input
            id="recherche-articles"
            v-model="recherche"
            type="search"
            placeholder="Rechercher un article…"
            class="w-full rounded-lg border border-gray-300 py-2.5 pr-4 pl-10 focus:outline-2 focus:outline-offset-2 focus:outline-primary"
            @input="filtrer"
          />
        </div>

        <ChampSelect
          v-model="filtreCategorie"
          :options="OPTIONS_FILTRE_CATEGORIE"
          class="md:w-56"
          @update:model-value="filtrer"
        />
        <ChampSelect
          v-model="filtreStatut"
          :options="OPTIONS_FILTRE_STATUT"
          class="md:w-44"
          @update:model-value="filtrer"
        />
        <ChampSelect v-model="tri" :options="OPTIONS_TRI" class="md:w-44" />
      </div>
    </div>

    <!-- Compteurs : tout le fonds, jamais la page ni le filtre -->
    <div class="mb-6 grid grid-cols-2 gap-4 sm:grid-cols-4">
      <div class="rounded-xl bg-white p-4 shadow-sm">
        <p class="text-xs text-gray-500">Articles</p>
        <p class="mt-1 text-2xl font-bold text-gray-800 tabular-nums">{{ compteurs.total }}</p>
      </div>
      <div class="rounded-xl bg-white p-4 shadow-sm">
        <p class="text-xs text-gray-500">Publiés</p>
        <p class="mt-1 text-2xl font-bold text-emerald-700 tabular-nums">
          {{ compteurs.publies }}
        </p>
      </div>
      <div class="rounded-xl bg-white p-4 shadow-sm">
        <p class="text-xs text-gray-500">Brouillons</p>
        <p class="mt-1 text-2xl font-bold text-amber-700 tabular-nums">
          {{ compteurs.brouillons }}
        </p>
      </div>
      <div class="rounded-xl bg-white p-4 shadow-sm">
        <p class="text-xs text-gray-500">Vues cumulées</p>
        <p class="mt-1 text-2xl font-bold text-gray-800 tabular-nums">
          {{ compteurs.vues.toLocaleString('fr-FR') }}
        </p>
      </div>
    </div>

    <p
      v-if="erreurApi"
      class="mb-4 rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-red-800"
      role="alert"
    >
      {{ erreurApi }}
      <button type="button" class="ml-2 font-medium underline" @click="charger()">Réessayer</button>
    </p>

    <!-- Liste -->
    <div class="overflow-hidden rounded-xl bg-white shadow-sm">
      <p v-if="chargement" class="px-5 py-8 text-gray-500">Chargement des articles…</p>

      <template v-else>
        <div class="overflow-x-auto">
          <table class="w-full text-left">
            <thead>
              <tr class="bg-gray-50">
                <th
                  v-for="entete in ['Article', 'Catégorie', 'Statut', 'Date', 'Vues', 'Actions']"
                  :key="entete"
                  class="border-b border-gray-200 px-5 py-3 text-xs font-semibold tracking-wide text-gray-500 uppercase"
                  scope="col"
                >
                  {{ entete }}
                </th>
              </tr>
            </thead>

            <tbody v-if="articlesPagines.length === 0">
              <tr>
                <td class="px-5 py-16 text-center" colspan="6">
                  <p class="font-medium text-gray-700">Aucun article ne correspond</p>
                  <p class="mt-1 text-sm text-gray-500">
                    Modifiez la recherche ou les filtres, ou créez un article.
                  </p>
                </td>
              </tr>
            </tbody>

            <tbody v-else>
              <tr
                v-for="article in articlesPagines"
                :key="article.id"
                class="border-b border-gray-100 transition-colors last:border-0 hover:bg-gray-50/70"
              >
                <td class="px-5 py-4">
                  <div class="flex items-center gap-3">
                    <img
                      v-if="article.image"
                      :src="article.image"
                      alt=""
                      class="h-12 w-12 shrink-0 rounded-lg object-cover"
                    />
                    <div class="min-w-0">
                      <p class="truncate font-semibold text-gray-800">{{ article.titre }}</p>
                      <p class="mt-0.5 truncate text-xs text-gray-500">{{ article.resume }}</p>
                    </div>
                  </div>
                </td>

                <td class="px-5 py-4">
                  <span
                    v-if="article.categorie !== ''"
                    class="inline-block rounded-full bg-gray-100 px-2.5 py-0.5 text-xs font-medium whitespace-nowrap text-gray-700"
                    :title="libelleCategorie(article.categorie)"
                  >
                    {{ categorieCourte(article.categorie) }}
                  </span>
                  <span v-else class="text-xs whitespace-nowrap text-amber-700">
                    Sans catégorie
                  </span>
                </td>

                <td class="px-5 py-4">
                  <PastilleEtat
                    :libelle="libelleStatut(article.statut)"
                    :ton="tonDuStatut(article.statut)"
                  />
                </td>

                <td class="px-5 py-4 whitespace-nowrap text-gray-600 tabular-nums">
                  {{ dateLisible(article.date) }}
                </td>

                <td class="px-5 py-4 text-gray-600 tabular-nums">{{ article.vues }}</td>

                <td class="px-5 py-4">
                  <div class="flex gap-1">
                    <button
                      type="button"
                      class="rounded-md p-1.5 text-gray-500 transition-colors hover:bg-gray-100 hover:text-primary"
                      :aria-label="`Aperçu de ${article.titre}`"
                      @click="ouvrirApercu(article)"
                    >
                      <i class="bx bx-show text-xl" aria-hidden="true"></i>
                    </button>
                    <button
                      type="button"
                      class="rounded-md p-1.5 text-gray-500 transition-colors hover:bg-gray-100 hover:text-primary"
                      :aria-label="`Modifier ${article.titre}`"
                      @click="ouvrirEdition(article)"
                    >
                      <i class="bx bx-edit-alt text-xl" aria-hidden="true"></i>
                    </button>
                    <button
                      type="button"
                      class="rounded-md p-1.5 text-gray-500 transition-colors hover:bg-red-50 hover:text-red-700"
                      :aria-label="`Supprimer ${article.titre}`"
                      @click="supprimer(article)"
                    >
                      <i class="bx bx-trash text-xl" aria-hidden="true"></i>
                    </button>
                  </div>
                </td>
              </tr>
            </tbody>
          </table>
        </div>

        <Pagination
          :pagination="pagination"
          libelle-vide="Aucun article"
          @page="pageCourante = $event"
          @limite="changerLignesParPage"
        />
      </template>
    </div>

    <!-- Formulaire -->
    <Teleport to="body">
      <div
        v-if="formulaireOuvert"
        class="fixed inset-0 z-[1100] flex items-center justify-center bg-black/50 p-4"
      >
        <div
          class="max-h-[90vh] w-full max-w-2xl overflow-y-auto rounded-xl bg-white shadow-xl"
          role="dialog"
          aria-modal="true"
          aria-labelledby="titre-formulaire-article"
        >
          <div
            class="sticky top-0 z-10 flex items-center justify-between border-b border-gray-200 bg-white px-5 py-4"
          >
            <h2 id="titre-formulaire-article" class="text-lg font-semibold text-gray-800">
              {{ titreDuFormulaire }}
            </h2>
            <button
              type="button"
              class="rounded-md p-1 text-gray-400 transition-colors hover:bg-gray-100 hover:text-gray-600"
              aria-label="Fermer"
              @click="fermerFormulaire"
            >
              <i class="bx bx-x text-2xl" aria-hidden="true"></i>
            </button>
          </div>

          <form class="p-5" @submit.prevent="enregistrer">
            <div class="mb-4">
              <label class="mb-1 block text-sm font-medium text-gray-700" for="titre-article">
                Titre de l'article *
              </label>
              <input
                id="titre-article"
                v-model="saisie.titre"
                type="text"
                required
                placeholder="Entrez le titre de l'article"
                class="w-full rounded-lg border border-gray-300 px-3 py-2.5 focus:outline-2 focus:outline-offset-2 focus:outline-primary"
              />
            </div>

            <div class="mb-4">
              <label class="mb-1 block text-sm font-medium text-gray-700" for="categorie-article">
                Catégorie
              </label>
              <ChampSelect
                v-if="categories.length > 0"
                id="categorie-article"
                v-model="saisie.categorie"
                :options="OPTIONS_CATEGORIE"
              />
              <p v-else class="text-sm text-amber-700">
                Aucune catégorie n'existe encore pour cette ambassade. L'article s'enregistrera sans
                catégorie tant que vous n'en aurez pas créé une.
              </p>

              <div v-if="creationCategorie" class="mt-2 flex items-center gap-2">
                <input
                  id="nom-nouvelle-categorie"
                  v-model="nomNouvelleCategorie"
                  type="text"
                  class="flex-1 rounded-lg border border-gray-300 px-3 py-2 text-sm focus:border-primary focus:outline-none"
                  placeholder="Nom de la catégorie"
                  aria-label="Nom de la nouvelle catégorie"
                  @keydown.enter.prevent="ajouterCategorie"
                />
                <button
                  type="button"
                  class="rounded-lg bg-primary px-3 py-2 text-sm font-medium text-white disabled:opacity-50"
                  :disabled="ajoutEnCours || nomNouvelleCategorie.trim() === ''"
                  @click="ajouterCategorie"
                >
                  {{ ajoutEnCours ? 'Création…' : 'Créer' }}
                </button>
                <button
                  type="button"
                  class="rounded-lg px-3 py-2 text-sm text-gray-600 hover:text-gray-900"
                  @click="annulerCreationCategorie"
                >
                  Annuler
                </button>
              </div>
              <button
                v-else
                type="button"
                class="mt-2 text-sm font-medium text-gray-700 underline hover:text-gray-900"
                @click="ouvrirCreationCategorie"
              >
                + Nouvelle catégorie
              </button>
              <p v-if="erreurCategorie" class="mt-1 text-sm text-red-600">{{ erreurCategorie }}</p>
            </div>

            <div class="mb-4">
              <label class="mb-1 block text-sm font-medium text-gray-700" for="resume-article">
                Résumé
              </label>
              <textarea
                id="resume-article"
                v-model="saisie.resume"
                rows="2"
                placeholder="Petite description de l'article…"
                class="w-full rounded-lg border border-gray-300 px-3 py-2.5 focus:outline-2 focus:outline-offset-2 focus:outline-primary"
              ></textarea>
            </div>

            <div class="mb-4">
              <label class="mb-1 block text-sm font-medium text-gray-700" for="contenu-article">
                Contenu *
              </label>
              <textarea
                id="contenu-article"
                v-model="saisie.contenu"
                rows="6"
                required
                placeholder="Contenu détaillé de l'article…"
                class="w-full rounded-lg border border-gray-300 px-3 py-2.5 focus:outline-2 focus:outline-offset-2 focus:outline-primary"
              ></textarea>
            </div>

            <div class="mb-4">
              <ChampImage
                v-model="saisie.image"
                v-model:apercu="saisie.apercuImage"
                libelle="Image principale"
                :televerseur="televerserPourArticle"
                :poids-maximal="poidsMaximalDuMedia"
              />
            </div>

            <div class="mb-4 grid grid-cols-1 gap-4 sm:grid-cols-2">
              <div>
                <label class="mb-1 block text-sm font-medium text-gray-700" for="statut-article">
                  Statut
                </label>
                <ChampSelect
                  id="statut-article"
                  v-model="saisie.statut"
                  :options="OPTIONS_STATUT"
                />
              </div>
              <div>
                <label class="mb-1 block text-sm font-medium text-gray-700" for="date-article">
                  Date de publication
                </label>
                <ChampDate id="date-article" v-model="saisie.date" />
              </div>
            </div>

            <div class="flex justify-end gap-3 border-t border-gray-200 pt-4">
              <button
                type="button"
                class="rounded-lg border border-gray-300 px-4 py-2 font-medium text-gray-700 transition-colors hover:bg-gray-50"
                @click="fermerFormulaire"
              >
                Annuler
              </button>
              <button
                type="submit"
                :disabled="enregistrement"
                class="rounded-lg bg-primary px-4 py-2 font-medium text-white transition-colors hover:bg-primary-dark disabled:opacity-60"
              >
                {{ enregistrement ? 'Enregistrement…' : 'Enregistrer' }}
              </button>
            </div>
          </form>
        </div>
      </div>
    </Teleport>

    <!-- Apercu -->
    <Teleport to="body">
      <div
        v-if="apercu"
        class="fixed inset-0 z-[1100] flex items-center justify-center bg-black/50 p-4"
        @keydown.esc="fermerApercu"
      >
        <div
          class="max-h-[90vh] w-full max-w-3xl overflow-y-auto rounded-xl bg-white shadow-xl"
          role="dialog"
          aria-modal="true"
          aria-labelledby="titre-apercu-article"
        >
          <div
            class="sticky top-0 z-10 flex items-center justify-between border-b border-gray-200 bg-white px-5 py-4"
          >
            <h2 id="titre-apercu-article" class="text-lg font-semibold text-gray-800">
              Aperçu de l'article
            </h2>
            <button
              type="button"
              class="rounded-md p-1 text-gray-400 transition-colors hover:bg-gray-100 hover:text-gray-600"
              aria-label="Fermer"
              @click="fermerApercu"
            >
              <i class="bx bx-x text-2xl" aria-hidden="true"></i>
            </button>
          </div>

          <div class="p-5">
            <img
              v-if="apercu.image"
              :src="apercu.image"
              alt=""
              class="mb-4 h-64 w-full rounded-lg object-cover"
            />
            <h3 class="text-xl font-bold text-gray-800">{{ apercu.titre }}</h3>
            <div class="mt-2 mb-4 flex flex-wrap items-center gap-3 text-sm text-gray-500">
              <span class="tabular-nums">{{ dateLisible(apercu.date) }}</span>
              <span>{{ libelleCategorie(apercu.categorie) }}</span>
              <span class="tabular-nums">{{ apercu.vues }} vues</span>
              <PastilleEtat
                :libelle="libelleStatut(apercu.statut)"
                :ton="tonDuStatut(apercu.statut)"
              />
            </div>
            <p v-if="apercu.resume" class="mb-4 rounded-lg bg-gray-50 p-3 text-gray-600 italic">
              {{ apercu.resume }}
            </p>
            <div class="whitespace-pre-wrap text-gray-700">{{ apercu.contenu }}</div>
          </div>

          <div class="flex justify-end border-t border-gray-200 px-5 py-4">
            <button
              type="button"
              class="rounded-lg border border-gray-300 px-4 py-2 font-medium text-gray-700 transition-colors hover:bg-gray-50"
              @click="fermerApercu"
            >
              Fermer
            </button>
          </div>
        </div>
      </div>
    </Teleport>
  </div>
</template>
