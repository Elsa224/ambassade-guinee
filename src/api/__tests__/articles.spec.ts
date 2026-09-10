import { describe, it, expect, beforeEach, vi, afterEach } from 'vitest'
import {
  listerArticles,
  listerArticlesPublies,
  recupererArticleParSlug,
  creerArticle,
  modifierArticle,
  supprimerArticle,
  libelleStatut,
  statutDepuisLibelle,
  type BrouillonArticle,
} from '../articles'
import articlesFixture from '../fixtures/articles.json'

// Selection par slug, jamais par index : la fixture est triee par date, son
// ordre change des qu'un article est ajoute.
const ARTICLE_TEMOIN = articlesFixture.data.find(
  (article) => article.slug === 'rencontre-bilaterale-a-washington',
)!

function reponse(corps: unknown, statut = 200) {
  return new Response(corps === null ? null : JSON.stringify(corps), {
    status: statut,
    headers: { 'Content-Type': 'application/json' },
  })
}

const BROUILLON: BrouillonArticle = {
  titre: 'Nouvel article',
  resume: 'Un resume.',
  contenu: '<p>Du contenu.</p>',
  categorie_slug: 'actualites-ambassade',
  statut: 'brouillon',
  date_publication: '2026-09-09',
}

describe('service Articles', () => {
  beforeEach(() => {
    vi.stubGlobal('fetch', vi.fn())
  })

  afterEach(() => {
    vi.unstubAllGlobals()
  })

  it('liste les articles depuis GET /api/articles', async () => {
    vi.mocked(fetch).mockResolvedValue(reponse(articlesFixture))

    const articles = await listerArticles()

    expect(vi.mocked(fetch).mock.calls[0]![0]).toBe('/api/articles')
    expect(articles).toHaveLength(articlesFixture.data.length)
    // Sans filtre, la liste du back-office contient aussi les brouillons.
    expect(articles.some((article) => article.statut !== 'publie')).toBe(true)
  })

  it('traduit les filtres en parametres de requete', async () => {
    vi.mocked(fetch).mockResolvedValue(reponse({ data: [] }))

    await listerArticles({ statut: 'publie', categorie: 'actualites-ambassade' })

    expect(vi.mocked(fetch).mock.calls[0]![0]).toBe(
      '/api/articles?statut=publie&categorie=actualites-ambassade',
    )
  })

  it("n'ajoute aucun parametre quand aucun filtre n'est fourni", async () => {
    vi.mocked(fetch).mockResolvedValue(reponse({ data: [] }))

    await listerArticles({})

    expect(vi.mocked(fetch).mock.calls[0]![0]).toBe('/api/articles')
  })

  it('demande statut=publie pour le site public', async () => {
    vi.mocked(fetch).mockResolvedValue(reponse({ data: [] }))

    await listerArticlesPublies('actualites-diplomatique')

    expect(vi.mocked(fetch).mock.calls[0]![0]).toBe(
      '/api/articles?statut=publie&categorie=actualites-diplomatique',
    )
  })

  it('ecarte les articles non publies que le serveur renverrait malgre le filtre', async () => {
    // Le serveur fait autorite, mais s'il se trompe, un brouillon ne doit pas
    // se retrouver affiche sur le site public.
    vi.mocked(fetch).mockResolvedValue(reponse(articlesFixture))

    const articles = await listerArticlesPublies()

    expect(articles.length).toBeGreaterThan(0)
    expect(articles.every((article) => article.statut === 'publie')).toBe(true)
    expect(articles.length).toBeLessThan(articlesFixture.data.length)
  })

  it('recupere un article par son slug', async () => {
    vi.mocked(fetch).mockResolvedValue(reponse({ data: ARTICLE_TEMOIN }))

    const article = await recupererArticleParSlug('rencontre-bilaterale-a-washington')

    expect(vi.mocked(fetch).mock.calls[0]![0]).toBe(
      '/api/articles/rencontre-bilaterale-a-washington',
    )
    expect(article.titre).toBe('Rencontre bilatérale à Washington')
  })

  it('cree un article par POST', async () => {
    vi.mocked(fetch).mockResolvedValue(
      reponse({ data: { ...articlesFixture.data[0]!, id: 42 } }, 201),
    )

    const article = await creerArticle(BROUILLON)

    const [url, options] = vi.mocked(fetch).mock.calls[0]!
    expect(url).toBe('/api/articles')
    expect((options as RequestInit).method).toBe('POST')
    expect(JSON.parse((options as RequestInit).body as string).titre).toBe('Nouvel article')
    expect(article.id).toBe(42)
  })

  it('modifie un article par PUT', async () => {
    vi.mocked(fetch).mockResolvedValue(reponse({ data: articlesFixture.data[0]! }))

    await modifierArticle(1, BROUILLON)

    const [url, options] = vi.mocked(fetch).mock.calls[0]!
    expect(url).toBe('/api/articles/1')
    expect((options as RequestInit).method).toBe('PUT')
  })

  it('supprime un article par DELETE', async () => {
    vi.mocked(fetch).mockResolvedValue(new Response(null, { status: 204 }))

    await supprimerArticle(7)

    const [url, options] = vi.mocked(fetch).mock.calls[0]!
    expect(url).toBe('/api/articles/7')
    expect((options as RequestInit).method).toBe('DELETE')
  })

  it('traduit les statuts entre l API et l interface', () => {
    expect(libelleStatut('publie')).toBe('Publié')
    expect(libelleStatut('a_valider')).toBe('À valider')
    expect(libelleStatut('brouillon')).toBe('Brouillon')
    expect(statutDepuisLibelle('Publié')).toBe('publie')
    expect(statutDepuisLibelle('À valider')).toBe('a_valider')
    expect(statutDepuisLibelle('Brouillon')).toBe('brouillon')
    expect(statutDepuisLibelle('valeur inattendue')).toBe('brouillon')
  })
})
