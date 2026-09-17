import { describe, it, expect } from 'vitest'
import { peutAdministrer } from '../roles'

describe('garde de role', () => {
  it('ouvre aux deux roles que le back tient pour administrateurs', () => {
    expect(peutAdministrer('admin')).toBe(true)
    expect(peutAdministrer('super_admin')).toBe(true)
  })

  it("ferme a l'editeur", () => {
    // Le back refuse `PUT /api/admin/embassy` et toute la surface
    // `/api/admin/users` en 403, lecture comprise.
    expect(peutAdministrer('editeur')).toBe(false)
  })

  it('ferme a un role que le back ne connait pas', () => {
    // Un role inconnu ne doit pas se voir PROMETTRE un acces : l'ecran ne
    // rendrait qu'une suite de 403. C'est l'inverse de la regle des etats
    // d'evenement, et la difference est voulue.
    expect(peutAdministrer('stagiaire')).toBe(false)
  })

  it("ouvre tant que l'identite n'est pas connue", () => {
    // `utilisateur` vaut null le temps que `/auth/me` reponde, et il le reste
    // si l'appel echoue. Fermer pendant ce silence retirerait ses parametres a
    // un administrateur dont la session est valide, pour une panne de notre
    // cote : ne pas savoir n'est pas un refus.
    expect(peutAdministrer(null)).toBe(true)
    expect(peutAdministrer(undefined)).toBe(true)
    expect(peutAdministrer('')).toBe(true)
  })
})
