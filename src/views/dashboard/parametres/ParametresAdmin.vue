<template>
  <div>
    <header class="mb-6">
      <h2 class="text-2xl font-bold text-gray-800">Paramètres de l'ambassade</h2>
      <p class="text-gray-600 mt-1">
        Le nom, les coordonnées et les couleurs qui habillent tout le site.
        <span class="font-medium">Ces informations apparaissent sur toutes les pages.</span>
      </p>
    </header>

    <p v-if="chargement" class="text-gray-500 py-20 text-center">Chargement des paramètres…</p>

    <p
      v-else-if="erreurChargement"
      class="bg-red-50 border border-red-200 text-red-800 rounded-xl px-4 py-3"
      role="alert"
    >
      {{ erreurChargement }}
    </p>

    <form v-else class="space-y-6 pb-28" @submit.prevent="enregistrer">
      <!-- IDENTITE -->
      <section class="bg-white rounded-xl border border-gray-200 p-6 space-y-5">
        <div>
          <h3 class="font-semibold text-gray-800">Identité</h3>
          <p class="text-sm text-gray-600">
            Le nom du pays et de l'ambassade, tels qu'ils doivent être écrits.
          </p>
        </div>

        <div>
          <label for="display-name" class="block text-sm font-medium text-gray-700 mb-1.5">
            Nom complet de l'ambassade
          </label>
          <input
            id="display-name"
            v-model.trim="saisie.display_name"
            type="text"
            :maxlength="LONGUEURS_MAX.display_name"
            class="w-full rounded-lg border border-gray-300 px-4 py-2.5 focus:border-primary focus:ring-1 focus:ring-primary outline-none"
            placeholder="Ambassade de la République du Gabon en Guinée"
          />
          <!-- Le repli ne s'arme que si ce champ est vide, et il s'affichera
               en grand des que la banniere en diaporama sera livree : il vaut
               mieux le dire ici qu'apres coup. -->
          <p v-if="saisie.display_name === ''" class="text-sm text-amber-700 mt-2" role="status">
            Vide, le site écrira « Ambassade de la
            {{ saisie.identite.country_name_official || '…' }} », qui ne mentionne pas le pays
            d'accueil.
          </p>
          <p v-else class="text-xs text-gray-500 mt-1.5">
            Le pays d'accueil compris : « … du Gabon en Guinée ».
          </p>
        </div>

        <div class="grid gap-5 md:grid-cols-2">
          <div>
            <label for="nom-officiel" class="block text-sm font-medium text-gray-700 mb-1.5">
              Nom officiel du pays <span class="text-red-600" aria-hidden="true">*</span>
            </label>
            <input
              id="nom-officiel"
              v-model.trim="saisie.identite.country_name_official"
              type="text"
              required
              :maxlength="LONGUEURS_MAX.country_name_official"
              class="w-full rounded-lg border border-gray-300 px-4 py-2.5 focus:border-primary focus:ring-1 focus:ring-primary outline-none"
              placeholder="République Gabonaise"
            />
            <p class="text-xs text-gray-500 mt-1.5">Accents compris : il s'affiche tel quel.</p>
          </div>

          <div>
            <label for="nom-court" class="block text-sm font-medium text-gray-700 mb-1.5">
              Nom court du pays <span class="text-red-600" aria-hidden="true">*</span>
            </label>
            <input
              id="nom-court"
              v-model.trim="saisie.identite.country_name_short"
              type="text"
              required
              :maxlength="LONGUEURS_MAX.country_name_short"
              class="w-full rounded-lg border border-gray-300 px-4 py-2.5 focus:border-primary focus:ring-1 focus:ring-primary outline-none"
              placeholder="Gabon"
            />
          </div>

          <div>
            <label for="gentile" class="block text-sm font-medium text-gray-700 mb-1.5">
              Gentilé
            </label>
            <input
              id="gentile"
              v-model.trim="saisie.identite.demonym"
              type="text"
              :maxlength="LONGUEURS_MAX.demonym"
              class="w-full rounded-lg border border-gray-300 px-4 py-2.5 focus:border-primary focus:ring-1 focus:ring-primary outline-none"
              placeholder="gabonais"
            />
            <p class="text-xs text-gray-500 mt-1.5">Au masculin singulier, sans majuscule.</p>
          </div>
        </div>

        <div class="grid gap-5 md:grid-cols-2">
          <ChampImage v-model="saisie.identite.logo_image" libelle="Logo ou armoiries" />
          <ChampImage v-model="saisie.identite.flag_image" libelle="Drapeau" />
        </div>
      </section>

      <!-- COORDONNEES -->
      <section class="bg-white rounded-xl border border-gray-200 p-6 space-y-5">
        <div>
          <h3 class="font-semibold text-gray-800">Coordonnées</h3>
          <p class="text-sm text-gray-600">Affichées en pied de page et sur la page de contact.</p>
        </div>

        <div>
          <label for="adresse" class="block text-sm font-medium text-gray-700 mb-1.5"
            >Adresse</label
          >
          <textarea
            id="adresse"
            v-model.trim="saisie.contact.address"
            rows="3"
            :maxlength="LONGUEURS_MAX.address"
            class="w-full rounded-lg border border-gray-300 px-4 py-2.5 focus:border-primary focus:ring-1 focus:ring-primary outline-none"
          ></textarea>
        </div>

        <div class="grid gap-5 md:grid-cols-2">
          <div>
            <label for="courriel" class="block text-sm font-medium text-gray-700 mb-1.5">
              Adresse électronique
            </label>
            <input
              id="courriel"
              v-model.trim="saisie.contact.email"
              type="email"
              :maxlength="LONGUEURS_MAX.email"
              class="w-full rounded-lg border border-gray-300 px-4 py-2.5 focus:border-primary focus:ring-1 focus:ring-primary outline-none"
            />
          </div>

          <div>
            <label for="horaires" class="block text-sm font-medium text-gray-700 mb-1.5">
              Horaires d'ouverture
            </label>
            <input
              id="horaires"
              v-model.trim="saisie.contact.hours"
              type="text"
              :maxlength="LONGUEURS_MAX.hours"
              class="w-full rounded-lg border border-gray-300 px-4 py-2.5 focus:border-primary focus:ring-1 focus:ring-primary outline-none"
              placeholder="Du lundi au vendredi, 8h - 16h"
            />
          </div>
        </div>

        <!-- Telephones : liste ordonnee, et l'ordre porte du sens. -->
        <div>
          <div class="flex items-center justify-between gap-4 mb-2">
            <p class="text-sm font-medium text-gray-700">Numéros de téléphone</p>
            <button
              type="button"
              class="text-sm font-semibold text-primary-dark hover:underline disabled:opacity-50 disabled:no-underline"
              :disabled="saisie.contact.phones.length >= NUMEROS_MAX"
              @click="ajouterNumero"
            >
              Ajouter un numéro
            </button>
          </div>

          <p class="text-xs text-gray-500 mb-3">
            Le premier de la liste est le numéro principal du site : c'est celui qui s'affiche seul
            quand la page n'en montre qu'un.
          </p>

          <p v-if="saisie.contact.phones.length === 0" class="text-sm text-gray-500 italic">
            Aucun numéro. Le site n'affichera pas de téléphone.
          </p>

          <ul v-else class="space-y-3">
            <li
              v-for="(numero, rang) in saisie.contact.phones"
              :key="rang"
              class="flex flex-wrap items-start gap-3 rounded-lg border border-gray-200 p-3"
            >
              <span
                class="mt-2.5 text-xs font-semibold px-2 py-0.5 rounded-full whitespace-nowrap"
                :class="rang === 0 ? 'bg-primary/10 text-primary' : 'bg-gray-100 text-gray-600'"
              >
                {{ rang === 0 ? 'Principal' : rang + 1 }}
              </span>

              <input
                v-model.trim="numero.label"
                type="text"
                :maxlength="LONGUEURS_MAX.phone_label"
                :aria-label="`Intitulé du numéro ${rang + 1}`"
                class="flex-1 min-w-[10rem] rounded-lg border border-gray-300 px-3 py-2 focus:border-primary focus:ring-1 focus:ring-primary outline-none"
                placeholder="Standard"
              />
              <input
                v-model.trim="numero.number"
                type="tel"
                :maxlength="LONGUEURS_MAX.phone_number"
                :aria-label="`Numéro ${rang + 1}`"
                class="flex-1 min-w-[10rem] rounded-lg border border-gray-300 px-3 py-2 focus:border-primary focus:ring-1 focus:ring-primary outline-none"
                placeholder="+224 000 00 00 00"
              />

              <div class="flex items-center gap-1">
                <button
                  type="button"
                  class="p-2 rounded-lg text-gray-500 hover:bg-gray-100 disabled:opacity-30"
                  :disabled="rang === 0"
                  :aria-label="`Remonter le numéro ${rang + 1}`"
                  @click="deplacerNumero(rang, -1)"
                >
                  <i class="bx bx-up-arrow-alt text-xl" aria-hidden="true"></i>
                </button>
                <button
                  type="button"
                  class="p-2 rounded-lg text-gray-500 hover:bg-gray-100 disabled:opacity-30"
                  :disabled="rang === saisie.contact.phones.length - 1"
                  :aria-label="`Descendre le numéro ${rang + 1}`"
                  @click="deplacerNumero(rang, 1)"
                >
                  <i class="bx bx-down-arrow-alt text-xl" aria-hidden="true"></i>
                </button>
                <button
                  type="button"
                  class="p-2 rounded-lg text-red-600 hover:bg-red-50"
                  :aria-label="`Supprimer le numéro ${rang + 1}`"
                  @click="saisie.contact.phones.splice(rang, 1)"
                >
                  <i class="bx bx-trash text-xl" aria-hidden="true"></i>
                </button>
              </div>
            </li>
          </ul>
        </div>
      </section>

      <!-- COULEURS -->
      <section class="bg-white rounded-xl border border-gray-200 p-6 space-y-5">
        <div>
          <h3 class="font-semibold text-gray-800">Couleurs du site</h3>
          <p class="text-sm text-gray-600">
            Elles habillent le site entier. L'aperçu montre le texte tel qu'il sera posé dessus.
          </p>
        </div>

        <div class="grid gap-5 md:grid-cols-3">
          <div v-for="couleur in COULEURS_DU_THEME" :key="couleur.champ">
            <label :for="couleur.champ" class="block text-sm font-medium text-gray-700 mb-1.5">
              {{ couleur.libelle }}
            </label>

            <div class="flex items-center gap-2">
              <input
                :id="couleur.champ"
                v-model.trim="saisie.theme[couleur.champ]"
                type="text"
                class="flex-1 min-w-0 rounded-lg border px-3 py-2 font-mono text-sm outline-none focus:ring-1"
                :class="
                  avisParCouleur[couleur.champ]?.niveau === 'refus'
                    ? 'border-red-400 focus:border-red-500 focus:ring-red-500'
                    : 'border-gray-300 focus:border-primary focus:ring-primary'
                "
                placeholder="#009E60"
              />
              <input
                v-model="saisie.theme[couleur.champ]"
                type="color"
                class="h-10 w-10 shrink-0 rounded-lg border border-gray-300 cursor-pointer"
                :aria-label="`Choisir ${couleur.libelle.toLowerCase()}`"
              />
            </div>

            <div
              class="mt-2 rounded-lg px-3 py-2.5 text-sm font-semibold text-center"
              :style="apercuDe(couleur)"
            >
              {{ couleur.texteClair ? 'Texte blanc' : 'Texte foncé' }}
            </div>

            <p
              v-if="avisParCouleur[couleur.champ]"
              class="text-sm mt-2"
              :class="
                avisParCouleur[couleur.champ]?.niveau === 'refus'
                  ? 'text-red-700'
                  : 'text-amber-700'
              "
              :role="avisParCouleur[couleur.champ]?.niveau === 'refus' ? 'alert' : 'status'"
            >
              {{ avisParCouleur[couleur.champ]?.message }}
            </p>
          </div>
        </div>
      </section>

      <!-- BARRE D'ENREGISTREMENT -->
      <div
        class="fixed bottom-0 left-0 right-0 bg-white border-t border-gray-200 px-6 py-4 flex flex-wrap items-center justify-end gap-4 z-30"
      >
        <p
          v-if="erreurEnregistrement"
          class="text-sm text-red-700 flex-1 min-w-[12rem]"
          role="alert"
        >
          {{ erreurEnregistrement }}
        </p>
        <p
          v-else-if="enregistre"
          class="text-sm text-primary-dark font-semibold flex-1 min-w-[12rem]"
          role="status"
        >
          Paramètres enregistrés. Le site est à jour.
        </p>
        <p v-else-if="modifie" class="text-sm text-gray-600 flex-1 min-w-[12rem]">
          Modifications non enregistrées.
        </p>
        <span v-else class="flex-1"></span>

        <button
          type="button"
          class="px-4 py-2.5 rounded-lg border border-gray-300 font-semibold text-gray-700 hover:bg-gray-50 transition-colors disabled:opacity-50"
          :disabled="!modifie || envoiEnCours"
          @click="reinitialiser"
        >
          Annuler
        </button>
        <button
          type="submit"
          class="bg-primary hover:bg-primary-dark text-white font-semibold px-6 py-2.5 rounded-lg transition-colors disabled:opacity-50"
          :disabled="envoiEnCours || !modifie"
        >
          {{ envoiEnCours ? 'Enregistrement…' : 'Enregistrer' }}
        </button>
      </div>
    </form>
  </div>
