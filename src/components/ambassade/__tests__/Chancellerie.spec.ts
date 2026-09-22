import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest'
import { mount, flushPromises } from '@vue/test-utils'
import { createRouter, createMemoryHistory } from 'vue-router'
import { createPinia, setActivePinia } from 'pinia'
import { defineComponent, h } from 'vue'
import Chancellerie from '../Chancellerie.vue'
import { useTenantStore } from '@/stores/tenant'
import { GABON } from '@/api/fixtures/tenants'
import type { MembrePersonnel } from '@/api/annuaire'

const Vide = defineComponent({ render: () => h('div') })

function membre(partiel: Partial<MembrePersonnel> = {}): MembrePersonnel {
  return {
    id: 1,
    name: 'Awa Ndong',
    role: 'Premier Conseiller',
    email: null,
    phone: null,
    image_url: null,
    department: null,
    position: 1,
    ...partiel,
  }
}

/**
 * La page lit trois surfaces : l'annuaire, le contenu d'accueil et les pages
 * redactionnelles. On repond selon le chemin, sinon l'une recevrait la
 * reponse de l'autre.
 */
function servir(
  annuaire: unknown,
  accueil: unknown = { data: { ambassador: null } },
  pages: unknown = { data: { pages: [], jurisdiction: [], figures: [] } },
) {
  vi.stubGlobal(
    'fetch',
    vi.fn((url: string) => {
      const chemin = String(url)
      const corps = chemin.includes('/directory')
        ? annuaire
        : chemin.includes('/content/pages')
          ? pages
          : accueil
      return Promise.resolve(
        new Response(JSON.stringify(corps), {
          status: 200,
          headers: { 'Content-Type': 'application/json' },
        }),
      )
    }),
  )
}

/** Une page `chancellerie` telle que le CMS la sert. */
function pageChancellerie(reste: Record<string, unknown> = {}) {
  return {
    data: {
      pages: [
        {
          id: 1,
          slug: 'chancellerie',
          title: 'La Chancellerie diplomatique',
          subtitle: 'La structure de la mission, et celles et ceux qui la servent.',
          hero_image_url: null,
          body_html: '<p>La Chancellerie est le siège de la mission.</p>',
          position: 1,
          ...reste,
        },
      ],
      jurisdiction: [],
      figures: [],
    },
  }
}

async function monter() {
  const routeur = createRouter({
    history: createMemoryHistory(),
    routes: [
      { path: '/', component: Vide },
      { path: '/chancellerie', component: Chancellerie },
    ],
  })
  routeur.push('/chancellerie')
  await routeur.isReady()
  const wrapper = mount(Chancellerie, { global: { plugins: [routeur] } })
  await flushPromises()
  return wrapper
}

