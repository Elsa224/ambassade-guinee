import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest'
import { mount, flushPromises } from '@vue/test-utils'
import { createRouter, createMemoryHistory } from 'vue-router'
import { createPinia, setActivePinia } from 'pinia'
import { defineComponent, h } from 'vue'
import Home from '../Home.vue'
import { useTenantStore } from '@/stores/tenant'
import { GABON } from '@/api/fixtures/tenants'

const Vide = defineComponent({ render: () => h('div') })

function reponse(corps: unknown) {
  return new Response(JSON.stringify(corps), {
    status: 200,
    headers: { 'Content-Type': 'application/json' },
  })
}

function service(rang: number, slug: string, title: string) {
  return {
    id: rang,
    slug,
    title,
    summary: null,
    icon: null,
    delay: null,
    fee: null,
    body_html: '<p>Corps</p>',
    position: rang,
  }
}

/** Le CMS sert les services ; tout le reste est vide. */
function servirServices(services: unknown[]) {
  vi.stubGlobal(
    'fetch',
    vi.fn((url: string) =>
      Promise.resolve(
        String(url).includes('/api/content/services')
          ? reponse({ data: { platform: null, services } })
          : reponse({ data: [] }),
      ),
    ),
  )
}

async function monter() {
  useTenantStore().embassy = GABON
  const routeur = createRouter({
    history: createMemoryHistory(),
    routes: [
      { path: '/', component: Home },
      { path: '/services', component: Vide },
      { path: '/services/:slug', component: Vide },
      { path: '/ambassadeur', component: Vide },
      { path: '/actualite', component: Vide },
      { path: '/demarche-ligne', component: Vide },
      { path: '/construction', component: Vide },
      { path: '/actualites/:slug', component: Vide },
    ],
  })
  routeur.push('/')
  await routeur.isReady()
  const wrapper = mount(Home, { global: { plugins: [routeur] } })
  await flushPromises()
  return wrapper
}

/** Toutes les adresses de la section qui porte les demarches. */
function liensDeLaSection(wrapper: Awaited<ReturnType<typeof monter>>): string[] {
  const section = wrapper.findAll('section').find((s) => s.text().includes('Démarches consulaires'))
  return section === undefined ? [] : section.findAll('a').map((a) => a.attributes('href') ?? '')
}

/** Les seules adresses de services : la colonne des demarches. */
function liensDesDemarches(wrapper: Awaited<ReturnType<typeof monter>>): string[] {
  return liensDeLaSection(wrapper).filter((href) => href.startsWith('/services'))
}

describe("demarches consulaires de l'accueil", () => {
  beforeEach(() => {
    setActivePinia(createPinia())
  })

  afterEach(() => {
    vi.unstubAllGlobals()
  })

  it('mene au service que chaque entree nomme, et non a la page en construction', async () => {
    servirServices([service(1, 'visa', 'Visa'), service(2, 'passeport', 'Passeport')])

    const wrapper = await monter()

    expect(liensDesDemarches(wrapper)).toEqual(['/services/visa', '/services/passeport'])
    expect(wrapper.text()).toContain('Visa')
    // Les quatre intitules ecrits en dur menaient tous a la page d'attente :
    // plus aucune adresse de cette section n'y renvoie.
    expect(liensDeLaSection(wrapper)).not.toContain('/construction')
  })

  it('fait disparaitre la colonne quand le CMS ne sert aucun service', async () => {
    // Discipline de retractation : un titre « Demarches consulaires » suspendu
    // au-dessus de rien vaut moins que pas de section du tout.
    servirServices([])

    const wrapper = await monter()

    expect(wrapper.text()).not.toContain('Démarches consulaires')
    expect(liensDesDemarches(wrapper)).toEqual([])
  })

  it('met en avant quatre demarches au plus, et renvoie vers la rubrique complete', async () => {
    servirServices([
      service(1, 'visa', 'Visa'),
      service(2, 'passeport', 'Passeport'),
      service(3, 'carte-consulaire', 'Carte consulaire'),
      service(4, 'etat-civil', 'Etat civil'),
      service(5, 'titre-de-voyage', 'Titre de voyage'),
    ])

    const wrapper = await monter()

    const liens = liensDesDemarches(wrapper)
    expect(liens).toHaveLength(5)
    expect(liens.slice(0, 4)).toEqual([
      '/services/visa',
      '/services/passeport',
      '/services/carte-consulaire',
      '/services/etat-civil',
    ])
    // La cinquieme adresse est celle de la rubrique, pas un cinquieme service.
    expect(liens[4]).toBe('/services')
    expect(wrapper.text()).toContain('Voir tous les services')
    expect(wrapper.text()).not.toContain('Titre de voyage')
  })

  it("n'annonce pas la rubrique complete quand tout est deja montre", async () => {
    servirServices([service(1, 'visa', 'Visa')])

    const wrapper = await monter()

    expect(wrapper.text()).not.toContain('Voir tous les services')
  })
})
