import { describe, it, expect, beforeEach } from 'vitest'
import { mount } from '@vue/test-utils'
import { createRouter, createMemoryHistory } from 'vue-router'
import { createPinia, setActivePinia } from 'pinia'
import { defineComponent, h } from 'vue'
import Layout from '../Layout.vue'
import { useTenantStore } from '@/stores/tenant'
import { GABON } from '@/api/fixtures/tenants'
import type { Embassy } from '@/api/bootstrap'

const Vide = defineComponent({ render: () => h('div') })

/**
 * L'intitule « Ambassade » du menu principal.
 *
 * Il menait a /presentation, une page qui se termine sur « Rubrique en
 * preparation » pour toute ambassade autre que celle d'origine : un clic sur
 * le menu donnait donc une page vide. Le sous-menu, lui, porte quatre pages
 * bien vivantes — l'ambassadeur, la chancellerie, les consuls, le
 * calendrier — et il n'etait pas question de le supprimer avec l'intitule.
 */
async function monter(embassy: Embassy) {
  useTenantStore().embassy = embassy
  const routeur = createRouter({
    history: createMemoryHistory(),
    routes: [{ path: '/:chemin(.*)', component: Vide }],
  })
  routeur.push('/')
  await routeur.isReady()
  return mount(Layout, { global: { plugins: [routeur] } })
}

function liens(wrapper: Awaited<ReturnType<typeof monter>>): string[] {
  return wrapper.findAll('a').map((a) => a.attributes('href') ?? '')
}

describe('entree « Ambassade » du menu', () => {
  beforeEach(() => {
    setActivePinia(createPinia())
  })

  it('mene a /presentation meme quand aucune rubrique ne la declare', async () => {
    // La page est servie par le CMS depuis le 21/09/2026 et se retracte
    // d'elle-meme quand il ne sert rien : la garder fermee empecherait
    // l'ambassade de voir ce qu'elle vient de saisir. C'est l'inverse de ce
    // que ce test verifiait quand son texte etait ecrit en dur.
    const wrapper = await monter(GABON)

    expect(liens(wrapper)).toContain('/presentation')
    expect(wrapper.text()).toContain('Ambassade')
  })

  it('garde les pages vivantes du sous-menu', async () => {
    // Le point important. Retirer l'intitule en entier aurait emporte quatre
    // pages qui servent du vrai contenu du CMS.
    const wrapper = await monter(GABON)
    const adresses = liens(wrapper)

    expect(adresses).toContain('/ambassadeur')
    expect(adresses).toContain('/chancellerie')
    expect(adresses).toContain('/consuls-honoraires')
  })

  it("offre la page d'ambition numerique dans le meme sous-menu", async () => {
    const wrapper = await monter(GABON)

    expect(liens(wrapper)).toContain('/ambition-numerique')
  })
})
