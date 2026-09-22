import { apiGet, apiPost, apiPut, apiPatch, apiDelete, apiUpload, ApiError } from './client'

/**
 * Contenu d'accueil servi par le CMS : mot de bienvenue, dirigeants, vitrine.
 *
 * Ces trois blocs etaient ecrits en dur dans le gabarit, avec le contenu de
 * l'ambassade de Guinee aux Etats-Unis. Les servir par ambassade est ce qui
 * empeche qu'ils reapparaissent sur un autre domaine.
 *
 * Le contrat complet est dans `docs/contrat-contenu-accueil.md`.
 */

export interface MotDeBienvenue {
  title: string
  /** Assaini cote serveur : le front l'insere avec `v-html`. */
  body_html: string
}

/**
 * La biographie de l'ambassadeur, servie par le CMS.
 *
 * `body_html` est assaini cote serveur, avec la meme liste blanche que le
 * mot de bienvenue : le front l'insere avec `v-html`. `image_url` reste
 * `null` tant que le portrait n'a pas ete televerse.
 */
export interface BiographieAmbassadeur {
  name: string
  title: string
  image_url: string | null
  body_html: string
}

export interface Dirigeant {
  id: number
  name: string
  role: string
  subtitle: string | null
  image_url: string
  position: number
}

export interface ImageVitrine {
  id: number
  image_url: string
  alt: string | null
  position: number
}

/**
 * Les deux mises en page de la banniere d'accueil.
 *
 * `classique` est la banniere du gabarit, celle qui s'affiche aujourd'hui.
 * `diaporama` est la maquette demandee par la direction : des photos plein
 * ecran qui defilent, chacune portant une citation signee. Ce sont deux mises
 * en page du meme bloc, pas deux blocs.
 */
export const VARIANTES_BANNIERE = ['classique', 'diaporama'] as const
export type VarianteBanniere = (typeof VARIANTES_BANNIERE)[number]

export interface DiapositiveBanniere {
  id: number
  image_url: string
  /** Texte brut : il se lie en interpolation, jamais en `v-html`. */
  quote: string | null
  author: string | null
  position: number
}

/**
 * La banniere d'accueil choisie par l'ambassade.
 *
 * `title` a `null` laisse le gabarit afficher le nom de l'ambassade du
 * bootstrap, comme aujourd'hui ; `intro` a `null` n'affiche aucune accroche.
 * Les quatre champs de texte — ici `title` et `intro`, et `quote` et `author`
 * sur chaque diapositive — sont du TEXTE BRUT stocke en texte brut : les
 * balises sont retirees a l'ecriture. Ils se lient en interpolation normale.
 * Le gabarit porte par ailleurs des champs assainis qui, eux, s'inserent en
 * `v-html` (`welcome.body_html`, la biographie, le corps d'un service) : le
 * reflexe existe, d'ou cette phrase.
 */
export interface BanniereAccueil {
  variant: VarianteBanniere
  title: string | null
  intro: string | null
  slides: DiapositiveBanniere[]
}

export interface ContenuAccueil {
  /**
   * `null` vaut « l'ambassade n'a rien choisi » : le gabarit sert sa banniere
   * par defaut. La cle est toujours presente, jamais absente.
   */
  hero: BanniereAccueil | null
  welcome: MotDeBienvenue | null
  ambassador: BiographieAmbassadeur | null
  leaders: Dirigeant[]
  showcase: ImageVitrine[]
}

interface Enveloppe<T> {
  data: T
}

/** Le contenu vide : ce que le gabarit affiche tant que l'API ne sert rien. */
export const CONTENU_VIDE: ContenuAccueil = {
  hero: null,
  welcome: null,
  ambassador: null,
  leaders: [],
  showcase: [],
}

/**
 * Ordonne par `position`, pas par `id`.
 *
 * Un nouvel element insere en tete porte l'identifiant le plus grand : trier
 * par identifiant le renverrait en fin de liste, ce que personne n'a demande.
 */
function ordonner<T extends { position: number }>(elements: readonly T[]): T[] {
  return [...elements].sort((a, b) => a.position - b.position)
}

/**
 * Ramene une reponse partielle a un contenu complet.
 *
 * Un bloc absent vaut vide, jamais le contenu du gabarit : c'est la seule
 * garantie qui empeche la fuite d'identite de revenir.
 */
export function normaliserContenu(
  servi: Partial<ContenuAccueil> | null | undefined,
): ContenuAccueil {
  return {
    hero: normaliserBanniere(servi?.hero),
    welcome: servi?.welcome ?? null,
    ambassador: servi?.ambassador ?? null,
    leaders: ordonner(servi?.leaders ?? []),
    showcase: ordonner(servi?.showcase ?? []),
  }
}

