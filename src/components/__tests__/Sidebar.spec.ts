import { describe, it, expect, beforeEach } from 'vitest'
import { mount, flushPromises } from '@vue/test-utils'
import { createRouter, createMemoryHistory } from 'vue-router'
import { createPinia, setActivePinia } from 'pinia'
import { defineComponent, h } from 'vue'
import Sidebar from '../Sidebar.vue'
import { useTenantStore } from '@/stores/tenant'
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
          { path: 'actualites', component: Vide },
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

describe('barre laterale du tableau de bord', () => {
  beforeEach(() => {
    setActivePinia(createPinia())
    useTenantStore().embassy = GABON
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
})
