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

  it("ne mene pas a /presentation quand la rubrique n'est pas servie", async () => {
    const wrapper = await monter(GABON)

    expect(liens(wrapper)).not.toContain('/presentation')
    // L'intitule reste present : il deplie le sous-menu au lieu de naviguer.
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

  it('mene bien a /presentation la ou la rubrique est ouverte', async () => {
    const ouvert = {
      ...GABON,
      modules: { ...GABON.modules, presentation: true },
    } as unknown as Embassy

    const wrapper = await monter(ouvert)

    expect(liens(wrapper)).toContain('/presentation')
  })
})
