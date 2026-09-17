<template>
  <div>
    <header class="mb-6">
      <h2 class="text-2xl font-bold text-gray-800">Contenu de l'accueil</h2>
      <p class="text-gray-600 mt-1">
        Le mot de bienvenue, la biographie de l'ambassadeur, les dirigeants et les photos de la page
        d'accueil.
        <span class="font-medium"
          >Tant qu'une section est vide, elle n'apparaît pas sur le site.</span
        >
      </p>
    </header>

    <p v-if="chargement" class="text-gray-500 py-20 text-center">Chargement du contenu…</p>

    <p
      v-else-if="erreurChargement"
      class="bg-red-50 border border-red-200 text-red-800 rounded-xl px-4 py-3"
      role="alert"
    >
      {{ erreurChargement }}
    </p>

    <div v-else class="space-y-6">
      <!-- Bannière d'accueil -->
      <section class="bg-white shadow-sm rounded-xl p-6">
        <div class="flex items-start justify-between gap-4 mb-5">
          <div>
            <h3 class="text-lg font-semibold text-primary">Bannière d'accueil</h3>
            <p class="text-sm text-gray-500 mt-0.5">
              Le grand visuel en haut de la page d'accueil, et sa mise en page.
            </p>
          </div>
          <EtatSection :rempli="contenu.hero !== null" />
        </div>

        <fieldset class="mb-6">
          <legend class="block text-sm font-medium text-gray-700 mb-2">Mise en page</legend>
          <div class="grid gap-3 sm:grid-cols-2">
            <label
              v-for="choix in MISES_EN_PAGE"
              :key="choix.valeur"
              class="flex gap-3 border rounded-lg px-4 py-3 cursor-pointer transition-colors"
              :class="
                banniere.variant === choix.valeur
                  ? 'border-primary bg-primary/5'
                  : 'border-gray-200 hover:bg-gray-50'
              "
            >
              <input
                v-model="banniere.variant"
                type="radio"
                name="mise-en-page-banniere"
                :value="choix.valeur"
                class="mt-1"
              />
              <span>
                <span class="block font-semibold text-gray-800">{{ choix.libelle }}</span>
                <span class="block text-sm text-gray-600">{{ choix.description }}</span>
              </span>
            </label>
          </div>
        </fieldset>

        <div class="space-y-5">
          <div>
            <label for="titre-banniere" class="block text-sm font-medium text-gray-700 mb-1.5">
              Titre
            </label>
            <input
              id="titre-banniere"
              v-model.trim="banniere.title"
              type="text"
              :maxlength="LONGUEURS_BANNIERE.title"
              class="w-full border border-gray-300 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-primary/40"
            />
            <p class="text-xs text-gray-500 mt-1">
              Laissé vide, le site affiche le nom de l'ambassade :
              <span class="font-medium">{{ nomDeLAmbassade }}</span>
            </p>
          </div>

          <div>
            <label for="intro-banniere" class="block text-sm font-medium text-gray-700 mb-1.5">
              Accroche
            </label>
            <textarea
              id="intro-banniere"
              v-model.trim="banniere.intro"
              rows="3"
              :maxlength="LONGUEURS_BANNIERE.intro"
              class="w-full border border-gray-300 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-primary/40"
            ></textarea>
            <p class="text-xs text-gray-500 mt-1">
              {{ banniere.intro.length }} / {{ LONGUEURS_BANNIERE.intro }} caractères. Laissée vide,
              aucune accroche n'est affichée.
            </p>
          </div>
        </div>

        <div class="flex flex-wrap items-center gap-4 mt-6">
          <button
            type="button"
            class="bg-primary text-white px-5 py-2 rounded-lg font-semibold hover:bg-primary-dark disabled:opacity-50"
            :disabled="enregistrement"
            @click="enregistrerLaBanniere"
          >
            Enregistrer
          </button>
          <button
            v-if="contenu.hero !== null"
            type="button"
            class="text-sm font-semibold text-red-700 hover:underline"
            @click="retourAuDefautOuvert = true"
          >
            Revenir à la bannière par défaut
          </button>
        </div>

        <!-- Le diaporama vide ne se devine pas : le site retombe sur la
             bannière simple, et l'écran doit le dire avant que l'éditrice
             aille vérifier sur le site. -->
        <p
          v-if="diaporamaSansImage"
          class="mt-5 bg-amber-50 border border-amber-200 text-amber-800 rounded-lg px-4 py-3 text-sm"
          role="status"
        >
          Aucune image n'est encore ajoutée. Tant que le diaporama est vide, le site affiche la
          bannière simple.
        </p>

        <div v-if="banniere.variant === 'diaporama'" class="mt-6 border-t border-gray-100 pt-6">
          <ListeOrdonnee
            titre="Images du diaporama"
            :description="`Les photos qui défilent, avec leur citation. ${DIAPOSITIVES_MAX} au maximum.`"
            libelle-ajout="Ajouter une image"
            :elements="diapositives"
            @monter="(id) => deplacerDiapositive(id, -1)"
            @descendre="(id) => deplacerDiapositive(id, 1)"
            @supprimer="retirerDiapositive"
            @ajouter="ouvrirDiapositive(null)"
            @modifier="ouvrirDiapositive"
          >
            <template #apercu="{ element }">
              <img :src="element.image_url" alt="" class="w-20 h-14 rounded-lg object-cover" />
              <div class="min-w-0">
                <p class="text-sm text-gray-700 truncate">
                  {{ element.quote || 'Aucune citation' }}
                </p>
                <p v-if="element.author" class="text-xs text-gray-500 truncate">
                  {{ element.author }}
                </p>
              </div>
            </template>
          </ListeOrdonnee>

          <p v-if="diapositives.length >= DIAPOSITIVES_MAX" class="text-sm text-gray-500 mt-2">
            Le maximum de {{ DIAPOSITIVES_MAX }} images est atteint.
          </p>
        </div>
      </section>

      <!-- Mot de bienvenue -->
      <section class="bg-white shadow-sm rounded-xl p-6">
        <div class="flex items-start justify-between gap-4 mb-5">
          <div>
            <h3 class="text-lg font-semibold text-primary">Mot de bienvenue</h3>
            <p class="text-sm text-gray-500 mt-0.5">Le texte d'accueil signé par l'ambassade.</p>
          </div>
          <EtatSection :rempli="contenu.welcome !== null" />
        </div>

        <form class="space-y-4" @submit.prevent="enregistrerBienvenue">
          <div>
            <label for="titre-bienvenue" class="block text-sm font-medium text-gray-700 mb-1.5">
              Titre <span class="text-red-600" aria-hidden="true">*</span>
            </label>
            <input
              id="titre-bienvenue"
              v-model.trim="bienvenue.title"
              type="text"
              maxlength="191"
              class="w-full border border-gray-300 rounded-lg px-4 py-2.5 focus:outline-none focus:ring-2 focus:ring-primary/40 focus:border-primary"
            />
          </div>

          <div>
            <label for="corps-bienvenue" class="block text-sm font-medium text-gray-700 mb-1.5">
              Texte
            </label>
            <textarea
              id="corps-bienvenue"
              v-model="bienvenue.body_html"
              rows="8"
              class="w-full border border-gray-300 rounded-lg px-4 py-2.5 font-mono text-sm focus:outline-none focus:ring-2 focus:ring-primary/40 focus:border-primary"
            ></textarea>
            <p class="text-xs text-gray-500 mt-1.5">
              Les balises simples sont acceptées&nbsp;: paragraphes, gras, italique, retours à la
              ligne.
            </p>
          </div>

          <p v-if="erreurFormulaire" class="text-sm text-red-700" role="alert">
            {{ erreurFormulaire }}
          </p>

          <div class="flex items-center gap-3">
            <button
              type="submit"
              :disabled="enregistrement"
              class="bg-primary hover:bg-primary-dark disabled:opacity-60 text-white font-semibold px-5 py-2.5 rounded-lg transition-colors"
            >
              {{ enregistrement ? 'Enregistrement…' : 'Enregistrer' }}
            </button>
            <button
              v-if="contenu.welcome !== null"
              type="button"
              class="text-sm text-red-700 hover:underline"
              @click="retirerBienvenue"
            >
              Retirer du site
            </button>
          </div>
        </form>
      </section>

      <!-- Biographie de l'ambassadeur -->
      <section class="bg-white shadow-sm rounded-xl p-6">
        <div class="flex items-start justify-between gap-4 mb-5">
          <div>
            <h3 class="text-lg font-semibold text-primary">Biographie de l'ambassadeur</h3>
            <p class="text-sm text-gray-500 mt-0.5">
              La page « Mot de l'ambassadeur » et le bouton Biographie de l'accueil.
            </p>
          </div>
          <EtatSection :rempli="contenu.ambassador !== null" />
        </div>

        <form class="space-y-4" @submit.prevent="enregistrerAmbassadeur">
          <ChampImage v-model="ambassadeur.image_url" libelle="Portrait" />

          <div>
            <label for="nom-ambassadeur" class="block text-sm font-medium text-gray-700 mb-1.5">
              Nom <span class="text-red-600" aria-hidden="true">*</span>
            </label>
            <input
              id="nom-ambassadeur"
              v-model.trim="ambassadeur.name"
              type="text"
              maxlength="191"
              class="w-full border border-gray-300 rounded-lg px-4 py-2.5 focus:outline-none focus:ring-2 focus:ring-primary/40 focus:border-primary"
            />
          </div>

          <div>
            <label for="titre-ambassadeur" class="block text-sm font-medium text-gray-700 mb-1.5">
              Fonction <span class="text-red-600" aria-hidden="true">*</span>
            </label>
            <input
              id="titre-ambassadeur"
              v-model.trim="ambassadeur.title"
              type="text"
              maxlength="191"
              class="w-full border border-gray-300 rounded-lg px-4 py-2.5 focus:outline-none focus:ring-2 focus:ring-primary/40 focus:border-primary"
            />
          </div>

          <div>
            <label for="corps-ambassadeur" class="block text-sm font-medium text-gray-700 mb-1.5">
              Biographie <span class="text-red-600" aria-hidden="true">*</span>
            </label>
            <textarea
              id="corps-ambassadeur"
              v-model="ambassadeur.body_html"
              rows="12"
              class="w-full border border-gray-300 rounded-lg px-4 py-2.5 font-mono text-sm focus:outline-none focus:ring-2 focus:ring-primary/40 focus:border-primary"
            ></textarea>
            <p class="text-xs text-gray-500 mt-1.5">
              Les balises simples sont acceptées&nbsp;: paragraphes, titres, gras, italique, listes.
              16&nbsp;000 caractères au plus.
            </p>
          </div>

          <p v-if="erreurFormulaire" class="text-sm text-red-700" role="alert">
            {{ erreurFormulaire }}
          </p>

          <div class="flex items-center gap-3">
            <button
              type="submit"
              :disabled="enregistrement"
              class="bg-primary hover:bg-primary-dark disabled:opacity-60 text-white font-semibold px-5 py-2.5 rounded-lg transition-colors"
            >
              {{ enregistrement ? 'Enregistrement…' : 'Enregistrer' }}
            </button>
            <button
              v-if="contenu.ambassador !== null"
              type="button"
              class="text-sm text-red-700 hover:underline"
              @click="retirerAmbassadeur"
            >
              Retirer du site
            </button>
          </div>
        </form>
      </section>

      <!-- Dirigeants -->
      <ListeOrdonnee
        titre="Dirigeants"
        description="Les portraits affichés sous le mot de bienvenue."
        libelle-ajout="Ajouter un dirigeant"
        :elements="contenu.leaders"
        @monter="(id) => deplacer('leaders', id, -1)"
        @descendre="(id) => deplacer('leaders', id, 1)"
        @supprimer="(id) => retirer('leaders', id)"
        @ajouter="ouvrirDirigeant(null)"
        @modifier="ouvrirDirigeant"
      >
        <template #apercu="{ element }">
          <img :src="element.image_url" alt="" class="w-14 h-14 rounded-lg object-cover" />
          <div class="min-w-0">
            <p class="font-semibold text-gray-800 truncate">{{ element.name }}</p>
            <p class="text-sm text-gray-600 truncate">{{ element.role }}</p>
            <p v-if="element.subtitle" class="text-xs text-gray-500 truncate">
              {{ element.subtitle }}
            </p>
          </div>
        </template>
      </ListeOrdonnee>

      <!-- Vitrine -->
      <ListeOrdonnee
        titre="Photos de la vitrine"
        description="Les images de la bannière d'accueil."
        libelle-ajout="Ajouter une photo"
        :elements="contenu.showcase"
        @monter="(id) => deplacer('showcase', id, -1)"
        @descendre="(id) => deplacer('showcase', id, 1)"
        @supprimer="(id) => retirer('showcase', id)"
        @ajouter="ouvrirPhoto(null)"
        @modifier="ouvrirPhoto"
      >
        <template #apercu="{ element }">
          <img :src="element.image_url" alt="" class="w-20 h-14 rounded-lg object-cover" />
          <p class="text-sm text-gray-600 truncate">
            {{ element.alt || 'Aucun texte alternatif' }}
          </p>
        </template>
      </ListeOrdonnee>
    </div>

    <!-- Formulaire d'un dirigeant -->
    <Boite
      v-if="dirigeantOuvert"
      :titre="dirigeantEdite ? 'Modifier le dirigeant' : 'Ajouter un dirigeant'"
      @fermer="dirigeantOuvert = false"
    >
      <form class="space-y-5" @submit.prevent="enregistrerDirigeant">
        <ChampImage v-model="saisieDirigeant.image_url" libelle="Portrait" requis />

        <div>
          <label for="nom-dirigeant" class="block text-sm font-medium text-gray-700 mb-1.5">
            Nom <span class="text-red-600" aria-hidden="true">*</span>
          </label>
          <input
            id="nom-dirigeant"
            v-model.trim="saisieDirigeant.name"
            type="text"
            maxlength="191"
            class="w-full border border-gray-300 rounded-lg px-4 py-2.5 focus:outline-none focus:ring-2 focus:ring-primary/40 focus:border-primary"
          />
        </div>

        <div>
          <label for="fonction-dirigeant" class="block text-sm font-medium text-gray-700 mb-1.5">
            Fonction <span class="text-red-600" aria-hidden="true">*</span>
          </label>
          <input
            id="fonction-dirigeant"
            v-model.trim="saisieDirigeant.role"
            type="text"
            maxlength="191"
            class="w-full border border-gray-300 rounded-lg px-4 py-2.5 focus:outline-none focus:ring-2 focus:ring-primary/40 focus:border-primary"
          />
        </div>

        <div>
          <label for="soustitre-dirigeant" class="block text-sm font-medium text-gray-700 mb-1.5">
            Sous-titre <span class="text-gray-400 font-normal">(facultatif)</span>
          </label>
          <input
            id="soustitre-dirigeant"
            v-model.trim="soustitreDirigeant"
            type="text"
            maxlength="191"
            placeholder="Le pays ou l'institution"
            class="w-full border border-gray-300 rounded-lg px-4 py-2.5 focus:outline-none focus:ring-2 focus:ring-primary/40 focus:border-primary"
          />
        </div>

        <p v-if="erreurFormulaire" class="text-sm text-red-700" role="alert">
          {{ erreurFormulaire }}
        </p>

        <div class="flex justify-end gap-3 pt-2">
          <button
            type="button"
            class="px-4 py-2.5 text-gray-700 font-semibold"
            @click="dirigeantOuvert = false"
          >
            Annuler
          </button>
          <button
            type="submit"
            :disabled="enregistrement"
            class="bg-primary hover:bg-primary-dark disabled:opacity-60 text-white font-semibold px-5 py-2.5 rounded-lg transition-colors"
          >
            {{ enregistrement ? 'Enregistrement…' : 'Enregistrer' }}
          </button>
        </div>
      </form>
    </Boite>

    <!-- Formulaire d'une image du diaporama -->
    <Boite
      v-if="diapositiveOuverte"
      :titre="diapositiveEditee ? 'Modifier l\'image' : 'Ajouter une image'"
      @fermer="diapositiveOuverte = false"
    >
      <form class="space-y-5" @submit.prevent="enregistrerLaDiapositive">
        <ChampImage v-model="saisieDiapositive.image_url" libelle="Image de fond" requis />

        <p class="text-xs text-gray-500 -mt-2">
          Le texte est posé sur cette photo, sous un voile sombre. Une image très claire reste
          lisible, mais une image chargée au centre gêne la lecture.
        </p>

        <div>
          <label for="citation-diapositive" class="block text-sm font-medium text-gray-700 mb-1.5">
            Citation <span class="text-gray-400 font-normal">(facultative)</span>
          </label>
          <textarea
            id="citation-diapositive"
            v-model.trim="citationDiapositive"
            rows="3"
            :maxlength="LONGUEURS_BANNIERE.quote"
            class="w-full border border-gray-300 rounded-lg px-4 py-2.5 focus:outline-none focus:ring-2 focus:ring-primary/40 focus:border-primary"
          ></textarea>
          <p class="text-xs text-gray-500 mt-1.5">
            {{ citationDiapositive.length }} / {{ LONGUEURS_BANNIERE.quote }} caractères.
          </p>
        </div>

        <div>
          <label for="auteur-diapositive" class="block text-sm font-medium text-gray-700 mb-1.5">
            Signature <span class="text-gray-400 font-normal">(facultative)</span>
          </label>
          <input
            id="auteur-diapositive"
            v-model.trim="auteurDiapositive"
            type="text"
            :maxlength="LONGUEURS_BANNIERE.author"
            class="w-full border border-gray-300 rounded-lg px-4 py-2.5 focus:outline-none focus:ring-2 focus:ring-primary/40 focus:border-primary"
          />
          <p class="text-xs text-gray-500 mt-1.5">Le nom de la personne citée, et sa fonction.</p>
        </div>

        <p v-if="erreurFormulaire" class="text-sm text-red-700" role="alert">
          {{ erreurFormulaire }}
        </p>

        <div class="flex justify-end gap-3 pt-2">
          <button
            type="button"
            class="px-4 py-2.5 text-gray-700 font-semibold"
            @click="diapositiveOuverte = false"
          >
            Annuler
          </button>
          <button
            type="submit"
            :disabled="enregistrement"
            class="bg-primary hover:bg-primary-dark disabled:opacity-60 text-white font-semibold px-5 py-2.5 rounded-lg transition-colors"
          >
            Enregistrer
          </button>
        </div>
      </form>
    </Boite>

    <!-- Retour a la banniere par defaut : la suppression est franche, et
         l'ecran le dit en toutes lettres. Une editrice qui veut garder ses
         images en affichant la banniere simple change de mise en page. -->
    <Boite
      v-if="retourAuDefautOuvert"
      titre="Revenir à la bannière par défaut ?"
      @fermer="retourAuDefautOuvert = false"
    >
      <div class="space-y-5">
        <p class="text-gray-700">
          Le titre, l'accroche et
          <span class="font-semibold"
            >les {{ diapositives.length }} image{{ diapositives.length > 1 ? 's' : '' }} du
            diaporama</span
          >
          seront supprimés. Cette action est définitive.
        </p>
        <p class="text-gray-700">
          Pour garder vos images tout en affichant la bannière simple, choisissez plutôt la mise en
          page <span class="font-semibold">Bannière simple</span> et enregistrez.
        </p>

        <p v-if="erreurFormulaire" class="text-sm text-red-700" role="alert">
          {{ erreurFormulaire }}
        </p>

        <div class="flex justify-end gap-3 pt-2">
          <button
            type="button"
            class="px-4 py-2.5 text-gray-700 font-semibold"
            @click="retourAuDefautOuvert = false"
          >
            Annuler
          </button>
          <button
            type="button"
            :disabled="enregistrement"
            class="bg-red-700 hover:bg-red-800 disabled:opacity-60 text-white font-semibold px-5 py-2.5 rounded-lg transition-colors"
            @click="revenirAuDefaut"
          >
            Supprimer la bannière
          </button>
        </div>
      </div>
    </Boite>

    <!-- Formulaire d'une photo -->
    <Boite
      v-if="photoOuverte"
      :titre="photoEditee ? 'Modifier la photo' : 'Ajouter une photo'"
      @fermer="photoOuverte = false"
    >
      <form class="space-y-5" @submit.prevent="enregistrerPhoto">
        <ChampImage v-model="saisiePhoto.image_url" libelle="Photo" requis />

        <div>
          <label for="alt-photo" class="block text-sm font-medium text-gray-700 mb-1.5">
            Texte alternatif <span class="text-gray-400 font-normal">(facultatif)</span>
          </label>
          <input
            id="alt-photo"
            v-model.trim="altPhoto"
            type="text"
            maxlength="191"
            class="w-full border border-gray-300 rounded-lg px-4 py-2.5 focus:outline-none focus:ring-2 focus:ring-primary/40 focus:border-primary"
          />
          <p class="text-xs text-gray-500 mt-1.5">
            Décrit l'image pour les personnes qui ne la voient pas.
          </p>
        </div>

        <p v-if="erreurFormulaire" class="text-sm text-red-700" role="alert">
          {{ erreurFormulaire }}
        </p>

        <div class="flex justify-end gap-3 pt-2">
          <button
            type="button"
            class="px-4 py-2.5 text-gray-700 font-semibold"
            @click="photoOuverte = false"
          >
            Annuler
          </button>
          <button
            type="submit"
            :disabled="enregistrement"
            class="bg-primary hover:bg-primary-dark disabled:opacity-60 text-white font-semibold px-5 py-2.5 rounded-lg transition-colors"
          >
            {{ enregistrement ? 'Enregistrement…' : 'Enregistrer' }}
          </button>
        </div>
      </form>
    </Boite>

    <p
      v-if="message"
      class="fixed bottom-6 right-6 bg-gray-900 text-white px-5 py-3 rounded-lg shadow-lg"
      role="status"
    >
      {{ message }}
    </p>
  </div>
