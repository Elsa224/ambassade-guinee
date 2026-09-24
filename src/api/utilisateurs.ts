import { apiDelete, apiGet, apiPatch, apiPost } from './client'

/**
 * Les comptes de l'ambassade.
 *
 * Surface relevee le 2026-09-17 dans le code du back (`UserController`,
 * `GardesUtilisateur`, `StoreUserRequest`, `UpdateUserRequest`) et non dans
 * une documentation : c'est la lecon des etats d'evenement, ou un contrat
 * annoncait trois valeurs dont deux n'existaient nulle part.
 *
 * L'ambassade est resolue par le COMPTE authentifie, jamais par le domaine :
 * ces routes ne portent donc aucun parametre d'ambassade, et un administrateur
 * ne voit que les comptes de son poste. `super_admin` n'apparait dans aucune
 * liste — il n'est rattache a aucune ambassade, donc il sort de la requete par
 * construction.
 */

/** Un compte tel que `UserResource` le sert. */
export interface CompteAdmin {
  id: number
  name: string
  email: string
  /** `admin` ou `editeur`. `super_admin` ne figure jamais dans la liste. */
  role: string
  /** `actif` ou `suspendu`, en francais et en minuscules. */
  status: string
  /** `null` quand le compte ne s'est jamais connecte. */
  last_login_at: string | null
  created_at: string
}

/**
 * La pagination du back, telle qu'il la sert.
 *
 * Le contrat du front demandait une liste nue — une ambassade a une poignee de
 * comptes. Le back pagine quand meme, et il a eu raison de le dire : lire
 * `data` comme la liste entiere aurait cache les comptes au-dela du
 * vingt-cinquieme sans qu'aucun ecran ne s'en plaigne.
 */
export interface MetaComptes {
  current_page: number
  last_page: number
  per_page: number
  total: number
}

export interface PageDeComptes {
  comptes: CompteAdmin[]
  meta: MetaComptes
}

interface EnveloppeListe {
  data: CompteAdmin[]
  meta?: Partial<MetaComptes>
}

/**
 * Une invitation emise.
 *
 * `url` n'est presente QUE si le courriel n'est pas parti (`sent: false`) :
 * c'est un jeton en clair, et le back refuse de le faire circuler quand la
 * boite de l'interesse l'a deja recu. L'ecran affiche donc le lien dans ce
 * cas-la seulement, et il n'y a rien a montrer dans l'autre.
 */
export interface Invitation {
  url?: string
  expires_at: string
  sent: boolean
}

interface EnveloppeCompte {
  data: CompteAdmin
  invitation?: Invitation
}

/** Ce que le back accepte a la creation. Aucun mot de passe : voir plus bas. */
export interface NouveauCompte {
  name: string
  email: string
  role: string
}

/** Fusion, pas remplacement : un champ absent n'est pas touche. */
export interface ModificationCompte {
  name?: string
  email?: string
  role?: string
}

/**
 * Les trois roles attribuables depuis une ambassade.
 *
 * `super_admin` est absent a dessein : le back le refuse en **403**, avec un
 * message explicite, a la creation comme a la modification. Un champ hors de
 * portee se refuse, il ne s'escamote pas — meme precedent que `slug`,
 * `domain` et `modules` dans les parametres.
 *
 * `agent_rdv` a rejoint la liste le 2026-09-24, quand le back l'a livre dans
 * `UserRole::attribuables()`. Il n'y figurait pas avant, et c'etait voulu :
 * un role propose ici que le back ignore se refuse a l'enregistrement, sans
 * que l'ecran sache dire pourquoi.
 */
export const ROLES_ATTRIBUABLES = [
  { valeur: 'editeur', libelle: 'Éditeur', resume: 'Publie le contenu du site.' },
  {
    valeur: 'agent_rdv',
    libelle: 'Agent rendez-vous',
    resume: "Les demandes de rendez-vous, et rien d'autre.",
  },
  {
    valeur: 'admin',
    libelle: 'Administrateur',
    resume: 'Le contenu, les paramètres du poste et les comptes.',
  },
] as const

/** Les deux etats de compte, tels que le back les applique. */
export const STATUT_ACTIF = 'actif'
export const STATUT_SUSPENDU = 'suspendu'

export interface EtatDuCompte {
  libelle: string
  ton: 'positif' | 'neutre' | 'attention' | 'eteint'
}

