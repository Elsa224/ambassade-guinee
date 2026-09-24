import type { RendezVousAdmin, StatutRdvAdmin } from '@/api/rendez-vous-admin'

/**
 * Mise en forme de la consultation des rendez-vous.
 *
 * Tout tient dans une regle : **aucun horodatage de cette surface ne passe
 * par le type Date du navigateur**. Le contrat back l'ecrit noir sur blanc,
 * et la raison est concrete : l'amont construit l'instant sans fuseau puis le
 * serialise en UTC. L'interpreter, puis le remettre dans le fuseau du poste,
 * afficherait a l'agent une autre heure qu'au visiteur — un rendez-vous de
 * 10:30 deviendrait 12:30 a Paris. La chaine est DECOUPEE, jamais
 * interpretee, et une garde lisant le disque veille sur cette regle dans
 * `__tests__/presentation.spec.ts`.
 */

/** Motif d'un horodatage ISO, dont on ne garde que ce qui est ecrit. */
const HORODATAGE = /^(\d{4})-(\d{2})-(\d{2})T(\d{2}):(\d{2})/

/** Les deux moities d'un horodatage, telles qu'elles arrivent. */
export interface DateEtHeure {
  /** `JJ/MM/AAAA`, ou chaine vide si l'horodatage est illisible. */
  date: string
  /** `HH:MM`, ou chaine vide. */
  heure: string
}

/** Decoupe un horodatage sans jamais l'interpreter dans un fuseau. */
export function dateEtHeure(horodatage: string | null | undefined): DateEtHeure {
  const trouve = HORODATAGE.exec(horodatage ?? '')
  if (!trouve) return { date: '', heure: '' }
  const [, annee, mois, jour, heures, minutes] = trouve
  return { date: `${jour}/${mois}/${annee}`, heure: `${heures}:${minutes}` }
}

/** « 02/10/2026 à 09:30 », ou chaine vide. */
export function dateEtHeureLisible(horodatage: string | null | undefined): string {
  const { date, heure } = dateEtHeure(horodatage)
  return date === '' ? '' : `${date} à ${heure}`
}

/** Libelle et ton d'un etat, pour la pastille. */
export interface EtatAffiche {
  libelle: string
  ton: 'positif' | 'neutre' | 'attention' | 'eteint'
}

/**
 * Les cinq etats qui existent vraiment.
 *
 * `cancelled` n'y figure pas : la valeur est declaree en amont mais n'est
 * JAMAIS assignee, et aucune route n'annule un rendez-vous. La proposer
 * serait offrir un filtre qui ne rend jamais rien.
 */
const ETATS: Record<StatutRdvAdmin, EtatAffiche> = {
  pending: { libelle: 'En attente', ton: 'attention' },
  approved: { libelle: 'Confirmé', ton: 'positif' },
  rejected: { libelle: 'Refusé', ton: 'eteint' },
  checked_in: { libelle: 'Visiteur arrivé', ton: 'neutre' },
  checked_out: { libelle: 'Visite terminée', ton: 'eteint' },
}

/**
 * Etat affichable, y compris pour un code que l'amont ajouterait.
 *
 * Un code inconnu est montre TEL QUEL plutot que tu : cacher un etat ferait
 * croire a l'agent que la demande n'en a pas.
 */
export function etatDe(statut: string): EtatAffiche {
  return ETATS[statut as StatutRdvAdmin] ?? { libelle: statut, ton: 'eteint' }
}

/** Les etats proposes au filtre, dans l'ordre ou un agent les cherche. */
export const STATUTS_FILTRABLES: readonly { valeur: StatutRdvAdmin; libelle: string }[] = (
  ['pending', 'approved', 'rejected', 'checked_in', 'checked_out'] as const
).map((valeur) => ({ valeur, libelle: ETATS[valeur].libelle }))

/**
 * Vrai si les deux gestes sont encore ouverts.
 *
 * Approuver comme refuser exigent que la demande soit en attente ; tout autre
 * etat de depart est refuse en 422. L'interface doit le montrer en faisant
 * DISPARAITRE les deux actions une fois l'une des deux faite, pas en offrant
 * deux boutons qui rendent une erreur.
 */
export function estEnAttente(rendezVous: Pick<RendezVousAdmin, 'status'>): boolean {
  return rendezVous.status === 'pending'
}

/** Nom du visiteur, tel qu'on le lit dans un tableau. */
export function nomDuVisiteur(rendezVous: Pick<RendezVousAdmin, 'visitor'>): string {
  const { firstName, lastName } = rendezVous.visitor
  return `${lastName ?? ''} ${firstName ?? ''}`.trim()
}
