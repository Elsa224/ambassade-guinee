import { apiGet, apiPost, apiPut, apiPatch, apiDelete } from './client'

/**
 * Annuaire de l'ambassade : personnel de la chancellerie et consuls
 * honoraires.
 *
 * Le contrat qui fait foi est `docs/contrat-annuaire.md` du depot back
 * (develop). Les deux listes ont la forme des dirigeants de l'accueil :
 * elements ordonnes, nom, fonction, image facultative pour le personnel.
 *
 * Une regle differe du contenu d'accueil : les listes sont servies deja
 * triees (`position` puis `id`), et apres une suppression les `position`
 * gardent un trou jusqu'au prochain reordonnancement. On rend donc dans
 * L'ORDRE DU TABLEAU servi, sans jamais retrier ni utiliser `position`
 * comme index.
 */

export interface MembrePersonnel {
  id: number
  name: string
  role: string
  email: string | null
  phone: string | null
  image_url: string | null
  position: number
}

export interface ConsulHonoraire {
  id: number
  name: string
  role: string
  city: string
  /** Peut contenir des retours a la ligne : rendre avec `whitespace-pre-line`. */
  address: string | null
  email: string | null
  phone: string | null
  position: number
}

export interface Annuaire {
  staff: MembrePersonnel[]
  consuls: ConsulHonoraire[]
}

interface Enveloppe<T> {
  data: T
}

/** L'annuaire vide : ce que le site affiche tant que rien n'est saisi. */
export const ANNUAIRE_VIDE: Annuaire = { staff: [], consuls: [] }

/** Bornes du contrat, reprises pour les poser sur les champs de saisie. */
export const LONGUEUR_TEXTE_MAX = 191
export const LONGUEUR_TELEPHONE_MAX = 40
export const LONGUEUR_ADRESSE_MAX = 2000

/**
 * Ramene une reponse partielle a un annuaire complet, sans retrier.
 *
 * Une liste absente vaut vide, jamais le contenu du gabarit : meme garantie
 * que pour l'accueil, c'est elle qui empeche la fuite d'identite.
 */
export function normaliserAnnuaire(servi: Partial<Annuaire> | null | undefined): Annuaire {
  return {
    staff: [...(servi?.staff ?? [])],
    consuls: [...(servi?.consuls ?? [])],
  }
}

export async function recupererAnnuaire(): Promise<Annuaire> {
  const reponse = await apiGet<Enveloppe<Partial<Annuaire>>>('/api/content/directory')
  return normaliserAnnuaire(reponse.data)
}

// --- Administration -------------------------------------------------------

const ADMIN = '/api/admin/directory'

export async function recupererAnnuaireAdmin(): Promise<Annuaire> {
  const reponse = await apiGet<Enveloppe<Partial<Annuaire>>>(ADMIN)
  return normaliserAnnuaire(reponse.data)
}

/**
 * Champs saisissables d'un membre du personnel.
 *
 * `null` efface email, telephone ou image ; `name` et `role` ne s'effacent
 * pas (le back repond 422), l'ecran les valide non vides avant l'envoi.
 */
export type MembreSaisi = {
  name: string
  role: string
  email: string | null
  phone: string | null
  image_url: string | null
}

export async function ajouterMembre(saisi: MembreSaisi): Promise<MembrePersonnel> {
  const reponse = await apiPost<Enveloppe<MembrePersonnel>>(`${ADMIN}/staff`, saisi)
  return reponse.data
}

export async function modifierMembre(
  id: number,
  saisi: Partial<MembreSaisi>,
): Promise<MembrePersonnel> {
  const reponse = await apiPatch<Enveloppe<MembrePersonnel>>(`${ADMIN}/staff/${id}`, saisi)
  return reponse.data
}

export function supprimerMembre(id: number): Promise<void> {
  return apiDelete(`${ADMIN}/staff/${id}`)
}

/**
 * Reordonne le personnel d'un coup. `ids` doit porter TOUS les identifiants
 * de la liste, dans l'ordre voulu : liste incomplete, doublon ou identifiant
 * etranger valent 422. La reponse est la liste reordonnee.
 */
export async function ordonnerPersonnel(ids: readonly number[]): Promise<MembrePersonnel[]> {
  const reponse = await apiPut<Enveloppe<MembrePersonnel[]>>(`${ADMIN}/staff/order`, { ids })
  return reponse.data
}

/** Champs saisissables d'un consul honoraire. `city` ne s'efface pas non plus. */
export type ConsulSaisi = {
  name: string
  role: string
  city: string
  address: string | null
  email: string | null
  phone: string | null
}

export async function ajouterConsul(saisi: ConsulSaisi): Promise<ConsulHonoraire> {
  const reponse = await apiPost<Enveloppe<ConsulHonoraire>>(`${ADMIN}/consuls`, saisi)
  return reponse.data
}

export async function modifierConsul(
  id: number,
  saisi: Partial<ConsulSaisi>,
): Promise<ConsulHonoraire> {
  const reponse = await apiPatch<Enveloppe<ConsulHonoraire>>(`${ADMIN}/consuls/${id}`, saisi)
  return reponse.data
}

export function supprimerConsul(id: number): Promise<void> {
  return apiDelete(`${ADMIN}/consuls/${id}`)
}

export async function ordonnerConsuls(ids: readonly number[]): Promise<ConsulHonoraire[]> {
  const reponse = await apiPut<Enveloppe<ConsulHonoraire[]>>(`${ADMIN}/consuls/order`, { ids })
  return reponse.data
}
