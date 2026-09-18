import { describe, it, expect, beforeEach } from 'vitest'
import { mount } from '@vue/test-utils'
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
 * l'ouvrir l'aurait exposee. Le formulaire lui-meme reste une maquette, et
 * c'est un autre chantier.
 */
describe("page des rendez-vous : l'identite servie", () => {
  beforeEach(() => {
    setActivePinia(createPinia())
  })

  it("porte les coordonnees de l'ambassade du domaine", () => {
    useTenantStore().embassy = GABON

    const wrapper = mount(RendezVous)

    const texte = wrapper.text()
    expect(texte).toContain('ambassade@gabon-gn.org')
    expect(texte).toContain('Du lundi au vendredi, 8h - 16h')
  })

  it("ne porte plus rien de l'ambassade dont le gabarit vient", () => {
    useTenantStore().embassy = GABON

    const wrapper = mount(RendezVous)

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
