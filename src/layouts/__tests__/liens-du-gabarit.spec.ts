import { describe, it, expect } from 'vitest'
import { readFileSync } from 'node:fs'
import routeur from '@/router'

/**
 * Le pied de page annoncait douze rubriques qui n'ont jamais eu de route :
 * cliquer dessus ne menait nulle part, sans message ni erreur visible. Sur un
 * site d'ambassade, un lien qui n'aboutit pas est pire qu'un lien absent.
 */
describe('liens du gabarit public', () => {
  it('ne pointe vers aucune route inexistante', () => {
    const gabarit = readFileSync('src/layouts/Layout.vue', 'utf8')
    const liens = [...gabarit.matchAll(/to="(\/[^"]*)"/g)].map((m) => m[1]!)

    expect(liens.length).toBeGreaterThan(20)

    const morts = [...new Set(liens)].filter((lien) => routeur.resolve(lien).matched.length === 0)

    expect(morts).toEqual([])
  })
})
