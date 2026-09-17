import { ref, readonly } from 'vue'

/**
 * Indique a l'en-tete qu'il doit passer en surimpression.
 *
 * La maquette du diaporama accompagne sa banniere plein ecran d'une barre de
 * navigation translucide a texte blanc, posee par-dessus la photo. Ce
 * traitement ne tient que devant un fond sombre : applique partout, il
 * rendrait le menu illisible sur toutes les autres pages, et sur la variante
 * classique dont le fond est clair.
 *
 * Le drapeau est donc pose par la page d'accueil, et seulement quand elle
 * affiche reellement le diaporama — pas quand la variante vaut `diaporama`
 * sans aucune image, cas ou le site retombe sur la banniere simple. Il porte
 * ainsi les deux conditions du contrat, la variante et la route, sans que
 * l'en-tete ait a interroger l'API une seconde fois.
 *
 * La page le repose a faux en se demontant : une navigation vers une autre
 * rubrique doit rendre l'en-tete du gabarit, meme si le composant de la
 * banniere reste en cache.
 */
const surimpression = ref(false)

export const enteteEnSurimpression = readonly(surimpression)

export function poserEnteteEnSurimpression(actif: boolean): void {
  surimpression.value = actif
}