/**
 * Ce que le front lit du bloc `hero`.
 *
 * Deux replis, et aucun n'est defensif : une variante inconnue vaut
 * `classique`, parce que le contrat le dit et qu'une ambassade ne doit pas
 * perdre sa banniere parce qu'un mot a change ; et `slides` absent vaut liste
 * vide, comme partout ailleurs. La regle « un diaporama sans image retombe sur
 * classique » n'est PAS appliquee ici : elle regarde l'affichage, et l'ecran
 * d'administration doit continuer de montrer la variante reellement
 * enregistree.
 */
export function normaliserBanniere(
  servie: Partial<BanniereAccueil> | null | undefined,
): BanniereAccueil | null {
  if (servie === null || servie === undefined) return null
  return {
    variant: estVarianteConnue(servie.variant) ? servie.variant : 'classique',
    title: servie.title ?? null,
    intro: servie.intro ?? null,
    slides: ordonner(servie.slides ?? []),
  }
}

function estVarianteConnue(valeur: unknown): valeur is VarianteBanniere {
  return typeof valeur === 'string' && (VARIANTES_BANNIERE as readonly string[]).includes(valeur)
}

export async function recupererContenuAccueil(): Promise<ContenuAccueil> {
  const reponse = await apiGet<Enveloppe<Partial<ContenuAccueil>>>('/api/content/home')
  return normaliserContenu(reponse.data)
}

// --- Administration -------------------------------------------------------

const ADMIN = '/api/admin/content'

export async function recupererContenuAdmin(): Promise<ContenuAccueil> {
  const reponse = await apiGet<Enveloppe<Partial<ContenuAccueil>>>(`${ADMIN}/home`)
  return normaliserContenu(reponse.data)
}

export async function enregistrerMotDeBienvenue(mot: MotDeBienvenue): Promise<MotDeBienvenue> {
  const reponse = await apiPut<Enveloppe<MotDeBienvenue>>(`${ADMIN}/welcome`, mot)
  return reponse.data
}

export function supprimerMotDeBienvenue(): Promise<void> {
  return apiDelete(`${ADMIN}/welcome`)
}

/**
 * Enregistre la biographie de l'ambassadeur.
 *
 * Le PUT remplace le bloc entier : envoyer `image_url` a `null` retire le
 * portrait, il n'y a pas de mise a jour partielle.
 */
export async function enregistrerBiographieAmbassadeur(
  biographie: BiographieAmbassadeur,
): Promise<BiographieAmbassadeur> {
  const reponse = await apiPut<Enveloppe<BiographieAmbassadeur>>(`${ADMIN}/ambassador`, biographie)
  return reponse.data
}

export function supprimerBiographieAmbassadeur(): Promise<void> {
  return apiDelete(`${ADMIN}/ambassador`)
}

export type DirigeantSaisi = Omit<Dirigeant, 'id' | 'position'>

export async function ajouterDirigeant(saisi: DirigeantSaisi): Promise<Dirigeant> {
  const reponse = await apiPost<Enveloppe<Dirigeant>>(`${ADMIN}/leaders`, saisi)
  return reponse.data
}

export async function modifierDirigeant(
  id: number,
  saisi: Partial<DirigeantSaisi>,
): Promise<Dirigeant> {
  const reponse = await apiPatch<Enveloppe<Dirigeant>>(`${ADMIN}/leaders/${id}`, saisi)
  return reponse.data
}

export function supprimerDirigeant(id: number): Promise<void> {
  return apiDelete(`${ADMIN}/leaders/${id}`)
}

export function ordonnerDirigeants(ids: readonly number[]): Promise<void> {
  return apiPut(`${ADMIN}/leaders/order`, { ids })
}

export type ImageVitrineSaisie = Omit<ImageVitrine, 'id' | 'position'>

export async function ajouterImageVitrine(saisie: ImageVitrineSaisie): Promise<ImageVitrine> {
  const reponse = await apiPost<Enveloppe<ImageVitrine>>(`${ADMIN}/showcase`, saisie)
  return reponse.data
}

export async function modifierImageVitrine(
  id: number,
  saisie: Partial<ImageVitrineSaisie>,
): Promise<ImageVitrine> {
  const reponse = await apiPatch<Enveloppe<ImageVitrine>>(`${ADMIN}/showcase/${id}`, saisie)
  return reponse.data
}

export function supprimerImageVitrine(id: number): Promise<void> {
  return apiDelete(`${ADMIN}/showcase/${id}`)
}

export function ordonnerVitrine(ids: readonly number[]): Promise<void> {
  return apiPut(`${ADMIN}/showcase/order`, { ids })
}

/** Ce que porte le `PUT /hero` : la mise en page et ses deux textes, rien d'autre. */
export type BanniereSaisie = Pick<BanniereAccueil, 'variant' | 'title' | 'intro'>

/**
 * Remplace la banniere sans toucher aux diapositives.
 *
 * Les diapositives ont leurs propres routes, comme les dirigeants et la
 * vitrine. L'effacement franc est reserve a `supprimerBanniere`, et c'est la
 * toute la difference entre les deux gestes.
 */
export async function enregistrerBanniere(saisie: BanniereSaisie): Promise<BanniereAccueil> {
  const reponse = await apiPut<Enveloppe<BanniereAccueil>>(`${ADMIN}/hero`, saisie)
  return reponse.data
}