</template>

<script setup lang="ts">
import { ref, reactive, computed, onMounted } from 'vue'
import { useIdentite } from '@/tenant/identite'
import ChampImage from './ChampImage.vue'
import ListeOrdonnee from './ListeOrdonnee.vue'
import EtatSection from './EtatSection.vue'
import Boite from './Boite.vue'
import {
  recupererContenuAdmin,
  enregistrerMotDeBienvenue,
  supprimerMotDeBienvenue,
  enregistrerBiographieAmbassadeur,
  supprimerBiographieAmbassadeur,
  enregistrerBanniere,
  supprimerBanniere,
  ajouterDiapositive,
  modifierDiapositive,
  supprimerDiapositive,
  ordonnerDiapositives,
  DIAPOSITIVES_MAX,
  ajouterDirigeant,
  modifierDirigeant,
  supprimerDirigeant,
  ordonnerDirigeants,
  ajouterImageVitrine,
  modifierImageVitrine,
  supprimerImageVitrine,
  ordonnerVitrine,
  messageErreurContenu,
  CONTENU_VIDE,
  type ContenuAccueil,
  type Dirigeant,
  type ImageVitrine,
  type DiapositiveBanniere,
  type VarianteBanniere,
} from '@/api/contenu'

const contenu = ref<ContenuAccueil>({ ...CONTENU_VIDE })
const chargement = ref(true)
const erreurChargement = ref('')
const enregistrement = ref(false)
const erreurFormulaire = ref('')
const message = ref('')

