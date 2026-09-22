import { apiGet, apiPost, apiPut, apiDelete } from './client'

/** Statuts de modération d'un article (spec 4.2). */
export type StatutArticle = 'brouillon' | 'a_valider' | 'publie'

/** Taxonomie gérée en base, en remplacement des listes en dur (spec 4.2). */
export interface Categorie {
  id: number
  nom: string
  slug: string
  /** Facultative cote serveur, et aucune vue ne s'en sert aujourd'hui. */
  couleur: string | null
}

/**
 * Couleur de fond d'une pastille de categorie.
 *
 * `couleur` est facultative cote serveur : une categorie creee sans elle
 * ressort a `null`. Les pastilles posent du texte blanc sur ce fond — sans
 * repli, le libelle deviendrait invisible sur la photographie.
 */
export function couleurDeCategorie(categorie: Categorie | null | undefined): string {
  return categorie?.couleur || 'var(--color-primary-dark)'
}

export interface Article {
  id: number
  slug: string
  titre: string
  resume: string
  contenu: string
  image: string
  categorie: Categorie
  date_publication: string
  statut: StatutArticle
  vues: number
  likes: number
  locale: string
  source: string
  /** Dérivé du nombre de mots côté serveur : jamais calculé ici. */
  temps_lecture: number
}

/** Charge utile d'écriture : sous-ensemble modifiable depuis le back-office. */
export interface BrouillonArticle {
  titre: string
  resume: string
  contenu: string
  /**
   * L'IDENTIFIANT de la categorie, pas son slug.
   *
   * Le gabarit envoyait `categorie_slug`, tire d'une liste de trois slugs
   * ecrite en dur depuis le plan de la phase 1. Les regles de validation du
   * serveur ne portent pas ce nom : le champ n'etait donc pas refuse, il
   * n'etait jamais regarde. L'article partait en 201 et ressortait sans
   * categorie, sans qu'aucun message n'avertisse le redacteur.
   *
   * Les categories sont des lignes propres a chaque ambassade, creees a la
   * demande : il n'existe aucune liste fixe qu'un gabarit pourrait porter.
   * Elles se lisent par `listerCategories`.
   */
  categorie_id: number | null
  statut: StatutArticle
  date_publication: string
  /**
   * La CLE du media, rendue par `televerserMedia`, jamais une URL.
   *
   * Absent du corps, le champ laisse l'image en place : c'est ainsi qu'on
   * modifie un article sans retoucher sa photographie, faute de pouvoir
   * reconstruire la cle depuis l'adresse servie en lecture.
   */
  image?: string
}

interface Enveloppe<T> {
  data: T
}

/**
 * La forme SERVIE d'un article, qui n'est pas tout a fait celle qu'on affiche.
 *
 * Le serveur nomme le champ `image_url` en lecture et accepte `image` en
 * ecriture. Le gabarit portait `image` des deux cotes depuis le plan de la
 * phase 1 : la vignette d'un article enregistre restait donc vide, l'attribut
 * `src` valant `undefined`. `image` reste conserve en repli, au cas ou une
 * route servirait encore l'ancien nom.
 */
interface ArticleServi extends Omit<Article, 'image'> {
  image_url?: string | null
  image?: string | null
}

function normaliserArticle(servi: ArticleServi): Article {
  const { image_url: adresse, image, ...reste } = servi
  return { ...reste, image: adresse ?? image ?? '' }
}

const LIBELLES: Record<StatutArticle, string> = {
  brouillon: 'Brouillon',
  a_valider: 'À valider',
  publie: 'Publié',
}

/** Libellé affichable d'un statut. */
export function libelleStatut(statut: StatutArticle): string {
  return LIBELLES[statut] ?? LIBELLES.brouillon
}

/**
 * Statut d'API correspondant à un libellé d'interface.
 * Repli sur `brouillon` : en cas de valeur inattendue, mieux vaut ne rien
 * publier que publier par accident.
 */
export function statutDepuisLibelle(libelle: string): StatutArticle {
  const trouve = (Object.keys(LIBELLES) as StatutArticle[]).find(
    (statut) => LIBELLES[statut] === libelle,
  )
  return trouve ?? 'brouillon'
}

/**
 * Les categories de l'ambassade courante.
 *
 * `GET /api/admin/categories` — et non `/api/admin/articles/categories`, qui
 * rend 404 parce que le liant de route y cherche un article nomme
 * « categories ».
 */
