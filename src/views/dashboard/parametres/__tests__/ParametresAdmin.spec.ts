import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest'
import { mount, flushPromises } from '@vue/test-utils'
import { createPinia, setActivePinia } from 'pinia'
import ParametresAdmin from '../ParametresAdmin.vue'

const SERVIE = {
  id: 2,
  slug: 'gabon-guinee',
  domain: 'ambagabonguinee.com',
  display_name: 'Ambassade de la Republique du Gabon en Guinee',
  identite: {
    country_name_official: 'Republique Gabonaise',
    country_name_short: 'Gabon',
    demonym: 'gabonais',
    flag_image: '/drapeau.png',
    logo_image: '/logo.png',
  },
  theme: { color_primary: '#009E60', color_secondary: '#FCD116', color_accent: '#3A75C4' },
  contact: {
    address: 'Conakry',
    phone: '+224 000 00 00 01',
    phones: [
      { label: 'Standard', number: '+224 000 00 00 01' },
      { label: 'Visas', number: '+224 000 00 00 02' },
    ],
    email: 'ambassade@exemple.test',
    hours: 'Du lundi au vendredi',
  },
  modules: { services_consulaires: true },
}

/** Les corps envoyes, dans l'ordre, pour inspecter ce que l'ecran a poste. */
let envoyes: Record<string, unknown>[] = []

beforeEach(() => {
  setActivePinia(createPinia())
  envoyes = []
  vi.stubGlobal(
    'fetch',
    vi.fn((url: string, options: RequestInit = {}) => {
      if (options.body) envoyes.push(JSON.parse(String(options.body)))
      const corps = url.includes('/api/bootstrap') ? { embassy: SERVIE } : { data: SERVIE }
      return Promise.resolve(
        new Response(JSON.stringify(corps), {
          status: 200,
          headers: { 'Content-Type': 'application/json' },
        }),
      )
    }),
  )
})

afterEach(() => vi.unstubAllGlobals())

async function monter() {
  const wrapper = mount(ParametresAdmin, {
    global: { stubs: { ChampImage: true } },
  })
  await flushPromises()
  return wrapper
}

describe("l'ecran des parametres", () => {
  it("n'offre pas le domaine, le slug ni les modules, qui ne sont pas de son ressort", async () => {
    const wrapper = await monter()
    const texte = wrapper.text().toLowerCase()
    expect(texte).not.toContain('domaine')
    expect(texte).not.toContain('module')
  })

  it("previent quand le nom complet est vide, parce que le repli s'affichera a sa place", async () => {
    const wrapper = await monter()
    expect(wrapper.text()).not.toContain('Ambassade de la République Gabonaise')

    await wrapper.get('#display-name').setValue('')
    expect(wrapper.text()).toContain('Ambassade de la Republique Gabonaise')
  })

  it("n'envoie jamais le numero principal, que l'API refuse", async () => {
    const wrapper = await monter()
    await wrapper.get('#nom-court').setValue('Gabon (Conakry)')
    await wrapper.get('form').trigger('submit')
    await flushPromises()

    const contact = envoyes[0]?.contact as Record<string, unknown>
    expect(contact).not.toHaveProperty('phone')
    expect(contact.phones).toHaveLength(2)
  })

  it('change le numero principal en remontant une entree de la liste', async () => {
    const wrapper = await monter()
    const remonter = wrapper.get('[aria-label="Remonter le numéro 2"]')
    await remonter.trigger('click')
    await wrapper.get('form').trigger('submit')
    await flushPromises()

    const contact = envoyes[0]?.contact as { phones: { label: string }[] }
    expect(contact.phones[0]?.label).toBe('Visas')
  })

  it('retire les lignes de numero restees vides plutot que de les faire refuser', async () => {
    const wrapper = await monter()
    const boutons = wrapper.findAll('button')
    await boutons.find((b) => b.text() === 'Ajouter un numéro')!.trigger('click')
    await wrapper.get('form').trigger('submit')
    await flushPromises()

    const contact = envoyes[0]?.contact as { phones: unknown[] }
    expect(contact.phones).toHaveLength(2)
  })

  it("refuse d'enregistrer une couleur illisible, et le dit", async () => {
    const wrapper = await monter()
    await wrapper.get('#color_primary').setValue('#FFFFFF')
    await wrapper.get('form').trigger('submit')
    await flushPromises()

    expect(envoyes).toHaveLength(0)
    expect(wrapper.text()).toContain('couleur principale')
  })
})
