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

/** Ce que la route du QR d'inscription doit rendre pendant le test. */
interface SimulationQr {
  statut: number
  corps: unknown
}

const QR_SERVI = {
  registrationUrl: 'https://gabon.exemple/evenements/inscription/AbC123',
  qr: 'data:image/svg+xml;base64,UEFTLVVOLVZSQUktUVI=',
}

function servir(
  reponse: EvenementAdmin | null,
  statut = 200,
  qr: SimulationQr = { statut: 200, corps: { data: QR_SERVI } },
) {
  demandes = []
  envois = []
  vi.stubGlobal(
    'fetch',
    vi.fn((url: string, options: RequestInit = {}) => {
      demandes.push(String(url))
      const methode = options.method ?? 'GET'
      if (methode !== 'GET') {
        const corps = options.body ? JSON.parse(String(options.body)) : {}
        envois.push({ methode, url: String(url), corps })
      }
      const json = (code: number, contenu: unknown) =>
        Promise.resolve(
          new Response(JSON.stringify(contenu), {
            status: code,
            headers: { 'Content-Type': 'application/json' },
          }),
        )
      if (String(url).includes('registration-qr')) {
        return json(qr.statut, qr.corps)
      }
      const corps = reponse ? { data: reponse } : { message: "Cet évènement n'existe pas." }
      return json(statut, corps)
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
              { path: ':slug/presence', name: 'evenement-admin-presence', component: Vide },
              { path: ':slug/invites', name: 'evenement-admin-invites', component: Vide },
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

  it("n'annule qu'apres confirmation, et envoie l'etat annule seul", async () => {
    // L'annulation est visible des inscrits et du site public, et rien dans
    // l'ecran ne permet de revenir en arriere d'un clic. Le contrat exige
    // que `status` parte SEUL : tout autre champ a ses cotes vaut 422.
    servir(evenement())
    vi.stubGlobal(
      'confirm',
      vi.fn(() => true),
    )
    const wrapper = await rendre()
    await bouton(wrapper, "Annuler l'évènement")!.trigger('click')
    await flushPromises()

    expect(envois[envois.length - 1]!.methode).toBe('PATCH')
    expect(envois[envois.length - 1]!.corps).toEqual({ status: 'cancelled' })
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
    // Le back rend `cancelled` en minuscules : la fiche doit le reconnaitre
    // et le traduire, pas seulement la forme majuscule des fixtures.
    servir(evenement({ status: 'cancelled' }))
    const wrapper = await rendre()

    expect(bouton(wrapper, "Annuler l'évènement")).toBeUndefined()
    expect(wrapper.text()).toContain('Annulé')
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

  it('publie par POST sans corps, puis recharge la fiche', async () => {
    // La publication n'existe pas dans Ambassade Secure : elle vit cote CMS
    // et n'est pas relayee. La reponse du POST ne porte pas l'evenement :
    // l'etat reel se lit en rechargeant la fiche.
    servir(evenement({ isPublished: false }))
    const wrapper = await rendre()
    await bouton(wrapper, 'Publier sur le site')!.trigger('click')
    await flushPromises()

    const envoi = envois[envois.length - 1]!
    expect(envoi.methode).toBe('POST')
    expect(envoi.url).toBe('/api/admin/secure/events/fete-nationale/publication')
    expect(envoi.corps).toEqual({})
    expect(demandes[demandes.length - 1]).toBe('/api/admin/secure/events/fete-nationale')
  })

  it("n'affiche le QR qu'apres le geste, et par la route registration-qr", async () => {
    // L'URL d'inscription n'existe nulle part ailleurs dans les reponses
    // admin (`registrationUrl` en est retire volontairement) : la seule
    // source est cette route, et on ne l'appelle pas au montage — la
    // plupart des visites de la fiche n'en ont pas besoin.
    servir(evenement({ isPublished: true }))
    const wrapper = await rendre()

    expect(demandes.filter((d) => d.includes('registration-qr'))).toHaveLength(0)

    await bouton(wrapper, "Afficher le QR d'inscription")!.trigger('click')
    await flushPromises()

    expect(demandes[demandes.length - 1]).toBe(
      '/api/admin/secure/events/fete-nationale/registration-qr',
    )
    const image = wrapper.findAll('img').find((i) => i.attributes('alt') === "QR d'inscription")
    expect(image?.attributes('src')).toBe(QR_SERVI.qr)
    expect(wrapper.text()).toContain(QR_SERVI.registrationUrl)
  })

  it('invite a publier plutot que de proposer un QR sans page derriere', async () => {
    // La route rend 409 tant que l'evenement n'est pas publie : avant
    // publication, il n'existe aucune page d'inscription vers laquelle
    // pointer. L'ecran n'offre pas un geste voue a l'echec.
    servir(evenement({ isPublished: false }))
    const wrapper = await rendre()

    expect(bouton(wrapper, "Afficher le QR d'inscription")).toBeUndefined()
    expect(wrapper.text()).toContain("Publiez l'évènement pour obtenir son QR d'inscription")
  })

  it('masque toute la section QR quand le back ne sert pas la publication', async () => {
    // Sans `isPublished`, on ne sait pas si la page d'inscription existe :
    // meme discipline que la bascule de publication, la section disparait.
    const sansPublication = evenement()
    delete sansPublication.isPublished
    servir(sansPublication)
    const wrapper = await rendre()

    expect(wrapper.text()).not.toContain("QR d'inscription")
  })

  it('affiche le message du back quand le QR est refuse', async () => {
    // La fiche peut etre depassee par une depublication faite ailleurs : le
    // 409 revient avec un message en francais, affiche tel quel.
    servir(evenement({ isPublished: true }), 200, {
      statut: 409,
      corps: { message: "Publiez l'evenement avant de demander son QR." },
    })
    const wrapper = await rendre()
    await bouton(wrapper, "Afficher le QR d'inscription")!.trigger('click')
    await flushPromises()

    expect(wrapper.text()).toContain("Publiez l'evenement avant de demander son QR.")
  })

  it('retire le QR affiche quand l evenement est retire du site', async () => {
    // Depublier retire la page d'inscription : garder le QR a l'ecran
    // laisserait imprimer un lien mort.
    servir(evenement({ isPublished: true }))
    const wrapper = await rendre()
    await bouton(wrapper, "Afficher le QR d'inscription")!.trigger('click')
    await flushPromises()
    expect(wrapper.text()).toContain(QR_SERVI.registrationUrl)

    await bouton(wrapper, 'Retirer du site')!.trigger('click')
    await flushPromises()

    expect(wrapper.text()).not.toContain(QR_SERVI.registrationUrl)
  })

  it('retire du site par DELETE, puis recharge la fiche', async () => {
    servir(evenement({ isPublished: true }))
    const wrapper = await rendre()
    await bouton(wrapper, 'Retirer du site')!.trigger('click')
    await flushPromises()

    const envoi = envois[envois.length - 1]!
    expect(envoi.methode).toBe('DELETE')
    expect(envoi.url).toBe('/api/admin/secure/events/fete-nationale/publication')
    expect(demandes[demandes.length - 1]).toBe('/api/admin/secure/events/fete-nationale')
  })
})
