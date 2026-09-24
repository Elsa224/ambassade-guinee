import { describe, it, expect } from 'vitest'
import { readFileSync, readdirSync } from 'node:fs'
import { resolve } from 'node:path'
import {
  dateEtHeure,
  dateEtHeureLisible,
  etatDe,
  estEnAttente,
  nomDuVisiteur,
  STATUTS_FILTRABLES,
} from '../presentation'

describe('mise en forme de la consultation des rendez-vous', () => {
  it("affiche l'heure transmise, jamais celle du fuseau du navigateur", () => {
    // L'amont construit l'instant SANS fuseau puis le serialise en UTC : le
    // `Z` n'est pas merite. `new Date('2026-10-02T09:30:00.000Z')` rendrait
    // 11:30 sur un poste parisien — une autre heure pour l'agent que pour le
    // visiteur, et quelqu'un se deplace pour rien.
    expect(dateEtHeure('2026-10-02T09:30:00.000Z')).toEqual({
      date: '02/10/2026',
      heure: '09:30',
    })
    expect(dateEtHeureLisible('2026-10-02T09:30:00.000Z')).toBe('02/10/2026 à 09:30')
  })

  it('se tait sur un horodatage illisible plutot que d afficher « Invalid Date »', () => {
    expect(dateEtHeure(null)).toEqual({ date: '', heure: '' })
    expect(dateEtHeureLisible('jamais')).toBe('')
  })

  it("ne propose pas d'etat « annule » au filtre", () => {
    // La valeur est declaree en amont mais n'est JAMAIS assignee, et aucune
    // route n'annule un rendez-vous : ce filtre ne rendrait jamais rien.
    expect(STATUTS_FILTRABLES.map((etat) => etat.valeur)).toEqual([
      'pending',
      'approved',
      'rejected',
      'checked_in',
      'checked_out',
    ])
  })

  it('montre un etat inconnu tel quel plutot que de le taire', () => {
    expect(etatDe('scheduled').libelle).toBe('scheduled')
    expect(etatDe('pending').libelle).toBe('En attente')
  })

  it("n'ouvre les deux gestes que depuis « en attente »", () => {
    expect(estEnAttente({ status: 'pending' })).toBe(true)
    for (const statut of ['approved', 'rejected', 'checked_in', 'checked_out']) {
      expect(estEnAttente({ status: statut })).toBe(false)
    }
  })

  it('nomme le visiteur sans laisser d espace pendant', () => {
    const visiteur = {
      firstName: 'Awa',
      lastName: 'Diallo',
      email: null,
      phone: null,
      idNumber: null,
    }
    expect(nomDuVisiteur({ visitor: visiteur })).toBe('Diallo Awa')
    expect(nomDuVisiteur({ visitor: { ...visiteur, firstName: '' } })).toBe('Diallo')
  })
})

/**
 * Garde lisant le disque, sur les deux regles que le contrat back pose et
 * qu'aucune erreur d'execution ne signalerait.
 *
 * Reformater un horodatage dans le fuseau du navigateur ne casse rien : cela
 * affiche simplement une heure fausse, credible, que personne ne remarque
 * avant qu'un visiteur se presente a la mauvaise heure. Et rouvrir
 * `cancelled` ajoute un filtre qui ne rend jamais rien, sans erreur non plus.
 */
const INTERDITS = [
  { motif: /new Date\(/, pourquoi: "remet l'horodatage dans le fuseau du navigateur" },
  { motif: /toLocale(Date|Time)?String/, pourquoi: "formate l'horodatage dans la langue du poste" },
  { motif: /Intl\.DateTimeFormat/, pourquoi: "formate l'horodatage dans le fuseau du poste" },
  { motif: /['"]cancelled['"]/, pourquoi: "rouvre un etat que l'amont n'assigne jamais" },
]

function sources(racine: string): string[] {
  return readdirSync(racine, { withFileTypes: true }).flatMap((entree) => {
    const chemin = resolve(racine, entree.name)
    if (entree.isDirectory()) return entree.name === '__tests__' ? [] : sources(chemin)
    return /\.(ts|vue)$/.test(entree.name) ? [chemin] : []
  })
}

describe('surface de consultation des rendez-vous', () => {
  it("ne reformate aucun horodatage et ne ressuscite pas l'etat annule", () => {
    const fichiers = [
      ...sources(resolve(__dirname, '..')),
      resolve(__dirname, '../../../../api/rendez-vous-admin.ts'),
    ]
    const fautifs: string[] = []

    for (const chemin of fichiers) {
      const source = readFileSync(chemin, 'utf8')
      for (const { motif, pourquoi } of INTERDITS) {
        if (motif.test(source)) fautifs.push(`${chemin} : ${pourquoi}`)
      }
    }

    expect(fautifs).toEqual([])
  })
})
