import { test, expect } from '@playwright/test'

/**
 * Parcours public des actualites, contre le bundle de production.
 *
 * Avant la migration, la page de detail existait mais n'etait atteignable
 * qu'en tapant son URL : toutes les cartes pointaient vers /actualite. Ce
 * test verifie qu'on peut desormais y arriver en cliquant.
 */
test('depuis la liste, un article mene a sa page de detail', async ({ page }) => {
  await page.goto('/actualite')

  const premierLien = page.locator('a[href^="/actualites/"]').first()
  await expect(premierLien).toBeVisible()

  const destination = await premierLien.getAttribute('href')

  await premierLien.click()

  await expect(page).toHaveURL(new RegExp(`${destination}$`))
  await expect(page.locator('h1')).toBeVisible()
  await expect(page.locator('h1')).not.toContainText('introuvable')
})

test('une rubrique ne montre que ses propres articles publies', async ({ page }) => {
  await page.goto('/actualites-diplomatique')

  await expect(page.locator('a[href^="/actualites/"]').first()).toBeVisible()

  // Le brouillon et l'article en attente de validation de la fixture ne
  // doivent apparaitre sur aucune page publique.
  await expect(page.getByText('Préparation de la fête nationale')).toHaveCount(0)
  await expect(page.getByText('Accord de coopération avec le Costa Rica')).toHaveCount(0)
})
