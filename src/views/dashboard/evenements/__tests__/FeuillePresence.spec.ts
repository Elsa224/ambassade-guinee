import { describe, it, expect, afterEach, vi } from 'vitest'
import { mount, flushPromises } from '@vue/test-utils'
import { createRouter, createMemoryHistory } from 'vue-router'
import { defineComponent, h } from 'vue'
import FeuillePresence from '../FeuillePresence.vue'
import type { LignePresence, ResumePresence } from '@/api/evenements-admin'

const Vide = defineComponent({ render: () => h('div') })

const LIGNES: LignePresence[] = [
  {
    uidn: 'GA100001',
    fullName: 'Awa Ndong',
    email: 'awa.ndong@exemple.test',
    hasCheckedIn: true,
    checkInAt: '2026-09-14T18:05:00.000Z',
    currentlyInside: true,
    scansUsed: 2,
  },
  {
    uidn: 'GA100002',
    fullName: 'Moussa Camara',
    email: null,
    hasCheckedIn: false,
    checkInAt: null,
    currentlyInside: false,
    scansUsed: 0,
  },
]

/**
 * Le decompte servi est VOLONTAIREMENT incoherent avec les deux lignes :
 * un test qui verifie ces chiffres a l'ecran prouve qu'ils viennent du
 * back, pas d'un recomptage de la page affichee.
 */
const RESUME: ResumePresence = { totalPasses: 42, present: 30, currentlyInside: 12, absent: 12 }

interface SimulationExport {
  statut: number
  corps: string
  disposition?: string
}

let demandes: string[] = []

function servir(
  exportServi: SimulationExport = {
    statut: 200,
    corps: 'uidn,fullName\nGA100001,Awa Ndong',
    disposition: 'attachment; filename="presence-fete-nationale-2026-09-14.csv"',
  },
) {
  demandes = []
  vi.stubGlobal(
    'fetch',
    vi.fn((url: string) => {
      demandes.push(String(url))
      if (String(url).includes('/attendance/export')) {
        const enTetes: Record<string, string> = { 'Content-Type': 'text/csv; charset=utf-8' }
        if (exportServi.disposition) enTetes['Content-Disposition'] = exportServi.disposition
        return Promise.resolve(
          new Response(
            exportServi.statut < 400
              ? exportServi.corps
              : JSON.stringify({ message: exportServi.corps }),
            { status: exportServi.statut, headers: enTetes },
          ),
        )
      }
      const json = (contenu: unknown) =>
        Promise.resolve(
          new Response(JSON.stringify(contenu), {
            status: 200,
            headers: { 'Content-Type': 'application/json' },
          }),
        )
      if (String(url).includes('/attendance')) {
        return json({
          data: LIGNES,
          pagination: { page: 1, limit: 20, total: 42, totalPages: 3 },
          summary: RESUME,
        })
      }
      return json({ data: { name: 'Fête nationale du Gabon' } })
    }),
  )
}

async function rendre() {
  const routeur = createRouter({
    history: createMemoryHistory(),
    routes: [
      { path: '/', component: Vide },
      {
        path: '/dashboard/evenements',
        component: defineComponent({ render: () => h('div') }),
        children: [
          { path: '', name: 'evenements-admin', component: Vide },
          { path: ':slug', name: 'evenement-admin', component: Vide },
          { path: ':slug/presence', name: 'evenement-admin-presence', component: FeuillePresence },
        ],
      },
    ],
  })
  routeur.push('/dashboard/evenements/fete-nationale/presence')
  await routeur.isReady()
  const wrapper = mount(FeuillePresence, { global: { plugins: [routeur] } })
  await flushPromises()
  return wrapper
}

function bouton(wrapper: Awaited<ReturnType<typeof rendre>>, fragment: string) {
  return wrapper.findAll('button').find((b) => b.text().includes(fragment))
}

