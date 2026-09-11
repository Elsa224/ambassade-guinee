import type { EvenementAdmin } from '@/api/evenements-admin'

/**
 * Mise en forme partagee par la liste et la fiche d'un evenement.
 *
 * Les deux ecrans montrent les memes etats et les memes dates. Les dupliquer
 * les ferait diverger au premier ajout d'etat cote Ambassade Secure : la
 * liste dirait « Reporte » et la fiche « POSTPONED », sur le meme evenement.
 */

const MOIS = [
  'janvier',
  'février',
  'mars',
  'avril',
  'mai',
  'juin',
  'juillet',
  'août',
  'septembre',
  'octobre',
  'novembre',
  'décembre',
] as const

/** « 17 août 2026 », ou la valeur brute si la date n'est pas exploitable. */
export function dateLisible(valeur: string): string {
  const trouve = /^(\d{4})-(\d{2})-(\d{2})/.exec(valeur)
  if (!trouve) return valeur
  const mois = MOIS[Number(trouve[2]) - 1]
  return mois ? `${Number(trouve[3])} ${mois} ${trouve[1]}` : valeur
}

export type Ton = 'positif' | 'neutre' | 'attention' | 'eteint'

export interface Etat {
  libelle: string
  ton: Ton
}

const ETATS: Record<string, Etat> = {
  ACTIVE: { libelle: 'En cours', ton: 'positif' },
  CANCELLED: { libelle: 'Annulé', ton: 'attention' },
  COMPLETED: { libelle: 'Terminé', ton: 'eteint' },
}

/**
 * Etat rapporte par Ambassade Secure.
 *
 * Le libelle est traduit pour l'affichage, mais toute valeur inconnue est
 * rendue telle quelle : mieux vaut montrer un mot anglais que masquer un etat
 * que le front ne connaissait pas encore.
 */
export function etatDe(evenement: EvenementAdmin): Etat {
  return ETATS[evenement.status] ?? { libelle: evenement.status, ton: 'neutre' }
}

/** Part de la capacite deja prise, bornee a 100 pour que la jauge ne deborde pas. */
export function remplissage(evenement: EvenementAdmin): number {
  if (!evenement.capacity) return 0
  return Math.min(100, Math.round((evenement.registeredCount / evenement.capacity) * 100))
}
