import { apiGet, apiPost, apiPatch, apiDelete, ApiError } from './client'

/**
 * Demandes de rendez-vous prises sur le site public.
 *
 * Le contrat propose est `docs/contrat-rendez-vous.md`. Une regle le
 * structure entierement : c'est une **demande**, pas une reservation. Le site
 * n'affiche aucune disponibilite et ne confirme rien ; il enregistre un
 * souhait que le poste traite depuis son back-office. Tant que ce module
 * n'est pas en production des deux cotes, le drapeau `rendez_vous` reste a
 * `false` pour toutes les ambassades : le formulaire du gabarit n'envoyait
 * rien et affichait quand meme une confirmation.
 */

/** Ce que le visiteur envoie. Les deux derniers champs sont facultatifs. */
export interface DemandeRendezVous {
  /** Slug d'un service publie par l'ambassade, ou `autre`. */
  service: string
  first_name: string
  last_name: string
  email: string
  phone: string
  /** `AAAA-MM-JJ`, jamais une date-heure : c'est un jour souhaite. */
  preferred_date: string
  /** `HH:MM`. */
  preferred_time: string
  documents?: string
  message?: string
}

/** Valeur de `service` quand aucun service publie ne correspond. */
export const SERVICE_AUTRE = 'autre'

/** Liste fermee au contrat : le front tient les libelles, le serveur la cle. */
export const STATUTS_RENDEZ_VOUS = ['nouveau', 'confirme', 'refuse', 'honore', 'annule'] as const

export type StatutRendezVous = (typeof STATUTS_RENDEZ_VOUS)[number]

const LIBELLES: Readonly<Record<StatutRendezVous, string>> = {
  nouveau: 'Nouvelle demande',
  confirme: 'Confirmé',
  refuse: 'Refusé',
  honore: 'Honoré',
  annule: 'Annulé',
}

/**
 * Libelle affichable d'un statut.
 *
 * Une valeur inconnue rend la cle telle quelle plutot qu'une chaine vide : si
 * le back ajoute un statut, la ligne reste lisible au lieu de paraitre vide.
 */
export function libelleDuStatut(statut: string): string {
  return LIBELLES[statut as StatutRendezVous] ?? statut
}

/** Ce que le serveur rend apres un envoi accepte. */
export interface AccuseRendezVous {
  /** Lisible a l'oral : c'est ce que le visiteur citera au telephone. */
  reference: string
  status: StatutRendezVous
  created_at: string
}

/** Une demande telle que le back-office la lit. */
export interface RendezVous extends DemandeRendezVous, AccuseRendezVous {
  id: number
  /** Note interne du poste, jamais servie au visiteur. */
  staff_note: string | null
  updated_at: string
}

interface Enveloppe<T> {
  data: T
}

/**
 * Envoie la demande.
 *
 * Le formulaire n'affiche sa fenetre de confirmation qu'apres la resolution
 * de cette promesse : c'est la seule chose qui distingue le module de la
 * maquette qu'il remplace, laquelle confirmait sans avoir rien envoye.
 */
export async function envoyerDemandeRendezVous(
  demande: DemandeRendezVous,
): Promise<AccuseRendezVous> {
  const reponse = await apiPost<Enveloppe<AccuseRendezVous>>('/api/content/appointments', demande)
  return reponse.data
}

/**
 * Vrai quand le serveur a refuse pour cause de trop de demandes.
 *
 * La route est anonyme et ecrit en base : le back la limite par adresse IP.
 * Un 429 n'est pas une panne et ne doit pas s'annoncer comme telle, sinon le
 * visiteur renvoie aussitot et se fait refuser de nouveau.
 */
export function estTropDeDemandes(souleve: unknown): boolean {
  return souleve instanceof ApiError && souleve.statut === 429
}

/** La date la plus proche acceptee : aujourd'hui plus deux jours. */
export const DELAI_MINIMAL_EN_JOURS = 2

// --- Administration -------------------------------------------------------

const ADMIN = '/api/admin/appointments'

export interface FiltresRendezVous {
  statut?: StatutRendezVous
  page?: number
}

export interface PageDeRendezVous {
  demandes: RendezVous[]
  page: number
  /** Nombre total de pages, `1` quand le serveur n'en sert pas. */
  pages: number
}

interface EnveloppePaginee {
  data: RendezVous[]
  meta?: { current_page?: number; last_page?: number }
}

export async function recupererRendezVous(
  filtres: FiltresRendezVous = {},
): Promise<PageDeRendezVous> {
  const parametres = new URLSearchParams()
  if (filtres.statut) parametres.set('status', filtres.statut)
  if (filtres.page && filtres.page > 1) parametres.set('page', String(filtres.page))
  const requete = parametres.toString()
  const reponse = await apiGet<EnveloppePaginee>(`${ADMIN}${requete ? `?${requete}` : ''}`)
  return {
    demandes: reponse.data ?? [],
    page: reponse.meta?.current_page ?? 1,
    pages: reponse.meta?.last_page ?? 1,
  }
}

/**
 * Traite une demande.
 *
 * Seuls le statut et la note interne sont modifiables : le poste ne recrit
 * pas la demande d'un citoyen, il la traite.
 */
export async function traiterRendezVous(
  id: number,
  changement: { status?: StatutRendezVous; staff_note?: string | null },
): Promise<RendezVous> {
  const reponse = await apiPatch<Enveloppe<RendezVous>>(`${ADMIN}/${id}`, changement)
  return reponse.data
}

export function supprimerRendezVous(id: number): Promise<void> {
  return apiDelete(`${ADMIN}/${id}`)
}
