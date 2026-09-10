import { describe, it, expect, beforeEach, vi, afterEach } from 'vitest'
import { mount, flushPromises } from '@vue/test-utils'
import { createRouter, createMemoryHistory } from 'vue-router'
import { defineComponent, h } from 'vue'
import Actualite from '../Actualite.vue'
import articlesFixture from '@/api/fixtures/articles.json'

const Vide = defineComponent({ render: () => h('div') })

function reponse(corps: unknown, statut = 200) {
  return new Response(JSON.stringify(corps), {
    status: statut,
    headers: { 'Content-Type': 'application/json' },
  })
}

const PUBLIES = articlesFixture.data.filter((article) => article.statut === 'publie')

async function monter() {
  const routeur = createRouter({
    history: createMemoryHistory(),
    routes: [
      { path: '/', component: Vide },
      { path: '/actualites/:slug', component: Vide },
    ],
  })
  routeur.push('/')
  await routeur.isReady()
  const wrapper = mount(Actualite, { global: { plugins: [routeur] } })
  await flushPromises()
  return wrapper
}

describe('liste publique des actualites', () => {
  beforeEach(() => {
    vi.stubGlobal('fetch', vi.fn())
  })

  afterEach(() => {
    vi.unstubAllGlobals()
  })

  it('ne demande que les articles publies', async () => {
    vi.mocked(fetch).mockResolvedValue(reponse({ data: PUBLIES }))

    await monter()

    expect(vi.mocked(fetch).mock.calls[0]![0]).toBe('/api/articles?statut=publie')
  })

  it("n'affiche jamais un brouillon renvoye par erreur", async () => {
    // Le serveur fait autorite sur le filtrage, mais s'il se trompe, le site
    // public ne doit pas publier a sa place.
    vi.mocked(fetch).mockResolvedValue(reponse(articlesFixture))

    const wrapper = await monter()
    const texte = wrapper.text()

    const nonPublies = articlesFixture.data.filter((article) => article.statut !== 'publie')
    expect(nonPublies.length).toBeGreaterThan(0)
    for (const article of nonPublies) {
      expect(texte).not.toContain(article.titre)
    }
  })

  it('renvoie vers la page de detail de chaque article affiche', async () => {
    vi.mocked(fetch).mockResolvedValue(reponse({ data: PUBLIES }))

    const wrapper = await monter()
    const liens = wrapper.findAll('a').map((lien) => lien.attributes('href'))

    // La une plus la premiere page de la grille : tous doivent pointer vers
    // un slug reel, et non vers /actualite comme avant la migration.
    expect(liens).toContain(`/actualites/${PUBLIES[0]!.slug}`)
    expect(liens).toContain(`/actualites/${PUBLIES[1]!.slug}`)
    expect(liens.every((lien) => lien !== '/actualite')).toBe(true)
  })

  it('propose de reessayer quand le chargement echoue', async () => {
    vi.mocked(fetch).mockResolvedValue(reponse({ message: 'Erreur' }, 500))

    const wrapper = await monter()

    expect(wrapper.text()).toContain('Réessayer')
    expect(wrapper.text()).not.toContain('Aucune actualité trouvée')
  })

  it('revient a la premiere page quand la recherche change', async () => {
    vi.mocked(fetch).mockResolvedValue(reponse({ data: PUBLIES }))

    const wrapper = await monter()

    // On se place reellement sur la page 2 avant de filtrer : c'est la
    // situation qui produisait une grille vide, la page 2 n'existant plus
    // dans le resultat filtre.
    const boutonPage2 = wrapper.findAll('button').find((b) => b.text() === '2')
    if (!boutonPage2) throw new Error('la pagination devrait proposer une seconde page')
    await boutonPage2.trigger('click')

    await wrapper.get('input[type="text"]').setValue('visa')
    await flushPromises()

    expect(wrapper.text()).toContain('Mise à jour des procédures de visa')
    expect(wrapper.text()).not.toContain('Aucune actualité trouvée')
  })
})
