import { describe, it, expect } from 'vitest'
import { readFileSync, globSync } from 'node:fs'
import { fileURLToPath } from 'node:url'
import { dirname, join } from 'node:path'

/**
 * Garde du refactor template : une couleur de marque en dur dans un composant
 * echappe au theme du tenant, donc le meme build afficherait les couleurs de la
 * Guinee sur le site du Gabon. Seul style.css a le droit d'ecrire ces valeurs,
 * en repli du bootstrap.
 */
const COULEURS_DE_MARQUE = [
  '#006633',
  '#004c2a',
  '#004d26',
  '#00331a',
  '#006b44',
  '#007a4d',
  '#009460',
  '#fcd116',
  '#e6b800',
  '#e6a800',
  '#ce1126',
  '#b30f20',
  '#a10e1f',
  '#8b0b1a',
]

// `new URL('..', import.meta.url)` echoue sous l'environnement de test jsdom
// (celui-ci remplace le global `URL` par son implementation, qui ne resout pas
// correctement une base file:). On calcule donc la racine via `path` uniquement.
const racine = join(dirname(fileURLToPath(import.meta.url)), '..')

describe('couleurs de marque', () => {
  it("n'apparaissent en dur dans aucun composant", () => {
    // style.css porte les couleurs de repli ; ce fichier-ci porte la liste a interdire.
    const EXCLUS = ['style.css', '__tests__/no-hardcoded-brand-colors.spec.ts']

    const fichiers = globSync('**/*.{vue,ts,css}', { cwd: racine }).filter(
      (chemin) => !EXCLUS.includes(chemin),
    )

    const fautifs: string[] = []
    for (const chemin of fichiers) {
      const contenu = readFileSync(join(racine, chemin), 'utf8')
      const minuscules = contenu.toLowerCase()
      for (const couleur of COULEURS_DE_MARQUE) {
        if (minuscules.includes(couleur)) fautifs.push(`${chemin} contient ${couleur}`)
      }
    }

    expect(fautifs).toEqual([])
  })
})
