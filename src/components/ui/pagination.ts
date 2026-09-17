/**
 * La forme d'une pagination et le calcul de ses bornes, partages par tous les
 * ecrans qui paginent.
 *
 * Ils vivaient dans `api/evenements-admin.ts`, parce que les evenements ont
 * ete le premier ecran pagine. Ce n'etait pas leur place : deux ecrans
 * d'articles paginaient a la main a cote, chacun avec son propre calcul, et
 * aller chercher une forme generique dans le module d'API d'un module
 * particulier se serait mal lu. `evenements-admin` les reexporte, pour que le
 * contrat servi par le back continue de se decrire la ou il est decrit.
 */
export interface Pagination {
  page: number
  limit: number
  total: number
  totalPages: number
}

/** Bornes de la page affichee, pour le libelle « 61-90 sur 204 ». */
export function bornesAffichees(pagination: Pagination): { premier: number; dernier: number } {
  if (pagination.total === 0) return { premier: 0, dernier: 0 }
  const premier = (pagination.page - 1) * pagination.limit + 1
  return { premier, dernier: Math.min(pagination.page * pagination.limit, pagination.total) }
}

/**
 * Pagination d'une liste deja en memoire.
 *
 * Les evenements sont pagines par le back, qui sert `total` et `totalPages`.
 * Les articles et les actualites arrivent en entier et sont filtres dans le
 * navigateur : cette fonction leur donne la meme forme, pour qu'ils affichent
 * la meme barre.
 *
 * `totalPages` vaut **au moins 1**, meme sur une liste vide. Les deux ecrans
 * calculaient `Math.ceil(0 / 10)`, soit zero, et comparaient ensuite la page
 * courante — 1 — a ce zero : le bouton « suivant » restait donc actif sur une
 * liste vide, et on pouvait avancer dans le neant.
 */
export function paginerEnMemoire(total: number, page: number, limite: number): Pagination {
  const totalPages = Math.max(1, Math.ceil(total / limite))
  return { page: Math.min(page, totalPages), limit: limite, total, totalPages }
}
