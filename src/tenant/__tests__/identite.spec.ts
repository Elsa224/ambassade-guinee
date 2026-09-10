import { describe, it, expect, beforeEach } from 'vitest'
import { createPinia, setActivePinia } from 'pinia'
import { libelleAmbassade, articleDuPays, useIdentite } from '../identite'
import { useTenantStore } from '@/stores/tenant'
import type { Embassy } from '@/api/bootstrap'
import gabonFixture from '@/api/fixtures/bootstrap-gabon.json'

describe("libelle d'une ambassade", () => {
  it('accorde l article au nom officiel du pays', () => {
    expect(libelleAmbassade('République Gabonaise')).toBe('Ambassade de la République Gabonaise')
    expect(libelleAmbassade('Republique de Guinee')).toBe('Ambassade de la Republique de Guinee')
    expect(libelleAmbassade('Royaume du Maroc')).toBe('Ambassade du Royaume du Maroc')
    expect(libelleAmbassade("États-Unis d'Amérique")).toBe("Ambassade des États-Unis d'Amérique")
  })

  it('se passe d article pour un pays qui n en porte pas', () => {
    expect(libelleAmbassade('Malte')).toBe('Ambassade de Malte')
    expect(libelleAmbassade('Cuba')).toBe('Ambassade de Cuba')
  })

  it('contracte devant une voyelle', () => {
    expect(articleDuPays('Irlande')).toBe("d'")
    expect(libelleAmbassade('Irlande')).toBe("Ambassade d'Irlande")
  })

  it('reste neutre sans nom de pays', () => {
    // Sans configuration chargee, mieux vaut « Ambassade » que le nom d'un
    // pays qui n'est peut-etre pas celui du domaine visite.
    expect(libelleAmbassade('')).toBe('Ambassade')
    expect(libelleAmbassade('   ')).toBe('Ambassade')
  })
})

describe("identite de l'ambassade courante", () => {
  beforeEach(() => {
    setActivePinia(createPinia())
  })

  it('ne renvoie aucune identite sans configuration chargee', () => {
    const identite = useIdentite()

    expect(identite.nomOfficiel.value).toBe('')
    expect(identite.nomCourt.value).toBe('')
    expect(identite.logo.value).toBe('')
    expect(identite.nomDeLAmbassade.value).toBe('Ambassade')
  })

  it('reprend les valeurs du tenant', () => {
    useTenantStore().embassy = gabonFixture.embassy as unknown as Embassy
    const identite = useIdentite()

    expect(identite.nomDeLAmbassade.value).toBe('Ambassade de la Republique Gabonaise')
    expect(identite.nomCourt.value).toBe('Gabon')
    expect(identite.gentile.value).toBe('gabonais')
    expect(identite.courriel.value).toBe('ambassade@gabon-gn.org')
  })

  it('laisse vides les coordonnees que l ambassade n a pas fournies', () => {
    useTenantStore().embassy = gabonFixture.embassy as unknown as Embassy
    const identite = useIdentite()

    // L'ambassade du Gabon n'a pas encore transmis son adresse ni son
    // telephone : le gabarit masque ces lignes plutot que d'en montrer
    // d'autres.
    expect(identite.adresse.value).toBe('')
    expect(identite.telephone.value).toBe('')
  })

  it("prefere le libelle complet fourni par l'ambassade", () => {
    // « Ambassade de la Republique Gabonaise » est juste mais incomplet : il
    // ne dit pas ou l'ambassade est installee. Aucun accord ne peut deviner
    // « en Guinee » plutot que « aux USA » ou « au Maroc » ; seul le back
    // peut le transmettre.
    useTenantStore().embassy = {
      ...(gabonFixture.embassy as unknown as Embassy),
      display_name: 'Ambassade de la République du Gabon en Guinée',
    }

    expect(useIdentite().nomDeLAmbassade.value).toBe(
      'Ambassade de la République du Gabon en Guinée',
    )
  })

  it('se rabat sur le nom du pays quand le libelle complet manque', () => {
    useTenantStore().embassy = {
      ...(gabonFixture.embassy as unknown as Embassy),
      display_name: '   ',
    }

    // Un libelle vide ou blanc ne doit pas produire un titre vide.
    expect(useIdentite().nomDeLAmbassade.value).toBe('Ambassade de la Republique Gabonaise')
  })
})
