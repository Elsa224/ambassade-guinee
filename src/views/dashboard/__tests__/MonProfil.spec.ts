import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest'
import { mount, flushPromises, type VueWrapper } from '@vue/test-utils'
import { createPinia, setActivePinia } from 'pinia'
import MonProfil from '../MonProfil.vue'
import { useAuthStore } from '@/stores/auth'

const COMPTE = {
  id: 7,
  name: 'Awa Ndong',
  email: 'awa@exemple.test',
  role: 'admin',
  embassy_id: 1,
  last_login_at: '2026-09-17T08:12:44.000000Z',
  password_changed_at: null as string | null,
}

function reponse(corps: unknown, statut = 200) {
  return new Response(corps === null ? null : JSON.stringify(corps), {
    status: statut,
    headers: { 'Content-Type': 'application/json' },
  })
}

async function monter(compte: Partial<typeof COMPTE> = {}) {
  vi.mocked(fetch).mockResolvedValue(reponse({ user: { ...COMPTE, ...compte } }))
  const ecran = mount(MonProfil)
  await flushPromises()
  return ecran
}

function champ(ecran: VueWrapper, id: string) {
  return ecran.get(`#${id}`)
}

async function remplirLeMotDePasse(ecran: VueWrapper, nouveau = 'motdepasse-solide') {
  await champ(ecran, 'mdp-actuel').setValue('ancien')
  await champ(ecran, 'mdp-nouveau').setValue(nouveau)
  await champ(ecran, 'mdp-confirmation').setValue(nouveau)
}

function bouton(ecran: VueWrapper, texte: string) {
  const trouve = ecran.findAll('button').find((b) => b.text().includes(texte))
  if (trouve === undefined) throw new Error(`bouton « ${texte} » introuvable`)
  return trouve
}

/**
 * Soumet un des deux formulaires de l'ecran.
 *
 * Un clic sur un bouton `type="submit"` ne declenche PAS l'evenement
 * `submit` sous jsdom, contrairement au navigateur : on soumet donc le
 * formulaire lui-meme. Les deux sont distingues par leur ordre, l'identite
 * puis le mot de passe.
 */
async function soumettre(ecran: VueWrapper, lequel: 'identite' | 'motDePasse') {
  const formulaires = ecran.findAll('form')
  await formulaires[lequel === 'identite' ? 0 : 1]!.trigger('submit')
  await flushPromises()
}

describe('ecran Mon profil', () => {
  beforeEach(() => {
    setActivePinia(createPinia())
    vi.stubGlobal('fetch', vi.fn())
  })

  afterEach(() => {
    vi.unstubAllGlobals()
  })

  it('lit le compte connecte sur /api/auth/me', async () => {
    await monter()

    expect(vi.mocked(fetch).mock.calls[0]![0]).toBe('/api/auth/me')
  })

  it('affiche le courriel en lecture seule, et dit pourquoi', async () => {
    const ecran = await monter()
    const courriel = champ(ecran, 'profil-courriel')

    expect((courriel.element as HTMLInputElement).value).toBe('awa@exemple.test')
    expect(courriel.attributes('readonly')).toBeDefined()
    // La raison est dite, pas seulement la restriction : un champ grise sans
    // explication passe pour une panne.
    expect(ecran.text()).toContain('Le changer demande une vérification')
  })

  it("n'annonce aucune date de changement quand le back n'en sert pas", async () => {
    // `password_changed_at` vaut null tant que le mot de passe n'a pas change
    // depuis la mise en service : le back ne remplit rien retroactivement, et
    // l'ecran n'invente donc pas de date.
    const ecran = await monter({ password_changed_at: null })

    expect(ecran.text()).toContain('Jamais changé depuis la mise en service')
  })

  it('affiche la date servie par le back quand elle existe', async () => {
    const ecran = await monter({ password_changed_at: '2026-06-02T10:03:11.000000Z' })

    expect(ecran.text()).toContain('2 juin 2026')
  })

  it('annonce les deux effets AVANT le bouton', async () => {
    // Une deconnexion sur un autre appareil et un courriel inattendu
    // passeraient pour un incident s'ils n'etaient pas annonces.
    const ecran = await monter()

    expect(ecran.text()).toContain('Vos autres appareils seront déconnectés')
    expect(ecran.text()).toContain('Celui-ci reste connecté')
    expect(ecran.text()).toContain('awa@exemple.test')
  })
})

