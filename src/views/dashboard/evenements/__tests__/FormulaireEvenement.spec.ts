import { describe, it, expect, afterEach, vi } from 'vitest'
import { mount, flushPromises } from '@vue/test-utils'
import { createRouter, createMemoryHistory, RouterView } from 'vue-router'
import { defineComponent, h } from 'vue'
import FormulaireEvenement from '../FormulaireEvenement.vue'
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
    logoUrl: null,
    registrationOpen: true,
    registrationDeadline: '2026-08-14',
    capacity: 200,
    registeredCount: 120,
    spotsRemaining: 80,
    typeLabel: 'Fête nationale',
    participants: [],
    ...partiel,
  }
}

/** Ce que le formulaire a envoye : methode, chemin et corps deserialise. */
interface Envoi {
  methode: string
  url: string
  corps: Record<string, unknown>
}

let envois: Envoi[] = []

interface Simulation {
  types?: { slug: string; label: string }[] | 'panne'
  charge?: EvenementAdmin
  reponse?: EvenementAdmin
  statut?: number
  corpsErreur?: unknown
}

function servir(simulation: Simulation = {}) {
  envois = []
  vi.stubGlobal(
    'fetch',
    vi.fn((url: string, options: RequestInit = {}) => {
      const methode = options.method ?? 'GET'
      const adresse = String(url)
      if (options.body) {
        envois.push({ methode, url: adresse, corps: JSON.parse(String(options.body)) })
      }

      const json = (statut: number, corps: unknown) =>
        Promise.resolve(
          new Response(JSON.stringify(corps), {
            status: statut,
            headers: { 'Content-Type': 'application/json' },
          }),
        )

      if (adresse.includes('event-types')) {
        if (simulation.types === 'panne') return json(500, { message: 'Indisponible' })
        return json(200, { data: simulation.types ?? [] })
      }
      if (methode === 'GET') {
        return json(200, { data: simulation.charge ?? evenement() })
      }
      const statut = simulation.statut ?? 200
      if (statut >= 400) return json(statut, simulation.corpsErreur ?? { message: 'Refusé' })
      return json(statut, { data: simulation.reponse ?? evenement() })
    }),
  )
}

/**
 * Traverse, comme `RacineEvenements` dans l'application.
 *
 * Monter le formulaire a nu ne suffit pas : `onBeforeRouteLeave` ne
 * s'enregistre que dans un composant enfant d'un `<router-view>`. Un test qui
 * le monterait directement verrait la garde ne jamais se declencher et
 * conclurait a tort qu'elle n'existe pas.
 */
const Traverse = defineComponent({ render: () => h(RouterView) })

/**
 * Monte le formulaire derriere le routeur IMBRIQUE de l'application.
 *
 * Meme raison que pour la fiche : la creation et la modification sont des
 * enfants de la rubrique, pas des routes soeurs. Un routeur a plat ne
 * prouverait pas ce que l'application fait, et masquerait une redirection
 * qui n'atterrit pas ou on croit.
 */
async function rendre(adresse = '/dashboard/evenements/nouveau') {
  const routeur = createRouter({
    history: createMemoryHistory(),
    routes: [
      { path: '/', component: Vide },
      {
        path: '/dashboard',
        component: Traverse,
        children: [
          {
            path: 'evenements',
            component: Traverse,
            children: [
              { path: '', name: 'evenements-admin', component: Vide },
              { path: 'nouveau', name: 'evenement-admin-nouveau', component: FormulaireEvenement },
              { path: ':slug', name: 'evenement-admin', component: Vide },
              {
                path: ':slug/modifier',
                name: 'evenement-admin-modifier',
                component: FormulaireEvenement,
              },
            ],
          },
        ],
      },
    ],
  })
  routeur.push(adresse)
  await routeur.isReady()
  const wrapper = mount(Traverse, { global: { plugins: [routeur] } })
  await flushPromises()
  return { wrapper, routeur }
}

/** Remplit les quatre champs requis pour que l'envoi ne soit pas refuse. */
async function remplirMinimum(wrapper: Awaited<ReturnType<typeof rendre>>['wrapper']) {
  await wrapper.find('#champ-nom').setValue('Journée portes ouvertes')
  await wrapper.find('#champ-date').setValue('2026-10-02')
  await wrapper.find('#champ-heure').setValue('09:00')
  await wrapper.find('#champ-lieu').setValue('Chancellerie, Conakry')
}

async function envoyer(wrapper: Awaited<ReturnType<typeof rendre>>['wrapper']) {
  await wrapper.find('form').trigger('submit')
  await flushPromises()
}

/** Le dernier envoi. `Array.at` n'est pas dans la cible TypeScript ici. */
function dernierEnvoi(): Envoi {
  return envois[envois.length - 1]!
}

