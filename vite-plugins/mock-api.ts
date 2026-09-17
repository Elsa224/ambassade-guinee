import type { Plugin, PreviewServer, ViteDevServer } from 'vite'
import type { IncomingMessage, ServerResponse } from 'node:http'
import { existsSync, readFileSync } from 'node:fs'
import { fileURLToPath } from 'node:url'
import path from 'node:path'

/**
 * Sert /api/* depuis les fixtures pendant le developpement, le CMS Laravel
 * etant developpe separement. En production, /api est proxifie vers le back
 * par le vhost Apache de chaque domaine d'ambassade : ce plugin, declare avec
 * apply: 'serve', n'est jamais inclus dans le build.
 *
 * Les identifiants ci-dessous sont de simples valeurs de developpement, sans
 * aucun rapport avec un compte reel.
 */
const IDENTIFIANTS_DEV = { email: 'admin@exemple-ambassade.test', password: 'motdepasse' }
const JETON_DEV = 'jeton-de-developpement'

function fixture(nom: string): unknown {
  const chemin = fileURLToPath(new URL(`../src/api/fixtures/${nom}.json`, import.meta.url))
  return JSON.parse(readFileSync(chemin, 'utf8'))
}

interface Categorie {
  id: number
  nom: string
  slug: string
  couleur: string
}

/**
 * Derive un slug d'un titre, comme le back le fera a la creation.
 *
 * Minuscules, accents retires, tout le reste devient un tiret : c'est la
 * forme exigee par le contrat des services consulaires.
 */
function glisser(titre: string): string {
  return titre
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .slice(0, 60)
    .replace(/^-+|-+$/g, '')
}