/**
 * Le libelle et le ton d'un etat de compte.
 *
 * Un etat inconnu est rendu TEL QUEL, sur un ton eteint, plutot que masque ou
 * traduit de force : c'est ce repli qui a rendu « scheduled » visible sur les
 * evenements, et c'est comme cela que le defaut a ete trouve.
 */
export function etatDuCompte(statut: string): EtatDuCompte {
  if (statut === STATUT_ACTIF) return { libelle: 'Actif', ton: 'positif' }
  if (statut === STATUT_SUSPENDU) return { libelle: 'Suspendu', ton: 'attention' }
  return { libelle: statut, ton: 'eteint' }
}

/** Le back borne `per_page` a 100, et refuse au-dela en 422. */
export const COMPTES_PAR_PAGE_MAX = 100

export async function listerComptes(page = 1, parPage = 20): Promise<PageDeComptes> {
  const limite = Math.min(Math.max(1, Math.trunc(parPage)), COMPTES_PAR_PAGE_MAX)
  const reponse = await apiGet<EnveloppeListe>(`/api/admin/users?page=${page}&per_page=${limite}`)
  const comptes = Array.isArray(reponse.data) ? reponse.data : []
  return {
    comptes,
    meta: {
      current_page: reponse.meta?.current_page ?? page,
      last_page: reponse.meta?.last_page ?? 1,
      per_page: reponse.meta?.per_page ?? limite,
      total: reponse.meta?.total ?? comptes.length,
    },
  }
}

export interface CompteEtInvitation {
  compte: CompteAdmin
  invitation?: Invitation
}

/**
 * Cree un compte, sans mot de passe.
 *
 * Un mot de passe choisi par l'administrateur transite par son ecran, son
 * presse-papiers et probablement un message de messagerie instantanee ; le
 * back le refuse d'ailleurs explicitement (`password` est `prohibited`). Le
 * compte nait donc **suspendu**, et le serveur emet une invitation : la
 * personne pose elle-meme son mot de passe, ce qui active le compte.
 */
export async function creerCompte(nouveau: NouveauCompte): Promise<CompteEtInvitation> {
  const reponse = await apiPost<EnveloppeCompte>('/api/admin/users', nouveau)
  return { compte: reponse.data, invitation: reponse.invitation }
}

/**
 * Modifie un compte.
 *
 * Une invitation peut revenir dans la reponse : changer l'adresse d'un compte
 * jamais active invalide l'ancien lien, envoye a l'ancienne adresse, et en
 * emet un nouveau. L'ecran doit donc savoir l'afficher ici aussi, et pas
 * seulement a la creation.
 */
export async function modifierCompteAdmin(
  id: number,
  modification: ModificationCompte,
): Promise<CompteEtInvitation> {
  const reponse = await apiPatch<EnveloppeCompte>(`/api/admin/users/${id}`, modification)
  return { compte: reponse.data, invitation: reponse.invitation }
}

/**
 * Suspend ou reactive un compte.
 *
 * La suspension coupe l'acces sur-le-champ cote back : les jetons ouverts sont
 * revoques et l'invitation en attente est supprimee. Une reactivation ne rend
 * donc pas son acces a un compte jamais active — il faut lui renvoyer une
 * invitation, et l'ecran le dit.
 */
export async function changerStatutCompte(id: number, statut: string): Promise<CompteAdmin> {
  const reponse = await apiPatch<EnveloppeCompte>(`/api/admin/users/${id}/status`, {
    status: statut,
  })
  return reponse.data
}

export function supprimerCompte(id: number): Promise<void> {
  return apiDelete(`/api/admin/users/${id}`)
}

/**
 * Renvoie une invitation, ou la regenere apres expiration.
 *
 * L'ancien lien cesse de valoir. Le back refuse le renvoi sur un compte
 * suspendu par decision d'un administrateur — honorer une invitation pose un
 * mot de passe, ce qui n'a jamais eu vocation a lever une sanction — mais
 * `suspended_at` n'est pas servi : le front ne peut donc pas distinguer un
 * compte jamais active d'un compte sanctionne, et il n'essaie pas de le
 * deviner. Le geste est offert, et le serveur refuse avec son message.
 */
export async function renvoyerInvitation(id: number): Promise<CompteEtInvitation> {
  const reponse = await apiPost<EnveloppeCompte>(`/api/admin/users/${id}/invitation`, {})
  return { compte: reponse.data, invitation: reponse.invitation }
}
