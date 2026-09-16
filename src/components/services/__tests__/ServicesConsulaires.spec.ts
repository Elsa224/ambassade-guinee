import { describe, it, expect, afterEach, vi } from 'vitest'
import { mount, flushPromises } from '@vue/test-utils'
import { createRouter, createMemoryHistory } from 'vue-router'
import { defineComponent, h } from 'vue'
import ServicesConsulaires from '../ServicesConsulaires.vue'

const Vide = defineComponent({ render: () => h('div') })

function servir(contenu: unknown, statut = 200) {
  vi.stubGlobal(
    'fetch',
    vi.fn(() =>
      Promise.resolve(
        new Response(JSON.stringify(contenu), {
          status: statut,
          headers: { 'Content-Type': 'application/json' },
        }),
      ),
    ),
  )
}

async function monter() {
  const routeur = createRouter({
    history: createMemoryHistory(),
    routes: [
      { path: '/', component: Vide },
      { path: '/services', component: ServicesConsulaires },
      { path: '/services/:slug', component: Vide },
    ],
  })
  routeur.push('/services')
  await routeur.isReady()
  const wrapper = mount(ServicesConsulaires, { global: { plugins: [routeur] } })
  await flushPromises()
  return wrapper
}

const VISA = {
  id: 1,
  slug: 'visa',
  title: 'Visa',
  summary: 'Demande de visa pour le Gabon.',
  icon: 'visa',
  delay: '5 jours ouvrables',
  fee: null,
  body_html: '<p>Pieces a fournir</p>',
  position: 1,
}

describe('la grille des services', () => {
  afterEach(() => {
    vi.unstubAllGlobals()
  })

  it('affiche les cartes servies par le CMS', async () => {
    servir({ data: { platform: null, services: [VISA] } })

    const wrapper = await monter()

    expect(wrapper.text()).toContain('Visa')
    expect(wrapper.text()).toContain('Demande de visa pour le Gabon.')
    expect(wrapper.find('a[href="/services/visa"]').exists()).toBe(true)
  })

  it('se retracte quand le CMS ne sert aucun service', async () => {
    // La regle du gabarit : une rubrique sans contenu disparait, elle ne se
    // rabat jamais sur le contenu d'une autre ambassade.
    servir({ data: { platform: null, services: [] } })

    const wrapper = await monter()

    expect(wrapper.text()).toContain('Rubrique en préparation')
    expect(wrapper.text()).not.toContain('Visa')
  })

  it('se retracte aussi quand le service est injoignable', async () => {
    servir({ message: 'Erreur serveur' }, 500)

    const wrapper = await monter()

    expect(wrapper.text()).toContain('Rubrique en préparation')
  })

  it("n'annonce pas de plateforme quand l'ambassade n'en a pas", async () => {
    servir({ data: { platform: null, services: [VISA] } })

    const wrapper = await monter()

    expect(wrapper.text()).not.toContain('Démarches en ligne')
  })

  it('annonce la plateforme servie, avec son lien externe', async () => {
    servir({
      data: {
        platform: {
          name: 'Express54',
          url: 'https://www.express54.org',
          phone: null,
          description: null,
        },
        services: [VISA],
      },
    })

    const wrapper = await monter()

    expect(wrapper.text()).toContain('Express54')
    const lien = wrapper.find('a[href="https://www.express54.org"]')
    expect(lien.exists()).toBe(true)
    // Un lien qui ouvre un autre site ne doit pas lui donner la main sur
    // l'onglet d'origine.
    expect(lien.attributes('rel')).toContain('noopener')
  })
})
