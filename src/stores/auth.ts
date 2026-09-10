import { defineStore } from 'pinia'
import { ref, computed } from 'vue'
import { apiPost, setAuthToken, ApiError } from '@/api/client'

/** Administrateur du back-office (spec 4.3). */
export interface Utilisateur {
  id: number
  nom: string
  email: string
  role: string
}

interface ReponseConnexion {
  token: string
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

  function enregistrerJeton(valeur: string | null): void {
    token.value = valeur
    setAuthToken(valeur)
    if (valeur === null) {
      localStorage.removeItem(CLEF_JETON)
    } else {
      localStorage.setItem(CLEF_JETON, valeur)
    }
  }

  /** Rend true si la connexion a reussi ; le message d erreur reste dans `erreur`. */
  async function login(email: string, password: string): Promise<boolean> {
    chargement.value = true
    erreur.value = null
    try {
      const reponse = await apiPost<ReponseConnexion>('/api/auth/login', { email, password })
      enregistrerJeton(reponse.token)
      utilisateur.value = reponse.user
      return true
    } catch (souleve) {
      erreur.value =
        souleve instanceof ApiError && souleve.statut !== 0
          ? souleve.message
          : 'Serveur injoignable. Reessayez dans un instant.'
      return false
    } finally {
      chargement.value = false
    }
  }

  /**
   * Deconnecte l administrateur. La session locale est effacee meme si l appel
   * serveur echoue : laisser un jeton actif dans le navigateur apres un clic
   * sur « se deconnecter » serait pire qu un jeton orphelin cote serveur.
   */
  async function logout(): Promise<void> {
    try {
      await apiPost('/api/auth/logout', {})
    } catch {
      // Deconnexion locale malgre tout.
    } finally {
      enregistrerJeton(null)
      utilisateur.value = null
    }
  }

  /** Recharge le jeton persiste au demarrage de l application. */
  function restaurerSession(): void {
    const persiste = localStorage.getItem(CLEF_JETON)
    if (persiste) {
      token.value = persiste
      setAuthToken(persiste)
    }
  }

  return { token, utilisateur, chargement, erreur, estAuthentifie, login, logout, restaurerSession }
})
