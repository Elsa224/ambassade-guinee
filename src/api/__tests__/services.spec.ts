import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest'
import {
  normaliserServices,
  recupererServices,
  serviceParSlug,
  iconeDuService,
  apercuDeSlug,
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

describe('l apercu de l adresse derivee du titre', () => {
  it('met en minuscules, retire les accents et remplace le reste par des tirets', () => {
    expect(apercuDeSlug('État civil')).toBe('etat-civil')
    expect(apercuDeSlug('Legalisation de documents')).toBe('legalisation-de-documents')
  })

  it('ne termine jamais par un tiret, meme sur un titre tronque', () => {
    // C'est le defaut trouve en revue cote back : les tirets retires AVANT la
    // troncature laissaient un titre long proposer une adresse terminee par
    // un tiret, aussitot refusee par la regle de forme — et l'agent recevait
    // une 422 sur un champ qu'il n'avait pas rempli.
    const titreLong = 'Demande de visa de long sejour pour les ressortissants etrangers'
    const apercu = apercuDeSlug(titreLong)

    expect(apercu.length).toBeLessThanOrEqual(60)
    expect(apercu.endsWith('-')).toBe(false)
    expect(apercu.startsWith('-')).toBe(false)
  })

  it('rend une chaine vide pour un titre sans caractere utilisable', () => {
    // Le champ part alors absent de la requete, et le back derive lui-meme.
    expect(apercuDeSlug('   ')).toBe('')
    expect(apercuDeSlug('')).toBe('')
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