const { nomDeLAmbassade } = useIdentite()

/**
 * Les deux mises en page, decrites par ce qu'elles montrent et non par leur
 * nom technique : l'editrice choisit un rendu, pas une valeur d'enumeration.
 */
const MISES_EN_PAGE = [
  {
    valeur: 'classique' as VarianteBanniere,
    libelle: 'Bannière simple',
    description: "Le visuel actuel du site, avec le titre et les boutons d'accès aux rubriques.",
  },
  {
    valeur: 'diaporama' as VarianteBanniere,
    libelle: 'Diaporama',
    description: 'Des photos plein écran qui défilent, chacune portant une citation signée.',
  },
] as const

/** Bornes du contrat, comptees en caracteres et non en octets. */
const LONGUEURS_BANNIERE = { title: 200, intro: 400, quote: 300, author: 120 } as const

const banniere = reactive({ variant: 'classique' as VarianteBanniere, title: '', intro: '' })

const diapositives = computed(() => contenu.value.hero?.slides ?? [])

/**
 * Le cas que le site traite en silence, et que l'ecran doit annoncer.
 *
 * Un diaporama sans image n'est pas un diaporama : le site retombe sur la
 * banniere simple. Le back enregistre pourtant cette combinaison sans
 * broncher, et c'est voulu — la refuser imposerait de televerser les images
 * avant de choisir la mise en page.
 */
