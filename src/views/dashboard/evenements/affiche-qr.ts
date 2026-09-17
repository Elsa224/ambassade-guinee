/**
 * Affiche d'inscription : une seule image, deux usages.
 *
 * L'impression sortait jusqu'ici une page blanche avec un titre en
 * sans-serif et un QR au milieu — rien qui ressemble a l'ambassade, rien
 * qu'on ait envie d'afficher dans un hall. Et il n'y avait aucun moyen
 * d'envoyer ce QR par messagerie autrement qu'en photographiant l'ecran.
 *
 * L'affiche est donc dessinee UNE fois, sur un canevas, aux couleurs du
 * tenant. La feuille imprimee et le JPEG partage sont la meme image : deux
 * rendus separes auraient diverge des la premiere retouche.
 */

/** Ce qu'il faut savoir pour composer l'affiche. Rien de plus. */
export interface DonneesAffiche {
  nomEvenement: string
  dateLisible: string
  heure: string
  lieu: string
  nomAmbassade: string
  urlInscription: string
  /** URI de donnees du QR, servie par le CMS. */
  qr: string
  /** Logo de l'ambassade. Son absence n'empeche rien. */
  logo?: string
  couleurs: CouleursAffiche
}

export interface CouleursAffiche {
  primaire: string
  secondaire: string
  accent: string
}

/**
 * A4 a 150 points par pouce : assez fin pour une impression franche, assez
 * leger pour partir sur une messagerie sans etre recompresse en bouillie.
 */
const LARGEUR = 1240
const HAUTEUR = 1754

const POLICE = '"Helvetica Neue", Helvetica, Arial, sans-serif'

/**
 * Replis NEUTRES, et c'est la seule chose qu'ils ont le droit d'etre.
 *
 * Un repli sur les couleurs d'un drapeau ferait imprimer a une ambassade
 * l'affiche d'une autre le jour ou le theme ne serait pas applique — c'est
 * exactement ce que garde `no-hardcoded-brand-colors`. Du gris et du
 * gris-bleu ne designent personne : l'affiche sera terne, elle ne sera pas
 * fausse.
 */
const REPLIS_NEUTRES: CouleursAffiche = {
  primaire: '#1f2937',
  secondaire: '#9ca3af',
  accent: '#4b5563',
}

/** Couleurs du tenant, lues sur le document — la ou le theme est applique. */
export function couleursDuTenant(racine: HTMLElement = document.documentElement): CouleursAffiche {
  const style = getComputedStyle(racine)
  const lire = (variable: string, repli: string) => {
    const valeur = style.getPropertyValue(variable).trim()
    return valeur === '' ? repli : valeur
  }
  return {
    primaire: lire('--color-primary', REPLIS_NEUTRES.primaire),
    secondaire: lire('--color-secondary', REPLIS_NEUTRES.secondaire),
    accent: lire('--color-accent', REPLIS_NEUTRES.accent),
  }
}

/**
 * Charge une image.
 *
 * `crossOrigin` est pose avant la source : sans lui, un logo servi depuis un
 * autre hote souillerait le canevas et `toBlob` leverait une exception au
 * moment du partage — c'est-a-dire apres coup, sur un geste de l'utilisateur.
 * Un echec rend `null` : l'affiche se compose sans le logo plutot que de ne
 * pas se composer du tout.
 */
function chargerImage(source: string): Promise<HTMLImageElement | null> {
  return new Promise((resoudre) => {
    const image = new Image()
    if (!source.startsWith('data:')) image.crossOrigin = 'anonymous'
    image.onload = () => resoudre(image)
    image.onerror = () => resoudre(null)
    image.src = source
  })
}

/**
 * Decoupe un texte en lignes qui tiennent dans la largeur donnee.
 *
 * Le nom d'un evenement vient d'Ambassade Secure : il peut faire trois mots
 * ou trente. Sans ce decoupage, il sortirait de l'affiche par la droite.
 */
