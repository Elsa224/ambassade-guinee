import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest'
import { mount, flushPromises } from '@vue/test-utils'
import { createRouter, createMemoryHistory } from 'vue-router'
import { createPinia, setActivePinia } from 'pinia'
import { defineComponent, h } from 'vue'
import Calendrier from '../Calendrier.vue'
import { useTenantStore } from '@/stores/tenant'
import { choisirDansLaListe } from '@/components/ui/__tests__/pilotage'
import { GABON } from '@/api/fixtures/tenants'

const Vide = defineComponent({ render: () => h('div') })

/** Requetes de lecture recues, pour verifier le parametre d'annee. */
let appels: string[] = []

/**
 * Sert un calendrier par annee demandee. Sans annee, c'est la premiere cle
 * qui fait office de defaut, comme le back sert l'annee civile courante.
 */
function servir(parAnnee: Record<number, unknown>, defaut: number) {
  vi.stubGlobal(
    'fetch',
    vi.fn((url: string) => {
      appels.push(String(url))
      const demande = new URL(String(url), 'http://localhost').searchParams.get('year')
      const annee = demande === null ? defaut : Number(demande)
      return Promise.resolve(
        new Response(JSON.stringify({ data: parAnnee[annee] }), {
          status: 200,
          headers: { 'Content-Type': 'application/json' },
        }),
      )
    }),
  )
}

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

async function monter() {
  const routeur = createRouter({
    history: createMemoryHistory(),
    routes: [
      { path: '/', component: Vide },
      { path: '/calendrier', component: Calendrier },
    ],
  })
  routeur.push('/calendrier')
  await routeur.isReady()
  const wrapper = mount(Calendrier, { global: { plugins: [routeur] } })
  await flushPromises()
  return wrapper
}

describe('page du calendrier des jours feries', () => {
  beforeEach(() => {
    appels = []
    setActivePinia(createPinia())
    useTenantStore().embassy = GABON
  })

  afterEach(() => {
    vi.unstubAllGlobals()
  })

  it('affiche les fetes servies, leur date et le libelle de leur type', async () => {
    servir({ 2026: calendrier({ holidays: [FETE] }) }, 2026)

    const wrapper = await monter()
    const texte = wrapper.text()

    expect(texte).toContain("Jour de l'An")
    expect(texte).toContain('1er janvier')
    expect(texte).toContain('Fête légale')
    // La pastille du gabarit guineen a disparu au profit des trois types.
    expect(texte).not.toContain('Fête musulmane')
  })

  it("affiche la note d'une fete a date variable", async () => {
    servir(
      {
        2026: calendrier({
          holidays: [{ ...FETE, id: 2, name: 'Tabaski', note: 'date variable' }],
        }),
      },
      2026,
    )

    const wrapper = await monter()

    expect(wrapper.text()).toContain('date variable')
  })

  it("affiche le texte de presentation quand l'ambassade en a saisi un", async () => {
    // Le gabarit portait en dur la reference d'un decret guineen : le texte
    // ne vient plus que du CMS.
    servir({ 2026: calendrier({ intro: 'Conformement au decret du 2 novembre 2022.' }) }, 2026)

    const wrapper = await monter()

    expect(wrapper.text()).toContain('Conformement au decret du 2 novembre 2022.')
  })

  it('propose le PDF en consultation, pas en telechargement', async () => {
    // Le relais ne pose pas de Content-Disposition : le fichier s'ouvre dans
    // l'onglet. Promettre un telechargement mentirait sur ce qui se passe.
    servir({ 2026: calendrier({ document_url: 'https://exemple.test/calendrier.pdf' }) }, 2026)

    const wrapper = await monter()
    const lien = wrapper.find('a[href="https://exemple.test/calendrier.pdf"]')

    expect(lien.exists()).toBe(true)
    expect(lien.attributes('target')).toBe('_blank')
    expect(wrapper.text()).toContain('Consulter le calendrier au format PDF')
    expect(wrapper.text()).not.toContain('Télécharger le PDF')
  })

  it("change d'annee en la passant en parametre", async () => {
    servir(
      {
        2026: calendrier({ available_years: [2026, 2027], holidays: [FETE] }),
        2027: calendrier({
          year: 2027,
          available_years: [2026, 2027],
          holidays: [{ ...FETE, id: 3, name: 'Fete de 2027', date: '2027-05-01' }],
        }),
      },
      2026,
    )

    const wrapper = await monter()
    await choisirDansLaListe(wrapper, '#annee-feries', '2027')
    await flushPromises()

    expect(appels).toContain('/api/content/holidays?year=2027')
    expect(wrapper.text()).toContain('Fete de 2027')
  })

  it('garde la page et son selecteur sur une annee sans aucune fete', async () => {
    // Au contrat, une annee vide rend 200 avec `available_years` renseigne.
    // Se retracter ici effacerait le moyen de revenir a une annee pourvue.
    servir({ 2026: calendrier({ available_years: [2025, 2026], holidays: [] }) }, 2026)

    const wrapper = await monter()

    expect(wrapper.find('#annee-feries').exists()).toBe(true)
    expect(wrapper.text()).toContain("Aucune fête n'est publiée pour cette année.")
    expect(wrapper.text()).not.toContain('Rubrique en préparation')
  })

  it("se retracte quand l'ambassade n'a rien publie du tout", async () => {
    // Ni fete, ni annee pourvue, ni texte, ni document : le back rend bien
    // 200, et c'est au front de ne rien montrer du gabarit.
    servir({ 2026: calendrier({ available_years: [] }) }, 2026)

    const wrapper = await monter()

    expect(wrapper.text()).toContain('Rubrique en préparation')
  })

  it('se retracte aussi quand le service est injoignable', async () => {
    vi.stubGlobal('fetch', vi.fn().mockRejectedValue(new Error('reseau')))

    const wrapper = await monter()

    expect(wrapper.text()).toContain('Rubrique en préparation')
  })
})
