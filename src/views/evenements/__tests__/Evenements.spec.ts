import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest'
import { mount, flushPromises } from '@vue/test-utils'
import { createRouter, createMemoryHistory } from 'vue-router'
import { createPinia, setActivePinia } from 'pinia'
import { defineComponent, h } from 'vue'
import Evenements from '../Evenements.vue'
import evenementsFixture from '@/api/fixtures/evenements.json'

const OUVERT = evenementsFixture.data.find((e) => e.publicToken === 'AbC123ouvert')!
const CLOS = evenementsFixture.data.find((e) => e.publicToken === 'DeF456complet')!

const Vide = defineComponent({ render: () => h('div') })

function reponse(corps: unknown, statut = 200) {
  return new Response(JSON.stringify(corps), {
    status: statut,
    headers: { 'Content-Type': 'application/json' },
  })
}

async function monter() {
  const routeur = createRouter({
    history: createMemoryHistory(),
    routes: [
      { path: '/', component: Vide },
      { path: '/evenements', component: Evenements },
      { path: '/evenements/inscription/:token', component: Vide },
    ],
  })
  routeur.push('/evenements')
  await routeur.isReady()
  const wrapper = mount(Evenements, { global: { plugins: [routeur] } })
  await flushPromises()
  return wrapper
}

function liens(wrapper: Awaited<ReturnType<typeof monter>>): string[] {
  return wrapper.findAllComponents({ name: 'RouterLink' }).map((l) => String(l.props('to')))
}

describe('liste publique des evenements', () => {
  beforeEach(() => {
    setActivePinia(createPinia())
    vi.stubGlobal('fetch', vi.fn())
  })

  afterEach(() => {
    vi.unstubAllGlobals()
  })

  it('demande au CMS la liste des evenements publies', async () => {
    vi.mocked(fetch).mockResolvedValue(reponse({ data: [] }))

    await monter()

    expect(vi.mocked(fetch).mock.calls[0]![0]).toBe('/api/secure/events')
  })

  it('affiche chaque evenement servi par le back', async () => {
    vi.mocked(fetch).mockResolvedValue(reponse({ data: evenementsFixture.data }))

    const wrapper = await monter()

    const absents = evenementsFixture.data.filter((e) => !wrapper.text().includes(e.name))
    expect(absents).toEqual([])
  })

  it('mene chaque carte vers la page que le QR imprime', async () => {
    // Le QR encode `/evenements/inscription/{token}` : la liste doit conduire
    // exactement au meme endroit, sinon deux pages divergeraient.
    vi.mocked(fetch).mockResolvedValue(reponse({ data: [OUVERT] }))

    const wrapper = await monter()

    expect(liens(wrapper)).toContain('/evenements/inscription/AbC123ouvert')
  })

  it("reprend l'etat d'inscription decide par le back sans le recalculer", async () => {
    // Cet evenement a des places, une echeance lointaine et des inscriptions
    // declarees ouvertes : un front qui recalculerait l'etat le dirait
    // ouvert. Le back le dit clos, et c'est lui qui fait autorite.
    const closParLeBack = {
      ...OUVERT,
      registrationOpen: true,
      spotsRemaining: 12,
      registrationDeadline: '2099-01-01',
      isRegistrationClosed: true,
    }
    vi.mocked(fetch).mockResolvedValue(reponse({ data: [closParLeBack] }))

    const wrapper = await monter()

    expect(wrapper.text()).toContain('Inscriptions closes')
    expect(wrapper.text()).not.toContain('Inscriptions ouvertes')
  })

  it("distingue a l'oeil un evenement ouvert d'un evenement clos", async () => {
    vi.mocked(fetch).mockResolvedValue(reponse({ data: [OUVERT, CLOS] }))

    const wrapper = await monter()

    expect(wrapper.text()).toContain('Inscriptions ouvertes')
    expect(wrapper.text()).toContain('Inscriptions closes')
  })

  it("n'expose jamais d'inscrit ni d'adresse Ambassade Secure", async () => {
    // Le back ne transmet ni la liste des inscrits ni son propre hote ; la
    // page ne doit pas en faire apparaitre par une autre voie.
    vi.mocked(fetch).mockResolvedValue(reponse({ data: evenementsFixture.data }))

    const wrapper = await monter()

    expect(wrapper.html()).not.toMatch(/securecheck/i)
    expect(wrapper.text()).not.toMatch(/inscrits?\s*:/i)
  })

  it("le dit clairement quand l'ambassade n'annonce aucun evenement", async () => {
    vi.mocked(fetch).mockResolvedValue(reponse({ data: [] }))

    const wrapper = await monter()

    expect(wrapper.text()).toContain("Aucun évènement n'est annoncé")
  })

  it('presente une panne de service comme une panne, pas comme une absence', async () => {
    // Annoncer « aucun évènement » sur un 502 ferait croire a l'ambassade que
    // son agenda est vide alors que le service est simplement injoignable.
    vi.mocked(fetch).mockResolvedValue(reponse({ message: 'Service indisponible.' }, 502))

    const wrapper = await monter()

    expect(wrapper.text()).not.toContain("Aucun évènement n'est annoncé")
    expect(wrapper.find('[role="alert"]').exists()).toBe(true)
  })
})
