import { describe, it, expect, beforeEach, vi } from 'vitest'
import { mount, flushPromises } from '@vue/test-utils'
import { createRouter, createMemoryHistory, type Router } from 'vue-router'
import { createPinia, setActivePinia } from 'pinia'
import { defineComponent, h } from 'vue'
import Connexion from '../Connexion.vue'
import { useAuthStore } from '@/stores/auth'

const Vide = defineComponent({ render: () => h('div') })

function creerRouteur(): Router {
  return createRouter({
    history: createMemoryHistory(),
    routes: [
      { path: '/', component: Vide },
      { path: '/connexion', component: Connexion },
      { path: '/dashboard', component: Vide },
      { path: '/dashboard/articles', component: Vide },
    ],
  })
}

async function monter(routeur: Router) {
  routeur.push('/connexion')
  await routeur.isReady()
  return mount(Connexion, { global: { plugins: [routeur] } })
}

describe('page de connexion', () => {
  beforeEach(() => {
    setActivePinia(createPinia())
    localStorage.clear()
  })

  it('ne contient plus le texte recycle de Secure Check ni de Maposte', async () => {
    const wrapper = await monter(creerRouteur())

    const html = wrapper.html()
    expect(html).not.toMatch(/secure ?check/i)
    expect(html).not.toMatch(/maposte/i)
    expect(html).not.toMatch(/colis/i)
    expect(html).not.toMatch(/creer-compte/i)
  })

  it('appelle le store auth avec les identifiants saisis', async () => {
    const routeur = creerRouteur()
    const wrapper = await monter(routeur)
    const auth = useAuthStore()
    const login = vi.spyOn(auth, 'login').mockResolvedValue(true)

    await wrapper.find('input[type="email"]').setValue('admin@exemple-ambassade.test')
    await wrapper.find('input[type="password"]').setValue('motdepasse')
    await wrapper.find('form').trigger('submit')
    await flushPromises()

    expect(login).toHaveBeenCalledWith('admin@exemple-ambassade.test', 'motdepasse')
  })

  it('redirige vers le dashboard apres une connexion reussie', async () => {
    const routeur = creerRouteur()
    const wrapper = await monter(routeur)
    vi.spyOn(useAuthStore(), 'login').mockResolvedValue(true)

    await wrapper.find('form').trigger('submit')
    await flushPromises()

    expect(routeur.currentRoute.value.path).toBe('/dashboard')
  })

  it('redirige vers la route initialement demandee', async () => {
    const routeur = creerRouteur()
    routeur.push('/connexion?redirect=/dashboard/articles')
    await routeur.isReady()
    const wrapper = mount(Connexion, { global: { plugins: [routeur] } })
    vi.spyOn(useAuthStore(), 'login').mockResolvedValue(true)

    await wrapper.find('form').trigger('submit')
    await flushPromises()

    expect(routeur.currentRoute.value.path).toBe('/dashboard/articles')
  })

  it('affiche le message d erreur du store et ne navigue pas', async () => {
    const routeur = creerRouteur()
    const wrapper = await monter(routeur)
    const auth = useAuthStore()
    vi.spyOn(auth, 'login').mockImplementation(async () => {
      auth.erreur = 'Identifiants invalides.'
      return false
    })

    await wrapper.find('form').trigger('submit')
    await flushPromises()

    expect(wrapper.text()).toContain('Identifiants invalides.')
    expect(routeur.currentRoute.value.path).toBe('/connexion')
  })

  it('desactive le bouton de soumission pendant la requete', async () => {
    const routeur = creerRouteur()
    const wrapper = await monter(routeur)
    const auth = useAuthStore()
    auth.chargement = true
    await wrapper.vm.$nextTick()

    expect(wrapper.find('button[type="submit"]').attributes('disabled')).toBeDefined()
  })
})
