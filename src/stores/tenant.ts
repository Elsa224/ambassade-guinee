import { defineStore } from 'pinia'
import { ref, computed } from 'vue'
import { fetchBootstrap, type Embassy } from '@/api/bootstrap'
import { applyTheme } from '@/theme/applyTheme'
import { ApiError } from '@/api/client'
import { rubriqueOuverte as rubriqueOuvertePour } from '@/tenant/rubriques'

/**
 * Config du site courant, résolue par le nom de domaine.
 * Un seul build sert tous les domaines : tout ce qui diffère d'une ambassade
 * à l'autre passe par ce store.
 */
export const useTenantStore = defineStore('tenant', () => {
  const embassy = ref<Embassy | null>(null)
  const chargement = ref(false)
  const erreur = ref<string | null>(null)

  const nomCourt = computed(() => embassy.value?.country_name_short ?? '')

  function moduleActif(nom: string): boolean {
    return embassy.value?.modules?.[nom] === true
  }

  /** La regle vit dans `tenant/rubriques.ts`, qui la documente. */
  function rubriqueOuverte(nom: string | null): boolean {
    return rubriqueOuvertePour(nom, embassy.value)
  }

  /**
   * Charge la config du tenant et applique son thème.
   * Ne lève jamais : un échec de bootstrap laisse l'application se monter avec
   * le thème de repli déclaré dans style.css, ce qui vaut mieux qu'une page
   * blanche sur un site d'ambassade.
   */
  async function charger(domain: string = window.location.hostname): Promise<void> {
    chargement.value = true
    erreur.value = null
    try {
      const resultat = await fetchBootstrap(domain)
      embassy.value = resultat
      applyTheme(resultat.theme)
    } catch (souleve) {
      erreur.value = souleve instanceof ApiError ? souleve.message : 'Configuration indisponible.'
      console.error('Échec du bootstrap du tenant :', souleve)
    } finally {
      chargement.value = false
    }
  }

  return { embassy, chargement, erreur, nomCourt, moduleActif, rubriqueOuverte, charger }
})
