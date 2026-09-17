import { describe, it, expect, beforeEach } from 'vitest'
import { mount, flushPromises } from '@vue/test-utils'
import { createRouter, createMemoryHistory } from 'vue-router'
import { createPinia, setActivePinia } from 'pinia'
import { defineComponent, h } from 'vue'
import Sidebar from '../Sidebar.vue'
import { useTenantStore } from '@/stores/tenant'
import { useAuthStore } from '@/stores/auth'
import { GABON } from '@/api/fixtures/tenants'

const Vide = defineComponent({ render: () => h('div') })

async function monter(chemin: string) {
  const routeur = createRouter({
    history: createMemoryHistory(),
    // Les routes du tableau de bord sont IMBRIQUEES sous `/dashboard`, comme
    // dans l'application. La nuance est tout le sujet : `active-class` allume
    // un lien des que sa route est un ancetre de la route courante. Mises a
    // plat, les routes ne sont ancetres de rien et le test ne prouverait rien.
    routes: [
      { path: '/', component: Vide },
      {
        path: '/dashboard',
        component: { ...Vide, render: () => h('div') },
        children: [
          { path: '', component: Vide },
          { path: 'articles', component: Vide },
          { path: 'cartes/liste', component: Vide },
          { path: 'contenu-accueil', component: Vide },
          { path: 'courriers/liste', component: Vide },
          { path: 'demande', component: Vide },
          { path: 'documents', component: Vide },
          {
            path: 'evenements',
            component: Vide,
            children: [
              { path: '', component: Vide },
              { path: 'nouveau', component: Vide },
              { path: ':slug', component: Vide },
              { path: ':slug/modifier', component: Vide },
            ],
          },
          { path: 'galerie', component: Vide },
          { path: 'annuaire', component: Vide },
          { path: 'jours-feries', component: Vide },
          { path: 'parametres', component: Vide },
          { path: 'profil', component: Vide },
          { path: 'services', component: Vide },
          { path: 'nouvelles', component: Vide },
          { path: 'presence', component: Vide },
          { path: 'projets/liste', component: Vide },
          { path: 'scanner', component: Vide },
          { path: 'taches', component: Vide },
          { path: 'utilisateurs', component: Vide },
          { path: 'visiteur', component: Vide },
        ],
      },
    ],
  })
  routeur.push(chemin)
  await routeur.isReady()
  const wrapper = mount(Sidebar, { global: { plugins: [routeur] } })
  await flushPromises()
  return wrapper
}

/** Liens allumes, reperes a l'habillage que porte la rubrique courante. */
function liensAllumes(wrapper: Awaited<ReturnType<typeof monter>>): string[] {
  return wrapper
    .findAll('a')
    .filter((a) => a.classes().some((c) => c.includes('bg-secondary')))
    .map((a) => a.attributes('href') ?? '')
}

/**
 * Les tests d'habillage ci-dessous portent sur la rubrique « Evenements »,
 * qui n'est affichee que si le module est ouvert : ils la declarent donc
 * ouverte. Le cas ferme a son propre test, plus bas.
 */
const GABON_AVEC_EVENEMENTS = {
  ...GABON,
  modules: { ...GABON.modules, secure_events: true },
}

