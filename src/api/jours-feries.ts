import { apiGet } from './client'

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
