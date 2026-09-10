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
