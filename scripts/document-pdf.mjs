/**
 * Rend un document Markdown en PDF, aux couleurs de l'ambassade.
 *
 * Usage : node scripts/document-pdf.mjs docs/mon-document.md [sortie.pdf]
 *
 * Le document remis a une ambassade est imprime : il doit porter les couleurs
 * du drapeau et pas celles du gabarit de developpement. Les valeurs sont
 * ecrites ici parce qu'un PDF n'a pas de tenant a interroger — c'est le seul
 * endroit du depot ou une couleur gabonaise est legitimement en dur, et la
 * garde des couleurs de marque ne balaye pas `scripts/`.
 */
import { readFileSync, mkdirSync } from 'node:fs'
import { dirname, basename } from 'node:path'
import { chromium } from 'playwright-core'

const VERT = '#009e60'
const JAUNE = '#fcd116'
const BLEU = '#3a75c4'
const ENCRE = '#1f2d33'

/** Echappe ce qui pourrait etre lu comme du balisage. */
function echapper(texte) {
  return texte.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;')
}

/** Gras, code et liens, dans cet ordre pour que le code ne soit pas regrasse. */
function enrichir(texte) {
  return echapper(texte)
    .replace(/`([^`]+)`/g, '<code>$1</code>')
    .replace(/\*\*([^*]+)\*\*/g, '<strong>$1</strong>')
}

function cellules(ligne) {
  return ligne
    .trim()
    .replace(/^\||\|$/g, '')
    .split('|')
    .map((c) => c.trim())
}

/**
 * Conversion suffisante pour les documents de ce depot : titres, tableaux,
 * listes, citations, regles horizontales et paragraphes. Volontairement
 * petite — une dependance de plus pour six constructions n'en vaut pas la
 * peine, et ce qui n'est pas reconnu ressort en paragraphe plutot que d'etre
 * perdu.
 */
function versHtml(markdown) {
  const lignes = markdown.split('\n')
  const sortie = []
  let i = 0

  while (i < lignes.length) {
    const ligne = lignes[i]

    if (ligne.trim() === '') {
      i += 1
      continue
    }

    if (/^---+$/.test(ligne.trim())) {
      sortie.push('<hr />')
      i += 1
      continue
    }

    const titre = ligne.match(/^(#{1,4})\s+(.*)$/)
    if (titre) {
      const niveau = titre[1].length
      sortie.push(`<h${niveau}>${enrichir(titre[2])}</h${niveau}>`)
      i += 1
      continue
    }

    // Tableau : une ligne de cellules suivie d'une ligne de separation.
    if (ligne.includes('|') && /^\|?\s*:?-{2,}/.test(lignes[i + 1] ?? '')) {
      const entetes = cellules(ligne)
      i += 2
      const corps = []
      while (i < lignes.length && lignes[i].includes('|') && lignes[i].trim() !== '') {
        corps.push(cellules(lignes[i]))
        i += 1
      }
      const th = entetes.map((c) => `<th>${enrichir(c)}</th>`).join('')
      const tr = corps
        .map((r) => `<tr>${r.map((c) => `<td>${enrichir(c) || '&nbsp;'}</td>`).join('')}</tr>`)
        .join('')
      sortie.push(`<table><thead><tr>${th}</tr></thead><tbody>${tr}</tbody></table>`)
      continue
    }

    if (/^\s*[-*]\s+/.test(ligne)) {
      const elements = []
      while (i < lignes.length && /^\s*[-*]\s+/.test(lignes[i])) {
        elements.push(`<li>${enrichir(lignes[i].replace(/^\s*[-*]\s+/, ''))}</li>`)
        i += 1
      }
      sortie.push(`<ul>${elements.join('')}</ul>`)
      continue
    }

    if (ligne.startsWith('>')) {
      const elements = []
      while (i < lignes.length && lignes[i].startsWith('>')) {
        elements.push(lignes[i].replace(/^>\s?/, ''))
        i += 1
      }
      sortie.push(`<blockquote>${enrichir(elements.join(' '))}</blockquote>`)
      continue
    }

    const paragraphe = []
    while (
      i < lignes.length &&
      lignes[i].trim() !== '' &&
      !/^(#{1,4}\s|>|\s*[-*]\s|---+$)/.test(lignes[i]) &&
      !lignes[i].includes('|')
    ) {
      paragraphe.push(lignes[i].trim())
      i += 1
    }
    if (paragraphe.length > 0) sortie.push(`<p>${enrichir(paragraphe.join(' '))}</p>`)
    else i += 1
  }

  return sortie.join('\n')
}

function page(corps) {
  return `<!doctype html>
