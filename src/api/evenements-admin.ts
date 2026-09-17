import { apiGet, apiPost, apiPatch, apiDelete, apiFichier, ApiError } from './client'
import type { FichierServi } from './client'
// La forme d'une pagination n'est pas propre aux evenements : elle vit dans
// `components/ui/pagination.ts` et se reexporte ici, ou le contrat du back est
// decrit.
import type { Pagination } from '@/components/ui/pagination'

export { bornesAffichees, type Pagination } from '@/components/ui/pagination'

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
 * C'est `slug` qui s'envoie et `name` qui s'affiche. Cette route existe pour
 * cette seule raison : sans elle, le formulaire n'aurait qu'un champ libre ou
 * l'agent taperait un slug a la main, c'est-a-dire une faute de frappe a
 * chaque creation.
 *
 * La reponse est le releve BRUT de SecureCheck, confirme par le back le
 * 2026-09-14 : le libelle s'appelle `name`, pas `label`, et chaque type porte
 * un `isActive`. Les autres champs releves (`description`, `createdAt`) ne
 * servent pas au formulaire et ne sont pas types ici.
 */
export interface TypeEvenement {
  slug: string
  name: string
  isActive: boolean
}

export const CHEMIN_TYPES = '/api/admin/secure/event-types'

export async function listerTypesEvenement(): Promise<TypeEvenement[]> {
  const reponse = await apiGet<{ data: TypeEvenement[] }>(CHEMIN_TYPES)
  // Un type desactive cote SecureCheck serait refuse a la creation : le
  // proposer, c'est promettre un 422.
  return reponse.data.filter((type) => type.isActive !== false)
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
 *
 * Contrat arrete le 2026-09-14 : `status` s'envoie SEUL (tout autre champ a
 * ses cotes vaut 422), la seule valeur acceptee est `cancelled`. Le back
 * relaie a SecureCheck puis DEPUBLIE l'evenement : la reponse revient avec
 * `status: "cancelled"` en minuscules et `isPublished: false`.
 */
export async function annulerEvenement(slug: string): Promise<EvenementAdmin> {
  return modifierEvenement(slug, { status: 'cancelled' })
}

/**
 * Publie ou retire l'evenement du site de l'ambassade.
 *
 * Route a part, et non un champ de `PATCH` : la publication n'existe pas dans
 * Ambassade Secure, elle vit uniquement cote CMS. Contrat confirme le
 * 2026-09-13 : `POST .../publication` publie (201/200), `DELETE` retire
 * (204), sans corps ni dans un sens ni dans l'autre. La reponse du POST ne
 * porte pas l'evenement — on recharge la fiche pour lire l'etat reel.
 */
export async function basculerPublication(slug: string, publie: boolean): Promise<EvenementAdmin> {
  const chemin = `${CHEMIN_LISTE_ADMIN}/${encodeURIComponent(slug)}/publication`
  if (publie) {
    await apiPost(chemin, undefined)
  } else {
    await apiDelete(chemin)
  }
  return recupererEvenementAdmin(slug)
}

/**
 * L'URL publique d'inscription d'un evenement et son QR.
 *
 * `qr` est une URI de donnees SVG : elle se pose telle quelle dans un
 * `<img src>` et s'imprime proprement a n'importe quelle taille.
 */
export interface QrInscription {
  registrationUrl: string
  qr: string
}

/**
 * Recupere l'URL d'inscription et le QR qui l'encode.
 *
 * C'est la SEULE source de l'URL publique d'inscription : les reponses admin
 * ne portent pas `registrationUrl` (il exposait l'hote SecureCheck), et la
 * reconstruire a la main depuis un token est interdit par le contrat. La
 * route rend 409 tant que l'evenement n'est pas publie : avant publication,
 * il n'existe aucune page d'inscription vers laquelle pointer.
 */
export async function recupererQrInscription(slug: string): Promise<QrInscription> {
  const reponse = await apiGet<{ data: QrInscription }>(
    `${CHEMIN_LISTE_ADMIN}/${encodeURIComponent(slug)}/registration-qr`,
  )
  return reponse.data
}