/**
 * Supprime la banniere, **et ses diapositives avec elle**.
 *
 * L'ecran qui appelle ceci doit l'annoncer en toutes lettres : un « retour au
 * defaut » qui garderait secretement cinq images, pretes a reapparaitre a la
 * prochaine ecriture, est un piege. Pour garder les images en affichant la
 * banniere simple, on enregistre `variant: 'classique'` — c'est a cela que
 * sert la variante.
 */
export function supprimerBanniere(): Promise<void> {
  return apiDelete(`${ADMIN}/hero`)
}

export type DiapositiveSaisie = Omit<DiapositiveBanniere, 'id' | 'position'>

/** Le back refuse la sixieme en 422 ; le front n'en propose pas davantage. */
export const DIAPOSITIVES_MAX = 5

export async function ajouterDiapositive(saisie: DiapositiveSaisie): Promise<DiapositiveBanniere> {
  const reponse = await apiPost<Enveloppe<DiapositiveBanniere>>(`${ADMIN}/hero/slides`, saisie)
  return reponse.data
}

export async function modifierDiapositive(
  id: number,
  saisie: Partial<DiapositiveSaisie>,
): Promise<DiapositiveBanniere> {
  const reponse = await apiPatch<Enveloppe<DiapositiveBanniere>>(
    `${ADMIN}/hero/slides/${id}`,
    saisie,
  )
  return reponse.data
}

export function supprimerDiapositive(id: number): Promise<void> {
  return apiDelete(`${ADMIN}/hero/slides/${id}`)
}

/**
 * Reordonne les diapositives.
 *
 * Cette route rend **404** quand l'ambassade n'a pas encore de banniere, la ou
 * `leaders/order` et `showcase/order` rendent 422 : la banniere est
 * proprietaire de ses diapositives, son absence signifie que l'operation n'a
 * pas d'objet. L'ecran doit donc traiter ce 404 comme « la banniere a disparu
 * depuis le chargement », c'est-a-dire recharger, et non comme « introuvable ».
 */
export function ordonnerDiapositives(ids: readonly number[]): Promise<void> {
  return apiPut(`${ADMIN}/hero/slides/order`, { ids })
}

/** Bornes du televersement, reprises du contrat pour les verifier avant envoi. */
export const TYPES_IMAGE_ACCEPTES = ['image/webp', 'image/png', 'image/jpeg'] as const
export const TAILLE_IMAGE_MAX = 5 * 1024 * 1024

/**
 * Televerse une image et rend son URL definitive.
 *
 * Le controle de surface evite un aller-retour sur un fichier manifestement
 * refusable ; le serveur reste l'autorite et repond 422 ou 413.
 */
export async function televerserImage(fichier: File): Promise<string> {
  const formulaire = new FormData()
  formulaire.append('file', fichier)
  const reponse = await apiUpload<Enveloppe<{ url: string }>>(`${ADMIN}/media`, formulaire)
  return reponse.data.url
}

/** Message d'un refus previsible, ou `null` si le fichier est acceptable. */
export function refusDuFichier(fichier: File, borne = TAILLE_IMAGE_MAX): string | null {
  if (!TYPES_IMAGE_ACCEPTES.includes(fichier.type as (typeof TYPES_IMAGE_ACCEPTES)[number])) {
    return 'Formats acceptés : WebP, PNG ou JPEG.'
  }
  if (fichier.size > borne) {
    // La borne differe selon la route : 5 Mo pour le contenu, 10 pour les
    // medias d'article. Le message doit dire celle qui s'applique.
    return `L'image ne doit pas dépasser ${Math.round(borne / (1024 * 1024))} Mo.`
  }
  return null
}

/**
 * Message affichable d'un echec.
 *
 * Le CMS renvoie un `message` en francais directement presentable ; le repli
 * ne sert qu'aux pannes reseau, ou aucune reponse n'est parvenue. Une panne
 * n'est jamais presentee comme une faute de saisie.
 *
 * Le cas du 413 passe AVANT le message du serveur, et c'est voulu : un envoi
 * trop volumineux peut etre refuse par le serveur frontal avant d'atteindre
 * l'application, qui rend alors une page HTML sans cle `message`. Le client
 * fabrique dans ce cas « Erreur 413 », un texte techniquement exact et
 * inutilisable pour la personne qui televerse. Le contrat back le dit
 * explicitement : le message soigne n'est garanti que si la requete atteint
 * l'application.
 */
export function messageErreurContenu(souleve: unknown): string {
  if (souleve instanceof ApiError && souleve.statut === 413) {
    return souleve.corpsPorteUnMessage ? souleve.message : 'Le fichier dépasse la taille acceptée.'
  }
  if (souleve instanceof ApiError && souleve.statut !== 0 && souleve.message.trim() !== '') {
    return souleve.message
  }
  return 'Le service est momentanément indisponible. Réessayez dans un instant.'
}
