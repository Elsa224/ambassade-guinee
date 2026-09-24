import { apiGet, apiPatch, apiFichier, ApiError, genreErreur, type GenreErreur } from './client'
import type { Pagination } from '@/components/ui/pagination'
import type { DepartementRdv } from './rendez-vous'

/**
 * Surface de CONSULTATION des rendez-vous de chancellerie.
 *
 * Le contrat qui fait autorite est `docs/contrat-rendez-vous-admin.md` DANS LE
 * DEPOT BACK : en cas d'ecart, c'est lui qui tranche, pas ce fichier.
 *
 * Le CMS ne stocke toujours aucun rendez-vous. Ces cinq routes relaient
 * SecureCheck et reconstruisent la reponse champ par champ, sur liste
 * blanche. Trois consequences portent tout le lot :
 *
 *  - **Les pieces d'identite ne traversent jamais la liste.** En amont elles
 *    y sont, en data-URL base64 pouvant peser une dizaine de megaoctets par
 *    face ; le CMS les remplace par `hasIdCardFront` et `hasIdCardBack`, et
 *    n'en sert une qu'a la demande, sur geste explicite de l'agent.
 *  - **Afficher UNE demande coute une requete de liste complete en amont**,
 *    pieces comprises : SecureCheck n'expose aucune route de detail pour le
 *    personnel. Jamais de rafraichissement en boucle, jamais de
 *    prechargement.
 *  - **`scheduledAt` se transmet tel quel.** Voir `presentation.ts` de
 *    l'ecran : le reformater dans le fuseau du navigateur montrerait a
 *    l'agent une autre heure qu'au visiteur.
 */

/** Prefixe des cinq routes, garde par `role:admin,agent_rdv` cote back. */
export const CHEMIN_RDV_ADMIN = '/api/admin/secure/rdv'

/** Nombre de lignes par defaut, celui du back. */
export const LIMITE_DEFAUT = 20

/**
 * Etats qu'une demande peut reellement porter.
 *
 * `cancelled` est declare en amont mais n'est JAMAIS assigne, et aucune route
 * n'annule un rendez-vous : il n'a sa place ni dans un filtre ni dans une
 * legende. Un etat inconnu reste possible — l'amont peut en ajouter — et
 * l'ecran le presente sans le traduire plutot que de le taire.
 */
export type StatutRdvAdmin = 'pending' | 'approved' | 'rejected' | 'checked_in' | 'checked_out'

/** Le visiteur, tel que l'amont le nomme. */
export interface VisiteurRdv {
  firstName: string
  lastName: string
  email: string | null
  phone: string | null
  idNumber: string | null
}

/**
 * Une ligne de liste, et aussi la forme du detail : le back sert exactement
 * les memes champs sur les deux routes.
 */
export interface RendezVousAdmin {
  reference: string
  status: string
  kind: string | null
  /** Horodatage a afficher TEL QUEL, jamais remis dans un fuseau. */
  scheduledAt: string
  department: DepartementRdv | null
  purpose: string | null
  host: string | null
  visitor: VisiteurRdv
  /** Une piece existe-t-elle ? Les octets, eux, se demandent un a un. */
  hasIdCardFront: boolean
  hasIdCardBack: boolean
  rejectionReason: string | null
  checkInAt: string | null
  checkOutAt: string | null
  durationMinutes: number | null
  createdAt: string
  /** Data-URL du QR, renseignee UNIQUEMENT par la reponse d'approbation. */
  qr: string | null
}

/** Ce que l'ecran peut demander a l'amont, et rien de plus. */
export interface FiltresRdv {
  page?: number
  limit?: number
  status?: string
  kind?: string
  /** `AAAA-MM-JJ`. */
  from?: string
  /** `AAAA-MM-JJ`. */
  to?: string
  /** Cherche dans le prenom, le nom, le courriel et la reference. */
  search?: string
}

export interface PageRendezVous {
  rendezVous: RendezVousAdmin[]
  pagination: Pagination
}

interface Enveloppe<T> {
  data: T
  meta?: Partial<Pagination>
}

function pagination(
  meta: Partial<Pagination> | undefined,
  page: number,
  limite: number,
): Pagination {
  const total = meta?.total ?? 0
  return {
    page: meta?.page ?? page,
    limit: meta?.limit ?? limite,
    total,
    totalPages: meta?.totalPages ?? Math.max(1, Math.ceil(total / Math.max(1, limite))),
  }
}

/**
 * Une reference est bornee a `[A-Za-z0-9_-]+` cote route, et ce n'est pas
 * cosmetique : le CMS la passe a l'amont dans `q`, que SecureCheck lit comme
 * une EXPRESSION REGULIERE. `encodeURIComponent` est la ceinture du front ;
 * la borne de route est la bretelle du back.
 */
function segment(reference: string): string {
  return encodeURIComponent(reference)
}

