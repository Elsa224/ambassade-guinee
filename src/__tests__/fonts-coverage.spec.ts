// @vitest-environment node
import { describe, it, expect } from 'vitest'
import { globSync } from 'node:fs'
import { fileURLToPath } from 'node:url'
import { join } from 'node:path'
import { codePointsDeLaPolice } from '../../scripts/font-coverage.mjs'

/**
 * Les polices initialement livrees etaient des sous-ensembles cyrilliques sans
 * aucune lettre accentuee : tous les accents francais retombaient sur une
 * police systeme. Ce test empeche la regression.
 */
const ACCENTS_FRANCAIS = 'éèêëàâäçîïôöûùüÉÈÀÇ'

const dossier = fileURLToPath(new URL('../assets/fonts', import.meta.url))

describe('polices', () => {
  it('couvrent tous les caracteres accentues du francais', () => {
    const fichiers = globSync('*.woff', { cwd: dossier })
    expect(fichiers.length).toBeGreaterThan(0)

    const manques: string[] = []
    for (const fichier of fichiers) {
      const couverts = codePointsDeLaPolice(join(dossier, fichier))
      const absents = [...ACCENTS_FRANCAIS].filter((c) => !couverts.has(c.codePointAt(0)!))
      if (absents.length > 0) manques.push(`${fichier} : ${absents.join('')}`)
    }

    expect(manques).toEqual([])
  })
})
