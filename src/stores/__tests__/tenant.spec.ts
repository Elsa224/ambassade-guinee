import { describe, it, expect, beforeEach, vi, afterEach } from 'vitest'
import { setActivePinia, createPinia } from 'pinia'
import { useTenantStore } from '../tenant'
import bootstrapFixture from '@/api/fixtures/bootstrap.json'

function reponse(corps: unknown, statut = 200) {
  return new Response(JSON.stringify(corps), {
    status: statut,
    headers: { 'Content-Type': 'application/json' },
  })
}

describe('store tenant', () => {
  beforeEach(() => {
    setActivePinia(createPinia())
    document.documentElement.removeAttribute('style')
    vi.stubGlobal('fetch', vi.fn())
  })

  afterEach(() => {
    vi.unstubAllGlobals()
  })

  it('interroge le bootstrap avec le domaine courant', async () => {
    vi.mocked(fetch).mockResolvedValue(reponse(bootstrapFixture))

    await useTenantStore().charger('ambassade-du-gabon.test')

    const [url] = vi.mocked(fetch).mock.calls[0]!
    expect(url).toBe('/api/bootstrap?domain=ambassade-du-gabon.test')
  })

  it('expose la config de l ambassade apres chargement', async () => {
    vi.mocked(fetch).mockResolvedValue(reponse(bootstrapFixture))
    const store = useTenantStore()

    await store.charger('embassyofguineausa.org')

    expect(store.embassy?.slug).toBe('guinee-usa')
    expect(store.nomCourt).toBe('Guinee')
    expect(store.chargement).toBe(false)
    expect(store.erreur).toBeNull()
  })

  it('applique le theme du tenant aux variables CSS', async () => {
    vi.mocked(fetch).mockResolvedValue(
      reponse({
        embassy: {
          ...bootstrapFixture.embassy,
          theme: { color_primary: '#0a3d62', color_secondary: '#f6b93b', color_accent: '#b71540' },
        },
      }),
    )

    await useTenantStore().charger('ambassade-du-gabon.test')

    expect(document.documentElement.style.getPropertyValue('--color-primary')).toBe('#0a3d62')
    expect(document.documentElement.style.getPropertyValue('--color-accent')).toBe('#b71540')
  })

  it('expose l activation des modules', async () => {
    vi.mocked(fetch).mockResolvedValue(reponse(bootstrapFixture))
    const store = useTenantStore()

    await store.charger('embassyofguineausa.org')

    expect(store.moduleActif('bilateral')).toBe(true)
    expect(store.moduleActif('secure_rdv')).toBe(false)
    expect(store.moduleActif('module_inconnu')).toBe(false)
  })

  it('enregistre l erreur sans lever quand le bootstrap echoue', async () => {
    vi.mocked(fetch).mockResolvedValue(reponse({ message: 'Domaine inconnu.' }, 404))
    const store = useTenantStore()

    await expect(store.charger('domaine-inconnu.test')).resolves.toBeUndefined()

    expect(store.embassy).toBeNull()
    expect(store.erreur).toBe('Domaine inconnu.')
    expect(store.chargement).toBe(false)
  })
})
