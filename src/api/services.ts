import { apiGet, apiPost, apiPut, apiPatch, apiDelete } from './client'

/**
 * Services consulaires servis par le CMS.
 *
 * La page `/services-ambassadeur` du gabarit est ecrite en dur, avec le texte
 * de l'ambassade de Guinee aux Etats-Unis. Les services d'un poste different
 * d'un pays a l'autre et changent souvent : ils sont du contenu, pas de la
 * configuration.
 *
 * Le contrat complet est dans `docs/contrat-services-consulaires.md`.
 */

/**
 * Icones proposees aux ambassades, tenues par le front.
 *
 * Le CMS sert une cle de cette liste, jamais du balisage : une icone venue de
 * la base serait une surface d'injection pour un gain nul. Une cle inconnue
 * retombe sur `document`, ce qui laisse la carte lisible plutot que vide.
 */
export const ICONES_SERVICE = [
  'visa',
  'passeport',
  'carte-consulaire',
  'etat-civil',
  'legalisation',
  'document',
  'transport',
  'assistance',
  'entreprise',
  'etudes',
] as const

export type IconeService = (typeof ICONES_SERVICE)[number]

/** L'icone de repli, employee des que la cle servie n'est pas reconnue. */
export const ICONE_PAR_DEFAUT: IconeService = 'document'

export interface Service {
  id: number
  /** Identifie le service dans l'URL publique `/services/{slug}`. */
  slug: string
  title: string
  summary: string | null
  icon: IconeService | null
  /** Chaines courtes et libres : « 5 jours ouvrables », « gratuit ». */
  delay: string | null
  fee: string | null
  /** Assaini cote serveur : le front l'insere avec `v-html`. */
  body_html: string
  position: number
}

/**
 * La plateforme externe de demarches en ligne, quand l'ambassade en a une.
 *
 * Jamais inventee par le gabarit : `null` fait disparaitre le bandeau, comme
 * partout ailleurs. C'est ce qui evite d'annoncer un service en ligne a des
 * visiteurs d'une ambassade qui n'en offre pas.
 */
export interface PlateformeDemarches {
  name: string
  url: string
  phone: string | null
  description: string | null
}

export interface ContenuServices {
  platform: PlateformeDemarches | null
  services: Service[]
}

interface Enveloppe<T> {
  data: T
}

/** Ce que le gabarit affiche tant que l'API ne sert rien : rien. */
export const SERVICES_VIDES: ContenuServices = {
  platform: null,
  services: [],
}

/** Vrai si la cle servie figure dans la liste tenue par le front. */
function iconeConnue(cle: unknown): cle is IconeService {
  return typeof cle === 'string' && (ICONES_SERVICE as readonly string[]).includes(cle)
}

/** L'icone a rendre pour un service, en retombant sur le repli si besoin. */
export function iconeDuService(service: Pick<Service, 'icon'>): IconeService {
  return iconeConnue(service.icon) ? service.icon : ICONE_PAR_DEFAUT
}

/**
 * Ordonne par `position`, pas par `id`.
 *
 * L'ordre des cartes est un choix de l'ambassade : le visa avant l'etat civil
 * n'est pas un detail, c'est ce que le visiteur cherche en premier.
 */
function ordonner(services: readonly Service[]): Service[] {
  return [...services].sort((a, b) => a.position - b.position)
}

/**
 * Ce que le front lit du corps servi.
 *
 * Un bloc absent vaut bloc vide, jamais contenu du gabarit : c'est la regle
 * qui empeche une ambassade de montrer les services d'une autre.
 */
export function normaliserServices(servi: Partial<ContenuServices> | null): ContenuServices {
  return {
    platform: servi?.platform ?? null,
    services: ordonner(servi?.services ?? []),
  }
}

export async function recupererServices(): Promise<ContenuServices> {
  const reponse = await apiGet<Enveloppe<Partial<ContenuServices>>>('/api/content/services')
  return normaliserServices(reponse.data)
}

/** Le service designe par son slug, ou `null` s'il n'est pas servi. */
export function serviceParSlug(contenu: ContenuServices, slug: string): Service | null {
  return contenu.services.find((service) => service.slug === slug) ?? null
}

// --- Administration -------------------------------------------------------

const ADMIN = '/api/admin/content'

export async function recupererServicesAdmin(): Promise<ContenuServices> {
  const reponse = await apiGet<Enveloppe<Partial<ContenuServices>>>(`${ADMIN}/services`)
  return normaliserServices(reponse.data)
}

export type ServiceSaisi = Omit<Service, 'id' | 'position'>

export async function ajouterService(saisi: ServiceSaisi): Promise<Service> {
  const reponse = await apiPost<Enveloppe<Service>>(`${ADMIN}/services`, saisi)
  return reponse.data
}

export async function modifierService(id: number, saisi: Partial<ServiceSaisi>): Promise<Service> {
  const reponse = await apiPatch<Enveloppe<Service>>(`${ADMIN}/services/${id}`, saisi)
  return reponse.data
}

export function supprimerService(id: number): Promise<void> {
  return apiDelete(`${ADMIN}/services/${id}`)
}

export function ordonnerServices(ids: readonly number[]): Promise<void> {
  return apiPut(`${ADMIN}/services/order`, { ids })
}

/**
 * Enregistre le bandeau de la plateforme externe.
 *
 * Le PUT remplace le bloc entier : il n'y a pas de mise a jour partielle,
 * comme pour la biographie de l'ambassadeur.
 */
export async function enregistrerPlateforme(
  plateforme: PlateformeDemarches,
): Promise<PlateformeDemarches> {
  const reponse = await apiPut<Enveloppe<PlateformeDemarches>>(
    `${ADMIN}/services/platform`,
    plateforme,
  )
  return reponse.data
}

export function supprimerPlateforme(): Promise<void> {
  return apiDelete(`${ADMIN}/services/platform`)
}
