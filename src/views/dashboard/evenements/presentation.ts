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

/**
 * Les trois etats d'Ambassade Secure, et il n'y en a pas d'autres.
 *
 * Releves dans le code du service le 2026-09-17 (`EVENT_STATUS`, fige) : le
 * contrat du 2026-09-14 annoncait `ACTIVE`, `CANCELLED` et `COMPLETED`, et
 * DEUX de ces trois valeurs n'existent nulle part dans le service. Le vrai
 * jeu est `scheduled`, `cancelled`, `done`, servi VERBATIM en minuscules,
 * sans aucune remise en forme. Les cles restent en majuscules ici parce que
 * `etatDe` normalise avant de chercher.
 *
 * `done` n'est produit par aucun chemin de code aujourd'hui — aucune
 * transition automatique ne le pose — mais il est dans l'enumeration : il
 * est traite, pour ne pas etre decouvert le jour ou il apparaitra.
 */
const ETATS: Record<string, Etat> = {
  SCHEDULED: { libelle: 'Programmé', ton: 'neutre' },
  CANCELLED: { libelle: 'Annulé', ton: 'attention' },
  DONE: { libelle: 'Terminé', ton: 'eteint' },
}

/**
 * Etats terminaux : un evenement qui y est arrive ne s'annule plus.
 *
 * La regle est ecrite par la NEGATIVE, et c'est le point important. Elle a
 * d'abord ete ecrite par la positive — « annulable si ACTIVE » — et le
 * premier vrai evenement servi par Ambassade Secure est arrive en
 * `scheduled`, un etat que le front ne connaissait pas : le bouton
 * « Annuler » avait purement disparu de la fiche. Un etat inconnu ne doit
 * jamais retirer un geste, seulement ne pas en promettre un.
 *
 * `done` est masque ici par DECISION D'INTERFACE, pas par contrainte du
 * serveur : celui-ci ne refuse l'annulation que sur `cancelled`, et
 * laisserait donc annuler un evenement deja termine. Ne pas s'appuyer sur un
 * refus d'amont pour ce cas — il n'en viendra pas.
 */
const ETATS_TERMINAUX = ['CANCELLED', 'DONE']

/** Vrai tant que l'evenement n'est pas deja annule ou termine. */
export function estAnnulable(statut: string): boolean {
  return !ETATS_TERMINAUX.includes(statut.toUpperCase())
}

/**
 * Etat rapporte par Ambassade Secure.
 *
 * La casse n'est pas garantie : la liste sert `ACTIVE` mais la reponse
 * d'annulation rend `cancelled` en minuscules (contrat du 2026-09-14). On
 * normalise avant de traduire. Toute valeur inconnue est rendue telle
 * quelle : mieux vaut montrer un mot anglais que masquer un etat que le
 * front ne connaissait pas encore.
 */
export function etatDe(evenement: EvenementAdmin): Etat {
  return ETATS[evenement.status.toUpperCase()] ?? { libelle: evenement.status, ton: 'neutre' }
}

/** Part de la capacite deja prise, bornee a 100 pour que la jauge ne deborde pas. */
export function remplissage(evenement: EvenementAdmin): number {
  if (!evenement.capacity) return 0
  return Math.min(100, Math.round((evenement.registeredCount / evenement.capacity) * 100))
}
