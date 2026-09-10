import { describe, it, expect } from 'vitest'
import { readFileSync, readdirSync, statSync } from 'node:fs'
import path from 'node:path'

/**
 * Une sous-ressource externe (feuille de style, police, image) est chargee a
 * chaque visite depuis un serveur tiers : elle expose l'adresse IP du
 * visiteur, retarde le rendu, et rend la page dependante d'un service que
 * personne ici ne controle. Trois de ces references avaient deja cesse de
 * fonctionner sans que le site ne le signale.
 *
 * Les liens de navigation (`href` d'une balise `<a>`) ne sont pas concernes :
 * ils ne chargent rien tant que le visiteur ne clique pas.
 */
const SOUS_RESSOURCES_EXTERNES = [
  { motif: /@import\s+url\(\s*['"]?https?:/i, quoi: 'feuille de style importee depuis un tiers' },
  {
    motif: /<link[^>]+rel=["']stylesheet["'][^>]+href=["']https?:/i,
    quoi: 'feuille de style tierce',
  },
  { motif: /\bsrc\s*=\s*["']https?:/i, quoi: 'ressource chargee depuis un tiers' },
  { motif: /url\(\s*https?:/i, quoi: 'image de fond chargee depuis un tiers' },
]

const RACINES = ['src', 'index.html']
const EXTENSIONS = new Set(['.vue', '.ts', '.js', '.css', '.html'])

function fichiers(depart: string): string[] {
  if (statSync(depart).isFile()) return [depart]
  return readdirSync(depart).flatMap((entree) => {
    const complet = path.join(depart, entree)
    if (statSync(complet).isDirectory()) return fichiers(complet)
    return EXTENSIONS.has(path.extname(complet)) ? [complet] : []
  })
}

describe('dependances externes du site', () => {
  it('ne charge aucune sous-ressource depuis un serveur tiers', () => {
    const trouvailles: string[] = []

    for (const fichier of RACINES.flatMap(fichiers)) {
      const lignes = readFileSync(fichier, 'utf8').split('\n')
      lignes.forEach((ligne, index) => {
        for (const { motif, quoi } of SOUS_RESSOURCES_EXTERNES) {
          if (motif.test(ligne)) {
            trouvailles.push(`${fichier}:${index + 1} — ${quoi} : ${ligne.trim()}`)
            return
          }
        }
      })
    }

    expect(trouvailles).toEqual([])
  })
})
