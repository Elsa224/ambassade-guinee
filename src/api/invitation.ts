import { ApiError, apiGet, apiPost } from './client'
import type { Utilisateur } from '@/stores/auth'

/**
 * L'invitation, cote personne invitee.
 *
 * Ces deux routes sont **publiques** : elles s'appellent sans jeton, puisque
 * c'est precisement le moment ou la personne n'en a pas encore. Le lien lui
 * arrive par courriel, et il pointe le site de son ambassade — le back
 * construit l'URL sur le domaine du compte invite (`INVITATION_PATH`, dont la
 * valeur par defaut est `/invitation/{token}`), jamais sur l'en-tete `Host` de
 * la requete. Le chemin de la route du front doit donc y correspondre
 * exactement, comme celui du QR d'inscription aux evenements.
 */

/** De quoi accueillir la personne par son nom, et rien d'autre. */
export interface Invitee {
  name: string
  email: string
}

interface EnveloppeInvitee {
  data: Invitee
}

/** Ce que rend l'acceptation : une session ouverte, comme une connexion. */
export interface SessionOuverte {
  token: string
  user: Utilisateur
}

/**
 * Lit l'invitation.
 *
 * Le back rend **le meme 404** pour un jeton inconnu, deja consomme ou
 * expire : distinguer les cas transformerait la route en oracle permettant de
 * tester des jetons. Le front n'a donc qu'un message a ecrire pour les trois,
 * et il ne pretend pas savoir lequel s'applique.
 */
export async function recupererInvitation(jeton: string): Promise<Invitee> {
  const reponse = await apiGet<EnveloppeInvitee>(
    `/api/auth/invitation/${encodeURIComponent(jeton)}`,
  )
  return reponse.data
}

/**
 * Honore l'invitation en posant un mot de passe, et ouvre la session.
 *
 * La personne arrive avec son mot de passe et repart connectee : lui demander
 * de se reconnecter juste apres l'avoir choisi n'ajouterait qu'une occasion de
 * se tromper.
 */
export function accepterInvitation(
  jeton: string,
  motsDePasse: { password: string; password_confirmation: string },
): Promise<SessionOuverte> {
  return apiPost<SessionOuverte>(`/api/auth/invitation/${encodeURIComponent(jeton)}`, motsDePasse)
}

/**
 * Message affichable d'un echec d'invitation.
 *
 * Le 404 est le seul cas ou le front ecrit le texte : le back y repond par un
 * refus generique, sans message presentable, et c'est voulu. Partout ailleurs
 * — les refus de mot de passe, la limite d'appels — le serveur sert un
 * francais directement lisible, qu'on ne reecrit pas.
 */
export function messageErreurInvitation(souleve: unknown): string {
  if (souleve instanceof ApiError) {
    if (souleve.statut === 404) {
      return "Ce lien n'est plus valable. Demandez à votre administrateur de vous en envoyer un nouveau."
    }
    if (souleve.statut === 429) {
      return 'Trop de tentatives. Patientez une minute avant de réessayer.'
    }
    if (souleve.statut !== 0 && souleve.message.trim() !== '') return souleve.message
  }
  return 'Serveur injoignable. Réessayez dans un instant.'
}
