import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest'
import { fetchBootstrap, normaliserEmbassy } from '../bootstrap'
import gabonProduction from '@/api/fixtures/bootstrap-gabon-production.json'
import guineeFixture from '@/api/fixtures/bootstrap.json'

function reponse(corps: unknown) {
  return new Response(JSON.stringify(corps), {
    status: 200,
    headers: { 'Content-Type': 'application/json' },
  })
}

describe('resolution du tenant par le domaine', () => {
  beforeEach(() => {
    vi.stubGlobal('fetch', vi.fn())
  })

  afterEach(() => {
    vi.unstubAllGlobals()
  })

  it('interroge le bootstrap avec le domaine demande', async () => {
    vi.mocked(fetch).mockResolvedValue(reponse(guineeFixture))

    await fetchBootstrap('ambagabonguinee.com')

    expect(vi.mocked(fetch).mock.calls[0]![0]).toBe('/api/bootstrap?domain=ambagabonguinee.com')
  })

  it("normalise l'identite servie par l'API avant de la rendre", async () => {
    // L'API imbrique l'identite dans `identite` ; sans normalisation ici, le
    // gabarit affiche « Ambassade » sans nom de pays, ce qui est arrive en
    // production a la mise en ligne d'ambagabonguinee.com.
    vi.mocked(fetch).mockResolvedValue(reponse(gabonProduction))

    const embassy = await fetchBootstrap('ambagabonguinee.com')

    expect(embassy.country_name_official).toBe('Republique Gabonaise')
    expect(embassy.country_name_short).toBe('Gabon')
    expect(embassy.demonym).toBe('gabonais')
  })

  it("laisse intacte l'identite deja posee a plat", async () => {
    // Si le back rejoint le contrat, la normalisation ne doit rien casser.
    vi.mocked(fetch).mockResolvedValue(reponse(guineeFixture))

    const embassy = await fetchBootstrap('embassyofguineausa.org')

    expect(embassy.country_name_official).toBe('Republique de Guinee')
    expect(embassy.logo_image).toBe('/fixtures/logo-guinee.png')
  })
})

describe("normalisation d'une ambassade servie", () => {
  it('remplace par une chaine vide les images non fournies', () => {
    // `null` ferait rendre `<img src="null">` ; la chaine vide fait taire le
    // `v-if` du gabarit.
    const embassy = normaliserEmbassy(gabonProduction.embassy)

    expect(embassy.logo_image).toBe('')
    expect(embassy.flag_image).toBe('')
  })

  it('conserve le slug et les modules, dont depend le filtrage des rubriques', () => {
    const embassy = normaliserEmbassy(gabonProduction.embassy)

    expect(embassy.slug).toBe('gabon-guinee')
    expect(embassy.modules.chancellerie).toBe(false)
  })

  it('rend un jeu de modules vide plutot qu absent', () => {
    // Un `modules` manquant ferait planter tout appel a `modules[nom]`.
    const embassy = normaliserEmbassy({ slug: 'sans-modules' })

    expect(embassy.modules).toEqual({})
  })
})
