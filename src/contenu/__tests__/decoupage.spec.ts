import { describe, it, expect } from 'vitest'
import { readFileSync } from 'node:fs'
import { join } from 'node:path'
import { decouperContenu } from '../decoupage'

/** Le vrai corps servi pour le Gabon : neuf missions numerotees, puis le pays. */
function presentationDuGabon(): string {
  const fixture = JSON.parse(
    readFileSync(join(import.meta.dirname, '../../api/fixtures/pages-gabon.json'), 'utf8'),
  )
  const page = fixture.data.pages.find((p: { slug: string }) => p.slug === 'presentation')
  return page.body_html
}

describe('decoupage du corps redactionnel', () => {
  it('ne rend rien pour un corps absent ou vide', () => {
    // La retractation d'abord : pas de corps, pas de mise en page inventee.
    expect(decouperContenu(null)).toEqual({ chapeau: '', blocs: [] })
    expect(decouperContenu('   ')).toEqual({ chapeau: '', blocs: [] })
  })

  it('laisse un texte sans titre en texte suivi', () => {
    // C'est le cas de « La Chancellerie », qui tient en deux paragraphes.
    const decoupe = decouperContenu('<p>Un.</p><p>Deux.</p>')

    expect(decoupe.blocs).toEqual([])
    expect(decoupe.chapeau).toBe('<p>Un.</p><p>Deux.</p>')
  })

  it('rythme les titres tant qu ils sont moins de quatre', () => {
    // Une grille de trois cases n'aurait rien a equilibrer.
    const decoupe = decouperContenu(
      '<p>Chapeau.</p><h2>Un</h2><p>A.</p><h2>Deux</h2><p>B.</p><h2>Trois</h2><p>C.</p>',
    )

    expect(decoupe.chapeau).toBe('<p>Chapeau.</p>')
    expect(decoupe.blocs).toHaveLength(1)
    expect(decoupe.blocs[0]?.genre).toBe('sections')
  })

  it('passe en grille a partir de quatre titres', () => {
    const decoupe = decouperContenu(
      ['Un', 'Deux', 'Trois', 'Quatre'].map((t) => `<h2>${t}</h2><p>${t}.</p>`).join(''),
    )

    expect(decoupe.blocs).toHaveLength(1)
    const bloc = decoupe.blocs[0]
    expect(bloc?.genre).toBe('grille')
    if (bloc?.genre !== 'grille') throw new Error('bloc inattendu')
    expect(bloc.sections.map((s) => s.titre)).toEqual(['Un', 'Deux', 'Trois', 'Quatre'])
    expect(bloc.sections[0]?.html).toBe('<p>Un.</p>')
  })

  it('montre le numero que l ambassade a ecrit, et n en invente aucun', () => {
    const decoupe = decouperContenu(
      '<h2>1. Mission diplomatique</h2><p>A.</p><h2>Le Gabon</h2><p>B.</p>',
    )

    const numerotee = decoupe.blocs[0]
    if (numerotee?.genre !== 'sections') throw new Error('bloc inattendu')
    expect(numerotee.sections[0]).toMatchObject({ numero: '1', titre: 'Mission diplomatique' })

    const bande = decoupe.blocs[1]
    if (bande?.genre !== 'bande') throw new Error('bloc inattendu')
    expect(bande.section).toMatchObject({ numero: null, titre: 'Le Gabon' })
  })

  it('detache une section d un autre registre sans deplacer le texte', () => {
    // « Le Gabon » ferme la page : la laisser dans la grille aurait range le
    // pays parmi les missions, et laisse une carte seule en derniere ligne.
    const decoupe = decouperContenu(
      '<h2>Avant</h2><p>0.</p>' +
        [1, 2, 3, 4].map((n) => `<h2>${n}. Titre</h2><p>${n}.</p>`).join('') +
        '<h2>Apres</h2><p>5.</p>',
    )

    expect(decoupe.blocs.map((b) => b.genre)).toEqual(['bande', 'grille', 'bande'])
  })

  it('decoupe le corps reel du Gabon en neuf missions et une bande', () => {
    // La garde qui compte : la regle est jugee sur le texte officiel, pas sur
    // des titres de laboratoire.
    const decoupe = decouperContenu(presentationDuGabon())

    expect(decoupe.chapeau).toContain("L'Ambassade de la République Gabonaise")
    expect(decoupe.blocs.map((b) => b.genre)).toEqual(['grille', 'bande'])

    const grille = decoupe.blocs[0]
    if (grille?.genre !== 'grille') throw new Error('bloc inattendu')
    expect(grille.sections).toHaveLength(9)
    expect(grille.sections.map((s) => s.numero)).toEqual([
      '1',
      '2',
      '3',
      '4',
      '5',
      '6',
      '7',
      '8',
      '9',
    ])
    expect(grille.sections[0]?.titre).toBe('Mission diplomatique')
    expect(grille.sections[0]?.html).toContain('<ul>')

    const bande = decoupe.blocs[1]
    if (bande?.genre !== 'bande') throw new Error('bloc inattendu')
    expect(bande.section.titre).toBe('Le Gabon')
  })

  it('conserve le HTML de la section tel qu il a ete assaini', () => {
    const decoupe = decouperContenu('<h2>Un</h2><ul><li>a</li></ul><p>b</p>')

    const bloc = decoupe.blocs[0]
    if (bloc?.genre !== 'sections') throw new Error('bloc inattendu')
    expect(bloc.sections[0]?.html).toBe('<ul><li>a</li></ul><p>b</p>')
  })
})
