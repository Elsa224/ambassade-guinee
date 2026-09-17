import { describe, it, expect } from 'vitest'
import { mount, type VueWrapper } from '@vue/test-utils'
import ChampSelect from '../ChampSelect.vue'

const TYPES = [
  { valeur: 'legale', libelle: 'Fête légale' },
  { valeur: 'nationale', libelle: 'Fête nationale' },
  { valeur: 'religieuse', libelle: 'Fête religieuse' },
]

function rendre(proprietes: Record<string, unknown> = {}): VueWrapper {
  return mount(ChampSelect, {
    props: { modelValue: '', options: TYPES, ...proprietes },
    attachTo: document.body,
  })
}

function entree(liste: VueWrapper, libelle: string) {
  const bouton = liste.findAll('[role="option"]').find((o) => o.text().includes(libelle))
  if (bouton === undefined) throw new Error(`option « ${libelle} » introuvable`)
  return bouton
}

function derniereValeur(liste: VueWrapper): unknown {
  const emis = liste.emitted('update:modelValue')
  return emis === undefined ? undefined : (emis[emis.length - 1] as unknown[])[0]
}

describe('l affichage', () => {
  it('montre le libelle de la valeur choisie, pas la valeur brute', () => {
    expect(rendre({ modelValue: 'religieuse' }).get('[role="combobox"]').text()).toContain(
      'Fête religieuse',
    )
  })

  it('montre le texte indicatif quand rien n est choisi', () => {
    expect(rendre({ placeholder: 'Choisir un type' }).get('[role="combobox"]').text()).toContain(
      'Choisir un type',
    )
  })

  it('accepte une valeur numerique, comme une annee', () => {
    const liste = rendre({
      modelValue: 2026,
      options: [
        { valeur: 2025, libelle: '2025' },
        { valeur: 2026, libelle: '2026' },
      ],
    })
    expect(liste.get('[role="combobox"]').text()).toContain('2026')
  })

  it('suit une valeur changee depuis l exterieur', async () => {
    const liste = rendre({ modelValue: 'legale' })
    await liste.setProps({ modelValue: 'nationale' })
    expect(liste.get('[role="combobox"]').text()).toContain('Fête nationale')
  })
})

describe('le choix', () => {
  it('n ouvre la liste que sur demande', () => {
    expect(rendre().find('[role="listbox"]').exists()).toBe(false)
  })

  it('emet la valeur de l option, pas son libelle', async () => {
    const liste = rendre()
    await liste.get('[role="combobox"]').trigger('click')
    await entree(liste, 'Fête nationale').trigger('click')

    expect(derniereValeur(liste)).toBe('nationale')
  })

  it('referme la liste apres le choix', async () => {
    const liste = rendre()
    await liste.get('[role="combobox"]').trigger('click')
    await entree(liste, 'Fête légale').trigger('click')

    expect(liste.find('[role="listbox"]').exists()).toBe(false)
  })

  it('marque l option courante pour les lecteurs d ecran', async () => {
    const liste = rendre({ modelValue: 'legale' })
    await liste.get('[role="combobox"]').trigger('click')

    expect(entree(liste, 'Fête légale').attributes('aria-selected')).toBe('true')
    expect(entree(liste, 'Fête nationale').attributes('aria-selected')).toBe('false')
  })
})

describe('le clavier', () => {
  it('ouvre la liste avec la fleche du bas', async () => {
    const liste = rendre()
    await liste.get('[role="combobox"]').trigger('keydown', { key: 'ArrowDown' })

    expect(liste.find('[role="listbox"]').exists()).toBe(true)
  })

  it('referme la liste avec la touche d echappement', async () => {
    const liste = rendre()
    await liste.get('[role="combobox"]').trigger('click')
    await liste.get('[role="listbox"]').trigger('keydown', { key: 'Escape' })

    expect(liste.find('[role="listbox"]').exists()).toBe(false)
  })
})

describe('les cas limites', () => {
  it('ne s ouvre pas quand le champ est desactive', async () => {
    const liste = rendre({ desactive: true })
    await liste.get('[role="combobox"]').trigger('click')

    expect(liste.find('[role="listbox"]').exists()).toBe(false)
  })

  it('ne s ouvre pas sans option a proposer', async () => {
    const liste = rendre({ options: [] })
    await liste.get('[role="combobox"]').trigger('click')

    expect(liste.find('[role="listbox"]').exists()).toBe(false)
  })
})
