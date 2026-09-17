import { describe, it, expect } from 'vitest'
import { readFileSync } from 'node:fs'
import { resolve } from 'node:path'

/**
 * Garde de regression : le tableau de bord ne doit annoncer que des ecrans
 * branches sur l'API.
 *
 * Vingt-et-un ecrans herites du fork SecureCheck ne faisaient AUCUN appel
 * reseau : utilisateurs, visiteurs, presence, cartes, courriers, taches,
 * projets, documents, scanner, galerie, nouvelles, profil. Ils affichaient des
 * donnees ecrites en dur — des comptes qui n'existent pas, des presences qui
 * n'ont jamais eu lieu, et sur la page d'accueil deux articles parlant de
 * Washington et du Costa Rica, c'est-a-dire du contenu de l'ambassade de
 * Guinee aux Etats-Unis servi a l'administrateur gabonais.
 *
 * Le test lit la barre laterale et le routeur DEPUIS LE DISQUE : il ne peut
 * donc pas etre satisfait par une fixture, comme l'a ete deux fois une garde
 * anti-fuite. Un ecran ne revient dans le menu qu'en devenant vivant.
 */
const RACINE = resolve(__dirname, '../../..')

const lire = (chemin: string) => readFileSync(resolve(RACINE, chemin), 'utf8')

/** Les adresses que l'administration ne doit plus proposer. */
const CHEMINS_RETIRES = [
  '/dashboard/utilisateurs',
  '/dashboard/scanner',
  '/dashboard/visiteur',
  '/dashboard/demande',
  '/dashboard/presence',
  '/dashboard/cartes',
  '/dashboard/courriers',
  '/dashboard/taches',
  '/dashboard/projets',
  '/dashboard/documents',
  '/dashboard/galerie',
  '/dashboard/nouvelles',
  '/dashboard/profile',
]

describe("le tableau de bord n'annonce que des ecrans vivants", () => {
  it('ne propose aucun des ecrans retires dans la barre laterale', () => {
    const barre = lire('components/Sidebar.vue')
    const proposes = CHEMINS_RETIRES.filter((chemin) => barre.includes(`to="${chemin}`))

    expect(proposes).toEqual([])
  })

  it("ne propose aucun des ecrans retires depuis l'en-tete", () => {
    const entete = lire('layouts/DefautLayout.vue')
    const proposes = CHEMINS_RETIRES.filter((chemin) => entete.includes(`to="${chemin}`))

    expect(proposes).toEqual([])
  })

  it("ne laisse aucune route les rendre atteignables par l'adresse", () => {
    // Sortir un ecran du menu sans retirer sa route n'en supprime que la
    // visibilite : un signet, un lien colle dans un message, et les donnees
    // inventees reviennent.
    const routeur = lire('router/index.ts')
    const restantes = CHEMINS_RETIRES.map((chemin) => chemin.replace('/dashboard/', '')).filter(
      (segment) => new RegExp(`path: '${segment}'`).test(routeur),
    )

    expect(restantes).toEqual([])
  })

  it("n'affiche aucun compteur invente sur la page d'accueil", () => {
    // Un chiffre faux est pire qu'une absence de chiffre : il se cite en
    // reunion. Aucun compteur tant que l'API n'en sert pas.
    const accueil = lire('views/dashboard/Dashboard.vue')
    // Comme plus bas : le commentaire qui cite les anciens chiffres pour
    // expliquer leur retrait n'est pas ce qui s'affiche.
    const modele = accueil.slice(0, accueil.indexOf('<script'))

    expect(modele).not.toMatch(/\+\d+\s*%/)
    expect(accueil).not.toContain('statsHebdo')
    expect(accueil).not.toContain('derniersArticles')
    expect(accueil).not.toContain('messagesRecents')
  })

  it("ne porte plus le contenu de l'ambassade d'origine sur la page d'accueil", () => {
    const accueil = lire('views/dashboard/Dashboard.vue')

    // Les mentions restantes sont celles du commentaire qui explique le
    // retrait : elles ne sont pas dans le modele.
    const modele = accueil.slice(0, accueil.indexOf('<script'))
    for (const motif of ['Washington', 'Costa Rica']) {
      expect(modele).not.toContain(motif)
    }
  })
})
