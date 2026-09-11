import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest'
import { mount, flushPromises } from '@vue/test-utils'
import { createRouter, createMemoryHistory } from 'vue-router'
import { createPinia, setActivePinia } from 'pinia'
import { defineComponent, h } from 'vue'
import InscriptionEvenement from '../InscriptionEvenement.vue'
import evenementsFixture from '@/api/fixtures/evenements.json'

const OUVERT = evenementsFixture.data.find((e) => e.publicToken === 'AbC123ouvert')!
const CLOS = evenementsFixture.data.find((e) => e.publicToken === 'DeF456complet')!
const SANS_LIMITE = evenementsFixture.data.find((e) => e.publicToken === 'GhI789illimite')!

const Vide = defineComponent({ render: () => h('div') })

function reponse(corps: unknown, statut = 200) {
  return new Response(JSON.stringify(corps), {
    status: statut,
    headers: { 'Content-Type': 'application/json' },
  })
}

async function monter(token: string) {
  const routeur = createRouter({
    history: createMemoryHistory(),
    routes: [
      { path: '/', component: Vide },
      { path: '/evenements/inscription/:token', component: InscriptionEvenement },
    ],
  })
  routeur.push(`/evenements/inscription/${token}`)
  await routeur.isReady()
  const wrapper = mount(InscriptionEvenement, { global: { plugins: [routeur] } })
  await flushPromises()
  return wrapper
}

async function remplirEtEnvoyer(
  wrapper: Awaited<ReturnType<typeof monter>>,
  nom = 'Aissatou Diallo',
  courriel = 'aissatou@example.org',
) {
  await wrapper.find('#nom').setValue(nom)
  await wrapper.find('#courriel').setValue(courriel)
  await wrapper.find('form').trigger('submit')
  await flushPromises()
}

