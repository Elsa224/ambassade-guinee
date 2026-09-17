import type { VueWrapper } from '@vue/test-utils'

/**
 * Pilotage des champs du gabarit depuis les tests d'ecran.
 *
 * Les listes deroulantes et les champs de date ne sont plus des elements
 * natifs : `setValue` sur un `<select>` ne les atteint pas. Ces fonctions
 * reproduisent les gestes de l'utilisateur — ouvrir, cliquer, taper — plutot
 * que d'emettre l'evenement du composant a la main, ce qui ne prouverait
 * rien de l'ecran teste.
 */

/** Ouvre une liste deroulante et clique l'option portant ce libelle. */
export async function choisirDansLaListe(
  ecran: VueWrapper,
  selecteur: string,
  libelle: string,
): Promise<void> {
  await ecran.find(selecteur).trigger('click')
  const option = ecran.findAll('[role="option"]').find((entree) => entree.text() === libelle)
  if (option === undefined) throw new Error(`option « ${libelle} » introuvable`)
  await option.trigger('click')
}

/** Les libelles proposes par une liste deroulante, dans l'ordre affiche. */
export async function optionsDeLaListe(ecran: VueWrapper, selecteur: string): Promise<string[]> {
  await ecran.find(selecteur).trigger('click')
  return ecran.findAll('[role="option"]').map((entree) => entree.text())
}

/** Tape une date au clavier, au format affiche, et valide la saisie. */
export async function saisirLaDate(
  ecran: VueWrapper,
  selecteur: string,
  iso: string,
): Promise<void> {
  const [annee, mois, jour] = iso.split('-')
  const champ = ecran.find(selecteur)
  await champ.setValue(`${jour}/${mois}/${annee}`)
  await champ.trigger('blur')
}
