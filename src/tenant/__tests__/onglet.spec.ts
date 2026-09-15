import { describe, it, expect, beforeEach } from 'vitest'
import { readFileSync } from 'node:fs'
import { resolve } from 'node:path'
import { appliquerIdentiteDeLOnglet, titreDeLOnglet } from '@/tenant/onglet'
import type { Embassy } from '@/api/bootstrap'
import { GABON, GABON_AVANT_COLONNES } from '@/api/fixtures/tenants'

function sansLibelle(embassy: Embassy): Embassy {
  return { ...embassy, display_name: '' }
}

describe("le titre de l'onglet", () => {
  it('prend le libelle complet quand il est renseigne', () => {
    expect(titreDeLOnglet(GABON)).toBe(GABON.display_name)
  })

  it('se deduit du nom officiel a defaut de libelle', () => {
    expect(titreDeLOnglet(sansLibelle(GABON))).toBe('Ambassade de la Republique Gabonaise')
  })

  it('reste neutre sans tenant charge', () => {
    expect(titreDeLOnglet(null)).toBe('Ambassade')
  })

  it("reste neutre quand l'ambassade n'a ni libelle ni nom officiel", () => {
    expect(titreDeLOnglet({ ...GABON, display_name: '', country_name_official: '  ' })).toBe(
      'Ambassade',
    )
  })

  it('accepte un tenant provisionne avant la colonne du libelle', () => {
    expect(titreDeLOnglet(GABON_AVANT_COLONNES)).toContain('Gabonaise')
  })
})

describe("la favicone de l'onglet", () => {
  beforeEach(() => {
    document.head.innerHTML = '<link rel="icon" type="image/svg+xml" href="/favicon.svg" />'
    document.title = 'Ambassade'
  })

  it('remplace la favicone neutre par le logo servi', () => {
    appliquerIdentiteDeLOnglet(GABON)

    const lien = document.querySelector<HTMLLinkElement>('link[rel~="icon"]')
    expect(lien?.getAttribute('href')).toBe(GABON.logo_image)
  })

  it('retire le type declare, qui ne vaut que pour la favicone neutre', () => {
    appliquerIdentiteDeLOnglet(GABON)

    expect(document.querySelector('link[rel~="icon"]')?.hasAttribute('type')).toBe(false)
  })

  it('laisse le repli neutre en place quand aucun logo n est servi', () => {
    appliquerIdentiteDeLOnglet({ ...GABON, logo_image: '' })

    expect(document.querySelector('link[rel~="icon"]')?.getAttribute('href')).toBe('/favicon.svg')
  })

  it('cree le lien quand le document n en porte aucun', () => {
    document.head.innerHTML = ''
    appliquerIdentiteDeLOnglet(GABON)

    expect(document.querySelector('link[rel~="icon"]')?.getAttribute('href')).toBe(GABON.logo_image)
  })
})

/**
 * `index.html` est servi tel quel a tous les domaines : ce qu'il nomme vaut
 * pour toutes les ambassades. C'est par lui que l'embleme guineen s'est
 * retrouve dans l'apercu de partage du site gabonais.
 */
describe('la coquille HTML', () => {
  const coquille = readFileSync(resolve(__dirname, '../../../index.html'), 'utf8')

  it('ne nomme aucune ambassade en particulier', () => {
    expect(coquille).not.toMatch(/Guin[ée]e|Gabon|guinee|gabon/i)
  })

  it('sert une favicone neutre, pas un embleme national', () => {
    expect(coquille).toContain('href="/favicon.svg"')
    expect(coquille).not.toContain('/logo.png')
  })

  it("porte les balises de partage, a l'emplacement ou le serveur les remplacera", () => {
    expect(coquille).toContain('property="og:title"')
    expect(coquille).toContain('property="og:description"')
  })
})
