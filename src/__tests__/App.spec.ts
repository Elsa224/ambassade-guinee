import { describe, it, expect } from 'vitest'
import { mount } from '@vue/test-utils'
import { createRouter, createMemoryHistory } from 'vue-router'
import { defineComponent, h } from 'vue'
import App from '../App.vue'

const VuePlaceholder = defineComponent({
  render: () => h('p', 'contenu de la route'),
})

describe('App', () => {
  it('rend la vue de la route active', async () => {
    const router = createRouter({
      history: createMemoryHistory(),
      routes: [{ path: '/', component: VuePlaceholder }],
    })
    router.push('/')
    await router.isReady()

    const wrapper = mount(App, { global: { plugins: [router] } })

    expect(wrapper.text()).toContain('contenu de la route')
  })
})
