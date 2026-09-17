import { describe, it, expect } from 'vitest'
import { couleursDuTenant, nomDeFichier } from '../affiche-qr'

/**
 * Le billet est dessine sur un canevas, que jsdom ne sait pas rasteriser :
 * les tests portent donc sur ce qui se verifie sans contexte de dessin — la
 * provenance des couleurs et le nom du fichier partage. La composition
 * elle-meme a ete verifiee en navigateur.
 */
describe("couleurs de l'affiche", () => {
  it('prend les couleurs appliquees par le theme du tenant', () => {
    const racine = document.createElement('div')
    racine.style.setProperty('--color-primary', '#123456')
    racine.style.setProperty('--color-secondary', '#654321')
    racine.style.setProperty('--color-accent', '#abcdef')
    document.body.appendChild(racine)

    expect(couleursDuTenant(racine)).toEqual({
      primaire: '#123456',
      secondaire: '#654321',
      accent: '#abcdef',
    })
  })

  it("se replie sur du neutre, jamais sur les couleurs d'un drapeau", () => {
    // Le point important. Un repli sur le vert et le jaune d'un drapeau
    // ferait imprimer a une ambassade l'affiche d'une autre le jour ou le
    // theme ne serait pas applique. Terne vaut mieux que faux.
    const nu = document.createElement('div')
    document.body.appendChild(nu)

    const couleurs = couleursDuTenant(nu)
    for (const valeur of Object.values(couleurs)) {
      expect(valeur).toMatch(/^#[0-9a-f]{6}$/i)
      const [r, v, b] = [1, 3, 5].map((rang) => parseInt(valeur.slice(rang, rang + 2), 16))
      // Un gris : les trois composantes se tiennent. Une couleur de drapeau,
      // elle, en a une qui domine largement.
      const ecart = Math.max(r!, v!, b!) - Math.min(r!, v!, b!)
      expect(ecart).toBeLessThan(40)
    }
  })
})

describe('nom du fichier partage', () => {
  it('se lit sans accents ni ponctuation', () => {
    expect(nomDeFichier('Cérémonie du 2 octobre')).toBe('inscription-ceremonie-du-2-octobre.jpg')
  })

  it('reste utilisable quand le nom ne donne aucune lettre', () => {
    expect(nomDeFichier('«»')).toBe('inscription-evenement.jpg')
  })
})