const diaporamaSansImage = computed(
  () => banniere.variant === 'diaporama' && diapositives.value.length === 0,
)

const diapositiveOuverte = ref(false)
const diapositiveEditee = ref<DiapositiveBanniere | null>(null)
const saisieDiapositive = reactive({ image_url: '' })
const citationDiapositive = ref('')
const auteurDiapositive = ref('')
const retourAuDefautOuvert = ref(false)

const bienvenue = reactive({ title: '', body_html: '' })

const ambassadeur = reactive({ name: '', title: '', image_url: '', body_html: '' })

const dirigeantOuvert = ref(false)
const dirigeantEdite = ref<Dirigeant | null>(null)
const saisieDirigeant = reactive({ name: '', role: '', image_url: '' })
const soustitreDirigeant = ref('')

const photoOuverte = ref(false)
const photoEditee = ref<ImageVitrine | null>(null)
const saisiePhoto = reactive({ image_url: '' })
const altPhoto = ref('')

function annoncer(texte: string): void {
  message.value = texte
  setTimeout(() => (message.value = ''), 3000)
}

async function charger(): Promise<void> {
  chargement.value = true
  erreurChargement.value = ''
  try {
    contenu.value = await recupererContenuAdmin()
    banniere.variant = contenu.value.hero?.variant ?? 'classique'
    banniere.title = contenu.value.hero?.title ?? ''
    banniere.intro = contenu.value.hero?.intro ?? ''
    bienvenue.title = contenu.value.welcome?.title ?? 'Mot de bienvenue'
    bienvenue.body_html = contenu.value.welcome?.body_html ?? ''
    ambassadeur.name = contenu.value.ambassador?.name ?? ''
    ambassadeur.title = contenu.value.ambassador?.title ?? ''
    ambassadeur.image_url = contenu.value.ambassador?.image_url ?? ''
    ambassadeur.body_html = contenu.value.ambassador?.body_html ?? ''
  } catch (souleve) {
    erreurChargement.value = messageErreurContenu(souleve)
  } finally {
    chargement.value = false
  }
}

