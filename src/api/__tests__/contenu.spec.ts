import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest'
import {
  normaliserContenu,
  recupererContenuAccueil,
  televerserImage,
  refusDuFichier,
  messageErreurContenu,
  CONTENU_VIDE,
} from '../contenu'
import { ApiError } from '../client'
import contenuGabon from '@/api/fixtures/contenu-gabon.json'

function reponse(corps: unknown, statut = 200) {
  return new Response(JSON.stringify(corps), {
    status: statut,
    headers: { 'Content-Type': 'application/json' },
  })
}

describe("normalisation du contenu d'accueil", () => {
  it('ne remplace jamais un bloc absent par du contenu', () => {
    // C'est la garantie qui empeche la fuite de revenir : ce que le CMS ne
    // sert pas n'existe pas, et le repli n'est surtout pas le contenu compile
    // dans le gabarit, qui est celui d'une autre ambassade.
    expect(normaliserContenu({})).toEqual(CONTENU_VIDE)
    expect(normaliserContenu(null)).toEqual(CONTENU_VIDE)
    expect(normaliserContenu(undefined).welcome).toBeNull()
  })

  it('ordonne par position et non par identifiant', () => {
    // Un element insere en tete porte l'identifiant le plus grand : trier par
    // identifiant le renverrait en fin de liste.
    const contenu = normaliserContenu({
      leaders: [
        { id: 9, name: 'Second', role: 'r', subtitle: null, image_url: '/b', position: 2 },
        { id: 40, name: 'Premier', role: 'r', subtitle: null, image_url: '/a', position: 1 },
      ],
    })

    expect(contenu.leaders.map((d) => d.name)).toEqual(['Premier', 'Second'])
  })

  it('ordonne aussi la vitrine', () => {
    const contenu = normaliserContenu({
      showcase: [
        { id: 1, image_url: '/b', alt: null, position: 3 },
        { id: 2, image_url: '/a', alt: null, position: 1 },
      ],
    })

    expect(contenu.showcase.map((p) => p.image_url)).toEqual(['/a', '/b'])
  })

  it('ne modifie pas le tableau recu', () => {
    const servi = [
      { id: 1, image_url: '/b', alt: null, position: 2 },
      { id: 2, image_url: '/a', alt: null, position: 1 },
    ]
    normaliserContenu({ showcase: servi })

    expect(servi[0]!.id).toBe(1)
  })
})

describe("lecture du contenu d'accueil", () => {
  beforeEach(() => {
    vi.stubGlobal('fetch', vi.fn())
  })

  afterEach(() => {
    vi.unstubAllGlobals()
  })

  it('interroge la route publique du contenu', async () => {
    vi.mocked(fetch).mockResolvedValue(reponse(contenuGabon))

    const contenu = await recupererContenuAccueil()

    expect(vi.mocked(fetch).mock.calls[0]![0]).toBe('/api/content/home')
    expect(contenu.leaders).toHaveLength(3)
    expect(contenu.welcome?.title).toBe('Mot de bienvenue')
  })

  it('televerse une image et rend son URL', async () => {
    vi.mocked(fetch).mockResolvedValue(reponse({ data: { url: '/media/12' } }, 201))

    const url = await televerserImage(new File(['x'], 'p.webp', { type: 'image/webp' }))

    expect(url).toBe('/media/12')
    const options = vi.mocked(fetch).mock.calls[0]![1]!
    expect(options.body).toBeInstanceOf(FormData)
    // Le navigateur doit poser lui-meme la frontiere multipart : un
    // Content-Type ecrit a la main rendrait le corps illisible au serveur.
    expect(options.headers).not.toHaveProperty('Content-Type')
  })
})

describe("controle de surface d'un fichier", () => {
  it('refuse un format que le serveur n accepte pas', () => {
    const fichier = new File(['x'], 'doc.pdf', { type: 'application/pdf' })

    expect(refusDuFichier(fichier)).toContain('WebP')
  })

  it('refuse un fichier trop lourd', () => {
    const fichier = new File([new Uint8Array(6 * 1024 * 1024)], 'g.webp', { type: 'image/webp' })

    expect(refusDuFichier(fichier)).toContain('5 Mo')
  })

  it('accepte une image dans les bornes', () => {
    expect(refusDuFichier(new File(['x'], 'p.png', { type: 'image/png' }))).toBeNull()
  })
})

describe("message d'erreur du contenu", () => {
  it('reprend le message du serveur quand il y en a un', () => {
    expect(messageErreurContenu(new ApiError('Le titre est obligatoire.', 422, null))).toBe(
      'Le titre est obligatoire.',
    )
  })

  it('presente une panne reseau comme une panne, pas comme une faute de saisie', () => {
    expect(messageErreurContenu(new ApiError('Serveur injoignable', 0, null))).toContain(
      'momentanément indisponible',
    )
  })
})
