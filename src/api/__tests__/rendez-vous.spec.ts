import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest'
import {
  recupererServiceRdv,
  demanderRendezVous,
  libelleStatut,
  messageErreurRdv,
} from '../rendez-vous'

function reponse(corps: unknown, statut = 200) {
  return new Response(corps === null ? null : JSON.stringify(corps), {
    status: statut,
    headers: { 'Content-Type': 'application/json' },
  })
}

const CREEE = {
  reference: 'RDV-2026-000123',
  status: 'pending',
  scheduledAt: '2026-10-01T10:30:00.000Z',
  department: { slug: 'protocole', name: 'Protocole' },
  purpose: 'Remise de documents',
  host: null,
}

const DEMANDE = {
  firstName: 'Aya',
  lastName: 'Camara',
  phone: '+224 000 00 00 00',
  email: 'aya.camara@example.org',
  date: '2026-10-01',
  time: '10:30',
  purpose: 'Remise de documents',
}

describe('relais des rendez-vous de chancellerie', () => {
  beforeEach(() => {
    vi.stubGlobal('fetch', vi.fn())
  })

  afterEach(() => {
    vi.unstubAllGlobals()
  })

  it('resout le service sur la route publique du relais', async () => {
    vi.mocked(fetch).mockResolvedValue(
      reponse({ data: { name: 'Ambassade du Gabon', departments: [] } }),
    )

    const service = await recupererServiceRdv()

    expect(vi.mocked(fetch).mock.calls[0]?.[0]).toBe('/api/secure/rdv')
    expect(service.name).toBe('Ambassade du Gabon')
  })

  it('envoie la demande en multipart, sous les noms de SecureCheck', async () => {
    vi.mocked(fetch).mockResolvedValue(reponse({ data: CREEE }, 201))

    await demanderRendezVous(DEMANDE)

    const appels = vi.mocked(fetch).mock.calls
    const [url, options] = appels[0]!
    expect(url).toBe('/api/secure/rdv')
    expect(options?.method).toBe('POST')

    const corps = options?.body as FormData
    expect(corps).toBeInstanceOf(FormData)
    expect(corps.get('firstName')).toBe('Aya')
    expect(corps.get('lastName')).toBe('Camara')
    expect(corps.get('date')).toBe('2026-10-01')
    expect(corps.get('time')).toBe('10:30')
    expect(corps.get('purpose')).toBe('Remise de documents')
  })

  it('ne pose pas le Content-Type lui-meme : le navigateur doit ecrire la frontiere', () => {
    // Un `multipart/form-data` sans frontiere est illisible cote serveur.
    vi.mocked(fetch).mockResolvedValue(reponse({ data: CREEE }, 201))

    return demanderRendezVous(DEMANDE).then(() => {
      const entetes = vi.mocked(fetch).mock.calls[0]?.[1]?.headers as Record<string, string>
      expect(entetes['Content-Type']).toBeUndefined()
    })
  })

  it('omet les champs facultatifs laisses vides plutot que d envoyer une chaine vide', async () => {
    // Le multipart n'a ni `null` ni booleen : tout y est chaine. Le CMS retire
    // les cles nulles avant de relayer, il ne devine pas qu'une chaine vide
    // voulait dire « absent ».
    vi.mocked(fetch).mockResolvedValue(reponse({ data: CREEE }, 201))

    await demanderRendezVous({ ...DEMANDE, host: '', departmentSlug: '', idNumber: '   ' })

    const corps = vi.mocked(fetch).mock.calls[0]?.[1]?.body as FormData
    expect(corps.has('host')).toBe(false)
    expect(corps.has('departmentSlug')).toBe(false)
    expect(corps.has('idNumber')).toBe(false)
  })

  it('joint les deux faces de la piece d identite sous leurs noms propres', async () => {
    vi.mocked(fetch).mockResolvedValue(reponse({ data: CREEE }, 201))

    const recto = new File(['recto'], 'recto.jpg', { type: 'image/jpeg' })
    const verso = new File(['verso'], 'verso.jpg', { type: 'image/jpeg' })
    await demanderRendezVous({ ...DEMANDE, idCardFront: recto, idCardBack: verso })

    const corps = vi.mocked(fetch).mock.calls[0]?.[1]?.body as FormData
    // Deux fichiers distincts, et non un champ `idCard` unique : la
    // documentation amont qui l'annonce est perimee.
    expect(corps.get('idCardFront')).toBe(recto)
    expect(corps.get('idCardBack')).toBe(verso)
  })

  it('traduit les six etats de SecureCheck, et ne rend jamais un code brut', () => {
    expect(libelleStatut('pending')).toBe('En attente de confirmation')
    expect(libelleStatut('approved')).toBe('Confirmée')
    expect(libelleStatut('rejected')).toBe('Refusée')
    expect(libelleStatut('cancelled')).toBe('Annulée')
    expect(libelleStatut('checked_in')).toBe('Visiteur arrivé')
    expect(libelleStatut('checked_out')).toBe('Visite terminée')
    expect(libelleStatut('something_new')).toBe('État inconnu')
  })

  it('affiche le detail par champ quand le CMS a valide lui-meme', async () => {
    vi.mocked(fetch).mockResolvedValue(
      reponse(
        {
          message: 'Les données envoyées sont invalides.',
          errors: { date: ['La date demandée ne peut pas être dans le passé.'] },
        },
        422,
      ),
    )

    await expect(demanderRendezVous(DEMANDE)).rejects.toSatisfy((souleve: unknown) => {
      expect(messageErreurRdv(souleve)).toBe('La date demandée ne peut pas être dans le passé.')
      return true
    })
  })

  it('remplace le 422 relaye, muet, par un texte qui dit quoi faire', async () => {
    // Le refus venu d'Ambassade Secure ne porte pas d'`errors` : son corps est
    // jete cote CMS parce qu'il renverrait les champs soumis. Le message
    // generique qui reste n'apprend rien au visiteur — typiquement le cas
    // d'une heure deja passee, que le CMS laisse passer et que l'amont refuse.
    vi.mocked(fetch).mockResolvedValue(
      reponse({ message: 'Données refusées par le service Ambassade Secure.' }, 422),
    )

    await expect(demanderRendezVous(DEMANDE)).rejects.toSatisfy((souleve: unknown) => {
      const message = messageErreurRdv(souleve)
      expect(message).not.toContain('Ambassade Secure')
      expect(message).toContain("Vérifiez la date et l'heure")
      return true
    })
  })

  it('presente un 404 comme une panne, et non comme une faute du visiteur', async () => {
    // Trois causes rendent le meme 404 — module ferme, ambassade sans
    // entreprise en amont, `departmentSlug` inconnu — et aucune n'est
    // corrigeable dans le formulaire. « Ressource introuvable. » n'aiderait
    // personne.
    vi.mocked(fetch).mockResolvedValue(reponse({ message: 'Ressource introuvable.' }, 404))

    await expect(demanderRendezVous(DEMANDE)).rejects.toSatisfy((souleve: unknown) => {
      expect(messageErreurRdv(souleve)).toBe(
        'Le service est momentanément indisponible. Réessayez dans un instant.',
      )
      return true
    })
  })

  it('ne presente pas une panne reseau comme une faute de saisie', async () => {
    vi.mocked(fetch).mockRejectedValue(new Error('Failed to fetch'))

    await expect(recupererServiceRdv()).rejects.toSatisfy((souleve: unknown) => {
      expect(messageErreurRdv(souleve)).toBe(
        'Le service est momentanément indisponible. Réessayez dans un instant.',
      )
      return true
    })
  })
})