function enLignes(
  contexte: CanvasRenderingContext2D,
  texte: string,
  largeurMax: number,
  lignesMax: number,
): string[] {
  const mots = texte.split(/\s+/).filter((mot) => mot !== '')
  const lignes: string[] = []
  let courante = ''

  for (const mot of mots) {
    const essai = courante === '' ? mot : `${courante} ${mot}`
    if (contexte.measureText(essai).width <= largeurMax || courante === '') {
      courante = essai
    } else {
      lignes.push(courante)
      courante = mot
    }
  }
  if (courante !== '') lignes.push(courante)

  if (lignes.length <= lignesMax) return lignes
  const gardees = lignes.slice(0, lignesMax)
  gardees[lignesMax - 1] = `${gardees[lignesMax - 1]!.replace(/\s+\S*$/, '')}…`
  return gardees
}

/** Rectangle a coins arrondis, sans dependre de `roundRect` (Safari ancien). */
function cheminArrondi(
  contexte: CanvasRenderingContext2D,
  x: number,
  y: number,
  largeur: number,
  hauteur: number,
  rayon: number,
): void {
  contexte.beginPath()
  contexte.moveTo(x + rayon, y)
  contexte.arcTo(x + largeur, y, x + largeur, y + hauteur, rayon)
  contexte.arcTo(x + largeur, y + hauteur, x, y + hauteur, rayon)
  contexte.arcTo(x, y + hauteur, x, y, rayon)
  contexte.arcTo(x, y, x + largeur, y, rayon)
  contexte.closePath()
}

