import { describe, it, expect, vi, afterEach } from 'vitest'
import { normaliserEmbassy, type EmbassyServie } from '../bootstrap'
import {
  enregistrerEmbassy,
  estCouleurValide,
  rapportDeContraste,
  avisSurLaCouleur,
  versSaisie,
} from '../embassy'

const SERVIE: EmbassyServie = {
  id: 2,
  slug: 'gabon-guinee',
  domain: 'ambagabonguinee.com',
  display_name: 'Ambassade de la Republique du Gabon en Guinee',
  identite: {
    country_name_official: 'Republique Gabonaise',
    country_name_short: 'Gabon',
    demonym: 'gabonais',
    flag_image: '/drapeau.png',
    logo_image: '/logo.png',
  },
  theme: { color_primary: '#009E60', color_secondary: '#FCD116', color_accent: '#3A75C4' },
  contact: {
    address: 'Conakry',
    phone: '+224 000 00 00 01',
    phones: [
      { label: 'Standard', number: '+224 000 00 00 01' },
      { label: 'Visas', number: '+224 000 00 00 02' },
    ],
    email: 'ambassade@exemple.test',
    hours: 'Du lundi au vendredi',
  },
  modules: { services_consulaires: true },
}

afterEach(() => vi.unstubAllGlobals())

function servir(corps: unknown, statut = 200) {
  const appels: { url: string; corps: unknown }[] = []
  vi.stubGlobal(
    'fetch',
    vi.fn((url: string, options: RequestInit) => {
      appels.push({ url, corps: options.body ? JSON.parse(String(options.body)) : null })
      return Promise.resolve(
        new Response(JSON.stringify(corps), {
          status: statut,
          headers: { 'Content-Type': 'application/json' },
        }),
      )
    }),
  )
  return appels
}

describe('la liste des numeros', () => {
  it('vaut liste vide quand le back du domaine est anterieur a la liste', () => {
    const ancien = { ...SERVIE, contact: { ...SERVIE.contact, phones: undefined } }
    expect(normaliserEmbassy(ancien).contact.phones).toEqual([])
  })
})

describe('versSaisie', () => {
  const saisie = versSaisie(normaliserEmbassy(SERVIE))

  it("rebatit l'imbrication de l'identite que l'API attend", () => {
    expect(saisie.identite.country_name_official).toBe('Republique Gabonaise')
    expect(saisie).not.toHaveProperty('country_name_official')
  })

  it('laisse de cote le numero principal, qui est derive et non stocke', () => {
    expect(saisie.contact).not.toHaveProperty('phone')
    expect(saisie.contact.phones).toHaveLength(2)
  })

  it("n'emporte aucun des trois champs refuses en ecriture", () => {
    expect(saisie).not.toHaveProperty('slug')
    expect(saisie).not.toHaveProperty('domain')
    expect(saisie).not.toHaveProperty('modules')
  })

  it("detache les numeros, pour qu'une saisie annulee ne modifie pas l'origine", () => {
    const embassy = normaliserEmbassy(SERVIE)
    const copie = versSaisie(embassy)
    copie.contact.phones[0]!.number = '+224 999'
    expect(embassy.contact.phones[0]?.number).toBe('+224 000 00 00 01')
  })
})

describe('enregistrerEmbassy', () => {
  it("lit l'enveloppe `data` des routes d'administration, pas `embassy`", async () => {
    servir({ data: SERVIE })
    const rendue = await enregistrerEmbassy(versSaisie(normaliserEmbassy(SERVIE)))
    expect(rendue.country_name_official).toBe('Republique Gabonaise')
  })

  it("n'envoie jamais de `contact.phone`, que l'API refuse", async () => {
    const appels = servir({ data: SERVIE })
    await enregistrerEmbassy(versSaisie(normaliserEmbassy(SERVIE)))
    const envoye = appels[0]?.corps as { contact: Record<string, unknown> }
    expect(envoye.contact).not.toHaveProperty('phone')
  })
})

describe('avisSurLaCouleur', () => {
  it("refuse ce qui n'est pas un hexadecimal", () => {
    expect(avisSurLaCouleur('vert', true)?.niveau).toBe('refus')
    expect(estCouleurValide('#abc')).toBe(true)
    expect(estCouleurValide('#009E60')).toBe(true)
    expect(estCouleurValide('009E60')).toBe(false)
  })

  it('juge la couleur sur la paire que le gabarit emploie vraiment', () => {
    // Le jaune du drapeau gabonais : illisible sous du texte blanc, et
    // parfaitement lisible sous le texte fonce du gabarit. C'est pour cela
    // que le controle ne porte pas sur la couleur seule.
    expect(avisSurLaCouleur('#FCD116', true)?.niveau).toBe('refus')
    expect(avisSurLaCouleur('#FCD116', false)).toBeNull()
  })

  it('avertit sans refuser le vert du drapeau gabonais, qui vaut 3,47', () => {
    // Le cas qui a fait exister les deux seuils : le theme reel de
    // l'ambassade du Gabon passerait sous un unique seuil a 4,5, et un
    // formulaire qui refuse a une ambassade la couleur de son drapeau prend
    // une decision qui ne lui appartient pas.
    expect(avisSurLaCouleur('#009E60', true)?.niveau).toBe('avertissement')
  })

  it("laisse passer sans rien dire l'accent bleu, qui vaut 4,64", () => {
    expect(avisSurLaCouleur('#3A75C4', true)).toBeNull()
  })

  it('mesure le contraste selon WCAG : le noir sur blanc vaut 21', () => {
    expect(rapportDeContraste('#000000', '#ffffff')).toBeCloseTo(21, 1)
    expect(rapportDeContraste('#123456', '#123456')).toBeCloseTo(1, 5)
  })
})
