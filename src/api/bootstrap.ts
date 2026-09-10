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
   * la Republique du Gabon en Guinee ». Aucun accord grammatical ne peut le
   * deviner, le pays d'accueil n'etant transmis nulle part ; a defaut, le
   * gabarit se rabat sur le seul nom du pays represente.
   */
  display_name: string
  demonym: string
  flag_image: string
  logo_image: string
  theme: ThemeColors
  contact: EmbassyContact
  modules: Record<string, boolean>
}

/** Bloc d'identite tel que l'API le renvoie aujourd'hui, imbrique. */
interface IdentiteImbriquee {
  country_name_official?: string
  country_name_short?: string
  demonym?: string
  display_name?: string | null
  flag_image?: string | null
  logo_image?: string | null
}

type EmbassyServie = Partial<Embassy> & { identite?: IdentiteImbriquee }

interface ReponseBootstrap {
  embassy: EmbassyServie
}

/**
 * Ramene les deux formes d'identite a une seule.
 *
 * L'API sert aujourd'hui l'identite dans un objet `identite`, la ou le contrat
 * la posait a plat sur `embassy`. Accepter les deux evite qu'un changement de
 * cote ou de l'autre affiche « Ambassade » sans nom de pays, comme cela s'est
 * produit a la mise en ligne d'ambagabonguinee.com. L'ecart est signale au
 * back ; cette normalisation restera vraie quelle que soit la forme retenue.
 *
 * Les champs image valent `null` quand l'ambassade n'a rien fourni : ils
 * deviennent des chaines vides, que les `v-if` du gabarit savent masquer.
 */
export function normaliserEmbassy(servie: EmbassyServie): Embassy {
  const identite = servie.identite ?? {}
  return {
    ...(servie as Embassy),
    country_name_official: servie.country_name_official ?? identite.country_name_official ?? '',
    country_name_short: servie.country_name_short ?? identite.country_name_short ?? '',
    demonym: servie.demonym ?? identite.demonym ?? '',
    display_name: servie.display_name ?? identite.display_name ?? '',
    flag_image: servie.flag_image ?? identite.flag_image ?? '',
    logo_image: servie.logo_image ?? identite.logo_image ?? '',
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
