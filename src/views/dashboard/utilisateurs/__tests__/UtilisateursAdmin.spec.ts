import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest'
import { mount, flushPromises, type VueWrapper } from '@vue/test-utils'
import { createPinia, setActivePinia } from 'pinia'
import UtilisateursAdmin from '../UtilisateursAdmin.vue'
import { useAuthStore } from '@/stores/auth'
import type { CompteAdmin } from '@/api/utilisateurs'

const MOI: CompteAdmin = {
  id: 1,
  name: 'Mariam Bongo',
  email: 'direction@exemple.test',
  role: 'admin',
  status: 'actif',
  last_login_at: '2026-09-17T08:41:00.000000Z',
  created_at: '2026-06-02T10:00:00.000000Z',
}

const AUTRE: CompteAdmin = {
  id: 2,
  name: 'Awa Diallo',
  email: 'a.diallo@exemple.test',
  role: 'editeur',
  status: 'suspendu',
  last_login_at: null,
  created_at: '2026-09-15T09:30:00.000000Z',
}

/** Le meme compte, actif : le bouton porte alors « Suspendre ». */
const AUTRE_ACTIF: CompteAdmin = {
  ...AUTRE,
  status: 'actif',
  last_login_at: '2026-09-16T10:00:00.000000Z',
}

function reponse(corps: unknown, statut = 200) {
  return new Response(corps === null ? null : JSON.stringify(corps), {
    status: statut,
    headers: { 'Content-Type': 'application/json' },
  })
}

function liste(comptes: CompteAdmin[], meta: Record<string, number> = {}) {
  return reponse({
    data: comptes,
    meta: {
      current_page: 1,
      last_page: 1,
      per_page: 20,
      total: comptes.length,
      ...meta,
    },
  })
}

/** Monte l'ecran avec le compte 1 connecte, et la liste servie. */
async function monter(comptes: CompteAdmin[] = [MOI, AUTRE]) {
  const auth = useAuthStore()
  auth.utilisateur = { id: MOI.id, name: MOI.name, email: MOI.email, role: 'admin', embassy_id: 1 }
  vi.mocked(fetch).mockResolvedValue(liste(comptes))
  const ecran = mount(UtilisateursAdmin)
  await flushPromises()
  return ecran
}

function actions(ecran: VueWrapper, debut: string) {
  return ecran.findAll(`button[aria-label^="${debut}"]`)
}

function appelsPar(methode: string) {
  const appels = vi.mocked(fetch).mock.calls
  return appels.filter((appel) => (appel[1] as RequestInit | undefined)?.method === methode)
}

/**
 * Repond a la boite de confirmation. Les gestes irreversibles passaient par
 * `window.confirm` ; ils passent desormais par une boite du cadre, qu'il
 * faut donc actionner pour que l'appel parte.
 */
async function repondre(ecran: VueWrapper, reponse: 'valider' | 'renoncer'): Promise<void> {
  await ecran.get(`[data-confirmation="${reponse}"]`).trigger('click')
  await flushPromises()
}