/**
 * Rejoue l'action puis recharge depuis le serveur.
 *
 * Recharger plutot que de modifier la copie locale evite que l'ecran et le
 * site public divergent : les positions sont renumerotees cote serveur, et
 * c'est sa version qui fait foi.
 */
async function agir(action: () => Promise<unknown>, succes: string): Promise<boolean> {
  enregistrement.value = true
  erreurFormulaire.value = ''
  try {
    await action()
    await charger()
    annoncer(succes)
    return true
  } catch (souleve) {
    erreurFormulaire.value = messageErreurContenu(souleve)
    return false
  } finally {
    enregistrement.value = false
  }
}

/**
 * Enregistre la mise en page et ses deux textes, sans toucher aux images.
 *
 * Les diapositives ont leurs propres routes : c'est ce qui permet de passer en
 * banniere simple sans rien perdre, et c'est toute la difference avec
 * `revenirAuDefaut`.
 */
async function enregistrerLaBanniere(): Promise<void> {
  await agir(
    () =>
      enregistrerBanniere({
        variant: banniere.variant,
        title: banniere.title === '' ? null : banniere.title,
        intro: banniere.intro === '' ? null : banniere.intro,
      }),
    'Bannière enregistrée.',
  )
}

async function revenirAuDefaut(): Promise<void> {
  const fait = await agir(
    supprimerBanniere,
    'Bannière supprimée : le site affiche le visuel par défaut.',
  )
  if (fait) retourAuDefautOuvert.value = false
}

