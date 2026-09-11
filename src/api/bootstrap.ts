import { apiGet } from './client'
import type { ThemeColors } from '@/theme/applyTheme'

/** Coordonnees de l'ambassade (spec 4.1). */
export interface EmbassyContact {
  address: string
  phone: string
  email: string
  hours: string
}

/** Le tenant : une ambassade et toute sa configuration de site (spec 4.1). */
export interface Embassy {
  id: number
  slug: string
  domain: string
  country_name_official: string
  country_name_short: string
  /**
   * Libelle complet de l'ambassade, pays d'accueil compris : « Ambassade de
   * la Republique du Gabon en Guinee ». C'est une donnee et non un calcul :
   * le pays d'accueil n'est porte par aucun autre champ et la formulation
   * varie (« en Guinee », « aux Etats-Unis »). Vide tant qu'il n'a pas ete
   * renseigne, auquel cas le gabarit se rabat sur le nom du pays represente.
   */
  display_name: string
  demonym: string
  flag_image: string
  logo_image: string
  theme: ThemeColors
  contact: EmbassyContact
  modules: Record<string, boolean>
}

/**
 * Ce que decrit le pays est groupe dans `identite` ; ce qui identifie le
 * tenant — `slug`, `domain`, `display_name` — reste a plat. C'est la seule
 * forme jamais servie, et `docs/contrat-bootstrap.md` du depot back fait
 * autorite dessus.
 */
interface IdentiteServie {
  country_name_official: string
  country_name_short: string
  demonym: string
  flag_image: string | null
  logo_image: string | null
}

interface EmbassyServie {
  id: number
  slug: string
  domain: string
  /**
   * `null` pour une ambassade provisionnee avant l'ajout de la colonne, et
   * absent tant que le back qui sert ce domaine est anterieur a la colonne :
   * les deux cas existent en production et doivent se traiter pareil.
   */
  display_name?: string | null
  identite: IdentiteServie
  theme: ThemeColors
  contact: EmbassyContact
  modules?: Record<string, boolean>
}

interface ReponseBootstrap {
  embassy: EmbassyServie
}

/**
 * Aplatit l'ambassade servie en la forme que le gabarit consomme.
 *
 * Deux absences sont des cas reels, pas des defenses de principe :
 * `display_name` vaut `null` pour un tenant provisionne avant la colonne, et
 * les images valent `null` tant que l'ambassade n'a rien fourni. Les unes
 * comme les autres deviennent des chaines vides, que les `v-if` du gabarit
 * savent masquer et que `useIdentite` sait remplacer.
 */
export function normaliserEmbassy(servie: EmbassyServie): Embassy {
  const { identite, ...tenant } = servie
  return {
    ...tenant,
    display_name: servie.display_name ?? '',
    country_name_official: identite.country_name_official,
    country_name_short: identite.country_name_short,
    demonym: identite.demonym,
    flag_image: identite.flag_image ?? '',
    logo_image: identite.logo_image ?? '',
    modules: servie.modules ?? {},
  }
}

/**
 * Resout le tenant a partir du domaine.
 * Le parametre `domain` double l en-tete Host, que le middleware Laravel
 * utilise egalement : les deux mecanismes doivent designer la meme ambassade.
 */
export async function fetchBootstrap(domain: string): Promise<Embassy> {
  const reponse = await apiGet<ReponseBootstrap>(
    `/api/bootstrap?domain=${encodeURIComponent(domain)}`,
  )
  return normaliserEmbassy(reponse.embassy)
}
