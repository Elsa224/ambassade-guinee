import { apiGet, apiPut, ApiError } from './client'
import {
  normaliserEmbassy,
  type Embassy,
  type EmbassyServie,
  type NumeroTelephone,
} from './bootstrap'
import type { ThemeColors } from '@/theme/applyTheme'

/**
 * Identite, coordonnees et couleurs de l'ambassade, en ecriture.
 *
 * Le contrat est le lot 1 de `docs/contrat-parametres-ambassade.md`. Ces
 * champs sont servis en lecture par `/api/bootstrap` depuis le premier jour ;
 * ce module est la face manquante, celle qui les modifie.
 *
 * Trois champs de l'ambassade sont volontairement absents de cette surface :
 *
 * - `slug`, qui identifie le tenant partout, y compris dans ce qui est deja
 *   ecrit en base ;
 * - `domain`, dont une faute de frappe rend le site injoignable ;
 * - `modules`, qui est du provisionnement. Le gabarit traite ces drapeaux
 *   comme fermes par defaut et decide de ce qu'il affiche a partir d'eux :
 *   les rendre modifiables ici laisserait une ambassade s'ouvrir une rubrique
 *   que l'exploitant n'a pas provisionnee.
 */

/**
 * Ce que le formulaire envoie : la forme imbriquee du bootstrap, pas la forme
 * aplatie que consomme le gabarit.
 *
 * `contact.phone` en est absent, et ce n'est pas un oubli : le numero
 * principal est **derive** de la premiere entree de `phones`. L'API refuse un
 * `phone` isole par une erreur de validation plutot que de l'ignorer, ce qui
 * est la bonne maniere de refuser — l'ecran apprend que son intention n'a pas
 * ete honoree au lieu de croire avoir enregistre.
 */
export interface EmbassySaisie {
  display_name: string
  identite: {
    country_name_official: string
    country_name_short: string
    demonym: string
    logo_image: string
    flag_image: string
  }
  contact: {
    address: string
    phones: NumeroTelephone[]
    email: string
    hours: string
  }
  theme: ThemeColors
}

/**
 * Les deux enveloppes, qui different alors que la forme interne est la meme.
 *
 * `/api/bootstrap` rend `{ "embassy": … }` ; les routes d'administration
 * rendent une ressource seule, donc `{ "data": … }`. Le back sert la meme
 * classe des deux cotes, deliberement, pour qu'aucun second normaliseur
 * n'ait a exister.
 */
interface EnveloppeAdmin {
  data: EmbassyServie
}

/**
 * Rebatit la forme imbriquee a partir de l'ambassade aplatie du store.
 *
 * Le gabarit consomme `country_name_official` a plat ; l'API le recoit sous
 * `identite`. Un seul endroit fait la conversion, ici, pour qu'une divergence
 * ne puisse pas s'installer entre la lecture et l'ecriture.
 */
export function versSaisie(embassy: Embassy): EmbassySaisie {
  return {
    display_name: embassy.display_name,
    identite: {
      country_name_official: embassy.country_name_official,
      country_name_short: embassy.country_name_short,
      demonym: embassy.demonym,
      logo_image: embassy.logo_image,
      flag_image: embassy.flag_image,
    },
    contact: {
      address: embassy.contact.address,
      // `phone` n'est pas repris : il est derive de la premiere entree.
      phones: embassy.contact.phones.map((numero) => ({ ...numero })),
      email: embassy.contact.email,
      hours: embassy.contact.hours,
    },
    theme: { ...embassy.theme },
  }
}

export async function recupererEmbassyAdmin(): Promise<Embassy> {
  const reponse = await apiGet<EnveloppeAdmin>('/api/admin/embassy')
  return normaliserEmbassy(reponse.data)
}

/**
 * Enregistre l'ambassade et rend sa forme a jour, telle que le serveur l'a
 * retenue.
 *
 * Ce que la charge utile ne porte pas est aussi important que ce qu'elle
 * porte : `slug`, `domain` et `modules` sont refuses en ecriture, chacun avec
 * son message. Reposter l'objet recu tel quel ferait donc echouer
 * l'enregistrement entier en 422 — d'ou `versSaisie`, qui ne retient que les
 * champs modifiables.
 */
export async function enregistrerEmbassy(saisie: EmbassySaisie): Promise<Embassy> {
  const reponse = await apiPut<EnveloppeAdmin>('/api/admin/embassy', saisie)
  return normaliserEmbassy(reponse.data)
}

/** Bornes du contrat, reprises pour prevenir avant l'envoi plutot qu'apres. */
export const NUMEROS_MAX = 20
export const LONGUEURS_MAX = {
  display_name: 191,
  country_name_official: 191,
  country_name_short: 191,
  demonym: 191,
  address: 2000,
  email: 191,
  hours: 500,
  phone_label: 60,
  phone_number: 40,
} as const

// --- Couleurs -------------------------------------------------------------

