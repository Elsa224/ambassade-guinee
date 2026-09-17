import { describe, it, expect } from 'vitest'
import { readFileSync, globSync } from 'node:fs'
import { fileURLToPath } from 'node:url'
import { dirname, join } from 'node:path'

/**
 * Garde de lisibilite : le contraste est une propriete d'une PAIRE, et le
 * gabarit ne connait pas d'avance la couleur du tenant.
 *
 * `--color-primary` vaut #006633 pour la Guinee (7,12 sur blanc) mais #009E60
 * pour le Gabon (3,47). Ecrire du petit texte dans la couleur principale tient
 * donc pour une ambassade et pas pour l'autre, avec le meme code. La nuance
 * derivee `--color-primary-dark`, elle, passe pour les deux : 10,16 et 5,57.
 *
 * Seconde paire interdite : la couleur principale posee sur la secondaire.
 * Pour le Gabon, du vert sur le jaune du drapeau donne 2,36 — sous le seuil
 * que l'ecran des parametres oppose a l'ambassade elle-meme. Le gabarit pose
 * `text-ink-dark` sur la secondaire, qui vaut 5,54.
 */
const racine = join(dirname(fileURLToPath(import.meta.url)), '..')

const PAIRES_INTERDITES = [
  /bg-secondary\s+text-primary(?![-\w/])/,
  /hover:bg-secondary\s+hover:text-primary(?![-\w/])/,
]

function composants(): string[] {
  return globSync('**/*.vue', { cwd: racine }).filter((chemin) => !chemin.includes('__tests__/'))
}

describe('contraste du petit texte', () => {
  it("n'ecrit pas de text-sm ni de text-xs dans la couleur principale", () => {
    const fautifs: string[] = []
    for (const chemin of composants()) {
      const lignes = readFileSync(join(racine, chemin), 'utf8').split('\n')
      lignes.forEach((ligne, index) => {
        if (!/\btext-(sm|xs)\b/.test(ligne)) return
        if (!/text-primary(?![-\w/])/.test(ligne)) return
        fautifs.push(`${chemin}:${index + 1}`)
      })
    }

    expect(fautifs).toEqual([])
  })

  it('ne pose pas la couleur principale sur la secondaire en CSS non plus', () => {
    // La garde des classes utilitaires ne suffit pas : une regle ecrite dans
    // un bloc <style scoped> porte l'attribut de portee de Vue, sa
    // specificite depasse celle des classes, et elle les annule en silence.
    // C'est exactement ce qui s'est passe dans l'en-tete du gabarit, ou le
    // survul des entrees de menu restait vert sur jaune apres la correction
    // des classes.
    const fautifs: string[] = []
    for (const chemin of composants()) {
      const contenu = readFileSync(join(racine, chemin), 'utf8')
      const styles = contenu.slice(contenu.indexOf('<style'))
      for (const regle of styles.split('}')) {
        const poseLaSecondaire = /background(-color)?:\s*var\(--color-secondary\)/.test(regle)
        const ecritEnPrincipale = /(?<!background-)color:\s*var\(--color-primary\)/.test(regle)
        if (poseLaSecondaire && ecritEnPrincipale) {
          fautifs.push(`${chemin} : ${regle.trim().split('\n')[0]}`)
        }
      }
    }

    expect(fautifs).toEqual([])
  })

  it('ne pose pas la couleur principale sur la secondaire', () => {
    const fautifs: string[] = []
    for (const chemin of composants()) {
      const contenu = readFileSync(join(racine, chemin), 'utf8')
      for (const paire of PAIRES_INTERDITES) {
        if (paire.test(contenu)) fautifs.push(`${chemin} contient ${paire.source}`)
      }
    }

    expect(fautifs).toEqual([])
  })
})
