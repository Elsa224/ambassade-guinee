import { describe, it, expect, beforeEach } from 'vitest'
import { createPinia, setActivePinia } from 'pinia'
import router from '../index'
import { useAuthStore } from '@/stores/auth'

describe('garde du dashboard', () => {
  beforeEach(async () => {
    setActivePinia(createPinia())
    localStorage.clear()
    await router.replace('/')
    await router.isReady()
  })

  it('redirige un visiteur non authentifie vers la connexion', async () => {
    await router.push('/dashboard')

    expect(router.currentRoute.value.path).toBe('/connexion')
  })

  it('conserve la destination demandee dans le query redirect', async () => {
    await router.push('/dashboard/articles')

    expect(router.currentRoute.value.path).toBe('/connexion')
    expect(router.currentRoute.value.query.redirect).toBe('/dashboard/articles')
  })

  it('laisse passer un administrateur authentifie', async () => {
    useAuthStore().token = 'jeton-valide'

    await router.push('/dashboard/articles')

    expect(router.currentRoute.value.path).toBe('/dashboard/articles')
  })

  it("n'entrave pas l'acces aux pages publiques", async () => {
    await router.push('/presentation')

    expect(router.currentRoute.value.path).toBe('/presentation')
  })

  it('renvoie un administrateur deja connecte vers le dashboard', async () => {
    useAuthStore().token = 'jeton-valide'

    await router.push('/connexion')

    expect(router.currentRoute.value.path).toBe('/dashboard')
  })
})
