import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest'
import { flushPromises, mount } from '@vue/test-utils'
import { createPinia, setActivePinia } from 'pinia'
import RendezVous from '../RendezVous.vue'
import { useTenantStore } from '@/stores/tenant'
import { GABON } from '@/api/fixtures/tenants'

/**
 * Garde anti-fuite sur la page des rendez-vous.
 *
 * La barre laterale portait le telephone, l'adresse et le courriel de
 * l'ambassade de Guinee aux Etats-Unis, et l'en-tete son drapeau. La rubrique
 * est fermee pour toutes les ambassades, ce qui a tenu la fuite hors ligne ;
 * l'ouvrir l'aurait exposee. Le formulaire, lui, est desormais branche sur le
 * relais : la barre laterale n'apparait qu'une fois le service resolu, d'ou
 * le bouchon de `fetch` ci-dessous.
 */
describe("page des rendez-vous : l'identite servie", () => {
  beforeEach(() => {
    setActivePinia(createPinia())
    vi.stubGlobal(
      'fetch',
      vi.fn().mockResolvedValue(
        new Response(JSON.stringify({ data: { name: 'Ambassade du Gabon', departments: [] } }), {
          status: 200,
          headers: { 'Content-Type': 'application/json' },
        }),
      ),
    )
  })

  afterEach(() => {
    vi.unstubAllGlobals()
  })

  it("porte les coordonnees de l'ambassade du domaine", async () => {
    useTenantStore().embassy = GABON

    const wrapper = mount(RendezVous)
    await flushPromises()

    const texte = wrapper.text()
    expect(texte).toContain('ambassade@gabon-gn.org')
    expect(texte).toContain('Du lundi au vendredi, 8h - 16h')
  })

  it("ne porte plus rien de l'ambassade dont le gabarit vient", async () => {
    useTenantStore().embassy = GABON

    const wrapper = mount(RendezVous)
    await flushPromises()

    const html = wrapper.html()
    for (const fuite of [
      'ambaguinee-usa.org',
      'Leroy Place',
      '(202) 986-4300',
      'Washington',
      'États-Unis',
      '\u{1F1EC}\u{1F1F3}',
    ]) {
      expect(html).not.toContain(fuite)
    }
  })
})