function ouvrirDiapositive(id: number | null): void {
  erreurFormulaire.value = ''
  const existante = diapositives.value.find((d) => d.id === id) ?? null
  diapositiveEditee.value = existante
  saisieDiapositive.image_url = existante?.image_url ?? ''
  citationDiapositive.value = existante?.quote ?? ''
  auteurDiapositive.value = existante?.author ?? ''
  diapositiveOuverte.value = true
}

async function enregistrerLaDiapositive(): Promise<void> {
  if (saisieDiapositive.image_url === '') {
    erreurFormulaire.value = 'Choisissez une image.'
    return
  }
  const corps = {
    image_url: saisieDiapositive.image_url,
    quote: citationDiapositive.value === '' ? null : citationDiapositive.value,
    author: auteurDiapositive.value === '' ? null : auteurDiapositive.value,
  }
  const editee = diapositiveEditee.value
  const fait = await agir(
    () => (editee ? modifierDiapositive(editee.id, corps) : ajouterDiapositive(corps)),
    editee ? 'Image modifiée.' : 'Image ajoutée.',
  )
  if (fait) diapositiveOuverte.value = false
}

async function retirerDiapositive(id: number): Promise<void> {
  await agir(() => supprimerDiapositive(id), 'Image retirée.')
}

/** Deplace une image d'un rang, et envoie l'ordre complet au serveur. */
async function deplacerDiapositive(id: number, pas: -1 | 1): Promise<void> {
  const actuelles = diapositives.value
  const index = actuelles.findIndex((d) => d.id === id)
  const cible = index + pas
  if (index === -1 || cible < 0 || cible >= actuelles.length) return

  const ids = actuelles.map((d) => d.id)
  ;[ids[index], ids[cible]] = [ids[cible]!, ids[index]!]

  await agir(() => ordonnerDiapositives(ids), 'Ordre des images mis à jour.')
}

