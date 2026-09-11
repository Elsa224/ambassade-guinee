/**
 * Rubriques du site public dont l'ouverture depend de l'ambassade.
 *
 * Une ambassade n'a pas forcement de consuls honoraires, de relations
 * bilaterales a presenter, ou le personnel de sa chancellerie a publier. Plutot
 * que de livrer a chaque ambassade les pages d'une autre, chaque rubrique est
 * rattachee ici a un drapeau que le tenant declare dans `modules`.
 */
export const RUBRIQUE_PAR_CHEMIN: Readonly<Record<string, string>> = {
  '/chancellerie': 'chancellerie',
  '/services-ambassadeur': 'services',
  // Le formulaire porte les pieces exigees par un seul pays d'accueil
  // (« preuve de residence aux USA ») : il suit la rubrique des services et
  // n'est pas un chemin neutre, contrairement a ce qu'on avait suppose.
  '/demarche-ligne': 'services',
  '/consuls-honoraires': 'consuls_honoraires',
  '/calendrier': 'calendrier',
  '/consulat': 'consulat',
  '/rendez-vous': 'rendez_vous',
  '/presentation': 'presentation',
  '/ambassadeur': 'ambassadeur',
  '/relations-bilaterales': 'bilateral',
  '/usa': 'bilateral',
  '/costa-rica': 'bilateral',
  '/haiti': 'bilateral',
  '/bahamas': 'bilateral',
  '/fond-monetaire': 'bilateral',
}

/** Nom de la rubrique dont depend un chemin, ou `null` s'il est toujours ouvert. */
export function rubriqueDuChemin(chemin: string): string | null {
  return RUBRIQUE_PAR_CHEMIN[chemin] ?? null
}

/**
 * Pages que le site n'offre que si l'ambassade a provisionne le module dont
 * elles dependent.
 *
 * Le defaut est ici l'inverse de celui des rubriques de contenu : un module
 * qui n'existe pas encore ne doit pas s'annoncer, alors qu'une page
 * editoriale absente de la configuration reste consultable sur le site dont
 * le gabarit porte le contenu.
 *
 * La page d'inscription `/evenements/inscription/{token}` n'y figure
 * volontairement pas. Elle n'est pas offerte par le site : on l'atteint par
 * un QR code imprime, remis en main propre, et qui peut circuler alors que le
 * module vient d'etre active ou desactive. Le back fait autorite sur ce
 * jeton-la — il rend 404 quand le module est inactif — et la page presente ce
 * cas avec un message qui parle du lien, la ou « Rubrique en preparation »
 * laisserait le porteur du QR sans explication.
 */
export const MODULE_PAR_CHEMIN: Readonly<Record<string, string>> = {
  '/evenements': 'secure_events',
}

/** Module dont depend un chemin, ou `null` s'il n'en depend d'aucun. */
export function moduleDuChemin(chemin: string): string | null {
  return MODULE_PAR_CHEMIN[chemin] ?? null
}

/**
 * Ambassade dont le gabarit porte encore le contenu en dur.
 *
 * Tant que les pages editoriales ne sont pas servies par l'API, leur texte,
 * leurs photos et leurs dirigeants sont ceux de cette ambassade-la, compiles
 * dans le bundle. Le defaut ouvert n'a donc de sens que pour elle : une
 * rubrique non declaree y montre son propre contenu, alors que sur tout autre
 * domaine elle montrerait celui du voisin.
 *
 * Cette constante disparaitra quand chaque page tirera son contenu du CMS.
 */
export const CONTENU_INTEGRE_DE = 'guinee-usa'

/** Ce que la decision d'ouverture a besoin de connaitre du tenant. */
export interface TenantConsulte {
  slug?: string
  modules?: Record<string, boolean>
}

/**
 * Decide si une rubrique de contenu est affichable pour le tenant courant.
 *
 * Deux defauts opposes, et c'est voulu :
 *
 * - sur le domaine dont le gabarit porte le contenu, une rubrique n'est
 *   fermee que si l'ambassade l'a explicitement mise a `false` ; une panne de
 *   configuration n'eteint pas le site ;
 * - sur tout autre domaine, une rubrique non declaree est fermee, car la
 *   seule chose qu'elle pourrait afficher est le contenu d'une autre
 *   ambassade. C'est exactement ce qui s'est produit en production sur
 *   ambagabonguinee.com : le tenant ne declarait ni `dirigeants` ni
 *   `vitrine`, et l'accueil gabonais a montre les dirigeants guineens.
 */
export function rubriqueOuverte(nom: string | null, tenant: TenantConsulte | null): boolean {
  if (nom === null) return true
  const declaree = tenant?.modules?.[nom]
  if (declaree !== undefined) return declaree === true
  // Sans configuration chargee du tout, on est sur le site d'origine tant
  // qu'aucun autre tenant ne s'est annonce.
  return (tenant?.slug ?? CONTENU_INTEGRE_DE) === CONTENU_INTEGRE_DE
}

/**
 * Decide si un chemin du site public est accessible, en appliquant a chaque
 * cas son defaut : ferme pour un module a provisionner, ouvert pour une
 * rubrique de contenu de l'ambassade d'origine.
 */
export function cheminOuvert(chemin: string, tenant: TenantConsulte | null): boolean {
  const module = moduleDuChemin(chemin)
  if (module !== null) return tenant?.modules?.[module] === true

  return rubriqueOuverte(rubriqueDuChemin(chemin), tenant)
}
