import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest'
import { mount, flushPromises } from '@vue/test-utils'
import { createRouter, createMemoryHistory } from 'vue-router'
import { createPinia, setActivePinia } from 'pinia'
import { defineComponent, h } from 'vue'
import PageRedaction from '../PageRedaction.vue'
import { useTenantStore } from '@/stores/tenant'
import { GABON } from '@/api/fixtures/tenants'

const Vide = defineComponent({ render: () => h('div') })

function servir(corps: unknown, statut = 200) {
  vi.stubGlobal(
    'fetch',
    vi.fn(() =>
      Promise.resolve(
        new Response(JSON.stringify(corps), {
          status: statut,
          headers: { 'Content-Type': 'application/json' },
        }),
      ),
    ),
  )
}

function page(slug: string, reste: Record<string, unknown> = {}) {
  return {
    id: 1,
    slug,
    title: 'Une représentation au service de l’État',
    subtitle: null,
    hero_image_url: null,
    body_html: '<h2>Mission diplomatique</h2><p>Corps officiel.</p>',
    position: 1,
    published: true,
    ...reste,
  }
}

async function monter(props: Record<string, unknown>) {
  useTenantStore().embassy = GABON
  const routeur = createRouter({
    history: createMemoryHistory(),
    routes: [{ path: '/', component: Vide }],
  })
  routeur.push('/')
  await routeur.isReady()
  const wrapper = mount(PageRedaction, {
    props: { slug: 'presentation', macaron: "L'Ambassade", ...props },
    global: { plugins: [routeur] },
  })
  await flushPromises()
  return wrapper
}

