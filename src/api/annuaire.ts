import { apiGet, apiPost, apiPut, apiPatch, apiDelete } from './client'

/**
 * Annuaire de l'ambassade : personnel de la chancellerie et consuls
 * honoraires.
 *
 * Le contrat qui fait foi est `docs/contrat-annuaire.md` du depot back
 * (develop). Les deux listes ont la forme des dirigeants de l'accueil :
 * elements ordonnes, nom, fonction, image facultative pour le personnel.
 *
 * Une regle differe du contenu d'accueil : les listes sont servies deja
 * triees (`position` puis `id`), et apres une suppression les `position`
 * gardent un trou jusqu'au prochain reordonnancement. On rend donc dans
 * L'ORDRE DU TABLEAU servi, sans jamais retrier ni utiliser `position`
 * comme index.
 */

export interface MembrePersonnel {
  id: number
  name: string
  role: string
  email: string | null
  phone: string | null
  image_url: string | null
  /**
   * Le service auquel l'agent appartient, quand l'ambassade le renseigne.
   *
   * Ajoute le 21/09/2026 : la page de la chancellerie presente l'annuaire
   * GROUPE PAR SERVICE plutot qu'un organigramme dessine, qu'il faudrait tenir
   * a la main a chaque mouvement de personnel. Sans ce champ il n'y a pas de
   * regroupement possible, seulement une liste a plat dont l'ordre suggere la
   * structure sans jamais la nommer.
   *
   * Facultatif et `null` par defaut : tant qu'il vaut `null` partout, la page
   * se comporte exactement comme avant.
   */
  department: string | null
  position: number
}

/**
 * Un service et les agents qui le composent, dans l'ordre servi.
 *
 * `nom` vaut `null` pour les membres sans service : ils se rangent en fin de
 * liste, sans titre de groupe.
 */
export interface GroupeDePersonnel {
  nom: string | null
  membres: MembrePersonnel[]
}

/**
 * Regroupe le personnel par service, sans jamais retrier les membres.
 *
 * Deux regles, et la seconde est la seule subtile :
 *
 * - les membres gardent l'ordre servi a l'interieur de leur groupe, comme
 *   partout ailleurs dans l'annuaire ;
 * - **l'ordre des groupes se derive de la position MINIMALE de leurs
 *   membres**, et non de leur premiere apparition dans le tableau servi. La
 *   difference ne se voit qu'a l'usage : un agent ajoute en fin de liste
 *   porte la position la plus haute, et si l'ordre des groupes suivait les
 *   apparitions, son service entier sauterait en fin de page. Ce serait lu
 *   comme un bug et n'en serait pas un.
 *
 * Le groupe sans nom passe toujours en dernier, quelle que soit la position
 * de ses membres : il n'a pas de titre pour s'annoncer.
 */
export function grouperParService(membres: readonly MembrePersonnel[]): GroupeDePersonnel[] {
  const groupes = new Map<string | null, MembrePersonnel[]>()
  for (const membre of membres) {
    const cle = membre.department === null || membre.department === '' ? null : membre.department
    const groupe = groupes.get(cle)
    if (groupe === undefined) groupes.set(cle, [membre])
    else groupe.push(membre)
  }

  const rang = (groupe: readonly MembrePersonnel[]) =>
    groupe.reduce((minimum, membre) => Math.min(minimum, membre.position), Number.POSITIVE_INFINITY)

  return [...groupes.entries()]
    .map(([nom, membres]) => ({ nom, membres }))
    .sort((a, b) => {
      if (a.nom === null) return 1
      if (b.nom === null) return -1
      return rang(a.membres) - rang(b.membres)
    })
}

/**
 * Les services deja saisis dans cette ambassade, tries et sans doublon.
 *
 * Ils nourrissent la liste de suggestions du champ de saisie. Une chaine
 * libre diverge — « Service consulaire », « service consulaire » et
 * « Consulaire » feraient trois groupes, et personne ne le verrait avant que
 * la page ne montre trois titres pour un seul service. Le serveur ne
 * normalise pas a l'ecriture, et c'est voulu : cela imposerait une casse a
 * toutes les ambassades et rendrait « Service Consulaire » impossible a
 * ecrire volontairement. La parade est ici, a la saisie.
 *
 * Le serveur sert la meme liste dans `GET /api/admin/directory` ; celle-ci
 * n'est qu'un repli, exact tant que tout l'annuaire tient dans la reponse.
 */
export function servicesSaisis(membres: readonly MembrePersonnel[]): string[] {
  const vus = new Set<string>()
  for (const membre of membres) {
    if (membre.department !== null && membre.department !== '') vus.add(membre.department)
  }
  return [...vus].sort((a, b) => a.localeCompare(b, 'fr'))
}

export interface ConsulHonoraire {
  id: number
  name: string
  role: string
  city: string
  /** Peut contenir des retours a la ligne : rendre avec `whitespace-pre-line`. */
  address: string | null
  email: string | null
  phone: string | null
  position: number
}

