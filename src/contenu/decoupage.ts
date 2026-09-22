/**
 * Decoupage d'un corps redactionnel servi par le CMS.
 *
 * Le corps est du HTML LIBRE : chaque ambassade ecrit le sien, et aucune ne
 * peut se voir imposer un gabarit en N cases. La mise en page se deduit donc
 * du texte lui-meme, en comptant ses titres de section.
 *
 * La regle, tranchee avec Elsa le 22/09/2026 sur la maquette « Le mandat en
 * grille » :
 *
 *   - aucun titre        -> un texte suivi ;
 *   - un a trois titres  -> un texte suivi, dont les titres sont rythmes ;
 *   - quatre titres et + -> une grille de cartes.
 *
 * Le seuil n'est pas arbitraire. La page de presentation du Gabon compte
 * 8 022 caracteres repartis en neuf sections de 417 a 852 caracteres : des
 * missions PARALLELES, et non les etapes d'un parcours. Une grille dit cela ;
 * un rouleau dit le contraire. En dessous de quatre, une grille n'aurait rien
 * a equilibrer.
 *
 * Aucun champ n'est demande au serveur pour autant : le decoupage se fait a
 * l'affichage, sur les titres que le texte porte deja.
 */

/** Une section, c'est-a-dire un `<h2>` et ce qui le suit jusqu'au suivant. */
export interface SectionDeContenu {
  titre: string
  /**
   * Le numero que l'ambassade a elle-meme ecrit dans son titre, sans le point.
   *
   * La fiche gabonaise numerote ses neuf missions. Ce numero est donc une
   * donnee du texte officiel, pas un ornement ajoute par le gabarit : on le
   * montre quand il existe, jamais on ne l'invente.
   */
  numero: string | null
  /** Le HTML de la section, titre exclu. Deja assaini cote serveur. */
  html: string
}

export type BlocDeContenu =
  /** Des sections de meme nature, montrees ensemble. */
  | { genre: 'grille'; sections: SectionDeContenu[] }
  /** Des sections rythmees dans le fil du texte. */
  | { genre: 'sections'; sections: SectionDeContenu[] }
  /**
   * Une section d'un autre registre que ses voisines, detachee.
   *
   * Le cas qui l'a fait naitre : « Le Gabon » ferme une page dont les neuf
   * autres sections sont des missions numerotees. La laisser dans la grille
   * aurait donne dix cartes sur trois colonnes, donc une carte seule en
   * derniere ligne — et aurait surtout range le pays parmi les missions.
   */
  | { genre: 'bande'; section: SectionDeContenu }

export interface ContenuDecoupe {
  /** Ce qui precede le premier titre : le chapeau de la page. */
  chapeau: string
  blocs: BlocDeContenu[]
}

/** A partir de combien de sections la grille prend le pas sur le texte suivi. */
export const SECTIONS_POUR_UNE_GRILLE = 4

export const CONTENU_VIDE: ContenuDecoupe = { chapeau: '', blocs: [] }

const NUMERO_EN_TETE = /^\s*(\d{1,2})\s*[.)]\s*/

function lireSection(titre: HTMLElement): SectionDeContenu {
  const texte = (titre.textContent ?? '').trim()
  const numero = NUMERO_EN_TETE.exec(texte)

  // On rassemble les freres jusqu'au titre suivant plutot que de decouper la
  // chaine : un `<h2>` ecrit avec un attribut, ou une balise refermee
  // autrement, ferait echouer une expression reguliere la ou le navigateur,
  // lui, a deja compris la structure.
  const morceaux: string[] = []
  let suivant = titre.nextElementSibling
  while (suivant !== null && suivant.tagName !== 'H2') {
    morceaux.push(suivant.outerHTML)
    suivant = suivant.nextElementSibling
  }

  return {
    titre: texte.replace(NUMERO_EN_TETE, ''),
    numero: numero?.[1] ?? null,
    html: morceaux.join(''),
  }
}

/**
 * Regroupe les sections en blocs, dans l'ordre du document.
 *
 * Les sections numerotees qui se suivent forment un bloc ; chaque section non
 * numerotee au milieu de sections numerotees se detache en bande. L'ordre
 * ecrit par l'ambassade est conserve tel quel : regrouper toutes les
 * numerotees en une seule grille deplacerait du texte.
 */
function grouper(sections: SectionDeContenu[]): BlocDeContenu[] {
  // Quand l'ambassade n'a numerote aucun titre, il n'y a qu'un seul registre :
  // toutes les sections vont ensemble, et seul leur nombre decide de la forme.
  if (sections.every((section) => section.numero === null)) {
    return sections.length === 0 ? [] : [{ genre: forme(sections), sections }]
  }

  const blocs: BlocDeContenu[] = []
  let suite: SectionDeContenu[] = []

  const fermer = () => {
    if (suite.length > 0) blocs.push({ genre: forme(suite), sections: suite })
    suite = []
  }

  for (const section of sections) {
    if (section.numero === null) {
      fermer()
      blocs.push({ genre: 'bande', section })
    } else {
      suite.push(section)
    }
  }
  fermer()

  return blocs
}

function forme(sections: readonly SectionDeContenu[]): 'grille' | 'sections' {
  return sections.length >= SECTIONS_POUR_UNE_GRILLE ? 'grille' : 'sections'
}

/**
 * Le corps servi, decoupe en blocs affichables.
 *
 * Un corps absent ou vide ne rend rien : la page se retracte, elle ne se
 * rabat jamais sur le contenu du gabarit.
 */
export function decouperContenu(html: string | null): ContenuDecoupe {
  if (html === null || html.trim() === '') return { chapeau: '', blocs: [] }

  const corps = new DOMParser().parseFromString(html, 'text/html').body
  const titres = [...corps.querySelectorAll(':scope > h2')] as HTMLElement[]

  if (titres.length === 0) return { chapeau: corps.innerHTML, blocs: [] }

  const chapeau: string[] = []
  for (
    let noeud = corps.firstElementChild;
    noeud !== titres[0];
    noeud = noeud!.nextElementSibling
  ) {
    chapeau.push(noeud!.outerHTML)
  }

  return { chapeau: chapeau.join(''), blocs: grouper(titres.map(lireSection)) }
}
