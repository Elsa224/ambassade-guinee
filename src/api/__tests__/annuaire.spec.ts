import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest'
import {
  normaliserAnnuaire,
  recupererAnnuaire,
  recupererAnnuaireAdmin,
  ordonnerPersonnel,
  ANNUAIRE_VIDE,
  type MembrePersonnel,
} from '../annuaire'

function reponse(corps: unknown, statut = 200) {
  return new Response(JSON.stringify(corps), {
    status: statut,
    headers: { 'Content-Type': 'application/json' },
  })
}

function membre(partiel: Partial<MembrePersonnel> = {}): MembrePersonnel {
  return {
    id: 1,
    name: 'Awa Ndong',
    role: 'Premier Conseiller',
    email: null,
    phone: null,
    image_url: null,
    position: 1,
    ...partiel,
  }
}

describe("normalisation de l'annuaire", () => {
  it('ne remplace jamais une liste absente par du contenu', () => {
    // Meme garantie que pour l'accueil : ce que le CMS ne sert pas n'existe
    // pas, le repli n'est jamais le contenu compile dans le gabarit.
    expect(normaliserAnnuaire({})).toEqual(ANNUAIRE_VIDE)
    expect(normaliserAnnuaire(null)).toEqual(ANNUAIRE_VIDE)
    expect(normaliserAnnuaire(undefined).consuls).toEqual([])
  })

  it("garde l'ordre servi, meme quand les positions ont des trous", () => {
    // Au contrat, apres une suppression les positions gardent un trou
    // jusqu'au prochain reordonnancement : la liste servie reste triee, et
    // c'est elle qui fait foi. Retrier ou indexer par `position` est le bug
    // que ce test empeche.
    const servis = [
      membre({ id: 7, name: 'Premier', position: 2 }),
      membre({ id: 3, name: 'Second', position: 5 }),
    ]

    const annuaire = normaliserAnnuaire({ staff: servis })

    expect(annuaire.staff.map((m) => m.name)).toEqual(['Premier', 'Second'])
  })

  it('ne modifie pas le tableau recu et rend une copie', () => {
    const servis = [membre({ id: 1 }), membre({ id: 2 })]
    const annuaire = normaliserAnnuaire({ staff: servis })

    annuaire.staff.pop()

    expect(servis).toHaveLength(2)
  })
})

describe("lecture de l'annuaire", () => {
  beforeEach(() => {
    vi.stubGlobal('fetch', vi.fn())
  })

  afterEach(() => {
    vi.unstubAllGlobals()
  })

  it('appelle la route visiteur anonyme', async () => {
    vi.mocked(fetch).mockResolvedValue(reponse({ data: { staff: [], consuls: [] } }))

    const annuaire = await recupererAnnuaire()

    expect(fetch).toHaveBeenCalledWith('/api/content/directory', expect.anything())
    expect(annuaire).toEqual(ANNUAIRE_VIDE)
  })

  it("appelle la lecture d'administration sur sa propre route", async () => {
    vi.mocked(fetch).mockResolvedValue(reponse({ data: { staff: [membre()], consuls: [] } }))

    const annuaire = await recupererAnnuaireAdmin()

    expect(fetch).toHaveBeenCalledWith('/api/admin/directory', expect.anything())
    expect(annuaire.staff).toHaveLength(1)
  })
})

describe('reordonnancement', () => {
  beforeEach(() => {
    vi.stubGlobal('fetch', vi.fn())
  })

  afterEach(() => {
    vi.unstubAllGlobals()
  })

  it("envoie la liste complete d'identifiants et rend la liste servie", async () => {
    const reordonnes = [membre({ id: 3, position: 1 }), membre({ id: 7, position: 2 })]
    vi.mocked(fetch).mockResolvedValue(reponse({ data: reordonnes }))

    const resultat = await ordonnerPersonnel([3, 7])

    const [url, options] = vi.mocked(fetch).mock.calls[0]!
    expect(url).toBe('/api/admin/directory/staff/order')
    expect(options?.method).toBe('PUT')
    expect(JSON.parse(String(options?.body))).toEqual({ ids: [3, 7] })
    expect(resultat.map((m) => m.id)).toEqual([3, 7])
  })
})