describe('page de la chancellerie', () => {
  beforeEach(() => {
    setActivePinia(createPinia())
    useTenantStore().embassy = GABON
  })

  afterEach(() => {
    vi.unstubAllGlobals()
  })

  it("affiche le personnel dans l'ordre servi, meme avec des trous de position", async () => {
    // Au contrat, une suppression laisse un trou dans les positions : c'est
    // l'ordre du tableau servi qui fait foi, jamais `position` comme index.
    servir({
      data: {
        staff: [
          membre({ id: 7, name: 'Premier membre', position: 2 }),
          membre({ id: 3, name: 'Second membre', position: 5 }),
        ],
        consuls: [],
      },
    })

    const wrapper = await monter()
    const texte = wrapper.text()

    expect(texte.indexOf('Premier membre')).toBeLessThan(texte.indexOf('Second membre'))
  })

  it('rend le courriel et le telephone en liens, et les tait quand ils sont vides', async () => {
    servir({
      data: {
        staff: [
          membre({ id: 1, name: 'Avec contact', email: 'a@gabon-gn.org', phone: '+224 000' }),
          membre({ id: 2, name: 'Sans contact' }),
        ],
        consuls: [],
      },
    })

    const wrapper = await monter()

    expect(wrapper.find('a[href="mailto:a@gabon-gn.org"]').exists()).toBe(true)
    expect(wrapper.find('a[href="tel:+224 000"]').exists()).toBe(true)
    expect(wrapper.findAll('a[href^="mailto:"]')).toHaveLength(1)
  })

  it("affiche l'ambassadeur servi par le contenu d'accueil", async () => {
    // L'ambassadeur n'est pas dans l'annuaire : il vient du bloc
    // `ambassador`, comme sur sa page de biographie.
    servir(
      { data: { staff: [membre()], consuls: [] } },
      {
        data: {
          ambassador: {
            name: 'Persis Lionel Essono Ondo',
            title: 'Ambassadeur Extraordinaire et Plenipotentiaire',
            image_url: null,
            body_html: '<p>Biographie.</p>',
          },
        },
      },
    )

    const wrapper = await monter()

    expect(wrapper.text()).toContain('Persis Lionel Essono Ondo')
  })

  it('se retracte quand le CMS ne sert personne', async () => {
    // Le repli n'est jamais le contenu du gabarit : la page portait en dur
    // l'equipe d'une autre ambassade, elle ne doit pas y revenir.
    servir({ data: { staff: [], consuls: [] } })

    const wrapper = await monter()

    expect(wrapper.text()).toContain('Rubrique en préparation')
    expect(wrapper.text()).not.toContain('Équipe Diplomatique')
  })

  it('se retracte aussi quand le service est injoignable', async () => {
    vi.stubGlobal('fetch', vi.fn().mockRejectedValue(new Error('reseau')))

    const wrapper = await monter()

    expect(wrapper.text()).toContain('Rubrique en préparation')
  })

  it("affiche le personnel meme si le contenu d'accueil echoue", async () => {
    // Les deux lectures sont independantes : l'annuaire ne doit pas
    // disparaitre parce que le bloc ambassadeur est injoignable.
    vi.stubGlobal(
      'fetch',
      vi.fn((url: string) =>
        String(url).includes('/directory')
          ? Promise.resolve(
              new Response(JSON.stringify({ data: { staff: [membre()], consuls: [] } }), {
                status: 200,
                headers: { 'Content-Type': 'application/json' },
              }),
            )
          : Promise.reject(new Error('reseau')),
      ),
    )

    const wrapper = await monter()

    expect(wrapper.text()).toContain('Awa Ndong')
  })

  it('affiche le texte de la chancellerie au-dessus de l equipe', async () => {
    // Ce texte etait saisissable dans l'administration depuis le lot
    // « pages » et n'etait affiche nulle part : cette route rend l'annuaire,
    // pas `PageRedaction`.
    servir({ data: { staff: [membre()], consuls: [] } }, undefined, pageChancellerie())

    const wrapper = await monter()
    const texte = wrapper.text()

    expect(texte).toContain('La Chancellerie est le siège de la mission.')
    // Au-dessus, et non a la suite : le preambule precede les personnes.
    expect(texte.indexOf('siège de la mission')).toBeLessThan(texte.indexOf('Awa Ndong'))
  })

  it('prend le titre et le sous-titre saisis plutot que ceux du gabarit', async () => {
    // Les ignorer ferait mentir l'ecran d'administration, qui les presente
    // comme les deux premiers champs de la page.
    servir({ data: { staff: [membre()], consuls: [] } }, undefined, pageChancellerie())

    const wrapper = await monter()

    expect(wrapper.text()).toContain(
      'La structure de la mission, et celles et ceux qui la servent.',
    )
    expect(wrapper.text()).not.toContain('Au service de la représentation diplomatique')
  })

  it('garde le titre du gabarit quand le CMS ne sert pas cette page', async () => {
    servir({ data: { staff: [membre()], consuls: [] } })

    const wrapper = await monter()

    expect(wrapper.text()).toContain('La Chancellerie Diplomatique')
    expect(wrapper.text()).toContain('Au service de la représentation diplomatique')
  })

  it('montre la page quand seul le texte est publie, sans aucun agent', async () => {
    // Un texte sans equipe reste du contenu : se retracter le ferait
    // disparaitre alors que l'ambassade l'a bien publie.
    servir({ data: { staff: [], consuls: [] } }, undefined, pageChancellerie())

    const wrapper = await monter()

    expect(wrapper.text()).not.toContain('Rubrique en préparation')
    expect(wrapper.text()).toContain('La Chancellerie est le siège de la mission.')
  })
})
