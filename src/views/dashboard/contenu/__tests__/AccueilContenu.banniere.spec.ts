import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest'
import { mount, flushPromises } from '@vue/test-utils'
import { createPinia, setActivePinia } from 'pinia'
import AccueilContenu from '../AccueilContenu.vue'
import { useTenantStore } from '@/stores/tenant'
import { GABON } from '@/api/fixtures/tenants'

function reponse(corps: unknown, statut = 200) {
  return new Response(statut === 204 ? null : JSON.stringify(corps), {
    status: statut,
    headers: { 'Content-Type': 'application/json' },
  })
}

function diapositive(id: number) {
  return {
    id,
    image_url: `https://cms.test/hero/${id}.webp`,
    quote: null,
    author: null,
    position: id,
  }
}

/** Le contenu d'administration servi, et le journal des appels d'ecriture. */
function servir(hero: unknown) {
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
        return Promise.resolve(reponse(null, 204))
      }
      return Promise.resolve(
        reponse({
          data: { hero, welcome: null, ambassador: null, leaders: [], showcase: [] },
        }),
      )
    }),
  )
  return appels
}

async function monter() {
  useTenantStore().embassy = GABON
  const wrapper = mount(AccueilContenu)
  await flushPromises()
  return wrapper
}

describe("banniere dans l'ecran du contenu d'accueil", () => {
  beforeEach(() => {
    setActivePinia(createPinia())
  })

  afterEach(() => {
    vi.unstubAllGlobals()
  })

  it('propose les deux mises en page et reprend celle qui est enregistree', async () => {
    servir({ variant: 'diaporama', title: 'Titre saisi', intro: null, slides: [diapositive(1)] })

    const wrapper = await monter()

    const choix = wrapper.findAll('input[name="mise-en-page-banniere"]')
    expect(choix).toHaveLength(2)
    expect((wrapper.find('#titre-banniere').element as HTMLInputElement).value).toBe('Titre saisi')
    expect(wrapper.text()).toContain('Images du diaporama')
  })

  it("annonce que le site retombe sur la banniere simple quand aucune image n'est ajoutee", async () => {
    servir({ variant: 'diaporama', title: null, intro: null, slides: [] })

    const wrapper = await monter()

    expect(wrapper.text()).toContain('Tant que le diaporama est vide')
  })

  it('dit en toutes lettres que la suppression emporte les images', async () => {
    // Obligation du contrat, et pas une preference : un « retour au defaut »
    // qui garderait secretement les images est un piege.
    servir({
      variant: 'diaporama',
      title: null,
      intro: null,
      slides: [diapositive(1), diapositive(2)],
    })

    const wrapper = await monter()
    const boutons = wrapper.findAll('button')
    const retour = boutons.find((b) => b.text().includes('bannière par défaut'))
    expect(retour).toBeDefined()
    await retour!.trigger('click')

    const texte = wrapper.text()
    expect(texte).toContain('2 images du diaporama')
    expect(texte).toContain('seront supprimés')
    // Et l'ecran indique le geste qui garde les images.
    expect(texte).toContain('Bannière simple')
  })

  it("n'envoie pas les diapositives en changeant de mise en page", async () => {
    const appels = servir({
      variant: 'diaporama',
      title: null,
      intro: null,
      slides: [diapositive(1)],
    })

    const wrapper = await monter()
    await wrapper.findAll('input[name="mise-en-page-banniere"]')[0]!.setValue()
    const enregistrer = wrapper
      .findAll('button')
      .find((b) => b.text() === 'Enregistrer' && b.attributes('type') === 'button')
    await enregistrer!.trigger('click')
    await flushPromises()

    const ecriture = appels.find((a) => a.methode === 'PUT')
    expect(ecriture?.adresse).toContain('/api/admin/content/hero')
    expect(ecriture?.corps).toEqual({ variant: 'classique', title: null, intro: null })
  })

  it('annonce que le bloc est centre quand aucune image ne porte de citation', async () => {
    // Rien dans le formulaire ne le laisse deviner : la citation est
    // facultative image par image, et c'est leur absence a toutes qui deplace
    // le bloc au centre.
    servir({ variant: 'diaporama', title: null, intro: null, slides: [diapositive(1)] })

    const wrapper = await monter()

    expect(wrapper.text()).toContain('Aucune image ne porte de citation')
  })

  it('ne dit plus rien du centrage des que la citation est saisie', async () => {
    servir({
      variant: 'diaporama',
      title: null,
      intro: null,
      slides: [{ ...diapositive(1), quote: 'Renforcer les liens.' }],
    })

    const wrapper = await monter()

    expect(wrapper.text()).not.toContain('Aucune image ne porte de citation')
  })

  it("ne propose pas de supprimer une banniere qui n'existe pas", async () => {
    servir(null)

    const wrapper = await monter()

    expect(wrapper.text()).not.toContain('bannière par défaut')
  })
})
