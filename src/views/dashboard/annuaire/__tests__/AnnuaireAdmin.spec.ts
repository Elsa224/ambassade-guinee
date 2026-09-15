import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest'
import { mount, flushPromises, type VueWrapper } from '@vue/test-utils'
import AnnuaireAdmin from '../AnnuaireAdmin.vue'
import type { Annuaire, ConsulHonoraire, MembrePersonnel } from '@/api/annuaire'

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

function consul(partiel: Partial<ConsulHonoraire> = {}): ConsulHonoraire {
  return {
    id: 1,
    name: 'Mariam Diallo',
    role: 'Consul honoraire',
    city: 'Kankan',
    address: null,
    email: null,
    phone: null,
    position: 1,
    ...partiel,
  }
}

/** Requetes d'ecriture recues, pour verifier methode, chemin et corps. */
let ecritures: { url: string; method: string; corps: unknown }[] = []

/**
 * Sert l'annuaire donne en lecture, accepte les ecritures, et permet de
 * forcer un refus. Installe AVANT le montage : l'ecran charge des `mounted`.
 */
function servir(annuaire: Annuaire, refus: { statut: number; corps: unknown } | null = null) {
  vi.stubGlobal(
    'fetch',
    vi.fn((url: string, options?: RequestInit) => {
      const methode = options?.method ?? 'GET'
      if (methode !== 'GET') {
        let corps: unknown = null
        if (typeof options?.body === 'string') corps = JSON.parse(options.body)
        ecritures.push({ url: String(url), method: methode, corps })
        if (refus) {
          return Promise.resolve(
            new Response(JSON.stringify(refus.corps), {
              status: refus.statut,
              headers: { 'Content-Type': 'application/json' },
            }),
          )
        }
        if (methode === 'DELETE') return Promise.resolve(new Response(null, { status: 204 }))
        return Promise.resolve(
          new Response(JSON.stringify({ data: {} }), {
            status: methode === 'POST' ? 201 : 200,
            headers: { 'Content-Type': 'application/json' },
          }),
        )
      }
      return Promise.resolve(
        new Response(JSON.stringify({ data: annuaire }), {
          status: 200,
          headers: { 'Content-Type': 'application/json' },
        }),
      )
    }),
  )
}

async function rendre(): Promise<VueWrapper> {
  const ecran = mount(AnnuaireAdmin)
  await flushPromises()
  return ecran
}

function boutonPar(ecran: VueWrapper, libelle: string) {
  const bouton = ecran.findAll('button').find((b) => b.text().includes(libelle))
  if (bouton === undefined) throw new Error(`bouton « ${libelle} » introuvable`)
  return bouton
}

beforeEach(() => {
  ecritures = []
  vi.useFakeTimers()
})

afterEach(() => {
  vi.useRealTimers()
  vi.unstubAllGlobals()
})

describe("l'ecran annuaire", () => {
  it("affiche les deux listes dans l'ordre servi, meme avec des trous de position", async () => {
    // Au contrat, une suppression laisse un trou dans les positions : c'est
    // l'ordre du tableau servi qui fait foi, jamais `position` comme index.
    servir({
      staff: [
        membre({ id: 7, name: 'Premier membre', position: 2 }),
        membre({ id: 3, name: 'Second membre', position: 5 }),
      ],
      consuls: [consul({ id: 2, name: 'Seul consul' })],
    })
    const ecran = await rendre()

    const texte = ecran.text()
    expect(texte.indexOf('Premier membre')).toBeGreaterThan(-1)
    expect(texte.indexOf('Premier membre')).toBeLessThan(texte.indexOf('Second membre'))
    expect(texte).toContain('Seul consul')
    expect(texte).toContain('Kankan')
  })

  it('ajoute un membre en envoyant `null` pour les champs facultatifs vides', async () => {
    servir({ staff: [], consuls: [] })
    const ecran = await rendre()

    await boutonPar(ecran, 'Ajouter un membre').trigger('click')
    await ecran.find('#nom-membre').setValue('Awa Ndong')
    await ecran.find('#fonction-membre').setValue('Premier Conseiller')
    await ecran.find('form').trigger('submit')
    await flushPromises()

    expect(ecritures).toHaveLength(1)
    expect(ecritures[0]).toMatchObject({
      url: '/api/admin/directory/staff',
      method: 'POST',
      corps: {
        name: 'Awa Ndong',
        role: 'Premier Conseiller',
        email: null,
        phone: null,
        image_url: null,
      },
    })
  })

  it("refuse d'envoyer un membre sans nom ou sans fonction", async () => {
    servir({ staff: [], consuls: [] })
    const ecran = await rendre()

    await boutonPar(ecran, 'Ajouter un membre').trigger('click')
    await ecran.find('form').trigger('submit')
    await flushPromises()

    expect(ecritures).toHaveLength(0)
    expect(ecran.text()).toContain('Le nom et la fonction sont obligatoires.')
  })

  it('exige aussi la ville pour un consul', async () => {
    servir({ staff: [], consuls: [] })
    const ecran = await rendre()

    await boutonPar(ecran, 'Ajouter un consul').trigger('click')
    await ecran.find('#nom-consul').setValue('Mariam Diallo')
    await ecran.find('#fonction-consul').setValue('Consul honoraire')
    await ecran.find('form').trigger('submit')
    await flushPromises()

    expect(ecritures).toHaveLength(0)
    expect(ecran.text()).toContain('Le nom, la fonction et la ville sont obligatoires.')
  })

  it("reordonne en envoyant la liste complete d'identifiants", async () => {
    servir({
      staff: [
        membre({ id: 7, name: 'Premier membre' }),
        membre({ id: 3, name: 'Second membre', position: 2 }),
      ],
      consuls: [],
    })
    const ecran = await rendre()

    const descendre = ecran.find('button[aria-label="Descendre Premier membre"]')
    expect(descendre.exists()).toBe(true)
    await descendre.trigger('click')
    await flushPromises()

    expect(ecritures).toHaveLength(1)
    expect(ecritures[0]).toMatchObject({
      url: '/api/admin/directory/staff/order',
      method: 'PUT',
      corps: { ids: [3, 7] },
    })
  })

  it('affiche le message du back quand il refuse la saisie', async () => {
    servir(
      { staff: [], consuls: [] },
      {
        statut: 422,
        corps: { message: "L'image doit appartenir à l'ambassade.", errors: {} },
      },
    )
    const ecran = await rendre()

    await boutonPar(ecran, 'Ajouter un membre').trigger('click')
    await ecran.find('#nom-membre').setValue('Awa Ndong')
    await ecran.find('#fonction-membre').setValue('Premier Conseiller')
    await ecran.find('form').trigger('submit')
    await flushPromises()

    expect(ecran.text()).toContain("L'image doit appartenir à l'ambassade.")
  })
})
