import { describe, it, expect, beforeEach } from 'vitest'
import { createPinia, setActivePinia } from 'pinia'
import { useTenantStore } from '@/stores/tenant'
import {
  rubriqueDuChemin,
  RUBRIQUE_PAR_CHEMIN,
  cheminOuvert,
  moduleDuChemin,
  type TenantConsulte,
} from '../rubriques'
import type { Embassy } from '@/api/bootstrap'
import { GUINEE, GABON } from '@/api/fixtures/tenants'

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
      useTenantStore().embassy = GUINEE

      const fermes = Object.keys(RUBRIQUE_PAR_CHEMIN).filter((chemin) => !ouvert(chemin))

      expect(fermes).toEqual([])
    })

    it('ferme au Gabon les rubriques dont l ambassade n a pas fourni le contenu', () => {
      useTenantStore().embassy = GABON

      const fermes = Object.keys(RUBRIQUE_PAR_CHEMIN).filter((chemin) => !ouvert(chemin))

      expect(fermes.sort()).toEqual(
        [
          '/ambassadeur',
          '/bahamas',
          '/calendrier',
          '/chancellerie',
          '/consulat',
          '/consuls-honoraires',
          '/costa-rica',
          '/fond-monetaire',
          '/haiti',
          '/presentation',
          '/relations-bilaterales',
          '/rendez-vous',
          '/services-ambassadeur',
          '/usa',
        ].sort(),
      )
    })

    it('garde ouvertes au Gabon les pages que le site publie vraiment', () => {
      useTenantStore().embassy = GABON

      const publiees = ['/', '/actualite', '/demarche-ligne', '/actualites-ambassade']

      expect(publiees.filter((chemin) => !ouvert(chemin))).toEqual([])
    })
  })
})

describe('chemins dependant d un module a provisionner', () => {
  it('ferme le module tant que l ambassade ne le declare pas actif', () => {
    // Defaut inverse de celui des rubriques de contenu : un module absent de
    // la configuration n'a pas ete provisionne, et ses routes rendent 404
    // cote back. L'annoncer au menu promettrait une page qui n'existe pas.
    expect(cheminOuvert('/evenements', null)).toBe(false)
    expect(cheminOuvert('/evenements', { modules: {} })).toBe(false)
    expect(cheminOuvert('/evenements', { modules: { secure_events: false } })).toBe(false)
  })

  it('ouvre le module quand l ambassade le declare actif', () => {
    expect(cheminOuvert('/evenements', { modules: { secure_events: true } })).toBe(true)
  })

  it("ne ferme pas la page d'inscription atteinte par QR code", () => {
    // Le QR est imprime et remis en main propre : il peut circuler alors que
    // le module vient de basculer. Le back fait autorite sur le jeton et rend
    // 404 si besoin ; la page l'annonce en parlant du lien, la ou « Rubrique
    // en preparation » laisserait le porteur du QR sans explication.
    expect(
      cheminOuvert('/evenements/inscription/AbC123', { modules: { secure_events: false } }),
    ).toBe(true)
  })

  it('ne ferme que le chemin exactement declare', () => {
    // Le filtrage porte sur ce que le site offre, pas sur une arborescence :
    // un chemin voisin ne doit pas tomber avec le module.
    expect(moduleDuChemin('/evenements-passes')).toBeNull()
    expect(cheminOuvert('/evenements-passes', { modules: { secure_events: false } })).toBe(true)
  })

  it('garde aux rubriques de contenu leur defaut ouvert', () => {
    // La generalisation ne doit pas contaminer l'autre regle.
    expect(cheminOuvert('/chancellerie', { modules: {} })).toBe(true)
    expect(cheminOuvert('/chancellerie', { modules: { chancellerie: false } })).toBe(false)
    expect(cheminOuvert('/', { modules: {} })).toBe(true)
  })

  it('ferme le module sur les deux ambassades reellement configurees', () => {
    // Ni la Guinee ni le Gabon n'ont provisionne Ambassade Secure : aucune
    // entree « Évènements » ne doit apparaitre aujourd'hui en production.
    const tenants: TenantConsulte[] = [GUINEE, GABON]

    expect(tenants.filter((t) => cheminOuvert('/evenements', t))).toEqual([])
  })
})
