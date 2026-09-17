/**
 * Calculs de dates du selecteur, tous en heure locale.
 *
 * Aucune fonction d'ici ne construit une date a partir d'une chaine :
 * `new Date('2026-01-01')` est lu comme minuit UTC, et rendrait la veille
 * partout a l'ouest de Greenwich. Le constructeur numerique
 * `new Date(annee, mois - 1, jour)`, lui, est local et sans piege : c'est le
 * seul employe ici.
 */

/** Une date civile, telle que le selecteur la manipule. */
export interface DateCivile {
  annee: number
  mois: number
  jour: number
}

export const JOURS_COURTS = ['Lu', 'Ma', 'Me', 'Je', 'Ve', 'Sa', 'Di'] as const

export const MOIS = [
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

const FORMAT_ISO = /^(\d{4})-(\d{2})-(\d{2})$/

/** Complete a deux chiffres : 7 devient « 07 ». */
function deuxChiffres(valeur: number): string {
  return String(valeur).padStart(2, '0')
}

/** Vrai si l'annee est bissextile, selon la regle gregorienne complete. */
export function estBissextile(annee: number): boolean {
  return (annee % 4 === 0 && annee % 100 !== 0) || annee % 400 === 0
}

/** Nombre de jours du mois, `mois` allant de 1 a 12. */
export function joursDuMois(annee: number, mois: number): number {
  if (mois === 2) return estBissextile(annee) ? 29 : 28
  return [4, 6, 9, 11].includes(mois) ? 30 : 31
}

/** Vrai si le triplet designe un jour qui existe reellement. */
export function dateValide({ annee, mois, jour }: DateCivile): boolean {
  if (!Number.isInteger(annee) || annee < 1 || annee > 9999) return false
  if (!Number.isInteger(mois) || mois < 1 || mois > 12) return false
  return Number.isInteger(jour) && jour >= 1 && jour <= joursDuMois(annee, mois)
}

/** `2026-01-01` vers ses trois nombres, ou `null` si la chaine ne convient pas. */
export function depuisIso(iso: string): DateCivile | null {
  const trouve = FORMAT_ISO.exec(iso.trim())
  if (trouve === null) return null
  const civile = {
    annee: Number(trouve[1]),
    mois: Number(trouve[2]),
    jour: Number(trouve[3]),
  }
  return dateValide(civile) ? civile : null
}

/** Trois nombres vers `2026-01-01`, la forme que l'API attend partout. */
export function versIso({ annee, mois, jour }: DateCivile): string {
  return `${String(annee).padStart(4, '0')}-${deuxChiffres(mois)}-${deuxChiffres(jour)}`
}

/** `2026-01-01` vers `01/01/2026`, ou la chaine telle quelle si elle ne convient pas. */
export function versAffichage(iso: string): string {
  const civile = depuisIso(iso)
  if (civile === null) return iso
  return `${deuxChiffres(civile.jour)}/${deuxChiffres(civile.mois)}/${civile.annee}`
}

/**
 * `01/01/2026` vers `2026-01-01`, ou `null` si la saisie ne designe pas un
 * jour reel.
 *
 * Les separateurs tolerés sont `/`, `-` et `.` : quelqu'un qui tape vite au
 * pave numerique produit souvent des points, et refuser sa saisie pour ce
 * seul motif serait pedant.
 */
export function depuisAffichage(saisie: string): string | null {
  const trouve = /^(\d{1,2})[/\-.](\d{1,2})[/\-.](\d{4})$/.exec(saisie.trim())
  if (trouve === null) return null
  const civile = {
    annee: Number(trouve[3]),
    mois: Number(trouve[2]),
    jour: Number(trouve[1]),
  }
  return dateValide(civile) ? versIso(civile) : null
}

/** Le jour d'aujourd'hui, lu sur l'horloge locale. */
export function aujourdHui(): DateCivile {
  const maintenant = new Date()
  return {
    annee: maintenant.getFullYear(),
    mois: maintenant.getMonth() + 1,
    jour: maintenant.getDate(),
  }
}

/**
 * Rang du 1er du mois dans une semaine commencant le LUNDI, de 0 a 6.
 *
 * `getDay()` compte a partir du dimanche : le decalage remet lundi en tete,
 * comme dans tous les calendriers francophones.
 */
export function rangDuPremier(annee: number, mois: number): number {
  return (new Date(annee, mois - 1, 1).getDay() + 6) % 7
}

/** Le mois precedent, en changeant d'annee au besoin. */
export function moisPrecedent(annee: number, mois: number): { annee: number; mois: number } {
  return mois === 1 ? { annee: annee - 1, mois: 12 } : { annee, mois: mois - 1 }
}

/** Le mois suivant, en changeant d'annee au besoin. */
export function moisSuivant(annee: number, mois: number): { annee: number; mois: number } {
  return mois === 12 ? { annee: annee + 1, mois: 1 } : { annee, mois: mois + 1 }
}

/**
 * Compare deux dates ISO sans les convertir en objets `Date`.
 *
 * Le format `AAAA-MM-JJ` est zero-rempli et de longueur fixe : son ordre
 * lexicographique est son ordre chronologique. C'est exact, et ca evite un
 * aller-retour par des dates dont le fuseau nous a deja coute une erreur.
 */
export function avant(iso: string, borne: string): boolean {
  return iso < borne
}

/** Decale une date civile de `pas` jours, en restant sur l'horloge locale. */
export function decaler(civile: DateCivile, pas: number): DateCivile {
  const date = new Date(civile.annee, civile.mois - 1, civile.jour + pas)
  return {
    annee: date.getFullYear(),
    mois: date.getMonth() + 1,
    jour: date.getDate(),
  }
}
