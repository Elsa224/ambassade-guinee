import { describe, it, expect, beforeEach } from 'vitest'
import { mount, flushPromises } from '@vue/test-utils'
import { createRouter, createMemoryHistory } from 'vue-router'
import { createPinia, setActivePinia } from 'pinia'
import { defineComponent, h } from 'vue'
import Layout from '../Layout.vue'
import { useTenantStore } from '@/stores/tenant'
import type { Embassy } from '@/api/bootstrap'
import gabonFixture from '@/api/fixtures/bootstrap-gabon.json'

/**
 * Le module Evenements n'est pas une rubrique editoriale : il suppose un
 * compte Ambassade Secure provisionne cote back. Quand il ne l'est pas, ses
 * routes rendent 404 ; le gabarit ne doit donc ni l'annoncer au menu ni
 * instancier ses pages.
 */
const TEMOIN = 'LISTE-DES-EVENEMENTS'

const Evenements = defineComponent({ render: () => h('p', TEMOIN) })
const Vide = defineComponent({ render: () => h('div') })

function avecModule(actif: boolean): unknown {
  return {
    ...gabonFixture.embassy,
    modules: { ...gabonFixture.embassy.modules, secure_events: actif },
  }
}

async function visiter(chemin: string, embassy: unknown) {
  useTenantStore().embassy = embassy as Embassy
  const routeur = createRouter({
    history: createMemoryHistory(),
    routes: [
      { path: '/', component: Vide },
      { path: '/evenements', component: Evenements },
      { path: '/evenements/inscription/:token', component: Evenements },
    ],
  })
  routeur.push(chemin)
  await routeur.isReady()
  const wrapper = mount(Layout, { global: { plugins: [routeur] } })
  await flushPromises()
  return wrapper
}

function liens(wrapper: Awaited<ReturnType<typeof visiter>>): string[] {
  return wrapper.findAllComponents({ name: 'RouterLink' }).map((l) => String(l.props('to')))
}

describe('module Evenements dans le gabarit public', () => {
  beforeEach(() => {
    setActivePinia(createPinia())
  })

  it("n'annonce pas le module tant que l'ambassade ne l'a pas provisionne", async () => {
    const wrapper = await visiter('/', avecModule(false))

    expect(liens(wrapper)).not.toContain('/evenements')
    expect(wrapper.text()).not.toContain('Évènements')
  })

  it("n'instancie pas la liste par URL directe quand le module est absent", async () => {
    // Masquer le lien ne suffit pas : l'URL tapee a la main atteindrait la
    // page, qui appellerait un back rendant 404.
    const wrapper = await visiter('/evenements', avecModule(false))

    expect(wrapper.text()).not.toContain(TEMOIN)
    expect(wrapper.text()).toContain('Rubrique en préparation')
  })

  it("ferme aussi la page d'inscription atteinte par QR code", async () => {
    const wrapper = await visiter('/evenements/inscription/AbC123', avecModule(false))

    expect(wrapper.text()).not.toContain(TEMOIN)
  })

  it("annonce le module des que l'ambassade l'active", async () => {
    const wrapper = await visiter('/', avecModule(true))

    expect(liens(wrapper)).toContain('/evenements')
    expect(wrapper.text()).toContain('Évènements')
  })

  it('rend la liste quand le module est actif', async () => {
    const wrapper = await visiter('/evenements', avecModule(true))

    expect(wrapper.text()).toContain(TEMOIN)
    expect(wrapper.text()).not.toContain('Rubrique en préparation')
  })

  it("laisse ouverte la page d'inscription quand le module est actif", async () => {
    const wrapper = await visiter('/evenements/inscription/AbC123', avecModule(true))

    expect(wrapper.text()).toContain(TEMOIN)
  })
})
