import { describe, it, expect } from 'vitest'
import { peutAdministrer, peutConsulterLesRendezVous, estAgentRdv } from '../roles'

describe('garde de role', () => {
  it('ouvre aux deux roles que le back tient pour administrateurs', () => {
    expect(peutAdministrer('admin')).toBe(true)
    expect(peutAdministrer('super_admin')).toBe(true)
  })

  it("ferme a l'agent rendez-vous, qui n'administre rien", () => {
    // Le back ne le nomme que sur `/api/admin/secure/rdv` : partout ailleurs
    // il recoit le meme 403 que l'editeur.
    expect(peutAdministrer('agent_rdv')).toBe(false)
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

describe('garde de la consultation des rendez-vous', () => {
  it('ouvre aux trois roles que le back nomme sur cette surface', () => {
    // `role:admin,agent_rdv` cote back ; `super_admin` traverse sans etre
    // nomme, comme partout.
    expect(peutConsulterLesRendezVous('admin')).toBe(true)
    expect(peutConsulterLesRendezVous('super_admin')).toBe(true)
    expect(peutConsulterLesRendezVous('agent_rdv')).toBe(true)
  })

  it("ferme a l'editeur et a un role inconnu", () => {
    expect(peutConsulterLesRendezVous('editeur')).toBe(false)
    expect(peutConsulterLesRendezVous('stagiaire')).toBe(false)
  })

  it("ouvre tant que l'identite n'est pas connue", () => {
    expect(peutConsulterLesRendezVous(null)).toBe(true)
    expect(peutConsulterLesRendezVous(undefined)).toBe(true)
  })

  it("ne reconnait l'agent rendez-vous que sur son role exact", () => {
    // Ici pas de defaut ouvert : la question posee est « faut-il RETIRER des
    // entrees de menu ? », et un role inconnu ne doit pas se voir amputer le
    // sien.
    expect(estAgentRdv('agent_rdv')).toBe(true)
    for (const role of ['admin', 'super_admin', 'editeur', 'stagiaire', null, undefined]) {
      expect(estAgentRdv(role)).toBe(false)
    }
  })
})
