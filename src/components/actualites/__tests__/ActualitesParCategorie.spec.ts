import { describe, it, expect, beforeEach, vi, afterEach } from 'vitest'
import { mount, flushPromises } from '@vue/test-utils'
import { createRouter, createMemoryHistory } from 'vue-router'
import { defineComponent, h } from 'vue'
import ActualitesParCategorie from '../ActualitesParCategorie.vue'
import articlesFixture from '@/api/fixtures/articles.json'

const Vide = defineComponent({ render: () => h('div') })

function reponse(corps: unknown, statut = 200) {
  return new Response(JSON.stringify(corps), {
    status: statut,
    headers: { 'Content-Type': 'application/json' },
  })
}

const PUBLIES_AMBASSADE = articlesFixture.data.filter(
  (article) => article.statut === 'publie' && article.categorie.slug === 'actualites-ambassade',
)

async function monter(categorie = 'actualites-ambassade') {
  const routeur = createRouter({
    history: createMemoryHistory(),
    routes: [
      { path: '/', component: Vide },
      { path: '/actualites/:slug', component: Vide },
    ],
  })
  routeur.push('/')
  await routeur.isReady()
  const wrapper = mount(ActualitesParCategorie, {
    props: { categorie, sousTitre: "Actualités de l'Ambassade" },
    global: { plugins: [routeur] },
  })
  await flushPromises()
  return wrapper
}

describe('page de rubrique des actualites', () => {
  beforeEach(() => {
    vi.stubGlobal('fetch', vi.fn())
  })

  afterEach(() => {
    vi.unstubAllGlobals()
  })

  it('demande au serveur les articles publies de sa seule categorie', async () => {
    vi.mocked(fetch).mockResolvedValue(reponse({ data: PUBLIES_AMBASSADE }))

    await monter('actualites-ambassade')

    expect(vi.mocked(fetch).mock.calls[0]![0]).toBe(
      '/api/articles?statut=publie&categorie=actualites-ambassade',
    )
  })

  it('renvoie vers la page de detail de chaque article', async () => {
    vi.mocked(fetch).mockResolvedValue(reponse({ data: PUBLIES_AMBASSADE }))

    const wrapper = await monter()

    // Sans cette garde, une fixture sans article publie dans cette categorie
    // rendrait la boucle ci-dessous vide, donc verte pour rien.
    expect(PUBLIES_AMBASSADE.length).toBeGreaterThan(0)

    // C'est le point de la migration : ces cartes n'etaient cliquables vers
    // rien avant, le detail n'etant atteignable qu'en tapant l'URL.
    const liens = wrapper.findAll('a').map((lien) => lien.attributes('href'))
    for (const article of PUBLIES_AMBASSADE) {
      expect(liens).toContain(`/actualites/${article.slug}`)
    }
  })

  it('affiche le sous-titre de la rubrique', async () => {
    vi.mocked(fetch).mockResolvedValue(reponse({ data: PUBLIES_AMBASSADE }))

    const wrapper = await monter()

    expect(wrapper.text()).toContain("Actualités de l'Ambassade")
  })

  it('recharge quand la categorie change, sans remontage', async () => {
    vi.mocked(fetch).mockResolvedValue(reponse({ data: [] }))

    const wrapper = await monter('actualites-ambassade')
    await wrapper.setProps({ categorie: 'actualites-diplomatique' })
    await flushPromises()

    const appels = vi.mocked(fetch).mock.calls
    expect(appels).toHaveLength(2)
    expect(appels[1]![0]).toBe('/api/articles?statut=publie&categorie=actualites-diplomatique')
  })

  it('propose de reessayer quand le chargement echoue', async () => {
    vi.mocked(fetch).mockResolvedValue(reponse({ message: 'Erreur' }, 500))

    const wrapper = await monter()

    // Un echec silencieux laisserait une page vide impossible a distinguer
    // d'une rubrique sans article.
    expect(wrapper.text()).toContain('Réessayer')
    expect(wrapper.text()).not.toContain('Cette rubrique sera alimentée prochainement')
  })

  it('distingue une rubrique vide d un echec', async () => {
    vi.mocked(fetch).mockResolvedValue(reponse({ data: [] }))

    const wrapper = await monter()

    expect(wrapper.text()).toContain('Cette rubrique sera alimentée prochainement')
    expect(wrapper.text()).not.toContain('Réessayer')
  })
})
