import type { Plugin } from 'vite'

/**
 * Formats de police conserves, du plus compact au plus compatible.
 *
 * `woff2` couvre tous les navigateurs sortis depuis 2016 ; `woff` sert de
 * repli pour les plus anciens. Les formats retires sont `eot` (Internet
 * Explorer, que Vue 3 ne prend de toute facon pas en charge), `ttf` (que
 * `woff` remplace partout) et `svg` (retire de Chrome en 2014 et de Safari
 * en 2017) : a eux trois ils representent pres de 2 Mo qu'aucun visiteur
 * ne telecharge jamais, mais qui partent a chaque livraison.
 */
const FORMATS_CONSERVES = ['woff2', 'woff'] as const

const BLOC_FONT_FACE = /@font-face\s*\{[^}]*\}/g
const ENTREE_SOURCE = /url\(([^)]+)\)(\s*format\((['"]?)([^'")]+)\3\))?/g

function extension(url: string): string {
  // Les URL de police portent parfois un fragment (`boxicons.svg?#boxicons`).
  return (url.split(/[?#]/)[0] ?? '').split('.').pop()?.toLowerCase() ?? ''
}

/**
 * Reecrit les declarations `src` d'une feuille de style pour ne referencer
 * que les formats conserves.
 *
 * Un bloc dont aucune source ne correspond est laisse intact : mieux vaut
 * livrer une police trop lourde qu'une police absente.
 */
export function allegerPolices(css: string): { css: string; blocsIntacts: number } {
  let blocsIntacts = 0

  const reecrit = css.replace(BLOC_FONT_FACE, (bloc) => {
    const sources: string[] = []
    for (const entree of bloc.matchAll(ENTREE_SOURCE)) {
      const url = entree[1] ?? ''
      const format = entree[4] ?? extension(url)
      if ((FORMATS_CONSERVES as readonly string[]).includes(format)) {
        sources.push(`url(${url}) format('${format}')`)
      }
    }

    if (sources.length === 0) {
      blocsIntacts += 1
      return bloc
    }

    // Toutes les declarations `src` du bloc sont remplacees par une seule :
    // certaines feuilles en empilent plusieurs pour cibler d'anciens moteurs.
    const sansSource = bloc.replace(/src\s*:[^;}]*;?/g, '')
    return sansSource.replace(/\}$/, `src:${sources.join(',')}}`)
  })

  return { css: reecrit, blocsIntacts }
}

/**
 * Retire des feuilles de style de dependances les formats de police que plus
 * aucun navigateur cible ne demande, pour qu'ils ne soient pas emis dans
 * `dist/`.
 */
export function policeIcones(): Plugin {
  return {
    name: 'police-icones',
    enforce: 'pre',
    transform(code, id) {
      if (!id.includes('node_modules') || !/\.css(\?.*)?$/.test(id)) return null
      if (!code.includes('@font-face')) return null

      const { css, blocsIntacts } = allegerPolices(code)
      if (blocsIntacts > 0) {
        this.warn(
          `${blocsIntacts} bloc(s) @font-face sans format conserve dans ${id} : ` +
            'la police est livree telle quelle.',
        )
      }
      return css === code ? null : { code: css, map: null }
    },
  }
}
