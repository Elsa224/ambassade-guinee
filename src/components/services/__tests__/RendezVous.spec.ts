import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest'
import { mount, flushPromises } from '@vue/test-utils'
import { createPinia, setActivePinia } from 'pinia'
import RendezVous from '../RendezVous.vue'
import { useTenantStore } from '@/stores/tenant'
import { GABON } from '@/api/fixtures/tenants'
import ChampSelect from '@/components/ui/ChampSelect.vue'

/**
 * Le composant etait une maquette : il attendait une seconde et demie, ecrivait
 * la demande dans la console, puis affichait « enregistree avec succes ». La
 * demande du citoyen etait jetee et il repartait en croyant avoir un
 * rendez-vous consulaire. Ces tests portent donc tous sur le meme point : rien
 * ne se confirme sans reponse du serveur.
 */

function reponse(corps: unknown, statut = 200) {
  return new Response(statut === 204 ? null : JSON.stringify(corps), {
    status: statut,
    headers: { 'Content-Type': 'application/json' },
  })
}

const SERVICES = {
  data: {
    platform: null,
    services: [
      {
        id: 1,
        slug: 'passeport',
        title: 'Passeport',
        summary: null,
        icon: 'passeport',
        delay: null,
        fee: null,
        body_html: '<p>.</p>',
        position: 1,
      },
    ],
  },
}

/** Le journal des envois, et la reponse que le serveur donnera au POST. */
function servir(envoi: () => Response) {
  const appels: { adresse: string; methode: string; corps: unknown }[] = []
  vi.stubGlobal(
    'fetch',
    vi.fn((url: string, options?: RequestInit) => {
      const methode = options?.method ?? 'GET'
      if (methode === 'POST') {
        appels.push({
          adresse: String(url),
          methode,
          corps: options?.body === undefined ? null : JSON.parse(String(options.body)),
        })
        return Promise.resolve(envoi())
      }
      return Promise.resolve(reponse(SERVICES))
    }),
  )
  return appels
}

const ACCUSE = () =>
  reponse(
    {
      data: { reference: 'RDV-2026-000123', status: 'nouveau', created_at: '2026-09-18T10:00:00Z' },
    },
    201,
  )

async function monter() {
  useTenantStore().embassy = GABON
  const wrapper = mount(RendezVous)
  await flushPromises()
  return wrapper
}

/** Remplit les champs obligatoires et envoie. */
async function remplirEtEnvoyer(wrapper: Awaited<ReturnType<typeof monter>>) {
  // Les quatre champs de saisie simple, dans l'ordre du formulaire.
  const champs = wrapper.findAll('input')
  await champs[0]!.setValue('Camara')
  await champs[1]!.setValue('Aya')
  await champs[2]!.setValue('aya@example.org')
  await champs[3]!.setValue('+224 000 00 00 00')
  await wrapper.find('form').trigger('submit')
  await flushPromises()
}

describe('prise de rendez-vous', () => {
  beforeEach(() => {
    setActivePinia(createPinia())
  })

  afterEach(() => {
    vi.unstubAllGlobals()
  })

  it("envoie vraiment la demande, a l'adresse du contrat", async () => {
    const appels = servir(ACCUSE)

    const wrapper = await monter()
    await remplirEtEnvoyer(wrapper)

    const envoi = appels.find((appel) => appel.adresse.includes('/api/content/appointments'))
    expect(envoi).toBeDefined()
    expect(envoi!.corps).toMatchObject({ last_name: 'Camara', first_name: 'Aya' })
  })

  it("n'affiche la confirmation qu'apres la reponse du serveur, avec sa reference", async () => {
    servir(ACCUSE)

    const wrapper = await monter()
    expect(wrapper.text()).not.toContain('Demande enregistrée')

    await remplirEtEnvoyer(wrapper)

    expect(wrapper.text()).toContain('Demande enregistrée')
    expect(wrapper.text()).toContain('RDV-2026-000123')
  })

  it('ne confirme rien quand le serveur refuse', async () => {
    // C'est le defaut d'origine : la maquette confirmait sans avoir envoye.
    servir(() =>
      reponse(
        {
          message: 'Les données fournies sont invalides.',
          errors: { preferred_date: ['La date doit être postérieure de deux jours.'] },
        },
        422,
      ),
    )

    const wrapper = await monter()
    await remplirEtEnvoyer(wrapper)

    expect(wrapper.text()).not.toContain('Demande enregistrée')
    expect(wrapper.text()).toContain('La date doit être postérieure de deux jours.')
  })

  it("dit qu'il y a eu trop de demandes, et non qu'il y a une panne", async () => {
    // La route est anonyme : le back la limite par adresse IP. Annoncer une
    // panne ferait renvoyer aussitot, pour un nouveau refus.
    servir(() => reponse({ message: 'Too Many Attempts.' }, 429))

    const wrapper = await monter()
    await remplirEtEnvoyer(wrapper)

    expect(wrapper.text()).toContain('Trop de demandes')
    expect(wrapper.text()).not.toContain('Demande enregistrée')
  })

  it('ne confirme rien quand le reseau tombe', async () => {
    vi.stubGlobal('fetch', vi.fn().mockRejectedValue(new Error('reseau')))

    const wrapper = await monter()
    await remplirEtEnvoyer(wrapper)

    expect(wrapper.text()).not.toContain('Demande enregistrée')
    expect(wrapper.text()).toContain("n'a pas pu être envoyée")
  })

  it("porte les coordonnees de l'ambassade, et non celles du gabarit", async () => {
    // La barre laterale annoncait un numero de Washington, une adresse de
    // Washington et le courriel de l'ambassade de Guinee aux Etats-Unis : la
    // rubrique aurait ouvert une cinquieme fuite d'identite.
    servir(ACCUSE)

    const wrapper = await monter()

    const texte = wrapper.text()
    expect(texte).toContain('ambassade@gabon-gn.org')
    expect(texte).toContain('Du lundi au vendredi, 8h - 16h')
    expect(texte).not.toContain('ambaguinee-usa.org')
    expect(texte).not.toContain('Leroy Place')
    expect(texte).not.toContain('(202) 986-4300')
    // Le drapeau guineen etait ecrit en dur dans l'en-tete de la page.
    expect(wrapper.html()).not.toContain('\u{1F1EC}\u{1F1F3}')
  })

  it('ne propose que les services que l ambassade a publies', async () => {
    servir(ACCUSE)

    const wrapper = await monter()

    // La liste ne s'ouvre qu'au clic : on lit les options servies au champ,
    // et non le balisage. Elle etait ecrite en dur et proposait des services
    // qu'une ambassade n'assure pas forcement.
    const options = wrapper.findComponent(ChampSelect).props('options') as {
      valeur: string
      libelle: string
    }[]
    expect(options.map((option) => option.libelle)).toEqual([
      'Sélectionnez un service',
      'Passeport',
      'Autre service',
    ])
  })
})
