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
  /** Presentation de l'evenement, telle que saisie. Peut etre vide. */
  description: string
  /** Type servi par Ambassade Secure, affiche en pastille. Souvent absent. */
  typeLabel: string
  dateLisible: string
  heure: string
  lieu: string
  nomAmbassade: string
  urlInscription: string
  /** URI de donnees du QR, servie par le CMS. */
  qr: string
  /**
   * Logo a poser dans le bandeau : celui de l'ambassade si le CMS en sert
   * un, celui de l'evenement sinon. Son absence n'empeche rien — le nom de
   * l'ambassade tient seul le bandeau.
   */
  logo?: string
  couleurs: CouleursAffiche
}

export interface CouleursAffiche {
  primaire: string
  secondaire: string
  accent: string
}

/**
 * Une CARTE, pas une page.
 *
 * La premiere version remplissait une A4 : imprimable, mais impartageable —
 * une feuille entiere dans une conversation WhatsApp se lit mal, et personne
 * n'a envie d'envoyer une page a quelqu'un. Le billet se partage tel quel et
 * s'imprime centre sur la feuille.
 *
 * 1000 x 1180 : assez fin pour une impression franche, assez leger pour
 * partir sur une messagerie sans etre recompresse en bouillie.
 */
const LARGEUR = 1000
const HAUTEUR = 1180
const ENTETE = 430
const MARGE = 56

/**
 * Le liseré autour du billet.
 *
 * Il n'est pas decoratif : le billet a des coins arrondis, et un canevas
 * transparent devient NOIR en JPEG. Poser le billet sur un fond clair plutot
 * que de le faire saigner jusqu'au bord donne de vrais coins arrondis sans
 * transparence — et, accessoirement, l'air qu'une carte demande.
 */
const LISERE = 28

/**
 * La police de marque du gabarit, celle du site et du tableau de bord.
 *
 * Les six graisses fournies sont 300, 400, 500, 700, 800 et 900 : n'en
 * demander aucune autre, le navigateur SYNTHETISERAIT la graisse manquante
 * en epaississant les traits, et l'affiche imprimee trahirait la marque
 * exactement la ou elle est censee la porter.
 */
const POLICE = '"Futura LT Pro", "Segoe UI", system-ui, sans-serif'

/** Chasse fixe pour l'adresse : un « l » et un « 1 » doivent se distinguer. */
const CHASSE_FIXE = 'ui-monospace, "SF Mono", Menlo, Consolas, monospace'

/** Les tirages reellement employes ci-dessous, a charger avant de dessiner. */
const TIRAGES = ['500 22px', '500 26px', '800 46px', '400 26px', '500 27px', '400 22px']

/**
 * Attend que la police soit disponible.
 *
 * Un canevas ne declenche AUCUN chargement de police : il dessine avec ce
 * qui est deja la, et se rabat en silence sur la police systeme sinon. Sans
 * cette attente, la premiere affiche d'une session sortait en Segoe UI —
 * defaut invisible au developpement, ou la police est en cache.
 */
async function attendreLesPolices(): Promise<void> {
  if (!('fonts' in document)) return
  try {
    await Promise.all(TIRAGES.map((tirage) => document.fonts.load(`${tirage} ${POLICE}`)))
    await document.fonts.ready
  } catch {
    // Police indisponible : l'affiche sortira dans la police de repli. Mieux
    // vaut une affiche moins belle que pas d'affiche du tout.
  }
}

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

/**
 * Assombrit une couleur CSS, pour le degrade de l'entete.
 *
 * Passe par le canevas pour la resoudre : la valeur du tenant peut etre en
 * hexadecimal, en `rgb()` ou en `oklch()`, et seule une vraie resolution
 * couvre les trois. Une couleur qu'on ne sait pas lire est rendue telle
 * quelle — un degrade plat vaut mieux qu'une couleur fausse.
 */
function assombrir(couleur: string, part: number): string {
  const canevas = document.createElement('canvas')
  canevas.width = 1
  canevas.height = 1
  const ctx = canevas.getContext('2d', { willReadFrequently: true })
  if (!ctx) return couleur
  try {
    ctx.fillStyle = couleur
    ctx.fillRect(0, 0, 1, 1)
    const [r, v, b] = ctx.getImageData(0, 0, 1, 1).data
    const reduire = (valeur: number) => Math.max(0, Math.round(valeur * (1 - part)))
    return `rgb(${reduire(r!)}, ${reduire(v!)}, ${reduire(b!)})`
  } catch {
    return couleur
  }
}

/**
 * Decoupe une chaine sans espaces — une adresse — en morceaux qui tiennent.
 *
 * `enLignes` coupe aux espaces : sur une URL, elle rendrait une seule ligne
 * debordante. Ici on coupe au caractere.
 */
