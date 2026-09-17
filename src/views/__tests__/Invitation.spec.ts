import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest'
import { mount, flushPromises } from '@vue/test-utils'
import { createPinia, setActivePinia } from 'pinia'
import { createRouter, createMemoryHistory } from 'vue-router'
import { defineComponent, h } from 'vue'
import Invitation from '../Invitation.vue'
import { useAuthStore } from '@/stores/auth'

const Vide = defineComponent({ render: () => h('div') })

function reponse(corps: unknown, statut = 200) {
  return new Response(corps === null ? null : JSON.stringify(corps), {
    status: statut,
    headers: { 'Content-Type': 'application/json' },
  })
}

async function monter(jeton = '9f3c') {
  const routeur = createRouter({
    history: createMemoryHistory(),
    routes: [
      { path: '/invitation/:token', name: 'invitation', component: Vide },
      { path: '/connexion', name: 'connexion', component: Vide },
      { path: '/dashboard', name: 'dashboard', component: Vide },
    ],
  })
  await routeur.push(`/invitation/${jeton}`)
  await routeur.isReady()
  const ecran = mount(Invitation, { global: { plugins: [routeur] } })
  await flushPromises()
  return { ecran, routeur }
}

describe("page d'invitation", () => {
  beforeEach(() => {
    setActivePinia(createPinia())
    vi.stubGlobal('fetch', vi.fn())
    localStorage.clear()
  })

  afterEach(() => {
    vi.unstubAllGlobals()
  })

  it('lit l invitation sur la route publique, sans jeton porteur', async () => {
    vi.mocked(fetch).mockResolvedValue(
      reponse({ data: { name: 'Awa Diallo', email: 'a.diallo@exemple.test' } }),
    )

    await monter()

    const [url, options] = vi.mocked(fetch).mock.calls[0]!
    expect(String(url)).toBe('/api/auth/invitation/9f3c')
    const entetes = (options as RequestInit).headers as Record<string, string>
    expect(entetes.Authorization).toBeUndefined()
  })

  it('accueille la personne par son nom', async () => {
    vi.mocked(fetch).mockResolvedValue(
      reponse({ data: { name: 'Awa Diallo', email: 'a.diallo@exemple.test' } }),
    )

    const { ecran } = await monter()

    expect(ecran.text()).toContain('Awa Diallo')
    expect(ecran.text()).toContain('a.diallo@exemple.test')
  })

  it('ne propose AUCUN formulaire quand le lien ne vaut plus', async () => {
    // Le back rend le meme 404 pour un jeton inconnu, deja consomme ou
    // expire. Laisser remplir un formulaire avant d'apprendre que rien ne
    // sera enregistre est pire qu'un refus annonce d'emblee.
    vi.mocked(fetch).mockResolvedValue(reponse({ message: 'Invitation introuvable.' }, 404))

    const { ecran } = await monter()

    expect(ecran.find('form').exists()).toBe(false)
    expect(ecran.text()).toContain("Ce lien n'est plus valable")
  })

  it('n invente aucune regle de mot de passe, et affiche celle du serveur', async () => {
    vi.mocked(fetch).mockResolvedValueOnce(
      reponse({ data: { name: 'Awa Diallo', email: 'a.diallo@exemple.test' } }),
    )
    const { ecran } = await monter()

    // Trop court : l'ecran envoie quand meme, et c'est le serveur qui refuse.
    vi.mocked(fetch).mockResolvedValueOnce(
      reponse({ message: 'Le mot de passe fait au moins 8 caracteres.' }, 422),
    )
    await ecran.get('#mot-de-passe').setValue('court')
    await ecran.get('#confirmation').setValue('court')
    await ecran.get('form').trigger('submit')
    await flushPromises()

    expect(ecran.text()).toContain('Le mot de passe fait au moins 8 caracteres.')
  })

  it('ouvre la session et mene au tableau de bord', async () => {
    // Redemander de se connecter juste apres avoir choisi son mot de passe
    // n'ajouterait qu'une occasion de se tromper : le back rend la meme paire
    // `{ token, user }` qu'une connexion.
    vi.mocked(fetch).mockResolvedValueOnce(
      reponse({ data: { name: 'Awa Diallo', email: 'a.diallo@exemple.test' } }),
    )
    const { ecran, routeur } = await monter()

    vi.mocked(fetch).mockResolvedValueOnce(
      reponse({
        token: 'jeton-neuf',
        user: {
          id: 7,
          name: 'Awa Diallo',
          email: 'a.diallo@exemple.test',
          role: 'editeur',
          embassy_id: 1,
        },
      }),
    )
    await ecran.get('#mot-de-passe').setValue('motdepasse-solide')
    await ecran.get('#confirmation').setValue('motdepasse-solide')
    await ecran.get('form').trigger('submit')
    await flushPromises()

    const auth = useAuthStore()
    expect(auth.token).toBe('jeton-neuf')
    expect(auth.utilisateur?.role).toBe('editeur')
    expect(routeur.currentRoute.value.path).toBe('/dashboard')
  })

  it('n envoie rien quand les deux saisies divergent', async () => {
    vi.mocked(fetch).mockResolvedValueOnce(
      reponse({ data: { name: 'Awa Diallo', email: 'a.diallo@exemple.test' } }),
    )
    const { ecran } = await monter()

    await ecran.get('#mot-de-passe').setValue('motdepasse-solide')
    await ecran.get('#confirmation').setValue('autre-chose')
    await ecran.get('form').trigger('submit')
    await flushPromises()

    // Un seul appel : la lecture de l'invitation.
    expect(vi.mocked(fetch).mock.calls).toHaveLength(1)
    expect(ecran.text()).toContain('Les deux mots de passe ne correspondent pas.')
  })
})