</template>

<script setup lang="ts">
import { computed, onMounted, ref } from 'vue'
import { useTenantStore } from '@/stores/tenant'
import ChampImage from '@/components/ui/ChampImage.vue'
import {
  COULEURS_DU_THEME,
  LONGUEURS_MAX,
  NUMEROS_MAX,
  enregistrerEmbassy,
  messageErreurEmbassy,
  recupererEmbassyAdmin,
  avisSurLaCouleur,
  type AvisSurCouleur,
  versSaisie,
  type EmbassySaisie,
} from '@/api/embassy'

/**
 * Le lot 1 des parametres : identite, coordonnees et couleurs.
 *
 * L'API existe depuis le premier jour — c'est cet ecran qui manquait, et son
 * absence obligeait a corriger un accent en base de donnees. Trois champs
 * restent hors de portee et le resteront : `slug` et `domain`, dont une faute
 * de frappe rend le site injoignable, et `modules`, qui est du
 * provisionnement et non de la configuration d'ambassade.
 */
const tenant = useTenantStore()

const chargement = ref(true)
const erreurChargement = ref('')
const envoiEnCours = ref(false)
const erreurEnregistrement = ref('')
const enregistre = ref(false)

const VIDE: EmbassySaisie = {
  display_name: '',
  identite: {
    country_name_official: '',
    country_name_short: '',
    demonym: '',
    logo_image: '',
    flag_image: '',
  },
  contact: { address: '', phones: [], email: '', hours: '' },
  theme: { color_primary: '', color_secondary: '', color_accent: '' },
}

