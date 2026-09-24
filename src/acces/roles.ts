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

/**
 * Le role metier livre avec la consultation des rendez-vous.
 *
 * C'est la seule surface qu'il ouvre : tout le reste de `/api/admin` lui
 * repond 403. Le reconnaitre permet de ne pas lui proposer un menu dont
 * chaque entree serait un refus.
 */
export const ROLE_AGENT_RDV = 'agent_rdv'

/**
 * Vrai si ce compte n'est QU'un agent rendez-vous.
 *
 * Ici pas de defaut ouvert : la question posee est « faut-il retirer des
 * entrees de menu ? », et un role inconnu ne doit pas se voir amputer le
 * sien. Seul le role exact retire.
 */
export function estAgentRdv(role: string | null | undefined): boolean {
  return role === ROLE_AGENT_RDV
}

/**
 * Les roles que le back accepte sur `/api/admin/secure/rdv`, releves dans
 * `role:admin,agent_rdv` — `super_admin` traverse sans etre nomme.
 *
 * Meme raisonnement que pour l'administration, et donc les memes deux
 * defauts : la liste est ecrite par la POSITIVE — un role que le back ne
 * connaitrait pas encore n'obtiendrait ici qu'une suite de 403 — mais une
 * identite pas encore chargee OUVRE, parce que ne pas savoir n'est pas un
 * refus.
 */
const ROLES_RENDEZ_VOUS = ['admin', 'super_admin', ROLE_AGENT_RDV]

/** Vrai si ce role ouvre la consultation des rendez-vous. */
export function peutConsulterLesRendezVous(role: string | null | undefined): boolean {
  if (role === null || role === undefined || role === '') return true
  return ROLES_RENDEZ_VOUS.includes(role)
}
