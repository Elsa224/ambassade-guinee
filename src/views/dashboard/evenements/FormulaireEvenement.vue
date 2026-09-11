<script setup lang="ts">
import { ref, computed, onMounted } from 'vue'
import { useRoute, useRouter, onBeforeRouteLeave } from 'vue-router'
import {
  recupererEvenementAdmin,
  listerTypesEvenement,
  creerEvenement,
  modifierEvenement,
  erreursDeChamp,
  type BrouillonEvenement,
  type TypeEvenement,
} from '@/api/evenements-admin'
import { messageErreur } from '@/api/evenements'

/**
 * Creation et modification d'un evenement.
 *
 * Un seul composant pour les deux, parce que ce sont les memes champs avec la
 * meme validation : deux formulaires jumeaux divergeraient des le premier
 * champ ajoute, et l'un des deux oublierait une regle que l'autre applique.
 * La presence d'un `slug` dans l'adresse distingue les deux modes.
 *
 * Ce que le formulaire NE propose pas, volontairement :
 *
 *  - le logo, tant qu'il n'est pas tranche ou il atterrit. `logoUrl` est
 *    reecrit par le CMS vers une route qui exige le jeton porteur ; proposer
 *    un televersement sans savoir cela reviendrait a promettre une image qui
 *    ne s'affichera pas.
 *  - la suppression. Un evenement auquel des gens se sont inscrits porte leurs
 *    inscriptions. Le geste juste est l'annulation, qui garde la trace.
 */
const route = useRoute()
const routeur = useRouter()

const slug = computed(() => {
  const valeur = route.params.slug
  return typeof valeur === 'string' && valeur !== '' ? valeur : null
})
const modification = computed(() => slug.value !== null)

function brouillonVide(): BrouillonEvenement {
  return {
    name: '',
    date: '',
    time: '',
    location: '',
    description: '',
    capacity: null,
    registrationOpen: true,
    registrationDeadline: null,
    typeEventSlug: null,
  }
}

const brouillon = ref<BrouillonEvenement>(brouillonVide())

/**
 * Etat du formulaire au chargement, pour savoir s'il a ete touche.
 *
 * Compare en JSON : les champs sont tous des valeurs simples, et une
 * comparaison champ a champ oublierait le prochain champ ajoute.
 */
const initial = ref(JSON.stringify(brouillonVide()))
const modifie = computed(() => JSON.stringify(brouillon.value) !== initial.value)

/**
 * « Sans limite » est un etat a part entiere, pas un champ vide.
 *
 * `capacity: null` dit « autant d'inscrits qu'il s'en presentera » ; un champ
 * numerique laisse vide ne sait pas dire cela sans qu'on le confonde avec un
 * oubli de saisie. La case le rend explicite, et vide le nombre quand on la
 * coche pour qu'aucune ancienne valeur ne reparte au serveur.
 */
const sansLimite = ref(true)
function basculerLimite() {
  brouillon.value.capacity = sansLimite.value ? null : 1
}

const types = ref<TypeEvenement[]>([])
const chargement = ref(false)
const envoi = ref(false)
const erreur = ref('')
const erreursChamps = ref<Record<string, string>>({})

/**
 * Vrai quand le back sert des types.
 *
 * Meme discipline que la colonne de publication dans la liste : une route
 * absente ou une liste vide retire le champ, plutot que d'afficher un menu
 * deroulant vide dans lequel l'agent cherchera ce qui n'y est pas.
 */
const typesConnus = computed(() => types.value.length > 0)

/**
 * Cloture posterieure a l'evenement.
 *
 * Averti sans bloquer : le serveur reste l'autorite, et une cloture le jour
 * meme est parfois voulue. Mais une cloture APRES la date est presque toujours
 * une faute de frappe dans l'annee.
 */
const clotureApresEvenement = computed(() => {
  const cloture = brouillon.value.registrationDeadline
  const date = brouillon.value.date
  return cloture !== null && cloture !== '' && date !== '' && cloture > date
})

async function chargerTypes() {
  try {
    types.value = await listerTypesEvenement()
  } catch {
    // Le champ « Type » se retire : c'est la seule consequence, et elle
    // n'empeche pas de creer un evenement.
    types.value = []
  }
}

