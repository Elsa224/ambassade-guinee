import { test, expect } from '@playwright/test'

const BASE = '/evenements/inscription/'

test("le lien du QR mene a la page d'inscription de l'evenement", async ({ page }) => {
  const erreurs: string[] = []
  page.on('console', (m) => m.type() === 'error' && erreurs.push(m.text()))

  await page.goto(`${BASE}AbC123ouvert`)

  await expect(page.getByRole('heading', { level: 1 })).toContainText('Journée portes ouvertes')
  await expect(page.locator('form')).toBeVisible()
  expect(erreurs).toEqual([])
})

test("un visiteur s'inscrit et obtient une confirmation", async ({ page }) => {
  await page.goto(`${BASE}AbC123ouvert`)

  await page.fill('#nom', 'Aissatou Diallo')
  await page.fill('#courriel', 'aissatou@example.org')
  await page.click('button[type=submit]')

  await expect(page.getByText('Votre inscription est enregistrée')).toBeVisible()
  await expect(page.locator('form')).toHaveCount(0)
})

test("un evenement aux inscriptions closes s'affiche sans formulaire", async ({ page }) => {
  await page.goto(`${BASE}DeF456complet`)

  // La carte reste lisible : le visiteur doit savoir de quel evenement il
  // s'agit, meme s'il arrive trop tard.
  await expect(page.getByRole('heading', { level: 1 })).toContainText('fête nationale')
  await expect(page.getByText('Les inscriptions sont closes')).toBeVisible()
  await expect(page.locator('form')).toHaveCount(0)
})

test('un jeton inconnu affiche un message clair plutot qu une page vide', async ({ page }) => {
  await page.goto(`${BASE}jeton-qui-nexiste-pas`)

  await expect(page.getByRole('heading', { level: 1 })).toContainText("n'est pas disponible")
})
