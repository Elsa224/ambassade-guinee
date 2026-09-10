/**
 * Couleurs de marque fournies par le tenant via GET /api/bootstrap.
 * Les noms de champs reprennent ceux de la table `embassies` (spec 4.1).
 */
export interface ThemeColors {
  color_primary: string
  color_secondary: string
  color_accent: string
}

const CORRESPONDANCE: Record<keyof ThemeColors, string> = {
  color_primary: '--color-primary',
  color_secondary: '--color-secondary',
  color_accent: '--color-accent',
}

/**
 * Applique le theme du tenant en ecrivant les variables CSS de base.
 * Les nuances derivees (primary-dark, accent-deep...) sont calculees en CSS
 * via oklch(from var(...)) dans style.css : rien d'autre n'est a injecter ici.
 * Une couleur vide ou absente est ignoree, ce qui laisse la valeur de repli
 * declaree dans @theme s'appliquer.
 */
export function applyTheme(theme: Partial<ThemeColors>, target?: HTMLElement): void {
  const racine = target ?? document.documentElement

  for (const [champ, variable] of Object.entries(CORRESPONDANCE)) {
    const valeur = theme[champ as keyof ThemeColors]
    if (typeof valeur === 'string' && valeur.trim() !== '') {
      racine.style.setProperty(variable, valeur.trim())
    }
  }
}
