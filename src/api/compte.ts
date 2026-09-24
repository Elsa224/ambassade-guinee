import { apiGet, apiPatch, apiPost, ApiError } from './client'

/**
 * Le compte connecte : son identite, et son mot de passe.
 *
 * Surface confirmee par la session du CMS back le 2026-09-17, contre son
 * code et non contre une documentation. Les messages de refus sont servis en
 * francais, directement presentables : le front ne les reecrit pas.
 */

/** Le compte tel que `/auth/me` le sert. */
export interface Compte {
  id: number
  name: string
  email: string
  role: string
  /** `null` pour un `super_admin`, qui n'est rattache a aucune ambassade. */
  embassy_id: number | null
  /** Derniere connexion, ou `null` si le back ne l'a pas encore vue. */
  last_login_at: string | null
  /**
   * Date du dernier changement de mot de passe.
   *
   * `null` tant qu'il n'a pas change depuis la mise en service : le back ne
   * remplit RIEN retroactivement, parce qu'ecrire la date de la migration
   * affirmerait un changement qui n'a pas eu lieu. L'ecran n'affiche donc
   * rien dans ce cas, plutot qu'une date fausse.
   */
  password_changed_at: string | null
}

interface EnveloppeCompte {
  user: Compte
}

export async function recupererCompte(): Promise<Compte> {
  const reponse = await apiGet<EnveloppeCompte>('/api/auth/me')
  return reponse.user
}

/**
 * Modifie son propre compte.
 *
 * Un seul champ modifiable : le nom. `email`, `role` et `embassy_id` sont
 * refuses en 422 par le back, jamais ignores en silence — un enregistrement
 * qui reussit sans rien changer est pire qu'un refus.
 */
export async function modifierCompte(name: string): Promise<Compte> {
  const reponse = await apiPatch<EnveloppeCompte>('/api/auth/me', { name })
  return reponse.user
}

export interface ChangementMotDePasse {
  current_password: string
  password: string
  password_confirmation: string
}

/** Longueur minimale, et seule regle de robustesse : elle vient du back. */
export const LONGUEUR_MOT_DE_PASSE = 8

/**
 * Les quatre roles que le back sert, et il n'y en a pas d'autres.
 *
 * Releves dans son enumeration le 2026-09-17 : `admin`, `super_admin`,
 * `editeur` ; `agent_rdv` s'y est ajoute le 2026-09-24 avec la consultation
 * des rendez-vous. Il n'existe AUCUN role en lecture seule — le contrat des roles
 * le refuse explicitement, et une premiere version de ce gabarit en citait
 * un, ce qui aurait donne une condition morte dans un ecran.
 *
 * Un role inconnu est rendu TEL QUEL plutot que masque : mieux vaut montrer
 * un mot inattendu que cacher un role que le front ne connaissait pas
 * encore. C'est ce repli qui a rendu « scheduled » visible sur les
 * evenements, et c'est comme cela que le defaut a ete trouve.
 */
const LIBELLES_ROLE: Record<string, string> = {
  admin: 'Administrateur',
  editeur: 'Éditeur',
  super_admin: 'Super administrateur',
  agent_rdv: 'Agent rendez-vous',
}

export function libelleRole(role: string): string {
  return LIBELLES_ROLE[role] ?? role
}

/**
 * Change son mot de passe.
 *
 * Deux effets tranches par Elsa le 2026-09-17 et implementes cote back :
 * tous les jetons sont revoques SAUF celui en cours — le poste courant reste
 * connecte, les autres tombent en 401 a leur prochain appel — et un courriel
 * part a l'adresse du compte.
 */
export function changerMotDePasse(changement: ChangementMotDePasse): Promise<void> {
  return apiPost('/api/auth/password', changement)
}

/**
 * Message affichable d'un echec.
 *
 * Le back sert un `message` en francais directement presentable ; le repli ne
 * couvre que les cas ou aucune reponse n'est parvenue, et le 429, que le
 * serveur borne a cinq appels par minute sur le changement de mot de passe.
 */
export function messageErreurCompte(souleve: unknown): string {
  if (souleve instanceof ApiError) {
    if (souleve.statut === 429) {
      return 'Trop de tentatives. Patientez une minute avant de réessayer.'
    }
    if (souleve.statut !== 0 && souleve.message.trim() !== '') return souleve.message
  }
  return 'Serveur injoignable. Réessayez dans un instant.'
}

/** « 17 septembre 2026 », ou `null` si la valeur est absente ou illisible. */
export function dateLisible(valeur: string | null): string | null {
  if (valeur === null || valeur === '') return null
  const date = new Date(valeur)
  if (Number.isNaN(date.getTime())) return null
  return new Intl.DateTimeFormat('fr-FR', {
    day: 'numeric',
    month: 'long',
    year: 'numeric',
  }).format(date)
}
