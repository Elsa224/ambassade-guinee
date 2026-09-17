import { describe, it, expect, beforeEach } from 'vitest'
import { mount, flushPromises } from '@vue/test-utils'
import { createRouter, createMemoryHistory, RouterView } from 'vue-router'
import { createPinia, setActivePinia } from 'pinia'
import { defineComponent, h } from 'vue'
import RacineEvenements from '../RacineEvenements.vue'
import { useTenantStore } from '@/stores/tenant'
import type { Embassy } from '@/api/bootstrap'
import gabonFixture from '@/api/fixtures/bootstrap-gabon.json'

/**
 * Sans garde, chacun des cinq ecrans du module interroge l'API, recoit le 404
 * d'un module ferme et affiche « Ressource introuvable. » : une porte fermee
 * presentee comme une panne. Le temoin ci-dessous n'est rendu que si la route
 * enfant est bien instanciee, ce qui est exactement l'appel a empecher.
 */
const TEMOIN = 'ECRAN-DES-EVENEMENTS'

const Enfant = defineComponent({ render: () => h('p', TEMOIN) })

async function monter() {
  const routeur = createRouter({
    history: createMemoryHistory(),
    routes: [
      { path: '/dashboard', component: defineComponent({ render: () => h('div') }) },
      {
        path: '/dashboard/evenements',
        component: RacineEvenements,
        children: [{ path: '', component: Enfant }],
      },
    ],
  })
  await routeur.push('/dashboard/evenements')
  await routeur.isReady()
  const ecran = mount(defineComponent({ render: () => h(RouterView) }), {
    global: { plugins: [routeur] },
  })
  await flushPromises()
  return ecran
}

function poser(modules: Record<string, boolean> | null, chargement = false) {
  const tenant = useTenantStore()
  tenant.embassy =
    modules === null ? null : ({ ...gabonFixture.embassy, modules } as unknown as Embassy)
  tenant.chargement = chargement
}

describe('garde de module de la rubrique Evenements', () => {
  beforeEach(() => setActivePinia(createPinia()))

  it('instancie la page enfant quand le module est ouvert', async () => {
    poser({ secure_events: true })
    expect((await monter()).text()).toContain(TEMOIN)
  })

  it("n'instancie AUCUNE page enfant quand le module est ferme", async () => {
    poser({ secure_events: false })
    const ecran = await monter()
    expect(ecran.text()).not.toContain(TEMOIN)
    expect(ecran.text()).toContain('Module non ouvert')
  })

  it('dit que le provisionnement ne se fait pas depuis cette administration', async () => {
    poser({ secure_events: false })
    // Le message doit orienter : un ecran qui dit seulement « non disponible »
    // laisse l'administrateur chercher un reglage qui n'existe pas chez lui.
    expect((await monter()).text()).toContain('provisionnement')
  })

  it('instancie la page enfant quand le bootstrap a echoue', async () => {
    poser(null, false)
    expect((await monter()).text()).toContain(TEMOIN)
  })

  it("n'instancie rien tant que le bootstrap est en cours", async () => {
    poser(null, true)
    const ecran = await monter()
    expect(ecran.text()).not.toContain(TEMOIN)
    expect(ecran.text()).not.toContain('Module non ouvert')
  })
})
