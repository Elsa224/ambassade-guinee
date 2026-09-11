import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest'
import { mount, flushPromises } from '@vue/test-utils'
import { createRouter, createMemoryHistory } from 'vue-router'
import { createPinia, setActivePinia } from 'pinia'
import { defineComponent, h } from 'vue'
import Layout from '@/layouts/Layout.vue'
import Home from '@/views/Home.vue'
import Actualite from '@/views/Actualite.vue'
import { useTenantStore } from '@/stores/tenant'
import type { Embassy } from '@/api/bootstrap'
import { GUINEE, GABON, GABON_AVANT_COLONNES } from '@/api/fixtures/tenants'
import articlesGabon from '@/api/fixtures/articles-gabon.json'

/**
 * Le meme build sert tous les domaines. Le risque propre a cette architecture
 * n'est pas qu'une page manque, mais qu'elle affiche l'identite d'une autre
 * ambassade : un visiteur du domaine gabonais lisant « Ambassade de la
 * Republique de Guinee » en pied de page.
 *
 * Ce test rend les pages ouvertes au Gabon et refuse toute trace de l'autre
 * ambassade.
 */
/**
 * Marqueurs d'identite de l'ambassade de Guinee, et non le simple nom du pays.
 *
 * La distinction est essentielle ici : l'ambassade du Gabon est situee EN
 * Guinee, donc ses propres articles parlent legitimement de la Guinee, de
 * Conakry et de la communaute guineenne. Interdire le mot ferait echouer le
 * test sur du contenu parfaitement correct. Ce qui ne doit jamais apparaitre,
 * c'est le nom, l'adresse, le courriel ou les responsables de l'autre
 * ambassade.
 *
 * Le pays d'accueil de l'ambassade d'origine compte tout autant : « demande
 * de visa pour les Etats-Unis » est arrive en production sur le domaine
 * gabonais, ou l'ambassade est installee a Conakry. Ce n'est pas le nom de
 * l'autre ambassade, mais c'est bien son identite qui transparait.
 */
const IDENTITE_ETRANGERE =
  /Ambassade de la R[ée]publique de Guin[ée]|ambaguinee|leroy place|doumbouya|kouyat[ée]|n'da[ïi]ry|[ÉE]tats-Unis|\bUSA\b|Washington/i

const Vide = defineComponent({ render: () => h('div') })

/** Ce que le CMS sert pour le contenu d'accueil pendant un test donne. */
let contenuServi: unknown

function reponse(corps: unknown) {
  return new Response(JSON.stringify(corps), {
    status: 200,
    headers: { 'Content-Type': 'application/json' },
  })
}

function routeur(chemin: string) {
  const r = createRouter({
    history: createMemoryHistory(),
    routes: [
      { path: '/', component: Home },
      { path: '/actualite', component: Actualite },
      { path: '/presentation', component: Vide },
      { path: '/ambassadeur', component: Vide },
      { path: '/demarche-ligne', component: Vide },
      { path: '/construction', component: Vide },
      { path: '/actualites/:slug', component: Vide },
    ],
  })
  r.push(chemin)
  return r
}

async function rendre(chemin: string, embassy: Embassy) {
  useTenantStore().embassy = embassy
  const r = routeur(chemin)
  await r.isReady()
  const wrapper = mount(Layout, { global: { plugins: [r] } })
  await flushPromises()
  return wrapper
}

