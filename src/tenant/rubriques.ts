/**
 * Rubriques du site public dont l'ouverture depend de l'ambassade.
 *
 * Une ambassade n'a pas forcement de consuls honoraires, de relations
 * bilaterales a presenter, ou le personnel de sa chancellerie a publier. Plutot
 * que de livrer a chaque ambassade les pages d'une autre, chaque rubrique est
 * rattachee ici a un drapeau que le tenant declare dans `modules`.
 */
export const RUBRIQUE_PAR_CHEMIN: Readonly<Record<string, string>> = {
  '/chancellerie': 'chancellerie',
  '/services-ambassadeur': 'services',
  '/consuls-honoraires': 'consuls_honoraires',
  '/calendrier': 'calendrier',
  '/consulat': 'consulat',
  '/rendez-vous': 'rendez_vous',
  '/relations-bilaterales': 'bilateral',
  '/usa': 'bilateral',
  '/costa-rica': 'bilateral',
  '/haiti': 'bilateral',
  '/bahamas': 'bilateral',
  '/fond-monetaire': 'bilateral',
}

/** Nom de la rubrique dont depend un chemin, ou `null` s'il est toujours ouvert. */
export function rubriqueDuChemin(chemin: string): string | null {
  return RUBRIQUE_PAR_CHEMIN[chemin] ?? null
}
