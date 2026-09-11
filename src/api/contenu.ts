import { apiGet, apiPost, apiPut, apiPatch, apiDelete, apiUpload, ApiError } from './client'

/**
 * Contenu d'accueil servi par le CMS : mot de bienvenue, dirigeants, vitrine.
 *
 * Ces trois blocs etaient ecrits en dur dans le gabarit, avec le contenu de
 * l'ambassade de Guinee aux Etats-Unis. Les servir par ambassade est ce qui
 * empeche qu'ils reapparaissent sur un autre domaine.
 *
 * Le contrat complet est dans `docs/contrat-contenu-accueil.md`.
 */

export interface MotDeBienvenue {
  title: string
  /** Assaini cote serveur : le front l'insere avec `v-html`. */
  body_html: string
}

export interface Dirigeant {
  id: number
  name: string
  role: string
  subtitle: string | null
  image_url: string
  position: number
}

export interface ImageVitrine {
  id: number
  image_url: string
  alt: string | null
  position: number
}

export interface ContenuAccueil {
  welcome: MotDeBienvenue | null
  leaders: Dirigeant[]
  showcase: ImageVitrine[]
}

interface Enveloppe<T> {
  data: T
}

/** Le contenu vide : ce que le gabarit affiche tant que l'API ne sert rien. */
export const CONTENU_VIDE: ContenuAccueil = { welcome: null, leaders: [], showcase: [] }

/**
 * Ordonne par `position`, pas par `id`.
 *
 * Un nouvel element insere en tete porte l'identifiant le plus grand : trier
 * par identifiant le renverrait en fin de liste, ce que personne n'a demande.
 */
function ordonner<T extends { position: number }>(elements: readonly T[]): T[] {
  return [...elements].sort((a, b) => a.position - b.position)
}

/**
 * Ramene une reponse partielle a un contenu complet.
 *
 * Un bloc absent vaut vide, jamais le contenu du gabarit : c'est la seule
 * garantie qui empeche la fuite d'identite de revenir.
 */
export function normaliserContenu(
  servi: Partial<ContenuAccueil> | null | undefined,
): ContenuAccueil {
  return {
    welcome: servi?.welcome ?? null,
    leaders: ordonner(servi?.leaders ?? []),
    showcase: ordonner(servi?.showcase ?? []),
  }
}

export async function recupererContenuAccueil(): Promise<ContenuAccueil> {
  const reponse = await apiGet<Enveloppe<Partial<ContenuAccueil>>>('/api/content/home')
  return normaliserContenu(reponse.data)
}

// --- Administration -------------------------------------------------------

const ADMIN = '/api/admin/content'

export async function recupererContenuAdmin(): Promise<ContenuAccueil> {
  const reponse = await apiGet<Enveloppe<Partial<ContenuAccueil>>>(`${ADMIN}/home`)
  return normaliserContenu(reponse.data)
}

export async function enregistrerMotDeBienvenue(mot: MotDeBienvenue): Promise<MotDeBienvenue> {
  const reponse = await apiPut<Enveloppe<MotDeBienvenue>>(`${ADMIN}/welcome`, mot)
  return reponse.data
}

export function supprimerMotDeBienvenue(): Promise<void> {
  return apiDelete(`${ADMIN}/welcome`)
}

export type DirigeantSaisi = Omit<Dirigeant, 'id' | 'position'>

export async function ajouterDirigeant(saisi: DirigeantSaisi): Promise<Dirigeant> {
  const reponse = await apiPost<Enveloppe<Dirigeant>>(`${ADMIN}/leaders`, saisi)
  return reponse.data
}

export async function modifierDirigeant(
  id: number,
  saisi: Partial<DirigeantSaisi>,
): Promise<Dirigeant> {
  const reponse = await apiPatch<Enveloppe<Dirigeant>>(`${ADMIN}/leaders/${id}`, saisi)
  return reponse.data
}

export function supprimerDirigeant(id: number): Promise<void> {
  return apiDelete(`${ADMIN}/leaders/${id}`)
}

export function ordonnerDirigeants(ids: readonly number[]): Promise<void> {
  return apiPut(`${ADMIN}/leaders/order`, { ids })
}

export type ImageVitrineSaisie = Omit<ImageVitrine, 'id' | 'position'>

export async function ajouterImageVitrine(saisie: ImageVitrineSaisie): Promise<ImageVitrine> {
  const reponse = await apiPost<Enveloppe<ImageVitrine>>(`${ADMIN}/showcase`, saisie)
  return reponse.data
}

export async function modifierImageVitrine(
  id: number,
  saisie: Partial<ImageVitrineSaisie>,
): Promise<ImageVitrine> {
  const reponse = await apiPatch<Enveloppe<ImageVitrine>>(`${ADMIN}/showcase/${id}`, saisie)
  return reponse.data
}

export function supprimerImageVitrine(id: number): Promise<void> {
  return apiDelete(`${ADMIN}/showcase/${id}`)
}

export function ordonnerVitrine(ids: readonly number[]): Promise<void> {
  return apiPut(`${ADMIN}/showcase/order`, { ids })
}

/** Bornes du televersement, reprises du contrat pour les verifier avant envoi. */
export const TYPES_IMAGE_ACCEPTES = ['image/webp', 'image/png', 'image/jpeg'] as const
export const TAILLE_IMAGE_MAX = 5 * 1024 * 1024

/**
 * Televerse une image et rend son URL definitive.
 *
 * Le controle de surface evite un aller-retour sur un fichier manifestement
 * refusable ; le serveur reste l'autorite et repond 422 ou 413.
 */
export async function televerserImage(fichier: File): Promise<string> {
  const formulaire = new FormData()
  formulaire.append('file', fichier)
  const reponse = await apiUpload<Enveloppe<{ url: string }>>(`${ADMIN}/media`, formulaire)
  return reponse.data.url
}

/** Message d'un refus previsible, ou `null` si le fichier est acceptable. */
export function refusDuFichier(fichier: File): string | null {
  if (!TYPES_IMAGE_ACCEPTES.includes(fichier.type as (typeof TYPES_IMAGE_ACCEPTES)[number])) {
    return 'Formats acceptés : WebP, PNG ou JPEG.'
  }
  if (fichier.size > TAILLE_IMAGE_MAX) {
    return "L'image ne doit pas dépasser 5 Mo."
  }
  return null
}

/**
 * Message affichable d'un echec.
 *
 * Le CMS renvoie un `message` en francais directement presentable ; le repli
 * ne sert qu'aux pannes reseau, ou aucune reponse n'est parvenue. Une panne
 * n'est jamais presentee comme une faute de saisie.
 */
export function messageErreurContenu(souleve: unknown): string {
  if (souleve instanceof ApiError && souleve.statut !== 0 && souleve.message.trim() !== '') {
    return souleve.message
  }
  if (souleve instanceof ApiError && souleve.statut === 413) {
    return "L'image dépasse la taille acceptée."
  }
  return 'Le service est momentanément indisponible. Réessayez dans un instant.'
}