describe('formulaire d un evenement', () => {
  afterEach(() => {
    vi.unstubAllGlobals()
  })

  it('envoie le slug du type, jamais son libelle', async () => {
    // C'est l'asymetrie du contrat : on ecrit `typeEventSlug`, on lit
    // `typeLabel`. Envoyer « Fête nationale » la ou le back attend
    // « fete-nationale » echouerait a chaque creation typee.
    servir({ types: [{ slug: 'fete-nationale', label: 'Fête nationale' }] })
    const { wrapper } = await rendre()
    await remplirMinimum(wrapper)
    await wrapper.find('#champ-type').setValue('fete-nationale')
    await envoyer(wrapper)

    expect(dernierEnvoi().corps.typeEventSlug).toBe('fete-nationale')
    expect(dernierEnvoi().corps).not.toHaveProperty('typeLabel')
  })

  it('redirige vers la fiche avec le slug rendu par le back', async () => {
    // Le slug est attribue par le serveur, qui seul sait ce qu'il a retenu en
    // cas d'homonyme. Le recalculer localement menerait a une fiche absente.
    servir({ reponse: evenement({ slug: 'journee-portes-ouvertes-2' }) })
    const { wrapper, routeur } = await rendre()
    await remplirMinimum(wrapper)
    await envoyer(wrapper)

    expect(routeur.currentRoute.value.path).toBe('/dashboard/evenements/journee-portes-ouvertes-2')
  })

  it('envoie une capacite nulle quand l evenement est sans limite', async () => {
    // `null` n'est pas un champ vide : il dit « autant d'inscrits qu'il s'en
    // presentera ». Envoyer 0 fermerait l'evenement.
    servir()
    const { wrapper } = await rendre()
    await remplirMinimum(wrapper)
    await envoyer(wrapper)

    expect(dernierEnvoi().corps.capacity).toBeNull()
  })

  it('envoie la capacite saisie quand la limite est retablie', async () => {
    servir()
    const { wrapper } = await rendre()
    await remplirMinimum(wrapper)
    await wrapper.find('#champ-sans-limite').setValue(false)
    await wrapper.find('#champ-capacite').setValue('250')
    await envoyer(wrapper)

    expect(dernierEnvoi().corps.capacity).toBe(250)
  })

  it('place chaque message de validation sous son champ', async () => {
    // Un bandeau general obligerait l'agent a relire les dix champs pour
    // trouver celui qui pose probleme.
    servir({
      statut: 422,
      corpsErreur: {
        message: 'Les données fournies sont invalides.',
        errors: { location: ['Le lieu est obligatoire.'] },
      },
    })
    const { wrapper } = await rendre()
    await remplirMinimum(wrapper)
    await envoyer(wrapper)

    const bloc = wrapper.find('#champ-lieu').element.parentElement
    expect(bloc?.textContent).toContain('Le lieu est obligatoire.')
  })

  it('retire le champ Type quand le back ne sert aucun type', async () => {
    // Meme discipline que la colonne de publication : un menu deroulant vide
    // ferait chercher a l'agent ce qui n'y est pas.
    servir({ types: [] })
    const { wrapper } = await rendre()

    expect(wrapper.find('#champ-type').exists()).toBe(false)
  })

  it('reste utilisable quand la route des types est en panne', async () => {
    servir({ types: 'panne' })
    const { wrapper } = await rendre()

    expect(wrapper.find('#champ-type').exists()).toBe(false)
    expect(wrapper.find('#champ-nom').exists()).toBe(true)
  })

  it('pre-remplit la modification et retrouve le slug du type par son libelle', async () => {
    // La lecture ne rend que `typeLabel` : sans cette correspondance, ouvrir
    // un evenement type et l'enregistrer sans y toucher lui retirerait son
    // type.
    servir({
      types: [{ slug: 'fete-nationale', label: 'Fête nationale' }],
      charge: evenement(),
    })
    const { wrapper } = await rendre('/dashboard/evenements/fete-nationale/modifier')

    expect((wrapper.find('#champ-nom').element as HTMLInputElement).value).toBe(
      'Fête nationale du Gabon',
    )
    await envoyer(wrapper)
    expect(dernierEnvoi().corps.typeEventSlug).toBe('fete-nationale')
  })

  it('modifie par PATCH sur l adresse de l evenement', async () => {
    servir({ charge: evenement() })
    const { wrapper } = await rendre('/dashboard/evenements/fete-nationale/modifier')
    await envoyer(wrapper)

    expect(dernierEnvoi().methode).toBe('PATCH')
    expect(dernierEnvoi().url).toBe('/api/admin/secure/events/fete-nationale')
  })

  it('previent avant d abandonner une saisie non enregistree', async () => {
    servir()
    const confirmation = vi.fn(() => false)
    vi.stubGlobal('confirm', confirmation)
    const { wrapper, routeur } = await rendre()
    await wrapper.find('#champ-nom').setValue('Brouillon en cours')

    await routeur.push('/dashboard/evenements')
    await flushPromises()

    expect(confirmation).toHaveBeenCalled()
    expect(routeur.currentRoute.value.path).toBe('/dashboard/evenements/nouveau')
  })

  it('laisse partir un formulaire auquel on n a pas touche', async () => {
    servir()
    const confirmation = vi.fn(() => false)
    vi.stubGlobal('confirm', confirmation)
    const { routeur } = await rendre()

    await routeur.push('/dashboard/evenements')
    await flushPromises()

    expect(confirmation).not.toHaveBeenCalled()
    expect(routeur.currentRoute.value.path).toBe('/dashboard/evenements')
  })
})
