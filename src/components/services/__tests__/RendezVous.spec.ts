import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest'
import { flushPromises, mount, RouterLinkStub, type VueWrapper } from '@vue/test-utils'
import { createPinia, setActivePinia } from 'pinia'
import RendezVous from '../RendezVous.vue'
import ChampSelect, { type OptionSelect } from '@/components/ui/ChampSelect.vue'
import ChampDate from '@/components/ui/ChampDate.vue'
import { useTenantStore } from '@/stores/tenant'
import { GABON } from '@/api/fixtures/tenants'

const SERVICE = {
  data: {
    name: 'Ambassade du Gabon',
    departments: [
      { slug: 'cabinet', name: "Cabinet de l'Ambassadeur" },
      { slug: 'protocole', name: 'Protocole' },
    ],
  },
}

const CREEE = {
  data: {
    reference: 'RDV-2026-000123',
    status: 'pending',
    // Une heure UTC volontairement decalee de celle qui sera saisie : si
    // l'ecran reformatait `scheduledAt`, le recapitulatif montrerait 08:30.
    scheduledAt: '2026-10-01T08:30:00.000Z',
    department: { slug: 'protocole', name: 'Protocole' },
    purpose: 'Remise de documents',
    host: null,
  },
}

function reponse(corps: unknown, statut = 200) {
  return new Response(JSON.stringify(corps), {
    status: statut,
    headers: { 'Content-Type': 'application/json' },
  })
}

function monter() {
  return mount(RendezVous, {
    global: { stubs: { RouterLink: RouterLinkStub } },
  })
}

/** Remplit les champs texte obligatoires du formulaire. */
async function remplirLIdentite(wrapper: VueWrapper): Promise<void> {
  await wrapper.get('#rdv-purpose').setValue('Remise de documents')
  await wrapper.get('#rdv-lastname').setValue('Camara')
  await wrapper.get('#rdv-firstname').setValue('Aya')
  await wrapper.get('#rdv-email').setValue('aya.camara@example.org')
  await wrapper.get('#rdv-phone').setValue('+241 00 00 00 00')
}

/** Choisit une date et une heure a travers les deux controles du gabarit. */
async function choisirDateEtHeure(wrapper: VueWrapper, date: string, heure: string): Promise<void> {
  await wrapper.getComponent(ChampDate).vm.$emit('update:modelValue', date)
  const selects = wrapper.findAllComponents(ChampSelect)
  await selects[selects.length - 1]!.vm.$emit('update:modelValue', heure)
}

