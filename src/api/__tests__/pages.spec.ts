import { describe, it, expect } from 'vitest'
import { normaliserPages, pageParSlug, PAGES_VIDES } from '../pages'

function page(slug: string, reste: Record<string, unknown> = {}) {
  return {
    id: 1,
    slug,
    title: 'Titre',
    subtitle: null,
    hero_image_url: null,
    body_html: '<p>Corps</p>',
    position: 1,
    published: true,
    ...reste,
  }
}

describe('pages redactionnelles servies par le CMS', () => {
  it('ne sert rien quand le corps est vide', () => {
    // Le repli ne doit JAMAIS etre le contenu du gabarit : c'est la regle qui
    // empeche une ambassade de montrer les pages d'une autre.
    expect(normaliserPages(null)).toEqual(PAGES_VIDES)
    expect(normaliserPages({})).toEqual(PAGES_VIDES)
  })

  it('ecarte une page dont le gabarit ne connait pas le slug', () => {
    // Ceinture et non fermeture : la liste se ferme cote serveur, qui rend 422
    // sur un slug inconnu. Ici on evite seulement qu'une page servie par
    // erreur cherche une route qui n'existe pas.
    const contenu = normaliserPages({
      pages: [page('presentation'), page('bourses-d-etudes'), page('ambition-numerique')],
    })

    expect(contenu.pages.map((p) => p.slug)).toEqual(['presentation', 'ambition-numerique'])
  })

  it("garde l'ordre servi sans jamais retrier sur la position", () => {
    // `position` peut porter des trous apres une suppression ; retrier dessus
    // deplacerait des pages sans que personne ne l'ait demande.
    const contenu = normaliserPages({
      pages: [
        page('chancellerie', { position: 9 }),
        page('presentation', { position: 2 }),
        page('relations-bilaterales', { position: 5 }),
      ],
    })

    expect(contenu.pages.map((p) => p.slug)).toEqual([
      'chancellerie',
      'presentation',
      'relations-bilaterales',
    ])
  })

  it('rend null pour une page que l ambassade n a pas publiee', () => {
    // `null` n'est pas une panne, c'est la retractation : l'ecran affiche
    // « Rubrique en preparation » plutot que le texte d'une autre ambassade.
    const contenu = normaliserPages({ pages: [page('presentation')] })

    expect(pageParSlug(contenu, 'presentation')?.slug).toBe('presentation')
    expect(pageParSlug(contenu, 'chancellerie')).toBeNull()
  })

  it('sert la juridiction et les chiffres tels quels', () => {
    const contenu = normaliserPages({
      pages: [],
      jurisdiction: ['République de Guinée'],
      // `value` est une chaine et non un entier : une ambassade ecrit
      // « 1 200+ » aussi bien que « 11 ».
      figures: [{ value: '1 200+', label: 'Ressortissants inscrits' }],
    })

    expect(contenu.jurisdiction).toEqual(['République de Guinée'])
    expect(contenu.figures[0]?.value).toBe('1 200+')
  })
})
