import { describe, it, expect } from 'vitest'
import { dateLisible, estAnnulable, etatDe } from '../presentation'
import type { EvenementAdmin } from '@/api/evenements-admin'

function avecStatut(status: string): EvenementAdmin {
  return { status } as EvenementAdmin
}

describe('etat d un evenement', () => {
  it('traduit les etats connus', () => {
    expect(etatDe(avecStatut('SCHEDULED')).libelle).toBe('Programmé')
    expect(etatDe(avecStatut('ACTIVE')).libelle).toBe('En cours')
    expect(etatDe(avecStatut('CANCELLED')).libelle).toBe('Annulé')
    expect(etatDe(avecStatut('COMPLETED')).libelle).toBe('Terminé')
  })

  it('accepte la casse servie par le back', () => {
    // La liste sert « ACTIVE », la reponse d'annulation « cancelled », et le
    // premier vrai evenement est arrive en « scheduled ».
    expect(etatDe(avecStatut('scheduled')).libelle).toBe('Programmé')
    expect(etatDe(avecStatut('cancelled')).libelle).toBe('Annulé')
  })

  it('montre un etat inconnu plutot que de le masquer', () => {
    expect(etatDe(avecStatut('POSTPONED')).libelle).toBe('POSTPONED')
  })
})

describe('annulation possible', () => {
  it('reste possible sur un etat que le front ne connait pas', () => {
    // Le defaut repare : la regle etait ecrite par la positive — annulable
    // si ACTIVE — et le premier vrai evenement est arrive en « scheduled ».
    // Le bouton « Annuler » avait purement disparu de la fiche.
    expect(estAnnulable('scheduled')).toBe(true)
    expect(estAnnulable('POSTPONED')).toBe(true)
    expect(estAnnulable('ACTIVE')).toBe(true)
  })

  it('ne se propose pas deux fois sur un etat terminal', () => {
    expect(estAnnulable('CANCELLED')).toBe(false)
    expect(estAnnulable('cancelled')).toBe(false)
    expect(estAnnulable('COMPLETED')).toBe(false)
  })
})

describe('date lisible', () => {
  it('rend une date francaise', () => {
    expect(dateLisible('2026-09-22')).toBe('22 septembre 2026')
  })

  it('rend la valeur brute si elle est inexploitable', () => {
    expect(dateLisible('bientot')).toBe('bientot')
  })
})
