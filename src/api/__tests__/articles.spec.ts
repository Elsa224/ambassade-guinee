import { describe, it, expect, beforeEach, vi, afterEach } from 'vitest'
import {
  listerArticles,
  listerArticlesAdmin,
  listerCategories,
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
  categorie_id: 1,
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

  it("ecrit sur la surface d'administration, jamais sur celle du visiteur", async () => {
    // `/api/articles` ne repond qu'en lecture : un POST y rend 405 avec
    // `Allow: GET, HEAD`. Les trois ecritures passent par `/api/admin/articles`.
    vi.mocked(fetch).mockResolvedValue(reponse({ data: [articlesFixture.data[0]!] }))

    await listerArticlesAdmin({ statut: 'brouillon' })

    expect(vi.mocked(fetch).mock.calls[0]![0]).toBe('/api/admin/articles?statut=brouillon')
  })

  it('expose `image_url` sous le nom `image` attendu par les ecrans', async () => {
    // Le serveur nomme le champ `image_url` en lecture et accepte `image` en
    // ecriture. Le gabarit lisait `image` : la vignette d'un article
    // enregistre restait vide, l'attribut `src` valant `undefined`.
    vi.mocked(fetch).mockResolvedValue(
      reponse({
        data: [
          {
            ...articlesFixture.data[0]!,
            image_url: 'https://exemple.test/api/medias/medias/gabon/a.webp',
          },
        ],
      }),
    )

    const articles = await listerArticles()

    expect(articles[0]!.image).toBe('https://exemple.test/api/medias/medias/gabon/a.webp')
  })

  it("laisse l'image intacte quand aucune neuve n'a ete choisie", async () => {
    // La lecture ne rend que l'adresse d'affichage, jamais la cle stockee :
    // on ne peut donc pas la renvoyer. Le champ absent du corps dit au
    // serveur de ne pas y toucher.
    vi.mocked(fetch).mockResolvedValue(reponse({ data: articlesFixture.data[0]! }))

    await modifierArticle(1, BROUILLON)

    const corps = JSON.parse((vi.mocked(fetch).mock.calls[0]![1] as RequestInit).body as string)
    expect('image' in corps).toBe(false)
  })

  it("envoie l'identifiant de categorie, et non un slug", async () => {
    // Les regles du serveur ne portent pas `categorie_slug` : le champ
    // n'etait pas refuse, il n'etait jamais regarde. L'article partait en 201
    // et ressortait sans categorie, sans un mot pour le redacteur.
    vi.mocked(fetch).mockResolvedValue(reponse({ data: articlesFixture.data[0]! }, 201))

    await creerArticle({ ...BROUILLON, categorie_id: 3 })

    const corps = JSON.parse((vi.mocked(fetch).mock.calls[0]![1] as RequestInit).body as string)
    expect(corps.categorie_id).toBe(3)
    expect('categorie_slug' in corps).toBe(false)
  })

  it('lit la taxonomie sur sa propre route', async () => {
    // `/api/admin/articles/categories` rend 404 : le liant de route y cherche
    // un article nomme « categories ».
    vi.mocked(fetch).mockResolvedValue(
      reponse({ data: [{ id: 3, nom: 'Actualités', slug: 'actualites', couleur: '#0A7B3E' }] }),
    )

    const categories = await listerCategories()

    expect(vi.mocked(fetch).mock.calls[0]![0]).toBe('/api/admin/categories')
    expect(categories[0]!.nom).toBe('Actualités')
  })

  it('cree un article par POST', async () => {
    vi.mocked(fetch).mockResolvedValue(
      reponse({ data: { ...articlesFixture.data[0]!, id: 42 } }, 201),
    )

    const article = await creerArticle(BROUILLON)

    const [url, options] = vi.mocked(fetch).mock.calls[0]!
    expect(url).toBe('/api/admin/articles')
    expect((options as RequestInit).method).toBe('POST')
    expect(JSON.parse((options as RequestInit).body as string).titre).toBe('Nouvel article')
    expect(article.id).toBe(42)
  })

  it('modifie un article par PUT', async () => {
    vi.mocked(fetch).mockResolvedValue(reponse({ data: articlesFixture.data[0]! }))

    await modifierArticle(1, BROUILLON)

    const [url, options] = vi.mocked(fetch).mock.calls[0]!
    expect(url).toBe('/api/admin/articles/1')
    expect((options as RequestInit).method).toBe('PUT')
  })

  it('supprime un article par DELETE', async () => {
    vi.mocked(fetch).mockResolvedValue(new Response(null, { status: 204 }))

    await supprimerArticle(7)

    const [url, options] = vi.mocked(fetch).mock.calls[0]!
    expect(url).toBe('/api/admin/articles/7')
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