/**
 * Une ligne de la feuille de presence.
 *
 * `hasCheckedIn` dit si le porteur a pointe au moins une fois ;
 * `currentlyInside` s'il est sur place a l'instant de la lecture. Les deux
 * ne se deduisent pas l'un de l'autre : on peut avoir pointe puis etre
 * ressorti.
 */
export interface LignePresence {
  uidn: string
  fullName: string
  email: string | null
  hasCheckedIn: boolean
  /** Dernier pointage, ISO 8601, `null` si le porteur n'a jamais pointe. */
  checkInAt: string | null
  currentlyInside: boolean
  scansUsed: number
}

/**
 * Decompte servi avec chaque page de la feuille de presence.
 *
 * Calcule par le back sur TOUT le roster : il tient compte de `search` mais
 * pas de `present`, si bien que les cartes ne bougent pas quand on bascule
 * entre presents et absents. Ne pas le recalculer depuis la page affichee.
 */
export interface ResumePresence {
  totalPasses: number
  present: number
  currentlyInside: number
  absent: number
}

/**
 * Filtres partages par la feuille de presence et son export : l'export rend
 * exactement ce que l'ecran montre, filtres compris, sans la pagination.
 */
export interface FiltresPresence {
  search?: string
  /** `true` = a pointe au moins une fois, `false` = jamais ; absent = tous. */
  present?: boolean
}

function parametresPresence(filtres: FiltresPresence): URLSearchParams {
  const parametres = new URLSearchParams()
  const terme = filtres.search?.trim() ?? ''
  if (terme !== '') parametres.set('search', terme)
  if (filtres.present !== undefined) parametres.set('present', String(filtres.present))
  return parametres
}

export interface PagePresence {
  lignes: LignePresence[]
  pagination: Pagination
  resume: ResumePresence
}

export async function recupererPresence(
  slug: string,
  filtres: FiltresPresence = {},
  page = 1,
  limite = LIMITE_DEFAUT,
): Promise<PagePresence> {
  const parametres = parametresPresence(filtres)
  parametres.set('page', String(Math.max(1, Math.trunc(page))))
  parametres.set('limit', String(Math.min(LIMITE_MAX, Math.max(1, Math.trunc(limite)))))
  const reponse = await apiGet<{
    data: LignePresence[]
    pagination: Pagination
    summary: ResumePresence
  }>(`${CHEMIN_LISTE_ADMIN}/${encodeURIComponent(slug)}/attendance?${parametres}`)
  return { lignes: reponse.data, pagination: reponse.pagination, resume: reponse.summary }
}

export type FormatExport = 'csv' | 'xlsx'

/**
 * Telecharge la feuille de presence en fichier.
 *
 * Le jeton porteur est obligatoire sur cette route : pas de lien direct dans
 * un `<a href>`, on recupere les octets puis on les tend au navigateur par
 * une URL d'objet. Le nom de fichier fait autorite cote back, lu dans
 * `Content-Disposition` ; le jeu est complet (sans pagination), borne a
 * 10 000 lignes par le serveur.
 */
export function exporterPresence(
  slug: string,
  format: FormatExport,
  filtres: FiltresPresence = {},
): Promise<FichierServi> {
  const parametres = parametresPresence(filtres)
  parametres.set('format', format)
  return apiFichier(
    `${CHEMIN_LISTE_ADMIN}/${encodeURIComponent(slug)}/attendance/export?${parametres}`,
  )
}

/** Un invite tel que le formulaire l'envoie. `email` est facultatif. */
export interface InviteSaisi {
  firstName: string
  lastName: string
  email?: string
}

/** Bornes du lot, celles du back : de 1 a 500 invites par envoi. */
export const INVITES_MAX = 500

/**
 * Le pass emis pour un invite.
 *
 * Le credential releve par le back porte davantage de champs (status,
 * maxScans, rfidTag...) ; seuls ceux que l'ecran montre sont types ici.
 * `qr` est une data URL PNG, posable telle quelle dans un `<img src>`.
 */
export interface PassInvite {
  credential: {
    uidn: string
    holderName: string
    holderEmail: string | null
  }
  qr: string
}

