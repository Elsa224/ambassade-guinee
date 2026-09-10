/**
 * Convertit les .otf livres en .woff2 (format servi) et .woff (repli navigateur,
 * et seul format lu par scripts/font-coverage.mjs).
 * Usage : node scripts/convert-fonts.mjs
 */
import { execFileSync } from 'node:child_process'
import { readdirSync } from 'node:fs'
import { join } from 'node:path'

const DOSSIER = 'src/assets/fonts'

const script = `
import sys
from fontTools.ttLib import TTFont
source = sys.argv[1]
for flavor in ('woff2', 'woff'):
    font = TTFont(source)
    font.flavor = flavor
    cible = source[:-4] + '.' + flavor
    font.save(cible)
    print('ecrit', cible)
`

for (const fichier of readdirSync(DOSSIER).filter((f) => f.endsWith('.otf'))) {
  execFileSync('python3', ['-c', script, join(DOSSIER, fichier)], { stdio: 'inherit' })
}
