import { test, expect } from '@playwright/test'

test("la page d'accueil se charge sans erreur console", async ({ page }) => {
  const erreurs: string[] = []
  page.on('console', (message) => {
    if (message.type() === 'error') erreurs.push(message.text())
  })

  await page.goto('/')

  await expect(page.locator('#app')).toBeVisible()
  expect(erreurs).toEqual([])
})
