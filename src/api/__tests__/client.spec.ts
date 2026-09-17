import { describe, it, expect, beforeEach, vi, afterEach } from 'vitest'
import {
  ApiError,
  apiGet,
  apiPost,
  apiDelete,
  apiFichier,
  setAuthToken,
  setUnauthorizedHandler,
} from '../client'

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
    setUnauthorizedHandler(null)
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

  it('déclenche le gestionnaire non autorisé sur une réponse 401', async () => {
    const gestionnaire = vi.fn()
    setUnauthorizedHandler(gestionnaire)
    vi.mocked(fetch).mockResolvedValue(reponse({ message: 'Non authentifie' }, 401))

    await expect(apiGet('/api/articles')).rejects.toBeInstanceOf(ApiError)

    expect(gestionnaire).toHaveBeenCalledTimes(1)
  })

  it('ne déclenche pas le gestionnaire non autorisé sur une réponse 422', async () => {
    const gestionnaire = vi.fn()
    setUnauthorizedHandler(gestionnaire)
    vi.mocked(fetch).mockResolvedValue(reponse({ message: 'Identifiants invalides' }, 422))

    await expect(apiGet('/api/articles')).rejects.toBeInstanceOf(ApiError)

    expect(gestionnaire).not.toHaveBeenCalled()
  })
})

/**
 * Le message montre a la personne, quand le serveur refuse.
 *
 * Laravel resume un refus portant sur plusieurs champs par le premier message
 * suivi d'un decompte en anglais — « ... (and 2 more errors) ». Le front
 * lisait ce resume : le decompte s'affichait tel quel, et surtout les autres
 * champs fautifs n'etaient jamais nommes. Ces tests verrouillent l'ordre de
 * priorite : le detail par champ d'abord, le resume en repli.
 */
describe('message d une reponse en echec', () => {
  beforeEach(() => {
    setAuthToken(null)
    vi.stubGlobal('fetch', vi.fn())
  })

  afterEach(() => {
    vi.unstubAllGlobals()
    setUnauthorizedHandler(null)
  })

  it('nomme tous les champs fautifs au lieu de les compter', async () => {
    vi.mocked(fetch).mockImplementation(async () =>
      reponse(
        {
          message: "L'adresse de courriel est obligatoire. (and 2 more errors)",
          errors: {
            email: ["L'adresse de courriel est obligatoire."],
            phone: ['Le telephone est obligatoire.'],
            address: ["L'adresse est obligatoire."],
          },
        },
        422,
      ),
    )

    await expect(apiPost('/api/admin/embassy', {})).rejects.toMatchObject({
      message:
        "L'adresse de courriel est obligatoire. Le telephone est obligatoire. L'adresse est obligatoire.",
    })
  })

  it('ne retient que le premier message de chaque champ', async () => {
    // Les suivants redisent la meme regle autrement : « obligatoire », puis
    // « doit comporter au moins 3 caracteres » sur un champ vide.
    vi.mocked(fetch).mockImplementation(async () =>
      reponse(
        { message: 'Invalide', errors: { name: ['Le nom est obligatoire.', 'Trop court.'] } },
        422,
      ),
    )

    await expect(apiPost('/api/admin/users', {})).rejects.toMatchObject({
      message: 'Le nom est obligatoire.',
    })
  })

  it('ecarte deux champs refuses avec la meme phrase', async () => {
    vi.mocked(fetch).mockImplementation(async () =>
      reponse(
        {
          message: 'Ce champ est obligatoire. (and 1 more error)',
          errors: {
            'guests.0.email': ['Ce champ est obligatoire.'],
            'guests.1.email': ['Ce champ est obligatoire.'],
          },
        },
        422,
      ),
    )

    await expect(apiPost('/api/admin/events/1/guests', {})).rejects.toMatchObject({
      message: 'Ce champ est obligatoire.',
    })
  })

  it("se rabat sur le message d'ensemble quand aucun detail par champ n'est servi", async () => {
    vi.mocked(fetch).mockImplementation(async () =>
      reponse({ message: 'Ce compte est suspendu.' }, 422),
    )

    await expect(apiPost('/api/admin/users/2/invitation', {})).rejects.toMatchObject({
      message: 'Ce compte est suspendu.',
    })
  })

  it("se rabat sur le message d'ensemble quand `errors` n'est pas un objet de champs", async () => {
    // Un intermediaire, ou une route qui n'est pas de validation, peut servir
    // n'importe quoi sous cette clef : elle ne doit pas effacer le message.
    vi.mocked(fetch).mockImplementation(async () =>
      reponse({ message: 'Requete refusee.', errors: [] }, 422),
    )

    await expect(apiGet('/api/admin/users')).rejects.toMatchObject({
      message: 'Requete refusee.',
    })
  })

  it('fabrique « Erreur N » quand la reponse ne porte aucun texte', async () => {
    // Cas du serveur frontal qui repond en HTML avant d'atteindre Laravel.
    vi.mocked(fetch).mockImplementation(
      async () => new Response('<html>413</html>', { status: 413 }),
    )

    await expect(apiPost('/api/admin/media', {})).rejects.toMatchObject({
      message: 'Erreur 413',
      statut: 413,
    })
  })

  it('tient le detail par champ pour un texte fourni par le serveur', async () => {
    // `corpsPorteUnMessage` distingue le texte du serveur de celui qu'on
    // fabrique : le detail par champ en est un, puisque `message` en derive.
    vi.mocked(fetch).mockImplementation(async () =>
      reponse({ errors: { size: ['Le fichier depasse 2 Mo.'] } }, 413),
    )

    const souleve = await apiPost('/api/admin/media', {}).catch((erreur) => erreur)

    expect(souleve).toBeInstanceOf(ApiError)
    expect((souleve as ApiError).corpsPorteUnMessage).toBe(true)
    expect((souleve as ApiError).message).toBe('Le fichier depasse 2 Mo.')
  })

  it('applique la meme regle au telechargement de fichier', async () => {
    // Les exports passent par `apiFichier`, qui avait son propre calcul du
    // message : la correction tient en un seul endroit pour les deux chemins.
    vi.mocked(fetch).mockImplementation(async () =>
      reponse(
        {
          message: 'Le format est invalide. (and 1 more error)',
          errors: { format: ['Le format est invalide.'], range: ['La periode est invalide.'] },
        },
        422,
      ),
    )

    await expect(apiFichier('/api/admin/events/1/attendance/export')).rejects.toMatchObject({
      message: 'Le format est invalide. La periode est invalide.',
    })
  })
})