/** Compose l'affiche et rend le canevas. */
export async function dessinerAffiche(donnees: DonneesAffiche): Promise<HTMLCanvasElement> {
  const canevas = document.createElement('canvas')
  canevas.width = LARGEUR
  canevas.height = HAUTEUR
  const ctx = canevas.getContext('2d')
  if (!ctx) throw new Error("Le navigateur n'a pas fourni de contexte de dessin.")

  const { primaire, secondaire, accent } = donnees.couleurs

  // Fond
  ctx.fillStyle = '#ffffff'
  ctx.fillRect(0, 0, LARGEUR, HAUTEUR)

  // Bandeau institutionnel
  const BANDEAU = 300
  ctx.fillStyle = primaire
  ctx.fillRect(0, 0, LARGEUR, BANDEAU)
  ctx.fillStyle = secondaire
  ctx.fillRect(0, BANDEAU, LARGEUR, 12)

  let texteGauche = 90
  if (donnees.logo) {
    const logo = await chargerImage(donnees.logo)
    if (logo) {
      const cote = 150
      const rapport = logo.width > 0 ? logo.height / logo.width : 1
      const largeur = rapport > 1 ? cote / rapport : cote
      const hauteur = rapport > 1 ? cote : cote * rapport
      ctx.drawImage(logo, 90, (BANDEAU - hauteur) / 2, largeur, hauteur)
      texteGauche = 90 + largeur + 40
    }
  }

  ctx.fillStyle = '#ffffff'
  ctx.textBaseline = 'middle'
  ctx.font = `600 38px ${POLICE}`
  const lignesAmbassade = enLignes(ctx, donnees.nomAmbassade, LARGEUR - texteGauche - 90, 2)
  const departAmbassade = BANDEAU / 2 - ((lignesAmbassade.length - 1) * 50) / 2
  lignesAmbassade.forEach((ligne, rang) => {
    ctx.fillText(ligne, texteGauche, departAmbassade + rang * 50)
  })

  // Titre de l'evenement
  let y = BANDEAU + 12 + 120
  ctx.textBaseline = 'top'
  ctx.fillStyle = accent
  ctx.font = `700 26px ${POLICE}`
  ctx.fillText('INVITATION À S’INSCRIRE', 90, y)
  y += 60

  ctx.fillStyle = '#1f2937'
  ctx.font = `700 68px ${POLICE}`
  const lignesTitre = enLignes(ctx, donnees.nomEvenement, LARGEUR - 180, 3)
  lignesTitre.forEach((ligne, rang) => ctx.fillText(ligne, 90, y + rang * 82))
  y += lignesTitre.length * 82 + 40

  // Date, heure, lieu
  ctx.fillStyle = '#4b5563'
  ctx.font = `400 34px ${POLICE}`
  const quand = donnees.heure ? `${donnees.dateLisible} à ${donnees.heure}` : donnees.dateLisible
  for (const ligne of [quand, donnees.lieu].filter((valeur) => valeur !== '')) {
    for (const morceau of enLignes(ctx, ligne, LARGEUR - 180, 2)) {
      ctx.fillText(morceau, 90, y)
      y += 48
    }
  }

  // Le QR, dans son cadre.
  //
  // Le cadre est CENTRE dans ce qui reste entre le bloc d'informations et le
  // pied, plutot que pose a une hauteur fixe : un titre d'une ligne et un
  // titre de trois lignes laissent des espaces tres differents, et une
  // position fixe creusait un trou au milieu de l'affiche dans le premier cas.
  const CADRE = 620
  const LEGENDE = 200
  const cadreX = (LARGEUR - CADRE) / 2
  const hautDisponible = y + 40
  const basDisponible = HAUTEUR - 36 - LEGENDE
  const cadreY = Math.max(
    hautDisponible,
    hautDisponible + (basDisponible - hautDisponible - CADRE) / 2,
  )

  ctx.fillStyle = '#ffffff'
  cheminArrondi(ctx, cadreX, cadreY, CADRE, CADRE, 32)
  ctx.fill()
  ctx.strokeStyle = '#e5e7eb'
  ctx.lineWidth = 3
  ctx.stroke()

  const image = await chargerImage(donnees.qr)
  if (!image) throw new Error("Le QR n'a pas pu être chargé.")
  const MARGE = 44
  ctx.drawImage(image, cadreX + MARGE, cadreY + MARGE, CADRE - MARGE * 2, CADRE - MARGE * 2)

  // Consigne et adresse
  let bas = cadreY + CADRE + 56
  ctx.textAlign = 'center'
  ctx.fillStyle = '#1f2937'
  ctx.font = `600 36px ${POLICE}`
  ctx.fillText('Scannez ce code pour vous inscrire', LARGEUR / 2, bas)
  bas += 56

  ctx.fillStyle = '#6b7280'
  ctx.font = `400 24px ${POLICE}`
  for (const morceau of enLignes(ctx, donnees.urlInscription, LARGEUR - 180, 2)) {
    ctx.fillText(morceau, LARGEUR / 2, bas)
    bas += 34
  }
  ctx.textAlign = 'left'

  // Pied
  ctx.fillStyle = primaire
  ctx.fillRect(0, HAUTEUR - 24, LARGEUR, 24)
  ctx.fillStyle = secondaire
  ctx.fillRect(0, HAUTEUR - 36, LARGEUR, 12)

  return canevas
}

/**
 * L'affiche en JPEG.
 *
 * JPEG et non PNG : une affiche de ce format pese environ 200 Ko en JPEG
 * contre plus d'un megaoctet en PNG, et les messageries recompressent de
 * toute facon. Le fond est deja opaque, aucune transparence n'est perdue.
 */
export async function afficheEnJpeg(donnees: DonneesAffiche): Promise<Blob> {
  const canevas = await dessinerAffiche(donnees)
  return await new Promise((resoudre, rejeter) => {
    canevas.toBlob(
      (blob) =>
        blob ? resoudre(blob) : rejeter(new Error("L'image de l'affiche n'a pas pu être créée.")),
      'image/jpeg',
      0.92,
    )
  })
}

/** Nom de fichier tire du nom de l'evenement, sans accents ni ponctuation. */
export function nomDeFichier(nomEvenement: string): string {
  const base = nomEvenement
    .normalize('NFD')
    .replace(/\p{Diacritic}/gu, '')
    .replace(/[^a-zA-Z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '')
    .toLowerCase()
  return `inscription-${base === '' ? 'evenement' : base}.jpg`
}
