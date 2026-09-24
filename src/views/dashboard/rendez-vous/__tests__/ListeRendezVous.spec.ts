import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest'
import { flushPromises, mount } from '@vue/test-utils'
import ListeRendezVous from '../ListeRendezVous.vue'
import ChampSelect, { type OptionSelect } from '@/components/ui/ChampSelect.vue'

const EN_ATTENTE = {
  reference: 'rdv-abc123',
  status: 'pending',
  kind: 'external',
  // Volontairement decalee : un ecran qui la remettrait dans le fuseau du
  // navigateur afficherait 11:30 a Paris.
  scheduledAt: '2026-10-02T09:30:00.000Z',
  department: { slug: 'q4k2m9xv0bt7ra1', name: 'Protocole' },
  purpose: 'Depot de dossier',
  host: null,
  visitor: {
    firstName: 'Awa',
    lastName: 'Diallo',
    email: 'awa@exemple.test',
    phone: '+224600000000',
    idNumber: 'GN-1234',
  },
  hasIdCardFront: true,
  hasIdCardBack: false,
  rejectionReason: null,
  checkInAt: null,
  checkOutAt: null,
  durationMinutes: null,
  createdAt: '2026-09-23T10:00:00.000Z',
  qr: null,
}

const CONFIRMEE = { ...EN_ATTENTE, reference: 'rdv-def456', status: 'approved' }

function servir(corps: unknown, statut = 200) {
  return vi.fn().mockImplementation(
    async () =>
      new Response(JSON.stringify(corps), {
        status: statut,
        headers: { 'Content-Type': 'application/json' },
      }),
  )
}

async function monter(lignes: unknown[] = [EN_ATTENTE, CONFIRMEE]) {
  vi.stubGlobal('fetch', servir({ data: lignes }))
  const wrapper = mount(ListeRendezVous)
  await flushPromises()
  return wrapper
}

describe('consultation des rendez-vous', () => {
  beforeEach(() => {
    vi.stubGlobal('URL', { ...URL, createObjectURL: vi.fn(), revokeObjectURL: vi.fn() })
  })

  afterEach(() => {
    vi.unstubAllGlobals()
  })

  it("affiche l'heure telle qu'elle arrive", async () => {
    const wrapper = await monter([EN_ATTENTE])
    const texte = wrapper.text()
    expect(texte).toContain('02/10/2026')
    expect(texte).toContain('09:30')
    expect(texte).not.toContain('11:30')
  })

  it("ne propose pas « annulé » dans le filtre d'état", async () => {
    const wrapper = await monter()
    const options = wrapper.getComponent(ChampSelect).props('options') as readonly OptionSelect[]
    expect(options.map((option) => option.libelle)).not.toContain('Annulé')
    expect(options).toHaveLength(5)
  })

  it('ne telecharge aucune piece a l ouverture du detail', async () => {
    // Chaque piece coute en amont une requete de liste complete, pieces
    // base64 comprises, et la route est bornee a 30 appels par minute :
    // ouvrir les deux faces de chaque ligne epuiserait le quota en un ecran.
    const wrapper = await monter([EN_ATTENTE])
    const appelsApresListe = vi.mocked(fetch).mock.calls.length

    await wrapper.get('tbody:last-of-type button').trigger('click')
    await flushPromises()

    expect(vi.mocked(fetch).mock.calls.length).toBe(appelsApresListe)
    expect(wrapper.text()).toContain('Afficher le recto')
    expect(wrapper.text()).toContain('Verso non fourni')
  })

  it('ne recharge pas la demande a l ouverture du panneau', async () => {
    // La route de detail rend exactement les memes champs que la ligne de
    // liste, et coute en amont une liste complete de plus.
    const wrapper = await monter([EN_ATTENTE])
    const appels = vi.mocked(fetch).mock.calls.length
    await wrapper.get('tbody:last-of-type button').trigger('click')
    await flushPromises()
    expect(vi.mocked(fetch).mock.calls.length).toBe(appels)
  })

  it('offre les deux gestes sur une demande en attente', async () => {
    const wrapper = await monter([EN_ATTENTE])
    await wrapper.get('tbody:last-of-type button').trigger('click')
    await flushPromises()

    const texte = wrapper.text()
    expect(texte).toContain('Approuver')
    expect(texte).toContain('Refuser')
  })

  it("retire les deux gestes des qu'une demande n'est plus en attente", async () => {
    // Ils sont a sens unique depuis « en attente » : deux boutons qui
    // rendraient un 422 valent moins que pas de bouton.
    const wrapper = await monter([CONFIRMEE])
    await wrapper.get('tbody:last-of-type button').trigger('click')
    await flushPromises()

    const texte = wrapper.text()
    expect(texte).not.toContain('Approuver')
    expect(texte).not.toContain('Refuser')
  })

  it("demande confirmation avant d'approuver, puisque le visiteur est prevenu", async () => {
    const wrapper = await monter([EN_ATTENTE])
    await wrapper.get('tbody:last-of-type button').trigger('click')
    await flushPromises()

    const boutons = wrapper.findAll('button')
    const approuver = boutons.find((bouton) => bouton.text() === 'Approuver')!
    await approuver.trigger('click')
    await flushPromises()

    // Rien n'est parti tant que la confirmation n'est pas validee.
    expect(vi.mocked(fetch).mock.calls).toHaveLength(1)
    expect(wrapper.text()).toContain('laissez-passer par courriel')
  })

  it('refuse un motif vide sans appeler le serveur', async () => {
    const wrapper = await monter([EN_ATTENTE])
    await wrapper.get('tbody:last-of-type button').trigger('click')
    await flushPromises()

    const refuser = wrapper.findAll('button').find((bouton) => bouton.text() === 'Refuser')!
    await refuser.trigger('click')
    const envoyer = wrapper
      .findAll('button')
      .find((bouton) => bouton.text() === 'Refuser la demande')!
    await envoyer.trigger('click')
    await flushPromises()

    expect(vi.mocked(fetch).mock.calls).toHaveLength(1)
    expect(wrapper.text()).toContain('Indiquez le motif du refus')
  })

  it('remplace la ligne traitee sans recharger toute la liste', async () => {
    const wrapper = await monter([EN_ATTENTE])
    await wrapper.get('tbody:last-of-type button').trigger('click')
    await flushPromises()

    const refuser = wrapper.findAll('button').find((bouton) => bouton.text() === 'Refuser')!
    await refuser.trigger('click')
    await wrapper.get('#rdv-motif').setValue('Dossier incomplet')

    vi.stubGlobal(
      'fetch',
      servir({ data: { ...EN_ATTENTE, status: 'rejected', rejectionReason: 'Dossier incomplet' } }),
    )
    const envoyer = wrapper
      .findAll('button')
      .find((bouton) => bouton.text() === 'Refuser la demande')!
    await envoyer.trigger('click')
    await flushPromises()

    // Un seul appel : le refus. Pas de rechargement de liste derriere, qui
    // couterait en amont une liste complete de plus.
    expect(vi.mocked(fetch).mock.calls).toHaveLength(1)
    expect(wrapper.text()).toContain('Refusé')
    expect(wrapper.text()).not.toContain('Approuver')
  })

  it("nomme le refus de role plutot que d'annoncer une panne", async () => {
    vi.stubGlobal('fetch', servir({ message: 'Interdit.' }, 403))
    const wrapper = mount(ListeRendezVous)
    await flushPromises()

    expect(wrapper.text()).toContain("Vous n'avez pas accès")
  })
})
