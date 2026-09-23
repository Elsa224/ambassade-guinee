import { describe, it, expect } from 'vitest'
import { readFileSync, readdirSync, statSync } from 'node:fs'
import path from 'node:path'
import { mount } from '@vue/test-utils'
import Confirmation from '../Confirmation.vue'

function monter(props: Record<string, unknown> = {}) {
  return mount(Confirmation, {
    props: {
      titre: 'Supprimer ce compte',
      question: 'Supprimer définitivement le compte de Aya Camara ?',
      libelleConfirmer: 'Supprimer',
      ...props,
    },
    attachTo: document.body,
  })
}

describe('boite de confirmation', () => {
  it('pose le premier foyer sur le bouton qui ne detruit rien', () => {
    // Un appui sur Entree en arrivant ne doit pas supprimer un compte.
    const wrapper = monter()

    // Et non la croix de fermeture de la boite, qui vient avant dans le DOM.
    expect(document.activeElement).toBe(wrapper.findAll('.mt-8 button')[0]!.element)
    expect((document.activeElement as HTMLElement).textContent?.trim()).toBe('Renoncer')

    wrapper.unmount()
  })

  it('rend les deux issues distinctes', () => {
    const wrapper = monter({ dangereux: true })
    const boutons = wrapper.findAll('.mt-8 button')

    expect(boutons).toHaveLength(2)
    expect(boutons[0]!.text()).toBe('Renoncer')
    expect(boutons[1]!.text()).toBe('Supprimer')
    // Le rouge n'est pas decoratif : il separe le geste qui detruit du reste.
    expect(boutons[1]!.classes().join(' ')).toContain('bg-red-600')

    boutons[1]!.trigger('click')
    boutons[0]!.trigger('click')
    expect(wrapper.emitted('confirmer')).toHaveLength(1)
    expect(wrapper.emitted('fermer')).toHaveLength(1)

    wrapper.unmount()
  })

  it('empeche un second envoi pendant que le premier court', () => {
    const wrapper = monter({ enCours: true })
    const confirmer = wrapper.findAll('.mt-8 button')[1]!

    expect((confirmer.element as HTMLButtonElement).disabled).toBe(true)
    expect(confirmer.text()).toBe('En cours…')

    wrapper.unmount()
  })
})

/**
 * `window.confirm` fait parler le NAVIGATEUR : son propre domaine en titre,
 * ses boutons dans la langue du navigateur, aucun lien avec le tableau de
 * bord. Un redacteur y lit une alerte de page piegee, et le reflexe est de
 * la chasser — sur un geste qu'on ne rattrape pas, c'est le mauvais reflexe.
 */
function vues(depart: string): string[] {
  return readdirSync(depart).flatMap((entree) => {
    const complet = path.join(depart, entree)
    if (statSync(complet).isDirectory()) return entree === '__tests__' ? [] : vues(complet)
    return complet.endsWith('.vue') ? [complet] : []
  })
}

describe('gestes irreversibles du tableau de bord', () => {
  it('ne passent plus par la boite du navigateur', () => {
    const fautifs = vues('src/views/dashboard').filter((fichier) =>
      /\bwindow\.confirm\s*\(|[^.\w]confirm\s*\(/.test(readFileSync(fichier, 'utf8')),
    )

    expect(fautifs).toEqual([])
  })

  it("n'annoncent pas non plus un succes par une alerte du navigateur", () => {
    // `alert` posait un piege different : la page des actualites remerciait
    // le visiteur de son abonnement a une newsletter qui n'appelait aucune
    // route. Une fausse confirmation vaut moins que pas de formulaire.
    const fautifs = [...vues('src/views'), ...vues('src/components')].filter((fichier) =>
      /[^.\w]alert\s*\(/.test(readFileSync(fichier, 'utf8')),
    )

    expect(fautifs).toEqual([])
  })
})
