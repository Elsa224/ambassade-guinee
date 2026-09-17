import { describe, it, expect } from 'vitest'
import {
  depuisIso,
  depuisSaisie,
  maintenant,
  minutesParPas,
  versAffichage,
  versIso,
} from '../heures'

describe('lecture et ecriture de HH:MM', () => {
  it('lit une heure valide', () => {
    expect(depuisIso('18:30')).toEqual({ heures: 18, minutes: 30 })
    expect(depuisIso('00:00')).toEqual({ heures: 0, minutes: 0 })
    expect(depuisIso('23:59')).toEqual({ heures: 23, minutes: 59 })
  })

  it('refuse ce qui ressemble a une heure sans en etre une', () => {
    // Rabattre 25:00 sur 23:59 ou 01:00 ferait enregistrer autre chose que
    // ce que la personne a lu. On refuse, le champ remet la valeur d'avant.
    expect(depuisIso('24:00')).toBeNull()
    expect(depuisIso('12:60')).toBeNull()
    expect(depuisIso('')).toBeNull()
    expect(depuisIso('18h30')).toBeNull()
  })

  it('ecrit toujours sur deux chiffres', () => {
    expect(versIso({ heures: 8, minutes: 5 })).toBe('08:05')
  })

  it("n'affiche rien pour une valeur vide ou illisible", () => {
    expect(versAffichage('')).toBe('')
    expect(versAffichage('nimporte')).toBe('')
    expect(versAffichage('8:5')).toBe('')
  })
})

describe('saisie humaine', () => {
  it('accepte les separateurs que les gens tapent', () => {
    for (const saisie of ['8h30', '8:30', '08.30', '8-30', '08h30', ' 8 h 30 ']) {
      expect(depuisSaisie(saisie)).toBe('08:30')
    }
  })

  it('accepte une suite de chiffres, avec ou sans zero', () => {
    expect(depuisSaisie('830')).toBe('08:30')
    expect(depuisSaisie('0830')).toBe('08:30')
    expect(depuisSaisie('1830')).toBe('18:30')
  })

  it('comprend une heure sans minutes comme une heure pile', () => {
    expect(depuisSaisie('8')).toBe('08:00')
    expect(depuisSaisie('8h')).toBe('08:00')
    expect(depuisSaisie('18')).toBe('18:00')
  })

  it('lit un chiffre seul apres le separateur comme des dizaines', () => {
    // « 8h3 » se dit « huit heures trente » a l'oral, pas « huit heures
    // trois ». Le champ suit l'usage.
    expect(depuisSaisie('8h3')).toBe('08:30')
    expect(depuisSaisie('8h03')).toBe('08:03')
  })

  it('refuse plutot que de corriger en silence', () => {
    expect(depuisSaisie('25:00')).toBeNull()
    expect(depuisSaisie('12:70')).toBeNull()
    expect(depuisSaisie('8h99')).toBeNull()
    expect(depuisSaisie('midi')).toBeNull()
    expect(depuisSaisie('')).toBeNull()
  })
})

describe('minutes proposees', () => {
  it('suit le pas demande', () => {
    expect(minutesParPas(15)).toEqual([0, 15, 30, 45])
    expect(minutesParPas(30)).toEqual([0, 30])
    expect(minutesParPas(5)).toHaveLength(12)
  })

  it('se replie sur cinq minutes devant un pas absurde', () => {
    for (const pas of [0, -5, 45, Number.NaN]) {
      expect(minutesParPas(pas)).toHaveLength(12)
    }
  })
})

describe('maintenant', () => {
  it('arrondit a l inferieur sur le pas', () => {
    // A l'inferieur et non au plus proche : « Maintenant » sur un evenement
    // veut dire « ca commence », pas « ca a commence il y a cinq minutes ».
    const date = new Date(2026, 8, 17, 18, 34)

    expect(maintenant(5, date)).toBe('18:30')
    expect(maintenant(15, date)).toBe('18:30')
  })

  it('garde minuit lisible', () => {
    expect(maintenant(5, new Date(2026, 8, 17, 0, 2))).toBe('00:00')
  })
})
