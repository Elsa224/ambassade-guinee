/**
 * Calculs du selecteur d'heure.
 *
 * Tout est en heure LOCALE et sans objet `Date` : une heure de la journee
 * n'est pas un instant. « 18:30 » sur la fiche d'un evenement veut dire
 * dix-huit heures trente a l'ambassade, quel que soit le fuseau du
 * navigateur qui l'affiche. Passer par `Date` reintroduirait un decalage la
 * ou il n'y en a pas.
 */

/** Une heure de la journee, telle que le selecteur la manipule. */
export interface HeureCivile {
  heures: number
  minutes: number
}

/** Les vingt-quatre heures, dans l'ordre. */
export const HEURES: readonly number[] = Array.from({ length: 24 }, (_, rang) => rang)

const FORMAT = /^(\d{1,2}):(\d{2})$/

/** Complete a deux chiffres : 8 devient « 08 ». */
function deuxChiffres(valeur: number): string {
  return String(valeur).padStart(2, '0')
}

/** Les minutes proposees, par pas. Un pas de 5 rend 00, 05, 10… 55. */
export function minutesParPas(pas: number): number[] {
  const intervalle = Number.isFinite(pas) && pas > 0 && pas <= 30 ? Math.floor(pas) : 5
  const valeurs: number[] = []
  for (let minute = 0; minute < 60; minute += intervalle) valeurs.push(minute)
  return valeurs
}

export function estValide(heure: HeureCivile): boolean {
  return (
    Number.isInteger(heure.heures) &&
    Number.isInteger(heure.minutes) &&
    heure.heures >= 0 &&
    heure.heures <= 23 &&
    heure.minutes >= 0 &&
    heure.minutes <= 59
  )
}

/** `HH:MM` depuis une heure civile. */
export function versIso(heure: HeureCivile): string {
  return `${deuxChiffres(heure.heures)}:${deuxChiffres(heure.minutes)}`
}

/** Heure civile depuis `HH:MM`, ou `null` si la chaine ne s'y prete pas. */
export function depuisIso(valeur: string): HeureCivile | null {
  const trouve = FORMAT.exec(valeur.trim())
  if (!trouve) return null
  const heure = { heures: Number(trouve[1]), minutes: Number(trouve[2]) }
  return estValide(heure) ? heure : null
}

/**
 * Ce que le champ montre. La forme affichee est celle du modele — `HH:MM` —
 * et c'est voulu : une heure de reunion s'ecrit pareil qu'on la lise ou
 * qu'on la saisisse, contrairement a une date dont la France inverse
 * l'ordre.
 */
export function versAffichage(valeur: string): string {
  const heure = depuisIso(valeur)
  return heure === null ? '' : versIso(heure)
}

/**
 * Interprete une saisie humaine.
 *
 * Genereuse a dessein, parce que personne ne tape une heure de la meme
 * facon : « 8h30 », « 8:30 », « 08.30 », « 830 » et « 0830 » donnent tous
 * 08:30, et « 8 » ou « 8h » donnent 08:00. Le separateur importe peu, le
 * nombre de chiffres suffit a lever l'ambiguite.
 *
 * Ce qui est REFUSE l'est fermement : « 25:00 » et « 12:70 » rendent `null`,
 * jamais une heure rabattue en silence. Un champ qui corrige la saisie sans
 * le dire fait enregistrer autre chose que ce qu'on a lu.
 */
export function depuisSaisie(brut: string): string | null {
  const nettoye = brut.trim().toLowerCase().replace(/\s+/g, '')
  if (nettoye === '') return null

  const separe = /^(\d{1,2})[h:.,-](\d{1,2})?$/.exec(nettoye)
  if (separe) {
    const minutes = separe[2] === undefined || separe[2] === '' ? 0 : Number(separe[2])
    // « 8h3 » veut dire 8h30, pas 8h03 : un seul chiffre apres le separateur
    // designe les dizaines de minutes, comme on le dit a l'oral.
    const dizaines = separe[2] !== undefined && separe[2].length === 1 ? minutes * 10 : minutes
    const heure = { heures: Number(separe[1]), minutes: dizaines }
    return estValide(heure) ? versIso(heure) : null
  }

  const chiffres = /^(\d{1,4})$/.exec(nettoye)
  if (chiffres) {
    const suite = chiffres[1]!
    if (suite.length <= 2) {
      const heure = { heures: Number(suite), minutes: 0 }
      return estValide(heure) ? versIso(heure) : null
    }
    // « 830 » : le dernier couple porte les minutes, le reste les heures.
    const heure = {
      heures: Number(suite.slice(0, suite.length - 2)),
      minutes: Number(suite.slice(-2)),
    }
    return estValide(heure) ? versIso(heure) : null
  }

  return null
}

/**
 * L'heure courante, rabattue sur le pas propose.
 *
 * Arrondie a l'inferieur et non au plus proche : « Maintenant » sur un
 * evenement veut dire « ca commence », pas « ca a commence dans cinq
 * minutes ».
 */
export function maintenant(pas = 5, date = new Date()): string {
  const minutes = minutesParPas(pas)
  const intervalle = minutes.length > 1 ? minutes[1]! : 1
  return versIso({
    heures: date.getHours(),
    minutes: Math.floor(date.getMinutes() / intervalle) * intervalle,
  })
}
