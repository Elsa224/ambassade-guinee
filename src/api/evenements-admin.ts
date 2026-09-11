import { apiGet, apiPost, apiPatch, apiPut, ApiError } from './client'

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

/**
 * Un type d'evenement, tel que le formulaire le propose.
 *
 * C'est `slug` qui s'envoie et `label` qui s'affiche. Cette route existe pour
 * cette seule raison : sans elle, le formulaire n'aurait qu'un champ libre ou
 * l'agent taperait un slug a la main, c'est-a-dire une faute de frappe a
 * chaque creation.
 */
export interface TypeEvenement {
  slug: string
  label: string
}

export const CHEMIN_TYPES = '/api/admin/secure/event-types'

export async function listerTypesEvenement(): Promise<TypeEvenement[]> {
  const reponse = await apiGet<{ data: TypeEvenement[] }>(CHEMIN_TYPES)
  return reponse.data
}

/**
 * Ce qu'on envoie pour creer ou modifier un evenement.
 *
 * Le miroir de la forme de LECTURE, a une asymetrie pres, et elle est
 * irreductible : on ecrit `typeEventSlug`, on lit `typeLabel`. L'un identifie,
 * l'autre s'affiche. Confondre les deux enverrait « Fete nationale » la ou le
 * back attend « fete-nationale ».
 *
 * `null` n'est pas ici l'absence de valeur mais une valeur : `capacity: null`
 * dit « sans limite », `registrationDeadline: null` dit « pas de cloture ».
 */
export interface BrouillonEvenement {
  name: string
  date: string
  time: string
  location: string
  description: string
  capacity: number | null
  registrationOpen: boolean
  registrationDeadline: string | null
  typeEventSlug: string | null
}

export async function creerEvenement(brouillon: BrouillonEvenement): Promise<EvenementAdmin> {
  const reponse = await apiPost<{ data: EvenementAdmin }>(CHEMIN_LISTE_ADMIN, brouillon)
  return reponse.data
}

/**
 * Ce qu'une modification accepte : le brouillon, partiel, plus l'etat.
 *
 * `status` n'est pas dans le brouillon parce qu'on ne choisit pas l'etat d'un
 * evenement qu'on cree — il nait actif. Il ne devient modifiable qu'ensuite,
 * et c'est par la qu'on annule.
 */
export type RetoucheEvenement = Partial<BrouillonEvenement> & { status?: StatutEvenement }

export async function modifierEvenement(
  slug: string,
  brouillon: RetoucheEvenement,
): Promise<EvenementAdmin> {
  const reponse = await apiPatch<{ data: EvenementAdmin }>(
    `${CHEMIN_LISTE_ADMIN}/${encodeURIComponent(slug)}`,
    brouillon,
  )
  return reponse.data
}

/**
 * Annule un evenement.
 *
 * Il n'y a volontairement pas de suppression. Un evenement auquel des gens se
 * sont inscrits porte leurs inscriptions : l'effacer les effacerait avec lui.
 * L'annulation garde la trace et permet de prevenir les inscrits.
 */
export async function annulerEvenement(slug: string): Promise<EvenementAdmin> {
  return modifierEvenement(slug, { status: 'CANCELLED' })
}

/**
 * Publie ou retire l'evenement du site de l'ambassade.
 *
 * Route a part, et non un champ de `PATCH` : la publication n'existe pas dans
 * Ambassade Secure, elle vit uniquement cote CMS. Elle n'est donc pas relayee.
 */
export async function basculerPublication(slug: string, publie: boolean): Promise<EvenementAdmin> {
  const reponse = await apiPut<{ data: EvenementAdmin }>(
    `${CHEMIN_LISTE_ADMIN}/${encodeURIComponent(slug)}/publication`,
    { isPublished: publie },
  )
  return reponse.data
}

/**
 * Messages de validation, ranges par champ.
 *
 * Un bandeau general disant « Les donnees fournies sont invalides » oblige
 * l'agent a relire tout son formulaire pour trouver lequel des dix champs
 * pose probleme. Le back range ses messages par nom de champ : on les place
 * sous le champ concerne. Seul le premier message de chaque champ est retenu,
 * les suivants disent la meme chose autrement.
 */
export function erreursDeChamp(souleve: unknown): Record<string, string> {
  if (!(souleve instanceof ApiError)) return {}
  const corps = souleve.corps
  if (corps === null || typeof corps !== 'object' || !('errors' in corps)) return {}
  const brut = (corps as { errors: unknown }).errors
  if (brut === null || typeof brut !== 'object') return {}

  const resultat: Record<string, string> = {}
  for (const [champ, messages] of Object.entries(brut as Record<string, unknown>)) {
    if (Array.isArray(messages) && messages.length > 0) {
      resultat[champ] = String(messages[0])
    } else if (typeof messages === 'string') {
      resultat[champ] = messages
    }
  }
  return resultat
}
