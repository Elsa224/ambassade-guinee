import { describe, it, expect, beforeEach, vi, afterEach } from 'vitest'
import { ApiError, apiGet, apiPost, apiDelete, setAuthToken } from '../client'

function reponse(corps: unknown, statut = 200) {
  return new Response(corps === null ? null : JSON.stringify(corps), {
    status: statut,
    headers: { 'Content-Type': 'application/json' },
  })
}

describe('client API', () => {
  beforeEach(() => {
    setAuthToken(null)
    vi.stubGlobal('fetch', vi.fn())
  })

  afterEach(() => {
    vi.unstubAllGlobals()
  })

  it('appelle une URL relative pour rester en meme origine', async () => {
    vi.mocked(fetch).mockResolvedValue(reponse({ ok: true }))

    await apiGet('/api/bootstrap')

    const [url] = vi.mocked(fetch).mock.calls[0]!
    expect(url).toBe('/api/bootstrap')
  })

  it('retourne le corps JSON deserialise', async () => {
    vi.mocked(fetch).mockResolvedValue(reponse({ titre: 'Un article' }))

    const resultat = await apiGet<{ titre: string }>('/api/articles/1')

    expect(resultat).toEqual({ titre: 'Un article' })
  })

  it("n'envoie pas d en-tete Authorization sans token", async () => {
    vi.mocked(fetch).mockResolvedValue(reponse({}))

    await apiGet('/api/articles')

    const options = vi.mocked(fetch).mock.calls[0]![1] as RequestInit
    expect((options.headers as Record<string, string>).Authorization).toBeUndefined()
  })

  it('envoie le jeton porteur une fois defini', async () => {
    vi.mocked(fetch).mockResolvedValue(reponse({}))
    setAuthToken('jeton-de-test')

    await apiGet('/api/articles')

    const options = vi.mocked(fetch).mock.calls[0]![1] as RequestInit
    expect((options.headers as Record<string, string>).Authorization).toBe('Bearer jeton-de-test')
  })

  it('serialise le corps en JSON sur un POST', async () => {
    vi.mocked(fetch).mockResolvedValue(reponse({ id: 1 }, 201))

    await apiPost('/api/auth/login', { email: 'a@b.fr', password: 'secret' })

    const options = vi.mocked(fetch).mock.calls[0]![1] as RequestInit
    expect(options.method).toBe('POST')
    expect(options.body).toBe(JSON.stringify({ email: 'a@b.fr', password: 'secret' }))
    expect((options.headers as Record<string, string>)['Content-Type']).toBe('application/json')
  })

  it('leve une ApiError portant le statut et le corps sur une reponse 422', async () => {
    // Le corps d'une Response ne peut etre lu qu'une seule fois : mockResolvedValue
    // rendrait la MEME instance aux deux appels et le second echouerait sur
    // « Body is unusable ». On en fabrique donc une par appel.
    vi.mocked(fetch).mockImplementation(async () =>
      reponse({ message: 'Identifiants invalides' }, 422),
    )

    await expect(apiGet('/api/articles')).rejects.toMatchObject({
      statut: 422,
      corps: { message: 'Identifiants invalides' },
    })
    await expect(apiGet('/api/articles')).rejects.toBeInstanceOf(ApiError)
  })

  it('leve une ApiError de statut 0 quand le reseau est injoignable', async () => {
    vi.mocked(fetch).mockRejectedValue(new TypeError('Failed to fetch'))

    await expect(apiGet('/api/bootstrap')).rejects.toMatchObject({ statut: 0 })
  })

  it('accepte une reponse 204 sans corps sur un DELETE', async () => {
    vi.mocked(fetch).mockResolvedValue(new Response(null, { status: 204 }))

    await expect(apiDelete('/api/articles/1')).resolves.toBeUndefined()
  })
})
