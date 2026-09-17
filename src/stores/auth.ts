import { defineStore } from 'pinia'
import { ref, computed } from 'vue'
import { apiGet, apiPost, setAuthToken, ApiError } from '@/api/client'

/**
 * Administrateur du back-office (spec 4.3).
 *
 * Le champ du nom s'appelle `name` et non `nom`. La nuance a coute : le front
 * lisait `nom`, que le back n'a jamais servi — `AuthController::userPayload()`
 * rend `name` a la connexion comme sur `/auth/me`. Le faux serveur local avait
 * invente `nom`, les tests l'avaient recopie, et le nom de l'administrateur
 * connecte ne s'est jamais affiche en production : le gabarit se rabattait
 * silencieusement sur « Administrateur ». Releve le 2026-09-17, contre le code
 * du back et non contre le bouchon.
 */
export interface Utilisateur {
  id: number
  name: string
  email: string
  role: string
  /** `null` pour un `super_admin`, qui n'est rattache a aucune ambassade. */
  embassy_id: number | null
}

interface ReponseConnexion {
  token: string
  user: Utilisateur
}

/**
 * `/auth/me` rend le compte ET l'ambassade a laquelle il est rattache. Le
 * store ne retient que le compte : la configuration du site vient du
 * bootstrap, resolu par le DOMAINE, et en retenir une seconde copie resolue
 * par le COMPTE ouvrirait deux verites sur la meme ambassade.
 */
interface ReponseSession {
  user: Utilisateur
}

/** Clef de persistance du jeton porteur Sanctum. */
const CLEF_JETON = 'cms_token'

export const useAuthStore = defineStore('auth', () => {
  const token = ref<string | null>(null)
  const utilisateur = ref<Utilisateur | null>(null)
  const chargement = ref(false)
  const erreur = ref<string | null>(null)

  const estAuthentifie = computed(() => token.value !== null)

  /**
   * L'aller-retour d'identite en cours, quand il y en a un.
   *
   * Les gardes de route en dependent : une garde de role posee avant que
   * `/auth/me` ait repondu ne sait pas qui elle a en face, et renverrait un
   * administrateur hors de ses propres parametres au moindre rechargement.
   */
  const attenteIdentite = ref<Promise<void> | null>(null)

  function enregistrerJeton(valeur: string | null): void {
    token.value = valeur
    setAuthToken(valeur)
    if (valeur === null) {
      localStorage.removeItem(CLEF_JETON)
    } else {
      localStorage.setItem(CLEF_JETON, valeur)
    }
  }

  /**
   * Ouvre une session a partir d'un jeton deja obtenu.
   *
   * Deux chemins y arrivent : la connexion par mot de passe, et l'acceptation
   * d'une invitation, qui rend exactement la meme paire `{ token, user }`. La
   * personne invitee repart donc connectee, sans avoir a se reconnecter juste
   * apres avoir choisi son mot de passe.
   */
  function ouvrirSession(jeton: string, compte: Utilisateur): void {
    enregistrerJeton(jeton)
    utilisateur.value = compte
    attenteIdentite.value = null
  }

  /** Rend true si la connexion a réussi ; le message d'erreur reste dans `erreur`. */
  async function login(email: string, password: string): Promise<boolean> {
    chargement.value = true
    erreur.value = null
    try {
      const reponse = await apiPost<ReponseConnexion>('/api/auth/login', { email, password })
      ouvrirSession(reponse.token, reponse.user)
      return true
    } catch (souleve) {
      erreur.value =
        souleve instanceof ApiError && souleve.statut !== 0
          ? souleve.message
          : 'Serveur injoignable. Réessayez dans un instant.'
      return false
    } finally {
      chargement.value = false
    }
  }

  /**
   * Déconnecte l'administrateur. La session locale est effacée même si l'appel
   * serveur échoue : laisser un jeton actif dans le navigateur après un clic
   * sur « se déconnecter » serait pire qu'un jeton orphelin côté serveur.
   */
  async function logout(): Promise<void> {
    try {
      await apiPost('/api/auth/logout', {})
    } catch {
      // Déconnexion locale malgré tout.
    } finally {
      enregistrerJeton(null)
      utilisateur.value = null
      attenteIdentite.value = null
    }
  }

  /**
   * Recharge la session persistée au démarrage de l'application.
   *
   * Le jeton est remis en place de façon synchrone, avant le premier garde de
   * route : sans cela, un rechargement sur une page du tableau de bord
   * renverrait vers la connexion alors que la session est valide.
   *
   * L'identité, elle, demande un aller-retour. Elle n'était pas rechargée du
   * tout : après un F5, `estAuthentifie` valait `true` et `utilisateur` valait
   * `null`. On était donc authentifié sans savoir qui, ce qui vide le menu de
   * son nom et rend impossible tout affichage conditionné au rôle.
   *
   * L'échec est silencieux à dessein : un `/auth/me` en panne ne doit pas
   * déconnecter un administrateur dont le jeton est bon. Un 401, lui, est déjà
   * traité par le gestionnaire global posé dans `main.ts`, qui purge la
   * session.
   */
  function restaurerSession(): void {
    const persiste = localStorage.getItem(CLEF_JETON)
    if (!persiste) return

    token.value = persiste
    setAuthToken(persiste)
    attenteIdentite.value = apiGet<ReponseSession>('/api/auth/me')
      .then((reponse) => {
        utilisateur.value = reponse.user
      })
      .catch(() => {
        // Le jeton reste en place : l'identite manquera, pas la session.
      })
  }

  /**
   * Attend que l'identite soit connue, si un aller-retour est en cours.
   *
   * Rend la main immediatement quand il n'y en a pas — apres une connexion,
   * ou quand aucun jeton n'est persiste. L'echec de `/auth/me` n'est pas
   * propage : la garde decidera avec un role inconnu, et ne pas savoir n'est
   * pas un refus.
   */
  async function pretPourLesGardes(): Promise<void> {
    if (attenteIdentite.value !== null) await attenteIdentite.value
  }

  return {
    token,
    utilisateur,
    chargement,
    erreur,
    estAuthentifie,
    ouvrirSession,
    login,
    logout,
    restaurerSession,
    pretPourLesGardes,
  }
})
