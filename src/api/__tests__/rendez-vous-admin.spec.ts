import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest'
import {
  listerRendezVous,
  recupererRendezVous,
  recupererPiece,
  approuverRendezVous,
  refuserRendezVous,
  refusDuMotif,
  messageErreurRdvAdmin,
  MOTIF_MAXIMUM,
  CHEMIN_RDV_ADMIN,
} from '../rendez-vous-admin'

const LIGNE = {
  reference: 'rdv-abc123',
  status: 'pending',
  kind: 'external',
  scheduledAt: '2026-10-02T09:30:00.000Z',
  department: { slug: 'q4k2m9xv0bt7ra1', name: 'Protocole' },
  purpose: 'Depot de dossier',
  host: null,
  visitor: {
    firstName: 'Awa',
    lastName: 'Diallo',
    email: 'awa@exemple.test',
    phone: '+224600000000',
    idNumber: 'GN-1234',
  },
  hasIdCardFront: true,
  hasIdCardBack: false,
  rejectionReason: null,
  checkInAt: null,
  checkOutAt: null,
  durationMinutes: null,
  createdAt: '2026-09-23T10:00:00.000Z',
  qr: null,
}

/**
 * Une reponse NEUVE a chaque appel.
 *
 * Un `Response` unique rejoue sur deux appels leve « Body has already been
 * read » : son corps ne se lit qu'une fois. Le bouchon fabrique donc la
 * reponse a la demande, sinon le deuxieme appel d'un test echoue pour une
 * raison qui n'a rien a voir avec le code teste.
 */
function reponse(corps: unknown, statut = 200) {
  return new Response(JSON.stringify(corps), {
    status: statut,
    headers: { 'Content-Type': 'application/json' },
  })
}

/** L'URL du dernier appel, telle que `fetch` l'a recue. */
function dernierChemin(): string {
  const appels = vi.mocked(fetch).mock.calls
  return String(appels[appels.length - 1]?.[0])
}

describe('consultation des rendez-vous', () => {
  beforeEach(() => {
    vi.stubGlobal(
      'fetch',
      vi.fn().mockImplementation(async () => reponse({ data: [LIGNE] })),
    )
  })

  afterEach(() => {
    vi.unstubAllGlobals()
  })

  it('omet les filtres vides plutot que de les envoyer en chaine vide', async () => {
    // `status=''` serait compare par l'amont a ses etats, et ne rendrait plus
    // aucune ligne : un filtre non choisi doit etre absent, pas vide.
    await listerRendezVous({ page: 2, limit: 50, status: '', search: '  ', from: '2026-10-01' })

    const chemin = dernierChemin()
    expect(chemin).toContain('page=2')
    expect(chemin).toContain('limit=50')
    expect(chemin).toContain('from=2026-10-01')
    expect(chemin).not.toContain('status=')
    expect(chemin).not.toContain('search=')
  })

  it('deduit la pagination quand le back ne la sert pas', async () => {
    const { pagination } = await listerRendezVous({ page: 1, limit: 20 })
    expect(pagination).toEqual({ page: 1, limit: 20, total: 0, totalPages: 1 })
  })

  it('reprend la pagination servie par le back', async () => {
    vi.mocked(fetch).mockImplementation(async () =>
      reponse({ data: [LIGNE], meta: { page: 3, limit: 20, total: 47, totalPages: 3 } }),
    )
    const { pagination, rendezVous } = await listerRendezVous({ page: 3 })
    expect(pagination.total).toBe(47)
    expect(rendezVous[0]?.reference).toBe('rdv-abc123')
  })

  it('encode la reference sur les quatre routes qui la portent', async () => {
    // L'amont lit la reference comme une EXPRESSION REGULIERE, dans le
    // parametre `q` : un metacaractere qui y arriverait ne filtrerait pas la
    // liste qu'on croit. La route du back la borne a `[A-Za-z0-9_-]+`, et
    // l'encodage est la ceinture du front.
    vi.mocked(fetch).mockImplementation(async () => reponse({ data: LIGNE }))
    await recupererRendezVous('rdv .*')
    expect(dernierChemin()).toBe(`${CHEMIN_RDV_ADMIN}/rdv%20.*`)

    await approuverRendezVous('rdv .*')
    expect(dernierChemin()).toBe(`${CHEMIN_RDV_ADMIN}/rdv%20.*/approve`)

    await refuserRendezVous('rdv .*', 'Dossier incomplet')
    expect(dernierChemin()).toBe(`${CHEMIN_RDV_ADMIN}/rdv%20.*/reject`)

    vi.mocked(fetch).mockImplementation(
      async () => new Response(new Blob(['x'], { type: 'image/png' })),
    )
    await recupererPiece('rdv .*', 'recto')
    expect(dernierChemin()).toBe(`${CHEMIN_RDV_ADMIN}/rdv%20.*/piece/recto`)
  })

  it('envoie le motif sous le nom que le back valide', async () => {
    vi.mocked(fetch).mockImplementation(async () =>
      reponse({ data: { ...LIGNE, status: 'rejected' } }),
    )
    await refuserRendezVous('rdv-abc123', 'Dossier incomplet')

    const appel = vi.mocked(fetch).mock.calls[0]!
    expect(appel[1]?.method).toBe('PATCH')
    expect(JSON.parse(String(appel[1]?.body))).toEqual({ reason: 'Dossier incomplet' })
  })

  it('refuse un motif absent ou trop long avant tout appel', () => {
    expect(refusDuMotif('   ')).not.toBe('')
    expect(refusDuMotif('x'.repeat(MOTIF_MAXIMUM + 1))).not.toBe('')
    expect(refusDuMotif('Dossier incomplet')).toBe('')
  })

  it("nomme le refus de role, que le client range autrement dans 'panne'", async () => {
    // 403 ne figure pas dans `genreErreur` : sans ce cas, un editeur lirait
    // « service injoignable » la ou c'est son role qui ferme la porte.
    vi.mocked(fetch).mockImplementation(async () => reponse({ message: 'Interdit.' }, 403))
    const souleve = await listerRendezVous().catch((erreur: unknown) => erreur)

    expect(messageErreurRdvAdmin(souleve)).toContain("Vous n'avez pas accès")
  })

  it('presente un 502 comme une panne du service, jamais comme une faute de saisie', async () => {
    // Sur une ambassade dont le compte de service SecureCheck n'est pas
    // renseigne, TOUS les appels finissent ici des le premier.
    vi.mocked(fetch).mockImplementation(async () =>
      reponse({ message: 'Amont indisponible.' }, 502),
    )
    const souleve = await listerRendezVous().catch((erreur: unknown) => erreur)

    expect(messageErreurRdvAdmin(souleve)).toContain('Ambassade Secure')
  })
})
