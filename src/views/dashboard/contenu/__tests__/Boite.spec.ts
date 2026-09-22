import { describe, it, expect } from 'vitest'
import { mount } from '@vue/test-utils'
import Boite from '../Boite.vue'

function monter(contenu = '<p>Contenu</p>') {
  return mount(Boite, { props: { titre: 'Rédiger cette page' }, slots: { default: contenu } })
}

/**
 * jsdom ne met rien en page : ces assertions portent sur le contrat de
 * classes, qui est ici le comportement. Un formulaire plus haut que l'ecran
 * poussait son propre titre hors du cadre, et il fallait dezoomer le
 * navigateur pour atteindre le bouton d'enregistrement.
 */
describe('boite modale', () => {
  it('borne la boite a la hauteur de la fenetre', () => {
    const boite = monter().find('[role="dialog"] > div')

    expect(boite.classes()).toContain('max-h-full')
    expect(boite.classes()).toContain('flex-col')
  })

  it('fait defiler le contenu DANS la boite et non le voile derriere', () => {
    const wrapper = monter()
    const voile = wrapper.find('[role="dialog"]')
    const corps = wrapper.find('[role="dialog"] > div > div:last-child')

    // Le voile qui defile emporte le titre de la boite avec lui.
    expect(voile.classes()).not.toContain('overflow-y-auto')
    expect(corps.classes()).toContain('overflow-y-auto')
    // Sans `min-h-0`, un element flex refuse de retrecir sous son contenu et
    // deborde malgre la borne posee sur le parent.
    expect(corps.classes()).toContain('min-h-0')
  })

  it('passe au-dessus du cadre d administration', () => {
    // La barre du haut est en `z-[999]` et la colonne laterale en `z-[1000]`.
    // Un voile en `z-50` laissait la barre recouvrir l'entete de la boite :
    // son titre et sa croix de fermeture disparaissaient derriere.
    const voile = monter().find('[role="dialog"]')

    expect(voile.classes()).toContain('z-[1100]')
  })

  it('garde le titre visible pendant le defilement', () => {
    const entete = monter().find('[role="dialog"] > div > div:first-child')

    expect(entete.classes()).toContain('flex-none')
    expect(entete.text()).toContain('Rédiger cette page')
  })

  it('se ferme a la touche d echappement', async () => {
    const wrapper = monter()

    document.dispatchEvent(new KeyboardEvent('keydown', { key: 'Escape' }))
    await wrapper.vm.$nextTick()

    expect(wrapper.emitted('fermer')).toHaveLength(1)
  })
})
