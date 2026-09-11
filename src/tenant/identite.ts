import { computed, type ComputedRef } from 'vue'
import { storeToRefs } from 'pinia'
import { useTenantStore } from '@/stores/tenant'

/**
 * Article contracte precedant un nom officiel de pays.
 *
 * L'API ne transmet pas le genre grammatical : le nom officiel commence
 * presque toujours par un nom commun dont le genre est connu (« Republique »,
 * « Royaume »...), ce qui suffit a trancher sans deviner. Le repli « de »
 * convient aux pays dont le nom ne porte pas d'article, comme Malte ou Cuba.
 *
 * Cette table disparaitra si le back finit par transmettre le libelle complet
 * de l'ambassade ; c'est signale dans la PR.
 */
const ARTICLES: ReadonlyArray<readonly [RegExp, string]> = [
  [/^(Etats|États|Emirats|Émirats|Pays-Bas|Bahamas|Philippines|Comores|Seychelles)\b/i, 'des'],
  [/^(Republique|République|Confederation|Confédération|Federation|Fédération)\b/i, 'de la'],
  [/^(Principaute|Principauté|Communaute|Communauté)\b/i, 'de la'],
  [/^(Royaume|Etat|État|Grand-Duche|Grand-Duché|Sultanat|Emirat|Émirat|Commonwealth)\b/i, 'du'],
]

/** La valeur si elle porte autre chose que des espaces, sinon `undefined`. */
function nonVide(valeur: string | undefined): string | undefined {
  const texte = valeur?.trim()
  return texte ? texte : undefined
}

/** Article a placer devant un nom officiel de pays, sans espace final. */
export function articleDuPays(nomOfficiel: string): string {
  const nom = nomOfficiel.trim()
  if (nom === '') return ''
  for (const [motif, article] of ARTICLES) {
    if (motif.test(nom)) return article
  }
  if (/^[aeiouyàâäéèêëîïôöùûü]/i.test(nom)) return "d'"
  return 'de'
}

/** « Ambassade de la Republique Gabonaise », « Ambassade du Royaume du Maroc ». */
export function libelleAmbassade(nomOfficiel: string): string {
  const nom = nomOfficiel.trim()
  if (nom === '') return 'Ambassade'
  const article = articleDuPays(nom)
  return article === "d'" ? `Ambassade d'${nom}` : `Ambassade ${article} ${nom}`
}

/**
 * Identite affichable de l'ambassade courante.
 *
 * Les replis sont volontairement neutres : sans configuration chargee, mieux
 * vaut afficher « Ambassade » que le nom d'un pays qui n'est peut-etre pas
 * celui du domaine visite. Une identite generique se remarque et se corrige ;
 * une identite fausse trompe le visiteur sans que personne ne le voie.
 */
export interface Identite {
  nomOfficiel: ComputedRef<string>
  nomCourt: ComputedRef<string>
  gentile: ComputedRef<string>
  nomDeLAmbassade: ComputedRef<string>
  logo: ComputedRef<string>
  drapeau: ComputedRef<string>
  adresse: ComputedRef<string>
  telephone: ComputedRef<string>
  courriel: ComputedRef<string>
  horaires: ComputedRef<string>
}

export function useIdentite(): Identite {
  const { embassy } = storeToRefs(useTenantStore())

  return {
    nomOfficiel: computed(() => embassy.value?.country_name_official ?? ''),
    nomCourt: computed(() => embassy.value?.country_name_short ?? ''),
    gentile: computed(() => embassy.value?.demonym ?? ''),
    // Le libelle complet, pays d'accueil compris, ne peut venir que de la
    // configuration : rien dans la reponse ne dit ou l'ambassade est
    // installee. Tant qu'il n'est pas renseigne, on affiche le nom du pays
    // represente, qui est juste quoique incomplet.
    nomDeLAmbassade: computed(
      () =>
        nonVide(embassy.value?.display_name) ??
        libelleAmbassade(embassy.value?.country_name_official ?? ''),
    ),
    logo: computed(() => embassy.value?.logo_image ?? ''),
    drapeau: computed(() => embassy.value?.flag_image ?? ''),
    adresse: computed(() => embassy.value?.contact?.address ?? ''),
    telephone: computed(() => embassy.value?.contact?.phone ?? ''),
    courriel: computed(() => embassy.value?.contact?.email ?? ''),
    horaires: computed(() => embassy.value?.contact?.hours ?? ''),
  }
}
