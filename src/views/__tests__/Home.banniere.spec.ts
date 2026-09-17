import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest'
import { mount, flushPromises } from '@vue/test-utils'
import { createRouter, createMemoryHistory } from 'vue-router'
import { createPinia, setActivePinia } from 'pinia'
import { defineComponent, h } from 'vue'
import Home from '../Home.vue'
import { useTenantStore } from '@/stores/tenant'
import { GABON } from '@/api/fixtures/tenants'
import { enteteEnSurimpression } from '@/tenant/banniere'

const Vide = defineComponent({ render: () => h('div') })

function reponse(corps: unknown) {
  return new Response(JSON.stringify(corps), {
    status: 200,
    headers: { 'Content-Type': 'application/json' },
  })
}

function diapositive(id: number, quote: string | null = null, author: string | null = null) {
  return { id, image_url: `https://cms.test/hero/${id}.webp`, quote, author, position: id }
}

/** Le CMS sert cette banniere ; le reste du contenu est vide. */
function servirBanniere(hero: unknown) {
  vi.stubGlobal(
    'fetch',
    vi.fn((url: string) =>
      Promise.resolve(
        String(url).includes('/api/content/home')
          ? reponse({
              data: { hero, welcome: null, ambassador: null, leaders: [], showcase: [] },
            })
          : reponse({ data: [] }),
      ),
    ),
  )
}

