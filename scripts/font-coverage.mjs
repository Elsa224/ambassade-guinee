/**
 * Lecture de la couverture de caracteres d un fichier de police WOFF.
 *
 * Motivation : les polices « Futura Cyrillic » initialement livrees etaient des
 * sous-ensembles sans aucune lettre accentuee, ce qui faisait retomber tous les
 * accents francais sur une police systeme. Cet outil rend la regression
 * detectable par un test automatique.
 *
 * Usage direct : node scripts/font-coverage.mjs src/assets/fonts/FuturaPT-Book.woff2
 */
import { readFileSync } from 'node:fs'
import { inflateSync } from 'node:zlib'

/** Extrait les tables d un conteneur WOFF (signature wOFF). */
function tablesWoff(tampon) {
  const numTables = tampon.readUInt16BE(12)
  const tables = new Map()
  for (let i = 0; i < numTables; i += 1) {
    const base = 44 + i * 20
    const tag = tampon.toString('ascii', base, base + 4)
    const offset = tampon.readUInt32BE(base + 4)
    const compLength = tampon.readUInt32BE(base + 8)
    const origLength = tampon.readUInt32BE(base + 12)
    const brut = tampon.subarray(offset, offset + compLength)
    tables.set(tag, compLength < origLength ? inflateSync(brut) : brut)
  }
  return tables
}

/** Extrait les tables d une police sfnt non compressee (OTF/TTF). */
function tablesSfnt(tampon) {
  const numTables = tampon.readUInt16BE(4)
  const tables = new Map()
  for (let i = 0; i < numTables; i += 1) {
    const base = 12 + i * 16
    const tag = tampon.toString('ascii', base, base + 4)
    const offset = tampon.readUInt32BE(base + 8)
    const length = tampon.readUInt32BE(base + 12)
    tables.set(tag, tampon.subarray(offset, offset + length))
  }
  return tables
}

/** Sous-table cmap au format 4 : segments de plage. */
function codePointsFormat4(cmap, debut) {
  const segCount = cmap.readUInt16BE(debut + 6) / 2
  const finSegments = debut + 14
  const debutSegments = finSegments + segCount * 2 + 2

  const resultat = new Set()
  for (let i = 0; i < segCount; i += 1) {
    const fin = cmap.readUInt16BE(finSegments + i * 2)
    const commence = cmap.readUInt16BE(debutSegments + i * 2)
    if (commence === 0xffff) continue // segment sentinelle
    for (let cp = commence; cp <= fin; cp += 1) resultat.add(cp)
  }
  return resultat
}

/** Sous-table cmap au format 12 : groupes 32 bits. */
function codePointsFormat12(cmap, debut) {
  const nGroupes = cmap.readUInt32BE(debut + 12)
  const resultat = new Set()
  for (let i = 0; i < nGroupes; i += 1) {
    const base = debut + 16 + i * 12
    const commence = cmap.readUInt32BE(base)
    const fin = cmap.readUInt32BE(base + 4)
    for (let cp = commence; cp <= fin; cp += 1) resultat.add(cp)
  }
  return resultat
}

/** Retourne l ensemble des points de code couverts par la police. */
export function codePointsDeLaPolice(chemin) {
  const tampon = readFileSync(chemin)
  const signature = tampon.toString('ascii', 0, 4)

  if (signature === 'wOF2') {
    throw new Error(
      'WOFF2 non pris en charge par ce lecteur. Fournir aussi un .woff, ' +
        'ou convertir avec `npx wawoff2 decompress`.',
    )
  }

  const tables = signature === 'wOFF' ? tablesWoff(tampon) : tablesSfnt(tampon)
  const cmap = tables.get('cmap')
  if (!cmap) throw new Error(`Table cmap absente de ${chemin}`)

  const nTables = cmap.readUInt16BE(2)
  const resultat = new Set()
  for (let i = 0; i < nTables; i += 1) {
    const offset = cmap.readUInt32BE(4 + i * 8 + 4)
    const format = cmap.readUInt16BE(offset)
    if (format === 4) for (const cp of codePointsFormat4(cmap, offset)) resultat.add(cp)
    if (format === 12) for (const cp of codePointsFormat12(cmap, offset)) resultat.add(cp)
  }
  return resultat
}

// Execution directe en ligne de commande.
if (process.argv[1]?.endsWith('font-coverage.mjs')) {
  const chemin = process.argv[2]
  const cps = codePointsDeLaPolice(chemin)
  const accents = [...'éèêëàâäçîïôöûùü'].filter((c) => !cps.has(c.codePointAt(0)))
  console.log(`${chemin} : ${cps.size} glyphes`)
  console.log(`accents manquants : ${accents.join('') || 'aucun'}`)
}