describe('changement de nom', () => {
  beforeEach(() => {
    setActivePinia(createPinia())
    vi.stubGlobal('fetch', vi.fn())
  })

  afterEach(() => {
    vi.unstubAllGlobals()
  })

  it("n'enregistre rien tant que le nom n'a pas change", async () => {
    const ecran = await monter()

    expect(bouton(ecran, 'Enregistrer').attributes('disabled')).toBeDefined()
  })

  it('envoie le seul champ modifiable', async () => {
    const ecran = await monter()
    await champ(ecran, 'profil-nom').setValue('Awa N. Ndong')
    vi.mocked(fetch).mockResolvedValue(reponse({ user: { ...COMPTE, name: 'Awa N. Ndong' } }))

    await soumettre(ecran, 'identite')

    const appels = vi.mocked(fetch).mock.calls
    const envoi = appels.find((appel) => (appel[1] as RequestInit | undefined)?.method === 'PATCH')!
    expect(String(envoi[0])).toBe('/api/auth/me')
    expect((envoi[1] as RequestInit).body).toBe(JSON.stringify({ name: 'Awa N. Ndong' }))
  })

  it('met a jour le nom dans le menu, pas seulement dans le formulaire', async () => {
    // Le menu et l'en-tete lisent le store : sans cela, le nom change a
    // l'ecran et reste l'ancien partout ailleurs jusqu'au rechargement.
    const auth = useAuthStore()
    auth.utilisateur = {
      id: 7,
      name: 'Awa Ndong',
      email: COMPTE.email,
      role: 'admin',
      embassy_id: 1,
    }

    const ecran = await monter()
    await champ(ecran, 'profil-nom').setValue('Awa N. Ndong')
    vi.mocked(fetch).mockResolvedValue(reponse({ user: { ...COMPTE, name: 'Awa N. Ndong' } }))

    await soumettre(ecran, 'identite')

    expect(auth.utilisateur?.name).toBe('Awa N. Ndong')
  })

  it('montre le message du back sur un refus', async () => {
    const ecran = await monter()
    await champ(ecran, 'profil-nom').setValue('')
    vi.mocked(fetch).mockResolvedValue(reponse({ message: 'Le nom est obligatoire.' }, 422))

    await soumettre(ecran, 'identite')

    expect(ecran.text()).toContain('Le nom est obligatoire.')
  })
})

describe('changement de mot de passe', () => {
  beforeEach(() => {
    setActivePinia(createPinia())
    vi.stubGlobal('fetch', vi.fn())
  })

  afterEach(() => {
    vi.unstubAllGlobals()
  })

  it('envoie les trois champs attendus', async () => {
    const ecran = await monter()
    await remplirLeMotDePasse(ecran)
    vi.mocked(fetch).mockResolvedValue(new Response(null, { status: 204 }))

    await soumettre(ecran, 'motDePasse')

    const appels = vi.mocked(fetch).mock.calls
    const envoi = appels.find((appel) => String(appel[0]).includes('/auth/password'))!
    expect((envoi[1] as RequestInit).method).toBe('POST')
    expect(JSON.parse((envoi[1] as RequestInit).body as string)).toEqual({
      current_password: 'ancien',
      password: 'motdepasse-solide',
      password_confirmation: 'motdepasse-solide',
    })
  })

  it("n'envoie rien quand les deux saisies divergent", async () => {
    // La seule verification faite ici, et ce n'est pas une regle : elle evite
    // un aller-retour pour une faute de frappe evidente.
    const ecran = await monter()
    await champ(ecran, 'mdp-actuel').setValue('ancien')
    await champ(ecran, 'mdp-nouveau').setValue('motdepasse-solide')
    await champ(ecran, 'mdp-confirmation').setValue('autre-chose')

    expect(ecran.text()).toContain('Les deux mots de passe ne correspondent pas')
    expect(bouton(ecran, 'Changer le mot de passe').attributes('disabled')).toBeDefined()
  })

  it("n'invente aucune regle de robustesse : le refus vient du serveur", async () => {
    // L'ecran herite verifiait « au moins 6 caracteres » en dur, dans un
    // ecran qui n'envoyait rien. La longueur est celle du back, et c'est lui
    // qui refuse, avec son message.
    const ecran = await monter()
    await remplirLeMotDePasse(ecran, 'court')
    vi.mocked(fetch).mockResolvedValue(
      reponse({ message: 'Le mot de passe fait au moins 8 caractères.' }, 422),
    )

    await soumettre(ecran, 'motDePasse')

    expect(ecran.text()).toContain('Le mot de passe fait au moins 8 caractères.')
  })

  it('traite la limite de cadence du serveur', async () => {
    // Le back borne a cinq appels par minute. Sans ce cas, un 429 sans corps
    // s'afficherait en « Serveur injoignable », ce qui est faux.
    const ecran = await monter()
    await remplirLeMotDePasse(ecran)
    vi.mocked(fetch).mockResolvedValue(new Response(null, { status: 429 }))

    await soumettre(ecran, 'motDePasse')

    expect(ecran.text()).toContain('Trop de tentatives')
  })

  it('vide les champs et relit le compte apres un succes', async () => {
    const ecran = await monter()
    await remplirLeMotDePasse(ecran)
    vi.mocked(fetch)
      .mockResolvedValueOnce(new Response(null, { status: 204 }))
      .mockResolvedValueOnce(
        reponse({ user: { ...COMPTE, password_changed_at: '2026-09-17T12:00:00.000000Z' } }),
      )

    await soumettre(ecran, 'motDePasse')

    expect((champ(ecran, 'mdp-actuel').element as HTMLInputElement).value).toBe('')
    // La date affichee vient du back, jamais d'une horloge locale.
    expect(ecran.text()).toContain('17 septembre 2026')
    expect(ecran.text()).toContain('Vos autres appareils ont été déconnectés')
  })
})
