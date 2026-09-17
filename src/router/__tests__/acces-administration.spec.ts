import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest'
import { readFileSync } from 'node:fs'
import { resolve } from 'node:path'
import { createPinia, setActivePinia } from 'pinia'
import routeur from '../index'
import { useAuthStore } from '@/stores/auth'

/**
 * La garde d'acces aux deux surfaces qui engagent l'ambassade.
 *
 * Elle est cosmetique : `role.admin` refuse `PUT /api/admin/embassy` et toute
 * la surface `/api/admin/users` en 403, lecture comprise. Ce qui est verifie
 * ici, c'est qu'elle ne se trompe pas de sens — ni ouverte a un editeur, ni
 * fermee a un administrateur dont l'identite n'est pas encore revenue.
 */
function connecter(role: string | null) {
  const auth = useAuthStore()
  auth.token = 'jeton'
  auth.utilisateur =
    role === null ? null : { id: 1, name: 'X', email: 'x@y.test', role, embassy_id: 1 }
}

describe("acces aux surfaces d'administration", () => {
  beforeEach(() => {
    setActivePinia(createPinia())
    // Aucune route de ce test ne rend un composant : le garde tranche avant.
    vi.stubGlobal('fetch', vi.fn().mockRejectedValue(new Error('hors sujet')))
  })

  afterEach(async () => {
    vi.unstubAllGlobals()
    await routeur.push('/')
  })

  it('laisse entrer un administrateur', async () => {
    connecter('admin')

    await routeur.push('/dashboard/utilisateurs')

    expect(routeur.currentRoute.value.path).toBe('/dashboard/utilisateurs')
  })

  it('renvoie un editeur vers le tableau de bord', async () => {
    connecter('editeur')

    await routeur.push('/dashboard/utilisateurs')

    expect(routeur.currentRoute.value.path).toBe('/dashboard')
  })

  it("ferme aussi les parametres de l'ambassade a un editeur", async () => {
    // Le back exige desormais le role administrateur sur
    // `PUT /api/admin/embassy` : l'ecran se lirait, et n'enregistrerait rien.
    connecter('editeur')

    await routeur.push('/dashboard/parametres')

    expect(routeur.currentRoute.value.path).toBe('/dashboard')
  })

  it("laisse passer quand l'identite n'est pas connue", async () => {
    // Ne pas savoir n'est pas un refus : `/auth/me` peut etre en panne alors
    // que le jeton est bon, et fermer retirerait ses parametres a un
    // administrateur pour un incident de notre cote.
    connecter(null)

    await routeur.push('/dashboard/parametres')

    expect(routeur.currentRoute.value.path).toBe('/dashboard/parametres')
  })

  it('laisse le contenu ouvert a un editeur', async () => {
    connecter('editeur')

    await routeur.push('/dashboard/articles')

    expect(routeur.currentRoute.value.path).toBe('/dashboard/articles')
  })
})

describe("chemin de la page d'invitation", () => {
  it('correspond exactement a celui que le back met dans le courriel', () => {
    // Le back batit l'URL sur `INVITATION_PATH`, dont la valeur par defaut est
    // `/invitation/{token}`. Un ecart ici et chaque invitation mene a une
    // adresse introuvable : creer un compte n'aboutirait a rien, et le defaut
    // ne se verrait qu'au premier agent invite. Meme discipline que le chemin
    // impose par le QR d'inscription aux evenements.
    const source = readFileSync(resolve(__dirname, '../index.ts'), 'utf8')

    expect(source).toContain("path: '/invitation/:token'")
    expect(routeur.resolve('/invitation/9f3c').name).toBe('invitation')
  })
})
