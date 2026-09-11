import { apiGet } from './client'

/**
 * Surface d'administration du module Evenements.
 *
 * Les champs ci-dessous sont ceux que le back a garantis, releves dans
 * `toEventView()` d'Ambassade Secure. Deux ecarts avec ce que le front avait
 * d'abord suppose sont corriges ici, et chacun aurait casse le typage :
 *
 *  - `typeEventSlug` n'existe pas dans la reponse. Le champ rendu est
 *    `typeLabel`, le nom du type, `null` quand l'evenement n'en a pas. Le slug
 *    s'envoie a la creation mais ne revient pas sous ce nom.
 *  - `registrationUrl` est supprime par le CMS, et `logoUrl` reecrit vers une
 *    route locale : ni l'un ni l'autre ne doit etre attendu sous sa forme
 *    Ambassade Secure.
 */

/**
 * Chemin de l'administration des evenements, confirme par le back le
 * 2026-09-11.
 *
 * La fiche d'un evenement suit la convention de la surface visiteur, ou le
 * detail est `/api/secure/events/{token}` : ici `{CHEMIN}/{slug}`.
 */
export const CHEMIN_LISTE_ADMIN = '/api/admin/secure/events'

/**
 * Un participant inscrit.
 *
 * Ces champs sont des donnees personnelles, et le back les sert dans la
 * reponse de LISTE, pas seulement dans le detail. Le front ne les affiche
 * donc jamais dans le tableau : seul leur nombre y figure. C'est aussi la
 * raison pour laquelle cette liste n'est pas mise en cache navigateur.
 */
export interface ParticipantAdmin {
  fullName: string
  email: string
  uidn: string
}

/** Etat d'un evenement tel qu'Ambassade Secure le rapporte. */
export type StatutEvenement = string

export interface EvenementAdmin {
  slug: string
  name: string
  date: string
  time: string
  location: string
  description: string
  status: StatutEvenement
  createdAt: string
  /** URL locale reecrite par le CMS ; exige un jeton porteur. */
  logoUrl: string | null
  registrationOpen: boolean
  registrationDeadline: string | null
  /** `null` quand l'evenement n'a pas de capacite limitee. */
  capacity: number | null
  registeredCount: number
  spotsRemaining: number | null
  /** Nom du type, `null` quand l'evenement n'en a pas. Ce n'est pas un slug. */
  typeLabel: string | null
  participants: ParticipantAdmin[]
  /**
   * Publication sur le site de l'ambassade.
   *
   * Ambassade Secure n'a aucune notion de publication : elle vit uniquement
   * cote CMS, dans `secure_event_publications`. Ces deux champs sont donc
   * ajoutes par le CMS a la reponse relayee, et restent optionnels tant que
   * cet ajout n'est pas deploye : un back plus ancien ne les renvoie pas, et
   * l'ecran doit le dire plutot que d'afficher « brouillon » a tort.
   */
  isPublished?: boolean
  publishedAt?: string | null
}

/**
 * Pagination servie par le back.
 *
 * Les quatre champs sont garantis, ce qui permet d'afficher un total exact
 * (« 61-90 sur 204 ») plutot qu'une navigation a l'aveugle.
 */
export interface Pagination {
  page: number
  limit: number
  total: number
  totalPages: number
}

export interface PageEvenements {
  evenements: EvenementAdmin[]
  pagination: Pagination
}

/**
 * Plafond applique par le serveur.
 *
 * Demander davantage n'echoue pas : le back rabat SILENCIEUSEMENT a 100. Le
 * front borne donc lui-meme, pour que le nombre de lignes demande soit
 * toujours celui qui revient.
 */
export const LIMITE_MAX = 100
export const LIMITE_DEFAUT = 20

/** Bornes de la page affichee, pour le libelle « 61-90 sur 204 ». */
export function bornesAffichees(pagination: Pagination): { premier: number; dernier: number } {
  if (pagination.total === 0) return { premier: 0, dernier: 0 }
  const premier = (pagination.page - 1) * pagination.limit + 1
  return { premier, dernier: Math.min(pagination.page * pagination.limit, pagination.total) }
}

interface EnveloppePaginee {
  data: EvenementAdmin[]
  pagination: Pagination
}

export async function listerEvenementsAdmin(
  page = 1,
  limite = LIMITE_DEFAUT,
): Promise<PageEvenements> {
  const parametres = new URLSearchParams({
    page: String(Math.max(1, Math.trunc(page))),
    limit: String(Math.min(LIMITE_MAX, Math.max(1, Math.trunc(limite)))),
  })
  const reponse = await apiGet<EnveloppePaginee>(`${CHEMIN_LISTE_ADMIN}?${parametres}`)
  return { evenements: reponse.data, pagination: reponse.pagination }
}

/**
 * Fiche d'un evenement.
 *
 * La liste porte deja tous les champs, participants compris : cet appel
 * n'existe donc pas pour completer la ligne, mais pour qu'une fiche ouverte
 * par son adresse — un lien partage, un rechargement — se charge seule, sans
 * exiger d'avoir traverse la liste ni de savoir sur quelle page elle se
 * trouvait.
 */
export async function recupererEvenementAdmin(slug: string): Promise<EvenementAdmin> {
  const reponse = await apiGet<{ data: EvenementAdmin }>(
    `${CHEMIN_LISTE_ADMIN}/${encodeURIComponent(slug)}`,
  )
  return reponse.data
}
