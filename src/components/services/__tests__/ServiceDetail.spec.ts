import { describe, it, expect, afterEach, vi } from 'vitest'
import { mount, flushPromises } from '@vue/test-utils'
import { createRouter, createMemoryHistory } from 'vue-router'
import { defineComponent, h } from 'vue'
import ServiceDetail from '../ServiceDetail.vue'

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

async function monter(slug: string) {
  const routeur = createRouter({
    history: createMemoryHistory(),
    routes: [
      { path: '/', component: Vide },
      { path: '/services', component: Vide },
      { path: '/services/:slug', component: ServiceDetail, props: true },
    ],
  })
  routeur.push(`/services/${slug}`)
  await routeur.isReady()
  const wrapper = mount(ServiceDetail, { props: { slug }, global: { plugins: [routeur] } })
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
  fee: 'Selon la categorie',
  body_html: '<h2>Pieces a fournir</h2><ul><li>Passeport valide</li></ul>',
  position: 1,
}

const PASSEPORT = { ...VISA, id: 2, slug: 'passeport', title: 'Passeport', delay: null, fee: null }

describe('la page de detail d un service', () => {
  afterEach(() => {
    vi.unstubAllGlobals()
  })

  it('affiche le service designe par le slug', async () => {
    servir({ data: { platform: null, services: [VISA, PASSEPORT] } })

    const wrapper = await monter('visa')

    expect(wrapper.text()).toContain('Visa')
    expect(wrapper.text()).toContain('Demande de visa pour le Gabon.')
    // Le corps est assaini cote serveur et insere tel quel : le HTML doit
    // rester du HTML, pas du texte echappe.
    expect(wrapper.html()).toContain('<li>Passeport valide</li>')
  })

  it('montre le delai et le tarif quand ils sont servis', async () => {
    servir({ data: { platform: null, services: [VISA] } })

    const wrapper = await monter('visa')

    expect(wrapper.text()).toContain('5 jours ouvrables')
    expect(wrapper.text()).toContain('Selon la categorie')
  })

  it('n affiche pas de cases vides quand ni delai ni tarif ne sont servis', async () => {
    servir({ data: { platform: null, services: [PASSEPORT] } })

    const wrapper = await monter('passeport')

    expect(wrapper.text()).not.toContain('Délai')
    expect(wrapper.text()).not.toContain('Tarif')
  })

  it('annonce un service introuvable pour un slug inconnu', async () => {
    // Un lien perime ne doit surtout pas afficher le premier service venu.
    servir({ data: { platform: null, services: [VISA] } })

    const wrapper = await monter('carte-consulaire')

    expect(wrapper.text()).toContain('Service introuvable')
    expect(wrapper.text()).not.toContain('Demande de visa pour le Gabon.')
  })

  it('se retracte aussi quand le service est injoignable', async () => {
    servir({ message: 'Erreur serveur' }, 500)

    const wrapper = await monter('visa')

    expect(wrapper.text()).toContain('Service introuvable')
  })

  it('propose les autres services, sans se proposer lui-meme', async () => {
    servir({ data: { platform: null, services: [VISA, PASSEPORT] } })

    const wrapper = await monter('visa')

    expect(wrapper.find('a[href="/services/passeport"]').exists()).toBe(true)
    expect(wrapper.find('a[href="/services/visa"]').exists()).toBe(false)
  })
})