async function chargerEvenement() {
  if (slug.value === null) return
  chargement.value = true
  erreur.value = ''
  try {
    const evenement = await recupererEvenementAdmin(slug.value)
    brouillon.value = {
      name: evenement.name,
      date: evenement.date.slice(0, 10),
      time: evenement.time,
      location: evenement.location,
      description: evenement.description,
      capacity: evenement.capacity,
      registrationOpen: evenement.registrationOpen,
      registrationDeadline: evenement.registrationDeadline,
      // La lecture rend `typeLabel`, jamais le slug : on ne peut pas
      // pre-selectionner le type sans une correspondance par libelle, faite
      // ici plutot que devinee cote serveur.
      typeEventSlug: types.value.find((t) => t.label === evenement.typeLabel)?.slug ?? null,
    }
    sansLimite.value = evenement.capacity === null
    initial.value = JSON.stringify(brouillon.value)
  } catch (souleve) {
    erreur.value = messageErreur(souleve)
  } finally {
    chargement.value = false
  }
}

async function enregistrer() {
  envoi.value = true
  erreur.value = ''
  erreursChamps.value = {}
  try {
    const enregistre = modification.value
      ? await modifierEvenement(slug.value!, brouillon.value)
      : await creerEvenement(brouillon.value)
    // Le slug vient toujours du back, jamais d'un calcul local : lui seul sait
    // ce qu'il a retenu en cas d'homonyme.
    initial.value = JSON.stringify(brouillon.value)
    routeur.push({ name: 'evenement-admin', params: { slug: enregistre.slug } })
  } catch (souleve) {
    erreur.value = messageErreur(souleve)
    erreursChamps.value = erreursDeChamp(souleve)
  } finally {
    envoi.value = false
  }
}

onBeforeRouteLeave(() => {
  if (!modifie.value) return true
  return window.confirm('Les modifications non enregistrées seront perdues. Quitter quand même ?')
})

onMounted(async () => {
  // Les types d'abord : la correspondance du type de l'evenement charge en
  // depend.
  await chargerTypes()
  await chargerEvenement()
})
</script>

