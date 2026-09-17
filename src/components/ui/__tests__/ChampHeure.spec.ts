import { describe, it, expect, afterEach, vi } from 'vitest'
import { mount, type VueWrapper } from '@vue/test-utils'
import ChampHeure from '../ChampHeure.vue'

function rendre(proprietes: Record<string, unknown> = {}): VueWrapper {
  return mount(ChampHeure, { props: { modelValue: '', ...proprietes }, attachTo: document.body })
}

/** Le bouton d'ouverture, reconnu par son libelle accessible. */
function bascule(champ: VueWrapper) {
  return champ.get('button[aria-label="Choisir une heure"]')
}

function option(champ: VueWrapper, attribut: 'heure' | 'minute', valeur: number) {
  const bouton = champ.find(`[data-${attribut}="${valeur}"]`)
  if (!bouton.exists()) throw new Error(`${attribut} ${valeur} introuvable`)
  return bouton
}

/** Ce que le champ a emis en dernier, ou `undefined` s'il n'a rien emis. */
function derniereValeur(champ: VueWrapper): string | undefined {
  const emis = champ.emitted('update:modelValue')
  return emis === undefined ? undefined : (emis[emis.length - 1] as string[])[0]
}

afterEach(() => {
  vi.useRealTimers()
})

describe('affichage de la valeur', () => {
  it('montre l heure du modele sur vingt-quatre heures', () => {
    expect(rendre({ modelValue: '18:30' }).get('input').element.value).toBe('18:30')
  })

  it('reste vide quand le modele est vide', () => {
    expect(rendre().get('input').element.value).toBe('')
  })

  it('accepte null comme une absence de valeur', () => {
    // Plusieurs contrats servent `null` pour une heure facultative absente.
    expect(rendre({ modelValue: null }).get('input').element.value).toBe('')
  })

  it('suit une valeur changee depuis l exterieur', async () => {
    const champ = rendre({ modelValue: '08:00' })
    await champ.setProps({ modelValue: '18:30' })

    expect(champ.get('input').element.value).toBe('18:30')
  })
})

describe('saisie au clavier', () => {
  it('comprend la forme que les gens tapent', async () => {
    const champ = rendre()
    const saisie = champ.get('input')

    await saisie.setValue('8h30')
    await saisie.trigger('blur')

    expect(derniereValeur(champ)).toBe('08:30')
    expect(saisie.element.value).toBe('08:30')
  })

  it("n'ouvre pas le selecteur pour une saisie au clavier", async () => {
    // La saisie doit rester le chemin le plus court : plus rapide que de
    // faire defiler deux colonnes.
    const champ = rendre()
    const saisie = champ.get('input')

    await saisie.setValue('1830')
    await saisie.trigger('blur')

    expect(champ.find('[role="dialog"]').exists()).toBe(false)
    expect(derniereValeur(champ)).toBe('18:30')
  })

  it('remet la valeur precedente sur une saisie incomprise', async () => {
    const champ = rendre({ modelValue: '18:30' })
    const saisie = champ.get('input')

    await saisie.setValue('midi')
    await saisie.trigger('blur')

    expect(derniereValeur(champ)).toBeUndefined()
    expect(saisie.element.value).toBe('18:30')
  })

  it('permet d effacer explicitement', async () => {
    const champ = rendre({ modelValue: '18:30' })
    const saisie = champ.get('input')

    await saisie.setValue('')
    await saisie.trigger('blur')

    expect(derniereValeur(champ)).toBe('')
  })
})

describe('les deux colonnes', () => {
  it("ne surligne rien tant qu'aucune heure n'est choisie", async () => {
    // Surligner minuit par defaut ferait croire qu'une heure est deja posee.
    const champ = rendre()
    await bascule(champ).trigger('click')

    expect(champ.findAll('[aria-selected="true"]')).toHaveLength(0)
  })

  it('surligne l heure et les minutes du modele', async () => {
    const champ = rendre({ modelValue: '18:30' })
    await bascule(champ).trigger('click')

    expect(option(champ, 'heure', 18).attributes('aria-selected')).toBe('true')
    expect(option(champ, 'minute', 30).attributes('aria-selected')).toBe('true')
  })

  it('choisir une heure seule donne l heure pile', async () => {
    const champ = rendre()
    await bascule(champ).trigger('click')
    await option(champ, 'heure', 9).trigger('click')

    expect(derniereValeur(champ)).toBe('09:00')
  })

  it('choisir les minutes garde l heure deja posee', async () => {
    const champ = rendre({ modelValue: '18:00' })
    await bascule(champ).trigger('click')
    await option(champ, 'minute', 45).trigger('click')

    expect(derniereValeur(champ)).toBe('18:45')
  })

  it('propose les minutes au pas demande', async () => {
    const champ = rendre({ pas: 15 })
    await bascule(champ).trigger('click')

    expect(champ.findAll('[data-minute]').map((b) => b.text())).toEqual(['00', '15', '30', '45'])
  })

  it('« Maintenant » pose l heure courante rabattue sur le pas', async () => {
    vi.useFakeTimers()
    vi.setSystemTime(new Date(2026, 8, 17, 18, 34))
    const champ = rendre()
    await bascule(champ).trigger('click')

    await champ
      .findAll('button')
      .find((b) => b.text() === 'Maintenant')!
      .trigger('click')

    expect(derniereValeur(champ)).toBe('18:30')
  })
})

describe('ouverture et fermeture', () => {
  it("n'ouvre rien quand le champ est desactive", async () => {
    const champ = rendre({ desactive: true })
    await bascule(champ).trigger('click')

    expect(champ.find('[role="dialog"]').exists()).toBe(false)
  })

  it('se ferme sur Echap', async () => {
    const champ = rendre()
    await bascule(champ).trigger('click')
    await champ.get('[role="dialog"]').trigger('keydown.esc')

    expect(champ.find('[role="dialog"]').exists()).toBe(false)
  })

  it('se ferme sur un clic ailleurs', async () => {
    const champ = rendre()
    await bascule(champ).trigger('click')

    document.body.dispatchEvent(new MouseEvent('mousedown', { bubbles: true }))
    await champ.vm.$nextTick()

    expect(champ.find('[role="dialog"]').exists()).toBe(false)
  })
})
