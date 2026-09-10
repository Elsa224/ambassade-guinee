import { apiGet, apiPost, apiPut, apiDelete } from './client'

/** Statuts de modération d'un article (spec 4.2). */
export type StatutArticle = 'brouillon' | 'a_valider' | 'publie'

/** Taxonomie gérée en base, en remplacement des listes en dur (spec 4.2). */
export interface Categorie {
  id: number
  nom: string
  slug: string
  couleur: string
}

export interface Article {
  id: number
  slug: string
  titre: string
  resume: string
  contenu: string
  image: string
  categorie: Categorie
  date_publication: string
  statut: StatutArticle
  vues: number
  likes: number
  locale: string
  source: string
  /** Dérivé du nombre de mots côté serveur : jamais calculé ici. */
  temps_lecture: number
}

/** Charge utile d'écriture : sous-ensemble modifiable depuis le back-office. */
export interface BrouillonArticle {
  titre: string
  resume: string
  contenu: string
  categorie_slug: string
  statut: StatutArticle
  date_publication: string
  image?: string
}

interface Enveloppe<T> {
  data: T
}

const LIBELLES: Record<StatutArticle, string> = {
  brouillon: 'Brouillon',
  a_valider: 'À valider',
  publie: 'Publié',
}

/** Libellé affichable d'un statut. */
export function libelleStatut(statut: StatutArticle): string {
  return LIBELLES[statut] ?? LIBELLES.brouillon
}

/**
 * Statut d'API correspondant à un libellé d'interface.
 * Repli sur `brouillon` : en cas de valeur inattendue, mieux vaut ne rien
 * publier que publier par accident.
 */
export function statutDepuisLibelle(libelle: string): StatutArticle {
  const trouve = (Object.keys(LIBELLES) as StatutArticle[]).find(
    (statut) => LIBELLES[statut] === libelle,
  )
  return trouve ?? 'brouillon'
}

/** Filtres acceptes par la liste d'articles. */
export interface FiltresArticles {
  statut?: StatutArticle
  /** Slug de categorie, tel que renvoye dans `categorie.slug`. */
  categorie?: string
}

function versChaineDeRequete(filtres: FiltresArticles): string {
  const parametres = new URLSearchParams()
  if (filtres.statut) parametres.set('statut', filtres.statut)
  if (filtres.categorie) parametres.set('categorie', filtres.categorie)
  const chaine = parametres.toString()
  return chaine ? `?${chaine}` : ''
}

export async function listerArticles(filtres: FiltresArticles = {}): Promise<Article[]> {
  const reponse = await apiGet<Enveloppe<Article[]>>(`/api/articles${versChaineDeRequete(filtres)}`)
  return reponse.data
}

/**
 * Liste destinee au site public.
 *
 * Le filtre `statut=publie` est demande au serveur, puis reapplique ici. Cette
 * seconde passe n'est pas une securite : un brouillon renvoye par l'API aurait
 * deja quitte le serveur. Elle garantit seulement qu'un defaut de filtrage
 * cote back ne se traduit pas par la publication accidentelle d'un brouillon
 * sur le site public. Le filtrage qui fait autorite reste celui du serveur.
 */
export async function listerArticlesPublies(categorie?: string): Promise<Article[]> {
  const articles = await listerArticles({ statut: 'publie', categorie })
  return articles.filter((article) => article.statut === 'publie')
}

export async function recupererArticleParSlug(slug: string): Promise<Article> {
  const reponse = await apiGet<Enveloppe<Article>>(`/api/articles/${encodeURIComponent(slug)}`)
  return reponse.data
}

export async function creerArticle(brouillon: BrouillonArticle): Promise<Article> {
  const reponse = await apiPost<Enveloppe<Article>>('/api/articles', brouillon)
  return reponse.data
}

export async function modifierArticle(id: number, brouillon: BrouillonArticle): Promise<Article> {
  const reponse = await apiPut<Enveloppe<Article>>(`/api/articles/${id}`, brouillon)
  return reponse.data
}

export function supprimerArticle(id: number): Promise<void> {
  return apiDelete(`/api/articles/${id}`)
}