function enCaracteres(
  contexte: CanvasRenderingContext2D,
  texte: string,
  largeurMax: number,
  lignesMax: number,
): string[] {
  const lignes: string[] = []
  let courante = ''
  for (const caractere of texte) {
    if (contexte.measureText(courante + caractere).width > largeurMax && courante !== '') {
      lignes.push(courante)
      courante = caractere
      if (lignes.length === lignesMax) break
    } else {
      courante += caractere
    }
  }
  if (lignes.length < lignesMax && courante !== '') lignes.push(courante)
  const reste = texte.slice(lignes.join('').length)
  if (reste !== '' && lignes.length > 0) {
    lignes[lignes.length - 1] = `${lignes[lignes.length - 1]!.slice(0, -1)}…`
  }
  return lignes
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

/** Petits reperes dessines a la main : une police d'icones ne s'impose pas ici. */
function glyphe(
  ctx: CanvasRenderingContext2D,
  genre: 'date' | 'heure' | 'lieu',
  x: number,
  y: number,
  taille: number,
): void {
  ctx.save()
  ctx.strokeStyle = ctx.fillStyle
  ctx.lineWidth = 2.5
  ctx.lineJoin = 'round'
  const c = taille / 2

  if (genre === 'date') {
    cheminArrondi(ctx, x, y + 3, taille, taille - 4, 4)
    ctx.stroke()
    ctx.beginPath()
    ctx.moveTo(x, y + 11)
    ctx.lineTo(x + taille, y + 11)
    ctx.moveTo(x + 6, y)
    ctx.lineTo(x + 6, y + 6)
    ctx.moveTo(x + taille - 6, y)
    ctx.lineTo(x + taille - 6, y + 6)
    ctx.stroke()
  } else if (genre === 'heure') {
    ctx.beginPath()
    ctx.arc(x + c, y + c, c - 1, 0, Math.PI * 2)
    ctx.stroke()
    ctx.beginPath()
    ctx.moveTo(x + c, y + c - 6)
    ctx.lineTo(x + c, y + c)
    ctx.lineTo(x + c + 5, y + c + 3)
    ctx.stroke()
  } else {
    ctx.beginPath()
    ctx.moveTo(x + c, y + taille)
    ctx.bezierCurveTo(x + c - 10, y + taille - 9, x, y + c, x + c, y)
    ctx.bezierCurveTo(x + taille, y + c, x + c + 10, y + taille - 9, x + c, y + taille)
    ctx.stroke()
    ctx.beginPath()
    ctx.arc(x + c, y + c - 2, 3.5, 0, Math.PI * 2)
    ctx.stroke()
  }
  ctx.restore()
}

/** Compose le billet et rend le canevas. */
export async function dessinerAffiche(donnees: DonneesAffiche): Promise<HTMLCanvasElement> {
  const canevas = document.createElement('canvas')
  canevas.width = LARGEUR + LISERE * 2
  canevas.height = HAUTEUR + LISERE * 2
  const ctx = canevas.getContext('2d')
  if (!ctx) throw new Error("Le navigateur n'a pas fourni de contexte de dessin.")

  await attendreLesPolices()

  const { primaire, secondaire } = donnees.couleurs

  ctx.fillStyle = '#eef0f3'
  ctx.fillRect(0, 0, canevas.width, canevas.height)

  // Tout ce qui suit est dessine dans le repere du billet, et rogne a ses
  // coins arrondis : l'entete peut donc etre peinte en rectangle franc.
  ctx.translate(LISERE, LISERE)
  cheminArrondi(ctx, 0, 0, LARGEUR, HAUTEUR, 40)
  ctx.save()
  ctx.clip()

  ctx.fillStyle = '#ffffff'
  ctx.fillRect(0, 0, LARGEUR, HAUTEUR)

  // --- Entete ------------------------------------------------------------
  // Un degrade tres court, de la couleur du tenant vers elle-meme assombrie :
  // il donne du relief sans inventer une seconde couleur de marque.
  const degrade = ctx.createLinearGradient(0, 0, LARGEUR, ENTETE)
  degrade.addColorStop(0, primaire)
  degrade.addColorStop(1, assombrir(primaire, 0.22))
  ctx.fillStyle = degrade
  ctx.fillRect(0, 0, LARGEUR, ENTETE)

  ctx.textBaseline = 'top'

  // Surtitre et pastille de type
  ctx.fillStyle = 'rgba(255,255,255,0.75)'
  ctx.font = `500 22px ${POLICE}`
  ctx.letterSpacing = '4px'
  ctx.fillText('INSCRIPTION', MARGE, MARGE)
  ctx.letterSpacing = '0px'

  if (donnees.typeLabel !== '') {
    ctx.font = `500 24px ${POLICE}`
    const largeurTexte = ctx.measureText(donnees.typeLabel).width
    const largeurPastille = largeurTexte + 44
    const xPastille = LARGEUR - MARGE - largeurPastille
    ctx.fillStyle = 'rgba(255,255,255,0.22)'
    cheminArrondi(ctx, xPastille, MARGE - 8, largeurPastille, 46, 23)
    ctx.fill()
    ctx.fillStyle = '#ffffff'
    ctx.fillText(donnees.typeLabel, xPastille + 22, MARGE + 3)
  }

  // Vignette du logo, puis nom et presentation
  let texteX = MARGE
  const hautBloc = MARGE + 78
  if (donnees.logo) {
    const logo = await chargerImage(donnees.logo)
    if (logo) {
      const TUILE = 116
      ctx.fillStyle = '#ffffff'
      cheminArrondi(ctx, MARGE, hautBloc, TUILE, TUILE, 20)
      ctx.fill()
      const PADDING = 14
      const utile = TUILE - PADDING * 2
      const rapport = logo.width > 0 ? logo.height / logo.width : 1
      const l = rapport > 1 ? utile / rapport : utile
      const h = rapport > 1 ? utile : utile * rapport
      ctx.drawImage(logo, MARGE + (TUILE - l) / 2, hautBloc + (TUILE - h) / 2, l, h)
      texteX = MARGE + TUILE + 28
    }
  }

  const largeurTexte = LARGEUR - texteX - MARGE
  let y = hautBloc
  ctx.fillStyle = '#ffffff'
  ctx.font = `800 46px ${POLICE}`
  const lignesNom = enLignes(ctx, donnees.nomEvenement, largeurTexte, 2)
  lignesNom.forEach((ligne, rang) => ctx.fillText(ligne, texteX, y + rang * 56))
  y += lignesNom.length * 56 + 6

  if (donnees.description !== '') {
    ctx.fillStyle = 'rgba(255,255,255,0.82)'
    ctx.font = `400 26px ${POLICE}`
    for (const morceau of enLignes(ctx, donnees.description, largeurTexte, 2)) {
      ctx.fillText(morceau, texteX, y)
      y += 34
    }
  }

  // Bandeau d'informations, en bas de l'entete
  const BANDE = 76
  const bandeY = ENTETE - BANDE
  ctx.fillStyle = 'rgba(0,0,0,0.14)'
  ctx.fillRect(0, bandeY, LARGEUR, BANDE)

  ctx.fillStyle = '#ffffff'
  ctx.font = `500 26px ${POLICE}`
  const infos: ['date' | 'heure' | 'lieu', string][] = [
    ['date', donnees.dateLisible],
    ['heure', donnees.heure],
    ['lieu', donnees.lieu],
  ]
  let x = MARGE
  const yInfo = bandeY + BANDE / 2 - 13
  for (const [genre, valeur] of infos) {
    if (valeur === '') continue
    const reste = LARGEUR - MARGE - x - 34
    if (reste <= 60) break
    glyphe(ctx, genre, x, yInfo + 2, 22)
    x += 34
    const texte = enLignes(ctx, valeur, reste, 1)[0] ?? ''
    ctx.fillText(texte, x, yInfo)
    x += ctx.measureText(texte).width + 40
  }

  // Filet de la couleur secondaire : la seule touche de la seconde couleur.
  ctx.fillStyle = secondaire
  ctx.fillRect(0, ENTETE, LARGEUR, 6)

  // --- Corps -------------------------------------------------------------
  const CADRE = 470
  const cadreX = (LARGEUR - CADRE) / 2
  const cadreY = ENTETE + 6 + 64

  ctx.fillStyle = '#ffffff'
  cheminArrondi(ctx, cadreX, cadreY, CADRE, CADRE, 24)
  ctx.fill()
  ctx.strokeStyle = '#e5e7eb'
  ctx.lineWidth = 2
  ctx.stroke()

  const image = await chargerImage(donnees.qr)
  if (!image) throw new Error("Le QR n'a pas pu être chargé.")
  const INTERIEUR = 30
  ctx.drawImage(
    image,
    cadreX + INTERIEUR,
    cadreY + INTERIEUR,
    CADRE - INTERIEUR * 2,
    CADRE - INTERIEUR * 2,
  )

  let bas = cadreY + CADRE + 46
  ctx.textAlign = 'center'

  // L'adresse en chasse fixe : un « l » et un « 1 » doivent se distinguer,
  // c'est une adresse que quelqu'un recopiera peut-etre a la main.
  ctx.fillStyle = '#6b7280'
  ctx.font = `400 21px ${CHASSE_FIXE}`
  for (const morceau of enCaracteres(ctx, donnees.urlInscription, LARGEUR - MARGE * 2, 2)) {
    ctx.fillText(morceau, LARGEUR / 2, bas)
    bas += 30
  }
  bas += 18

  ctx.fillStyle = '#374151'
  ctx.font = `500 27px ${POLICE}`
  ctx.fillText('Scannez pour vous inscrire', LARGEUR / 2, bas)
  bas += 44

  ctx.fillStyle = '#9ca3af'
  ctx.font = `400 22px ${POLICE}`
  for (const morceau of enLignes(ctx, donnees.nomAmbassade, LARGEUR - MARGE * 2, 2)) {
    ctx.fillText(morceau, LARGEUR / 2, bas)
    bas += 30
  }
  ctx.textAlign = 'left'

  // Fin du rognage : le contour se pose sur le chemin du billet, qui est
  // encore celui du rognage, donc parfaitement aligne dessus.
  ctx.restore()
  ctx.strokeStyle = '#dfe3e8'
  ctx.lineWidth = 2
  ctx.stroke()

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
