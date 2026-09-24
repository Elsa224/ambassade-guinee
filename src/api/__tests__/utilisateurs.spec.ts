import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest'
import {
  changerStatutCompte,
  creerCompte,
  etatDuCompte,
  listerComptes,
  modifierCompteAdmin,
  renvoyerInvitation,
  ROLES_ATTRIBUABLES,
  supprimerCompte,
  type CompteAdmin,
} from '../utilisateurs'

const COMPTE: CompteAdmin = {
  id: 7,
  name: 'Awa Diallo',
  email: 'a.diallo@exemple.test',
  role: 'editeur',
  status: 'suspendu',
  last_login_at: null,
  created_at: '2026-09-15T09:30:00.000000Z',
}

function reponse(corps: unknown, statut = 200) {
  return new Response(corps === null ? null : JSON.stringify(corps), {
    status: statut,
    headers: { 'Content-Type': 'application/json' },
  })
}

function servir(corps: unknown, statut = 200) {
  vi.mocked(fetch).mockResolvedValue(reponse(corps, statut))
}

function dernierAppel() {
  const appels = vi.mocked(fetch).mock.calls
  return appels[appels.length - 1]!
}

describe('surface des comptes', () => {
  beforeEach(() => {
    vi.stubGlobal('fetch', vi.fn())
  })

  afterEach(() => {
    vi.unstubAllGlobals()
  })

  it('lit la pagination que le back sert, plutot que la liste entiere', async () => {
    // Le contrat du front demandait une liste nue ; le back pagine. Lire
    // `data` comme le tout aurait cache les comptes au-dela du vingt-cinquieme
    // sans qu'aucun ecran ne s'en plaigne.
    servir({
      data: [COMPTE],
      meta: { current_page: 2, last_page: 4, per_page: 20, total: 77 },
    })

    const page = await listerComptes(2)

    expect(page.comptes).toHaveLength(1)
    expect(page.meta).toEqual({ current_page: 2, last_page: 4, per_page: 20, total: 77 })
  })

  it('se rabat sur une page unique quand `meta` manque', async () => {
    servir({ data: [COMPTE] })

    const page = await listerComptes()

    expect(page.meta.last_page).toBe(1)
    expect(page.meta.total).toBe(1)
  })

  it('borne `per_page` a ce que le back accepte', async () => {
    // Le back refuse au-dela de cent en 422 : demander mille rendrait une
    // erreur de validation sur une simple lecture.
    servir({ data: [] })

    await listerComptes(1, 1000)

    expect(String(dernierAppel()[0])).toContain('per_page=100')
  })

  it("n'envoie aucun mot de passe a la creation", async () => {
    // Le back refuse `password` explicitement : le secret est choisi par la
    // personne invitee, jamais par l'administrateur.
    servir(
      {
        data: COMPTE,
        invitation: { expires_at: '2026-09-24T08:41:00.000000Z', sent: true },
      },
      201,
    )

    const resultat = await creerCompte({
      name: 'Awa Diallo',
      email: 'a.diallo@exemple.test',
      role: 'editeur',
    })

    const corps = String((dernierAppel()[1] as RequestInit).body)
    expect(corps).not.toContain('password')
    expect(resultat.invitation?.sent).toBe(true)
    // `url` est absente des que le courriel est parti : c'est un jeton en
    // clair, le back refuse de le faire circuler sans raison.
    expect(resultat.invitation?.url).toBeUndefined()
  })

  it('rend le lien quand le courriel n a pas pu partir', async () => {
    servir(
      {
        data: COMPTE,
        invitation: {
          url: 'https://ambagabonguinee.com/invitation/9f3c',
          expires_at: '2026-09-24T08:41:00.000000Z',
          sent: false,
        },
      },
      201,
    )

    const resultat = await creerCompte({ name: 'A', email: 'a@b.test', role: 'editeur' })

    expect(resultat.invitation?.url).toBe('https://ambagabonguinee.com/invitation/9f3c')
  })

  it('sait lire une invitation rendue par une modification', async () => {
    // Changer l'adresse d'un compte jamais active invalide l'ancien lien,
    // envoye a l'ancienne adresse, et en emet un nouveau.
    servir({
      data: { ...COMPTE, email: 'corrige@exemple.test' },
      invitation: { url: 'https://exemple.test/invitation/neuf', expires_at: 'x', sent: false },
    })

    const resultat = await modifierCompteAdmin(7, { email: 'corrige@exemple.test' })

    expect(dernierAppel()[0]).toBe('/api/admin/users/7')
    expect((dernierAppel()[1] as RequestInit).method).toBe('PATCH')
    expect(resultat.invitation?.url).toBe('https://exemple.test/invitation/neuf')
  })

  it('change le statut par sa propre route', async () => {
    // Le statut ne passe PAS par `PATCH users/{id}` : le back le refuse avec
    // « Le statut se change par PATCH users/{id}/status. »
    servir({ data: { ...COMPTE, status: 'actif' } })

    await changerStatutCompte(7, 'actif')

    expect(dernierAppel()[0]).toBe('/api/admin/users/7/status')
    expect((dernierAppel()[1] as RequestInit).body).toBe(JSON.stringify({ status: 'actif' }))
  })

  it('renvoie une invitation sur la route dediee', async () => {
    servir({ data: COMPTE, invitation: { expires_at: 'x', sent: true } })

    await renvoyerInvitation(7)

    expect(dernierAppel()[0]).toBe('/api/admin/users/7/invitation')
    expect((dernierAppel()[1] as RequestInit).method).toBe('POST')
  })

  it('supprime par DELETE', async () => {
    servir(null, 204)

    await supprimerCompte(7)

    expect((dernierAppel()[1] as RequestInit).method).toBe('DELETE')
  })

  it("n'offre que les roles attribuables depuis une ambassade", () => {
    // `super_admin` est refuse en 403 a la creation comme a la modification :
    // le proposer ne produirait qu'un refus. `agent_rdv` a rejoint la liste
    // le 2026-09-24, quand le back l'a livre dans `UserRole::attribuables()`.
    expect(ROLES_ATTRIBUABLES.map((role) => role.valeur)).toEqual(['editeur', 'agent_rdv', 'admin'])
    expect(ROLES_ATTRIBUABLES.map((role) => role.valeur)).not.toContain('super_admin')
  })
})

describe('etat d un compte', () => {
  it('nomme les deux etats que le back applique', () => {
    expect(etatDuCompte('actif')).toEqual({ libelle: 'Actif', ton: 'positif' })
    expect(etatDuCompte('suspendu')).toEqual({ libelle: 'Suspendu', ton: 'attention' })
  })

  it('rend un etat inconnu tel quel plutot que de le masquer', () => {
    // C'est ce repli qui a rendu « scheduled » visible sur les evenements, et
    // c'est comme cela que le defaut a ete trouve.
    expect(etatDuCompte('archive')).toEqual({ libelle: 'archive', ton: 'eteint' })
  })
})
