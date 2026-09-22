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
 * La page lit deux surfaces : l'annuaire et le contenu d'accueil. On repond
 * selon le chemin, sinon l'une recevrait la reponse de l'autre.
 */
function servir(annuaire: unknown, accueil: unknown = { data: { ambassador: null } }) {
  vi.stubGlobal(
    'fetch',
    vi.fn((url: string) =>
      Promise.resolve(
        new Response(JSON.stringify(String(url).includes('/directory') ? annuaire : accueil), {
          status: 200,
          headers: { 'Content-Type': 'application/json' },
        }),
      ),
    ),
  )
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
})