export interface Annuaire {
  staff: MembrePersonnel[]
  consuls: ConsulHonoraire[]
}

interface Enveloppe<T> {
  data: T
}

/** L'annuaire vide : ce que le site affiche tant que rien n'est saisi. */
export const ANNUAIRE_VIDE: Annuaire = { staff: [], consuls: [] }

/** Bornes du contrat, reprises pour les poser sur les champs de saisie. */
export const LONGUEUR_TEXTE_MAX = 191
/** Borne du service, plus courte que les autres textes : c'est un intitule. */
export const LONGUEUR_SERVICE_MAX = 120
export const LONGUEUR_TELEPHONE_MAX = 40
export const LONGUEUR_ADRESSE_MAX = 2000

/**
 * Ramene une reponse partielle a un annuaire complet, sans retrier.
 *
 * Une liste absente vaut vide, jamais le contenu du gabarit : meme garantie
 * que pour l'accueil, c'est elle qui empeche la fuite d'identite.
 */
export function normaliserAnnuaire(servi: Partial<Annuaire> | null | undefined): Annuaire {
  return {
    // `department` peut manquer : le champ a ete ajoute apres la mise en
    // service de l'annuaire, et un serveur qui ne l'a pas encore livre sert
    // des membres sans lui. `null` vaut « aucun service », pas « inconnu ».
    staff: (servi?.staff ?? []).map((membre) => ({
      ...membre,
      department: membre.department ?? null,
    })),
    consuls: [...(servi?.consuls ?? [])],
  }
}

export async function recupererAnnuaire(): Promise<Annuaire> {
  const reponse = await apiGet<Enveloppe<Partial<Annuaire>>>('/api/content/directory')
  return normaliserAnnuaire(reponse.data)
}

// --- Administration -------------------------------------------------------

const ADMIN = '/api/admin/directory'

export async function recupererAnnuaireAdmin(): Promise<Annuaire> {
  const reponse = await apiGet<Enveloppe<Partial<Annuaire>>>(ADMIN)
  return normaliserAnnuaire(reponse.data)
}

/**
 * Champs saisissables d'un membre du personnel.
 *
 * `null` efface email, telephone ou image ; `name` et `role` ne s'effacent
 * pas (le back repond 422), l'ecran les valide non vides avant l'envoi.
 */
export type MembreSaisi = {
  name: string
  role: string
  email: string | null
  phone: string | null
  image_url: string | null
  /** `null` retire l'agent de tout groupe : il se range en fin de liste. */
  department: string | null
}

export async function ajouterMembre(saisi: MembreSaisi): Promise<MembrePersonnel> {
  const reponse = await apiPost<Enveloppe<MembrePersonnel>>(`${ADMIN}/staff`, saisi)
  return reponse.data
}

export async function modifierMembre(
  id: number,
  saisi: Partial<MembreSaisi>,
): Promise<MembrePersonnel> {
  const reponse = await apiPatch<Enveloppe<MembrePersonnel>>(`${ADMIN}/staff/${id}`, saisi)
  return reponse.data
}

export function supprimerMembre(id: number): Promise<void> {
  return apiDelete(`${ADMIN}/staff/${id}`)
}

/**
 * Reordonne le personnel d'un coup. `ids` doit porter TOUS les identifiants
 * de la liste, dans l'ordre voulu : liste incomplete, doublon ou identifiant
 * etranger valent 422. La reponse est la liste reordonnee.
 */
export async function ordonnerPersonnel(ids: readonly number[]): Promise<MembrePersonnel[]> {
  const reponse = await apiPut<Enveloppe<MembrePersonnel[]>>(`${ADMIN}/staff/order`, { ids })
  return reponse.data
}

/** Champs saisissables d'un consul honoraire. `city` ne s'efface pas non plus. */
export type ConsulSaisi = {
  name: string
  role: string
  city: string
  address: string | null
  email: string | null
  phone: string | null
}

export async function ajouterConsul(saisi: ConsulSaisi): Promise<ConsulHonoraire> {
  const reponse = await apiPost<Enveloppe<ConsulHonoraire>>(`${ADMIN}/consuls`, saisi)
  return reponse.data
}

export async function modifierConsul(
  id: number,
  saisi: Partial<ConsulSaisi>,
): Promise<ConsulHonoraire> {
  const reponse = await apiPatch<Enveloppe<ConsulHonoraire>>(`${ADMIN}/consuls/${id}`, saisi)
  return reponse.data
}

export function supprimerConsul(id: number): Promise<void> {
  return apiDelete(`${ADMIN}/consuls/${id}`)
}

export async function ordonnerConsuls(ids: readonly number[]): Promise<ConsulHonoraire[]> {
  const reponse = await apiPut<Enveloppe<ConsulHonoraire[]>>(`${ADMIN}/consuls/order`, { ids })
  return reponse.data
}
