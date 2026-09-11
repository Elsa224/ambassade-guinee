import { describe, it, expect } from 'vitest'
import { readFileSync, readdirSync, statSync } from 'node:fs'
import path from 'node:path'
import routeur from '@/router'

function vues(depart: string): string[] {
  return readdirSync(depart).flatMap((entree) => {
    const complet = path.join(depart, entree)
    if (statSync(complet).isDirectory()) return entree === '__tests__' ? [] : vues(complet)
    return complet.endsWith('.vue') ? [complet] : []
  })
}

/**
 * Le pied de page annoncait douze rubriques qui n'ont jamais eu de route :
 * cliquer dessus ne menait nulle part, sans message ni erreur visible. Sur un
 * site d'ambassade, un lien qui n'aboutit pas est pire qu'un lien absent.
 */
describe('liens du gabarit public', () => {
  it('ne pointe vers aucune route inexistante', () => {
    // Le gabarit seul ne suffisait pas : `to="/services"` se cachait dans la
    // banniere de l'accueil, sous un libelle de maquette.
    const fichiers = [...vues('src/views'), ...vues('src/layouts'), ...vues('src/components')]
    const morts: string[] = []

    let total = 0
    for (const fichier of fichiers) {
      for (const trouvaille of readFileSync(fichier, 'utf8').matchAll(/\sto="(\/[^"]*)"/g)) {
        total += 1
        const lien = trouvaille[1]!
        if (routeur.resolve(lien).matched.length === 0) morts.push(`${fichier} -> ${lien}`)
      }
    }

    expect(total).toBeGreaterThan(30)
    expect(morts).toEqual([])
  })
})
