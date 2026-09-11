import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest'
import { mount, flushPromises } from '@vue/test-utils'
import { createRouter, createMemoryHistory } from 'vue-router'
import { createPinia, setActivePinia } from 'pinia'
import { defineComponent, h } from 'vue'
import Home from '../Home.vue'
import { useTenantStore } from '@/stores/tenant'
import { GABON } from '@/api/fixtures/tenants'
import contenuGabon from '@/api/fixtures/contenu-gabon.json'

const Vide = defineComponent({ render: () => h('div') })

function reponse(corps: unknown) {
  return new Response(JSON.stringify(corps), {
    status: 200,
    headers: { 'Content-Type': 'application/json' },
  })
}

async function monter() {
  useTenantStore().embassy = GABON
  const routeur = createRouter({
    history: createMemoryHistory(),
    routes: [
      { path: '/', component: Home },
      { path: '/actualite', component: Vide },
      { path: '/demarche-ligne', component: Vide },
      { path: '/actualites/:slug', component: Vide },
    ],
  })
  routeur.push('/')
  await routeur.isReady()
  const wrapper = mount(Home, { global: { plugins: [routeur] } })
  await flushPromises()
  return wrapper
}

function servir(contenu: unknown) {
  vi.stubGlobal(
    'fetch',
    vi.fn((url: string) =>
      Promise.resolve(
        String(url).includes('/api/content/home') ? reponse(contenu) : reponse({ data: [] }),
      ),
    ),
  )
}

describe("contenu d'accueil servi par le CMS", () => {
  beforeEach(() => {
    setActivePinia(createPinia())
  })

  afterEach(() => {
    vi.unstubAllGlobals()
  })

  it("n'affiche pas la section quand l'ambassade n'a rien saisi", async () => {
    // Une section vide qui s'affiche quand meme laisse un titre suspendu au
    // milieu de la page, sous lequel il n'y a rien.
    servir({ data: { welcome: null, leaders: [], showcase: [] } })

    const wrapper = await monter()

    // Le texte ne suffit pas a le prouver : une section vide n'affiche rien
    // mais occupe quand meme une bande de cinq rem au milieu de la page.
    expect(wrapper.find('[data-bloc="bienvenue"]').exists()).toBe(false)
    expect(wrapper.text()).not.toContain('Mot de bienvenue')
  })

  it('affiche le mot de bienvenue et les dirigeants servis', async () => {
    servir(contenuGabon)

    const wrapper = await monter()

    expect(wrapper.text()).toContain('Mot de bienvenue')
    expect(wrapper.text()).toContain('Brice Clotaire Oligui Nguema')
    expect(wrapper.text()).toContain("Président de la République, Chef de l'État")
  })

  it('affiche les photos de vitrine avec leur texte alternatif', async () => {
    servir(contenuGabon)

    const wrapper = await monter()
    const images = wrapper.findAll('img').map((i) => ({
      src: i.attributes('src') ?? '',
      alt: i.attributes('alt') ?? '',
    }))

    const drapeau = images.find((i) => i.src.includes('vitrine-drapeau'))
    expect(drapeau?.alt).toBe('Drapeau de la République Gabonaise')

    // Une image sans texte alternatif recoit une chaine vide, ce qui la
    // declare decorative, et non l'attribut manquant.
    const cascade = images.find((i) => i.src.includes('vitrine-cascade'))
    expect(cascade?.alt).toBe('')
  })

  it("n'affiche rien du tout quand le service est injoignable", async () => {
    // Le repli ne doit jamais etre le contenu du gabarit : sur un echec, la
    // section disparait, elle ne se rabat pas sur une autre ambassade.
    vi.stubGlobal('fetch', vi.fn().mockRejectedValue(new Error('reseau')))

    const wrapper = await monter()

    expect(wrapper.find('[data-bloc="bienvenue"]').exists()).toBe(false)
    // Le reste de la page se rend normalement : une panne du contenu
    // n'emporte pas l'accueil entier.
    expect(wrapper.text()).toContain('Consulter les actualités')
  })

  it("affiche le corps du mot de bienvenue tel que le serveur l'a assaini", async () => {
    servir({
      data: {
        welcome: { title: 'Mot de bienvenue', body_html: '<p>Chers compatriotes</p>' },
        leaders: [],
        showcase: [],
      },
    })

    const wrapper = await monter()

    expect(wrapper.html()).toContain('<p>Chers compatriotes</p>')
  })
})
