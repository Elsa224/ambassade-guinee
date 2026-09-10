import { apiGet, apiPost, ApiError } from './client'

/**
 * Surface visiteur du module Evenements.
 *
 * Le front ne parle jamais a Ambassade Secure : il ne connait ni son hote ni
 * son jeton. Tout passe par le CMS, qui detient le compte de service cote
 * serveur. Une URL `*.securecheck.*` qui apparaitrait dans une reponse serait
 * une fuite a signaler au back, pas quelque chose a contourner ici.
 */

/** Carte publique d'un evenement : exactement les champs que le back expose. */
export interface EvenementPublic {
  publicToken: string
  name: string
  date: string
  time: string
  location: string
  typeLabel: string
  description: string
  registrationOpen: boolean
  registrationDeadline: string | null
  /** `null` quand l'evenement n'a pas de capacite limitee. */
  spotsRemaining: number | null
  /**
   * Calcule par le back (inscriptions closes, echeance passee ou capacite
   * atteinte). Jamais recalcule ici : deux logiques finiraient par diverger.
   */
  isRegistrationClosed: boolean
  /**
   * Deja une URL du domaine de l'ambassade, publique : elle se pose telle
   * quelle dans un `<img src>`. A ne pas confondre avec le `logoUrl` des
   * reponses d'administration, qui exige un jeton porteur.
   */
  logoUrl: string | null
}

export interface DemandeInscription {
  fullName: string
  email: string
  phone?: string
}

interface Enveloppe<T> {
  data: T
}

/** Nature d'un echec, pour que l'interface le presente au bon endroit. */
export type GenreErreur = 'introuvable' | 'impossible' | 'saisie' | 'trop_de_requetes' | 'panne'

/**
 * Traduit le statut HTTP en nature d'erreur.
 *
 * Le back normalise tout ce qui vient d'Ambassade Secure : il ne reste que
 * cinq cas. Un 502 est une panne de service et ne doit jamais etre presente
 * comme une faute de saisie du visiteur.
 */
export function genreErreur(souleve: unknown): GenreErreur {
  if (!(souleve instanceof ApiError)) return 'panne'
  switch (souleve.statut) {
    case 404:
      return 'introuvable'
    case 409:
      return 'impossible'
    case 422:
      return 'saisie'
    case 429:
      return 'trop_de_requetes'
    default:
      // 502, et toute panne reseau, que le client rapporte avec le statut 0.
      return 'panne'
  }
}

const MESSAGES_DE_REPLI: Record<GenreErreur, string> = {
  introuvable: "Cet évènement n'est pas disponible.",
  impossible: "L'inscription n'est plus possible pour cet évènement.",
  saisie: 'Certaines informations sont incorrectes.',
  trop_de_requetes: 'Trop de tentatives. Patientez un instant avant de réessayer.',
  panne: 'Le service est momentanément indisponible. Réessayez dans un instant.',
}

/**
 * Message affichable d'une erreur.
 *
 * Le back renvoie un `message` en francais, directement presentable ; le repli
 * ne sert qu'aux pannes reseau, ou aucune reponse n'est parvenue.
 */
export function messageErreur(souleve: unknown): string {
  const genre = genreErreur(souleve)
  if (souleve instanceof ApiError && souleve.statut !== 0 && souleve.message.trim() !== '') {
    return souleve.message
  }
  return MESSAGES_DE_REPLI[genre]
}

export async function listerEvenementsPublies(): Promise<EvenementPublic[]> {
  const reponse = await apiGet<Enveloppe<EvenementPublic[]>>('/api/secure/events')
  return reponse.data
}

export async function recupererEvenement(token: string): Promise<EvenementPublic> {
  const reponse = await apiGet<Enveloppe<EvenementPublic>>(
    `/api/secure/events/${encodeURIComponent(token)}`,
  )
  return reponse.data
}

export async function inscrireAEvenement(
  token: string,
  demande: DemandeInscription,
): Promise<void> {
  await apiPost(`/api/secure/events/${encodeURIComponent(token)}/register`, demande)
}
