import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest'
import {
  listerEvenementsAdmin,
  bornesAffichees,
  LIMITE_MAX,
  CHEMIN_LISTE_ADMIN,
  type Pagination,
} from '../evenements-admin'

function pagination(partielle: Partial<Pagination>): Pagination {
  return { page: 1, limit: 20, total: 0, totalPages: 1, ...partielle }
}

describe('bornes affichees', () => {
  it('numerote la premiere page a partir de un', () => {
    expect(bornesAffichees(pagination({ page: 1, limit: 20, total: 204 }))).toEqual({
      premier: 1,
      dernier: 20,
    })
  })

  it('decale les bornes sur une page intermediaire', () => {
    expect(bornesAffichees(pagination({ page: 3, limit: 30, total: 204 }))).toEqual({
      premier: 61,
      dernier: 90,
    })
  })

  it('ne depasse pas le total sur la derniere page', () => {
    // Sans ce plafond, la derniere page annoncerait « 201-220 sur 204 ».
    expect(bornesAffichees(pagination({ page: 11, limit: 20, total: 204 }))).toEqual({
      premier: 201,
      dernier: 204,
    })
  })

  it('n annonce aucune ligne quand la liste est vide', () => {
    expect(bornesAffichees(pagination({ total: 0 }))).toEqual({ premier: 0, dernier: 0 })
  })
})

describe('liste d administration', () => {
  let demande: string

  beforeEach(() => {
    demande = ''
    vi.stubGlobal(
      'fetch',
      vi.fn((url: string) => {
        demande = String(url)
        return Promise.resolve(
          new Response(JSON.stringify({ data: [], pagination: pagination({}) }), {
            status: 200,
            headers: { 'Content-Type': 'application/json' },
          }),
        )
      }),
    )
  })

  afterEach(() => {
    vi.unstubAllGlobals()
  })

  it('demande la page et la limite voulues', async () => {
    await listerEvenementsAdmin(3, 50)

    expect(demande).toContain(CHEMIN_LISTE_ADMIN)
    expect(demande).toContain('page=3')
    expect(demande).toContain('limit=50')
  })

  it('borne la limite au plafond du serveur', async () => {
    // Le serveur rabat SILENCIEUSEMENT a 100 : demander 500 rendrait 100 sans
    // le dire, et l'ecran croirait afficher cinq cents lignes.
    await listerEvenementsAdmin(1, 500)

    expect(demande).toContain(`limit=${LIMITE_MAX}`)
  })

  it('ne demande jamais une page inferieure a un', async () => {
    await listerEvenementsAdmin(0, 20)

    expect(demande).toContain('page=1')
  })

  it('rend la pagination servie a cote des evenements', async () => {
    const page = await listerEvenementsAdmin(1, 20)

    expect(page.evenements).toEqual([])
    expect(page.pagination.limit).toBe(20)
  })
})
