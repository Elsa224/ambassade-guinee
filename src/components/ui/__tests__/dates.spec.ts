import { describe, it, expect, afterEach, vi } from 'vitest'
import {
  aujourdHui,
  avant,
  decaler,
  depuisAffichage,
  depuisIso,
  estBissextile,
  joursDuMois,
  moisPrecedent,
  moisSuivant,
  rangDuPremier,
  versAffichage,
  versIso,
} from '../dates'

afterEach(() => {
  vi.useRealTimers()
})

describe('les bornes du mois', () => {
  it('compte 29 jours en fevrier bissextile et 28 sinon', () => {
    expect(joursDuMois(2024, 2)).toBe(29)
    expect(joursDuMois(2026, 2)).toBe(28)
  })

  it('traite les siecles selon la regle gregorienne complete', () => {
    expect(estBissextile(2000)).toBe(true)
    expect(estBissextile(1900)).toBe(false)
  })

  it('distingue les mois de 30 et de 31 jours', () => {
    expect(joursDuMois(2026, 4)).toBe(30)
    expect(joursDuMois(2026, 8)).toBe(31)
  })
})

describe('la lecture du format servi par l API', () => {
  it('accepte une date reelle', () => {
    expect(depuisIso('2026-08-17')).toEqual({ annee: 2026, mois: 8, jour: 17 })
  })

  it('refuse un jour qui n existe pas', () => {
    expect(depuisIso('2026-02-30')).toBeNull()
  })

  it('refuse une chaine mal formee', () => {
    expect(depuisIso('17/08/2026')).toBeNull()
  })

  /**
   * C'est le bug de fuseau qui avait coute une journee sur le calendrier :
   * `new Date('2026-01-01')` est lu comme minuit UTC et recule d'un jour a
   * l'ouest de Greenwich. Ce test fige une horloge a Los Angeles pour que la
   * regression se voie.
   */
  it('ne recule pas d un jour a l ouest de Greenwich', () => {
    vi.stubEnv('TZ', 'America/Los_Angeles')
    expect(versAffichage('2026-01-01')).toBe('01/01/2026')
    expect(depuisIso('2026-01-01')).toEqual({ annee: 2026, mois: 1, jour: 1 })
  })
})

describe('la saisie au clavier', () => {
  it('lit une date tapee a la francaise', () => {
    expect(depuisAffichage('17/08/2026')).toBe('2026-08-17')
  })

  it('tolere les points du pave numerique et les tirets', () => {
    expect(depuisAffichage('1.1.2026')).toBe('2026-01-01')
    expect(depuisAffichage('1-1-2026')).toBe('2026-01-01')
  })

  it('complete les chiffres manquants', () => {
    expect(depuisAffichage('1/1/2026')).toBe('2026-01-01')
  })

  it('refuse un jour qui n existe pas', () => {
    expect(depuisAffichage('31/02/2026')).toBeNull()
  })

  it('refuse une annee sur deux chiffres, qui serait devinee', () => {
    expect(depuisAffichage('17/08/26')).toBeNull()
  })
})

describe('la navigation dans le calendrier', () => {
  it('change d annee en reculant de janvier', () => {
    expect(moisPrecedent(2026, 1)).toEqual({ annee: 2025, mois: 12 })
  })

  it('change d annee en avancant de decembre', () => {
    expect(moisSuivant(2026, 12)).toEqual({ annee: 2027, mois: 1 })
  })

  it('place le 1er du mois dans une semaine commencant le lundi', () => {
    // Le 1er janvier 2026 tombe un jeudi : quatrieme case.
    expect(rangDuPremier(2026, 1)).toBe(3)
  })

  it('suit le calendrier et non la grille en franchissant un mois', () => {
    expect(decaler({ annee: 2026, mois: 1, jour: 31 }, 1)).toEqual({
      annee: 2026,
      mois: 2,
      jour: 1,
    })
  })
})

describe('la comparaison de deux dates', () => {
  it('ordonne sans passer par un objet Date', () => {
    expect(avant('2026-01-01', '2026-01-02')).toBe(true)
    expect(avant('2026-01-02', '2026-01-01')).toBe(false)
    expect(avant('2026-01-01', '2026-01-01')).toBe(false)
  })
})

describe('la lecture de l horloge', () => {
  it('rend le jour local, pas le jour UTC', () => {
    vi.useFakeTimers()
    vi.setSystemTime(new Date(2026, 7, 17, 23, 30))
    expect(versIso(aujourdHui())).toBe('2026-08-17')
  })
})
