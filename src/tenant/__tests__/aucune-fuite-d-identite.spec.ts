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
import gabonFixture from '@/api/fixtures/bootstrap-gabon.json'
import guineeFixture from '@/api/fixtures/bootstrap.json'
import articlesGabon from '@/api/fixtures/articles-gabon.json'
import gabonProduction from '@/api/fixtures/bootstrap-gabon-production.json'
import { normaliserEmbassy } from '@/api/bootstrap'

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
 */
const IDENTITE_ETRANGERE =
  /Ambassade de la R[ée]publique de Guin[ée]|ambaguinee|leroy place|doumbouya|kouyat[ée]|n'da[ïi]ry/i

const Vide = defineComponent({ render: () => h('div') })

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

async function rendre(chemin: string, embassy: unknown) {
  useTenantStore().embassy = embassy as Embassy
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
    vi.stubGlobal('fetch', vi.fn().mockResolvedValue(reponse({ data: articlesGabon.data })))
  })

  afterEach(() => {
    vi.unstubAllGlobals()
  })

  it("ne laisse aucune trace guineenne sur l'accueil du domaine gabonais", async () => {
    const wrapper = await rendre('/', gabonFixture.embassy)
    const traces = wrapper.text().match(IDENTITE_ETRANGERE)

    expect(traces).toBeNull()
  })

  it('ne laisse aucune trace guineenne sur la page des actualites', async () => {
    const wrapper = await rendre('/actualite', gabonFixture.embassy)

    expect(wrapper.text().match(IDENTITE_ETRANGERE)).toBeNull()
  })

  it("n'expose pas non plus d'image guineenne", async () => {
    const wrapper = await rendre('/', gabonFixture.embassy)
    const sources = wrapper.findAll('img').map((i) => i.attributes('src') ?? '')

    // Les images du depot sont compilees sous un nom derive du fichier
    // d'origine : `logo-guinee`, `president`, `ambassadeur`... Aucune ne doit
    // subsister sur le domaine gabonais.
    expect(sources.filter((s) => /guinee|president|ministre|ambassadeur/i.test(s))).toEqual([])
  })

  it("affiche l'identite gabonaise a la place", async () => {
    const wrapper = await rendre('/', gabonFixture.embassy)

    expect(wrapper.text()).toContain('Ambassade de la Republique Gabonaise')
  })

  it("n'affiche aucune coordonnee tant que l'ambassade n'en a pas fourni", async () => {
    const wrapper = await rendre('/', gabonFixture.embassy)

    // L'adresse et le telephone sont vides dans la configuration : les lignes
    // doivent disparaitre, pas afficher celles de l'ambassade voisine.
    expect(wrapper.text()).not.toContain('Leroy Place')
    expect(wrapper.text()).toContain('ambassade@gabon-gn.org')
  })

  it('rend bien les articles servis, sans quoi le test ne prouverait rien', async () => {
    const wrapper = await rendre('/', gabonFixture.embassy)

    expect(wrapper.text()).toContain(articlesGabon.data[0]!.titre)
  })

  it('laisse le site guineen afficher sa propre identite', async () => {
    const wrapper = await rendre('/', guineeFixture.embassy)

    expect(wrapper.text()).toContain('Ambassade de la Republique de Guinee')
    // Ses rubriques editoriales restent ouvertes : rien ne disparait.
    expect(wrapper.text()).toContain('Chers compatriotes')
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
    const tenant = normaliserEmbassy(gabonProduction.embassy)

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
      expect(wrapper.text()).toContain('Republique Gabonaise')
    })
  })
})
