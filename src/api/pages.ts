import { apiGet, apiPut } from './client'

/**
 * Pages redactionnelles servies par le CMS.
 *
 * `/presentation`, `/chancellerie` et `/relations-bilaterales` portaient leur
 * texte ecrit en dur dans le gabarit, celui de l'ambassade de Guinee aux
 * Etats-Unis : juridiction americaine, « 1959 », « 186 ambassades a Washington
 * DC ». La parade etait une fermeture de rubrique, qui protegeait les autres
 * ambassades sans rien leur donner.
 *
 * Le contrat complet est dans `docs/contrat-contenu-redactionnel.md`.
 */

/**
 * Les pages que le gabarit sait dessiner.
 *
 * La liste est FERMEE, et elle se ferme cote serveur : un `PUT` sur un slug
 * inconnu rend 422. Le filtrage fait ici est une ceinture, pas la fermeture —
 * il evite qu'une page servie par erreur cherche une route qui n'existe pas.
 *
 * `ambition-numerique` porte le texte de la fiche gabonaise sur la
 * digitalisation, qui annonce des services encore inexistants. Elsa a tranche
 * le 21/09/2026 : le texte officiel est publie sans etre reecrit, mais sur une
 * page qui se presente comme une vision et non comme une offre de services.
 */
export const SLUGS_DE_PAGE = [
  'presentation',
  'chancellerie',
  'relations-bilaterales',
  'ambition-numerique',
] as const

export type SlugDePage = (typeof SLUGS_DE_PAGE)[number]

export interface PageRedactionnelle {
  id: number
  slug: SlugDePage
  title: string
  subtitle: string | null
  hero_image_url: string | null
  /** Assaini cote serveur : le front l'insere avec `v-html`. */
  body_html: string | null
  position: number
  /**
   * Absent de la surface VISITEUR, present sur celle d'administration.
   *
   * Ce n'est pas une negligence du serveur : la surface visiteur ne sert que
   * ce qui est publie, donc le champ n'y porterait aucune information. Il est
   * donc facultatif ici, et l'ecran d'administration le lit avec un repli.
   * Le declarer obligatoire ferait mentir le type sur la moitie des reponses.
   */
  published?: boolean
}

/**
 * Un chiffre marquant : « 2026 », « Annee d'ouverture de la mission ».
 *
 * `value` est une CHAINE et non un entier, et c'est le contrat qui le veut :
 * une ambassade ecrit « 1 200+ » aussi bien que « 11 ».
 */
export interface ChiffreMarquant {
  value: string
  label: string
}

/**
 * Ce que sert `GET /api/content/pages`.
 *
 * `jurisdiction` et `figures` sont globaux a l'ambassade et non attaches a une
 * page : la juridiction s'affiche a la fois sur `/presentation` et sur
 * `/chancellerie`, et la dupliquer dans deux corps de page garantirait qu'elle
 * diverge.
 */
export interface ContenuDesPages {
  pages: PageRedactionnelle[]
  jurisdiction: string[]
  figures: ChiffreMarquant[]
}

interface Enveloppe<T> {
  data: T
}

/**
 * Le corps tel qu'il arrive du reseau.
 *
 * `slug` y est une chaine libre et non un `SlugDePage` : c'est tout l'interet
 * du filtrage. Typer l'entree comme deja validee reviendrait a supposer ce
 * qu'on verifie.
 */
export interface ContenuDesPagesServi {
  pages?: (Omit<PageRedactionnelle, 'slug'> & { slug: string })[]
  jurisdiction?: string[]
  figures?: ChiffreMarquant[]
}

/** Ce que le gabarit affiche tant que l'API ne sert rien : rien. */
export const PAGES_VIDES: ContenuDesPages = {
  pages: [],
  jurisdiction: [],
  figures: [],
}

/** Vrai si le slug servi figure dans la liste que le gabarit sait dessiner. */
function slugConnu(valeur: unknown): valeur is SlugDePage {
  return typeof valeur === 'string' && (SLUGS_DE_PAGE as readonly string[]).includes(valeur)
}

/**
 * Ce que le front lit du corps servi.
 *
 * Un bloc absent vaut bloc vide, jamais contenu du gabarit : c'est la regle
 * qui empeche une ambassade de montrer les pages d'une autre.
 *
 * L'ordre servi fait foi — `position` peut porter des trous apres une
 * suppression, et retrier dessus deplacerait des pages sans que personne ne
 * l'ait demande.
 */
export function normaliserPages(servi: ContenuDesPagesServi | null): ContenuDesPages {
  return {
    pages: (servi?.pages ?? []).filter((page): page is PageRedactionnelle => slugConnu(page.slug)),
    jurisdiction: [...(servi?.jurisdiction ?? [])],
    figures: [...(servi?.figures ?? [])],
  }
}

export async function recupererPages(): Promise<ContenuDesPages> {
  const reponse = await apiGet<Enveloppe<ContenuDesPagesServi>>('/api/content/pages')
  return normaliserPages(reponse.data)
}

/**
 * La page demandee, ou `null` si l'ambassade ne l'a pas publiee.
 *
 * `null` n'est pas une panne : c'est la retractation. L'appelant affiche
 * « Rubrique en preparation » plutot que le texte d'une autre ambassade.
 */
export function pageParSlug(contenu: ContenuDesPages, slug: SlugDePage): PageRedactionnelle | null {
  return contenu.pages.find((page) => page.slug === slug) ?? null
}

// --- Administration -------------------------------------------------------

const ADMIN = '/api/admin/pages'

/**
 * Le contenu vu par l'administration, pages non publiees comprises.
 *
 * La surface visiteur ne sert que le publie ; celle-ci sert tout, sans quoi
 * une page depubliee deviendrait inaccessible a qui veut la reprendre.
 */
export async function recupererPagesAdmin(): Promise<ContenuDesPages> {
  const reponse = await apiGet<Enveloppe<ContenuDesPagesServi>>(ADMIN)
  return normaliserPages(reponse.data)
}

/** Ce qu'un ecran d'administration envoie pour une page. */
export type PageSaisie = Pick<
  PageRedactionnelle,
  'title' | 'subtitle' | 'hero_image_url' | 'body_html'
> & {
  /** Obligatoire a l'ecriture, meme si la lecture visiteur ne le porte pas. */
  published: boolean
}

/**
 * Enregistre une page : creation ou remplacement, sans distinction.
 *
 * Les pages ne se creent pas, leur liste est fermee — un `PUT` sur un slug de
 * la liste qui n'a pas encore de ligne la cree. Le precedent est le mot de
 * bienvenue, dont le controleur fait un `updateOrCreate` depuis son premier
 * commit et rend 200 dans les deux cas.
 *
 * Le remplacement est COMPLET : tous les champs partent a chaque envoi, y
 * compris ceux laisses vides, pour qu'un champ efface le soit vraiment.
 */
export async function enregistrerPage(
  slug: SlugDePage,
  saisie: PageSaisie,
): Promise<PageRedactionnelle> {
  const reponse = await apiPut<Enveloppe<PageRedactionnelle>>(`${ADMIN}/${slug}`, saisie)
  return reponse.data
}

/** Ce qu'un ecran d'administration envoie pour les deux blocs globaux. */
export interface ParametresDesPages {
  jurisdiction: string[]
  figures: ChiffreMarquant[]
}

export async function enregistrerParametresDesPages(
  parametres: ParametresDesPages,
): Promise<ParametresDesPages> {
  const reponse = await apiPut<Enveloppe<ParametresDesPages>>(
    '/api/admin/pages-settings',
    parametres,
  )
  return reponse.data
}
