import { describe, it, expect, beforeEach, vi, afterEach } from 'vitest'
import { mount, flushPromises } from '@vue/test-utils'
import { createRouter, createMemoryHistory } from 'vue-router'
import { defineComponent, h } from 'vue'
import ActualiteDetail from '../ActualiteDetail.vue'
import articlesFixture from '@/api/fixtures/articles.json'

// Selection par slug, jamais par index : la fixture est triee par date, son
// ordre change des qu'un article est ajoute.
const ARTICLE_TEMOIN = articlesFixture.data.find(
  (article) => article.slug === 'rencontre-bilaterale-a-washington',
)!

const Vide = defineComponent({ render: () => h('div') })

function reponse(corps: unknown, statut = 200) {
  return new Response(JSON.stringify(corps), {
    status: statut,
    headers: { 'Content-Type': 'application/json' },
  })
}

async function monter(slug: string) {
  const routeur = createRouter({
    history: createMemoryHistory(),
    routes: [
      { path: '/', component: Vide },
      { path: '/actualites/:slug', component: ActualiteDetail },
    ],
  })
  routeur.push(`/actualites/${slug}`)
  await routeur.isReady()
  const wrapper = mount(ActualiteDetail, { global: { plugins: [routeur] } })
  await flushPromises()
  return wrapper
}

describe("page de detail d'une actualite", () => {
  beforeEach(() => {
    vi.stubGlobal('fetch', vi.fn())
  })

  afterEach(() => {
    vi.unstubAllGlobals()
  })

  it('recupere l article correspondant au slug de l URL', async () => {
    vi.mocked(fetch).mockResolvedValue(reponse({ data: ARTICLE_TEMOIN }))

    await monter('rencontre-bilaterale-a-washington')

    expect(vi.mocked(fetch).mock.calls[0]![0]).toBe(
      '/api/articles/rencontre-bilaterale-a-washington',
    )
  })

  it('affiche le titre et le contenu de l article', async () => {
    vi.mocked(fetch).mockResolvedValue(reponse({ data: ARTICLE_TEMOIN }))

    const wrapper = await monter('rencontre-bilaterale-a-washington')

    expect(wrapper.text()).toContain(ARTICLE_TEMOIN.titre)
    expect(wrapper.html()).toContain(ARTICLE_TEMOIN.contenu)
  })

  it('affiche un message clair quand l article n existe pas', async () => {
    vi.mocked(fetch).mockResolvedValue(reponse({ message: 'Introuvable.' }, 404))

    const wrapper = await monter('slug-inexistant')

    expect(wrapper.text()).toContain('Cette actualité est introuvable')
  })
})
