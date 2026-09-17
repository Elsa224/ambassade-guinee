import { describe, it, expect } from 'vitest'
import { readFileSync, readdirSync } from 'node:fs'
import { resolve } from 'node:path'

/**
 * Garde de migration Tailwind v4.
 *
 * Les utilitaires d'opacite de la v3 (`bg-opacity-50` et ses freres) ont ete
 * SUPPRIMES en v4 : ils ne produisent plus aucune regle CSS, et rien ne le
 * signale — ni le compilateur, ni la CI, ni le navigateur. Quatre modales du
 * tableau de bord portaient `bg-black bg-opacity-50` et s'affichaient donc
 * sur un voile NOIR OPAQUE en production, l'ecran entierement masque derriere
 * la boite de dialogue. La forme qui marche est `bg-black/50`.
 *
 * Le test lit les sources depuis le disque : c'est le seul moyen d'attraper
 * une classe qui ne casse rien a l'execution.
 */
const UTILITAIRES_DISPARUS = [
  /\bbg-opacity-\d/,
  /\btext-opacity-\d/,
  /\bborder-opacity-\d/,
  /\bring-opacity-\d/,
  /\bdivide-opacity-\d/,
  /\bplaceholder-opacity-\d/,
]

function sourcesDuDepot(racine = resolve(__dirname, '..')): string[] {
  return readdirSync(racine, { withFileTypes: true }).flatMap((entree) => {
    const chemin = resolve(racine, entree.name)
    if (entree.isDirectory()) return entree.name === '__tests__' ? [] : sourcesDuDepot(chemin)
    return /\.(vue|ts|html)$/.test(entree.name) ? [chemin] : []
  })
}

describe('migration Tailwind v4', () => {
  it("n'emploie aucun utilitaire d'opacite supprime en v4", () => {
    const fautifs = sourcesDuDepot().filter((chemin) => {
      const source = readFileSync(chemin, 'utf8')
      return UTILITAIRES_DISPARUS.some((motif) => motif.test(source))
    })

    expect(fautifs).toEqual([])
  })
})