export interface LotInvites {
  /** La fiche complete, rechargee par le back apres l'ajout. */
  event: EvenementAdmin
  /** Un pass par invite, dans l'ordre du tableau envoye. */
  passes: PassInvite[]
}

/**
 * Ajoute un lot d'invites et rend leurs pass.
 *
 * Cote SecureCheck le lot est tout ou rien : aucun invite n'est cree si le
 * lot est refuse (422 avec `message` seul). La validation locale du CMS rend
 * un 422 avec `errors` indexe par chemin d'entree (`guests.2.lastName`) : on
 * le range sous la ligne fautive avec `erreursDeChamp`. Un evenement annule
 * rend 422 de la meme facon.
 */
export async function ajouterInvites(slug: string, invites: InviteSaisi[]): Promise<LotInvites> {
  const reponse = await apiPost<{ data: LotInvites }>(
    `${CHEMIN_LISTE_ADMIN}/${encodeURIComponent(slug)}/guests`,
    { guests: invites },
  )
  return reponse.data
}

/** Bornes du logo, celles du contrat, verifiees avant tout aller-retour. */
export const TYPES_LOGO_ACCEPTES = ['image/png', 'image/jpeg', 'image/webp'] as const
export const TAILLE_LOGO_MAX = 2 * 1024 * 1024

/** Message d'un refus previsible du logo, ou `null` si le fichier passe. */
export function refusDuLogo(fichier: File): string | null {
  if (!TYPES_LOGO_ACCEPTES.includes(fichier.type as (typeof TYPES_LOGO_ACCEPTES)[number])) {
    return 'Formats acceptés : PNG, JPEG ou WebP.'
  }
  if (fichier.size > TAILLE_LOGO_MAX) {
    return 'Le logo ne doit pas dépasser 2 Mo.'
  }
  return null
}

interface PresignationLogo {
  uploadUrl: string
  key: string
}

/**
 * Televerse le logo d'un evenement, en deux temps.
 *
 * Le CMS ne recoit jamais les octets : `POST .../logo` presigne une URL de
 * televersement vers le stockage objet, et le navigateur y fait un `PUT`
 * direct. Ce `PUT` part SANS jeton porteur — l'URL presignee porte deja sa
 * propre signature, et le jeton ne doit jamais atteindre l'hote de stockage.
 *
 * Ce `PUT` direct exige que le domaine de l'ambassade figure dans le CORS du
 * seau (`docs/s3-cors.json` cote back) : une origine absente echoue dans le
 * navigateur alors que la meme requete passe en curl. D'ou le message dedie
 * sur l'echec reseau, qui distingue ce cas d'une panne du CMS.
 */
export async function televerserLogo(slug: string, fichier: File): Promise<void> {
  const reponse = await apiPost<{ data: PresignationLogo }>(
    `${CHEMIN_LISTE_ADMIN}/${encodeURIComponent(slug)}/logo`,
    { mimeType: fichier.type, size: fichier.size },
  )

  let depot: Response
  try {
    depot = await fetch(reponse.data.uploadUrl, {
      method: 'PUT',
      body: fichier,
      headers: { 'Content-Type': fichier.type },
    })
  } catch {
    throw new ApiError(
      "L'envoi vers le stockage a échoué : vérifiez la connexion, ou que le domaine de l'ambassade est autorisé sur le stockage.",
      0,
      null,
    )
  }
  if (!depot.ok) {
    throw new ApiError(`Le stockage a refusé l'image (erreur ${depot.status}).`, depot.status, null)
  }
}

/**
 * Recupere les octets du logo d'administration.
 *
 * `logoUrl` des reponses admin pointe vers une route protegee par le jeton
 * porteur : un `<img src>` direct reviendrait en 401. On passe donc par
 * `apiFichier` puis une URL d'objet. Un 404 signifie simplement « pas de
 * logo » et se rend `null`, pas en erreur.
 */
export async function recupererLogo(slug: string): Promise<Blob | null> {
  try {
    const fichier = await apiFichier(`${CHEMIN_LISTE_ADMIN}/${encodeURIComponent(slug)}/logo`)
    return fichier.blob
  } catch (souleve) {
    if (souleve instanceof ApiError && souleve.statut === 404) return null
    throw souleve
  }
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
