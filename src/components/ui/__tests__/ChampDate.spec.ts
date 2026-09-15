import { describe, it, expect, afterEach, vi } from 'vitest'
import { mount, type VueWrapper } from '@vue/test-utils'
import ChampDate from '../ChampDate.vue'

function rendre(proprietes: Record<string, unknown> = {}): VueWrapper {
  return mount(ChampDate, { props: { modelValue: '', ...proprietes }, attachTo: document.body })
}

/** Le bouton du calendrier, reconnu par son libelle accessible. */
function bascule(champ: VueWrapper) {
  return champ.get('button[aria-label="Ouvrir le calendrier"]')
}

/** Une case de jour du mois affiche. */
function jour(champ: VueWrapper, numero: number) {
  const cellule = champ.findAll('[role="grid"] button').find((b) => b.text() === String(numero))
  if (cellule === undefined) throw new Error(`jour ${numero} introuvable`)
  return cellule
}

/** Ce que le champ a emis en dernier, ou `undefined` s'il n'a rien emis. */
function derniereValeur(champ: VueWrapper): string | undefined {
  const emis = champ.emitted('update:modelValue')
  return emis === undefined ? undefined : (emis[emis.length - 1] as string[])[0]
}

afterEach(() => {
  vi.useRealTimers()
})

describe('l affichage de la valeur', () => {
  it('montre la date du modele a la francaise', () => {
    const champ = rendre({ modelValue: '2026-08-17' })
    expect(champ.get('input').element.value).toBe('17/08/2026')
  })

  it('reste vide quand le modele est vide', () => {
    expect(rendre().get('input').element.value).toBe('')
  })

  it('traite une date nulle comme une date absente', () => {
    // Plusieurs contrats servent `null` pour une date facultative — la
    // cloture des inscriptions d'un evenement. Le champ ne doit pas obliger
    // chaque appelant a la traduire en chaine vide.
    expect(rendre({ modelValue: null }).get('input').element.value).toBe('')
  })

  it('suit une valeur changee depuis l exterieur', async () => {
    const champ = rendre({ modelValue: '' })
    await champ.setProps({ modelValue: '2026-01-01' })
    expect(champ.get('input').element.value).toBe('01/01/2026')
  })
})

describe('la saisie au clavier', () => {
  it('accepte une date tapee et emet le format de l API', async () => {
    const champ = rendre()
    await champ.get('input').setValue('17/08/2026')
    await champ.get('input').trigger('blur')

    expect(derniereValeur(champ)).toBe('2026-08-17')
  })

  it('remet la valeur precedente quand la saisie est incomprise', async () => {
    const champ = rendre({ modelValue: '2026-08-17' })
    await champ.get('input').setValue('n importe quoi')
    await champ.get('input').trigger('blur')

    expect(champ.emitted('update:modelValue')).toBeUndefined()
    expect(champ.get('input').element.value).toBe('17/08/2026')
  })

  it('efface la date quand on vide le champ', async () => {
    const champ = rendre({ modelValue: '2026-08-17' })
    await champ.get('input').setValue('')
    await champ.get('input').trigger('blur')

    expect(derniereValeur(champ)).toBe('')
  })
})

describe('le calendrier', () => {
  it('ne s ouvre pas tant qu on ne le demande pas', () => {
    expect(rendre().find('[role="dialog"]').exists()).toBe(false)
  })

  it('s ouvre sur le mois de la valeur courante', async () => {
    const champ = rendre({ modelValue: '2026-08-17' })
    await bascule(champ).trigger('click')

    expect(champ.get('[role="dialog"]').text()).toContain('août 2026')
  })

  it('emet le jour choisi au format de l API', async () => {
    const champ = rendre({ modelValue: '2026-08-17' })
    await bascule(champ).trigger('click')
    await jour(champ, 3).trigger('click')

    expect(derniereValeur(champ)).toBe('2026-08-03')
  })

  it('change d annee en reculant depuis janvier', async () => {
    const champ = rendre({ modelValue: '2026-01-15' })
    await bascule(champ).trigger('click')
    await champ.get('button[aria-label="Mois précédent"]').trigger('click')

    expect(champ.get('[role="dialog"]').text()).toContain('décembre 2025')
  })

  it('propose une grille d annees depuis le titre', async () => {
    const champ = rendre({ modelValue: '2026-01-15' })
    await bascule(champ).trigger('click')
    await champ.get('button[aria-label="Choisir une année"]').trigger('click')

    const texte = champ.get('[role="dialog"]').text()
    expect(texte).toContain('2016')
    expect(texte).toContain('2027')
  })

  it('revient au calendrier une fois l annee choisie', async () => {
    const champ = rendre({ modelValue: '2026-01-15' })
    await bascule(champ).trigger('click')
    await champ.get('button[aria-label="Choisir une année"]').trigger('click')
    const annee = champ.findAll('button').find((b) => b.text() === '2020')
    await annee?.trigger('click')

    expect(champ.get('[role="dialog"]').text()).toContain('janvier 2020')
  })

  it('efface la date par le bouton dedie', async () => {
    const champ = rendre({ modelValue: '2026-08-17' })
    await bascule(champ).trigger('click')
    const effacer = champ.findAll('button').find((b) => b.text() === 'Effacer')
    await effacer?.trigger('click')

    expect(derniereValeur(champ)).toBe('')
  })

  it('choisit le jour courant par le bouton dedie', async () => {
    vi.useFakeTimers()
    vi.setSystemTime(new Date(2026, 8, 15, 12))
    const champ = rendre()
    await bascule(champ).trigger('click')
    const aujourdHui = champ.findAll('button').find((b) => b.text() === "Aujourd'hui")
    await aujourdHui?.trigger('click')

    expect(derniereValeur(champ)).toBe('2026-09-15')
  })
})

describe('les bornes', () => {
  it('interdit un jour anterieur au minimum', async () => {
    const champ = rendre({ modelValue: '2026-08-17', min: '2026-08-10' })
    await bascule(champ).trigger('click')

    expect(jour(champ, 5).attributes('disabled')).toBeDefined()
    expect(jour(champ, 15).attributes('disabled')).toBeUndefined()
  })

  it('interdit un jour posterieur au maximum', async () => {
    const champ = rendre({ modelValue: '2026-08-17', max: '2026-08-20' })
    await bascule(champ).trigger('click')

    expect(jour(champ, 25).attributes('disabled')).toBeDefined()
    expect(jour(champ, 20).attributes('disabled')).toBeUndefined()
  })
})

describe('l etat desactive', () => {
  it('n ouvre pas le calendrier', async () => {
    const champ = rendre({ desactive: true })
    await bascule(champ).trigger('click')

    expect(champ.find('[role="dialog"]').exists()).toBe(false)
  })
})
