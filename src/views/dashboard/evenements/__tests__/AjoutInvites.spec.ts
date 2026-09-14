import { describe, it, expect, afterEach, vi } from 'vitest'
import { mount, flushPromises } from '@vue/test-utils'
import { createRouter, createMemoryHistory } from 'vue-router'
import { defineComponent, h } from 'vue'
import AjoutInvites from '../AjoutInvites.vue'

const Vide = defineComponent({ render: () => h('div') })

const PIXEL_PNG = 'data:image/png;base64,UEFTUy1QTkc='

interface Envoi {
  url: string
  corps: Record<string, unknown>
}

let envois: Envoi[] = []

interface SimulationLot {
  statut: number
  corps: unknown
}

function lotServi(invites: { firstName: string; lastName: string; email?: string }[]) {
  return {
    success: true,
    message: `${invites.length} pass emis.`,
    data: {
      event: { name: 'Fête nationale du Gabon', registeredCount: 120 + invites.length },
      passes: invites.map((invite, rang) => ({
        credential: {
          uidn: `GA9${String(rang + 1).padStart(5, '0')}`,
          holderName: `${invite.firstName} ${invite.lastName}`,
          holderEmail: invite.email ?? null,
        },
        qr: PIXEL_PNG,
      })),
    },
  }
}

function servir(lot?: SimulationLot) {
  envois = []
  vi.stubGlobal(
    'fetch',
    vi.fn((url: string, options: RequestInit = {}) => {
      const json = (code: number, contenu: unknown) =>
        Promise.resolve(
          new Response(JSON.stringify(contenu), {
            status: code,
            headers: { 'Content-Type': 'application/json' },
          }),
        )
      if ((options.method ?? 'GET') === 'POST') {
        const corps = options.body ? JSON.parse(String(options.body)) : {}
        envois.push({ url: String(url), corps })
        if (lot) return json(lot.statut, lot.corps)
        return json(201, lotServi((corps as { guests: never[] }).guests))
      }
      return json(200, { data: { name: 'Fête nationale du Gabon' } })
    }),
  )
}

async function rendre() {
  const routeur = createRouter({
    history: createMemoryHistory(),
    routes: [
      { path: '/', component: Vide },
      {
        path: '/dashboard/evenements',
        component: defineComponent({ render: () => h('div') }),
        children: [
          { path: '', name: 'evenements-admin', component: Vide },
          { path: ':slug', name: 'evenement-admin', component: Vide },
          { path: ':slug/invites', name: 'evenement-admin-invites', component: AjoutInvites },
        ],
      },
    ],
  })
  routeur.push('/dashboard/evenements/fete-nationale/invites')
  await routeur.isReady()
  const wrapper = mount(AjoutInvites, { global: { plugins: [routeur] } })
  await flushPromises()
  return wrapper
}

type Rendu = Awaited<ReturnType<typeof rendre>>

function bouton(wrapper: Rendu, fragment: string) {
  return wrapper.findAll('button').find((b) => b.text().includes(fragment))
}

/** Remplit la ligne `rang` du formulaire. */
async function saisir(
  wrapper: Rendu,
  rang: number,
  invite: { firstName?: string; lastName?: string; email?: string },
) {
  const champs = wrapper.findAll('fieldset')[rang]!.findAll('input')
  if (invite.firstName !== undefined) await champs[0]!.setValue(invite.firstName)
  if (invite.lastName !== undefined) await champs[1]!.setValue(invite.lastName)
  if (invite.email !== undefined) await champs[2]!.setValue(invite.email)
}

