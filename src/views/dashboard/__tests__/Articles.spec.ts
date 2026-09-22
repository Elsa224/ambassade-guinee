import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest'
import { mount, flushPromises } from '@vue/test-utils'
import Articles from '../Articles.vue'
import articlesFixture from '@/api/fixtures/articles.json'

/**
 * L'ecran de gestion des articles.
 *
 * Il a longtemps eu un jumeau, « Actualites », qui ecrivait dans les memes
 * routes sur la meme table. Les tests ci-dessous portent sur ce qui a ete
 * corrige en le fondant ici : des compteurs qui parlent du fonds et non du
 * filtre, un voile de modale qui laisse voir la page, et un statut manipule
 * sous la valeur de l'API plutot que sous son libelle accentue.
 */
function reponse(corps: unknown, statut = 200) {
  return new Response(corps === null ? null : JSON.stringify(corps), {
    status: statut,
    headers: { 'Content-Type': 'application/json' },
  })
}

async function monter() {
  const ecran = mount(Articles, { global: { stubs: { Teleport: true } } })
  await flushPromises()
  return ecran
}

/** La taxonomie de l'ambassade, servie par sa propre route. */
const CATEGORIES = {
  data: [
    { id: 1, nom: "Actualités de l'ambassade", slug: 'actualites-ambassade', couleur: '#006633' },
    { id: 2, nom: 'Actualités diplomatiques', slug: 'actualites-diplomatique', couleur: '#0A7B3E' },
  ],
}

/**
 * L'ecran charge deux routes : les articles et la taxonomie. Un bouchon qui
 * rendrait la meme reponse aux deux ferait passer une liste d'articles pour
 * une liste de categories.
 */
function servir(articles: unknown = articlesFixture, categories: unknown = CATEGORIES) {
  return vi.fn((url: string) =>
    Promise.resolve(reponse(String(url).includes('/api/admin/categories') ? categories : articles)),
  )
}

describe('ecran de gestion des articles', () => {
  beforeEach(() => {
    vi.stubGlobal('fetch', servir())
  })

  afterEach(() => {
    vi.unstubAllGlobals()
  })

  it("charge la liste depuis la surface d'administration", async () => {
    // Et non depuis `/api/articles`, qui est la surface VISITEUR : elle ne
    // sert que le publie, si bien qu'un brouillon enregistre disparaitrait
    // de la liste ou il vient d'etre cree.
    await monter()

    expect(vi.mocked(fetch).mock.calls.map((appel) => appel[0])).toContain('/api/admin/articles')
  })

  it('compte tout le fonds, pas la page affichee', async () => {
    // La page en montre dix ; le compteur doit en annoncer onze. L'ancien
    // ecran affichait « Total articles » a partir de la liste FILTREE : taper
    // dans la recherche faisait fondre un total cense dire combien
    // d'articles l'ambassade possede.
    const ecran = await monter()
    const total = articlesFixture.data.length
    const publies = articlesFixture.data.filter((a) => a.statut === 'publie').length

    const compteurs = ecran.findAll('.grid p.text-2xl').map((n) => n.text())
    expect(ecran.findAll('tbody tr')).toHaveLength(10)
    expect(compteurs[0]).toBe(String(total))
    expect(compteurs[1]).toBe(String(publies))
  })

  it('ne compte pas les articles filtres dans le total', async () => {
    const ecran = await monter()
    await ecran.find('input[type="search"]').setValue('cette-recherche-ne-trouve-rien')
    await flushPromises()

    expect(ecran.findAll('.grid p.text-2xl')[0]!.text()).toBe(String(articlesFixture.data.length))
    expect(ecran.text()).toContain('Aucun article ne correspond')
  })

  it('revient en page 1 quand un filtre reduit la liste, accents ou non', async () => {
    // Deux defauts en un. On est en page 2 et on tape une recherche : sans
    // rabattement, le tableau parait vide alors qu'il y a des resultats. Et
    // le terme est saisi SANS accent, comme il le sera toujours : une
    // comparaison accentuee ne trouvait rien.
    const ecran = await monter()
    const vm = ecran.vm as unknown as { pageCourante: number }
    vm.pageCourante = 2
    await flushPromises()

    await ecran.find('input[type="search"]').setValue('ceremonie')
    await flushPromises()

    expect(ecran.findAll('tbody tr').length).toBeGreaterThan(0)
    expect(ecran.text()).not.toContain('Aucun article ne correspond')
  })

  it('voile la page sans la masquer quand une modale est ouverte', async () => {
    // `bg-opacity-50` a ete supprime en Tailwind v4 : il ne produisait plus
    // aucune regle, et le voile etait noir OPAQUE en production.
    const ecran = await monter()
    await ecran
      .findAll('button')
      .find((b) => b.text().includes('Nouvel article'))!
      .trigger('click')

    const voile = ecran.find('.fixed.inset-0')
    expect(voile.classes()).toContain('bg-black/50')
    expect(voile.classes().join(' ')).not.toContain('bg-opacity')
  })

  it('envoie le statut sous la valeur de l API, pas sous son libelle', async () => {
    const ecran = await monter()
    await ecran
      .findAll('button')
      .find((b) => b.text().includes('Nouvel article'))!
      .trigger('click')

    const vm = ecran.vm as unknown as {
      saisie: { titre: string; contenu: string; statut: string }
      enregistrer: () => Promise<void>
    }
    vm.saisie.titre = 'Un titre'
    vm.saisie.contenu = 'Un contenu'
    vm.saisie.statut = 'publie'
    await vm.enregistrer()

    const appels = vi.mocked(fetch).mock.calls
    const envoi = appels.find((appel) => (appel[1] as RequestInit | undefined)?.method === 'POST')!
    const corps = JSON.parse((envoi[1] as RequestInit).body as string)
    expect(corps.statut).toBe('publie')
    // Et la categorie part sous son IDENTIFIANT, celui de la premiere entree
    // de la taxonomie servie : le serveur ne regarde pas les slugs.
    expect(corps.categorie_id).toBe(1)
  })
})
