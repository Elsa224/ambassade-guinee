import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest'
import { mount, flushPromises, type VueWrapper } from '@vue/test-utils'
import { createRouter, createMemoryHistory, type Router } from 'vue-router'
import { createPinia, setActivePinia } from 'pinia'
import { defineComponent, h } from 'vue'
import Layout from '../Layout.vue'
import { useTenantStore } from '@/stores/tenant'
import type { Embassy } from '@/api/bootstrap'
import gabonFixture from '@/api/fixtures/bootstrap-gabon.json'

/**
 * Les menus de l'en-tete s'ouvrent au clic, et rien ne les refermait : ni
 * l'ouverture d'un voisin, ni un clic ailleurs, ni la navigation. Trois
 * panneaux se sont retrouves deployes en meme temps, puis poses sur la page
 * d'arrivee par-dessus son contenu.
 */
const Vide = defineComponent({ render: () => h('div') })

let routeur: Router

async function monterLEntete(): Promise<VueWrapper> {
  // Barre complete : c'est l'ambassade du Gabon telle qu'elle est servie sur
  // dev, module de rendez-vous ouvert. Une barre amputee ne fait apparaitre
  // ni le menu des demarches ni le doublon d'intitule qu'on garde ici.
  useTenantStore().embassy = {
    ...gabonFixture.embassy,
    modules: { ...gabonFixture.embassy.modules, secure_rdv: true, secure_events: true },
  } as unknown as Embassy
  routeur = createRouter({
    history: createMemoryHistory(),
    routes: [
      { path: '/', component: Vide },
      { path: '/rendez-vous', component: Vide },
    ],
  })
  routeur.push('/')
  await routeur.isReady()
  const wrapper = mount(Layout, { global: { plugins: [routeur] } })
  await flushPromises()
  return wrapper
}

/** Les blocs `group` sont les menus du format bureau, un par rubrique. */
function menus(wrapper: VueWrapper) {
  return wrapper.findAll('div.group')
}

/** Ouvre le menu de rang `rang` par son chevron. */
async function ouvrir(wrapper: VueWrapper, rang: number): Promise<void> {
  const boutons = menus(wrapper)[rang]!.findAll('button')
  await boutons[boutons.length - 1]!.trigger('click')
}

/** Combien de panneaux sont deployes, `v-show` faisant foi. */
function nombreDePanneauxDeployes(wrapper: VueWrapper): number {
  return wrapper
    .findAll('div.top-full')
    .filter((panneau) => (panneau.element as HTMLElement).style.display !== 'none').length
}

describe("menus deroulants de l'en-tete", () => {
  beforeEach(() => {
    setActivePinia(createPinia())
  })

  afterEach(() => {
    document.body.innerHTML = ''
  })

  it("n'en laisse jamais deux ouverts a la fois", async () => {
    const wrapper = await monterLEntete()
    expect(menus(wrapper).length).toBeGreaterThan(1)

    await ouvrir(wrapper, 0)
    expect(nombreDePanneauxDeployes(wrapper)).toBe(1)

    await ouvrir(wrapper, 1)
    expect(nombreDePanneauxDeployes(wrapper)).toBe(1)

    wrapper.unmount()
  })

  it('se referme quand on clique ailleurs dans la page', async () => {
    const wrapper = await monterLEntete()

    await ouvrir(wrapper, 0)
    expect(nombreDePanneauxDeployes(wrapper)).toBe(1)

    document.body.dispatchEvent(new Event('click', { bubbles: true }))
    await flushPromises()
    expect(nombreDePanneauxDeployes(wrapper)).toBe(0)

    wrapper.unmount()
  })

  it("se referme en arrivant sur la page choisie, au lieu de s'y poser", async () => {
    const wrapper = await monterLEntete()

    await ouvrir(wrapper, 0)
    expect(nombreDePanneauxDeployes(wrapper)).toBe(1)

    await routeur.push('/rendez-vous')
    await flushPromises()
    expect(nombreDePanneauxDeployes(wrapper)).toBe(0)

    wrapper.unmount()
  })

  it('ne propose pas deux entrees portant le meme intitule', async () => {
    // La barre portait « Services » deux fois cote a cote : le menu des
    // demarches et la page des services saisie au CMS. Les deux sont
    // legitimes, mais rien ne disait laquelle menait ou.
    const wrapper = await monterLEntete()

    // `text()` d'une entree a menu ramene aussi tout son panneau deplie : on
    // ne lit que la premiere commande de sa ligne d'en-tete.
    const intitules = wrapper.findAll('div.hidden.lg\\:flex > *').map((entree) => {
      const enTete = entree.find('div.flex.items-center')
      const commande = enTete.exists() ? enTete.findAll('a, button')[0]! : entree
      return commande.text().trim()
    })

    expect(intitules).toContain('Démarches')
    expect(intitules).toContain('Nos services')
    expect(new Set(intitules).size).toBe(intitules.length)

    wrapper.unmount()
  })

  it("n'ecoute plus le document une fois demonte", async () => {
    // Le gabarit se remonte a chaque changement de mise en page : un
    // ecouteur laisse derriere lui s'accumule sur un site qu'on parcourt
    // longtemps. Un clic apres demontage ne leve rien de visible : on
    // verifie donc le retrait lui-meme.
    const retire = vi.spyOn(document, 'removeEventListener')
    const wrapper = await monterLEntete()
    wrapper.unmount()

    const evenementsRetires = retire.mock.calls.map((appel) => appel[0])
    expect(evenementsRetires).toContain('click')
    expect(evenementsRetires).toContain('keydown')
    retire.mockRestore()
  })
})
