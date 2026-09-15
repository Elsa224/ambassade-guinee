import { describe, it, expect, afterEach, vi } from 'vitest'
import { mount, flushPromises } from '@vue/test-utils'
import { createRouter, createMemoryHistory } from 'vue-router'
import { defineComponent, h } from 'vue'
import Ambassadeur from '../Ambassadeur.vue'

const Vide = defineComponent({ render: () => h('div') })

function servir(contenu: unknown) {
  vi.stubGlobal(
    'fetch',
    vi.fn(() =>
      Promise.resolve(
        new Response(JSON.stringify(contenu), {
          status: 200,
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
      { path: '/ambassadeur', component: Ambassadeur },
    ],
  })
  routeur.push('/ambassadeur')
  await routeur.isReady()
  const wrapper = mount(Ambassadeur, { global: { plugins: [routeur] } })
  await flushPromises()
  return wrapper
}

const BIOGRAPHIE = {
  name: 'Persis Lionel Essono Ondo',
  title: 'Ambassadeur Extraordinaire et Plenipotentiaire',
  image_url: '/fixtures/dirigeant-ambassadeur.webp',
  body_html: '<p>Diplomate de carriere au service de la Republique Gabonaise.</p>',
}

describe("page de la biographie de l'ambassadeur", () => {
  afterEach(() => {
    vi.unstubAllGlobals()
  })

  it('affiche le nom, la fonction et le corps servis par le CMS', async () => {
    servir({ data: { ambassador: BIOGRAPHIE } })

    const wrapper = await monter()

    expect(wrapper.text()).toContain('Persis Lionel Essono Ondo')
    expect(wrapper.text()).toContain('Ambassadeur Extraordinaire et Plenipotentiaire')
    // Le corps est assaini cote serveur et insere tel quel : le HTML doit
    // rester du HTML, pas du texte echappe.
    expect(wrapper.html()).toContain(
      '<p>Diplomate de carriere au service de la Republique Gabonaise.</p>',
    )
    expect(wrapper.find('img').attributes('src')).toBe('/fixtures/dirigeant-ambassadeur.webp')
  })

  it('se passe de portrait quand le CMS n en sert pas', async () => {
    // Le portrait arrive apres le texte dans la vraie vie : tant que le
    // cabinet ne l'a pas transmis, la page se rend sans image cassee.
    servir({ data: { ambassador: { ...BIOGRAPHIE, image_url: null } } })

    const wrapper = await monter()

    expect(wrapper.find('img').exists()).toBe(false)
    expect(wrapper.text()).toContain('Persis Lionel Essono Ondo')
  })

  it('se retracte quand aucune biographie n est publiee', async () => {
    // Le repli n'est jamais le contenu du gabarit : la page etait ecrite en
    // dur avec la biographie d'une autre ambassade, elle ne doit pas y
    // revenir quand le CMS ne sert rien.
    servir({ data: { ambassador: null } })

    const wrapper = await monter()

    expect(wrapper.text()).toContain('Rubrique en préparation')
    expect(wrapper.find('h1').text()).not.toContain('Diallo')
  })

  it('se retracte aussi quand le service est injoignable', async () => {
    vi.stubGlobal('fetch', vi.fn().mockRejectedValue(new Error('reseau')))

    const wrapper = await monter()

    expect(wrapper.text()).toContain('Rubrique en préparation')
  })
})
