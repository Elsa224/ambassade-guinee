import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest'
import { mount, flushPromises } from '@vue/test-utils'
import { createRouter, createMemoryHistory } from 'vue-router'
import { createPinia, setActivePinia } from 'pinia'
import { defineComponent, h } from 'vue'
import ConsulsHonoraires from '../ConsulsHonoraires.vue'
import { useTenantStore } from '@/stores/tenant'
import { GABON } from '@/api/fixtures/tenants'
import type { ConsulHonoraire } from '@/api/annuaire'

const Vide = defineComponent({ render: () => h('div') })

function consul(partiel: Partial<ConsulHonoraire> = {}): ConsulHonoraire {
  return {
    id: 1,
    name: 'Mariam Diallo',
    role: 'Consul honoraire',
    city: 'Kankan',
    address: null,
    email: null,
    phone: null,
    position: 1,
    ...partiel,
  }
}

function servir(annuaire: unknown) {
  vi.stubGlobal(
    'fetch',
    vi.fn(() =>
      Promise.resolve(
        new Response(JSON.stringify(annuaire), {
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
      { path: '/consuls-honoraires', component: ConsulsHonoraires },
    ],
  })
  routeur.push('/consuls-honoraires')
  await routeur.isReady()
  const wrapper = mount(ConsulsHonoraires, { global: { plugins: [routeur] } })
  await flushPromises()
  return wrapper
}

describe('page des consuls honoraires', () => {
  beforeEach(() => {
    setActivePinia(createPinia())
    useTenantStore().embassy = GABON
  })

  afterEach(() => {
    vi.unstubAllGlobals()
  })

  it("affiche les consuls dans l'ordre servi, meme avec des trous de position", async () => {
    servir({
      data: {
        staff: [],
        consuls: [
          consul({ id: 7, name: 'Premier consul', city: 'Kankan', position: 2 }),
          consul({ id: 3, name: 'Second consul', city: 'Nzerekore', position: 5 }),
        ],
      },
    })

    const wrapper = await monter()
    const texte = wrapper.text()

    expect(texte.indexOf('Premier consul')).toBeLessThan(texte.indexOf('Second consul'))
    expect(texte).toContain('Kankan')
  })

  it("rend l'adresse en respectant ses retours a la ligne", async () => {
    // Au contrat, l'adresse est un texte libre de 2000 caracteres qui peut
    // porter plusieurs lignes : elle se rend telle qu'elle a ete saisie.
    servir({
      data: { staff: [], consuls: [consul({ address: 'Rue 12\nQuartier Almamya' })] },
    })

    const wrapper = await monter()
    const adresse = wrapper.find('.whitespace-pre-line')

    expect(adresse.text()).toContain('Quartier Almamya')
  })

  it('tait les coordonnees que le CMS ne sert pas', async () => {
    servir({ data: { staff: [], consuls: [consul()] } })

    const wrapper = await monter()

    // Le bloc gris des coordonnees disparait entierement plutot que
    // d'afficher des lignes vides. Le pied de page garde les siennes, qui
    // viennent du bootstrap et non du consul.
    expect(wrapper.find('.whitespace-pre-line').exists()).toBe(false)
    expect(wrapper.text()).not.toContain('Téléphone')
    expect(wrapper.text()).not.toContain('Contacter le consul')
  })

  it("propose le bouton d'appel des qu'un telephone est servi", async () => {
    servir({ data: { staff: [], consuls: [consul({ phone: '+224 621 00 00 00' })] } })

    const wrapper = await monter()

    expect(wrapper.text()).toContain('Contacter le consul')
    expect(wrapper.findAll('a[href="tel:+224 621 00 00 00"]').length).toBeGreaterThan(0)
  })

  it("affiche les coordonnees de l'ambassade servies par le bootstrap", async () => {
    // Le pied de page portait en dur le telephone de Washington : il vient
    // desormais de la configuration du domaine appele.
    servir({ data: { staff: [], consuls: [consul()] } })

    const wrapper = await monter()

    expect(wrapper.text()).toContain(GABON.contact.email)
  })

  it('se retracte quand aucun consul n est publie', async () => {
    servir({ data: { staff: [], consuls: [] } })

    const wrapper = await monter()

    expect(wrapper.text()).toContain('Rubrique en préparation')
  })

  it('se retracte aussi quand le service est injoignable', async () => {
    vi.stubGlobal('fetch', vi.fn().mockRejectedValue(new Error('reseau')))

    const wrapper = await monter()

    expect(wrapper.text()).toContain('Rubrique en préparation')
  })
})
