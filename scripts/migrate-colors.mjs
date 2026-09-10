/**
 * Codemod de migration des couleurs en dur vers les tokens de theme.
 *
 * Deux passes :
 *  1. classes Tailwind a valeur arbitraire : `[#006633]` -> `primary`.
 *     Le remplacement porte uniquement sur le fragment entre crochets, ce qui
 *     preserve les prefixes (bg-, hover:bg-, focus:ring-, from-...) et les
 *     suffixes d'opacite (/80).
 *  2. couleurs hors classes (blocs <style>, attributs fill SVG) :
 *     `#006633` -> `var(--color-primary)`.
 *
 * Usage : node scripts/migrate-colors.mjs
 */
import { readFileSync, writeFileSync, globSync } from 'node:fs'
import { join } from 'node:path'

const RACINE = 'src'

/** Couleurs de marque : pilotees par le tenant, donc converties en tokens. */
const TOKENS = {
  '#006633': 'primary',
  '#009460': 'primary-light',
  '#004c2a': 'primary-dark',
  '#004d26': 'primary-dark',
  '#00331a': 'primary-dark',
  '#006b44': 'primary-dark',
  '#007a4d': 'primary-dark',
  '#fcd116': 'secondary',
  '#e6b800': 'secondary-dark',
  '#e6a800': 'secondary-dark',
  '#ce1126': 'accent',
  '#b30f20': 'accent-dark',
  '#a10e1f': 'accent-dark',
  '#8b0b1a': 'accent-deep',
  '#346778': 'ink',
  '#2a5563': 'ink-dark',
  '#42637a': 'ink-light',
  '#0297b8': 'info',
  '#02739a': 'info-dark',
}

/**
 * Gris neutres : pas de l'identite d'ambassade, donc pas de token de tenant.
 * On les ramene sur l'echelle grise standard de Tailwind.
 */
const NEUTRES = {
  '#ffffff': 'white',
  '#f9fafb': 'gray-50',
  '#f5f5f5': 'gray-100',
  '#f3f4f6': 'gray-100',
  '#f1f1f1': 'gray-100',
  '#f5f9fa': 'slate-50',
  '#f1f5f9': 'slate-100',
  '#e5e7eb': 'gray-200',
  '#cbd5e1': 'slate-300',
  '#d1d5db': 'gray-300',
  '#c1c1c1': 'gray-300',
  '#a8a8a8': 'gray-400',
  '#9ca3af': 'gray-400',
  '#94a3b8': 'slate-400',
  '#6b7280': 'gray-500',
  '#374151': 'gray-700',
  '#1f2937': 'gray-800',
}

/*
 * style.css porte les couleurs de repli, et le test de garde liste les hex de marque
 * pour pouvoir les interdire : les reecrire detruirait l un comme l autre.
 */
const EXCLUS = ['style.css', '__tests__/no-hardcoded-brand-colors.spec.ts']

const fichiers = globSync('**/*.{vue,ts,css}', { cwd: RACINE }).filter(
  (chemin) => !EXCLUS.includes(chemin),
)

let modifies = 0

for (const relatif of fichiers) {
  const chemin = join(RACINE, relatif)
  const avant = readFileSync(chemin, 'utf8')
  let apres = avant

  // Passe 1 : classes a valeur arbitraire.
  for (const [hex, nom] of [...Object.entries(TOKENS), ...Object.entries(NEUTRES)]) {
    apres = apres.replaceAll(`[${hex}]`, nom)
    apres = apres.replaceAll(`[${hex.toUpperCase()}]`, nom)
  }

  // Passe 2 : couleurs de marque hors classes -> variable CSS.
  // Les neutres ne sont pas traites ici : un fill SVG gris reste litteral.
  for (const [hex, nom] of Object.entries(TOKENS)) {
    apres = apres.replaceAll(hex, `var(--color-${nom})`)
    apres = apres.replaceAll(hex.toUpperCase(), `var(--color-${nom})`)
  }

  if (apres !== avant) {
    writeFileSync(chemin, apres)
    modifies += 1
    console.log(`modifie ${chemin}`)
  }
}

console.log(`\n${modifies} fichier(s) modifie(s).`)
