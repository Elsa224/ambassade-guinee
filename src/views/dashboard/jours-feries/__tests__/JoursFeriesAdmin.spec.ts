import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest'
import { mount, flushPromises, type VueWrapper } from '@vue/test-utils'
import JoursFeriesAdmin from '../JoursFeriesAdmin.vue'

/** Requetes d'ecriture recues, pour verifier methode, chemin et corps. */
let ecritures: { url: string; method: string; corps: unknown }[] = []
/** Lectures recues, pour verifier le parametre d'annee. */
let lectures: string[] = []

function calendrier(partiel: Record<string, unknown> = {}) {
  return {
    year: 2026,
    available_years: [2026],
    intro: null,
    document_url: null,
    holidays: [],
    ...partiel,
  }
}

const FETE = { id: 1, name: "Jour de l'An", date: '2026-01-01', type: 'legale', note: null }

/**
 * Sert le calendrier donne en lecture et accepte les ecritures. Installe
 * AVANT le montage : l'ecran charge des `mounted`.
 */
function servir(parAnnee: Record<number, unknown>, defaut = 2026) {
  vi.stubGlobal(
    'fetch',
    vi.fn((url: string, options?: RequestInit) => {
      const methode = options?.method ?? 'GET'
      if (methode !== 'GET') {
        let corps: unknown = null
        if (typeof options?.body === 'string') corps = JSON.parse(options.body)
        ecritures.push({ url: String(url), method: methode, corps })
        if (methode === 'DELETE') return Promise.resolve(new Response(null, { status: 204 }))
        return Promise.resolve(
          new Response(JSON.stringify({ data: {} }), {
            status: methode === 'POST' ? 201 : 200,
            headers: { 'Content-Type': 'application/json' },
          }),
        )
      }
      lectures.push(String(url))
      const demande = new URL(String(url), 'http://localhost').searchParams.get('year')
      const annee = demande === null ? defaut : Number(demande)
      return Promise.resolve(
        new Response(JSON.stringify({ data: parAnnee[annee] ?? calendrier({ year: annee }) }), {
          status: 200,
          headers: { 'Content-Type': 'application/json' },
        }),
      )
    }),
  )
}

async function rendre(): Promise<VueWrapper> {
  const ecran = mount(JoursFeriesAdmin)
  await flushPromises()
  return ecran
}

/** L'ecran porte deux formulaires : les reglages, puis la boite modale. */
function formulaireReglages(ecran: VueWrapper) {
  const formulaire = ecran.findAll('form')[0]
  if (formulaire === undefined) throw new Error('formulaire des reglages introuvable')
  return formulaire
}

function formulaireModal(ecran: VueWrapper) {
  const formulaires = ecran.findAll('form')
  if (formulaires.length < 2) throw new Error('boite modale fermee')
  return formulaires[formulaires.length - 1]!
}

function boutonPar(ecran: VueWrapper, libelle: string) {
  const bouton = ecran.findAll('button').find((b) => b.text().includes(libelle))
  if (bouton === undefined) throw new Error(`bouton « ${libelle} » introuvable`)
  return bouton
}

beforeEach(() => {
  ecritures = []
  lectures = []
  vi.useFakeTimers()
})

afterEach(() => {
  vi.useRealTimers()
  vi.unstubAllGlobals()
})

