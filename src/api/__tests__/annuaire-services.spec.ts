import { describe, it, expect } from 'vitest'
import {
  grouperParService,
  servicesSaisis,
  normaliserAnnuaire,
  type MembrePersonnel,
} from '../annuaire'

function membre(
  id: number,
  position: number,
  department: string | null,
  name = `Agent ${id}`,
): MembrePersonnel {
  return {
    id,
    name,
    role: 'Fonction',
    email: null,
    phone: null,
    image_url: null,
    department,
    position,
  }
}

describe('personnel regroupe par service', () => {
  it('range les membres sous leur service, dans l ordre servi', () => {
    const groupes = grouperParService([
      membre(1, 1, 'Direction'),
      membre(2, 2, 'Service Visa'),
      membre(3, 3, 'Direction'),
    ])

    expect(groupes.map((g) => g.nom)).toEqual(['Direction', 'Service Visa'])
    expect(groupes[0]?.membres.map((m) => m.id)).toEqual([1, 3])
  })

  it('ordonne les groupes par la position MINIMALE de leurs membres', () => {
    // Le point de ce test, et la raison pour laquelle la regle existe : un
    // agent ajoute en fin de liste porte la position la plus haute. Si l'ordre
    // des groupes suivait les apparitions dans le tableau servi, son service
    // entier sauterait en fin de page a la simple addition d'une personne.
    // Cela serait lu comme un bug et n'en serait pas un.
    const groupes = grouperParService([
      membre(1, 1, 'Direction'),
      membre(2, 2, 'Service Visa'),
      // Un nouveau venu rattache a la Direction, ajoute tout en bas.
      membre(3, 99, 'Direction'),
    ])

    expect(groupes.map((g) => g.nom)).toEqual(['Direction', 'Service Visa'])
  })

  it('renvoie les membres sans service en dernier, sans titre', () => {
    // Meme quand leur position les placerait en tete : un groupe sans nom n'a
    // rien pour s'annoncer, et l'ouvrir la page par une liste anonyme serait
    // illisible.
    const groupes = grouperParService([
      membre(1, 1, null),
      membre(2, 5, 'Service Visa'),
      membre(3, 9, null),
    ])

    expect(groupes.map((g) => g.nom)).toEqual(['Service Visa', null])
    expect(groupes[1]?.membres.map((m) => m.id)).toEqual([1, 3])
  })

  it('traite une chaine vide comme une absence de service', () => {
    const groupes = grouperParService([membre(1, 1, ''), membre(2, 2, null)])

    expect(groupes).toHaveLength(1)
    expect(groupes[0]?.nom).toBeNull()
  })

  it('ne cree aucun groupe quand personne ne porte de service', () => {
    // L'ambassade qui ne renseigne pas le champ retrouve exactement la liste a
    // plat qu'elle avait avant : c'est la garantie de retrocompatibilite du
    // champ.
    const groupes = grouperParService([membre(1, 1, null), membre(2, 2, null)])

    expect(groupes).toEqual([{ nom: null, membres: [membre(1, 1, null), membre(2, 2, null)] }])
  })
})

describe('suggestions du champ de service', () => {
  it('liste les services deja saisis, sans doublon et tries', () => {
    const services = servicesSaisis([
      membre(1, 1, 'Service Visa'),
      membre(2, 2, 'Direction'),
      membre(3, 3, 'Service Visa'),
      membre(4, 4, null),
    ])

    expect(services).toEqual(['Direction', 'Service Visa'])
  })

  it('ne propose rien quand aucun service n est saisi', () => {
    expect(servicesSaisis([membre(1, 1, null)])).toEqual([])
  })
})

describe('annuaire servi par un serveur qui ne connait pas encore le champ', () => {
  it('donne null plutot que undefined au service absent', () => {
    // Le champ a ete ajoute apres la mise en service de l'annuaire. Un
    // serveur qui ne l'a pas encore livre sert des membres sans lui, et
    // `undefined` traverserait le regroupement en creant un groupe fantome.
    const annuaire = normaliserAnnuaire({
      staff: [
        {
          id: 1,
          name: 'Agent',
          role: 'Fonction',
          email: null,
          phone: null,
          image_url: null,
          position: 1,
        } as unknown as MembrePersonnel,
      ],
      consuls: [],
    })

    expect(annuaire.staff[0]?.department).toBeNull()
    expect(grouperParService(annuaire.staff).map((g) => g.nom)).toEqual([null])
  })
})
