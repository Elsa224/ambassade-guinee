import { ref, computed, watch, type Ref } from 'vue'
import { listerArticlesPublies, type Article } from '@/api/articles'
import { ApiError } from '@/api/client'

/**
 * Charge les actualites publiees, eventuellement restreintes a une categorie.
 *
 * Le chargement suit la categorie : passer d'une page de categorie a une autre
 * ne remonte pas le composant, seule la route change. Sans ce suivi, la
 * deuxieme page afficherait les articles de la premiere.
 */
export function useActualites(categorie?: Ref<string | undefined>) {
  const articles = ref<Article[]>([])
  const chargement = ref(true)
  const erreur = ref('')

  async function charger() {
    chargement.value = true
    erreur.value = ''
    try {
      articles.value = await listerArticlesPublies(categorie?.value)
    } catch (cause) {
      // Le visiteur n'a que faire du code HTTP : il a besoin de savoir que la
      // page n'a rien pu afficher, et qu'il peut reessayer.
      erreur.value =
        cause instanceof ApiError
          ? 'Les actualités n’ont pas pu être chargées.'
          : 'Les actualités sont momentanément indisponibles.'
      articles.value = []
    } finally {
      chargement.value = false
    }
  }

  watch(() => categorie?.value, charger, { immediate: true })

  /** Categories reellement presentes, pour alimenter les filtres. */
  const categories = computed(() => {
    const connues = new Map<string, Article['categorie']>()
    for (const article of articles.value) {
      if (article.categorie?.slug) connues.set(article.categorie.slug, article.categorie)
    }
    return [...connues.values()]
  })

  return { articles, categories, chargement, erreur, recharger: charger }
}

/** Date lisible en francais, ou chaine vide si l'API n'en fournit pas. */
export function formaterDate(date: string | undefined): string {
  if (!date) return ''
  const valeur = new Date(date)
  if (Number.isNaN(valeur.getTime())) return ''
  return valeur.toLocaleDateString('fr-FR', { year: 'numeric', month: 'long', day: 'numeric' })
}

/**
 * Date courte pour les pastilles, du genre « 15 MARS ».
 *
 * Volontairement distincte de formaterDate : les pastilles de la page
 * d'accueil disposent de deux lignes, pas d'une phrase.
 */
export function formaterDateCourte(date: string | undefined): string {
  if (!date) return ''
  const valeur = new Date(date)
  if (Number.isNaN(valeur.getTime())) return ''
  return valeur
    .toLocaleDateString('fr-FR', { day: '2-digit', month: 'short' })
    .replace('.', '')
    .toUpperCase()
}
