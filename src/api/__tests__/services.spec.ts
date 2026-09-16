import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest'
import {
  normaliserServices,
  recupererServices,
  serviceParSlug,
  iconeDuService,
  SERVICES_VIDES,
  ICONE_PAR_DEFAUT,
  type Service,
} from '../services'
import servicesGabon from '@/api/fixtures/services-gabon.json'

function reponse(corps: unknown, statut = 200) {
  return new Response(JSON.stringify(corps), {
    status: statut,
    headers: { 'Content-Type': 'application/json' },
  })
}

function service(partiel: Partial<Service> & Pick<Service, 'id' | 'slug'>): Service {
  return {
    title: 'Visa',
    summary: null,
    icon: null,
    delay: null,
    fee: null,
    body_html: '<p>…</p>',
    position: 1,
    ...partiel,
  }
}

describe('normalisation des services', () => {
  it('ne remplace jamais un bloc absent par du contenu', () => {
    // La garantie qui empeche la fuite : ce que le CMS ne sert pas n'existe
    // pas, et le repli n'est surtout pas le contenu d'une autre ambassade.
    expect(normaliserServices({})).toEqual(SERVICES_VIDES)
    expect(normaliserServices(null)).toEqual(SERVICES_VIDES)
    expect(normaliserServices({}).platform).toBeNull()
  })

  it('ordonne par position et non par identifiant', () => {
    const contenu = normaliserServices({
      services: [
        service({ id: 40, slug: 'visa', position: 1 }),
        service({ id: 2, slug: 'passeport', position: 2 }),
      ],
    })

    expect(contenu.services.map((s) => s.slug)).toEqual(['visa', 'passeport'])
  })

  it('laisse passer la plateforme telle que servie', () => {
    const plateforme = {
      name: 'Express54',
      url: 'https://www.express54.org',
      phone: null,
      description: null,
    }

    expect(normaliserServices({ platform: plateforme }).platform).toEqual(plateforme)
  })
})

describe('le choix de l icone', () => {
  it('rend la cle servie quand elle est connue du front', () => {
    expect(iconeDuService({ icon: 'passeport' })).toBe('passeport')
  })

  it('retombe sur le document generique pour une cle inconnue ou absente', () => {
    // Le CMS peut servir une cle qu'une version plus recente du front
    // connaitra : la carte doit rester lisible en attendant, pas vide.
    expect(iconeDuService({ icon: null })).toBe(ICONE_PAR_DEFAUT)
    expect(iconeDuService({ icon: 'tampon-magique' as never })).toBe(ICONE_PAR_DEFAUT)
  })
})

describe('la resolution par slug', () => {
  const contenu = normaliserServices({
    services: [service({ id: 1, slug: 'visa' }), service({ id: 2, slug: 'passeport' })],
  })

  it('trouve le service demande', () => {
    expect(serviceParSlug(contenu, 'passeport')?.id).toBe(2)
  })

  it('rend null pour un slug inconnu, sans jamais servir un voisin', () => {
    // Un lien perime doit mener a « service introuvable », pas au premier
    // service de la liste.
    expect(serviceParSlug(contenu, 'carte-consulaire')).toBeNull()
  })
})

describe('la lecture de l API', () => {
  beforeEach(() => {
    vi.stubGlobal('fetch', vi.fn())
  })

  afterEach(() => {
    vi.unstubAllGlobals()
  })

  it('lit la fixture du Gabon sans la deformer', async () => {
    vi.mocked(fetch).mockResolvedValue(reponse(servicesGabon))

    const contenu = await recupererServices()

    expect(contenu.services).toHaveLength(7)
    expect(contenu.services[0]?.slug).toBe('visa')
    expect(contenu.platform?.name).toBe('Express54')
  })

  it('appelle la surface visiteur, pas celle d administration', async () => {
    vi.mocked(fetch).mockResolvedValue(reponse({ data: { platform: null, services: [] } }))

    await recupererServices()

    expect(vi.mocked(fetch).mock.calls[0]?.[0]).toContain('/api/content/services')
  })
})
