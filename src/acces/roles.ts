/**
 * Ce que le role du compte connecte ouvre, et ce qu'il ferme.
 *
 * La garde posee ici est **cosmetique** : elle masque une entree de menu et
 * evite un aller-retour evident, elle ne protege rien. C'est le serveur qui
 * refuse, et c'est lui qui fait autorite — `role.admin` garde
 * `PUT /api/admin/embassy` et toute la surface `/api/admin/users`, et rend 403
 * de lui-meme quel que soit ce que le front affiche.
 */

/**
 * Les roles que le back tient pour administrateurs, releves le 2026-09-17
 * dans `User::estAdministrateur()` : `admin` et `super_admin`.
 *
 * L'enumeration est recopiee **par la positive**, contrairement aux etats
 * d'evenement qui sont ecrits par la negative. La difference n'est pas un
 * oubli : un etat inconnu ne doit pas retirer un geste que le serveur
 * accepterait, alors qu'un role inconnu ne doit pas se voir PROMETTRE un
 * acces que le serveur refuse. Offrir l'ecran des comptes a un role que le
 * back ne connait pas encore ne donnerait qu'une suite de 403.
 */
const ROLES_ADMINISTRATEURS = ['admin', 'super_admin']

/**
 * Vrai si ce role tient les surfaces qui engagent l'ambassade — ses
 * parametres et ses comptes.
 *
 * **Un role encore inconnu ouvre**, et c'est le meme raisonnement que pour un
 * module dont le bootstrap n'a pas repondu : ne pas savoir n'est pas un refus.
 * `utilisateur` vaut `null` le temps que `/auth/me` reponde, et il le reste si
 * cet appel echoue. Fermer pendant ce silence retirerait ses parametres a un
 * administrateur dont la session est parfaitement valide, pour une panne de
 * notre cote. Un editeur, lui, voit l'entree le temps d'un aller-retour au
 * rechargement — un clignotement contre une perte de geste, l'arbitrage est
 * vite fait.
 */
export function peutAdministrer(role: string | null | undefined): boolean {
  if (role === null || role === undefined || role === '') return true
  return ROLES_ADMINISTRATEURS.includes(role)
}