/**
 * Copie profonde d'une saisie.
 *
 * Le clonage structure du navigateur ne convient pas ici : ce qu'on duplique
 * est la valeur d'une `ref`, donc un proxy reactif, et il refuse les proxys.
 * La saisie ne porte que des chaines et des tableaux de chaines, un
 * aller-retour JSON la reproduit donc exactement.
 */
const copie = (valeur: EmbassySaisie): EmbassySaisie =>
  JSON.parse(JSON.stringify(valeur)) as EmbassySaisie

const saisie = ref<EmbassySaisie>(copie(VIDE))
/** L'etat servi par le serveur, pour savoir ce qui a bouge et pouvoir y revenir. */
const servi = ref<EmbassySaisie>(copie(VIDE))

const modifie = computed(() => JSON.stringify(saisie.value) !== JSON.stringify(servi.value))

/** L'avis porte sur chaque couleur : rien, une reserve, ou un refus. */
const avisParCouleur = computed(
  () =>
    Object.fromEntries(
      COULEURS_DU_THEME.map((couleur) => [
        couleur.champ,
        avisSurLaCouleur(saisie.value.theme[couleur.champ], couleur.texteClair),
      ]),
    ) as Record<string, AvisSurCouleur | null>,
)

const apercuDe = (couleur: (typeof COULEURS_DU_THEME)[number]) => ({
  backgroundColor: saisie.value.theme[couleur.champ] || 'transparent',
  color: couleur.texteClair ? '#ffffff' : 'var(--color-ink-dark)',
})

