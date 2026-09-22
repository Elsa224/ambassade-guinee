import { apiUpload } from './client'

/**
 * Televersement de media rendant la CLE de stockage.
 *
 * Deux routes de televersement coexistent cote serveur et ne rendent pas la
 * meme chose :
 *
 * - `POST /api/admin/content/media` (champ `file`, 5 Mo) rend l'URL absolue.
 *   C'est ce que stockent les dirigeants, les pages et l'annuaire.
 * - `POST /api/admin/media` (champ `fichier`, 10 Mo) rend en plus la `key`.
 *
 * Le champ `image` d'un article attend la CLE, pas l'URL : la ressource
 * rebatit l'adresse a la lecture. Lui donner l'URL absolue la faisait
 * prefixer une seconde fois — `.../api/medias/https://.../api/medias/...` —
 * et l'image ne s'affichait pas.
 *
 * On ne tente donc pas de retrouver la cle en retirant un prefixe de l'URL :
 * le jour ou les medias passeront derriere un CDN, l'adresse ne portera plus
 * `/api/medias/` du tout et ce genre de decoupage casserait en silence.
 */
export interface MediaTeleverse {
  /** Chemin de stockage, par exemple `medias/gabon-guinee/2026/09/a.webp`. */
  cle: string
  /** Adresse d'affichage, pour l'apercu immediat. */
  url: string
}

/** Cette route accepte 10 Mo la ou celle du contenu s'arrete a 5. */
export const TAILLE_MEDIA_MAX = 10 * 1024 * 1024

interface MediaServi {
  key: string
  url: string
}

export async function televerserMedia(fichier: File): Promise<MediaTeleverse> {
  const formulaire = new FormData()
  // `fichier` et non `file` : le nom du champ differe de l'autre route.
  formulaire.append('fichier', fichier)
  const servi = await apiUpload<MediaServi>('/api/admin/media', formulaire)
  return { cle: servi.key, url: servi.url }
}
