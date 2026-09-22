import { apiGet, apiUpload, ApiError, genreErreur, type GenreErreur } from './client'

/**
 * Surface visiteur du rendez-vous de CHANCELLERIE.
 *
 * Deux rendez-vous coexistent et ne se ressemblent pas. Le **consulaire**
 * — passeport, visa, etat civil, legalisation — se prend exclusivement sur
 * Express54, presente en bloc `platform` sur la page des services : aucune
 * route d'ici ne le sert. Le **chancellerie** — voir l'Ambassadeur ou son
 * secretariat — est une visite physique avec controle a l'entree, servie par
 * Ambassade Secure.
 *
 * Le CMS n'est qu'un relais : il n'ecrit aucune donnee personnelle de
 * visiteur dans sa base, et le front ne parle jamais a Ambassade Secure
 * directement — il n'en connait ni l'hote ni le jeton. Il n'existe donc
 * **aucune surface d'administration** : une demande creee n'est plus jamais
 * relisible depuis le CMS.
 */

/** Un service du poste, tel que le GET le propose. */
export interface DepartementRdv {
  slug: string
  name: string
}

/** Ce que la resolution par domaine rend, et rien d'autre. */
export interface ServiceRdv {
  name: string
  departments: DepartementRdv[]
}

/**
 * Etats d'une demande, tels que SecureCheck les nomme.
 *
 * A la creation, seul `pending` apparait : les cinq autres sont des
 * transitions faites dans Ambassade Secure, que le CMS n'expose pas. Ils sont
 * traduits quand meme — un code anglais affiche brut est la faute deja
 * commise une fois sur les etats d'evenement.
 */
export type StatutRdv =
  | 'pending'
  | 'approved'
  | 'rejected'
  | 'cancelled'
  | 'checked_in'
  | 'checked_out'

const LIBELLES_STATUT: Record<StatutRdv, string> = {
  pending: 'En attente de confirmation',
  approved: 'Confirmée',
  rejected: 'Refusée',
  cancelled: 'Annulée',
  checked_in: 'Visiteur arrivé',
  checked_out: 'Visite terminée',
}

/** Libelle francais d'un etat, ou un repli neutre pour un code inconnu. */
export function libelleStatut(statut: string): string {
  return LIBELLES_STATUT[statut as StatutRdv] ?? 'État inconnu'
}

/**
 * Les six cles de la reponse 201, liste blanche fermee cote back.
 *
 * `scheduledAt` porte un suffixe `Z` qu'il n'a pas merite : l'amont construit
 * la date sans fuseau, elle est donc interpretee dans celui du serveur
 * SecureCheck avant d'etre serialisee en UTC. **Ne jamais la reformater dans
 * le fuseau du navigateur** — un visiteur parisien qui demande 10:30 lirait
 * 12:30. Le recapitulatif affiche la date et l'heure saisies.
 */
export interface RendezVousCree {
  reference: string
  status: string
  scheduledAt: string
  department: DepartementRdv | null
  purpose: string
  host: string | null
}

/** Ce que le formulaire recueille, aux noms de SecureCheck. */
export interface DemandeRendezVous {
  firstName: string
  lastName: string
  phone: string
  email: string
  /** `AAAA-MM-JJ`. */
  date: string
  /** `HH:MM`. */
  time: string
  purpose: string
  host?: string
  departmentSlug?: string
  idNumber?: string
  idCardFront?: File
  idCardBack?: File
}

interface Enveloppe<T> {
  data: T
}

const MESSAGES_DE_REPLI: Record<GenreErreur, string> = {
  // Un 404 ne dit pas lequel des trois cas s'est produit : module ferme,
  // ambassade sans entreprise en amont, ou `departmentSlug` inconnu. Aucun
  // n'est corrigeable par le visiteur, et le texte du serveur
  // (« Ressource introuvable. ») ne lui apprendrait rien.
  introuvable: 'Le service est momentanément indisponible. Réessayez dans un instant.',
  impossible: "Ce créneau n'est plus disponible.",
  saisie:
    "L'ambassade n'a pas pu enregistrer cette demande. Vérifiez la date et l'heure demandées, puis réessayez.",
  trop_de_requetes: 'Trop de tentatives. Patientez un instant avant de réessayer.',
  // 502 est le fourre-tout du relais : tout ce que l'amont rend hors des
  // quatre statuts normalises finit la, jamais un 500 ni un statut exotique.
  panne: 'Le service est momentanément indisponible. Réessayez dans un instant.',
}

/**
 * Vrai si la reponse porte le sac `errors` de Laravel.
 *
 * C'est ce qui distingue les DEUX 422 de cette route, et c'est la seule
 * subtilite du lot. Un 422 de **validation du CMS** porte les messages
 * francais champ par champ — « La date demandée ne peut pas être dans le
 * passé. » — que le client agrege deja dans `message`. Un 422 **relaye**
 * depuis Ambassade Secure ne porte qu'un `message` generique du CMS
 * (« Données refusées par le service Ambassade Secure. ») : le corps amont
 * est jete a dessein, puisqu'il renverrait les champs soumis, donc les
 * donnees personnelles du visiteur. Ce texte-la n'aide personne a corriger
 * quoi que ce soit, et ne doit pas s'afficher sous un formulaire.
 */
function porteLeDetailParChamp(souleve: ApiError): boolean {
  const corps = souleve.corps
  if (corps === null || typeof corps !== 'object' || !('errors' in corps)) return false
  const erreurs = (corps as { errors: unknown }).errors
  return erreurs !== null && typeof erreurs === 'object' && Object.keys(erreurs).length > 0
}

/**
 * Message affichable d'une erreur.
 *
 * Le `message` du serveur n'est repris que lorsqu'il apprend quelque chose :
 * le detail par champ d'une validation du CMS. Partout ailleurs, le texte
 * rendu est generique par construction, et l'un des notres dit au moins quoi
 * faire ensuite.
 */
export function messageErreurRdv(souleve: unknown): string {
  if (souleve instanceof ApiError && porteLeDetailParChamp(souleve)) return souleve.message
  return MESSAGES_DE_REPLI[genreErreur(souleve)]
}

/** Resout l'ambassade par le domaine et rend ses services. */
export async function recupererServiceRdv(): Promise<ServiceRdv> {
  const reponse = await apiGet<Enveloppe<ServiceRdv>>('/api/secure/rdv')
  return reponse.data
}

/**
 * Depose une demande de rendez-vous.
 *
 * Toujours en `multipart/form-data`, meme sans piece jointe : les deux
 * encodages sont acceptes, mais l'ecran propose toujours les deux faces de la
 * piece d'identite, et deux chemins selon qu'un fichier est present ou non
 * seraient deux chemins a eprouver pour un gain nul.
 *
 * Le multipart n'a ni booleen ni `null` : tout y est chaine. Un champ
 * facultatif laisse vide est donc **omis**, jamais envoye en chaine vide — le
 * CMS retire les cles nulles avant de relayer, il ne devine pas qu'une chaine
 * vide voulait dire « absent ».
 */
export async function demanderRendezVous(demande: DemandeRendezVous): Promise<RendezVousCree> {
  const formulaire = new FormData()
  for (const [cle, valeur] of Object.entries(demande)) {
    if (valeur instanceof File) {
      formulaire.append(cle, valeur)
      continue
    }
    if (typeof valeur !== 'string' || valeur.trim() === '') continue
    formulaire.append(cle, valeur)
  }

  const reponse = await apiUpload<Enveloppe<RendezVousCree>>('/api/secure/rdv', formulaire)
  return reponse.data
}
