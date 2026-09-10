import { describe, it, expect, beforeEach, vi, afterEach } from 'vitest'
import { mount, flushPromises } from '@vue/test-utils'
import { createRouter, createMemoryHistory, type Router } from 'vue-router'
import { createPinia, setActivePinia } from 'pinia'
import { defineComponent, h } from 'vue'
import Sidebar from '@/components/Sidebar.vue'
import DefautLayout from '@/layouts/DefautLayout.vue'
import { useAuthStore } from '@/stores/auth'
import { setAuthToken } from '@/api/client'

const Vide = defineComponent({ render: () => h('div') })

function creerRouteur(): Router {
  return createRouter({
    history: createMemoryHistory(),
    routes: [
      { path: '/', component: Vide },
      { path: '/dashboard', component: Vide },
      { path: '/connexion', component: Vide },
    ],
  })
}

/**
 * Place la session dans l'état « connecté », comme le ferait un vrai login :
 * jeton en mémoire, dans le store, et persisté dans le stockage local.
 */
function connecter(): void {
  const auth = useAuthStore()
  auth.token = 'jeton-de-test'
  auth.utilisateur = { id: 1, nom: 'Administrateur', email: 'admin@exemple-ambassade.test', role: 'admin' }
  setAuthToken('jeton-de-test')
  localStorage.setItem('cms_token', 'jeton-de-test')
}

describe('déconnexion depuis l\'interface', () => {
  beforeEach(() => {
    setActivePinia(createPinia())
    localStorage.clear()
    setAuthToken(null)
    vi.stubGlobal('fetch', vi.fn())
  })

  afterEach(() => {
    vi.unstubAllGlobals()
  })

  it('un clic sur le bouton de déconnexion de la Sidebar efface bien la session', async () => {
    vi.mocked(fetch).mockResolvedValue(new Response(null, { status: 204 }))
    connecter()
    const auth = useAuthStore()
    const routeur = creerRouteur()
    await routeur.push('/dashboard')
    await routeur.isReady()

    const wrapper = mount(Sidebar, { global: { plugins: [routeur] } })

    const boutonDeconnexion = wrapper.findAll('button').find((b) => b.text().includes('Déconnexion'))
    expect(boutonDeconnexion).toBeTruthy()
    await boutonDeconnexion!.trigger('click')
    await flushPromises()

    expect(auth.estAuthentifie).toBe(false)
    expect(localStorage.getItem('cms_token')).toBeNull()
    expect(routeur.currentRoute.value.path).toBe('/connexion')
  })

  it('un clic sur le bouton de déconnexion du DefautLayout efface bien la session', async () => {
    vi.mocked(fetch).mockResolvedValue(new Response(null, { status: 204 }))
    connecter()
    const auth = useAuthStore()
    const routeur = creerRouteur()
    await routeur.push('/dashboard')
    await routeur.isReady()

    const wrapper = mount(DefautLayout, {
      global: { plugins: [routeur], stubs: { RouterView: true } },
    })

    // Le bouton de déconnexion est dans le menu profil, replié par défaut :
    // on ouvre d'abord ce menu en cliquant sur l'avatar.
    const boutonProfil = wrapper.find('img[alt="Avatar"]').element.closest('button')
    expect(boutonProfil).toBeTruthy()
    await (boutonProfil as HTMLButtonElement).click()
    await wrapper.vm.$nextTick()

    const boutons = wrapper.findAll('button')
    const boutonDeconnexion = boutons.find((b) => b.text().includes('Déconnexion'))
    expect(boutonDeconnexion).toBeTruthy()

    await boutonDeconnexion!.trigger('click')
    await flushPromises()

    expect(auth.estAuthentifie).toBe(false)
    expect(localStorage.getItem('cms_token')).toBeNull()
    expect(routeur.currentRoute.value.path).toBe('/connexion')
  })

  it('l\'appel POST /api/auth/logout est bien émis', async () => {
    vi.mocked(fetch).mockResolvedValue(new Response(null, { status: 204 }))
    connecter()
    const routeur = creerRouteur()
    await routeur.push('/dashboard')
    await routeur.isReady()

    const wrapper = mount(Sidebar, { global: { plugins: [routeur] } })
    const boutonDeconnexion = wrapper.findAll('button').find((b) => b.text().includes('Déconnexion'))
    expect(boutonDeconnexion).toBeTruthy()
    await boutonDeconnexion!.trigger('click')
    await flushPromises()

    const [url, options] = vi.mocked(fetch).mock.calls[0]!
    expect(url).toBe('/api/auth/logout')
    expect((options as RequestInit).method).toBe('POST')
  })
})
