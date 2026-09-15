import type { Embassy } from '@/api/bootstrap'
import { libelleAmbassade } from '@/tenant/identite'

/**
 * Identite de l'onglet : titre de la page et favicone.
 *
 * Un seul build sert tous les domaines, et `index.html` est servi tel quel a
 * chacun d'eux : tout ce qu'il nomme vaut pour toutes les ambassades. Son
 * titre et sa favicone sont donc neutres, et c'est ici qu'ils prennent
 * l'identite du tenant, une fois le bootstrap revenu.
 *
 * Ce qui reste hors de portee : l'apercu de partage (WhatsApp, Facebook,
 * LinkedIn). Ces robots lisent le HTML brut sans executer le JavaScript, donc
 * aucune balise `og:` posee ici ne les atteindrait. Leur personnalisation par
 * domaine appartient au serveur qui repond a la requete.
 */

/** Repli neutre, identique a celui d'`index.html`. */
const TITRE_NEUTRE = 'Ambassade'

/** La valeur si elle porte autre chose que des espaces, sinon `undefined`. */
function nonVide(valeur: string | null | undefined): string | undefined {
  const texte = valeur?.trim()
  return texte ? texte : undefined
}

/**
 * Titre d'onglet de l'ambassade servie.
 *
 * Meme ordre de repli que `useIdentite().nomDeLAmbassade` : le libelle
 * complet s'il est renseigne, sinon celui qui se deduit du nom officiel,
 * sinon le neutre. Jamais le nom d'une ambassade qui n'est pas celle du
 * domaine visite.
 */
export function titreDeLOnglet(embassy: Embassy | null): string {
  if (embassy === null) return TITRE_NEUTRE
  const complet = nonVide(embassy.display_name)
  if (complet !== undefined) return complet
  const officiel = nonVide(embassy.country_name_official)
  return officiel === undefined ? TITRE_NEUTRE : libelleAmbassade(officiel)
}

/**
 * Pose le titre et la favicone du tenant sur le document.
 *
 * La favicone n'est remplacee que si l'ambassade en a fourni une : sans logo
 * servi, le repli neutre d'`index.html` reste en place, ce qui vaut mieux
 * qu'un onglet sans marque.
 */
export function appliquerIdentiteDeLOnglet(embassy: Embassy | null, cible?: Document): void {
  const doc = cible ?? document
  doc.title = titreDeLOnglet(embassy)

  const logo = nonVide(embassy?.logo_image)
  if (logo === undefined) return

  let lien = doc.querySelector<HTMLLinkElement>('link[rel~="icon"]')
  if (lien === null) {
    lien = doc.createElement('link')
    lien.rel = 'icon'
    doc.head.appendChild(lien)
  }
  // Le type declare pour la favicone neutre est `image/svg+xml` ; le logo
  // servi est une image matricielle, donc l'attribut doit partir avec lui.
  lien.removeAttribute('type')
  lien.href = logo
}
