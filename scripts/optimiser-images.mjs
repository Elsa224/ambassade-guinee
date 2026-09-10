/**
 * Reencode les images du site en WebP a une taille raisonnable pour le web.
 *
 * Les fichiers d'origine venaient directement d'appareils photo : jusqu'a
 * 7200 x 4800 pixels et 18 Mo pour une seule image de banniere, alors qu'aucun
 * ecran n'en affiche plus de 2560 pixels de large. Le poids venait donc de la
 * definition, pas de la compression : c'est le redimensionnement qui fait
 * l'essentiel du gain, le passage en WebP ajoute environ un quart de plus.
 *
 * Le script est idempotent : relance-le apres avoir ajoute une image, il ne
 * retouchera pas celles deja converties.
 *
 * Usage : node scripts/optimiser-images.mjs [--verifier]
 *   --verifier : n'ecrit rien, affiche seulement ce qui serait fait.
 */
import { readdir, readFile, stat, unlink, writeFile } from 'node:fs/promises'
import { fileURLToPath } from 'node:url'
import path from 'node:path'
import process from 'node:process'
import sharp from 'sharp'

const RACINE = fileURLToPath(new URL('..', import.meta.url))
const DOSSIER_IMAGES = path.join(RACINE, 'src/assets/images')

/**
 * Largeur maximale par usage. Une banniere plein ecran a besoin de plus de
 * pixels qu'une vignette de carte : appliquer la meme limite a tout gaspille
 * d'un cote et degrade de l'autre.
 */
const LARGEURS = {
  banniere: 1920,
  illustration: 1600,
  carte: 1080,
  portrait: 1000,
}

/** Qualite WebP. Le calendrier contient du texte : il en demande davantage. */
const QUALITE_PAR_DEFAUT = 80
const QUALITE_TEXTE = 90

const USAGES = {
  'hero3.jpg': 'banniere',
  'hero4.jpg': 'banniere',
  'hero5.jpg': 'banniere',
  'hero6.jpg': 'banniere',
  'bghero.jpeg': 'banniere',
  'Cascade.jpg': 'illustration',
  'partenaire.jpg': 'illustration',
  'actualite1.jpg': 'carte',
  'actualite2.jpg': 'carte',
  'actualite3.jpg': 'carte',
  'actualite4.jpg': 'carte',
  'calendrierjoursferiesguinee.jpeg': 'illustration',
  'president.jpeg': 'portrait',
  'ministre.jpeg': 'portrait',
  'ambassadeur.jpeg': 'portrait',
  'activites.jpeg': 'portrait',
  // Logo et masque sont deja petits : on les reencode sans les redimensionner,
  // WebP preservant leur transparence.
  'logo.png': null,
  'masque.png': null,
}

const A_TEXTE = new Set(['calendrierjoursferiesguinee.jpeg'])
const EXTENSIONS_SOURCE = new Set(['.jpg', '.jpeg', '.png'])

const verifierSeulement = process.argv.includes('--verifier')

function enKo(octets) {
  return `${(octets / 1024).toFixed(0)} Ko`
}

const fichiers = (await readdir(DOSSIER_IMAGES)).sort()
let totalAvant = 0
let totalApres = 0
const inconnues = []

for (const nom of fichiers) {
  const extension = path.extname(nom).toLowerCase()
  if (!EXTENSIONS_SOURCE.has(extension)) continue

  if (!(nom in USAGES)) {
    inconnues.push(nom)
    continue
  }

  const source = path.join(DOSSIER_IMAGES, nom)
  const destination = path.join(DOSSIER_IMAGES, `${path.basename(nom, extension)}.webp`)

  const octetsAvant = (await stat(source)).size
  const usage = USAGES[nom]
  const largeur = usage === null ? null : LARGEURS[usage]
  const qualite = A_TEXTE.has(nom) ? QUALITE_TEXTE : QUALITE_PAR_DEFAUT

  let transformation = sharp(await readFile(source))
  const metadonnees = await transformation.metadata()
  if (largeur !== null && metadonnees.width > largeur) {
    // withoutEnlargement evite d'agrandir une image deja plus petite que la
    // limite : on ne fabrique jamais de pixels qui n'existaient pas.
    transformation = transformation.resize({ width: largeur, withoutEnlargement: true })
  }

  const donnees = await transformation.webp({ quality: qualite, effort: 6 }).toBuffer()

  totalAvant += octetsAvant
  totalApres += donnees.length

  const largeurFinale = largeur === null ? metadonnees.width : Math.min(metadonnees.width, largeur)
  console.log(
    `${nom.padEnd(36)} ${String(metadonnees.width).padStart(5)}px ${enKo(octetsAvant).padStart(9)}` +
      `  ->  ${String(largeurFinale).padStart(5)}px ${enKo(donnees.length).padStart(9)}`,
  )

  if (verifierSeulement) continue

  await writeFile(destination, donnees)
  await unlink(source)
}

if (inconnues.length > 0) {
  // Une image sans usage declare passerait a travers l'optimisation sans que
  // personne ne s'en apercoive : on refuse plutot que de l'ignorer.
  console.error(`\nImages sans usage declare dans USAGES : ${inconnues.join(', ')}`)
  console.error("Ajoute-les au tableau USAGES avec l'usage qui leur correspond.")
  process.exit(1)
}

const gain = totalAvant === 0 ? 0 : (1 - totalApres / totalAvant) * 100
console.log(
  `\nTotal ${enKo(totalAvant)} -> ${enKo(totalApres)} (${gain.toFixed(1)} % de moins)` +
    (verifierSeulement ? '  [verification seule, rien ecrit]' : ''),
)
