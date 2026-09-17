import { describe, it, expect } from 'vitest'
import { etatDuModule } from '../module-administration'
import type { Embassy } from '@/api/bootstrap'
import gabonFixture from '@/api/fixtures/bootstrap-gabon.json'

function ambassade(modules: Record<string, boolean>): Embassy {
  return { ...gabonFixture.embassy, modules } as unknown as Embassy
}

describe("etat d'un module cote administration", () => {
  it('est ouvert quand le drapeau est leve', () => {
    const tenant = { embassy: ambassade({ secure_events: true }), chargement: false }
    expect(etatDuModule('secure_events', tenant)).toBe('ouvert')
  })

  it('est ferme quand le drapeau est baisse', () => {
    const tenant = { embassy: ambassade({ secure_events: false }), chargement: false }
    expect(etatDuModule('secure_events', tenant)).toBe('ferme')
  })

  it('est ferme quand le drapeau est absent', () => {
    // Le defaut des modules est l'inverse de celui des rubriques de contenu :
    // un module non provisionne ne doit pas s'annoncer.
    const tenant = { embassy: ambassade({}), chargement: false }
    expect(etatDuModule('secure_events', tenant)).toBe('ferme')
  })

  it('attend tant que le bootstrap est en cours', () => {
    expect(etatDuModule('secure_events', { embassy: null, chargement: true })).toBe('attente')
  })

  it("reste ouvert quand le bootstrap a echoue, car l'API fait autorite", () => {
    // Ne pas savoir n'est pas un refus : fermer ici ferait passer une panne de
    // configuration pour une decision de provisionnement, et priverait
    // l'ambassade d'un module qu'elle a. Chaque route rend 404 si le module
    // est reellement ferme.
    expect(etatDuModule('secure_events', { embassy: null, chargement: false })).toBe('ouvert')
  })
})