async function enregistrerBienvenue(): Promise<void> {
  if (bienvenue.title.trim() === '') {
    erreurFormulaire.value = 'Le titre est obligatoire.'
    return
  }
  await agir(
    () => enregistrerMotDeBienvenue({ title: bienvenue.title, body_html: bienvenue.body_html }),
    'Mot de bienvenue enregistré.',
  )
}

async function retirerBienvenue(): Promise<void> {
  await agir(supprimerMotDeBienvenue, 'Mot de bienvenue retiré du site.')
}

async function enregistrerAmbassadeur(): Promise<void> {
  if (ambassadeur.name.trim() === '' || ambassadeur.title.trim() === '') {
    erreurFormulaire.value = 'Le nom et la fonction sont obligatoires.'
    return
  }
  if (ambassadeur.body_html.trim() === '') {
    erreurFormulaire.value = 'La biographie est obligatoire.'
    return
  }
  // Le PUT remplace le bloc entier : un portrait vide est envoye `null`,
  // ce qui le retire du site.
  await agir(
    () =>
      enregistrerBiographieAmbassadeur({
        name: ambassadeur.name,
        title: ambassadeur.title,
        image_url: ambassadeur.image_url === '' ? null : ambassadeur.image_url,
        body_html: ambassadeur.body_html,
      }),
    'Biographie enregistrée.',
  )
}

