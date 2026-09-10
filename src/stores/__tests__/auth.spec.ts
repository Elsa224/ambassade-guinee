import { describe, it, expect, beforeEach, vi, afterEach } from 'vitest'
import { setActivePinia, createPinia } from 'pinia'
import { useAuthStore } from '../auth'
import { setAuthToken } from '@/api/client'

function reponse(corps: unknown, statut = 200) {
  return new Response(corps === null ? null : JSON.stringify(corps), {
    status: statut,
    headers: { 'Content-Type': 'application/json' },
  })
}

const CONNEXION_OK = {
  token: 'jeton-valide',
  user: { id: 1, nom: 'Administrateur', email: 'admin@exemple-ambassade.test', role: 'admin' },
}

describe('store auth', () => {
  beforeEach(() => {
    setActivePinia(createPinia())
    localStorage.clear()
    // Le client HTTP garde le jeton dans un etat de module : sans cette remise
    // a zero, un test contaminerait le suivant.
    setAuthToken(null)
    vi.stubGlobal('fetch', vi.fn())
  })

  afterEach(() => {
    vi.unstubAllGlobals()
  })

  it('envoie les identifiants a POST /api/auth/login', async () => {
    vi.mocked(fetch).mockResolvedValue(reponse(CONNEXION_OK))

    await useAuthStore().login('admin@exemple-ambassade.test', 'motdepasse')

    const [url, options] = vi.mocked(fetch).mock.calls[0]!
    expect(url).toBe('/api/auth/login')
    expect((options as RequestInit).method).toBe('POST')
    expect((options as RequestInit).body).toBe(
      JSON.stringify({ email: 'admin@exemple-ambassade.test', password: 'motdepasse' }),
    )
  })

  it('conserve le jeton et l utilisateur apres une connexion reussie', async () => {
    vi.mocked(fetch).mockResolvedValue(reponse(CONNEXION_OK))
    const store = useAuthStore()

    const reussi = await store.login('admin@exemple-ambassade.test', 'motdepasse')

    expect(reussi).toBe(true)
    expect(store.token).toBe('jeton-valide')
    expect(store.utilisateur?.role).toBe('admin')
    expect(store.estAuthentifie).toBe(true)
    expect(localStorage.getItem('cms_token')).toBe('jeton-valide')
  })

  it('joint le jeton aux requetes suivantes', async () => {
    vi.mocked(fetch).mockResolvedValue(reponse(CONNEXION_OK))
    await useAuthStore().login('admin@exemple-ambassade.test', 'motdepasse')

    vi.mocked(fetch).mockResolvedValue(reponse({ data: [] }))
    const { apiGet } = await import('@/api/client')
    await apiGet('/api/articles')

    const options = vi.mocked(fetch).mock.calls[1]![1] as RequestInit
    expect((options.headers as Record<string, string>).Authorization).toBe('Bearer jeton-valide')
  })

  it('expose le message d erreur et reste deconnecte sur identifiants invalides', async () => {
    vi.mocked(fetch).mockResolvedValue(reponse({ message: 'Identifiants invalides.' }, 422))
    const store = useAuthStore()

    const reussi = await store.login('admin@exemple-ambassade.test', 'faux')

    expect(reussi).toBe(false)
    expect(store.estAuthentifie).toBe(false)
    expect(store.erreur).toBe('Identifiants invalides.')
    expect(localStorage.getItem('cms_token')).toBeNull()
  })

  it('efface le jeton a la deconnexion', async () => {
    vi.mocked(fetch).mockResolvedValue(reponse(CONNEXION_OK))
    const store = useAuthStore()
    await store.login('admin@exemple-ambassade.test', 'motdepasse')

    vi.mocked(fetch).mockResolvedValue(new Response(null, { status: 204 }))
    await store.logout()

    expect(store.token).toBeNull()
    expect(store.utilisateur).toBeNull()
    expect(store.estAuthentifie).toBe(false)
    expect(localStorage.getItem('cms_token')).toBeNull()
  })

  it("ne joint plus le jeton aux requetes apres la deconnexion", async () => {
    vi.mocked(fetch).mockResolvedValue(reponse(CONNEXION_OK))
    const store = useAuthStore()
    await store.login('admin@exemple-ambassade.test', 'motdepasse')

    vi.mocked(fetch).mockResolvedValue(new Response(null, { status: 204 }))
    await store.logout()

    vi.mocked(fetch).mockResolvedValue(reponse({ data: [] }))
    const { apiGet } = await import('@/api/client')
    await apiGet('/api/articles')

    const appels = vi.mocked(fetch).mock.calls
    const options = appels[appels.length - 1]![1] as RequestInit
    expect((options.headers as Record<string, string>).Authorization).toBeUndefined()
  })

  it('efface le jeton meme si l appel de deconnexion echoue', async () => {
    vi.mocked(fetch).mockResolvedValue(reponse(CONNEXION_OK))
    const store = useAuthStore()
    await store.login('admin@exemple-ambassade.test', 'motdepasse')

    vi.mocked(fetch).mockRejectedValue(new TypeError('Failed to fetch'))
    await store.logout()

    expect(store.estAuthentifie).toBe(false)
    expect(localStorage.getItem('cms_token')).toBeNull()
  })

  it('restaure une session depuis le stockage local', () => {
    localStorage.setItem('cms_token', 'jeton-persiste')
    const store = useAuthStore()

    store.restaurerSession()

    expect(store.token).toBe('jeton-persiste')
    expect(store.estAuthentifie).toBe(true)
  })
})