/** Liste paginee, filtree par l'amont. */
export async function listerRendezVous(filtres: FiltresRdv = {}): Promise<PageRendezVous> {
  const page = filtres.page ?? 1
  const limite = filtres.limit ?? LIMITE_DEFAUT

  const parametres = new URLSearchParams({ page: String(page), limit: String(limite) })
  for (const cle of ['status', 'kind', 'from', 'to', 'search'] as const) {
    const valeur = filtres[cle]
    // Un filtre vide est OMIS, jamais envoye en chaine vide : l'amont
    // comparerait `status=''` a ses etats et ne rendrait plus rien.
    if (typeof valeur === 'string' && valeur.trim() !== '') parametres.set(cle, valeur.trim())
  }

  const reponse = await apiGet<Enveloppe<RendezVousAdmin[]>>(
    `${CHEMIN_RDV_ADMIN}?${parametres.toString()}`,
  )
  return { rendezVous: reponse.data, pagination: pagination(reponse.meta, page, limite) }
}

/**
 * Une demande.
 *
 * Coute en amont une requete de liste complete : a n'appeler que sur geste,
 * et jamais en boucle de rafraichissement.
 */
export async function recupererRendezVous(reference: string): Promise<RendezVousAdmin> {
  const reponse = await apiGet<Enveloppe<RendezVousAdmin>>(
    `${CHEMIN_RDV_ADMIN}/${segment(reference)}`,
  )
  return reponse.data
}

/** Les deux faces d'une piece d'identite. */
export type FacePiece = 'recto' | 'verso'

/**
 * Sert une face de la piece d'identite.
 *
 * Le back la rend en `private, no-store` : ces octets ne doivent rester ni
 * dans un cache, ni dans un store, ni dans une URL d'objet qui survivrait a
 * la fermeture du panneau. L'appelant est tenu de revoquer l'URL qu'il en
 * fabrique. La route est bornee a 30 appels par minute, parce que chacun
 * retelecharge la liste filtree en amont pour n'en servir qu'une face.
 */
export async function recupererPiece(reference: string, face: FacePiece): Promise<Blob> {
  const servi = await apiFichier(`${CHEMIN_RDV_ADMIN}/${segment(reference)}/piece/${face}`)
  return servi.blob
}

/**
 * Approuve une demande. **Irreversible** : l'amont genere le QR du visiteur
 * et le lui envoie par courriel.
 *
 * La reponse porte la demande a jour, et c'est le seul chemin ou `qr` est
 * renseigne. Le corps vide est `{}` et non rien : le contrat dit « sans
 * corps », et un objet vide est ce que le client sait envoyer sans cas
 * particulier — le back ne lit aucun champ ici.
 */
export async function approuverRendezVous(reference: string): Promise<RendezVousAdmin> {
  const reponse = await apiPatch<Enveloppe<RendezVousAdmin>>(
    `${CHEMIN_RDV_ADMIN}/${segment(reference)}/approve`,
    {},
  )
  return reponse.data
}

/** Longueur maximale du motif de refus, celle que le back valide. */
export const MOTIF_MAXIMUM = 500

/**
 * Refuse une demande, avec un motif obligatoire.
 *
 * Le motif est valide ici AVANT l'appel, comme le back le fait de son cote :
 * SecureCheck refuse un refus sans motif par un 400 que le CMS normalise en
 * 422 generique, ou l'agent ne saurait pas quel champ manque.
 */
export async function refuserRendezVous(
  reference: string,
  motif: string,
): Promise<RendezVousAdmin> {
  const reponse = await apiPatch<Enveloppe<RendezVousAdmin>>(
    `${CHEMIN_RDV_ADMIN}/${segment(reference)}/reject`,
    { reason: motif },
  )
  return reponse.data
}

/** Refus local du motif, ou chaine vide s'il convient. */
export function refusDuMotif(motif: string): string {
  const propre = motif.trim()
  if (propre === '') return 'Indiquez le motif du refus : le visiteur le recevra tel quel.'
  if (propre.length > MOTIF_MAXIMUM) {
    return `Le motif ne peut pas depasser ${MOTIF_MAXIMUM} caracteres.`
  }
  return ''
}

/**
 * Messages de repli, par nature d'echec.
 *
 * Les corps d'erreur de SecureCheck ne sont jamais relayes par le back — ils
 * porteraient des identifiants Mongo, une trace de pile ou les champs soumis,
 * donc les donnees personnelles du visiteur. Ce qui arrive ici est deja un
 * message francais du CMS, generique par construction : l'un des notres dit
 * au moins quoi faire ensuite.
 */
const MESSAGES_DE_REPLI: Record<GenreErreur, string> = {
  introuvable: "Cette demande n'existe plus, ou le module n'est pas activé pour cette ambassade.",
  impossible: "Vous n'avez pas accès à la consultation des rendez-vous.",
  saisie: "Cette demande n'est plus en attente : elle a déjà été traitée.",
  trop_de_requetes: 'Trop de consultations en peu de temps. Patientez un instant.',
  // 502 est le fourre-tout du relais. Sur une ambassade dont le compte de
  // service SecureCheck n'est pas renseigne, TOUS les appels finissent ici
  // des le premier : c'est la premiere chose a verifier avant de soupconner
  // l'ecran.
  panne: 'Le service Ambassade Secure est momentanément injoignable. Réessayez dans un instant.',
}

/** Message affichable d'un echec de cette surface. */
export function messageErreurRdvAdmin(souleve: unknown): string {
  if (souleve instanceof ApiError && souleve.statut === 403) return MESSAGES_DE_REPLI.impossible
  return MESSAGES_DE_REPLI[genreErreur(souleve)]
}