async function retirerAmbassadeur(): Promise<void> {
  await agir(supprimerBiographieAmbassadeur, 'Biographie retirée du site.')
}

function ouvrirDirigeant(id: number | null): void {
  erreurFormulaire.value = ''
  const existant = contenu.value.leaders.find((d) => d.id === id) ?? null
  dirigeantEdite.value = existant
  saisieDirigeant.name = existant?.name ?? ''
  saisieDirigeant.role = existant?.role ?? ''
  saisieDirigeant.image_url = existant?.image_url ?? ''
  soustitreDirigeant.value = existant?.subtitle ?? ''
  dirigeantOuvert.value = true
}

async function enregistrerDirigeant(): Promise<void> {
  if (saisieDirigeant.image_url === '') {
    erreurFormulaire.value = 'Choisissez un portrait.'
    return
  }
  const corps = {
    name: saisieDirigeant.name,
    role: saisieDirigeant.role,
    image_url: saisieDirigeant.image_url,
    subtitle: soustitreDirigeant.value === '' ? null : soustitreDirigeant.value,
  }
  const edite = dirigeantEdite.value
  const fait = await agir(
    () => (edite ? modifierDirigeant(edite.id, corps) : ajouterDirigeant(corps)),
    edite ? 'Dirigeant modifié.' : 'Dirigeant ajouté.',
  )
  if (fait) dirigeantOuvert.value = false
}

function ouvrirPhoto(id: number | null): void {
  erreurFormulaire.value = ''
  const existante = contenu.value.showcase.find((p) => p.id === id) ?? null
  photoEditee.value = existante
  saisiePhoto.image_url = existante?.image_url ?? ''
  altPhoto.value = existante?.alt ?? ''
  photoOuverte.value = true
}

async function enregistrerPhoto(): Promise<void> {
  if (saisiePhoto.image_url === '') {
    erreurFormulaire.value = 'Choisissez une photo.'
    return
  }
  const corps = {
    image_url: saisiePhoto.image_url,
    alt: altPhoto.value === '' ? null : altPhoto.value,
  }
  const editee = photoEditee.value
  const fait = await agir(
    () => (editee ? modifierImageVitrine(editee.id, corps) : ajouterImageVitrine(corps)),
    editee ? 'Photo modifiée.' : 'Photo ajoutée.',
  )
  if (fait) photoOuverte.value = false
}

async function retirer(bloc: 'leaders' | 'showcase', id: number): Promise<void> {
  const retrait = bloc === 'leaders' ? supprimerDirigeant : supprimerImageVitrine
  await agir(() => retrait(id), 'Élément retiré.')
}

/** Déplace un élément d'un rang, et envoie l'ordre complet au serveur. */
async function deplacer(bloc: 'leaders' | 'showcase', id: number, pas: -1 | 1): Promise<void> {
  const elements = bloc === 'leaders' ? contenu.value.leaders : contenu.value.showcase
  const index = elements.findIndex((e) => e.id === id)
  const cible = index + pas
  if (index === -1 || cible < 0 || cible >= elements.length) return

  const ids = elements.map((e) => e.id)
  ;[ids[index], ids[cible]] = [ids[cible]!, ids[index]!]

  const reordonner = bloc === 'leaders' ? ordonnerDirigeants : ordonnerVitrine
  await agir(() => reordonner(ids), 'Ordre mis à jour.')
}

onMounted(charger)
</script>
