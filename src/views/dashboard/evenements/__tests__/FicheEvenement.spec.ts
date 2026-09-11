import { describe, it, expect, afterEach, vi } from 'vitest'
import { mount, flushPromises } from '@vue/test-utils'
import { createRouter, createMemoryHistory } from 'vue-router'
import { defineComponent, h } from 'vue'
import FicheEvenement from '../FicheEvenement.vue'
import ListeEvenements from '../ListeEvenements.vue'
import type { EvenementAdmin } from '@/api/evenements-admin'

const Vide = defineComponent({ render: () => h('div') })

function evenement(partiel: Partial<EvenementAdmin> = {}): EvenementAdmin {
  return {
    slug: 'fete-nationale',
    name: 'Fête nationale du Gabon',
    date: '2026-08-17',
    time: '18:30',
    location: 'Chancellerie, Conakry',
    description: 'Réception officielle.',
    status: 'ACTIVE',
    createdAt: '2026-06-01T09:00:00.000Z',
    logoUrl: '/api/admin/secure/events/fete-nationale/logo',
    registrationOpen: true,
    registrationDeadline: '2026-08-14',
    capacity: 200,
    registeredCount: 120,
    spotsRemaining: 80,
    typeLabel: 'Fête nationale',
    participants: [
      { fullName: 'Awa Ndong', email: 'awa.ndong@exemple.test', uidn: 'GA100001' },
      { fullName: 'Moussa Camara', email: 'moussa.camara@exemple.test', uidn: 'GA100002' },
    ],
    ...partiel,
  }
}

/** URL demandees au back pendant le test. */
let demandes: string[] = []

/** Ce que la fiche a ecrit : methode, chemin et corps deserialise. */
interface Envoi {
  methode: string
  url: string
  corps: Record<string, unknown>
}

let envois: Envoi[] = []

function servir(reponse: EvenementAdmin | null, statut = 200) {
  demandes = []
  envois = []
  vi.stubGlobal(
    'fetch',
    vi.fn((url: string, options: RequestInit = {}) => {
      demandes.push(String(url))
      const methode = options.method ?? 'GET'
      if (options.body) {
        envois.push({ methode, url: String(url), corps: JSON.parse(String(options.body)) })
      }
      const corps = reponse ? { data: reponse } : { message: "Cet évènement n'existe pas." }
      return Promise.resolve(
        new Response(JSON.stringify(corps), {
          status: statut,
          headers: { 'Content-Type': 'application/json' },
        }),
      )
    }),
  )
}

/** Le bouton dont le libelle contient ce fragment, s'il existe. */
function bouton(wrapper: Awaited<ReturnType<typeof rendre>>, fragment: string) {
  return wrapper.findAll('button').find((b) => b.text().includes(fragment))
}

/**
 * Monte la fiche derriere un routeur IMBRIQUE, comme l'application.
 *
 * L'imbrication n'est pas un detail de confort : c'est elle qui fait de la
 * liste un ancetre de la fiche, et donc qui maintient la rubrique allumee
 * dans la barre laterale. Un routeur de test a plat ne prouverait pas ce que
 * l'application fait.
 */
async function rendre(slug = 'fete-nationale') {
  const routeur = createRouter({
    history: createMemoryHistory(),
    routes: [
      { path: '/', component: Vide },
      {
        path: '/dashboard',
        component: { ...Vide, render: () => h('div') },
        children: [
          {
            path: 'evenements',
            component: defineComponent({ render: () => h('div') }),
            children: [
              { path: '', name: 'evenements-admin', component: ListeEvenements },
              { path: 'nouveau', name: 'evenement-admin-nouveau', component: Vide },
              { path: ':slug', name: 'evenement-admin', component: FicheEvenement },
              { path: ':slug/modifier', name: 'evenement-admin-modifier', component: Vide },
            ],
          },
        ],
      },
    ],
  })
  routeur.push(`/dashboard/evenements/${slug}`)
  await routeur.isReady()
  const wrapper = mount(FicheEvenement, { global: { plugins: [routeur] } })
  await flushPromises()
  return wrapper
}

