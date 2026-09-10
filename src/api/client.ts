/**
 * Point de sortie HTTP unique du front.
 *
 * Toutes les URL sont relatives : le vhost Apache de chaque domaine
 * d'ambassade proxifie /api vers le CMS Laravel. Le meme build fonctionne
 * donc sur tous les domaines, sans CORS ni variable d'environnement.
 *
 * Authentification : jeton porteur Sanctum, place ici par le store auth.
 */

export class ApiError extends Error {
  readonly statut: number
  readonly corps: unknown

  constructor(message: string, statut: number, corps: unknown) {
    super(message)
    this.name = 'ApiError'
    this.statut = statut
    this.corps = corps
  }
}

let jeton: string | null = null

/** Definit (ou efface) le jeton porteur envoye avec chaque requete. */
export function setAuthToken(token: string | null): void {
  jeton = token
}

function entetes(avecCorps: boolean): Record<string, string> {
  const resultat: Record<string, string> = { Accept: 'application/json' }
  if (avecCorps) resultat['Content-Type'] = 'application/json'
  if (jeton) resultat.Authorization = `Bearer ${jeton}`
  return resultat
}

async function requete<T>(chemin: string, options: RequestInit, avecCorps: boolean): Promise<T> {
  let reponse: Response
  try {
    reponse = await fetch(chemin, { ...options, headers: entetes(avecCorps) })
  } catch (erreur) {
    // Panne reseau, DNS ou serveur injoignable : fetch rejette sans reponse.
    throw new ApiError(
      erreur instanceof Error ? erreur.message : 'Serveur injoignable',
      0,
      null,
    )
  }

  // 204 No Content, ou reponse vide : rien a deserialiser.
  if (reponse.status === 204) return undefined as T

  const texte = await reponse.text()
  let corps: unknown = null
  if (texte !== '') {
    try {
      corps = JSON.parse(texte)
    } catch {
      corps = texte
    }
  }

  if (!reponse.ok) {
    const message =
      corps !== null && typeof corps === 'object' && 'message' in corps
        ? String((corps as { message: unknown }).message)
        : `Erreur ${reponse.status}`
    throw new ApiError(message, reponse.status, corps)
  }

  return corps as T
}

export function apiGet<T>(chemin: string): Promise<T> {
  return requete<T>(chemin, { method: 'GET' }, false)
}

export function apiPost<T>(chemin: string, corps: unknown): Promise<T> {
  return requete<T>(chemin, { method: 'POST', body: JSON.stringify(corps) }, true)
}

export function apiPut<T>(chemin: string, corps: unknown): Promise<T> {
  return requete<T>(chemin, { method: 'PUT', body: JSON.stringify(corps) }, true)
}

export function apiDelete(chemin: string): Promise<void> {
  return requete<void>(chemin, { method: 'DELETE' }, false)
}