describe("etancheite de l'identite entre ambassades", () => {
  beforeEach(() => {
    setActivePinia(createPinia())
    // Le test sert de vrais articles gabonais : avec une liste vide, il ne
    // prouverait rien du contenu rendu, seulement du gabarit. C'est cet angle
    // mort qui avait d'abord laisse passer une fuite.
    // Les articles et le contenu d'accueil passent par le meme `fetch` : on
    // repond selon le chemin demande, sinon la page d'accueil recevrait la
    // liste d'articles a la place de son contenu.
    vi.stubGlobal(
      'fetch',
      vi.fn((url: string) =>
        Promise.resolve(
          String(url).includes('/api/content/home')
            ? reponse(contenuServi)
            : reponse({ data: articlesGabon.data }),
        ),
      ),
    )
    contenuServi = { data: { welcome: null, leaders: [], showcase: [] } }
  })

  afterEach(() => {
    vi.unstubAllGlobals()
  })

  it("ne laisse aucune trace guineenne sur l'accueil du domaine gabonais", async () => {
    const wrapper = await rendre('/', GABON)
    const traces = wrapper.text().match(IDENTITE_ETRANGERE)

    expect(traces).toBeNull()
  })

  it('ne laisse aucune trace guineenne sur la page des actualites', async () => {
    const wrapper = await rendre('/actualite', GABON)

    expect(wrapper.text().match(IDENTITE_ETRANGERE)).toBeNull()
  })

  it("n'expose pas non plus d'image guineenne", async () => {
    const wrapper = await rendre('/', GABON)
    const sources = wrapper.findAll('img').map((i) => i.attributes('src') ?? '')

    // Les images du depot sont compilees sous un nom derive du fichier
    // d'origine : `logo-guinee`, `president`, `ambassadeur`... Aucune ne doit
    // subsister sur le domaine gabonais.
    expect(sources.filter((s) => /guinee|president|ministre|ambassadeur/i.test(s))).toEqual([])
  })

  it("affiche l'identite gabonaise a la place", async () => {
    const wrapper = await rendre('/', GABON)

    // Le libelle complet vient de `display_name` : le pays d'accueil n'est
    // porte par aucun autre champ.
    expect(wrapper.text()).toContain('Ambassade de la Republique du Gabon en Guinee')
  })

  it("n'affiche aucune coordonnee tant que l'ambassade n'en a pas fourni", async () => {
    const wrapper = await rendre('/', GABON)

    // L'adresse et le telephone sont vides dans la configuration : les lignes
    // doivent disparaitre, pas afficher celles de l'ambassade voisine.
    expect(wrapper.text()).not.toContain('Leroy Place')
    expect(wrapper.text()).toContain('ambassade@gabon-gn.org')
  })

  it("ne propose pas le formulaire de demarches d'une autre ambassade", async () => {
    // Le bouton de l'accueil menait a `/demarche-ligne`, dont le formulaire
    // reclame une « preuve de residence aux USA ». Le lien doit disparaitre
    // avec la rubrique, pas seulement la page.
    const wrapper = await rendre('/', GABON)
    const liens = wrapper
      .findAllComponents({ name: 'RouterLink' })
      .map((l) => String(l.props('to')))

    expect(liens).not.toContain('/demarche-ligne')
  })

  it('rend bien les articles servis, sans quoi le test ne prouverait rien', async () => {
    const wrapper = await rendre('/', GABON)

    expect(wrapper.text()).toContain(articlesGabon.data[0]!.titre)
  })

  it('laisse le site guineen afficher sa propre identite', async () => {
    const wrapper = await rendre('/', GUINEE)

    expect(wrapper.text()).toContain('Ambassade de Guinee aux Etats-Unis')
  })

  it("n'affiche le mot de bienvenue que si le CMS le sert", async () => {
    // Le texte n'est plus compile dans le gabarit : sans contenu servi, la
    // section n'existe pas, quelle que soit l'ambassade.
    const sansContenu = await rendre('/', GUINEE)
    expect(sansContenu.text()).not.toContain('Chers compatriotes')

    contenuServi = {
      data: {
        welcome: { title: 'Mot de bienvenue', body_html: '<p>Chers compatriotes</p>' },
        leaders: [],
        showcase: [],
      },
    }
    const avecContenu = await rendre('/', GUINEE)
    expect(avecContenu.text()).toContain('Chers compatriotes')
  })

  it('ne compile plus aucun dirigeant dans le gabarit', async () => {
    // C'est le garde decisif : meme sur le site d'origine, et meme rubriques
    // ouvertes, aucun nom de dirigeant ne peut apparaitre sans que le CMS
    // l'ait servi. C'est ce qui rend la fuite impossible par construction.
    //
    // Le motif se limite ici aux noms des responsables : « Etats-Unis » est
    // l'identite legitime du site guineen, pas une fuite.
    const NOMS_EN_DUR = /doumbouya|kouyat[ée]|n'da[ïi]ry/i
    const wrapper = await rendre('/', GUINEE)

    expect(wrapper.text().match(NOMS_EN_DUR)).toBeNull()
  })

  it('affiche les dirigeants servis par le CMS, dans leur ordre', async () => {
    contenuServi = {
      data: {
        welcome: null,
        leaders: [
          {
            id: 2,
            name: 'Deuxieme',
            role: 'Ministre',
            subtitle: null,
            image_url: '/b.webp',
            position: 2,
          },
          {
            id: 1,
            name: 'Premier',
            role: 'President',
            subtitle: 'Gabon',
            image_url: '/a.webp',
            position: 1,
          },
        ],
        showcase: [],
      },
    }
    const wrapper = await rendre('/', GABON)
    const noms = wrapper.findAll('h3').map((n) => n.text())

    expect(noms.indexOf('Premier')).toBeLessThan(noms.indexOf('Deuxieme'))
  })

  /**
   * La configuration reellement servie par l'API en production, relevee sur
   * ambagabonguinee.com le 2026-09-10.
   *
   * Elle differe de la fixture sur deux points qui ont chacun produit une
   * fuite visible par le public : l'identite y est imbriquee dans un objet
   * `identite`, si bien que le titre s'affichait « Ambassade » sans pays ; et
   * elle ne declare ni `dirigeants` ni `vitrine`, si bien que le defaut
   * ouvert de l'epoque affichait les dirigeants guineens sur l'accueil
   * gabonais.
   */
  describe('sur la configuration reellement servie en production', () => {
    const tenant = GABON_AVANT_COLONNES

    it("n'affiche aucun dirigeant guineen faute de rubrique declaree", async () => {
      const wrapper = await rendre('/', tenant)

      expect(wrapper.text().match(IDENTITE_ETRANGERE)).toBeNull()
    })

    it("n'expose pas non plus les portraits guineens", async () => {
      const wrapper = await rendre('/', tenant)
      const sources = wrapper.findAll('img').map((i) => i.attributes('src') ?? '')

      expect(sources.filter((s) => /guinee|president|ministre|ambassadeur/i.test(s))).toEqual([])
    })

    it("retrouve le nom du pays malgre l'identite imbriquee", async () => {
      const wrapper = await rendre('/', tenant)

      // Sans normalisation, le gabarit affichait « Ambassade » tout court.
      // Ce tenant n'a pas de `display_name` : le repli est le nom du pays.
      expect(wrapper.text()).toContain('Ambassade de la Republique Gabonaise')
    })
  })
})
