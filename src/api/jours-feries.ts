import { apiGet, apiPost, apiPut, apiPatch, apiDelete, apiUpload } from './client'

/**
 * Calendrier des jours feries de l'ambassade.
 *
 * Le contrat qui fait foi est `docs/contrat-jours-feries.md` du depot back
 * (develop). Trois garanties structurent ce module :
 *
 * - le back rend toujours 200, meme pour une annee sans aucune fete : la
 *   liste est alors vide et `available_years` reste renseigne ;
 * - le bloc de reglages est toujours present, `intro` et `document_url` a
 *   `null` plutot qu'absents ;
 * - `available_years` ne contient que les annees ou l'ambassade a saisi
 *   quelque chose. L'annee servie peut donc en etre absente : c'est au front
 *   de l'ajouter aux options de son selecteur, et c'est ce que fait
 *   `anneesDuSelecteur`.
 */

/** Liste fermee au contrat. Le libelle affiche et la couleur restent ici. */
export type TypeDeFete = 'legale' | 'nationale' | 'religieuse'

export interface JourFerie {
  id: number
  name: string
  /** Toujours `AAAA-MM-JJ`, sans heure ni fuseau. */
  date: string
  type: TypeDeFete
  /** Precision facultative, du genre « date variable ». */
  note: string | null
}

export interface CalendrierFeries {
  year: number
  available_years: number[]
  /** Texte de presentation saisi par l'ambassade, ou `null`. */
  intro: string | null
  /** URL absolue du PDF, a poser telle quelle, ou `null`. */
  document_url: string | null
  holidays: JourFerie[]
}

interface Enveloppe<T> {
  data: T
}

/** Ce que la page affiche tant que l'API ne sert rien. */
export const CALENDRIER_VIDE: CalendrierFeries = {
  year: new Date().getFullYear(),
  available_years: [],
  intro: null,
  document_url: null,
  holidays: [],
}

/** Libelle affichable d'un type, et repli neutre pour une valeur inconnue. */
const LIBELLES: Readonly<Record<TypeDeFete, string>> = {
  legale: 'Fête légale',
  nationale: 'Fête nationale',
  religieuse: 'Fête religieuse',
}

export function libelleDuType(type: string): string {
  return LIBELLES[type as TypeDeFete] ?? 'Jour férié'
}

const MOIS = [
  'janvier',
  'février',
  'mars',
  'avril',
  'mai',
  'juin',
  'juillet',
  'août',
  'septembre',
  'octobre',
  'novembre',
  'décembre',
] as const

/**
 * « 2026-01-01 » devient « 1er janvier ».
 *
 * La date est decoupee a la main plutot que passee a `new Date` : une date
 * seule est lue comme minuit UTC, et `toLocaleDateString` la rendrait la
 * veille dans tous les fuseaux a l'ouest de Greenwich. Un jour ferie affiche
 * un jour trop tot est une erreur qu'un visiteur ne peut pas deviner.
 */
export function formaterJour(date: string): string {
  const [, mois, jour] = /^(\d{4})-(\d{2})-(\d{2})$/.exec(date)?.slice(1) ?? []
  if (mois === undefined || jour === undefined) return date
  const nomDuMois = MOIS[Number(mois) - 1]
  if (nomDuMois === undefined) return date
  const numero = Number(jour)
  return `${numero === 1 ? '1er' : numero} ${nomDuMois}`
}

/**
 * Ramene une reponse partielle a un calendrier complet, sans rien retrier.
 *
 * Le back sert deja les fetes par date croissante puis par identifiant ; une
 * liste absente vaut vide, jamais le contenu du gabarit.
 */
export function normaliserCalendrier(
  servi: Partial<CalendrierFeries> | null | undefined,
  anneeParDefaut: number = new Date().getFullYear(),
): CalendrierFeries {
  return {
    year: typeof servi?.year === 'number' ? servi.year : anneeParDefaut,
    available_years: [...(servi?.available_years ?? [])],
    intro: servi?.intro ?? null,
    document_url: servi?.document_url ?? null,
    holidays: [...(servi?.holidays ?? [])],
  }
}

/**
 * Options du selecteur d'annee.
 *
 * L'annee servie s'ajoute a la liste si elle en est absente : le back n'y met
 * que les annees pourvues, et un selecteur dont la valeur ne figure pas dans
 * ses options n'affiche rien.
 */
export function anneesDuSelecteur(calendrier: CalendrierFeries): number[] {
  const annees = new Set(calendrier.available_years)
  annees.add(calendrier.year)
  return [...annees].sort((a, b) => a - b)
}

