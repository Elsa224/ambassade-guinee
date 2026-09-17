import { describe, it, expect } from 'vitest'
import { readFileSync, readdirSync } from 'node:fs'
import { resolve } from 'node:path'

/**
 * Garde d'uniformite des champs de formulaire.
 *
 * Trois controles natifs sont dessines par le SYSTEME et non par la feuille
 * de style : `<select>`, `<input type="date">` et `<input type="time">`. Ils
 * n'ont ni le meme aspect ni la meme langue d'un navigateur a l'autre — sur
 * macOS, le champ d'heure ouvre trois colonnes bleues avec « AM » et « PM »
 * en anglais, sur un site d'ambassade francophone qui affiche par ailleurs
 * ses horaires en vingt-quatre heures.
 *
 * Les trois ont ete remplaces par `ChampSelect`, `ChampDate` et
 * `ChampHeure`, qui gardent le contrat de valeur du natif. Ce test empeche
 * le quatrieme retour en arriere : il lit les sources DEPUIS LE DISQUE,
 * parce qu'un controle natif ne casse rien a l'execution — il est
 * simplement laid, et personne ne le remarque avant une capture d'ecran.
 */
const INTERDITS = [
  { motif: /<input[^>]*type="date"/, remplacant: 'ChampDate' },
  { motif: /<input[^>]*type="time"/, remplacant: 'ChampHeure' },
  { motif: /<select[\s>]/, remplacant: 'ChampSelect' },
]

/** Les composants du gabarit, hors ceux qui portent justement le remplacement. */
const TOLERES = ['ChampSelect.vue', 'ChampDate.vue', 'ChampHeure.vue']

function composants(racine: string): string[] {
  return readdirSync(racine, { withFileTypes: true }).flatMap((entree) => {
    const chemin = resolve(racine, entree.name)
    if (entree.isDirectory()) return entree.name === '__tests__' ? [] : composants(chemin)
    return entree.name.endsWith('.vue') && !TOLERES.includes(entree.name) ? [chemin] : []
  })
}

describe('champs de formulaire du gabarit', () => {
  it("n'emploie aucun controle dessine par le systeme", () => {
    const racine = resolve(__dirname, '../../..')
    const fautifs: string[] = []

    for (const chemin of composants(racine)) {
      const source = readFileSync(chemin, 'utf8')
      for (const { motif, remplacant } of INTERDITS) {
        if (motif.test(source)) {
          fautifs.push(`${chemin.slice(racine.length + 1)} : employer ${remplacant}`)
        }
      }
    }

    expect(fautifs).toEqual([])
  })

  it('trouve bien des composants a verifier', () => {
    // Sans cela, un chemin devenu faux rendrait le test precedent vert sur
    // un ensemble vide.
    expect(composants(resolve(__dirname, '../../..')).length).toBeGreaterThan(0)
  })
})
