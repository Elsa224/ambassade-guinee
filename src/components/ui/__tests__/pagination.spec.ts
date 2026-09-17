import { describe, it, expect } from 'vitest'
import { readFileSync } from 'node:fs'
import { resolve } from 'node:path'
import { bornesAffichees, paginerEnMemoire } from '../pagination'

describe('pagination en memoire', () => {
  it('compte les pages a partir du total et du nombre de lignes', () => {
    expect(paginerEnMemoire(24, 1, 10)).toEqual({ page: 1, limit: 10, total: 24, totalPages: 3 })
  })

  it('rend au moins une page sur une liste vide', () => {
    // Le defaut repare : `Math.ceil(0 / 10)` valait zero, et les deux ecrans
    // comparaient ensuite la page courante — 1 — a ce zero. Le bouton
    // « suivant » restait donc actif sur une liste vide.
    const vide = paginerEnMemoire(0, 1, 10)

    expect(vide.totalPages).toBe(1)
    expect(vide.page).toBe(1)
    expect(vide.page >= vide.totalPages).toBe(true)
  })

  it('ramene la page courante dans les bornes quand le filtre reduit la liste', () => {
    // On est page 9, on tape une recherche qui ne laisse que trois resultats :
    // sans ce rabattement, le tableau s'affiche vide alors qu'il y a des
    // resultats, et rien ne dit pourquoi.
    expect(paginerEnMemoire(3, 9, 10).page).toBe(1)
  })

  it("n'affiche aucune borne quand il n'y a rien", () => {
    expect(bornesAffichees(paginerEnMemoire(0, 1, 10))).toEqual({ premier: 0, dernier: 0 })
  })
})

/**
 * Garde d'uniformite. Sept paginations etaient ecrites a la main dans le
 * tableau de bord, avec trois tailles de page differentes et, pour deux
 * d'entre elles, le meme defaut de liste vide. Une seule barre existe
 * desormais ; ce test empeche la huitieme.
 */
describe('une seule barre de pagination', () => {
  it('aucun ecran du tableau de bord ne recalcule ses pages', () => {
    const racine = resolve(__dirname, '../../../views/dashboard')
    const fichiers = ['Articles.vue', 'Actualites.vue', 'evenements/ListeEvenements.vue']
    const fautifs = fichiers.filter((nom) => {
      const source = readFileSync(resolve(racine, nom), 'utf8')
      return /Math\.ceil\([^)]*\/\s*items?ParPage/.test(source)
    })

    expect(fautifs).toEqual([])
  })
})