describe("l'ecran des jours feries", () => {
  it("lit la surface d'administration et affiche les fetes de l'annee", async () => {
    servir({ 2026: calendrier({ holidays: [FETE] }) })

    const ecran = await rendre()

    expect(lectures[0]).toBe('/api/admin/holidays')
    expect(ecran.text()).toContain("Jour de l'An")
    expect(ecran.text()).toContain('1er janvier')
    expect(ecran.text()).toContain('Fête légale')
  })

  it("ajoute une fete datee dans l'annee affichee", async () => {
    servir({ 2026: calendrier() })
    const ecran = await rendre()

    await boutonPar(ecran, 'Ajouter une fête').trigger('click')
    await ecran.find('#nom-fete').setValue('Fête du Travail')
    await ecran.find('#date-fete').setValue('2026-05-01')
    await formulaireModal(ecran).trigger('submit')
    await flushPromises()

    expect(ecritures).toHaveLength(1)
    expect(ecritures[0]).toMatchObject({
      url: '/api/admin/holidays',
      method: 'POST',
      corps: { name: 'Fête du Travail', date: '2026-05-01', type: 'legale', note: null },
    })
  })

  it("refuse d'envoyer une fete sans nom", async () => {
    servir({ 2026: calendrier() })
    const ecran = await rendre()

    await boutonPar(ecran, 'Ajouter une fête').trigger('click')
    await ecran.find('#date-fete').setValue('2026-05-01')
    await formulaireModal(ecran).trigger('submit')
    await flushPromises()

    expect(ecritures).toHaveLength(0)
    expect(ecran.text()).toContain('Le nom et la date sont obligatoires.')
  })

  it('envoie TOUJOURS les deux reglages, meme quand un seul a change', async () => {
    // C'est le point dur du contrat : l'enregistrement est un remplacement
    // complet. N'envoyer que le texte effacerait le document.
    servir({
      2026: calendrier({ holidays: [FETE], document_url: 'https://exemple.test/c.pdf' }),
    })
    const ecran = await rendre()

    await ecran.find('#intro-feries').setValue('Conformément au décret.')
    await formulaireReglages(ecran).trigger('submit')
    await flushPromises()

    expect(ecritures).toHaveLength(1)
    expect(ecritures[0]).toMatchObject({
      url: '/api/admin/holidays/settings',
      method: 'PUT',
      corps: {
        intro: 'Conformément au décret.',
        document_url: 'https://exemple.test/c.pdf',
      },
    })
  })

  it('efface un reglage vide en envoyant `null`', async () => {
    servir({ 2026: calendrier({ holidays: [FETE], intro: 'Ancien texte' }) })
    const ecran = await rendre()

    await ecran.find('#intro-feries').setValue('')
    await formulaireReglages(ecran).trigger('submit')
    await flushPromises()

    expect(ecritures[0]).toMatchObject({
      corps: { intro: null, document_url: null },
    })
  })

  it("change d'annee en la passant en parametre", async () => {
    servir({
      2026: calendrier({ available_years: [2026, 2027], holidays: [FETE] }),
      2027: calendrier({ year: 2027, available_years: [2026, 2027], holidays: [] }),
    })
    const ecran = await rendre()

    await ecran.find('#annee-admin').setValue(2027)
    await flushPromises()

    expect(lectures).toContain('/api/admin/holidays?year=2027')
  })

  it("garde au selecteur une annee ouverte qui n'a pas encore de fete", async () => {
    // Le back ne connait une annee qu'a sa premiere fete. Sans ce garde,
    // l'annee qu'on vient d'ouvrir disparaitrait du selecteur au
    // rechargement, avant meme d'avoir pu y saisir quoi que ce soit.
    servir({ 2026: calendrier({ holidays: [FETE] }) })
    const ecran = await rendre()

    await boutonPar(ecran, 'Ajouter une année').trigger('click')
    await ecran.find('#nouvelle-annee').setValue(2028)
    await formulaireModal(ecran).trigger('submit')
    await flushPromises()

    const options = ecran
      .find('#annee-admin')
      .findAll('option')
      .map((o) => o.text())
    expect(options).toContain('2028')
    expect(lectures).toContain('/api/admin/holidays?year=2028')
  })

  it('supprime une fete', async () => {
    servir({ 2026: calendrier({ holidays: [FETE] }) })
    const ecran = await rendre()

    await ecran.find('button[aria-label="Supprimer Jour de l\'An"]').trigger('click')
    await flushPromises()

    expect(ecritures[0]).toMatchObject({ url: '/api/admin/holidays/1', method: 'DELETE' })
  })

  it('affiche le message du back quand il refuse la saisie', async () => {
    vi.stubGlobal(
      'fetch',
      vi.fn((url: string, options?: RequestInit) =>
        Promise.resolve(
          (options?.method ?? 'GET') === 'GET'
            ? new Response(JSON.stringify({ data: calendrier() }), {
                status: 200,
                headers: { 'Content-Type': 'application/json' },
              })
            : new Response(JSON.stringify({ message: 'Le type de fête est inconnu.' }), {
                status: 422,
                headers: { 'Content-Type': 'application/json' },
              }),
        ),
      ),
    )
    const ecran = await rendre()

    await boutonPar(ecran, 'Ajouter une fête').trigger('click')
    await ecran.find('#nom-fete').setValue('Une fête')
    await ecran.find('#date-fete').setValue('2026-05-01')
    await formulaireModal(ecran).trigger('submit')
    await flushPromises()

    expect(ecran.text()).toContain('Le type de fête est inconnu.')
  })
})
