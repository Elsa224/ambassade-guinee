import { test, expect, type Page } from '@playwright/test'

/**
 * Mesure la couleur reelle (sRGB, 8 bits par canal) resolue par le navigateur
 * pour une variable CSS donnee.
 *
 * On ne compare pas la chaine brute retournee par getComputedStyle, car les
 * nuances du bloc @theme utilisent `oklch(from var(...) ...)` : la valeur
 * calculee peut rester serialisee en oklch() plutot qu'en rgb(). On force
 * donc la resolution en appliquant la variable a une propriete standard
 * (`color`) sur un element reellement attache au document, puis on peint
 * cette couleur resolue sur un canvas et on relit le pixel : c'est le canvas
 * qui fait foi de la couleur sRGB reellement affichee, quel que soit l'espace
 * colorimetrique dans lequel le navigateur a garde la valeur en interne.
 */
async function mesurerVariable(page: Page, nomVariable: string): Promise<string> {
  return page.evaluate((nom) => {
    const sonde = document.createElement('div')
    sonde.style.color = `var(${nom})`
    document.body.appendChild(sonde)
    const couleurResolue = getComputedStyle(sonde).color
    document.body.removeChild(sonde)

    const canvas = document.createElement('canvas')
    canvas.width = 1
    canvas.height = 1
    const contexte = canvas.getContext('2d')
    if (!contexte) {
      throw new Error('contexte canvas 2d indisponible')
    }
    contexte.fillStyle = couleurResolue
    contexte.fillRect(0, 0, 1, 1)
    const pixel = contexte.getImageData(0, 0, 1, 1).data

    const composante = (valeur: number | undefined) => (valeur ?? 0).toString(16).padStart(2, '0')
    return `#${composante(pixel[0])}${composante(pixel[1])}${composante(pixel[2])}`
  }, nomVariable)
}

const NUANCES_ATTENDUES: Record<string, string> = {
  '--color-primary-dark': '#004c2a',
  '--color-primary-light': '#009460',
  '--color-secondary-dark': '#e6b800',
  '--color-accent-dark': '#b30f20',
  '--color-accent-deep': '#8b0b1a',
}

test.describe('tokens de theme derives (oklch color-mix relatif)', () => {
  test('chaque nuance derivee reproduit exactement la palette figee de la Guinee', async ({
    page,
  }) => {
    await page.goto('/')

    for (const [variable, hexAttendu] of Object.entries(NUANCES_ATTENDUES)) {
      const hexMesure = await mesurerVariable(page, variable)
      expect(hexMesure, `${variable} devrait valoir ${hexAttendu}`).toBe(hexAttendu)
    }
  })

  test('les nuances derivees suivent la couleur de base injectee par le tenant', async ({
    page,
  }) => {
    await page.goto('/')

    const primaryDarkAvant = await mesurerVariable(page, '--color-primary-dark')
    const primaryLightAvant = await mesurerVariable(page, '--color-primary-light')

    await page.evaluate(() => {
      document.documentElement.style.setProperty('--color-primary', '#0a3d62')
    })

    const primaryDarkApres = await mesurerVariable(page, '--color-primary-dark')
    const primaryLightApres = await mesurerVariable(page, '--color-primary-light')

    expect(
      primaryDarkApres,
      'primary-dark doit changer avec la couleur de base du tenant',
    ).not.toBe(primaryDarkAvant)
    expect(
      primaryLightApres,
      'primary-light doit changer avec la couleur de base du tenant',
    ).not.toBe(primaryLightAvant)
  })
})