describe('feuille de presence', () => {
  afterEach(() => {
    vi.unstubAllGlobals()
    vi.restoreAllMocks()
  })

  it('charge la feuille au montage et rend les lignes du back', async () => {
    servir()
    const wrapper = await rendre()

    const feuille = demandes.find((url) => url.includes('/attendance?'))
    expect(feuille).toContain('/api/admin/secure/events/fete-nationale/attendance')
    expect(feuille).toContain('page=1')
    expect(feuille).toContain('limit=20')

    expect(wrapper.text()).toContain('Awa Ndong')
    expect(wrapper.text()).toContain('GA100002')
    // Le courriel absent se rend en tiret, pas en « null ».
    expect(wrapper.text()).not.toContain('null')
  })

  it('affiche le decompte du back, jamais un recomptage de la page', async () => {
    // Les cartes doivent dire 42/30/12/12 alors que la page ne montre que
    // deux lignes : si l'ecran recomptait, ces chiffres seraient faux.
    servir()
    const wrapper = await rendre()

    expect(wrapper.text()).toContain('42')
    expect(wrapper.text()).toContain('30')
    expect(wrapper.text()).toContain('12')
  })

  it('traduit le filtre de pointage en parametre `present` et repart page 1', async () => {
    servir()
    const wrapper = await rendre()

    await wrapper.find('select').setValue('false')
    await flushPromises()

    const derniere = demandes.filter((url) => url.includes('/attendance?')).pop()
    expect(derniere).toContain('present=false')
    expect(derniere).toContain('page=1')
  })

  it('envoie la recherche sous `search`, le nom que le CMS traduit pour SecureCheck', async () => {
    servir()
    const wrapper = await rendre()

    await wrapper.find('input[type="search"]').setValue('Awa')
    await wrapper.find('form').trigger('submit')
    await flushPromises()

    const derniere = demandes.filter((url) => url.includes('/attendance?')).pop()
    expect(derniere).toContain('search=Awa')
  })

  it("telecharge l'export sous le nom propose par Content-Disposition", async () => {
    servir()
    const clics: string[] = []
    vi.spyOn(HTMLAnchorElement.prototype, 'click').mockImplementation(function (
      this: HTMLAnchorElement,
    ) {
      clics.push(this.download)
    })
    // jsdom ne fournit pas les URL d'objet : on ne teste pas le navigateur,
    // on teste que l'ecran passe par elles plutot que par un lien direct.
    vi.stubGlobal(
      'URL',
      Object.assign(URL, {
        createObjectURL: vi.fn(() => 'blob:essai'),
        revokeObjectURL: vi.fn(),
      }),
    )
    const wrapper = await rendre()

    await bouton(wrapper, 'Exporter en CSV')!.trigger('click')
    await flushPromises()

    const exporte = demandes.find((url) => url.includes('/attendance/export'))
    expect(exporte).toContain('format=csv')
    expect(clics).toEqual(['presence-fete-nationale-2026-09-14.csv'])
  })

  it("porte les filtres courants dans l'export, pour que le fichier montre l'ecran", async () => {
    servir()
    vi.spyOn(HTMLAnchorElement.prototype, 'click').mockImplementation(() => {})
    vi.stubGlobal(
      'URL',
      Object.assign(URL, {
        createObjectURL: vi.fn(() => 'blob:essai'),
        revokeObjectURL: vi.fn(),
      }),
    )
    const wrapper = await rendre()

    await wrapper.find('select').setValue('true')
    await flushPromises()
    await bouton(wrapper, 'Exporter en XLSX')!.trigger('click')
    await flushPromises()

    const exporte = demandes.find((url) => url.includes('/attendance/export'))
    expect(exporte).toContain('format=xlsx')
    expect(exporte).toContain('present=true')
  })

  it("affiche le message du back quand l'export echoue, sans rien telecharger", async () => {
    servir({ statut: 502, corps: 'Ambassade Secure est indisponible.' })
    const clics = vi.spyOn(HTMLAnchorElement.prototype, 'click').mockImplementation(() => {})
    const wrapper = await rendre()

    await bouton(wrapper, 'Exporter en CSV')!.trigger('click')
    await flushPromises()

    expect(wrapper.text()).toContain('Ambassade Secure est indisponible.')
    expect(clics).not.toHaveBeenCalled()
  })
})