describe('prise de rendez-vous de chancellerie', () => {
  beforeEach(() => {
    setActivePinia(createPinia())
    useTenantStore().embassy = GABON
    vi.stubGlobal('fetch', vi.fn().mockResolvedValue(reponse(SERVICE)))
  })

  afterEach(() => {
    vi.unstubAllGlobals()
  })

  it("dit d'emblee que la page n'est pas celle des demarches consulaires", async () => {
    // C'est le risque principal du lot. Le formulaire du gabarit proposait
    // « Demande de passeport » et « Information visa », et ces routes mènent
    // au secretariat de l'Ambassadeur : une demande de passeport deposee ici
    // n'arriverait nulle part.
    const wrapper = monter()
    await flushPromises()

    expect(wrapper.text()).toContain("Pour une démarche consulaire, ce n'est pas ici")
    expect(wrapper.text()).toContain('Passeport, visa')
  })

  it("n'offre que les services rendus par le relais", async () => {
    const wrapper = monter()
    await flushPromises()

    expect(vi.mocked(fetch).mock.calls[0]?.[0]).toBe('/api/secure/rdv')

    const premier = wrapper.getComponent(ChampSelect)
    expect(premier.props('options')).toEqual([
      { valeur: 'cabinet', libelle: "Cabinet de l'Ambassadeur" },
      { valeur: 'protocole', libelle: 'Protocole' },
    ])
  })

  it('envoie la demande sous les noms de SecureCheck', async () => {
    const wrapper = monter()
    await flushPromises()

    await remplirLIdentite(wrapper)
    await choisirDateEtHeure(wrapper, '2026-10-01', '10:30')
    vi.mocked(fetch).mockResolvedValue(reponse(CREEE, 201))
    await wrapper.get('form').trigger('submit')
    await flushPromises()

    const envoi = vi.mocked(fetch).mock.calls[1]!
    expect(envoi[0]).toBe('/api/secure/rdv')
    const corps = envoi[1]?.body as FormData
    expect(corps.get('lastName')).toBe('Camara')
    expect(corps.get('firstName')).toBe('Aya')
    expect(corps.get('date')).toBe('2026-10-01')
    expect(corps.get('time')).toBe('10:30')
    // Le CMS ne connait pas de champ `service` : c'est le nom que le contrat
    // errone du 18/09 avait invente.
    expect(corps.has('service')).toBe(false)
  })

  it("montre la reference et l'heure demandee, sans jamais parler de confirmation", async () => {
    const wrapper = monter()
    await flushPromises()

    await remplirLIdentite(wrapper)
    await choisirDateEtHeure(wrapper, '2026-10-01', '10:30')
    vi.mocked(fetch).mockResolvedValue(reponse(CREEE, 201))
    await wrapper.get('form').trigger('submit')
    await flushPromises()

    const texte = wrapper.text()
    expect(texte).toContain('RDV-2026-000123')
    expect(texte).toContain('Demande enregistrée')
    expect(texte).toContain('En attente de confirmation')
    // L'heure SAISIE, et non `scheduledAt` remis dans le fuseau du
    // navigateur : l'amont serialise en UTC un instant construit sans fuseau.
    expect(texte).toContain('01/10/2026 à 10:30')
    expect(texte).not.toContain('08:30')
    // Une fausse confirmation coute un deplacement a quelqu'un.
    expect(texte).not.toContain('rendez-vous est confirmé')
  })

  it('retire les heures deja passees quand la date choisie est aujourd hui', async () => {
    // Les deux bornes du serveur ne coincident pas : le CMS valide le jour,
    // l'amont refuse un horodatage passe, et son refus arrive en 422 muet que
    // le visiteur ne peut pas corriger. On ne propose donc pas ces heures.
    vi.setSystemTime(new Date('2026-10-01T12:00:00'))
    const wrapper = monter()
    await flushPromises()

    await wrapper.getComponent(ChampDate).vm.$emit('update:modelValue', '2026-10-01')
    await flushPromises()

    const selects = wrapper.findAllComponents(ChampSelect)
    const heures = selects[selects.length - 1]!.props('options') as readonly OptionSelect[]
    expect(heures.map((option) => option.valeur)).toEqual([
      '14:00',
      '14:30',
      '15:00',
      '15:30',
      '16:00',
    ])
    vi.useRealTimers()
  })

  it('ne montre pas de formulaire quand le relais est injoignable', async () => {
    // Un formulaire dont l'envoi echouerait vaut moins que rien : il fait
    // saisir dix champs pour une erreur a la fin.
    vi.mocked(fetch).mockResolvedValue(reponse({ message: 'Ressource introuvable.' }, 404))

    const wrapper = monter()
    await flushPromises()

    expect(wrapper.find('form').exists()).toBe(false)
    expect(wrapper.text()).toContain('Prise de rendez-vous indisponible')
  })

  it('presente le refus relaye sans recopier sa phrase generique', async () => {
    const wrapper = monter()
    await flushPromises()

    await remplirLIdentite(wrapper)
    await choisirDateEtHeure(wrapper, '2026-10-01', '10:30')
    vi.mocked(fetch).mockResolvedValue(
      reponse({ message: 'Données refusées par le service Ambassade Secure.' }, 422),
    )
    await wrapper.get('form').trigger('submit')
    await flushPromises()

    const texte = wrapper.text()
    expect(texte).not.toContain('Ambassade Secure')
    expect(texte).toContain("Vérifiez la date et l'heure")
    // Le formulaire reste rempli : on vient de demander de corriger.
    expect((wrapper.get('#rdv-lastname').element as HTMLInputElement).value).toBe('Camara')
  })
})