/** Les trois couleurs du theme, et le texte que le gabarit pose dessus. */
export const COULEURS_DU_THEME = [
  { champ: 'color_primary', libelle: 'Couleur principale', texteClair: true },
  { champ: 'color_secondary', libelle: 'Couleur secondaire', texteClair: false },
  { champ: 'color_accent', libelle: "Couleur d'accent", texteClair: true },
] as const satisfies readonly { champ: keyof ThemeColors; libelle: string; texteClair: boolean }[]

/** Le fonce que le gabarit pose sur la couleur secondaire (`--color-ink-dark`). */
const ENCRE_FONCEE = '#2a5563'

const HEXADECIMAL = /^#(?:[0-9a-fA-F]{3}|[0-9a-fA-F]{6})$/

/** Vrai pour `#abc` comme pour `#aabbcc`, faux pour tout le reste. */
export function estCouleurValide(valeur: string): boolean {
  return HEXADECIMAL.test(valeur.trim())
}

function composantes(hexadecimal: string): [number, number, number] {
  let corps = hexadecimal.trim().slice(1)
  if (corps.length === 3) corps = [...corps].map((c) => c + c).join('')
  return [
    parseInt(corps.slice(0, 2), 16),
    parseInt(corps.slice(2, 4), 16),
    parseInt(corps.slice(4, 6), 16),
  ]
}

/** Luminance relative, formule WCAG 2.1. */
function luminance(hexadecimal: string): number {
  const [rouge, vert, bleu] = composantes(hexadecimal).map((octet) => {
    const proportion = octet / 255
    return proportion <= 0.03928 ? proportion / 12.92 : ((proportion + 0.055) / 1.055) ** 2.4
  }) as [number, number, number]
  return 0.2126 * rouge + 0.7152 * vert + 0.0722 * bleu
}

/** Rapport de contraste entre deux couleurs, de 1 (identiques) a 21. */
export function rapportDeContraste(premiere: string, seconde: string): number {
  const premiereLuminance = luminance(premiere)
  const secondeLuminance = luminance(seconde)
  const claire = Math.max(premiereLuminance, secondeLuminance)
  const sombre = Math.min(premiereLuminance, secondeLuminance)
  return (claire + 0.05) / (sombre + 0.05)
}

/**
 * Deux seuils, parce qu'un seul serait faux dans un sens ou dans l'autre.
 *
 * `CONTRASTE_REFUSE` est le plancher des normes pour un grand titre ou
 * l'element d'une interface : en dessous, la couleur est illisible quelle que
 * soit la taille du texte, et l'ecran la refuse.
 *
 * `CONTRASTE_CONFORTABLE` est le seuil du texte courant. Entre les deux, on
 * avertit sans bloquer, et c'est un choix assume : le vert du drapeau
 * gabonais, `#009E60`, vaut 3,47 sous du texte blanc. Refuser a une ambassade
 * la couleur de son propre drapeau au nom d'une norme serait une decision que
 * ce formulaire n'a pas a prendre a sa place. On la previent, elle tranche.
 */
export const CONTRASTE_REFUSE = 3
export const CONTRASTE_CONFORTABLE = 4.5

/** Ce que l'ecran a a dire d'une couleur : rien, une reserve, ou un refus. */
export interface AvisSurCouleur {
  niveau: 'refus' | 'avertissement'
  message: string
}

/**
 * Juge une couleur sur la paire que le gabarit emploie reellement.
 *
 * Le controle ne porte pas sur la couleur seule : le primaire et l'accent
 * portent du texte blanc, la secondaire du texte fonce. Un jaune vif est
 * excellent en secondaire et illisible en primaire, et l'inverse vaut pour un
 * bleu sombre. Juger la couleur hors de sa paire ne voudrait rien dire.
 */
export function avisSurLaCouleur(valeur: string, texteClair: boolean): AvisSurCouleur | null {
  if (!estCouleurValide(valeur)) {
    return { niveau: 'refus', message: 'Entrez une couleur hexadécimale, par exemple #009E60.' }
  }

  const contraste = rapportDeContraste(valeur, texteClair ? '#ffffff' : ENCRE_FONCEE)
  const pose = texteClair ? 'blanc' : 'foncé'
  const direction = texteClair ? 'sombre' : 'claire'

  if (contraste < CONTRASTE_REFUSE) {
    return {
      niveau: 'refus',
      message: `Le texte ${pose} posé sur cette couleur serait illisible. Choisissez une teinte plus ${direction}.`,
    }
  }
  if (contraste < CONTRASTE_CONFORTABLE) {
    return {
      niveau: 'avertissement',
      message: `Convient aux titres, mais le petit texte ${pose} y sera difficile à lire.`,
    }
  }
  return null
}

/**
 * Message affichable d'un echec d'enregistrement.
 *
 * Meme regle que le contenu d'accueil : le CMS rend un `message` en francais
 * directement presentable, et le repli ne sert qu'aux pannes reseau, ou
 * aucune reponse n'est parvenue. Une panne n'est jamais presentee comme une
 * faute de saisie.
 */
export function messageErreurEmbassy(souleve: unknown): string {
  if (souleve instanceof ApiError && souleve.statut !== 0 && souleve.message.trim() !== '') {
    return souleve.message
  }
  return 'Le service est momentanément indisponible. Réessayez dans un instant.'
}
