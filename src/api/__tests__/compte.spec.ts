import { describe, it, expect } from 'vitest'
import { dateLisible, libelleRole, messageErreurCompte } from '../compte'
import { ApiError } from '../client'

describe('libelle des roles', () => {
  it('traduit les trois roles que le back sert', () => {
    expect(libelleRole('admin')).toBe('Administrateur')
    expect(libelleRole('editeur')).toBe('Éditeur')
    expect(libelleRole('super_admin')).toBe('Super administrateur')
  })

  it('montre un role inconnu plutot que de le masquer', () => {
    // C'est ce repli qui a rendu « scheduled » visible sur les evenements,
    // et c'est comme cela que le defaut a ete trouve. Il n'existe par
    // ailleurs AUCUN role en lecture seule : `lecteur` n'est pas un oubli.
    expect(libelleRole('lecteur')).toBe('lecteur')
    expect(libelleRole('archiviste')).toBe('archiviste')
  })
})

describe('message d erreur du compte', () => {
  it('presente le message du back tel quel', () => {
    const erreur = new ApiError('Le mot de passe actuel est incorrect.', 422, null)

    expect(messageErreurCompte(erreur)).toBe('Le mot de passe actuel est incorrect.')
  })

  it('nomme la limite de cadence, que le back borne a cinq par minute', () => {
    // Un 429 vient sans corps : sans ce cas, il s'afficherait en « Serveur
    // injoignable », ce qui est faux et envoie chercher au mauvais endroit.
    expect(messageErreurCompte(new ApiError('', 429, null))).toContain('Trop de tentatives')
  })

  it('se replie seulement quand aucune reponse n est parvenue', () => {
    expect(messageErreurCompte(new ApiError('', 0, null))).toContain('Serveur injoignable')
    expect(messageErreurCompte(new TypeError('Failed to fetch'))).toContain('Serveur injoignable')
  })
})

describe('date lisible', () => {
  it('rend une date francaise', () => {
    expect(dateLisible('2026-06-02T10:03:11.000000Z')).toBe('2 juin 2026')
  })

  it('rend null quand le back ne sert rien', () => {
    // `password_changed_at` vaut null tant que le mot de passe n'a pas change
    // depuis la mise en service : l'ecran n'affiche alors pas de date, plutot
    // qu'une date fausse.
    expect(dateLisible(null)).toBeNull()
    expect(dateLisible('')).toBeNull()
    expect(dateLisible('pas-une-date')).toBeNull()
  })
})
