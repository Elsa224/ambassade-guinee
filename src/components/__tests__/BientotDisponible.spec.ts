import { describe, it, expect, beforeEach } from 'vitest'
import { mount } from '@vue/test-utils'
import { createRouter, createMemoryHistory } from 'vue-router'
import { createPinia, setActivePinia } from 'pinia'
import { defineComponent, h } from 'vue'
import BientotDisponible from '../BientotDisponible.vue'
import { useTenantStore } from '@/stores/tenant'
import type { Embassy } from '@/api/bootstrap'

const Vide = defineComponent({ render: () => h('div') })

function routeur() {
  return createRouter({
    history: createMemoryHistory(),
    routes: [
      { path: '/', component: Vide },
      { path: '/actualite', component: Vide },
    ],
  })
}

async function monter(titre?: string) {
  const r = routeur()
  r.push('/')
  await r.isReady()
  return mount(BientotDisponible, {
    props: titre ? { titre } : {},
    global: { plugins: [r] },
  })
}

describe('page « bientot disponible »', () => {
  beforeEach(() => {
    setActivePinia(createPinia())
  })

  it('affiche l intitule de la rubrique quand il est fourni', async () => {
    const wrapper = await monter('La chancellerie diplomatique')

    expect(wrapper.text()).toContain('La chancellerie diplomatique')
  })

  it('se replie sur une formulation neutre sans intitule', async () => {
    const wrapper = await monter()

    expect(wrapper.text()).toContain('bientôt disponible')
  })

  it('propose toujours une sortie vers le reste du site', async () => {
    const wrapper = await monter()
    const destinations = wrapper.findAllComponents({ name: 'RouterLink' }).map((l) => l.props('to'))

    expect(destinations).toContain('/')
    expect(destinations).toContain('/actualite')
  })

  it('affiche le courriel de l ambassade quand la configuration en fournit un', async () => {
    const tenant = useTenantStore()
    tenant.embassy = {
      contact: { email: 'ambassade@exemple.test', address: '', phone: '', hours: '' },
    } as Embassy

    const wrapper = await monter()

    expect(wrapper.html()).toContain('mailto:ambassade@exemple.test')
  })

  it('n affiche aucune ligne de contact sans configuration chargee', async () => {
    const wrapper = await monter()

    expect(wrapper.html()).not.toContain('mailto:')
  })
})