export async function listerCategories(): Promise<Categorie[]> {
  const reponse = await apiGet<Enveloppe<Categorie[]>>('/api/admin/categories')
  return reponse.data
}

/**
 * Cree une categorie pour l'ambassade courante.
 *
 * Le slug n'est pas envoye : le serveur le derive du nom et le rend unique
 * par ambassade. Deux ambassades peuvent donc porter le meme intitule sans
 * se marcher dessus.
 */
export async function creerCategorie(nom: string): Promise<Categorie> {
  const reponse = await apiPost<Enveloppe<Categorie>>('/api/admin/categories', { nom })
  return reponse.data
}

/** Filtres acceptes par la liste d'articles. */
export interface FiltresArticles {
  statut?: StatutArticle
  /** Slug de categorie, tel que renvoye dans `categorie.slug`. */
  categorie?: string
}

function versChaineDeRequete(filtres: FiltresArticles): string {
  const parametres = new URLSearchParams()
  if (filtres.statut) parametres.set('statut', filtres.statut)
  if (filtres.categorie) parametres.set('categorie', filtres.categorie)
  const chaine = parametres.toString()
  return chaine ? `?${chaine}` : ''
}

export async function listerArticles(filtres: FiltresArticles = {}): Promise<Article[]> {
  const reponse = await apiGet<Enveloppe<ArticleServi[]>>(
    `/api/articles${versChaineDeRequete(filtres)}`,
  )
  return reponse.data.map(normaliserArticle)
}

/**
 * La surface d'ADMINISTRATION des articles.
 *
 * `/api/articles` est la surface visiteur : elle ne repond qu'en lecture, et
 * le serveur le dit lui-meme — un `POST` y rend 405 avec `Allow: GET, HEAD`.
 * Les ecritures passent par `/api/admin/articles`, comme les pages passent
 * par `/api/admin/pages`. Le gabarit tenait l'ancienne adresse depuis le plan
 * de la phase 1, ecrit avant que le back ne separe les deux surfaces ; le
 * defaut n'est apparu que le jour ou quelqu'un a voulu creer un article.
 */
const ADMIN = '/api/admin/articles'

/**
 * Liste vue par l'administration, brouillons compris.
 *
 * La surface visiteur ne sert que le publie ; l'ecran d'administration doit
 * voir aussi ce qui ne l'est pas, sans quoi un brouillon enregistre
 * disparaitrait de la liste ou il a ete cree.
 */
export async function listerArticlesAdmin(filtres: FiltresArticles = {}): Promise<Article[]> {
  const reponse = await apiGet<Enveloppe<ArticleServi[]>>(`${ADMIN}${versChaineDeRequete(filtres)}`)
  return reponse.data.map(normaliserArticle)
}

/**
 * Liste destinee au site public.
 *
 * Le filtre `statut=publie` est demande au serveur, puis reapplique ici. Cette
 * seconde passe n'est pas une securite : un brouillon renvoye par l'API aurait
 * deja quitte le serveur. Elle garantit seulement qu'un defaut de filtrage
 * cote back ne se traduit pas par la publication accidentelle d'un brouillon
 * sur le site public. Le filtrage qui fait autorite reste celui du serveur.
 */
export async function listerArticlesPublies(categorie?: string): Promise<Article[]> {
  const articles = await listerArticles({ statut: 'publie', categorie })
  return articles.filter((article) => article.statut === 'publie')
}

export async function recupererArticleParSlug(slug: string): Promise<Article> {
  const reponse = await apiGet<Enveloppe<ArticleServi>>(`/api/articles/${encodeURIComponent(slug)}`)
  return normaliserArticle(reponse.data)
}

export async function creerArticle(brouillon: BrouillonArticle): Promise<Article> {
  const reponse = await apiPost<Enveloppe<ArticleServi>>(ADMIN, brouillon)
  return normaliserArticle(reponse.data)
}

export async function modifierArticle(id: number, brouillon: BrouillonArticle): Promise<Article> {
  const reponse = await apiPut<Enveloppe<ArticleServi>>(`${ADMIN}/${id}`, brouillon)
  return normaliserArticle(reponse.data)
}

export function supprimerArticle(id: number): Promise<void> {
  return apiDelete(`${ADMIN}/${id}`)
}
