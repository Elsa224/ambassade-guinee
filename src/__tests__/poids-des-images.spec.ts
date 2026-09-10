import { describe, it, expect } from 'vitest'
import { statSync, globSync } from 'node:fs'
import { fileURLToPath } from 'node:url'
import { dirname, join } from 'node:path'

/**
 * Garde d'optimisation : les images d'origine sortaient telles quelles d'un
 * appareil photo, jusqu'a 7200 pixels de large et 18 Mo piece, pour un total
 * de 100 Mo. Rien dans la chaine de build ne s'y opposait, et rien ne s'y
 * opposerait a nouveau si quelqu'un depose demain une photo brute.
 *
 * Ce test est ce garde-fou. Une image qui le fait echouer n'est pas a exclure
 * de la liste : elle est a passer dans `node scripts/optimiser-images.mjs`.
 */
const PLAFOND_PAR_IMAGE = 700 * 1024
const PLAFOND_TOTAL = 5 * 1024 * 1024

// `new URL('..', import.meta.url)` echoue sous jsdom, qui remplace le global
// `URL` par une implementation ne resolvant pas correctement une base file:.
const racine = join(dirname(fileURLToPath(import.meta.url)), '..')
const public_ = join(racine, '..', 'public')

function imagesDe(dossier: string, etiquette: string): { chemin: string; octets: number }[] {
  return globSync('**/*.{webp,avif,jpg,jpeg,png,gif}', { cwd: dossier }).map((chemin) => ({
    // Chemin lisible plutot qu'absolu : c'est ce que le developpeur verra
    // dans le message d'echec, il doit pouvoir ouvrir le fichier directement.
    chemin: `${etiquette}/${chemin}`,
    octets: statSync(join(dossier, chemin)).size,
  }))
}

describe('poids des images livrees', () => {
  const images = [
    ...imagesDe(join(racine, 'assets/images'), 'src/assets/images'),
    ...imagesDe(public_, 'public'),
  ]

  it('trouve bien des images a verifier', () => {
    // Sans cette assertion, un chemin devenu faux rendrait les deux tests
    // suivants verts sur un ensemble vide. Le seuil garde contre un chemin
    // casse, pas contre un inventaire precis : supprimer une image inutilisee
    // est une bonne chose et ne doit pas faire echouer ce test.
    expect(images.length).toBeGreaterThan(10)
  })

  it('ne laisse aucune image depasser le plafond unitaire', () => {
    const trop_lourdes = images
      .filter((image) => image.octets > PLAFOND_PAR_IMAGE)
      .map((image) => `${image.chemin} : ${Math.round(image.octets / 1024)} Ko`)

    expect(trop_lourdes).toEqual([])
  })

  it('garde le total sous le budget global', () => {
    const total = images.reduce((somme, image) => somme + image.octets, 0)

    expect(Math.round(total / 1024)).toBeLessThanOrEqual(Math.round(PLAFOND_TOTAL / 1024))
  })
})
