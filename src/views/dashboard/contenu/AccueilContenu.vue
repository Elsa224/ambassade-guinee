<template>
  <div class="p-6 bg-gray-100 min-h-screen">
    <header class="mb-6">
      <h2 class="text-2xl font-bold text-gray-800">Contenu de l'accueil</h2>
      <p class="text-gray-600 mt-1">
        Le mot de bienvenue, les dirigeants et les photos de la page d'accueil.
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
import { ref, reactive, onMounted } from 'vue'
import ChampImage from './ChampImage.vue'
import ListeOrdonnee from './ListeOrdonnee.vue'
import EtatSection from './EtatSection.vue'
import Boite from './Boite.vue'
import {
  recupererContenuAdmin,
  enregistrerMotDeBienvenue,
  supprimerMotDeBienvenue,
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
} from '@/api/contenu'

const contenu = ref<ContenuAccueil>({ ...CONTENU_VIDE })
const chargement = ref(true)
const erreurChargement = ref('')
const enregistrement = ref(false)
const erreurFormulaire = ref('')
const message = ref('')

const bienvenue = reactive({ title: '', body_html: '' })

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
    bienvenue.title = contenu.value.welcome?.title ?? 'Mot de bienvenue'
    bienvenue.body_html = contenu.value.welcome?.body_html ?? ''
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