export function mockApi(): Plugin {
  // Etat en memoire : remis a zero a chaque redemarrage du serveur de dev.
  let articles = (fixture('articles') as { data: unknown[] }).data as Record<string, unknown>[]
  const articlesGabon = (fixture('articles-gabon') as { data: unknown[] }).data as Record<
    string,
    unknown
  >[]

  /**
   * Les deux ambassades, en memoire.
   *
   * Le bootstrap les relit ici plutot que dans les fixtures : sans cela,
   * l'ecran des parametres enregistrerait et le site continuerait d'afficher
   * l'ancienne valeur, ce qui est precisement la panne que le contrat demande
   * d'eviter cote serveur.
   */
  const ambassades: Record<string, Record<string, unknown>> = {
    guinee: (fixture('bootstrap') as { embassy: Record<string, unknown> }).embassy,
    gabon: (fixture('bootstrap-gabon') as { embassy: Record<string, unknown> }).embassy,
  }

  /**
   * Contenu d'accueil, par ambassade et en memoire.
   *
   * Le site guineen part volontairement d'un contenu VIDE : c'est l'etat reel
   * des deux ambassades tant que personne n'a rien saisi, et c'est ce que les
   * ecrans d'administration servent a remplir. Le Gabon part rempli pour que
   * la page publique soit visible sans saisie prealable.
   */
  const contenus: Record<string, Record<string, unknown>> = {
    gabon: structuredClone((fixture('contenu-gabon') as { data: Record<string, unknown> }).data),
    guinee: structuredClone((fixture('contenu-vide') as { data: Record<string, unknown> }).data),
  }

  /**
   * Services consulaires, par ambassade et en memoire.
   *
   * Le Gabon part rempli, avec les brouillons de textes remis a l'ambassade,
   * pour que les pages publiques soient visibles sans saisie prealable. La
   * Guinee part vide : sa page `/services-ambassadeur` porte encore son
   * contenu en dur, et rien ne doit lui etre prete ici.
   */
  const servicesParTenant: Record<string, Record<string, unknown>> = {
    gabon: structuredClone((fixture('services-gabon') as { data: Record<string, unknown> }).data),
    guinee: structuredClone((fixture('services-vides') as { data: Record<string, unknown> }).data),
  }

  let prochainIdentifiant = 100

  /**
   * Annuaire par tenant : personnel et consuls honoraires. Vide au depart,
   * comme le vrai back pour une ambassade neuve ; tout se saisit par
   * l'ecran d'administration.
   */
  const annuaires: Record<
    string,
    { staff: Record<string, unknown>[]; consuls: Record<string, unknown>[] }
  > = {
    gabon: { staff: [], consuls: [] },
    guinee: { staff: [], consuls: [] },
  }

  /**
   * Jours feries par tenant : les fetes datees et le bloc de reglages unique.
   * Vide au depart, comme le vrai back pour une ambassade neuve.
   */
  const calendriers: Record<
    string,
    { holidays: Record<string, unknown>[]; intro: string | null; document_url: string | null }
  > = {
    gabon: { holidays: [], intro: null, document_url: null },
    guinee: { holidays: [], intro: null, document_url: null },
  }

  interface EvenementSimule {
    publicToken: string
    isRegistrationClosed: boolean
    [cle: string]: unknown
  }

  /** Rechargee a chaque appel pour que l'edition de la fixture soit visible sans redemarrage. */
  const evenementsPublics = (): EvenementSimule[] =>
    (fixture('evenements') as { data: EvenementSimule[] }).data

  /**
   * Ecritures d'administration, gardees en memoire.
   *
   * La fixture est relue a chaque appel pour qu'on puisse l'editer sans
   * redemarrer : ecrire dedans annulerait cet avantage, et salirait un fichier
   * versionne. Les creations et les retouches vivent donc a cote, et sont
   * fusionnees a la lecture. Elles disparaissent au redemarrage du serveur de
   * developpement, ce qui est le comportement voulu d'un simulateur.
   */
  const creationsAdmin: Record<string, unknown>[] = []
  /** Logos deposes pendant la session de dev : octets et type, par slug. */
  const logosDev = new Map<string, { octets: Buffer; type: string }>()
  const retouchesAdmin = new Map<string, Record<string, unknown>>()

  /** Meme rechargement pour la liste d'administration, paginee ci-dessous. */
  const evenementsAdmin = (): Record<string, unknown>[] => {
    const base = (fixture('evenements-admin') as { data: Record<string, unknown>[] }).data
    return [...creationsAdmin, ...base].map((evenement) => {
      const retouche = retouchesAdmin.get(String(evenement.slug))
      return retouche ? { ...evenement, ...retouche } : evenement
    })
  }

  /**
   * Les types proposes a la creation : ceux que portent deja les evenements.
   *
   * Forme du back (releve brut de SecureCheck) : le libelle s'appelle
   * `name`, pas `label`, et chaque type porte `isActive`.
   */
  const typesEvenement = (): { slug: string; name: string; isActive: boolean }[] => {
    const vus = new Map<string, string>()
    for (const evenement of evenementsAdmin()) {
      const nom = evenement.typeLabel
      if (typeof nom !== 'string' || nom === '') continue
      if (!vus.has(nom)) vus.set(nom, slugifier(nom))
    }
    return [...vus].map(([nom, slug]) => ({ slug, name: nom, isActive: true }))
  }

  /** Slug a la maniere du back : minuscules, accents retires, tirets. */
  const slugifier = (valeur: string): string =>
    valeur
      .normalize('NFD')
      .replace(/[\u0300-\u036f]/g, '')
      .toLowerCase()
      .replace(/[^a-z0-9]+/g, '-')
      .replace(/^-|-$/g, '')
  let prochainId = 100
  let prochainIdCategorie = 100

  // Taxonomie connue : reprise des categories deja presentes dans la fixture,
  // pour que le simulateur reponde avec la meme forme que l'API reelle
  // (objet categorie imbrique) plutot qu'avec le seul categorie_slug envoye.
  const categories = new Map<string, Categorie>(
    articles
      .map((a) => a.categorie as Categorie | undefined)
      .filter((c): c is Categorie => c != null)
      .map((c) => [c.slug, c]),
  )

  /** Retrouve la categorie d un slug connu, ou en fabrique une coherente. */
  function categorieDepuisSlug(slug: string): Categorie {
    const existante = categories.get(slug)
    if (existante) return existante
    const creee: Categorie = {
      id: prochainIdCategorie++,
      nom: slug.charAt(0).toUpperCase() + slug.slice(1).replace(/-/g, ' '),
      slug,
      couleur: '#64748b',
    }
    categories.set(slug, creee)
    return creee
  }

  /**
   * Gestionnaire unique, monte a la fois sur le serveur de developpement et
   * sur le serveur de previsualisation. La previsualisation sert le bundle de
   * production : sans /api simule, l'amorcage du tenant echouerait en 404 et
   * les tests de bout en bout ne pourraient jamais valider le build reel.
   */
  const gestionnaireApi = (requete: IncomingMessage, reponse: ServerResponse) => {
    const url = new URL(requete.url ?? '/', 'http://localhost')

    // Trois sources, par ordre de priorite.
    //
    // `X-Embassy-Domain` est le forcage explicite, celui que la vraie API
    // accepte aussi. `?domain=` vient ensuite : seul `/api/bootstrap` le
    // transmet, et il vaut « localhost » en developpement.
    //
    // `Host` est le dernier recours, et c'est lui qui fait fonctionner le
    // multi-tenant en local. La vraie API resout l'ambassade par cet en-tete,
    // que le navigateur envoie sur chaque requete ; sans lui ici, tous les
    // appels de contenu — qui ne portent pas `?domain=` — retombaient sur
    // l'ambassade d'origine, et le site gabonais affichait un contenu vide
    // alors que son theme etait bien charge.
    const entete = requete.headers['x-embassy-domain']
    const domaineDemande = String(
      (Array.isArray(entete) ? entete[0] : entete) ||
        url.searchParams.get('domain') ||
        requete.headers.host ||
        '',
    )
    const estGabon = domaineDemande.includes('gabon')
    const chemin = url.pathname
    const methode = requete.method ?? 'GET'

    const repondre = (statut: number, corps: unknown) => {
      reponse.statusCode = statut
      reponse.setHeader('Content-Type', 'application/json')
      reponse.end(corps === null ? '' : JSON.stringify(corps))
    }

    // Resout avec null si le corps n'est pas du JSON exploitable : l'exception
    // ne doit pas s'echapper dans un ecouteur d'evenement, ou elle laisserait
    // la requete sans reponse et ferait remonter une erreur non geree.
    const lireCorps = (): Promise<Record<string, unknown> | null> =>
      new Promise((resoudre) => {
        let brut = ''
        requete.on('data', (morceau) => (brut += morceau))
        requete.on('end', () => {
          if (brut === '') return resoudre({})
          try {
            resoudre(JSON.parse(brut) as Record<string, unknown>)
          } catch {
            resoudre(null)
          }
        })
      })

    const ambassade = () => ambassades[estGabon ? 'gabon' : 'guinee']!

    if (chemin === '/bootstrap') {
      return repondre(200, { embassy: ambassade() })
    }

    // --- Parametres de l'ambassade : identite, coordonnees, couleurs -------
    //
    // Le PUT reproduit les trois refus du contrat plutot que de les ignorer.
    // Un faux serveur plus permissif que le vrai est un piege de diagnostic :
    // l'ecran passerait ici et echouerait en 422 contre la vraie API.
    if (chemin === '/admin/embassy') {
      if (methode === 'GET') return repondre(200, { data: ambassade() })

      if (methode === 'PUT') {
        return lireCorps().then((corps) => {
          if (corps === null) return repondre(400, { message: 'Corps de requete illisible.' })

          for (const interdit of ['slug', 'domain', 'modules'] as const) {
            if (interdit in corps) {
              return repondre(422, {
                message: `Le champ ${interdit} n'est pas modifiable depuis l'administration.`,
              })
            }
          }

          const contactRecu = (corps.contact ?? {}) as Record<string, unknown>
          if ('phone' in contactRecu) {
            return repondre(422, {
              message: 'Le numero principal est derive : renseignez contact.phones.',
            })
          }

          const courante = ambassade()
          const identite = courante.identite as Record<string, unknown>
          const contact = courante.contact as Record<string, unknown>
          const theme = courante.theme as Record<string, unknown>

          if ('display_name' in corps) courante.display_name = corps.display_name
          Object.assign(identite, (corps.identite ?? {}) as Record<string, unknown>)
          Object.assign(theme, (corps.theme ?? {}) as Record<string, unknown>)
          Object.assign(contact, contactRecu)

          // `phone` est derive de la premiere entree, jamais stocke : deux
          // sources de verite pour un meme numero divergeraient a la premiere
          // modification.
          const numeros = (contact.phones ?? []) as { number?: string }[]
          contact.phone = numeros.length > 0 ? (numeros[0].number ?? '') : ''

          return repondre(200, { data: courante })
        })
      }
    }

    // --- Contenu d'accueil : mot de bienvenue, dirigeants, vitrine ---------
    const contenu = () => contenus[estGabon ? 'gabon' : 'guinee']!
    const liste = (bloc: 'leaders' | 'showcase') => contenu()[bloc] as Record<string, unknown>[]

    /** Renumerote les positions pour qu'elles restent 1, 2, 3... sans trou. */
    const renumeroter = (bloc: 'leaders' | 'showcase') => {
      liste(bloc).forEach((element, index) => (element.position = index + 1))
    }

    if (chemin === '/content/home' || chemin === '/admin/content/home') {
      return repondre(200, { data: contenu() })
    }

    // --- Services consulaires ---------------------------------------------
    const servicesDuTenant = () => servicesParTenant[estGabon ? 'gabon' : 'guinee']!
    const listeServices = () => servicesDuTenant().services as Record<string, unknown>[]

    if (chemin === '/content/services' || chemin === '/admin/content/services') {
      if (methode === 'GET') return repondre(200, { data: servicesDuTenant() })
    }

    if (chemin === '/admin/content/services' && methode === 'POST') {
      return void lireCorps().then((corps) => {
        if (corps === null) return repondre(422, { message: 'Corps de requete illisible.' })
        if (typeof corps.title !== 'string' || corps.title.trim() === '') {
          return repondre(422, { message: 'Le titre est obligatoire.' })
        }
        const slug =
          typeof corps.slug === 'string' && corps.slug !== '' ? corps.slug : glisser(corps.title)
        if (listeServices().some((service) => service.slug === slug)) {
          return repondre(422, { message: 'Ce slug est deja pris par un autre service.' })
        }
        const service = {
          ...corps,
          slug,
          id: (prochainIdentifiant += 1),
          position: listeServices().length + 1,
        }
        listeServices().push(service)
        repondre(201, { data: service })
      })
    }

    if (chemin === '/admin/content/services/order' && methode === 'PUT') {
      return void lireCorps().then((corps) => {
        const ids = Array.isArray(corps?.ids) ? (corps.ids as number[]) : null
        if (ids === null) return repondre(422, { message: 'Liste d identifiants attendue.' })
        const actuels = listeServices()
        const ordonnes = ids
          .map((id) => actuels.find((service) => service.id === id))
          .filter((service): service is Record<string, unknown> => service !== undefined)
        ordonnes.forEach((service, index) => (service.position = index + 1))
        servicesDuTenant().services = ordonnes
        repondre(204, null)
      })
    }

    if (chemin === '/admin/content/services/platform') {
      if (methode === 'PUT') {
        return void lireCorps().then((corps) => {
          if (corps === null) return repondre(422, { message: 'Corps de requete illisible.' })
          if (typeof corps.name !== 'string' || corps.name.trim() === '') {
            return repondre(422, { message: 'Le nom de la plateforme est obligatoire.' })
          }
          if (typeof corps.url !== 'string' || corps.url.trim() === '') {
            return repondre(422, { message: "L'adresse de la plateforme est obligatoire." })
          }
          servicesDuTenant().platform = {
            name: corps.name,
            url: corps.url,
            phone: typeof corps.phone === 'string' && corps.phone !== '' ? corps.phone : null,
            description:
              typeof corps.description === 'string' && corps.description !== ''
                ? corps.description
                : null,
          }
          repondre(200, { data: servicesDuTenant().platform })
        })
      }
      if (methode === 'DELETE') {
        servicesDuTenant().platform = null
        return repondre(204, null)
      }
    }

    const serviceVise = /^\/admin\/content\/services\/(\d+)$/.exec(chemin)
    if (serviceVise) {
      const id = Number(serviceVise[1])
      const rang = listeServices().findIndex((service) => service.id === id)
      if (rang === -1) return repondre(404, { message: 'Service introuvable.' })

      if (methode === 'PATCH') {
        return void lireCorps().then((corps) => {
          if (corps === null) return repondre(422, { message: 'Corps de requete illisible.' })
          if (
            typeof corps.slug === 'string' &&
            listeServices().some((autre) => autre.slug === corps.slug && autre.id !== id)
          ) {
            return repondre(422, { message: 'Ce slug est deja pris par un autre service.' })
          }
          Object.assign(listeServices()[rang]!, corps)
          repondre(200, { data: listeServices()[rang] })
        })
      }

      if (methode === 'DELETE') {
        listeServices().splice(rang, 1)
        listeServices().forEach((service, index) => (service.position = index + 1))
        return repondre(204, null)
      }
    }

    if (chemin === '/admin/content/welcome' && methode === 'PUT') {
      return void lireCorps().then((corps) => {
        if (corps === null) return repondre(422, { message: 'Corps de requete illisible.' })
        if (typeof corps.title !== 'string' || corps.title.trim() === '') {
          return repondre(422, { message: 'Le titre est obligatoire.' })
        }
        contenu().welcome = { title: corps.title, body_html: String(corps.body_html ?? '') }
        repondre(200, { data: contenu().welcome })
      })
    }

    if (chemin === '/admin/content/welcome' && methode === 'DELETE') {
      contenu().welcome = null
      return repondre(204, null)
    }

    if (chemin === '/admin/content/ambassador' && methode === 'PUT') {
      return void lireCorps().then((corps) => {
        if (corps === null) return repondre(422, { message: 'Corps de requete illisible.' })
        if (typeof corps.name !== 'string' || corps.name.trim() === '') {
          return repondre(422, { message: 'Le nom est obligatoire.' })
        }
        if (typeof corps.title !== 'string' || corps.title.trim() === '') {
          return repondre(422, { message: 'La fonction est obligatoire.' })
        }
        if (typeof corps.body_html !== 'string' || corps.body_html.trim() === '') {
          return repondre(422, { message: 'La biographie est obligatoire.' })
        }
        // Le PUT remplace le bloc entier : `image_url` absente vaut null,
        // comme au contrat.
        contenu().ambassador = {
          name: corps.name,
          title: corps.title,
          image_url:
            typeof corps.image_url === 'string' && corps.image_url !== '' ? corps.image_url : null,
          body_html: corps.body_html,
        }
        repondre(200, { data: contenu().ambassador })
      })
    }

    if (chemin === '/admin/content/ambassador' && methode === 'DELETE') {
      contenu().ambassador = null
      return repondre(204, null)
    }

    const BLOC_PAR_CHEMIN: Record<string, 'leaders' | 'showcase'> = {
      '/admin/content/leaders': 'leaders',
      '/admin/content/showcase': 'showcase',
    }

    const bloc = BLOC_PAR_CHEMIN[chemin]
    if (bloc && methode === 'POST') {
      return void lireCorps().then((corps) => {
        if (corps === null) return repondre(422, { message: 'Corps de requete illisible.' })
        if (typeof corps.image_url !== 'string' || corps.image_url === '') {
          return repondre(422, { message: "L'image est obligatoire." })
        }
        if (bloc === 'leaders' && (typeof corps.name !== 'string' || corps.name.trim() === '')) {
          return repondre(422, { message: 'Le nom est obligatoire.' })
        }
        const element = {
          ...corps,
          id: (prochainIdentifiant += 1),
          position: liste(bloc).length + 1,
        }
        liste(bloc).push(element)
        repondre(201, { data: element })
      })
    }

    const ordre = Object.entries(BLOC_PAR_CHEMIN).find(([prefixe]) => chemin === `${prefixe}/order`)
    if (ordre && methode === 'PUT') {
      return void lireCorps().then((corps) => {
        const ids = Array.isArray(corps?.ids) ? (corps.ids as number[]) : null
        if (ids === null) return repondre(422, { message: 'Liste d identifiants attendue.' })
        const actuels = liste(ordre[1])
        const reordonnes = ids
          .map((id) => actuels.find((e) => e.id === id))
          .filter((e): e is Record<string, unknown> => e !== undefined)
        // Un identifiant oublie par l'appelant ne doit pas disparaitre.
        const restants = actuels.filter((e) => !ids.includes(e.id as number))
        contenu()[ordre[1]] = [...reordonnes, ...restants]
        renumeroter(ordre[1])
        repondre(204, null)
      })
    }

    const elementVise = Object.entries(BLOC_PAR_CHEMIN)
      .map(([prefixe, nom]) => {
        const reste = chemin.startsWith(`${prefixe}/`) ? chemin.slice(prefixe.length + 1) : null
        return reste !== null && /^\d+$/.test(reste) ? { bloc: nom, id: Number(reste) } : null
      })
      .find((v) => v !== null)

    if (elementVise) {
      const actuels = liste(elementVise.bloc)
      const index = actuels.findIndex((e) => e.id === elementVise.id)
      if (index === -1) return repondre(404, { message: 'Élément introuvable.' })

      if (methode === 'DELETE') {
        actuels.splice(index, 1)
        renumeroter(elementVise.bloc)
        return repondre(204, null)
      }

      if (methode === 'PATCH') {
        return void lireCorps().then((corps) => {
          if (corps === null) return repondre(422, { message: 'Corps de requete illisible.' })
          Object.assign(actuels[index]!, corps)
          repondre(200, { data: actuels[index] })
        })
      }
    }

    // --- Annuaire : personnel et consuls honoraires ------------------------
    const annuaire = () => annuaires[estGabon ? 'gabon' : 'guinee']!

    if (chemin === '/content/directory' || chemin === '/admin/directory') {
      return repondre(200, { data: annuaire() })
    }

    const LISTE_ANNUAIRE: Record<string, 'staff' | 'consuls'> = {
      '/admin/directory/staff': 'staff',
      '/admin/directory/consuls': 'consuls',
    }

    /** Champs obligatoires au contrat : name/role, plus city pour un consul. */
    const OBLIGATOIRES: Record<'staff' | 'consuls', string[]> = {
      staff: ['name', 'role'],
      consuls: ['name', 'role', 'city'],
    }

    const FACULTATIFS: Record<'staff' | 'consuls', string[]> = {
      staff: ['email', 'phone', 'image_url'],
      consuls: ['address', 'email', 'phone'],
    }

    const listeAnnuaire = LISTE_ANNUAIRE[chemin]
    if (listeAnnuaire && methode === 'POST') {
      return void lireCorps().then((corps) => {
        if (corps === null) return repondre(422, { message: 'Corps de requete illisible.' })
        for (const champ of OBLIGATOIRES[listeAnnuaire]) {
          if (typeof corps[champ] !== 'string' || (corps[champ] as string).trim() === '') {
            return repondre(422, {
              message: 'Le champ ' + champ + ' est obligatoire.',
              errors: { [champ]: ['Le champ ' + champ + ' est obligatoire.'] },
            })
          }
        }
        const elements = annuaire()[listeAnnuaire]
        const element: Record<string, unknown> = {
          id: (prochainIdentifiant += 1),
          position: elements.reduce((max, e) => Math.max(max, Number(e.position)), 0) + 1,
        }
        for (const champ of OBLIGATOIRES[listeAnnuaire]) element[champ] = corps[champ]
        for (const champ of FACULTATIFS[listeAnnuaire]) element[champ] = corps[champ] ?? null
        elements.push(element)
        repondre(201, { data: element })
      })
    }

    const ordreAnnuaire = Object.entries(LISTE_ANNUAIRE).find(
      ([prefixe]) => chemin === `${prefixe}/order`,
    )
    if (ordreAnnuaire && methode === 'PUT') {
      return void lireCorps().then((corps) => {
        const ids = Array.isArray(corps?.ids) ? (corps.ids as number[]) : null
        if (ids === null) return repondre(422, { message: 'Liste d identifiants attendue.' })
        const elements = annuaire()[ordreAnnuaire[1]]
        // Au contrat : la liste doit porter TOUS les identifiants, une fois
        // chacun, sans identifiant etranger. Sinon 422, rien n'est modifie.
        const attendus = new Set(elements.map((e) => e.id as number))
        const valide =
          ids.length === attendus.size &&
          ids.every((id) => attendus.has(id)) &&
          new Set(ids).size === ids.length
        if (!valide) {
          return repondre(422, {
            message: 'La liste des identifiants est incomplete ou invalide.',
            errors: { ids: ['La liste des identifiants est incomplete ou invalide.'] },
          })
        }
        const reordonnes = ids.map((id) => elements.find((e) => e.id === id)!)
        reordonnes.forEach((element, index) => (element.position = index + 1))
        annuaire()[ordreAnnuaire[1]] = reordonnes
        repondre(200, { data: reordonnes })
      })
    }

    const viseAnnuaire = Object.entries(LISTE_ANNUAIRE)
      .map(([prefixe, nom]) => {
        const reste = chemin.startsWith(`${prefixe}/`) ? chemin.slice(prefixe.length + 1) : null
        return reste !== null && /^\d+$/.test(reste) ? { liste: nom, id: Number(reste) } : null
      })
      .find((v) => v !== null)

    if (viseAnnuaire) {
      const elements = annuaire()[viseAnnuaire.liste]
      const index = elements.findIndex((e) => e.id === viseAnnuaire.id)
      if (index === -1) return repondre(404, { message: 'Élément introuvable.' })

      if (methode === 'DELETE') {
        // Au contrat : les positions restantes gardent leur trou jusqu'au
        // prochain reordonnancement. Surtout ne pas renumeroter ici.
        elements.splice(index, 1)
        return repondre(204, null)
      }

      if (methode === 'PATCH') {
        return void lireCorps().then((corps) => {
          if (corps === null) return repondre(422, { message: 'Corps de requete illisible.' })
          for (const champ of OBLIGATOIRES[viseAnnuaire.liste]) {
            if (
              champ in corps &&
              (typeof corps[champ] !== 'string' || (corps[champ] as string).trim() === '')
            ) {
              return repondre(422, {
                message: 'Le champ ' + champ + ' ne peut pas etre efface.',
                errors: { [champ]: ['Le champ ' + champ + ' ne peut pas etre efface.'] },
              })
            }
          }
          Object.assign(elements[index]!, corps)
          repondre(200, { data: elements[index] })
        })
      }
    }

    if (chemin === '/admin/content/media' && methode === 'POST') {
      // Le serveur de developpement ne stocke rien : il rend une vignette
      // existante, ce qui suffit a eprouver l'enchainement de l'ecran.
      return repondre(201, { data: { url: '/fixtures/vitrine-cascade.webp' } })
    }

    if (chemin === '/auth/login' && methode === 'POST') {
      return void lireCorps().then((corps) => {
        if (corps === null) return repondre(422, { message: 'Corps de requete illisible.' })
        if (
          corps.email === IDENTIFIANTS_DEV.email &&
          corps.password === IDENTIFIANTS_DEV.password
        ) {
          return repondre(200, {
            token: JETON_DEV,
            user: { id: 1, nom: 'Administrateur', email: IDENTIFIANTS_DEV.email, role: 'admin' },
          })
        }
        return repondre(422, { message: 'Identifiants invalides.' })
      })
    }

    if (chemin === '/auth/me') {
      if (requete.headers.authorization !== `Bearer ${JETON_DEV}`) {
        return repondre(401, { message: 'Non authentifie.' })
      }
      return repondre(200, {
        user: { id: 1, nom: 'Administrateur', email: IDENTIFIANTS_DEV.email, role: 'admin' },
      })
    }

    if (chemin === '/auth/logout' && methode === 'POST') {
      return repondre(204, null)
    }

    // --- Jours feries : calendrier et bloc de reglages ---------------------
    // Fidele a `docs/contrat-jours-feries.md` du back : 200 systematique,
    // listes vides plutot qu'absences, tri par date puis identifiant, PUT des
    // reglages en REMPLACEMENT complet.
    const calendrier = () => calendriers[estGabon ? 'gabon' : 'guinee']!

    const TYPES_DE_FETE = ['legale', 'nationale', 'religieuse']

    /** Annees pourvues, croissantes et sans doublon. L'annee servie n'y est pas ajoutee. */
    const anneesPourvues = () =>
      [...new Set(calendrier().holidays.map((fete) => Number(String(fete.date).slice(0, 4))))].sort(
        (a, b) => a - b,
      )

    const feriesDeLAnnee = (annee: number) =>
      calendrier()
        .holidays.filter((fete) => String(fete.date).startsWith(String(annee)))
        .sort((a, b) =>
          String(a.date) === String(b.date)
            ? Number(a.id) - Number(b.id)
            : String(a.date).localeCompare(String(b.date)),
        )

    if ((chemin === '/content/holidays' || chemin === '/admin/holidays') && methode === 'GET') {
      const brut = url.searchParams.get('year')
      const annee = brut === null ? new Date().getFullYear() : Number(brut)
      if (!Number.isInteger(annee) || annee < 1900 || annee > 2100) {
        return repondre(422, { message: "L'annee doit etre comprise entre 1900 et 2100." })
      }
      return repondre(200, {
        data: {
          year: annee,
          available_years: anneesPourvues(),
          intro: calendrier().intro,
          document_url: calendrier().document_url,
          holidays: feriesDeLAnnee(annee),
        },
      })
    }

    if (chemin === '/admin/holidays' && methode === 'POST') {
      return void lireCorps().then((corps) => {
        if (corps === null) return repondre(422, { message: 'Corps de requete illisible.' })
        const manquant = ['name', 'date', 'type'].find(
          (champ) => typeof corps[champ] !== 'string' || String(corps[champ]).trim() === '',
        )
        if (manquant !== undefined) {
          return repondre(422, { message: 'Le nom, la date et le type sont obligatoires.' })
        }
        if (!/^\d{4}-\d{2}-\d{2}$/.test(String(corps.date))) {
          return repondre(422, { message: 'La date doit etre au format AAAA-MM-JJ.' })
        }
        if (!TYPES_DE_FETE.includes(String(corps.type))) {
          return repondre(422, { message: 'Le type de fete est inconnu.' })
        }
        const fete = {
          id: (prochainIdentifiant += 1),
          name: corps.name,
          date: corps.date,
          type: corps.type,
          note: corps.note ?? null,
        }
        calendrier().holidays.push(fete)
        repondre(201, { data: fete })
      })
    }

    const feriePar = (id: number) => calendrier().holidays.find((fete) => fete.id === id)

    if (/^\/admin\/holidays\/\d+$/.test(chemin)) {
      const id = Number(chemin.split('/').pop())
      const fete = feriePar(id)
      // Une fete d'une autre ambassade n'existe pas du point de vue de
      // l'appelante : 404, jamais 403.
      if (fete === undefined) return repondre(404, { message: 'Fete introuvable.' })

      if (methode === 'DELETE') {
        const liste = calendrier().holidays
        liste.splice(liste.indexOf(fete), 1)
        return repondre(204, null)
      }

      if (methode === 'PATCH') {
        return void lireCorps().then((corps) => {
          if (corps === null) return repondre(422, { message: 'Corps de requete illisible.' })
          for (const champ of ['name', 'date', 'type']) {
            if (champ in corps && (corps[champ] === null || String(corps[champ]).trim() === '')) {
              return repondre(422, { message: 'Le nom, la date et le type ne peuvent etre vides.' })
            }
          }
          if ('type' in corps && !TYPES_DE_FETE.includes(String(corps.type))) {
            return repondre(422, { message: 'Le type de fete est inconnu.' })
          }
          Object.assign(fete, corps)
          repondre(200, { data: fete })
        })
      }
    }

    if (chemin === '/admin/holidays/settings') {
      if (methode === 'DELETE') {
        calendrier().intro = null
        calendrier().document_url = null
        return repondre(204, null)
      }
      if (methode === 'PUT') {
        return void lireCorps().then((corps) => {
          if (corps === null) return repondre(422, { message: 'Corps de requete illisible.' })
          // Remplacement complet : un champ absent vaut null, comme au
          // contrat. C'est le piege a reproduire ici, pas a adoucir.
          calendrier().intro = (corps.intro as string | null) ?? null
          calendrier().document_url = (corps.document_url as string | null) ?? null
          repondre(200, {
            data: { intro: calendrier().intro, document_url: calendrier().document_url },
          })
        })
      }
    }

    // --- Module Evenements, administration ------------------------------
    // Le plafond de 100 est celui du serveur : il rabat SILENCIEUSEMENT une
    // limite plus grande. Le simuler ici evite de decouvrir cet ecart en
    // production, ou une page reglee sur 500 lignes en rendrait 100.

    if (chemin === '/admin/secure/events' && methode === 'GET') {
      const tous = evenementsAdmin()
      const limite = Math.min(100, Math.max(1, Number(url.searchParams.get('limit')) || 20))
      const totalPages = Math.max(1, Math.ceil(tous.length / limite))
      const page = Math.min(totalPages, Math.max(1, Number(url.searchParams.get('page')) || 1))
      return repondre(200, {
        data: tous.slice((page - 1) * limite, page * limite),
        pagination: { page, limit: limite, total: tous.length, totalPages },
      })
    }

    if (chemin === '/admin/secure/event-types' && methode === 'GET') {
      return repondre(200, { data: typesEvenement() })
    }

    if (chemin === '/admin/secure/events' && methode === 'POST') {
      return void lireCorps().then((corps) => {
        const brouillon = corps ?? {}
        const nom = String(brouillon.name ?? '')
        // Le simulateur valide le minimum que le back valide, pour que l'ecran
        // rencontre un 422 en developpement plutot qu'en production.
        const manquants: Record<string, string[]> = {}
        for (const champ of ['name', 'date', 'time', 'location']) {
          if (!brouillon[champ]) manquants[champ] = ['Ce champ est obligatoire.']
        }
        if (Object.keys(manquants).length > 0) {
          return repondre(422, {
            message: 'Les donnees fournies sont invalides.',
            errors: manquants,
          })
        }

        const slug = `${slugifier(nom)}-${creationsAdmin.length + 1}`
        const capacite = brouillon.capacity == null ? null : Number(brouillon.capacity)
        const type = typesEvenement().find((t) => t.slug === brouillon.typeEventSlug)
        const cree: Record<string, unknown> = {
          slug,
          name: nom,
          date: brouillon.date,
          time: brouillon.time,
          location: brouillon.location,
          description: brouillon.description ?? '',
          status: 'ACTIVE',
          createdAt: new Date().toISOString(),
          logoUrl: null,
          registrationOpen: brouillon.registrationOpen !== false,
          registrationDeadline: brouillon.registrationDeadline ?? null,
          capacity: capacite,
          registeredCount: 0,
          spotsRemaining: capacite,
          // On rend `typeLabel`, jamais le slug recu : la reponse suit la forme
          // de lecture, sans quoi le front lirait a la creation une forme qu'il
          // ne reverra plus jamais ensuite.
          typeLabel: type?.name ?? null,
          participants: [],
        }
        creationsAdmin.unshift(cree)
        return repondre(201, { data: cree })
      })
    }

    // Publication : POST publie, DELETE retire, sans corps. La reponse du
    // POST ne porte pas l'evenement — le front recharge la fiche derriere,
    // et le simulateur l'y oblige en rendant la meme forme que le back.
    const publication = /^\/admin\/secure\/events\/(.+)\/publication$/.exec(chemin)
    if (publication && (methode === 'POST' || methode === 'DELETE')) {
      const slug = decodeURIComponent(publication[1]!)
      const trouve = evenementsAdmin().find((evenement) => evenement.slug === slug)
      if (!trouve) return repondre(404, { message: "Cet evenement n'existe pas." })
      const publie = methode === 'POST'
      const retouche = {
        ...retouchesAdmin.get(slug),
        isPublished: publie,
        publishedAt: publie ? new Date().toISOString() : null,
      }
      retouchesAdmin.set(slug, retouche)
      if (!publie) return repondre(204, null)
      return repondre(200, { data: { event_slug: slug, published: true } })
    }

    // Le QR d'inscription. 409 tant que l'evenement n'est pas publie,
    // comme le back : avant publication, il n'existe aucune page
    // d'inscription vers laquelle pointer. Le SVG rendu est un motif
    // factice : le simulateur eprouve l'enchainement de l'ecran, pas la
    // lisibilite du QR.
    const qrInscription = /^\/admin\/secure\/events\/(.+)\/registration-qr$/.exec(chemin)
    if (qrInscription && methode === 'GET') {
      const slug = decodeURIComponent(qrInscription[1]!)
      const trouve = evenementsAdmin().find((evenement) => evenement.slug === slug)
      if (!trouve) return repondre(404, { message: "Cet evenement n'existe pas." })
      if (trouve.isPublished !== true) {
        return repondre(409, { message: "Publiez l'evenement avant de demander son QR." })
      }
      const svg =
        '<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 8 8">' +
        '<rect width="8" height="8" fill="#fff"/>' +
        '<path fill="#000" d="M0 0h3v3H0zM5 0h3v3H5zM0 5h3v3H0zM4 4h1v1H4zM6 5h1v1H6zM5 6h1v2H5z"/>' +
        '</svg>'
      return repondre(200, {
        data: {
          registrationUrl: `http://${requete.headers.host ?? 'localhost:5173'}/evenements/inscription/dev-${encodeURIComponent(slug)}`,
          qr: `data:image/svg+xml;base64,${Buffer.from(svg).toString('base64')}`,
        },
      })
    }

    // Le logo, en trois temps comme en production : POST presigne, PUT
    // direct vers le "stockage" (ici une route locale /dev-stockage), GET
    // des octets. Le PUT ne doit porter aucun jeton : l'URL presignee se
    // suffit.
    const logoEvenement = /^\/admin\/secure\/events\/(.+?)\/logo$/.exec(chemin)
    if (logoEvenement && methode === 'POST') {
      const slug = decodeURIComponent(logoEvenement[1]!)
      const trouve = evenementsAdmin().find((evenement) => evenement.slug === slug)
      if (!trouve) return repondre(404, { message: "Cet evenement n'existe pas." })
      return void lireCorps().then((corps) => {
        const mime = corps?.mimeType
        if (mime !== 'image/png' && mime !== 'image/jpeg' && mime !== 'image/webp') {
          return repondre(422, {
            message: 'Les donnees fournies sont invalides.',
            errors: { mimeType: ['Formats acceptes : PNG, JPEG ou WebP.'] },
          })
        }
        if (typeof corps?.size === 'number' && corps.size > 2 * 1024 * 1024) {
          return repondre(422, {
            message: 'Les donnees fournies sont invalides.',
            errors: { size: ['Le logo ne doit pas depasser 2 Mo.'] },
          })
        }
        return repondre(200, {
          success: true,
          data: {
            uploadUrl: `http://${requete.headers.host ?? 'localhost:5173'}/api/dev-stockage/${encodeURIComponent(slug)}?type=${encodeURIComponent(String(mime))}`,
            key: `dev/events/${slug}/logo`,
          },
        })
      })
    }
    if (logoEvenement && methode === 'GET') {
      const slug = decodeURIComponent(logoEvenement[1]!)
      const depose = logosDev.get(slug)
      if (!depose) return repondre(404, { message: "Cet evenement n'a pas de logo." })
      reponse.statusCode = 200
      reponse.setHeader('Content-Type', depose.type)
      return void reponse.end(depose.octets)
    }

    const depotLogo = /^\/dev-stockage\/(.+)$/.exec(chemin)
    if (depotLogo && methode === 'PUT') {
      const slug = decodeURIComponent(depotLogo[1]!)
      const type = url.searchParams.get('type') ?? 'application/octet-stream'
      const morceaux: Buffer[] = []
      requete.on('data', (morceau) => morceaux.push(morceau))
      requete.on('end', () => {
        logosDev.set(slug, { octets: Buffer.concat(morceaux), type })
        repondre(200, null)
      })
      return
    }

    // L'ajout d'invites. Un pass par invite, dans l'ordre du tableau ; le
    // QR est un PNG factice, le simulateur eprouve l'enchainement de
    // l'ecran, pas la lisibilite du code. Le lot est tout ou rien, comme
    // chez SecureCheck.
    const ajoutInvites = /^\/admin\/secure\/events\/(.+?)\/guests$/.exec(chemin)
    if (ajoutInvites && methode === 'POST') {
      const slug = decodeURIComponent(ajoutInvites[1]!)
      const trouve = evenementsAdmin().find((evenement) => evenement.slug === slug)
      if (!trouve) return repondre(404, { message: "Cet evenement n'existe pas." })
      if (String(trouve.status).toUpperCase() === 'CANCELLED') {
        return repondre(422, {
          message: "L'evenement est annule : aucun pass ne peut etre emis.",
        })
      }
      return void lireCorps().then((corps) => {
        const invites = corps?.guests
        if (!Array.isArray(invites) || invites.length === 0 || invites.length > 500) {
          return repondre(422, {
            message: 'Les donnees fournies sont invalides.',
            errors: { guests: ['Le lot doit compter de 1 a 500 invites.'] },
          })
        }
        const erreurs: Record<string, string[]> = {}
        invites.forEach((invite: Record<string, unknown>, rang: number) => {
          for (const champ of ['firstName', 'lastName'] as const) {
            if (typeof invite?.[champ] !== 'string' || invite[champ] === '') {
              erreurs[`guests.${rang}.${champ}`] = ['Ce champ est obligatoire.']
            }
          }
          if (invite?.email !== undefined && !/^[^@\s]+@[^@\s]+$/.test(String(invite.email))) {
            erreurs[`guests.${rang}.email`] = ['Ce courriel est invalide.']
          }
        })
        if (Object.keys(erreurs).length > 0) {
          return repondre(422, {
            message: 'Les donnees fournies sont invalides.',
            errors: erreurs,
          })
        }
        // Un pixel PNG : ce qui compte est la forme (data URL PNG), pas le motif.
        const pixel =
          'data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAAAAAA6fptVAAAACklEQVR4nGNiAAAABgADNjd8qAAAAABJRU5ErkJggg=='
        const passes = invites.map((invite: Record<string, unknown>, rang: number) => ({
          credential: {
            uidn: `GA9${String(rang + 1).padStart(5, '0')}`,
            type: 'event',
            holderName: `${invite.firstName} ${invite.lastName}`,
            holderEmail: invite.email ?? null,
            status: 'active',
            validFrom: null,
            validUntil: null,
            maxScans: null,
            scansUsed: 0,
            currentlyInside: false,
            rfidTag: null,
            eventId: slug,
            createdAt: new Date().toISOString(),
          },
          qr: pixel,
        }))
        const compte = Number(trouve.registeredCount ?? 0) + invites.length
        const retouche = { ...retouchesAdmin.get(slug), registeredCount: compte }
        retouchesAdmin.set(slug, retouche)
        return repondre(201, {
          success: true,
          message: `${invites.length} pass emis.`,
          data: { event: { ...trouve, registeredCount: compte }, passes },
        })
      })
    }

    // La feuille de presence et son export. L'etat de pointage est derive
    // deterministiquement des participants de la fixture : le simulateur
    // eprouve les filtres, la pagination et le telechargement, pas la
    // realite des passages. Le decompte suit le contrat : calcule apres
    // `search`, AVANT le filtre `present`.
    const feuillePresence = /^\/admin\/secure\/events\/(.+?)\/attendance(\/export)?$/.exec(chemin)
    if (feuillePresence && methode === 'GET') {
      const slug = decodeURIComponent(feuillePresence[1]!)
      const trouve = evenementsAdmin().find((evenement) => evenement.slug === slug)
      if (!trouve) return repondre(404, { message: "Cet evenement n'existe pas." })

      const participants = (trouve.participants ?? []) as {
        fullName: string
        email: string
        uidn: string
      }[]
      const lignes = participants
        .map((participant, rang) => {
          const aPointe = rang % 3 !== 2
          return {
            uidn: participant.uidn,
            fullName: participant.fullName,
            email: rang % 7 === 5 ? null : participant.email,
            hasCheckedIn: aPointe,
            checkInAt: aPointe ? new Date(Date.now() - rang * 90_000).toISOString() : null,
            currentlyInside: aPointe && rang % 6 === 0,
            scansUsed: aPointe ? 1 + (rang % 3) : 0,
          }
        })
        .sort((a, b) => a.fullName.localeCompare(b.fullName, 'fr'))

      const terme = (url.searchParams.get('search') ?? '').trim().toLowerCase()
      const cherchees =
        terme === ''
          ? lignes
          : lignes.filter((ligne) =>
              [ligne.fullName, ligne.email ?? '', ligne.uidn].some((champ) =>
                champ.toLowerCase().includes(terme),
              ),
            )

      const summary = {
        totalPasses: cherchees.length,
        present: cherchees.filter((ligne) => ligne.hasCheckedIn).length,
        currentlyInside: cherchees.filter((ligne) => ligne.currentlyInside).length,
        absent: cherchees.filter((ligne) => !ligne.hasCheckedIn).length,
      }

      const present = url.searchParams.get('present')
      const retenues =
        present === 'true' || present === 'false'
          ? cherchees.filter((ligne) => ligne.hasCheckedIn === (present === 'true'))
          : cherchees

      if (feuillePresence[2]) {
        const format = url.searchParams.get('format') ?? 'csv'
        if (format !== 'csv' && format !== 'xlsx') {
          return repondre(422, { message: "Format d'export inconnu : csv ou xlsx." })
        }
        // Meme en xlsx le simulateur sert du CSV : l'ecran n'ouvre pas le
        // fichier, il eprouve le telechargement et le nom propose.
        const champsCsv = (ligne: (typeof retenues)[number]) =>
          [
            ligne.uidn,
            ligne.fullName,
            ligne.email ?? '',
            ligne.hasCheckedIn ? 'Oui' : 'Non',
            ligne.checkInAt ?? '',
            ligne.currentlyInside ? 'Oui' : 'Non',
            String(ligne.scansUsed),
          ].join(',')
        const csv = [
          'uidn,fullName,email,hasCheckedIn,checkInAt,currentlyInside,scansUsed',
          ...retenues.slice(0, 10_000).map(champsCsv),
        ].join('\n')
        const jour = new Date().toISOString().slice(0, 10)
        reponse.statusCode = 200
        reponse.setHeader(
          'Content-Type',
          format === 'csv'
            ? 'text/csv; charset=utf-8'
            : 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
        )
        reponse.setHeader(
          'Content-Disposition',
          `attachment; filename="presence-${slugifier(slug)}-${jour}.${format}"`,
        )
        return void reponse.end(csv)
      }

      const limite = Math.min(100, Math.max(1, Number(url.searchParams.get('limit')) || 20))
      const totalPages = Math.max(1, Math.ceil(retenues.length / limite))
      const page = Math.min(totalPages, Math.max(1, Number(url.searchParams.get('page')) || 1))
      return repondre(200, {
        data: retenues.slice((page - 1) * limite, page * limite),
        pagination: { page, limit: limite, total: retenues.length, totalPages },
        summary,
      })
    }

    // La fiche d'un evenement. Un slug inconnu rend 404 avec un message
    // francais, comme le back : c'est ce que la fiche affiche telle quelle.
    const fiche = /^\/admin\/secure\/events\/([^/]+)$/.exec(chemin)
    if (fiche && methode === 'PATCH') {
      const slug = decodeURIComponent(fiche[1]!)
      const trouve = evenementsAdmin().find((evenement) => evenement.slug === slug)
      if (!trouve) return repondre(404, { message: "Cet evenement n'existe pas." })
      return void lireCorps().then((corps) => {
        const brouillon = { ...corps }
        // L'annulation suit le contrat du 2026-09-14 : `status` s'envoie
        // SEUL, la seule valeur acceptee est `cancelled` (majuscules
        // tolerees en entree), un evenement deja annule rend 422 avec un
        // message seul, et l'annulation depublie.
        if ('status' in brouillon) {
          const valeur = String(brouillon.status ?? '').toLowerCase()
          if (valeur !== 'cancelled' || Object.keys(brouillon).length > 1) {
            return repondre(422, {
              message: 'Les donnees fournies sont invalides.',
              errors: { status: ["Seule l'annulation est acceptee, et elle s'envoie seule."] },
            })
          }
          if (String(trouve.status).toLowerCase() === 'cancelled') {
            return repondre(422, { message: 'Cet evenement est deja annule.' })
          }
          const retouche = {
            ...retouchesAdmin.get(slug),
            status: 'cancelled',
            isPublished: false,
            publishedAt: null,
          }
          retouchesAdmin.set(slug, retouche)
          return repondre(200, { data: { ...trouve, ...retouche } })
        }
        // `typeEventSlug` s'ecrit mais ne se relit pas : on le traduit en
        // `typeLabel`, comme le fait le back.
        if ('typeEventSlug' in brouillon) {
          const type = typesEvenement().find((t) => t.slug === brouillon.typeEventSlug)
          brouillon.typeLabel = type?.name ?? null
          delete brouillon.typeEventSlug
        }
        const retouche = { ...retouchesAdmin.get(slug), ...brouillon }
        retouchesAdmin.set(slug, retouche)
        return repondre(200, { data: { ...trouve, ...retouche } })
      })
    }
    if (fiche && methode === 'GET') {
      const slug = decodeURIComponent(fiche[1]!)
      const trouve = evenementsAdmin().find((evenement) => evenement.slug === slug)
      if (!trouve) return repondre(404, { message: "Cet evenement n'existe pas." })
      return repondre(200, { data: trouve })
    }

    // --- Module Evenements, surface visiteur ---------------------------
    // Le back rend 404 aussi bien pour un module inactif que pour un
    // evenement non publie : le simulateur ne distingue pas davantage.

    if (chemin === '/secure/events' && methode === 'GET') {
      return repondre(200, { data: evenementsPublics() })
    }

    const carteEvenement = chemin.match(/^\/secure\/events\/([^/]+)$/)
    if (carteEvenement && methode === 'GET') {
      const evenement = evenementsPublics().find((e) => e.publicToken === carteEvenement[1])
      if (!evenement) return repondre(404, { message: "Cet evenement n'est pas disponible." })
      return repondre(200, { data: evenement })
    }

    const inscription = chemin.match(/^\/secure\/events\/([^/]+)\/register$/)
    if (inscription && methode === 'POST') {
      const evenement = evenementsPublics().find((e) => e.publicToken === inscription[1])
      if (!evenement) return repondre(404, { message: "Cet evenement n'est pas disponible." })
      if (evenement.isRegistrationClosed) {
        return repondre(409, { message: 'Les inscriptions sont closes pour cet evenement.' })
      }
      return void lireCorps().then((corps) => {
        const nom = typeof corps?.fullName === 'string' ? corps.fullName.trim() : ''
        const courriel = typeof corps?.email === 'string' ? corps.email.trim() : ''
        if (nom === '' || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(courriel)) {
          return repondre(422, { message: 'Certaines informations sont incorrectes.' })
        }
        return repondre(201, { data: { registered: true } })
      })
    }

    if (chemin === '/articles' && methode === 'GET') {
      // Le site public demande statut=publie ; le back-office ne filtre pas.
      // Le simulateur doit honorer les deux, sinon un brouillon apparaitrait
      // en developpement sur des pages publiques et personne ne le verrait
      // avant la mise en ligne.
      const statutDemande = url.searchParams.get('statut')
      const categorieDemandee = url.searchParams.get('categorie')

      const corpus = estGabon ? articlesGabon : articles
      const filtres = corpus.filter((article) => {
        if (statutDemande && article.statut !== statutDemande) return false
        if (categorieDemandee) {
          const categorie = article.categorie as Categorie | undefined
          if (categorie?.slug !== categorieDemandee) return false
        }
        return true
      })

      return repondre(200, {
        data: filtres,
        meta: { total: filtres.length, page: 1, par_page: 10 },
      })
    }

    if (chemin === '/articles' && methode === 'POST') {
      return void lireCorps().then((corps) => {
        if (corps === null) return repondre(422, { message: 'Corps de requete illisible.' })
        const { categorie_slug: categorieSlug, ...reste } = corps
        const article = {
          ...reste,
          categorie:
            typeof categorieSlug === 'string' ? categorieDepuisSlug(categorieSlug) : undefined,
          id: prochainId++,
          vues: 0,
          likes: 0,
          temps_lecture: 1,
        }
        articles = [article, ...articles]
        return repondre(201, { data: article })
      })
    }

    // Le site public adresse un article par son slug, le back-office par son id :
    // le simulateur doit resoudre les deux, comme le fera l'API reelle.
    const trouverArticle = (segment: string) => {
      const identifiant = decodeURIComponent(segment)
      return /^\d+$/.test(identifiant)
        ? articles.find((a) => a.id === Number(identifiant))
        : articles.find((a) => a.slug === identifiant)
    }

    const correspondance = chemin.match(/^\/articles\/([^/]+)$/)
    if (correspondance) {
      const segment = correspondance[1]!

      if (methode === 'GET') {
        const trouve = trouverArticle(segment)
        return trouve ? repondre(200, { data: trouve }) : repondre(404, { message: 'Introuvable.' })
      }

      if (methode === 'PUT') {
        return void lireCorps().then((corps) => {
          if (corps === null) return repondre(422, { message: 'Corps de requete illisible.' })
          const existant = trouverArticle(segment)
          if (!existant) return repondre(404, { message: 'Introuvable.' })
          // Retrouve par reference, jamais par index recalcule : l'article
          // a pu etre localise par slug ou par id, la mutation doit viser
          // exactement l'entree resolue plus haut.
          const index = articles.indexOf(existant)
          const { categorie_slug: categorieSlug, ...reste } = corps
          articles[index] = {
            ...existant,
            ...reste,
            categorie:
              typeof categorieSlug === 'string'
                ? categorieDepuisSlug(categorieSlug)
                : existant.categorie,
            id: existant.id,
          }
          return repondre(200, { data: articles[index] })
        })
      }

      if (methode === 'DELETE') {
        const existant = trouverArticle(segment)
        articles = existant ? articles.filter((a) => a !== existant) : articles
        return repondre(204, null)
      }
    }

    return repondre(404, { message: `Route simulee absente : ${methode} /api${chemin}` })
  }

  /**
   * Sert les vignettes de /fixtures/*, celles que les fixtures JSON declarent
   * en guise d'URL de media. En production ces URL pointeront vers S3 ; en
   * developpement elles doivent bien renvoyer une image, sinon chaque page
   * s'affiche avec des visuels casses et l'on ne voit plus les vraies
   * regressions. Les fichiers vivent hors de public/, qui part en production.
   */
  const DOSSIER_VIGNETTES = fileURLToPath(new URL('../dev-fixtures/', import.meta.url))
  const TYPES_MIME: Record<string, string> = {
    '.png': 'image/png',
    '.jpg': 'image/jpeg',
    '.jpeg': 'image/jpeg',
    '.webp': 'image/webp',
  }

  const gestionnaireVignettes = (requete: IncomingMessage, reponse: ServerResponse) => {
    const url = new URL(requete.url ?? '/', 'http://localhost')
    // basename seul : un nom contenant ../ ne doit pas permettre de remonter
    // hors du dossier des vignettes.
    const nom = path.basename(decodeURIComponent(url.pathname))
    const chemin = path.join(DOSSIER_VIGNETTES, nom)
    const typeMime = TYPES_MIME[path.extname(nom).toLowerCase()]

    if (!typeMime || !existsSync(chemin)) {
      reponse.statusCode = 404
      reponse.setHeader('Content-Type', 'application/json')
      return reponse.end(JSON.stringify({ message: `Vignette de developpement absente : ${nom}` }))
    }

    reponse.statusCode = 200
    reponse.setHeader('Content-Type', typeMime)
    reponse.end(readFileSync(chemin))
  }

  const monter = (serveur: ViteDevServer | PreviewServer) => {
    serveur.middlewares.use('/api', gestionnaireApi)
    serveur.middlewares.use('/fixtures', gestionnaireVignettes)
  }

  return {
    name: 'mock-api',
    apply: 'serve',
    configureServer: monter,
    configurePreviewServer: monter,
  }
}
