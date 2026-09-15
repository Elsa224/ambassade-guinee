import { describe, it, expect, afterEach, vi } from 'vitest'
import {
  recupererCalendrier,
  recupererCalendrierAdmin,
  enregistrerReglages,
  ajouterFete,
  refusDuDocument,
  normaliserCalendrier,
  anneesDuSelecteur,
  formaterJour,
  libelleDuType,
  type CalendrierFeries,
} from '@/api/jours-feries'

function servir(corps: unknown) {
  const appels: string[] = []
  vi.stubGlobal(
    'fetch',
    vi.fn((url: string) => {
      appels.push(String(url))
      return Promise.resolve(
        new Response(JSON.stringify(corps), {
          status: 200,
          headers: { 'Content-Type': 'application/json' },
        }),
      )
    }),
  )
  return appels
}

const CALENDRIER: CalendrierFeries = {
  year: 2026,
  available_years: [2025, 2026],
  intro: null,
  document_url: null,
  holidays: [],
}

describe('api des jours feries', () => {
  afterEach(() => {
    vi.unstubAllGlobals()
  })

  it("appelle la route visiteur, sans parametre quand aucune annee n'est demandee", async () => {
    const appels = servir({ data: CALENDRIER })

    await recupererCalendrier()

    expect(appels).toEqual(['/api/content/holidays'])
  })

  it("passe l'annee demandee en parametre", async () => {
    const appels = servir({ data: CALENDRIER })

    await recupererCalendrier(2027)

    expect(appels).toEqual(['/api/content/holidays?year=2027'])
  })

  it('ne substitue aucun contenu a un bloc absent', async () => {
    // La garantie qui empeche la fuite d'identite : ce que le back ne sert
    // pas vaut vide, jamais le calendrier compile dans le gabarit.
    servir({ data: {} })

    const calendrier = await recupererCalendrier()

    expect(calendrier.holidays).toEqual([])
    expect(calendrier.available_years).toEqual([])
    expect(calendrier.intro).toBeNull()
    expect(calendrier.document_url).toBeNull()
  })

  it("garde l'ordre servi sans retrier", async () => {
    // Le back sert deja par date croissante puis identifiant : retrier ici
    // ferait diverger l'affichage du contrat au premier cas limite.
    servir({
      data: {
        ...CALENDRIER,
        holidays: [
          { id: 9, name: 'Premiere', date: '2026-01-01', type: 'legale', note: null },
          { id: 2, name: 'Seconde', date: '2026-05-01', type: 'legale', note: null },
        ],
      },
    })

    const calendrier = await recupererCalendrier()

    expect(calendrier.holidays.map((f) => f.name)).toEqual(['Premiere', 'Seconde'])
  })

  it("ajoute l'annee servie aux options quand elle n'est pas pourvue", () => {
    // Au contrat, `available_years` ne porte que les annees pourvues. Un
    // selecteur dont la valeur ne figure pas dans ses options n'affiche rien.
    const annees = anneesDuSelecteur({ ...CALENDRIER, year: 2027, available_years: [2025] })

    expect(annees).toEqual([2025, 2027])
  })

  it('ne duplique pas une annee deja pourvue', () => {
    const annees = anneesDuSelecteur({ ...CALENDRIER, year: 2026, available_years: [2026, 2025] })

    expect(annees).toEqual([2025, 2026])
  })

  it('rend une copie des listes servies', () => {
    const servi = { ...CALENDRIER, available_years: [2025] }
    const calendrier = normaliserCalendrier(servi)

    calendrier.available_years.push(2030)

    expect(servi.available_years).toEqual([2025])
  })

  it('formate le jour sans jamais reculer la date', () => {
    // Une date seule passee a `new Date` est lue comme minuit UTC : elle
    // reculerait d'un jour dans tout fuseau a l'ouest de Greenwich. Le
    // decoupage se fait donc a la main.
    expect(formaterJour('2026-01-01')).toBe('1er janvier')
    expect(formaterJour('2026-08-15')).toBe('15 août')
    expect(formaterJour('2026-12-25')).toBe('25 décembre')
  })

  it('rend la valeur brute si la date ne respecte pas le format', () => {
    expect(formaterJour('pas une date')).toBe('pas une date')
  })

  it('libelle les trois types, et ne casse pas sur un type inconnu', () => {
    expect(libelleDuType('legale')).toBe('Fête légale')
    expect(libelleDuType('nationale')).toBe('Fête nationale')
    expect(libelleDuType('religieuse')).toBe('Fête religieuse')
    expect(libelleDuType('autre')).toBe('Jour férié')
  })

  it("lit la surface d'administration sur sa propre route", async () => {
    const appels = servir({ data: CALENDRIER })

    await recupererCalendrierAdmin(2027)

    expect(appels).toEqual(['/api/admin/holidays?year=2027'])
  })

  it('enregistre les reglages en envoyant les deux champs', async () => {
    // L'enregistrement est un REMPLACEMENT complet au contrat : la signature
    // exige les deux champs pour qu'un appelant ne puisse pas effacer le
    // document en ne portant que le texte.
    servir({ data: { intro: 'Texte', document_url: null } })

    const reglages = await enregistrerReglages({ intro: 'Texte', document_url: null })

    expect(reglages).toEqual({ intro: 'Texte', document_url: null })
  })

  it('poste une fete sur la route admin', async () => {
    const appels = servir({ data: { id: 1 } })

    await ajouterFete({ name: 'Fete', date: '2026-05-01', type: 'legale', note: null })

    expect(appels).toEqual(['/api/admin/holidays'])
  })

  it('refuse un document qui n est pas un PDF, avant tout aller-retour', () => {
    const image = new File(['x'], 'c.png', { type: 'image/png' })

    expect(refusDuDocument(image)).toContain('PDF')
  })

  it('accepte un PDF de taille raisonnable', () => {
    const pdf = new File(['x'], 'c.pdf', { type: 'application/pdf' })

    expect(refusDuDocument(pdf)).toBeNull()
  })
})
