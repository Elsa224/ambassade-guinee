import { describe, it, expect, beforeEach } from 'vitest'
import { createPinia, setActivePinia } from 'pinia'
import { useTenantStore } from '@/stores/tenant'
import { rubriqueDuChemin, RUBRIQUE_PAR_CHEMIN } from '../rubriques'
import type { Embassy } from '@/api/bootstrap'
import guineeFixture from '@/api/fixtures/bootstrap.json'
import gabonFixture from '@/api/fixtures/bootstrap-gabon.json'

function ouvert(chemin: string): boolean {
  return useTenantStore().rubriqueOuverte(rubriqueDuChemin(chemin))
}

describe('ouverture des rubriques selon l ambassade', () => {
  beforeEach(() => {
    setActivePinia(createPinia())
  })

  it('laisse tout ouvert quand aucune configuration n est chargee', () => {
    // Un bootstrap en echec ne doit pas eteindre le site entier.
    const fermes = Object.keys(RUBRIQUE_PAR_CHEMIN).filter((chemin) => !ouvert(chemin))

    expect(fermes).toEqual([])
  })

  it('laisse ouverte une rubrique que l ambassade ne declare pas', () => {
    useTenantStore().embassy = { modules: { bilateral: true } } as unknown as Embassy

    // `chancellerie` est absent des modules : absent ne veut pas dire ferme.
    expect(ouvert('/chancellerie')).toBe(true)
  })

  it('ferme une rubrique explicitement mise a false', () => {
    useTenantStore().embassy = { modules: { chancellerie: false } } as unknown as Embassy

    expect(ouvert('/chancellerie')).toBe(false)
  })

  it('laisse ouvert un chemin qui ne depend d aucune rubrique', () => {
    useTenantStore().embassy = { modules: { chancellerie: false } } as unknown as Embassy

    expect(ouvert('/')).toBe(true)
    expect(ouvert('/actualite')).toBe(true)
    expect(ouvert('/presentation')).toBe(true)
    expect(ouvert('/ambassadeur')).toBe(true)
  })

  it('ferme les six pages de relations bilaterales d un seul drapeau', () => {
    useTenantStore().embassy = { modules: { bilateral: false } } as unknown as Embassy

    const bilaterales = [
      '/relations-bilaterales',
      '/usa',
      '/costa-rica',
      '/haiti',
      '/bahamas',
      '/fond-monetaire',
    ]

    expect(bilaterales.filter((chemin) => ouvert(chemin))).toEqual([])
  })

  describe('sur les deux ambassades reellement configurees', () => {
    it('garde le site guineen entierement ouvert', () => {
      useTenantStore().embassy = guineeFixture.embassy as unknown as Embassy

      const fermes = Object.keys(RUBRIQUE_PAR_CHEMIN).filter((chemin) => !ouvert(chemin))

      expect(fermes).toEqual([])
    })

    it('ferme au Gabon les rubriques dont l ambassade n a pas fourni le contenu', () => {
      useTenantStore().embassy = gabonFixture.embassy as unknown as Embassy

      const fermes = Object.keys(RUBRIQUE_PAR_CHEMIN).filter((chemin) => !ouvert(chemin))

      expect(fermes.sort()).toEqual(
        [
          '/bahamas',
          '/calendrier',
          '/chancellerie',
          '/consulat',
          '/consuls-honoraires',
          '/costa-rica',
          '/fond-monetaire',
          '/haiti',
          '/relations-bilaterales',
          '/rendez-vous',
          '/services-ambassadeur',
          '/usa',
        ].sort(),
      )
    })

    it('garde ouvertes au Gabon les pages que le site publie vraiment', () => {
      useTenantStore().embassy = gabonFixture.embassy as unknown as Embassy

      const publiees = ['/', '/actualite', '/presentation', '/ambassadeur', '/demarche-ligne']

      expect(publiees.filter((chemin) => !ouvert(chemin))).toEqual([])
    })
  })
})
