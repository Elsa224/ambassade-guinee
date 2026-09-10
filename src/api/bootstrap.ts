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
  demonym: string
  flag_image: string
  logo_image: string
  theme: ThemeColors
  contact: EmbassyContact
  modules: Record<string, boolean>
}

interface ReponseBootstrap {
  embassy: Embassy
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
  return reponse.embassy
}
