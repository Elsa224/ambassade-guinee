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

  /**
   * Vrai si le serveur a lui-meme fourni un message, faux si le notre est
   * fabrique faute de JSON exploitable.
   *
   * La distinction compte des qu'un intermediaire repond a la place de
   * l'application — un 413 du serveur frontal rendu en HTML, par exemple :
   * « Erreur 413 » est exact, et illisible pour la personne qui televerse.
   */
  get corpsPorteUnMessage(): boolean {
    return (
      this.corps !== null &&
      typeof this.corps === 'object' &&
      'message' in this.corps &&
      typeof (this.corps as { message: unknown }).message === 'string'
    )
  }
}

let jeton: string | null = null

/** Définit (ou efface) le jeton porteur envoyé avec chaque requête. */
export function setAuthToken(token: string | null): void {
  jeton = token
}

type GestionnaireNonAutorise = () => void

let surNonAutorise: GestionnaireNonAutorise | null = null

/** Enregistre le traitement applique quand le serveur repond 401 (session expiree). */
export function setUnauthorizedHandler(gestionnaire: GestionnaireNonAutorise | null): void {
  surNonAutorise = gestionnaire
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
    throw new ApiError(erreur instanceof Error ? erreur.message : 'Serveur injoignable', 0, null)
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
    if (reponse.status === 401 && surNonAutorise) {
      // Session expirée ou jeton révoqué : on purge avant de propager l'erreur.
      surNonAutorise()
    }

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

export function apiPatch<T>(chemin: string, corps: unknown): Promise<T> {
  return requete<T>(chemin, { method: 'PATCH', body: JSON.stringify(corps) }, true)
}

/**
 * Televerse un fichier. Le `Content-Type` est volontairement absent : le
 * navigateur doit poser lui-meme le `multipart/form-data` avec sa frontiere,
 * qu'on ne sait pas ecrire a la main.
 */
export function apiUpload<T>(chemin: string, formulaire: FormData): Promise<T> {
  return requete<T>(chemin, { method: 'POST', body: formulaire }, false)
}

export function apiDelete(chemin: string): Promise<void> {
  return requete<void>(chemin, { method: 'DELETE' }, false)
}

/** Un fichier servi par le back, avec le nom qu'il propose. */
export interface FichierServi {
  blob: Blob
  nomFichier: string | null
}

/** Nom de fichier porte par un en-tete Content-Disposition, ou `null`. */
export function nomDeContentDisposition(valeur: string | null): string | null {
  if (!valeur) return null
  const trouve = /filename="([^"]+)"/.exec(valeur)
  return trouve?.[1] ?? null
}

/**
 * Recupere un fichier protege par le jeton porteur.
 *
 * Un `<a href>` n'envoie pas d'en-tete `Authorization` : tout export de la
 * surface d'administration passe donc par ici, puis par une URL d'objet.
 * En cas d'echec le back repond en JSON, avec le meme contrat d'erreur que
 * les autres routes : on le traduit en `ApiError`, jamais en fichier.
 */
export async function apiFichier(chemin: string): Promise<FichierServi> {
  const enTetes: Record<string, string> = {}
  if (jeton) enTetes.Authorization = `Bearer ${jeton}`

  let reponse: Response
  try {
    reponse = await fetch(chemin, { headers: enTetes })
  } catch (erreur) {
    throw new ApiError(erreur instanceof Error ? erreur.message : 'Serveur injoignable', 0, null)
  }

  if (!reponse.ok) {
    if (reponse.status === 401 && surNonAutorise) {
      surNonAutorise()
    }
    const texte = await reponse.text()
    let corps: unknown = null
    try {
      corps = JSON.parse(texte)
    } catch {
      corps = texte
    }
    const message =
      corps !== null && typeof corps === 'object' && 'message' in corps
        ? String((corps as { message: unknown }).message)
        : `Erreur ${reponse.status}`
    throw new ApiError(message, reponse.status, corps)
  }

  return {
    blob: await reponse.blob(),
    nomFichier: nomDeContentDisposition(reponse.headers.get('Content-Disposition')),
  }
}