describe('fiche d un evenement', () => {
  afterEach(() => {
    vi.unstubAllGlobals()
  })

  it("charge l'evenement designe par l'adresse, sans passer par la liste", async () => {
    // Une fiche ouverte par un lien partage ou rechargee n'a pas traverse la
    // liste : elle doit savoir se charger seule.
    servir(evenement())
    await rendre()

    expect(demandes[0]).toContain('/api/admin/secure/events/fete-nationale')
    expect(demandes[0]).not.toContain('page=')
  })

  it('nomme les inscrits, ce que la liste refuse de faire', async () => {
    // C'est la raison d'etre de cet ecran : les donnees personnelles y sont
    // montrees deliberement, apres avoir ouvert un evenement precis.
    servir(evenement())
    const wrapper = await rendre()

    expect(wrapper.text()).toContain('Awa Ndong')
    expect(wrapper.text()).toContain('awa.ndong@exemple.test')
    expect(wrapper.text()).toContain('GA100001')
  })

  it("n'affiche jamais le logo, qui exige un jeton qu'une image n'envoie pas", async () => {
    // `logoUrl` est une route locale protegee par le jeton porteur. Un
    // `<img src>` ne l'envoie pas : l'image reviendrait en 401 et se rendrait
    // en icone cassee.
    servir(evenement())
    const wrapper = await rendre()
    const sources = wrapper.findAll('img').map((i) => i.attributes('src') ?? '')

    expect(sources).not.toContain('/api/admin/secure/events/fete-nationale/logo')
  })

  it('filtre les inscrits sur le courriel autant que sur le nom', async () => {
    servir(evenement())
    const wrapper = await rendre()

    await wrapper.find('input[type="search"]').setValue('moussa.camara@exemple.test')

    expect(wrapper.text()).toContain('Moussa Camara')
    expect(wrapper.text()).not.toContain('Awa Ndong')
  })

  it('le dit quand personne ne s est inscrit', async () => {
    servir(evenement({ participants: [], registeredCount: 0, spotsRemaining: 200 }))
    const wrapper = await rendre()

    expect(wrapper.text()).toContain("Personne ne s'est encore inscrit")
  })

  it('masque la publication quand le back ne la sert pas', async () => {
    // Meme raison que dans la liste : annoncer « non publie » a tort inquiete.
    servir(evenement())
    const wrapper = await rendre()

    expect(wrapper.text()).not.toContain('Non publié')
  })

  it('affiche la publication des que le back la sert', async () => {
    servir(evenement({ isPublished: false }))
    const wrapper = await rendre()

    expect(wrapper.text()).toContain('Non publié')
  })

  it("affiche le message du back quand l'evenement n'existe pas", async () => {
    servir(null, 404)
    const wrapper = await rendre('inconnu')

    expect(wrapper.text()).toContain("Cet évènement n'existe pas.")
  })

  it("n'annule qu'apres confirmation, et envoie l'etat annule", async () => {
    // L'annulation est visible des inscrits et du site public, et rien dans
    // l'ecran ne permet de revenir en arriere d'un clic.
    servir(evenement())
    vi.stubGlobal(
      'confirm',
      vi.fn(() => true),
    )
    const wrapper = await rendre()
    await bouton(wrapper, "Annuler l'évènement")!.trigger('click')
    await flushPromises()

    expect(envois[envois.length - 1]!.methode).toBe('PATCH')
    expect(envois[envois.length - 1]!.corps.status).toBe('CANCELLED')
  })

  it("n'envoie rien si la confirmation est refusee", async () => {
    servir(evenement())
    vi.stubGlobal(
      'confirm',
      vi.fn(() => false),
    )
    const wrapper = await rendre()
    await bouton(wrapper, "Annuler l'évènement")!.trigger('click')
    await flushPromises()

    expect(envois).toHaveLength(0)
  })

  it("ne propose pas d'annuler un evenement deja annule", async () => {
    servir(evenement({ status: 'CANCELLED' }))
    const wrapper = await rendre()

    expect(bouton(wrapper, "Annuler l'évènement")).toBeUndefined()
  })

  it('ne propose la publication que si le back la sert', async () => {
    // Proposer « Publier » a un back qui ne sait pas stocker la publication
    // promettrait une action sans effet.
    const sansPublication = evenement()
    delete sansPublication.isPublished
    servir(sansPublication)
    const wrapper = await rendre()

    expect(bouton(wrapper, 'Publier sur le site')).toBeUndefined()
  })

  it('publie sur une route a part, et non par une modification', async () => {
    // La publication n'existe pas dans Ambassade Secure : elle vit cote CMS
    // et n'est pas relayee.
    servir(evenement({ isPublished: false }))
    const wrapper = await rendre()
    await bouton(wrapper, 'Publier sur le site')!.trigger('click')
    await flushPromises()

    const envoi = envois[envois.length - 1]!
    expect(envoi.methode).toBe('PUT')
    expect(envoi.url).toBe('/api/admin/secure/events/fete-nationale/publication')
    expect(envoi.corps.isPublished).toBe(true)
  })
})