describe('barre laterale du tableau de bord', () => {
  beforeEach(() => {
    setActivePinia(createPinia())
    useTenantStore().embassy = GABON_AVEC_EVENEMENTS
  })

  it('n allume que la rubrique consultee', async () => {
    // `active-class` colle par PREFIXE : « Tableau de bord » restait allume
    // sur toutes les pages, `/dashboard` etant prefixe de chacune.
    const wrapper = await monter('/dashboard/evenements')

    expect(liensAllumes(wrapper)).toEqual(['/dashboard/evenements'])
  })

  it('laisse la rubrique allumee sur le formulaire de creation', async () => {
    // `nouveau` est un enfant de `evenements`, pas une route soeur : la
    // rubrique doit rester allumee pendant qu'on cree un evenement.
    const wrapper = await monter('/dashboard/evenements/nouveau')
    expect(liensAllumes(wrapper)).toEqual(['/dashboard/evenements'])
  })

  it('laisse la rubrique allumee sur la fiche d un evenement', async () => {
    // La fiche est imbriquee sous `/dashboard/evenements` : la rubrique reste
    // donc allumee, sans quoi la barre laterale s'eteindrait entierement des
    // qu'on ouvre un evenement.
    const wrapper = await monter('/dashboard/evenements/fete-nationale')

    expect(liensAllumes(wrapper)).toEqual(['/dashboard/evenements'])
  })

  it('allume le tableau de bord quand on y est', async () => {
    const wrapper = await monter('/dashboard')

    expect(liensAllumes(wrapper)).toEqual(['/dashboard'])
  })

  it('n affiche jamais un embleme compile dans le depot', async () => {
    // L'embleme guineen etait importe en dur : il s'affichait dans la barre
    // laterale de toutes les ambassades, tableau de bord gabonais compris.
    //
    // Le cas decisif est l'ambassade SANS logo : c'est la, et seulement la,
    // qu'un repli compile dans le depot ressortirait. Avec un logo servi, un
    // repli fautif reste invisible et le test ne prouverait rien.
    useTenantStore().embassy = { ...GABON, logo_image: '' }
    const wrapper = await monter('/dashboard')
    const sources = wrapper.findAll('img').map((i) => i.attributes('src') ?? '')

    expect(sources.filter((s) => /logo\.webp|guinee/i.test(s))).toEqual([])
  })

  it("affiche le logo de l'ambassade consultee", async () => {
    const wrapper = await monter('/dashboard')
    const sources = wrapper.findAll('img').map((i) => i.attributes('src') ?? '')

    expect(sources).toContain(GABON.logo_image)
  })

  it("n'annonce pas les Evenements quand le module n'est pas ouvert", async () => {
    // Le module suppose un compte Ambassade Secure provisionne. Ferme, toutes
    // ses routes rendent 404 : annoncer l'entree menerait l'administrateur sur
    // un ecran vide dont il n'a pas la clef.
    useTenantStore().embassy = { ...GABON, modules: { ...GABON.modules, secure_events: false } }
    const wrapper = await monter('/dashboard')

    const liens = wrapper.findAll('a').map((a) => a.attributes('href') ?? '')
    expect(liens).not.toContain('/dashboard/evenements')
  })

  it("n'annonce pas les Evenements tant que le bootstrap n'a pas repondu", async () => {
    // Sinon l'entree apparait puis disparait le temps d'un aller-retour.
    const tenant = useTenantStore()
    tenant.embassy = null
    tenant.chargement = true
    const wrapper = await monter('/dashboard')

    const liens = wrapper.findAll('a').map((a) => a.attributes('href') ?? '')
    expect(liens).not.toContain('/dashboard/evenements')
  })
})

/**
 * Les deux entrees que le back reserve aux administrateurs.
 *
 * La garde est cosmetique — le serveur refuse en 403 — mais son SENS compte :
 * une entree offerte a un editeur ne mene qu'a un refus, et une entree retiree
 * a un administrateur lui ferme ses propres parametres.
 */
describe('entrees reservees aux administrateurs', () => {
  beforeEach(() => {
    setActivePinia(createPinia())
    useTenantStore().embassy = GABON
  })

  function adresses(barre: Awaited<ReturnType<typeof monter>>): string[] {
    return barre.findAll('a').map((lien) => lien.attributes('href') ?? '')
  }

  it('les propose a un administrateur', async () => {
    useAuthStore().utilisateur = {
      id: 1,
      name: 'X',
      email: 'x@y.test',
      role: 'admin',
      embassy_id: 1,
    }
    const barre = await monter('/dashboard')

    expect(adresses(barre)).toContain('/dashboard/parametres')
    expect(adresses(barre)).toContain('/dashboard/utilisateurs')
  })

  it('les retire a un editeur', async () => {
    useAuthStore().utilisateur = {
      id: 2,
      name: 'Y',
      email: 'y@z.test',
      role: 'editeur',
      embassy_id: 1,
    }
    const barre = await monter('/dashboard')

    expect(adresses(barre)).not.toContain('/dashboard/parametres')
    expect(adresses(barre)).not.toContain('/dashboard/utilisateurs')
    // Le contenu, lui, reste ouvert : c'est tout ce qu'un editeur tient.
    expect(adresses(barre)).toContain('/dashboard/articles')
  })

  it("les laisse quand l'identite n'est pas encore revenue", async () => {
    // Ne pas savoir n'est pas un refus. Un editeur voit l'entree le temps d'un
    // aller-retour ; un administrateur dont `/auth/me` echoue garderait
    // sinon un tableau de bord amoindri sans raison.
    useAuthStore().utilisateur = null
    const barre = await monter('/dashboard')

    expect(adresses(barre)).toContain('/dashboard/parametres')
  })
})
