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

/** Toutes les adresses de la section « NOS SERVICES ». */
function liensDeLaSection(wrapper: Awaited<ReturnType<typeof monter>>): string[] {
  const section = wrapper.findAll('section').find((s) => s.text().includes('NOS SERVICES'))
  return section === undefined ? [] : section.findAll('a').map((a) => a.attributes('href') ?? '')
}

/** Les seules adresses de services de cette section. */
function liensDesServices(wrapper: Awaited<ReturnType<typeof monter>>): string[] {
  return liensDeLaSection(wrapper).filter((href) => href.startsWith('/services'))
}

/**
 * La section « NOS SERVICES » de l'accueil.
 *
 * Elle portait SIX cartes ecrites en dur, dont la premiere proposait un
 * « visa pour les Etats-Unis » a tous les tenants, et dont les six liens
 * menaient a /construction. Elle lit desormais les services saisis par
 * l'ambassade. La colonne « Demarches consulaires » qui vivait plus bas a
 * disparu du meme coup : elle listait le meme contenu, sur la meme page.
 */
describe("services de l'accueil", () => {
  beforeEach(() => {
    setActivePinia(createPinia())
  })

  afterEach(() => {
    vi.unstubAllGlobals()
  })

  it('mene au service que chaque entree nomme, et non a la page en construction', async () => {
    servirServices([service(1, 'visa', 'Visa'), service(2, 'passeport', 'Passeport')])

    const wrapper = await monter()

    expect(liensDesServices(wrapper)).toEqual(['/services/visa', '/services/passeport'])
    expect(wrapper.text()).toContain('Visa')
    // Les six intitules ecrits en dur menaient tous a la page d'attente :
    // plus aucune adresse de cette section n'y renvoie.
    expect(liensDeLaSection(wrapper)).not.toContain('/construction')
  })

  it('fait disparaitre la section quand le CMS ne sert aucun service', async () => {
    // Discipline de retractation : un titre « NOS SERVICES » suspendu
    // au-dessus de rien vaut moins que pas de section du tout.
    servirServices([])

    const wrapper = await monter()

    expect(wrapper.text()).not.toContain('NOS SERVICES')
    expect(liensDesServices(wrapper)).toEqual([])
  })

  it('ne montre plus de visa pour les Etats-Unis a une ambassade gabonaise', async () => {
    // Le texte en dur de la premiere carte. C'etait la troisieme fuite
    // d'identite du gabarit, masquee par un drapeau de rubrique ; elle ne
    // peut plus revenir, il n'y a plus de texte a masquer.
    servirServices([service(1, 'visa', 'Visa')])

    const wrapper = await monter()

    expect(wrapper.text()).not.toMatch(/États-Unis|Etats-Unis|Delivery Express/)
  })

  it('met en avant six services au plus, et renvoie vers la rubrique complete', async () => {
    servirServices([
      service(1, 'visa', 'Visa'),
      service(2, 'passeport', 'Passeport'),
      service(3, 'carte-consulaire', 'Carte consulaire'),
      service(4, 'etat-civil', 'Etat civil'),
      service(5, 'legalisation', 'Legalisation'),
      service(6, 'procuration', 'Procuration'),
      service(7, 'titre-de-voyage', 'Titre de voyage'),
    ])

    const wrapper = await monter()

    const liens = liensDesServices(wrapper)
    expect(liens).toHaveLength(7)
    expect(liens.slice(0, 6)).toEqual([
      '/services/visa',
      '/services/passeport',
      '/services/carte-consulaire',
      '/services/etat-civil',
      '/services/legalisation',
      '/services/procuration',
    ])
    // La septieme adresse est celle de la rubrique, pas un septieme service.
    expect(liens[6]).toBe('/services')
    expect(wrapper.text()).toContain('Voir tous les services')
    expect(wrapper.text()).not.toContain('Titre de voyage')
  })

  it("n'annonce pas la rubrique complete quand tout est deja montre", async () => {
    servirServices([service(1, 'visa', 'Visa')])

    const wrapper = await monter()

    expect(wrapper.text()).not.toContain('Voir tous les services')
  })
})