/**
 * Lit le calendrier. Sans annee, le back sert l'annee civile courante.
 *
 * Le contrat borne `year` a l'intervalle 1900-2100 et repond 422 au-dela :
 * la valeur ne vient que du selecteur, alimente par le back lui-meme.
 */
export async function recupererCalendrier(annee?: number): Promise<CalendrierFeries> {
  const chemin =
    annee === undefined ? '/api/content/holidays' : `/api/content/holidays?year=${annee}`
  const reponse = await apiGet<Enveloppe<Partial<CalendrierFeries>>>(chemin)
  return normaliserCalendrier(reponse.data)
}

// --- Administration -------------------------------------------------------

const ADMIN = '/api/admin/holidays'

/** Meme enveloppe que la lecture visiteur : un seul appel a l'ouverture. */
export async function recupererCalendrierAdmin(annee?: number): Promise<CalendrierFeries> {
  const chemin = annee === undefined ? ADMIN : `${ADMIN}?year=${annee}`
  const reponse = await apiGet<Enveloppe<Partial<CalendrierFeries>>>(chemin)
  return normaliserCalendrier(reponse.data)
}

/**
 * Champs saisissables d'une fete.
 *
 * `note` a `null` l'efface ; `name`, `date` et `type` n'ont pas de valeur
 * vide qui ait un sens et rendent 422 a `null`.
 */
export type FeteSaisie = {
  name: string
  date: string
  type: TypeDeFete
  note: string | null
}

export async function ajouterFete(saisie: FeteSaisie): Promise<JourFerie> {
  const reponse = await apiPost<Enveloppe<JourFerie>>(ADMIN, saisie)
  return reponse.data
}

export async function modifierFete(id: number, saisie: Partial<FeteSaisie>): Promise<JourFerie> {
  const reponse = await apiPatch<Enveloppe<JourFerie>>(`${ADMIN}/${id}`, saisie)
  return reponse.data
}

export function supprimerFete(id: number): Promise<void> {
  return apiDelete(`${ADMIN}/${id}`)
}

/** Le bloc de reglages : texte de presentation et document. */
export interface ReglagesFeries {
  intro: string | null
  document_url: string | null
}

/**
 * Remplace le bloc de reglages. ATTENTION : c'est un REMPLACEMENT COMPLET,
 * pas une fusion.
 *
 * Un champ absent du corps vaut `null` au contrat : un enregistrement ne
 * portant que `intro` effacerait le document. L'appelant envoie donc toujours
 * les deux champs, y compris la valeur relue en lecture qu'il n'a pas
 * modifiee. La signature l'impose plutot que de l'esperer.
 */
export async function enregistrerReglages(reglages: ReglagesFeries): Promise<ReglagesFeries> {
  const reponse = await apiPut<Enveloppe<ReglagesFeries>>(`${ADMIN}/settings`, reglages)
  return reponse.data
}

/** Efface le bloc entier. Equivaut a un enregistrement de corps vide. */
export function supprimerReglages(): Promise<void> {
  return apiDelete(`${ADMIN}/settings`)
}

/** Bornes du contrat, reprises pour eviter un aller-retour previsible. */
export const TYPE_DOCUMENT_ACCEPTE = 'application/pdf'
export const TAILLE_DOCUMENT_MAX = 5 * 1024 * 1024

/** Message d'un refus previsible, ou `null` si le fichier est acceptable. */
export function refusDuDocument(fichier: File): string | null {
  if (fichier.type !== TYPE_DOCUMENT_ACCEPTE) {
    return 'Seul le format PDF est accepté.'
  }
  if (fichier.size > TAILLE_DOCUMENT_MAX) {
    return 'Le document ne doit pas dépasser 5 Mo.'
  }
  return null
}

/**
 * Televerse le document et rend son URL absolue.
 *
 * La route est distincte de celle des images, qui refuse les PDF. L'URL est
 * batie sur l'hote de la requete : l'ecran doit donc etre ouvert sur le
 * domaine de l'ambassade pour qu'une URL relue en lecture soit re-acceptee
 * en ecriture, comme pour `image_url`.
 */
export async function televerserDocument(fichier: File): Promise<string> {
  const formulaire = new FormData()
  formulaire.append('file', fichier)
  const reponse = await apiUpload<Enveloppe<{ url: string }>>(
    '/api/admin/content/document',
    formulaire,
  )
  return reponse.data.url
}
