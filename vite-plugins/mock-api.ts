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

export function mockApi(): Plugin {
  // Etat en memoire : remis a zero a chaque redemarrage du serveur de dev.
  let articles = (fixture('articles') as { data: unknown[] }).data as Record<string, unknown>[]
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

    if (chemin === '/bootstrap') {
      return repondre(200, fixture('bootstrap'))
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

    if (chemin === '/articles' && methode === 'GET') {
      // Le site public demande statut=publie ; le back-office ne filtre pas.
      // Le simulateur doit honorer les deux, sinon un brouillon apparaitrait
      // en developpement sur des pages publiques et personne ne le verrait
      // avant la mise en ligne.
      const statutDemande = url.searchParams.get('statut')
      const categorieDemandee = url.searchParams.get('categorie')

      const filtres = articles.filter((article) => {
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