describe("page publique d'inscription a un evenement", () => {
  beforeEach(() => {
    setActivePinia(createPinia())
    vi.stubGlobal('fetch', vi.fn())
  })

  afterEach(() => {
    vi.unstubAllGlobals()
  })

  it('demande la carte de l evenement designe par le jeton de l URL', async () => {
    vi.mocked(fetch).mockResolvedValue(reponse({ data: OUVERT }))

    await monter('AbC123ouvert')

    expect(vi.mocked(fetch).mock.calls[0]![0]).toBe('/api/secure/events/AbC123ouvert')
  })

  it('affiche la carte et le formulaire quand les inscriptions sont ouvertes', async () => {
    vi.mocked(fetch).mockResolvedValue(reponse({ data: OUVERT }))

    const wrapper = await monter('AbC123ouvert')

    expect(wrapper.text()).toContain(OUVERT.name)
    expect(wrapper.text()).toContain(OUVERT.location)
    expect(wrapper.find('form').exists()).toBe(true)
  })

  it('affiche l evenement sans formulaire quand les inscriptions sont closes', async () => {
    vi.mocked(fetch).mockResolvedValue(reponse({ data: CLOS }))

    const wrapper = await monter('DeF456complet')

    // La carte reste visible : le visiteur doit comprendre de quel evenement
    // il s'agit, meme s'il ne peut plus s'inscrire.
    expect(wrapper.text()).toContain(CLOS.name)
    expect(wrapper.text()).toContain('Les inscriptions sont closes')
    expect(wrapper.find('form').exists()).toBe(false)
  })

  it('se fie a isRegistrationClosed sans le recalculer', async () => {
    // Champs contradictoires : inscriptions ouvertes, places restantes, mais
    // le back declare l'inscription close. C'est lui qui tranche.
    const contradictoire = {
      ...OUVERT,
      registrationOpen: true,
      spotsRemaining: 10,
      isRegistrationClosed: true,
    }
    vi.mocked(fetch).mockResolvedValue(reponse({ data: contradictoire }))

    const wrapper = await monter('AbC123ouvert')

    expect(wrapper.find('form').exists()).toBe(false)
  })

  it('masque le nombre de places quand la capacite est illimitee', async () => {
    vi.mocked(fetch).mockResolvedValue(reponse({ data: SANS_LIMITE }))

    const wrapper = await monter('GhI789illimite')

    expect(wrapper.text()).not.toContain('place')
  })

  it('poste l inscription sur la route du jeton', async () => {
    vi.mocked(fetch)
      .mockResolvedValueOnce(reponse({ data: OUVERT }))
      .mockResolvedValueOnce(reponse({ data: { registered: true } }, 201))

    const wrapper = await monter('AbC123ouvert')
    await remplirEtEnvoyer(wrapper)

    const [url, options] = vi.mocked(fetch).mock.calls[1]!
    expect(url).toBe('/api/secure/events/AbC123ouvert/register')
    expect(options?.method).toBe('POST')
    expect(JSON.parse(String(options?.body))).toEqual({
      fullName: 'Aissatou Diallo',
      email: 'aissatou@example.org',
    })
  })

  it('confirme l inscription reussie', async () => {
    vi.mocked(fetch)
      .mockResolvedValueOnce(reponse({ data: OUVERT }))
      .mockResolvedValueOnce(reponse({ data: { registered: true } }, 201))

    const wrapper = await monter('AbC123ouvert')
    await remplirEtEnvoyer(wrapper)

    expect(wrapper.text()).toContain('Votre inscription est enregistrée')
    expect(wrapper.find('form').exists()).toBe(false)
  })

  it('n envoie rien tant que les champs obligatoires sont vides', async () => {
    vi.mocked(fetch).mockResolvedValue(reponse({ data: OUVERT }))

    const wrapper = await monter('AbC123ouvert')
    await wrapper.find('form').trigger('submit')
    await flushPromises()

    expect(vi.mocked(fetch)).toHaveBeenCalledTimes(1)
    expect(wrapper.text()).toContain('Indiquez votre nom complet')
  })

  it('omet le telephone du corps quand il n est pas renseigne', async () => {
    vi.mocked(fetch)
      .mockResolvedValueOnce(reponse({ data: OUVERT }))
      .mockResolvedValueOnce(reponse({ data: { registered: true } }, 201))

    const wrapper = await monter('AbC123ouvert')
    await remplirEtEnvoyer(wrapper)

    expect(JSON.parse(String(vi.mocked(fetch).mock.calls[1]![1]?.body))).not.toHaveProperty('phone')
  })

  describe('contrat d erreur', () => {
    it('presente un lien invalide comme tel (404)', async () => {
      vi.mocked(fetch).mockResolvedValue(reponse({ message: 'Introuvable.' }, 404))

      const wrapper = await monter('jeton-inconnu')

      expect(wrapper.text()).toContain("Cet évènement n'est pas disponible")
      expect(wrapper.text()).toContain("Ce lien n'est plus valable")
    })

    it('recharge la carte quand l inscription devient impossible (409)', async () => {
      vi.mocked(fetch)
        .mockResolvedValueOnce(reponse({ data: OUVERT }))
        .mockResolvedValueOnce(reponse({ message: 'Évènement complet.' }, 409))
        .mockResolvedValueOnce(reponse({ data: CLOS }))

      const wrapper = await monter('AbC123ouvert')
      await remplirEtEnvoyer(wrapper)

      // Sans ce rechargement, le formulaire resterait ouvert sur un evenement
      // qui n'accepte plus personne.
      expect(vi.mocked(fetch)).toHaveBeenCalledTimes(3)
      expect(wrapper.find('form').exists()).toBe(false)
      expect(wrapper.text()).toContain('Les inscriptions sont closes')
    })

    it('affiche le message de validation du serveur (422)', async () => {
      vi.mocked(fetch)
        .mockResolvedValueOnce(reponse({ data: OUVERT }))
        .mockResolvedValueOnce(reponse({ message: 'Adresse électronique déjà inscrite.' }, 422))

      const wrapper = await monter('AbC123ouvert')
      await remplirEtEnvoyer(wrapper)

      expect(wrapper.text()).toContain('Adresse électronique déjà inscrite')
      expect(wrapper.find('form').exists()).toBe(true)
    })

    it('invite a patienter en cas de limitation de debit (429)', async () => {
      vi.mocked(fetch)
        .mockResolvedValueOnce(reponse({ data: OUVERT }))
        .mockResolvedValueOnce(reponse({ message: 'Trop de tentatives.' }, 429))

      const wrapper = await monter('AbC123ouvert')
      await remplirEtEnvoyer(wrapper)

      expect(wrapper.text()).toContain('Trop de tentatives')
      expect(wrapper.find('form').exists()).toBe(true)
    })

    it('presente une panne de service sans accuser la saisie (502)', async () => {
      vi.mocked(fetch)
        .mockResolvedValueOnce(reponse({ data: OUVERT }))
        .mockResolvedValueOnce(reponse({ message: 'Service indisponible.' }, 502))

      const wrapper = await monter('AbC123ouvert')
      await remplirEtEnvoyer(wrapper)

      // Le message porte sur le service, jamais sur les champs saisis.
      expect(wrapper.text()).toContain('Service indisponible')
      expect(wrapper.text()).not.toContain('Indiquez votre')
      expect(wrapper.find('form').exists()).toBe(true)
    })

    it('reste comprehensible quand le reseau tombe', async () => {
      vi.mocked(fetch)
        .mockResolvedValueOnce(reponse({ data: OUVERT }))
        .mockRejectedValueOnce(new TypeError('Failed to fetch'))

      const wrapper = await monter('AbC123ouvert')
      await remplirEtEnvoyer(wrapper)

      expect(wrapper.text()).toContain('Réessayez dans un instant')
    })
  })
})
