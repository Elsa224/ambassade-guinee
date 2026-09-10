import { describe, it, expect, beforeEach } from 'vitest'
import { mount, flushPromises } from '@vue/test-utils'
import { createRouter, createMemoryHistory } from 'vue-router'
import { createPinia, setActivePinia } from 'pinia'
import { defineComponent, h } from 'vue'
import Layout from '../Layout.vue'
import { useTenantStore } from '@/stores/tenant'
import type { Embassy } from '@/api/bootstrap'
import gabonFixture from '@/api/fixtures/bootstrap-gabon.json'
import guineeFixture from '@/api/fixtures/bootstrap.json'

const TEMOIN = 'CONTENU-DE-LA-CHANCELLERIE'

/** Tient lieu de la vraie page : sa presence prouve que le composant a ete rendu. */
const Chancellerie = defineComponent({ render: () => h('p', TEMOIN) })
const Vide = defineComponent({ render: () => h('div') })

function routeur() {
  return createRouter({
    history: createMemoryHistory(),
    routes: [
      { path: '/', component: Vide },
      { path: '/actualite', component: Vide },
      { path: '/chancellerie', component: Chancellerie },
      { path: '/usa', component: Chancellerie },
      { path: '/demarche-ligne', component: Chancellerie },
    ],
  })
}

async function visiter(chemin: string, embassy: unknown) {
  useTenantStore().embassy = embassy as Embassy
  const r = routeur()
  r.push(chemin)
  await r.isReady()
  const wrapper = mount(Layout, { global: { plugins: [r] } })
  await flushPromises()
  return wrapper
}

describe('rubriques fermees dans le gabarit public', () => {
  beforeEach(() => {
    setActivePinia(createPinia())
  })

  it('n instancie pas la page d une rubrique fermee, meme par URL directe', async () => {
    // Masquer le lien au menu ne protege rien : c'est ce chemin-la, saisi a la
    // main, qui ferait apparaitre le contenu d'une autre ambassade.
    const wrapper = await visiter('/chancellerie', gabonFixture.embassy)

    expect(wrapper.text()).not.toContain(TEMOIN)
    expect(wrapper.text()).toContain('Rubrique en préparation')
  })

  it('ferme aussi les pages bilaterales par URL directe', async () => {
    const wrapper = await visiter('/usa', gabonFixture.embassy)

    expect(wrapper.text()).not.toContain(TEMOIN)
    expect(wrapper.text()).toContain('Rubrique en préparation')
  })

  it('rend normalement une page ouverte', async () => {
    const wrapper = await visiter('/demarche-ligne', gabonFixture.embassy)

    expect(wrapper.text()).toContain(TEMOIN)
    expect(wrapper.text()).not.toContain('Rubrique en préparation')
  })

  it('ne ferme rien sur le site guineen', async () => {
    const wrapper = await visiter('/chancellerie', guineeFixture.embassy)

    expect(wrapper.text()).toContain(TEMOIN)
  })

  it('retire du menu les liens des rubriques fermees', async () => {
    const wrapper = await visiter('/', gabonFixture.embassy)
    const liens = wrapper
      .findAllComponents({ name: 'RouterLink' })
      .map((l) => String(l.props('to')))

    const fermes = ['/chancellerie', '/consuls-honoraires', '/calendrier', '/usa']

    expect(fermes.filter((chemin) => liens.includes(chemin))).toEqual([])
  })

  it('garde au menu les liens des rubriques ouvertes', async () => {
    const wrapper = await visiter('/', gabonFixture.embassy)
    const liens = wrapper
      .findAllComponents({ name: 'RouterLink' })
      .map((l) => String(l.props('to')))

    const ouverts = ['/', '/actualite', '/demarche-ligne']

    expect(ouverts.filter((chemin) => !liens.includes(chemin))).toEqual([])
  })

  it('garde l intitule « Services » cliquable meme si le consulat est ferme', async () => {
    const wrapper = await visiter('/', gabonFixture.embassy)

    // Sans repli, l'intitule disparaitrait et la barre de menu garderait un
    // chevron seul, sans texte.
    expect(wrapper.text()).toContain('Services')
    const liens = wrapper
      .findAllComponents({ name: 'RouterLink' })
      .map((l) => String(l.props('to')))
    expect(liens).toContain('/demarche-ligne')
  })

  it('conserve tous les liens sur le site guineen', async () => {
    const wrapper = await visiter('/', guineeFixture.embassy)
    const liens = wrapper
      .findAllComponents({ name: 'RouterLink' })
      .map((l) => String(l.props('to')))

    const attendus = ['/chancellerie', '/consuls-honoraires', '/calendrier', '/usa']

    expect(attendus.filter((chemin) => !liens.includes(chemin))).toEqual([])
  })
})
