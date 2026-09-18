import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest'
import { mount, flushPromises } from '@vue/test-utils'
import { createPinia, setActivePinia } from 'pinia'
import RendezVousAdmin from '../RendezVousAdmin.vue'

function reponse(corps: unknown, statut = 200) {
  return new Response(JSON.stringify(corps), {
    status: statut,
    headers: { 'Content-Type': 'application/json' },
  })
}

const DEMANDE = {
  id: 7,
  reference: 'RDV-2026-000007',
  status: 'nouveau',
  staff_note: null,
  service: 'passeport',
  first_name: 'Aya',
  last_name: 'Camara',
  email: 'aya@example.org',
  phone: '+224 000 00 00 00',
  preferred_date: '2026-09-24',
  preferred_time: '09:30',
  documents: 'Acte de naissance',
  message: '',
  created_at: '2026-09-18T10:00:00Z',
  updated_at: '2026-09-18T10:00:00Z',
}

/** Sert la liste, et journalise les ecritures. */
function servir(demandes: unknown[], ecriture?: () => Response) {
  const appels: { adresse: string; methode: string; corps: unknown }[] = []
  vi.stubGlobal(
    'fetch',
    vi.fn((url: string, options?: RequestInit) => {
      const methode = options?.method ?? 'GET'
      if (methode !== 'GET') {
        appels.push({
          adresse: String(url),
          methode,
          corps: options?.body === undefined ? null : JSON.parse(String(options.body)),
        })
        return Promise.resolve(ecriture ? ecriture() : reponse({ data: DEMANDE }))
      }
      return Promise.resolve(reponse({ data: demandes, meta: { current_page: 1, last_page: 1 } }))
    }),
  )
  return appels
}

async function monter() {
  const wrapper = mount(RendezVousAdmin)
  await flushPromises()
  return wrapper
}

describe('ecran des demandes de rendez-vous', () => {
  beforeEach(() => {
    setActivePinia(createPinia())
  })

  afterEach(() => {
    vi.unstubAllGlobals()
  })

  it('affiche les demandes servies, avec leur reference et leur statut', async () => {
    servir([DEMANDE])

    const wrapper = await monter()

    const texte = wrapper.text()
    expect(texte).toContain('Aya Camara')
    expect(texte).toContain('RDV-2026-000007')
    expect(texte).toContain('Nouvelle demande')
    expect(texte).toContain('aya@example.org')
  })

  it('dit que le site ne confirme rien de lui-meme', async () => {
    // Le module n'est pas un moteur de reservation : l'ecran doit le rappeler
    // a l'agent, qui est le seul a confirmer.
    servir([])

    const wrapper = await monter()

    expect(wrapper.text()).toContain('Le site ne confirme aucun rendez-vous')
  })

  it('envoie le seul statut, et jamais les coordonnees du demandeur', async () => {
    // Le poste ne recrit pas la demande d'un citoyen, il la traite.
    const appels = servir([DEMANDE], () => reponse({ data: { ...DEMANDE, status: 'confirme' } }))

    const wrapper = await monter()
    const bouton = wrapper.findAll('button').find((b) => b.text() === 'Confirmé')
    await bouton!.trigger('click')
    await flushPromises()

    const ecriture = appels[0]
    expect(ecriture?.methode).toBe('PATCH')
    expect(ecriture?.adresse).toContain('/api/admin/appointments/7')
    expect(ecriture?.corps).toEqual({ status: 'confirme' })
    expect(wrapper.text()).toContain('Confirmé')
  })

  it('garde la demande a l ecran quand le serveur refuse le changement', async () => {
    servir([DEMANDE], () => reponse({ message: 'Statut refusé.' }, 422))

    const wrapper = await monter()
    const bouton = wrapper.findAll('button').find((b) => b.text() === 'Honoré')
    await bouton!.trigger('click')
    await flushPromises()

    expect(wrapper.text()).toContain('Statut refusé.')
    expect(wrapper.text()).toContain('Nouvelle demande')
  })

  it("n'invente rien quand le service est injoignable", async () => {
    vi.stubGlobal('fetch', vi.fn().mockRejectedValue(new Error('reseau')))

    const wrapper = await monter()

    expect(wrapper.text()).toContain('Service indisponible')
    expect(wrapper.text()).not.toContain('Aucune demande')
  })
})
