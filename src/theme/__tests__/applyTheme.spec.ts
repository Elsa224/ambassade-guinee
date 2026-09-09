import { describe, it, expect, beforeEach } from 'vitest'
import { applyTheme } from '../applyTheme'

describe('applyTheme', () => {
  beforeEach(() => {
    document.documentElement.removeAttribute('style')
  })

  it('ecrit les trois couleurs du tenant sur la racine du document', () => {
    applyTheme({
      color_primary: '#006633',
      color_secondary: '#fcd116',
      color_accent: '#ce1126',
    })

    const racine = document.documentElement.style
    expect(racine.getPropertyValue('--color-primary')).toBe('#006633')
    expect(racine.getPropertyValue('--color-secondary')).toBe('#fcd116')
    expect(racine.getPropertyValue('--color-accent')).toBe('#ce1126')
  })

  it('applique le theme sur la cible fournie', () => {
    const cible = document.createElement('div')

    applyTheme(
      { color_primary: '#0a3d62', color_secondary: '#f6b93b', color_accent: '#b71540' },
      cible,
    )

    expect(cible.style.getPropertyValue('--color-primary')).toBe('#0a3d62')
    expect(document.documentElement.style.getPropertyValue('--color-primary')).toBe('')
  })

  it('ignore une couleur absente plutot que d ecrire une valeur vide', () => {
    document.documentElement.style.setProperty('--color-accent', '#ce1126')

    applyTheme({ color_primary: '#0a3d62', color_secondary: '', color_accent: '' })

    expect(document.documentElement.style.getPropertyValue('--color-primary')).toBe('#0a3d62')
    expect(document.documentElement.style.getPropertyValue('--color-accent')).toBe('#ce1126')
  })
})