function ajouterNumero(): void {
  if (saisie.value.contact.phones.length >= NUMEROS_MAX) return
  saisie.value.contact.phones.push({ label: '', number: '' })
}

/** Deplace une entree d'un rang : c'est ainsi qu'on change le numero principal. */
function deplacerNumero(rang: number, pas: number): void {
  const liste = saisie.value.contact.phones
  const cible = rang + pas
  const deplace = liste[rang]
  const remplace = liste[cible]
  if (deplace === undefined || remplace === undefined) return
  liste[rang] = remplace
  liste[cible] = deplace
}

function reinitialiser(): void {
  saisie.value = copie(servi.value)
  erreurEnregistrement.value = ''
  enregistre.value = false
}

async function enregistrer(): Promise<void> {
  erreurEnregistrement.value = ''
  enregistre.value = false

  const couleurRefusee = COULEURS_DU_THEME.find(
    (c) => avisParCouleur.value[c.champ]?.niveau === 'refus',
  )
  if (couleurRefusee) {
    erreurEnregistrement.value = `Corrigez la ${couleurRefusee.libelle.toLowerCase()} avant d'enregistrer.`
    return
  }

  // Un numero sans intitule ni numero est une ligne que l'editrice a ouverte
  // puis laissee : on la retire plutot que de la faire refuser par le serveur.
  saisie.value.contact.phones = saisie.value.contact.phones.filter(
    (numero) => numero.label !== '' || numero.number !== '',
  )
  const incomplet = saisie.value.contact.phones.some(
    (numero) => numero.label === '' || numero.number === '',
  )
  if (incomplet) {
    erreurEnregistrement.value = 'Chaque numéro demande un intitulé et un numéro.'
    return
  }

  envoiEnCours.value = true
  try {
    const ambassade = await enregistrerEmbassy(saisie.value)
    servi.value = versSaisie(ambassade)
    saisie.value = copie(servi.value)
    enregistre.value = true
    // Le titre de l'onglet, les couleurs et le pied de page viennent du store :
    // sans ce rechargement, l'ambassade enregistre et ne voit rien changer.
    await tenant.charger()
  } catch (souleve) {
    erreurEnregistrement.value = messageErreurEmbassy(souleve)
  } finally {
    envoiEnCours.value = false
  }
}

onMounted(async () => {
  try {
    servi.value = versSaisie(await recupererEmbassyAdmin())
    saisie.value = copie(servi.value)
  } catch (souleve) {
    erreurChargement.value = messageErreurEmbassy(souleve)
  } finally {
    chargement.value = false
  }
})
</script>
