import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest'
import { mount, flushPromises } from '@vue/test-utils'
import { createPinia, setActivePinia } from 'pinia'
import PagesContenu from '../PagesContenu.vue'
import { useTenantStore } from '@/stores/tenant'
import { GABON } from '@/api/fixtures/tenants'

function reponse(corps: unknown, statut = 200) {
  return new Response(statut === 204 ? null : JSON.stringify(corps), {
    status: statut,
    headers: { 'Content-Type': 'application/json' },
  })
}

/** Le contenu d'administration servi, et le journal des ecritures. */
function servir(contenu: unknown, echec: { statut: number; corps: unknown } | null = null) {
  const appels: { adresse: string; methode: string; corps: unknown }[] = []
  vi.stubGlobal(
    'fetch',
    vi.fn((url: string, options?: RequestInit) => {
      const methode = options?.method ?? 'GET'
      if (methode !== 'GET') {
        appels.push({
          adresse: String(url),
          methode,
          corps: options?.body === undefined ? null : JSON.parse(String(options.body)),
        })
        if (echec !== null) return Promise.resolve(reponse(echec.corps, echec.statut))
        return Promise.resolve(reponse({ data: {} }))
      }
      return Promise.resolve(reponse(contenu))
    }),
  )
  return appels
}

function page(slug: string, reste: Record<string, unknown> = {}) {
  return {
    id: 1,
    slug,
    title: 'Titre officiel',
    subtitle: null,
    hero_image_url: null,
    body_html: '<p>Corps.</p>',
    position: 1,
    published: true,
    ...reste,
  }
}

async function monter() {
  useTenantStore().embassy = GABON
  const wrapper = mount(PagesContenu)
  await flushPromises()
  return wrapper
}

function bouton(wrapper: Awaited<ReturnType<typeof monter>>, texte: string) {
  return wrapper.findAll('button').find((b) => b.text() === texte)
}

describe("ecran de saisie des pages de l'ambassade", () => {
  beforeEach(() => {
    setActivePinia(createPinia())
  })

  afterEach(() => {
    vi.unstubAllGlobals()
  })

  it('presente les quatre pages, y compris celles qui ne sont pas redigees', async () => {
    // L'ecran est un inventaire, pas une liste de ce qui existe deja : sans
    // cela, personne ne saurait que « Notre ambition numerique » peut etre
    // remplie.
    servir({ data: { pages: [], jurisdiction: [], figures: [] } })

    const wrapper = await monter()

    expect(wrapper.text()).toContain('Présentation')
    expect(wrapper.text()).toContain('La Chancellerie')
    expect(wrapper.text()).toContain('Relations bilatérales')
    expect(wrapper.text()).toContain('Notre ambition numérique')
    expect(wrapper.findAll('button').filter((b) => b.text() === 'Rédiger cette page')).toHaveLength(
      4,
    )
  })

  it('annonce comme masquee une page publiee mais vide', async () => {
    // Publiee sans texte, elle affiche « Rubrique en preparation » au
    // visiteur : la dire visible serait un mensonge.
    servir({
      data: {
        pages: [page('presentation', { body_html: null, published: true })],
        jurisdiction: [],
        figures: [],
      },
    })

    const wrapper = await monter()

    expect(wrapper.text()).toContain('Masquée sur le site')
    expect(wrapper.text()).not.toContain('Visible sur le site')
  })

  it("envoie tous les champs a l'adresse du contrat, effacements compris", async () => {
    // Le remplacement est COMPLET : un sous-titre efface doit partir a `null`
    // et non rester absent du corps, sinon l'ancienne valeur survit.
    const appels = servir({
      data: {
        pages: [page('presentation', { subtitle: 'Ancien sous-titre' })],
        jurisdiction: [],
        figures: [],
      },
    })

    const wrapper = await monter()
    await bouton(wrapper, 'Modifier')!.trigger('click')
    await wrapper.find('#sous-titre-page').setValue('')
    await wrapper.find('form').trigger('submit')
    await flushPromises()

    const ecriture = appels.find((a) => a.methode === 'PUT')
    expect(ecriture?.adresse).toContain('/api/admin/pages/presentation')
    expect(ecriture?.corps).toEqual({
      title: 'Titre officiel',
      subtitle: null,
      hero_image_url: null,
      body_html: '<p>Corps.</p>',
      published: true,
    })
  })

  it('refuse un titre vide sans appeler le serveur', async () => {
    const appels = servir({ data: { pages: [], jurisdiction: [], figures: [] } })

    const wrapper = await monter()
    await wrapper
      .findAll('button')
      .find((b) => b.text() === 'Rédiger cette page')!
      .trigger('click')
    await wrapper.find('form').trigger('submit')
    await flushPromises()

    expect(appels).toEqual([])
    expect(wrapper.text()).toContain('Le titre est obligatoire.')
  })

  it('pose le message du 422 sous le champ fautif', async () => {
    // Le detail par champ passe avant l'agregat : un message general en tete
    // de formulaire ne se relie a aucune case a corriger.
    servir(
      { data: { pages: [page('presentation')], jurisdiction: [], figures: [] } },
      {
        statut: 422,
        corps: {
          message: 'Les données envoyées sont invalides.',
          errors: { body_html: ['Le texte dépasse la longueur acceptée.'] },
        },
      },
    )

    const wrapper = await monter()
    await bouton(wrapper, 'Modifier')!.trigger('click')
    await wrapper.find('form').trigger('submit')
    await flushPromises()

    expect(wrapper.text()).toContain('Le texte dépasse la longueur acceptée.')
    // Et la boite reste ouverte : la saisie n'est pas perdue.
    expect(wrapper.find('#titre-page').exists()).toBe(true)
  })

  it("n'annonce aucun succes quand le reseau tombe", async () => {
    servir({ data: { pages: [page('presentation')], jurisdiction: [], figures: [] } })
    const wrapper = await monter()
    await bouton(wrapper, 'Modifier')!.trigger('click')

    vi.stubGlobal('fetch', vi.fn().mockRejectedValue(new Error('reseau')))
    await wrapper.find('form').trigger('submit')
    await flushPromises()

    expect(wrapper.text()).not.toContain('Page enregistrée.')
    expect(wrapper.text()).toContain('momentanément indisponible')
  })

  it('ecarte les lignes vides de la juridiction et des chiffres', async () => {
    // Une case oubliee ne doit pas devenir un pays sans nom sur le site.
    const appels = servir({
      data: {
        pages: [],
        jurisdiction: ['République de Guinée'],
        figures: [{ value: '2026', label: "Année d'ouverture" }],
      },
    })

    const wrapper = await monter()
    await bouton(wrapper, 'Ajouter un pays')!.trigger('click')
    await bouton(wrapper, 'Ajouter un chiffre')!.trigger('click')
    await bouton(wrapper, 'Enregistrer juridiction et chiffres')!.trigger('click')
    await flushPromises()

    const ecriture = appels.find((a) => a.methode === 'PUT')
    expect(ecriture?.adresse).toContain('/api/admin/pages-settings')
    expect(ecriture?.corps).toEqual({
      jurisdiction: ['République de Guinée'],
      figures: [{ value: '2026', label: "Année d'ouverture" }],
    })
  })
})
