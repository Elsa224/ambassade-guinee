import { apiGet, apiPost, apiPut, apiDelete } from './client'

/** Statuts de moderation d un article (spec 4.2). */
export type StatutArticle = 'brouillon' | 'a_valider' | 'publie'

/** Taxonomie geree en base, en remplacement des listes en dur (spec 4.2). */
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
  /** Derive du nombre de mots cote serveur : jamais calcule ici. */
  temps_lecture: number
}

/** Charge utile d ecriture : sous-ensemble modifiable depuis le back-office. */
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
  a_valider: 'A valider',
  publie: 'Publie',
}

/** Libelle affichable d un statut. */
export function libelleStatut(statut: StatutArticle): string {
  return LIBELLES[statut] ?? LIBELLES.brouillon
}

/**
 * Statut d API correspondant a un libelle d interface.
 * Repli sur `brouillon` : en cas de valeur inattendue, mieux vaut ne rien
 * publier que publier par accident.
 */
export function statutDepuisLibelle(libelle: string): StatutArticle {
  const trouve = (Object.keys(LIBELLES) as StatutArticle[]).find(
    (statut) => LIBELLES[statut] === libelle,
  )
  return trouve ?? 'brouillon'
}

export async function listerArticles(): Promise<Article[]> {
  const reponse = await apiGet<Enveloppe<Article[]>>('/api/articles')
  return reponse.data
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