<html lang="fr"><head><meta charset="utf-8" />
<style>
  @page { size: A4; margin: 18mm 16mm 20mm; }
  * { box-sizing: border-box; }
  body {
    font-family: "Helvetica Neue", Helvetica, Arial, sans-serif;
    color: ${ENCRE}; font-size: 10.5pt; line-height: 1.55; margin: 0;
  }
  h1 {
    font-size: 21pt; color: ${VERT}; margin: 0 0 4mm; line-height: 1.2;
    border-bottom: 3px solid ${JAUNE}; padding-bottom: 3mm;
  }
  h2 {
    font-size: 14pt; color: ${VERT}; margin: 9mm 0 3mm;
    break-after: avoid; page-break-after: avoid;
  }
  h3 { font-size: 11.5pt; color: ${ENCRE}; margin: 6mm 0 2mm; break-after: avoid; }
  p { margin: 0 0 3mm; }
  ul { margin: 0 0 3mm; padding-left: 5mm; }
  li { margin-bottom: 1.5mm; }
  hr { border: 0; border-top: 1px solid #d9e0e3; margin: 7mm 0; }
  blockquote {
    margin: 0 0 4mm; padding: 3mm 4mm; background: #f4f7f8;
    border-left: 3px solid ${BLEU}; font-size: 9.5pt; color: #4a5c64;
  }
  code {
    font-family: "SF Mono", Menlo, Consolas, monospace; font-size: 9pt;
    background: #f1f4f5; padding: 0.4mm 1mm; border-radius: 1mm;
  }
  table {
    width: 100%; border-collapse: collapse; margin: 0 0 4mm; font-size: 9.5pt;
    break-inside: avoid; page-break-inside: avoid;
  }
  th {
    background: ${VERT}; color: #ffffff; text-align: left; font-weight: 600;
    padding: 2mm 2.5mm; border: 1px solid ${VERT};
  }
  td { padding: 2mm 2.5mm; border: 1px solid #d9e0e3; vertical-align: top; }
  tbody tr:nth-child(even) td { background: #f7fafa; }
  strong { color: ${ENCRE}; }
</style></head><body>${corps}</body></html>`
}

const entree = process.argv[2]
if (!entree) {
  console.error('Usage : node scripts/document-pdf.mjs <document.md> [sortie.pdf]')
  process.exit(1)
}
const sortie = process.argv[3] ?? entree.replace(/\.md$/, '.pdf')

const html = page(versHtml(readFileSync(entree, 'utf8')))
mkdirSync(dirname(sortie), { recursive: true })

const navigateur = await chromium.launch()
const onglet = await navigateur.newPage()
await onglet.setContent(html, { waitUntil: 'load' })
await onglet.pdf({
  path: sortie,
  format: 'A4',
  printBackground: true,
  displayHeaderFooter: true,
  headerTemplate: '<div></div>',
  footerTemplate: `<div style="width:100%;font-size:8pt;color:#8a9aa1;padding:0 16mm;
    font-family:Helvetica,Arial,sans-serif;display:flex;justify-content:space-between;">
    <span>${basename(entree, '.md')}</span><span class="pageNumber"></span></div>`,
  margin: { top: '18mm', bottom: '20mm', left: '16mm', right: '16mm' },
})
await navigateur.close()
console.log(sortie)
