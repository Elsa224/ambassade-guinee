import { apiGet, apiPost, ApiError, genreErreur, type GenreErreur } from './client'

// Reexportes : les deux etaient nes ici, et la page d'inscription les importe
// depuis ce module. Ils vivent desormais dans `client.ts`, ou le relais des
// rendez-vous les prend aussi — ce sont des statuts HTTP, pas des evenements.
export { genreErreur, type GenreErreur }

/**
 * Surface visiteur du module Evenements.
 *
 * Le front ne parle jamais a Ambassade Secure : il ne connait ni son hote ni
 * son jeton. Tout passe par le CMS, qui detient le compte de service cote
 * serveur. Une URL `*.securecheck.*` qui apparaitrait dans une reponse serait
 * une fuite a signaler au back, pas quelque chose a contourner ici.
 */

/**
 * Carte publique d'un evenement : exactement les champs que le back expose.
 *
 * `publicToken` n'est servi QUE par la liste. La fiche
 * `GET /api/secure/events/{token}` ne le renvoie pas — ce qui est logique,
 * il est deja dans l'URL demandee — et le front ne doit donc jamais compter
 * dessus pour reconstruire un appel. Il est facultatif ici pour que le
 * compilateur refuse qu'on le prenne pour acquis.
 */
export interface EvenementPublic {
  publicToken?: string
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
