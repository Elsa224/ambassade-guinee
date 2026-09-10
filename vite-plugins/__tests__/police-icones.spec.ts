import { describe, it, expect } from 'vitest'
import { readFileSync } from 'node:fs'
import { allegerPolices } from '../police-icones'

const BOXICONS = 'node_modules/boxicons/css/boxicons.min.css'

describe('allegement des polices d icones', () => {
  it('ne conserve que le woff2 et le woff', () => {
    const source =
      "@font-face{font-family:x;src:url(a.eot);src:url(a.eot) format('embedded-opentype')," +
      "url(a.woff2) format('woff2'),url(a.woff) format('woff'),url(a.ttf) format('truetype')," +
      "url(a.svg?#x) format('svg')}"

    const { css } = allegerPolices(source)

    expect(css).toContain("url(a.woff2) format('woff2')")
    expect(css).toContain("url(a.woff) format('woff')")
    expect(css).not.toContain('.eot')
    expect(css).not.toContain('.ttf')
    expect(css).not.toContain('.svg')
  })

  it('preserve les autres declarations du bloc', () => {
    const source =
      "@font-face{font-family:boxicons;font-weight:400;font-style:normal;src:url(a.ttf) format('truetype'),url(a.woff2) format('woff2')}"

    const { css } = allegerPolices(source)

    expect(css).toContain('font-family:boxicons')
    expect(css).toContain('font-weight:400')
    expect(css).toContain('font-style:normal')
  })

  it('laisse intact un bloc sans format conserve, plutot que de le vider', () => {
    const source = "@font-face{font-family:x;src:url(a.ttf) format('truetype')}"

    const { css, blocsIntacts } = allegerPolices(source)

    expect(css).toBe(source)
    expect(blocsIntacts).toBe(1)
  })

  it('ne touche pas aux regles hors @font-face', () => {
    const source = ".bx-menu:before{content:'\\e9d0'}"

    expect(allegerPolices(source).css).toBe(source)
  })

  // Garde-fou de version : si Boxicons cesse de livrer un woff2, ou change la
  // forme de ses declarations, ce test tombe avant que la police disparaisse
  // du site ou que les formats morts reviennent dans dist/.
  it('allege reellement la feuille de Boxicons installee', () => {
    const { css, blocsIntacts } = allegerPolices(readFileSync(BOXICONS, 'utf8'))

    expect(blocsIntacts).toBe(0)
    expect(css).toContain('.woff2')
    expect(css).not.toContain('fonts/boxicons.eot')
    expect(css).not.toContain('fonts/boxicons.ttf')
    expect(css).not.toContain('fonts/boxicons.svg')
  })
})