<template>
  <div class="flex flex-col h-[calc(100vh-var(--hauteur-barre)-3rem)]">
    <RouterLink
      :to="
        modification ? { name: 'evenement-admin', params: { slug } } : { name: 'evenements-admin' }
      "
      class="self-start text-sm text-gray-500 hover:text-primary mb-4"
    >
      &larr; {{ modification ? "Retour à l'évènement" : 'Tous les évènements' }}
    </RouterLink>

    <header class="mb-6">
      <h2 class="text-2xl font-bold text-gray-800">
        {{ modification ? 'Modifier l’évènement' : 'Nouvel évènement' }}
      </h2>
      <p class="text-gray-600 mt-1">
        Les évènements sont gérés dans Ambassade Secure et relayés par le site de l'ambassade.
      </p>
    </header>

    <p
      v-if="erreur"
      class="bg-red-50 border border-red-200 text-red-800 rounded-xl px-4 py-3 mb-4"
      role="alert"
    >
      {{ erreur }}
    </p>

    <p v-if="chargement" class="text-gray-500">Chargement de l'évènement…</p>

    <form v-else class="min-h-0 flex-1 overflow-auto pb-2" novalidate @submit.prevent="enregistrer">
      <div class="bg-white shadow-sm rounded-xl p-6 grid gap-5 sm:grid-cols-2 items-start">
        <div class="sm:col-span-2">
          <label class="block text-sm font-medium text-gray-700 mb-1" for="champ-nom">
            Nom de l'évènement <span class="text-red-600">*</span>
          </label>
          <input
            id="champ-nom"
            v-model="brouillon.name"
            type="text"
            required
            class="w-full rounded-lg border border-gray-300 px-3 py-2 focus:outline-2 focus:outline-primary"
          />
          <p v-if="erreursChamps.name" class="text-sm text-red-700 mt-1">
            {{ erreursChamps.name }}
          </p>
        </div>

        <div>
          <label class="block text-sm font-medium text-gray-700 mb-1" for="champ-date">
            Date <span class="text-red-600">*</span>
          </label>
          <input
            id="champ-date"
            v-model="brouillon.date"
            type="date"
            required
            class="w-full rounded-lg border border-gray-300 px-3 py-2 focus:outline-2 focus:outline-primary"
          />
          <p v-if="erreursChamps.date" class="text-sm text-red-700 mt-1">
            {{ erreursChamps.date }}
          </p>
        </div>

        <div>
          <label class="block text-sm font-medium text-gray-700 mb-1" for="champ-heure">
            Heure <span class="text-red-600">*</span>
          </label>
          <input
            id="champ-heure"
            v-model="brouillon.time"
            type="time"
            required
            class="w-full rounded-lg border border-gray-300 px-3 py-2 focus:outline-2 focus:outline-primary"
          />
          <p v-if="erreursChamps.time" class="text-sm text-red-700 mt-1">
            {{ erreursChamps.time }}
          </p>
        </div>

        <div class="sm:col-span-2">
          <label class="block text-sm font-medium text-gray-700 mb-1" for="champ-lieu">
            Lieu <span class="text-red-600">*</span>
          </label>
          <input
            id="champ-lieu"
            v-model="brouillon.location"
            type="text"
            required
            class="w-full rounded-lg border border-gray-300 px-3 py-2 focus:outline-2 focus:outline-primary"
          />
          <p v-if="erreursChamps.location" class="text-sm text-red-700 mt-1">
            {{ erreursChamps.location }}
          </p>
        </div>

        <div v-if="typesConnus" class="sm:col-span-2">
          <label class="block text-sm font-medium text-gray-700 mb-1" for="champ-type">Type</label>
          <select
            id="champ-type"
            v-model="brouillon.typeEventSlug"
            class="w-full rounded-lg border border-gray-300 px-3 py-2 focus:outline-2 focus:outline-primary"
          >
            <option :value="null">Sans type</option>
            <option v-for="type in types" :key="type.slug" :value="type.slug">
              {{ type.label }}
            </option>
          </select>
        </div>

        <div class="sm:col-span-2">
          <label class="block text-sm font-medium text-gray-700 mb-1" for="champ-description">
            Description
          </label>
          <textarea
            id="champ-description"
            v-model="brouillon.description"
            rows="4"
            class="w-full rounded-lg border border-gray-300 px-3 py-2 focus:outline-2 focus:outline-primary"
          ></textarea>
        </div>
      </div>

      <div class="bg-white shadow-sm rounded-xl p-6 mt-6 grid gap-5 sm:grid-cols-2 items-start">
        <h3 class="sm:col-span-2 font-semibold text-gray-800">Inscriptions</h3>

        <div class="sm:col-span-2 flex items-center gap-2">
          <input
            id="champ-ouvertes"
            v-model="brouillon.registrationOpen"
            type="checkbox"
            class="h-4 w-4 rounded border-gray-300"
          />
          <label class="text-sm text-gray-700" for="champ-ouvertes">
            Les inscriptions sont ouvertes
          </label>
        </div>

        <div>
          <label class="block text-sm font-medium text-gray-700 mb-1" for="champ-capacite">
            Capacité
          </label>
          <div class="flex items-center gap-2">
            <input
              id="champ-sans-limite"
              v-model="sansLimite"
              type="checkbox"
              class="h-4 w-4 rounded border-gray-300"
              @change="basculerLimite"
            />
            <label class="text-sm text-gray-700" for="champ-sans-limite">Sans limite</label>
          </div>
          <input
            v-if="!sansLimite"
            id="champ-capacite"
            v-model.number="brouillon.capacity"
            type="number"
            min="1"
            step="1"
            class="mt-2 w-full rounded-lg border border-gray-300 px-3 py-2 focus:outline-2 focus:outline-primary"
          />
          <p v-if="erreursChamps.capacity" class="text-sm text-red-700 mt-1">
            {{ erreursChamps.capacity }}
          </p>
        </div>

        <div>
          <label class="block text-sm font-medium text-gray-700 mb-1" for="champ-cloture">
            Clôture des inscriptions
          </label>
          <input
            id="champ-cloture"
            v-model="brouillon.registrationDeadline"
            type="date"
            class="w-full rounded-lg border border-gray-300 px-3 py-2 focus:outline-2 focus:outline-primary"
          />
          <p v-if="clotureApresEvenement" class="text-sm text-amber-700 mt-1">
            La clôture tombe après l'évènement.
          </p>
          <p v-if="erreursChamps.registrationDeadline" class="text-sm text-red-700 mt-1">
            {{ erreursChamps.registrationDeadline }}
          </p>
        </div>
      </div>

      <div class="flex items-center gap-3 mt-6">
        <button
          type="submit"
          :disabled="envoi"
          class="bg-primary text-white font-medium px-5 py-2.5 rounded-lg disabled:opacity-60"
        >
          {{ envoi ? 'Enregistrement…' : modification ? 'Enregistrer' : "Créer l'évènement" }}
        </button>
        <RouterLink
          :to="
            modification
              ? { name: 'evenement-admin', params: { slug } }
              : { name: 'evenements-admin' }
          "
          class="text-gray-600 hover:text-gray-800 px-3 py-2.5"
        >
          Annuler
        </RouterLink>
      </div>
    </form>
  </div>
</template>
