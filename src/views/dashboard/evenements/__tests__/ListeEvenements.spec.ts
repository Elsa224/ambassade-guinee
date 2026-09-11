import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest'
import { mount, flushPromises } from '@vue/test-utils'
import { createRouter, createMemoryHistory } from 'vue-router'
import { defineComponent, h } from 'vue'
import ListeEvenements from '../ListeEvenements.vue'
import type { EvenementAdmin, Pagination } from '@/api/evenements-admin'

function evenement(partiel: Partial<EvenementAdmin> = {}): EvenementAdmin {
  return {
    slug: 'fete-nationale',
    name: 'Fête nationale du Gabon',
    date: '2026-08-17',
    time: '18:30',
    location: 'Chancellerie, Conakry',
    description: 'Réception officielle.',
    status: 'ACTIVE',
    createdAt: '2026-06-01T09:00:00.000Z',
    logoUrl: null,
    registrationOpen: true,
    registrationDeadline: '2026-08-14',
    capacity: 200,
    registeredCount: 120,
    spotsRemaining: 80,
    typeLabel: 'Fête nationale',
    participants: [{ fullName: 'Awa Ndong', email: 'awa.ndong@exemple.test', uidn: 'GA100001' }],
    ...partiel,
  }
}

/** Derniers parametres demandes au back, pour verifier la navigation. */
let demandes: string[] = []

/** Derniere URL demandee. `Array.at` n'est pas dans la cible TypeScript ici. */
function derniereDemande(): string {
  return demandes[demandes.length - 1] ?? ''
}

function servir(evenements: EvenementAdmin[], pagination: Partial<Pagination> = {}) {
  vi.stubGlobal(
    'fetch',
    vi.fn((url: string) => {
      demandes.push(String(url))
      return Promise.resolve(
        new Response(
          JSON.stringify({
            data: evenements,
            pagination: {
              page: 1,
              limit: 20,
              total: evenements.length,
              totalPages: 1,
              ...pagination,
            },
          }),
          { status: 200, headers: { 'Content-Type': 'application/json' } },
        ),
      )
    }),
  )
}

const Vide = defineComponent({ render: () => h('div') })

async function rendre() {
  // Le nom de chaque evenement mene a sa fiche : la liste a besoin d'un
  // routeur qui connaisse cette route, sinon `RouterLink` echoue a la
  // resoudre.
  const routeur = createRouter({
    history: createMemoryHistory(),
    routes: [
      { path: '/dashboard/evenements', name: 'evenements-admin', component: Vide },
      { path: '/dashboard/evenements/:slug', name: 'evenement-admin', component: Vide },
    ],
  })
  routeur.push('/dashboard/evenements')
  await routeur.isReady()
  const wrapper = mount(ListeEvenements, { global: { plugins: [routeur] } })
  await flushPromises()
  return wrapper
}

describe('liste d administration des evenements', () => {
  beforeEach(() => {
    demandes = []
  })

  afterEach(() => {
    vi.unstubAllGlobals()
  })

  it('affiche un evenement servi', async () => {
    servir([evenement()])
    const wrapper = await rendre()

    expect(wrapper.text()).toContain('Fête nationale du Gabon')
    expect(wrapper.text()).toContain('17 août 2026')
  })

  it('n expose aucune donnee personnelle d inscrit', async () => {
    // Le back sert `participants[]` avec nom, courriel et identifiant DANS la
    // reponse de liste. Un tableau d'administration n'est pas l'endroit ou les
    // deverser : seul leur nombre doit apparaitre.
    servir([evenement()])
    const wrapper = await rendre()

    expect(wrapper.text()).not.toContain('Awa Ndong')
    expect(wrapper.text()).not.toContain('awa.ndong@exemple.test')
    expect(wrapper.text()).not.toContain('GA100001')
    expect(wrapper.text()).toContain('120')
  })

  it('masque la colonne de publication quand le back ne la sert pas', async () => {
    // Un back anterieur a la jointure sur `secure_event_publications` n'envoie
    // pas `isPublished`. Afficher « Non publié » serait faux et inquietant.
    const sansPublication = evenement()
    delete sansPublication.isPublished
    servir([sansPublication])
    const wrapper = await rendre()

    expect(wrapper.text()).not.toContain('Non publié')
    expect(wrapper.text()).not.toContain('Publié')
  })

  it('affiche la publication des que le back la sert', async () => {
    servir([evenement({ isPublished: false })])
    const wrapper = await rendre()

    expect(wrapper.text()).toContain('Non publié')
  })

  it('rend le type sans jamais attendre de slug', async () => {
    // `typeEventSlug` n'existe pas dans la reponse ; `typeLabel` peut etre nul.
    servir([evenement({ typeLabel: null })])
    const wrapper = await rendre()

    expect(wrapper.text()).toContain('Fête nationale du Gabon')
  })

  it('annonce le total exact plutot qu une navigation a l aveugle', async () => {
    servir([evenement()], { page: 3, limit: 30, total: 204, totalPages: 7 })
    const wrapper = await rendre()

    expect(wrapper.text()).toContain('61–90')
    expect(wrapper.text()).toContain('204')
  })

  it('demande la page suivante au back, sans filtrer localement', async () => {
    servir([evenement()], { page: 1, limit: 20, total: 204, totalPages: 11 })
    const wrapper = await rendre()

    const suivant = wrapper.findAll('button').find((b) => b.text() === 'Suivant')
    await suivant?.trigger('click')
    await flushPromises()

    expect(derniereDemande()).toContain('page=2')
  })

  it('revient a la premiere page en changeant le nombre de lignes', async () => {
    // Rester en page 11 avec cent lignes par page demanderait une page qui
    // n'existe plus.
    servir([evenement()], { page: 11, limit: 20, total: 204, totalPages: 11 })
    const wrapper = await rendre()

    await wrapper.find('select').setValue('100')
    await flushPromises()

    expect(derniereDemande()).toContain('page=1')
    expect(derniereDemande()).toContain('limit=100')
  })

  it('propose de reessayer quand le back est en panne', async () => {
    vi.stubGlobal(
      'fetch',
      vi.fn(() => Promise.reject(new Error('reseau'))),
    )
    const wrapper = await rendre()

    expect(wrapper.text()).toContain('Réessayer')
  })

  it('le dit quand aucun evenement n existe', async () => {
    servir([])
    const wrapper = await rendre()

    expect(wrapper.text()).toContain('Aucun évènement')
  })
})