async function monter() {
  useTenantStore().embassy = GABON
  const routeur = createRouter({
    history: createMemoryHistory(),
    routes: [
      { path: '/', component: Home },
      { path: '/services', component: Vide },
      { path: '/services/:slug', component: Vide },
      { path: '/actualite', component: Vide },
      { path: '/ambassadeur', component: Vide },
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

describe("banniere d'accueil servie par le CMS", () => {
  beforeEach(() => {
    setActivePinia(createPinia())
    vi.stubGlobal('matchMedia', () => ({
      matches: false,
      addEventListener() {},
      removeEventListener() {},
    }))
  })

  afterEach(() => {
    vi.unstubAllGlobals()
  })

  it("garde la banniere du gabarit quand l'ambassade n'a rien choisi", async () => {
    // `hero: null` vaut « rien choisi » : le defaut n'est jamais le contenu
    // d'une autre ambassade, c'est la banniere que le gabarit porte deja.
    servirBanniere(null)

    const wrapper = await monter()

    expect(wrapper.findAll('h1')[0]?.text()).toBe(GABON.display_name)
    expect(wrapper.find('[aria-label="Bannière d\'accueil"]').exists()).toBe(false)
    expect(enteteEnSurimpression.value).toBe(false)
  })

  it('affiche le diaporama, son titre saisi et la citation de la premiere image', async () => {
    servirBanniere({
      variant: 'diaporama',
      title: 'Bienvenue à l’Ambassade',
      intro: 'Le portail officiel.',
      slides: [diapositive(1, 'Renforcer les liens.', 'SEM Oligui Nguema'), diapositive(2)],
    })

    const wrapper = await monter()

    const banniere = wrapper.find('[aria-label="Bannière d\'accueil"]')
    expect(banniere.exists()).toBe(true)
    expect(banniere.find('h1').text()).toBe('Bienvenue à l’Ambassade')
    expect(banniere.text()).toContain('Le portail officiel.')
    expect(banniere.text()).toContain('Renforcer les liens.')
    expect(banniere.text()).toContain('SEM Oligui Nguema')
    // Une pastille par image, et seulement quand il y a de quoi naviguer.
    expect(banniere.findAll('button[aria-current]')).toHaveLength(2)
  })

  it('centre le titre, l accroche et les boutons quand aucune image ne porte de citation', async () => {
    // La maquette a deux colonnes suppose une citation par photo. Sans aucune
    // citation, la moitie droite ne porterait qu'un guillemet orphelin : le
    // bloc prend alors le centre, et la photo garde toute la largeur.
    servirBanniere({
      variant: 'diaporama',
      title: 'Représenter. Protéger. Rassembler. Coopérer.',
      intro: 'Au service de la diplomatie gabonaise.',
      slides: [diapositive(1), diapositive(2)],
    })

    const wrapper = await monter()

    const banniere = wrapper.find('[aria-label="Bannière d\'accueil"]')
    expect(banniere.exists()).toBe(true)
    expect(banniere.find('h1').text()).toBe('Représenter. Protéger. Rassembler. Coopérer.')
    expect(banniere.text()).toContain('Au service de la diplomatie gabonaise.')
    expect(banniere.find('.text-center').exists()).toBe(true)
    // Le guillemet ouvert n'a plus rien a annoncer : il ne doit pas rester.
    expect(banniere.find('.bxs-quote-left').exists()).toBe(false)
    // Le reperage des photos, lui, ne depend pas de la citation.
    expect(banniere.findAll('button[aria-current]')).toHaveLength(2)
    // Les boutons du slot suivent le bloc au centre.
    expect(banniere.findAll('a').map((a) => a.text())).toContain('Consulter les actualités')
  })

  it('garde la maquette en deux colonnes des qu une seule image porte une citation', async () => {
    // La composition se decide sur l'ENSEMBLE des diapositives : sinon elle
    // changerait toutes les six secondes au fil du defilement.
    servirBanniere({
      variant: 'diaporama',
      title: null,
      intro: null,
      slides: [diapositive(1), diapositive(2, 'Renforcer les liens.', 'SEM Oligui Nguema')],
    })

    const wrapper = await monter()

    const banniere = wrapper.find('[aria-label="Bannière d\'accueil"]')
    expect(banniere.find('.lg\\:grid-cols-2').exists()).toBe(true)
    // La citation est celle de la photo affichee : la premiere n'en porte pas,
    // et la colonne reste donc vide jusqu'a ce qu'on aille voir la seconde.
    expect(banniere.text()).not.toContain('SEM Oligui Nguema')
    await banniere.findAll('button[aria-current]')[1]!.trigger('click')
    expect(banniere.text()).toContain('SEM Oligui Nguema')
  })

  it("retombe sur la banniere simple quand le diaporama n'a aucune image", async () => {
    // Un diaporama vide n'est pas un diaporama : c'est un aplat sombre ou
    // personne ne trouve le menu. Le back enregistre pourtant la combinaison.
    servirBanniere({ variant: 'diaporama', title: 'Titre saisi', intro: null, slides: [] })

    const wrapper = await monter()

    expect(wrapper.find('[aria-label="Bannière d\'accueil"]').exists()).toBe(false)
    // Le titre saisi sert quand meme : c'est la mise en page qui retombe.
    expect(wrapper.findAll('h1')[0]?.text()).toBe('Titre saisi')
    expect(enteteEnSurimpression.value).toBe(false)
  })

  it("garde les images quand l'ambassade repasse en banniere simple", async () => {
    servirBanniere({
      variant: 'classique',
      title: null,
      intro: 'Une accroche.',
      slides: [diapositive(1, 'Citation gardee.')],
    })

    const wrapper = await monter()

    expect(wrapper.find('[aria-label="Bannière d\'accueil"]').exists()).toBe(false)
    expect(wrapper.text()).toContain('Une accroche.')
    // La citation appartient a une image conservee mais non affichee.
    expect(wrapper.text()).not.toContain('Citation gardee.')
  })

  it("leve le drapeau de l'en-tete en surimpression, et le baisse en partant", async () => {
    servirBanniere({
      variant: 'diaporama',
      title: null,
      intro: null,
      slides: [diapositive(1)],
    })

    const wrapper = await monter()
    expect(enteteEnSurimpression.value).toBe(true)

    wrapper.unmount()
    expect(enteteEnSurimpression.value).toBe(false)
  })

  it('ne lance aucun defilement quand les animations sont refusees', async () => {
    // « Une banniere qui bouge toute seule n'est pas negociable pour qui a
    // demande qu'elle ne bouge pas. »
    vi.stubGlobal('matchMedia', (requete: string) => ({
      matches: requete.includes('prefers-reduced-motion'),
      addEventListener() {},
      removeEventListener() {},
    }))
    const poser = vi.spyOn(globalThis, 'setInterval')
    servirBanniere({
      variant: 'diaporama',
      title: null,
      intro: null,
      slides: [diapositive(1), diapositive(2)],
    })

    await monter()

    expect(poser).not.toHaveBeenCalled()
    poser.mockRestore()
  })
})