describe('page redactionnelle servie par le CMS', () => {
  beforeEach(() => {
    setActivePinia(createPinia())
  })

  afterEach(() => {
    vi.unstubAllGlobals()
  })

  it('affiche le titre et le corps servis par l ambassade', async () => {
    servir({ data: { pages: [page('presentation')], jurisdiction: [], figures: [] } })

    const wrapper = await monter({})

    expect(wrapper.text()).toContain('Une représentation au service de l’État')
    // Le corps est assaini cote serveur : le front en dispose les morceaux
    // sans en retrancher un mot.
    expect(wrapper.text()).toContain('Mission diplomatique')
    expect(wrapper.html()).toContain('<p>Corps officiel.</p>')
  })

  it('dispose quatre sections et plus en grille', async () => {
    // Les missions d'une ambassade sont paralleles, pas sequentielles : une
    // grille dit cela, un rouleau dit le contraire.
    servir({
      data: {
        pages: [
          page('presentation', {
            body_html: [1, 2, 3, 4]
              .map((n) => `<h2>${n}. Mission ${n}</h2><p>Corps ${n}.</p>`)
              .join(''),
          }),
        ],
        jurisdiction: [],
        figures: [],
      },
    })

    const wrapper = await monter({})
    const cartes = wrapper.findAll('article')

    expect(cartes).toHaveLength(4)
    // Le numero est celui que l'ambassade a ecrit : le gabarit n'en invente
    // aucun, il le met simplement en evidence.
    expect(cartes[0]?.text()).toContain('01')
    expect(cartes[0]?.text()).toContain('Mission 1')
    expect(cartes[0]?.text()).not.toContain('1. Mission 1')
  })

  it('etale la derniere carte quand elle serait seule sur sa ligne', async () => {
    // Sept sections sur trois colonnes laissent une carte isolee devant deux
    // cases vides, ce qui se lit comme une section manquante.
    servir({
      data: {
        pages: [
          page('ambition-numerique', {
            body_html: [1, 2, 3, 4, 5, 6, 7].map((n) => `<h2>Axe ${n}</h2><p>C${n}.</p>`).join(''),
          }),
        ],
        jurisdiction: [],
        figures: [],
      },
    })

    const wrapper = await monter({ slug: 'ambition-numerique' })
    const cartes = wrapper.findAll('article')

    expect(cartes).toHaveLength(7)
    expect(cartes[6]?.classes()).toContain('lg:col-span-3')
    expect(cartes[6]?.classes()).toContain('md:col-span-2')
    // Les autres restent dans leur case.
    expect(cartes[0]?.classes()).not.toContain('lg:col-span-3')
  })

  it('laisse moins de quatre sections en texte suivi', async () => {
    servir({
      data: {
        pages: [
          page('presentation', {
            body_html: '<h2>Une</h2><p>A.</p><h2>Deux</h2><p>B.</p>',
          }),
        ],
        jurisdiction: [],
        figures: [],
      },
    })

    const wrapper = await monter({})

    expect(wrapper.findAll('article')).toHaveLength(0)
    expect(wrapper.text()).toContain('Une')
    expect(wrapper.text()).toContain('Deux')
  })

  it('detache la section d un autre registre et y range le flanc', async () => {
    // « Le Gabon » ferme la presentation : l'adresse et la juridiction s'y
    // rangent plutot que de border le chapeau, ou elles depassaient sous lui.
    servir({
      data: {
        pages: [
          page('presentation', {
            body_html:
              [1, 2, 3, 4].map((n) => `<h2>${n}. Mission ${n}</h2><p>C${n}.</p>`).join('') +
              '<h2>Le Gabon</h2><p>Sur la côte atlantique.</p>',
          }),
        ],
        jurisdiction: ['République de Guinée'],
        figures: [],
      },
    })

    const wrapper = await monter({ flanc: true })
    const bande = wrapper.find('section')

    expect(wrapper.findAll('article')).toHaveLength(4)
    expect(bande.text()).toContain('Le Gabon')
    expect(bande.text()).toContain('Sur la côte atlantique.')
    expect(bande.text()).toContain('République de Guinée')
  })

  it('montre les chiffres meme quand le corps s ouvre sur un titre', async () => {
    // Sans chapeau a border, ils passent en bande : les loger dans le chapeau
    // les aurait fait disparaitre avec lui.
    servir({
      data: {
        pages: [page('presentation', { body_html: '<h2>Une</h2><p>A.</p>' })],
        jurisdiction: [],
        figures: [{ value: '2026', label: "Année d'ouverture" }],
      },
    })

    const wrapper = await monter({ chiffresVisibles: true })

    expect(wrapper.findAll('.tabular-nums').map((c) => c.text())).toEqual(['2026'])
  })

  it('se retracte quand l ambassade n a pas publie la page', async () => {
    servir({ data: { pages: [], jurisdiction: [], figures: [] } })

    const wrapper = await monter({})

    expect(wrapper.text()).toContain('Rubrique en préparation')
    expect(wrapper.text()).not.toContain('Mission diplomatique')
  })

  it("n'affiche rien du gabarit quand le service est injoignable", async () => {
    // Le repli ne doit jamais etre le contenu d'une autre ambassade : c'est
    // exactement ce que ces pages ont fait en production pendant des semaines.
    vi.stubGlobal('fetch', vi.fn().mockRejectedValue(new Error('reseau')))

    const wrapper = await monter({})

    expect(wrapper.text()).toContain('Rubrique en préparation')
    expect(wrapper.text()).not.toContain('Washington')
    expect(wrapper.text()).not.toContain('1959')
  })

  it("ne montre pas la page d'un autre slug servie dans le meme corps", async () => {
    servir({
      data: {
        pages: [page('chancellerie', { title: 'La Chancellerie diplomatique' })],
        jurisdiction: [],
        figures: [],
      },
    })

    const wrapper = await monter({ slug: 'presentation' })

    expect(wrapper.text()).toContain('Rubrique en préparation')
    expect(wrapper.text()).not.toContain('La Chancellerie diplomatique')
  })

  it('porte l avertissement dans le cadre, pas dans le texte officiel', async () => {
    // Elsa a tranche le 21/09/2026 : le texte sur la digitalisation annonce
    // des services inexistants et n'est PAS reecrit pour autant. C'est la page
    // qui se situe, pas la prose qu'on ampute.
    servir({
      data: {
        pages: [page('ambition-numerique', { body_html: '<p>prendre rendez-vous en ligne</p>' })],
        jurisdiction: [],
        figures: [],
      },
    })

    const wrapper = await monter({
      slug: 'ambition-numerique',
      avertissement: 'Les services décrits ne sont pas encore ouverts.',
    })

    expect(wrapper.text()).toContain('Les services décrits ne sont pas encore ouverts.')
    // Le texte officiel est intact.
    expect(wrapper.html()).toContain('prendre rendez-vous en ligne')
  })

  it("n'affiche aucun avertissement quand la page n'en demande pas", async () => {
    servir({ data: { pages: [page('presentation')], jurisdiction: [], figures: [] } })

    const wrapper = await monter({})

    expect(wrapper.text()).not.toContain('ne sont pas encore ouverts')
  })

  it('affiche la juridiction servie et rien quand elle est vide', async () => {
    servir({
      data: {
        pages: [page('presentation')],
        jurisdiction: ['République de Guinée'],
        figures: [],
      },
    })

    const wrapper = await monter({ flanc: true })

    expect(wrapper.text()).toContain('Juridiction')
    expect(wrapper.text()).toContain('République de Guinée')
    // Et surtout pas celle du gabarit.
    expect(wrapper.text()).not.toContain('Costa')
  })

  it('n affiche aucun bloc de chiffres quand l ambassade n en a saisi aucun', async () => {
    // Un bandeau a cases vides se lit comme une donnee manquante alors que
    // l'ambassade a simplement saisi ce qu'elle savait.
    servir({ data: { pages: [page('presentation')], jurisdiction: [], figures: [] } })

    const wrapper = await monter({ chiffresVisibles: true })

    expect(wrapper.find('.tabular-nums').exists()).toBe(false)
  })

  it('affiche exactement les chiffres saisis, sans case de complement', async () => {
    servir({
      data: {
        pages: [page('presentation')],
        jurisdiction: [],
        figures: [
          { value: '2026', label: "Année d'ouverture de la mission" },
          { value: '11', label: 'Domaines de coopération' },
          { value: '1', label: 'Pays sous juridiction' },
        ],
      },
    })

    const wrapper = await monter({ chiffresVisibles: true })
    const chiffres = wrapper.findAll('.tabular-nums')

    expect(chiffres).toHaveLength(3)
    expect(chiffres.map((c) => c.text())).toEqual(['2026', '11', '1'])
  })
})