describe('ajout d invites', () => {
  afterEach(() => {
    vi.unstubAllGlobals()
  })

  it('envoie le lot sous `guests` et omet le courriel vide plutot que de l envoyer', async () => {
    servir()
    const wrapper = await rendre()
    await saisir(wrapper, 0, { firstName: 'Awa', lastName: 'Kone' })
    await bouton(wrapper, 'Ajouter une ligne')!.trigger('click')
    await saisir(wrapper, 1, {
      firstName: 'Moussa',
      lastName: 'Camara',
      email: 'moussa@exemple.test',
    })

    await wrapper.find('form').trigger('submit')
    await flushPromises()

    expect(envois).toHaveLength(1)
    expect(envois[0]!.url).toContain('/api/admin/secure/events/fete-nationale/guests')
    expect(envois[0]!.corps).toEqual({
      guests: [
        { firstName: 'Awa', lastName: 'Kone' },
        { firstName: 'Moussa', lastName: 'Camara', email: 'moussa@exemple.test' },
      ],
    })
  })

  it('affiche un pass par invite, dans l ordre, avec son QR PNG', async () => {
    servir()
    const wrapper = await rendre()
    await saisir(wrapper, 0, { firstName: 'Awa', lastName: 'Kone' })
    await wrapper.find('form').trigger('submit')
    await flushPromises()

    expect(wrapper.text()).toContain('1 pass créé')
    expect(wrapper.text()).toContain('Awa Kone')
    expect(wrapper.text()).toContain('GA900001')
    expect(wrapper.text()).toContain('121 inscrits')
    const sources = wrapper.findAll('img').map((image) => image.attributes('src'))
    expect(sources).toContain(PIXEL_PNG)
  })

  it('refuse localement une ligne sans nom, sans rien envoyer au back', async () => {
    servir()
    const wrapper = await rendre()
    await saisir(wrapper, 0, { firstName: 'Awa' })
    await wrapper.find('form').trigger('submit')
    await flushPromises()

    expect(envois).toHaveLength(0)
    expect(wrapper.text()).toContain('Ce champ est obligatoire.')
  })

  it('range les erreurs 422 du back sous la ligne fautive', async () => {
    servir({
      statut: 422,
      corps: {
        message: 'Les donnees fournies sont invalides.',
        errors: { 'guests.1.email': ['Ce courriel est invalide.'] },
      },
    })
    const wrapper = await rendre()
    await saisir(wrapper, 0, { firstName: 'Awa', lastName: 'Kone' })
    await bouton(wrapper, 'Ajouter une ligne')!.trigger('click')
    await saisir(wrapper, 1, { firstName: 'Moussa', lastName: 'Camara', email: 'pas-un-courriel' })
    await wrapper.find('form').trigger('submit')
    await flushPromises()

    const secondeLigne = wrapper.findAll('fieldset')[1]!
    expect(secondeLigne.text()).toContain('Ce courriel est invalide.')
    const premiereLigne = wrapper.findAll('fieldset')[0]!
    expect(premiereLigne.text()).not.toContain('Ce courriel est invalide.')
  })

  it('affiche un refus amont en bandeau et garde le lot saisi : rien n a ete cree', async () => {
    servir({
      statut: 422,
      corps: { message: "L'evenement est annule : aucun pass ne peut etre emis." },
    })
    const wrapper = await rendre()
    await saisir(wrapper, 0, { firstName: 'Awa', lastName: 'Kone' })
    await wrapper.find('form').trigger('submit')
    await flushPromises()

    expect(wrapper.text()).toContain("L'evenement est annule")
    // Le lot est tout ou rien cote SecureCheck : le formulaire reste tel
    // quel, pour corriger et renvoyer sans tout ressaisir.
    expect((wrapper.find('input').element as HTMLInputElement).value).toBe('Awa')
  })

  it('ramene le formulaire apres « Ajouter d autres invités »', async () => {
    servir()
    const wrapper = await rendre()
    await saisir(wrapper, 0, { firstName: 'Awa', lastName: 'Kone' })
    await wrapper.find('form').trigger('submit')
    await flushPromises()

    await bouton(wrapper, "Ajouter d'autres invités")!.trigger('click')
    await flushPromises()

    expect(wrapper.find('form').exists()).toBe(true)
    expect((wrapper.find('input').element as HTMLInputElement).value).toBe('')
  })
})
