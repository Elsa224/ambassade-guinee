import type { Embassy } from '@/api/bootstrap'

/**
 * Etat d'un module du cote de l'administration.
 *
 * Le site visiteur n'a besoin que d'un booleen (`cheminOuvert`) : une rubrique
 * est offerte ou elle ne l'est pas. L'administration, elle, a trois etats
 * distincts, parce qu'elle s'affiche avant que le bootstrap n'ait repondu et
 * qu'un troisieme cas se presente — celui ou il n'a pas repondu du tout.
 */
export type EtatDuModule = 'ouvert' | 'ferme' | 'attente'

/** Ce que la decision a besoin de connaitre du store du tenant. */
export interface TenantAdministre {
  embassy: Embassy | null
  chargement: boolean
}

/**
 * Decide de l'etat d'un module pour l'administration.
 *
 * Les trois cas, et le raisonnement derriere chacun :
 *
 * - **configuration connue** : le drapeau tranche, et son absence vaut ferme.
 *   C'est le defaut des modules, oppose a celui des rubriques de contenu : un
 *   module qui n'existe pas encore ne doit pas s'annoncer.
 * - **bootstrap en cours** : `attente`. Sans cet etat, l'entree de menu
 *   apparaitrait puis disparaitrait le temps d'un aller-retour, ou l'inverse.
 * - **bootstrap en echec** : `ouvert`, et c'est volontaire. Ne pas savoir n'est
 *   pas un refus. Fermer un module parce que la configuration est injoignable
 *   ferait passer une panne de notre cote pour une decision de
 *   provisionnement, et priverait l'ambassade d'un module qu'elle a. L'API
 *   tranchera : chacune de ses routes rend 404 quand le module est inactif,
 *   et c'est elle qui fait autorite.
 */
export function etatDuModule(nom: string, tenant: TenantAdministre): EtatDuModule {
  if (tenant.embassy !== null) {
    return tenant.embassy.modules?.[nom] === true ? 'ouvert' : 'ferme'
  }
  return tenant.chargement ? 'attente' : 'ouvert'
}
