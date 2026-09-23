import { describe, it, expect } from 'vitest'
import { readFileSync, readdirSync, statSync } from 'node:fs'
import path from 'node:path'

/**
 * Huit pages terminent leur banniere par la meme vague : un SVG ancre en bas
 * de l'en-tete, dont l'aplat est peint en dur. Il doit valoir exactement le
 * fond de la page qu'il rejoint, sinon il pose une bande plus sombre et un
 * lisere net en travers de l'ecran, juste sous le titre. Quatre de ces pages
 * peignaient #f3f4f6 (gray-100) au-dessus d'un `bg-gray-50`.
 *
 * La garde ne vise que cette vague-la, reconnaissable a son cadre : les
 * autres aplats du gabarit rejoignent d'autres fonds, et le blanc de la
 * banniere des actualites est correct.
 */
const VAGUE_DU_GABARIT = 'viewBox="0 0 1440 120"'
const FOND_DE_PAGE = '#f9fafb'

function vues(depart: string): string[] {
  return readdirSync(depart).flatMap((entree) => {
    const complet = path.join(depart, entree)
    if (statSync(complet).isDirectory()) return entree === '__tests__' ? [] : vues(complet)
    return complet.endsWith('.vue') ? [complet] : []
  })
}

describe('vague des bannieres', () => {
  it('rejoint le fond de la page, sans bande ni lisere', () => {
    const fautives: string[] = []
    let total = 0

    for (const fichier of [...vues('src/views'), ...vues('src/components')]) {
      const source = readFileSync(fichier, 'utf8')
      const index = source.indexOf(VAGUE_DU_GABARIT)
      if (index === -1) continue

      total += 1
      const remplissage = /fill="(#[0-9a-fA-F]{6})"/.exec(source.slice(index))?.[1]
      if (remplissage?.toLowerCase() !== FOND_DE_PAGE) fautives.push(`${fichier} -> ${remplissage}`)
      // Le fond du conteneur doit etre celui que la vague prolonge.
      if (!source.includes('bg-gray-50')) fautives.push(`${fichier} -> fond de page inattendu`)
    }

    expect(total).toBeGreaterThanOrEqual(8)
    expect(fautives).toEqual([])
  })
})