describe('ecran des utilisateurs', () => {
  beforeEach(() => {
    setActivePinia(createPinia())
    vi.stubGlobal('fetch', vi.fn())
  })

  afterEach(() => {
    vi.unstubAllGlobals()
    vi.restoreAllMocks()
  })

  it('affiche les comptes servis, avec leur etat', async () => {
    const ecran = await monter()

    expect(ecran.text()).toContain('Mariam Bongo')
    expect(ecran.text()).toContain('Awa Diallo')
    expect(ecran.text()).toContain('Suspendu')
  })

  it('dit « Jamais connecté » plutot que d inventer une date', async () => {
    const ecran = await monter()

    expect(ecran.text()).toContain('Jamais connecté')
  })

  it('retire la suspension et la suppression de son propre compte', async () => {
    // Le seul refus du back que le front peut trancher avec certitude : la
    // comparaison de deux identifiants. « Vous ne pouvez pas modifier votre
    // propre compte ici. »
    const ecran = await monter([MOI, AUTRE_ACTIF])

    expect(actions(ecran, 'Suspendre Mariam')).toHaveLength(0)
    expect(actions(ecran, 'Supprimer Mariam')).toHaveLength(0)
    expect(actions(ecran, 'Suspendre Awa')).toHaveLength(1)
    expect(actions(ecran, 'Supprimer Awa')).toHaveLength(1)
  })

  it('ne calcule PAS le refus du dernier administrateur', async () => {
    // La liste est paginee : compter les administrateurs sur une page pourrait
    // se tromper. Le geste est donc offert meme quand il sera refuse, et c'est
    // le message du serveur qui s'affiche.
    const seulAdmin: CompteAdmin = { ...AUTRE, role: 'admin', status: 'actif' }
    const ecran = await monter([MOI, seulAdmin])

    expect(actions(ecran, 'Suspendre Awa')).toHaveLength(1)
  })

  it('affiche le refus du serveur sans masquer la liste', async () => {
    const ecran = await monter([MOI, AUTRE_ACTIF])
    vi.mocked(fetch).mockResolvedValueOnce(
      reponse({ message: 'Cette ambassade doit garder au moins un administrateur actif.' }, 422),
    )

    await actions(ecran, 'Suspendre Awa')[0]!.trigger('click')
    await repondre(ecran, 'valider')

    expect(ecran.text()).toContain('au moins un administrateur actif')
    // La liste reste lue : un echec d'action n'est pas un echec de lecture.
    expect(ecran.text()).toContain('Awa Diallo')
  })

  it('demande confirmation avant de suspendre, et n appelle rien si on refuse', async () => {
    const ecran = await monter([MOI, AUTRE_ACTIF])
    await actions(ecran, 'Suspendre Awa')[0]!.trigger('click')
    await repondre(ecran, 'renoncer')

    expect(appelsPar('PATCH')).toHaveLength(0)
  })

  it('suspend par la route de statut, jamais par le formulaire', async () => {
    const ecran = await monter([MOI, AUTRE_ACTIF])
    await actions(ecran, 'Suspendre Awa')[0]!.trigger('click')
    await repondre(ecran, 'valider')

    const [appel] = appelsPar('PATCH')
    expect(String(appel![0])).toBe('/api/admin/users/2/status')
  })

  it('n offre le renvoi d invitation que sur un compte suspendu', async () => {
    // Le back le refuse sur un compte suspendu par DECISION, et
    // `suspended_at` n'est pas servi : le front ne peut pas le deviner, donc
    // il offre le geste et laisse le serveur refuser.
    const ecran = await monter()

    expect(actions(ecran, "Renvoyer l'invitation à Awa")).toHaveLength(1)
    expect(actions(ecran, "Renvoyer l'invitation à Mariam")).toHaveLength(0)
  })

  it('affiche le lien quand le courriel n a pas pu partir', async () => {
    const ecran = await monter()
    vi.mocked(fetch).mockResolvedValueOnce(
      reponse({
        data: AUTRE,
        invitation: {
          url: 'https://exemple.test/invitation/9f3c',
          expires_at: '2026-09-24T08:41:00.000000Z',
          sent: false,
        },
      }),
    )

    await actions(ecran, "Renvoyer l'invitation à Awa")[0]!.trigger('click')
    await flushPromises()

    expect(ecran.text()).toContain('https://exemple.test/invitation/9f3c')
    expect(ecran.text()).toContain('Transmettez ce lien')
  })

  it('n affiche aucun lien quand le courriel est parti', async () => {
    // `url` est absente de la reponse dans ce cas : c'est un jeton en clair.
    const ecran = await monter()
    vi.mocked(fetch).mockResolvedValueOnce(
      reponse({
        data: AUTRE,
        invitation: { expires_at: '2026-09-24T08:41:00.000000Z', sent: true },
      }),
    )

    await actions(ecran, "Renvoyer l'invitation à Awa")[0]!.trigger('click')
    await flushPromises()

    expect(ecran.text()).toContain('Invitation envoyée')
    expect(ecran.text()).not.toContain('Transmettez ce lien')
  })

  it('annonce qu aucun mot de passe ne se choisit ici', async () => {
    const ecran = await monter()

    await ecran
      .findAll('button')
      .find((b) => b.text().includes('Inviter un compte'))!
      .trigger('click')
    await flushPromises()

    expect(ecran.text()).toContain('Aucun mot de passe ne se choisit ici')
  })

  it('n envoie pas le role quand il n a pas change', async () => {
    // L'envoyer a l'identique sur son propre compte suffirait a declencher le
    // refus du back, qui garde TOUTE modification de role sur le compte
    // courant.
    const ecran = await monter()
    await actions(ecran, 'Modifier Mariam')[0]!.trigger('click')
    await flushPromises()
    vi.mocked(fetch).mockResolvedValueOnce(reponse({ data: MOI }))

    await ecran.get('form').trigger('submit')
    await flushPromises()

    const [appel] = appelsPar('PATCH')
    expect(String((appel![1] as RequestInit).body)).not.toContain('role')
  })

  it('verrouille son propre role, en disant pourquoi', async () => {
    const ecran = await monter()

    await actions(ecran, 'Modifier Mariam')[0]!.trigger('click')
    await flushPromises()

    expect(ecran.get('[role="combobox"]').attributes('disabled')).toBeDefined()
    expect(ecran.text()).toContain('Vous ne pouvez pas modifier votre propre compte ici.')
  })

  it('n annonce pas « aucun compte » quand la lecture a echoue', async () => {
    // Une liste vide est une affirmation, et le compte de la personne
    // connectee y figure toujours : dire « aucun » sur une panne ferait passer
    // un incident pour un fait.
    const auth = useAuthStore()
    auth.utilisateur = { id: 1, name: 'x', email: 'x@y.test', role: 'admin', embassy_id: 1 }
    vi.mocked(fetch).mockRejectedValue(new Error('reseau'))
    const ecran = mount(UtilisateursAdmin)
    await flushPromises()

    expect(ecran.text()).not.toContain('Aucun compte')
    expect(ecran.text()).toContain('Réessayer')
  })
})
