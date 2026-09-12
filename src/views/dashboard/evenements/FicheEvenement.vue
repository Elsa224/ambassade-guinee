<script setup lang="ts">
import { ref, computed, onMounted } from 'vue'
import { useRoute } from 'vue-router'
import {
  recupererEvenementAdmin,
  annulerEvenement,
  basculerPublication,
  type EvenementAdmin,
} from '@/api/evenements-admin'
import { messageErreur } from '@/api/evenements'
import { dateLisible, etatDe, remplissage } from './presentation'
import PastilleEtat from './PastilleEtat.vue'

/**
 * Fiche d'un evenement.
 *
 * C'est ici, et seulement ici, que les inscrits sont nommes. La liste n'en
 * affiche que le nombre : le nom, le courriel et l'identifiant sont des
 * donnees personnelles, et les deverser dans un tableau qu'on traverse pour
 * tout autre motif les expose sans qu'on l'ait voulu. Les ouvrir depuis la
 * fiche est un geste delibere.
 *
 * Le logo n'est volontairement pas affiche : `logoUrl` est une route locale
 * qui exige le jeton porteur, qu'un `<img src>` n'envoie pas. L'image
 * reviendrait en 401 et se rendrait en icone cassee.
 */
const route = useRoute()

const evenement = ref<EvenementAdmin | null>(null)
const chargement = ref(true)
const erreur = ref('')
const filtre = ref('')

const slug = computed(() => String(route.params.slug ?? ''))

/**
 * Inscrits retenus par le filtre.
 *
 * Le filtre porte sur les trois champs : un agent cherche tantot un nom,
 * tantot le courriel qu'il a sous les yeux dans un courrier, tantot
 * l'identifiant qu'on lui a dicte.
 */
const inscrits = computed(() => {
  const liste = evenement.value?.participants ?? []
  const terme = filtre.value.trim().toLocaleLowerCase('fr')
  if (terme === '') return liste
  return liste.filter((participant) =>
    [participant.fullName, participant.email, participant.uidn].some((champ) =>
      champ.toLocaleLowerCase('fr').includes(terme),
    ),
  )
})

/**
 * Vrai quand le back sert la publication.
 *
 * Meme raison que dans la liste : `isPublished` vient du CMS et non
 * d'Ambassade Secure. Absent, la mention disparait plutot que d'annoncer
 * « non publie » a tort.
 */
const publicationConnue = computed(() => evenement.value?.isPublished !== undefined)

async function charger() {
  chargement.value = true
  erreur.value = ''
  try {
    evenement.value = await recupererEvenementAdmin(slug.value)
  } catch (souleve) {
    erreur.value = messageErreur(souleve)
    evenement.value = null
  } finally {
    chargement.value = false
  }
}

/**
 * Une action est en cours.
 *
 * Un seul verrou pour les deux boutons : annuler et publier touchent le meme
 * evenement, et les laisser partir ensemble ferait arriver deux reponses dont
 * la derniere ecraserait la premiere.
 */
const action = ref(false)
const erreurAction = ref('')

async function agir(operation: () => Promise<EvenementAdmin>) {
  action.value = true
  erreurAction.value = ''
  try {
    evenement.value = await operation()
  } catch (souleve) {
    erreurAction.value = messageErreur(souleve)
  } finally {
    action.value = false
  }
}

/**
 * Annule l'evenement.
 *
 * Confirmation demandee : l'annulation est visible des inscrits et du site
 * public, et rien dans l'ecran ne permet de revenir en arriere d'un clic.
 */
function annuler() {
  if (!evenement.value) return
  const nom = evenement.value.name
  if (!window.confirm(`Annuler « ${nom} » ? Les inscrits pourront en être informés.`)) return
  void agir(() => annulerEvenement(slug.value))
}

function basculerSurLeSite() {
  if (!evenement.value) return
  const publie = evenement.value.isPublished === true
  void agir(() => basculerPublication(slug.value, !publie))
}

/** Un evenement deja annule ou termine ne s'annule pas une seconde fois. */
const annulable = computed(() => evenement.value?.status === 'ACTIVE')

onMounted(charger)
</script>

<template>
  <div class="flex flex-col h-[calc(100vh-var(--hauteur-barre)-3rem)]">
    <RouterLink
      :to="{ name: 'evenements-admin' }"
      class="self-start text-sm text-gray-500 hover:text-primary mb-4"
    >
      &larr; Tous les évènements
    </RouterLink>

    <p v-if="chargement" class="text-gray-500">Chargement de l'évènement…</p>

    <p
      v-else-if="erreur"
      class="bg-red-50 border border-red-200 text-red-800 rounded-xl px-4 py-3"
      role="alert"
    >
      {{ erreur }}
      <button type="button" class="ml-2 font-medium underline" @click="charger()">Réessayer</button>
    </p>

    <template v-else-if="evenement">
      <header class="mb-6 flex flex-wrap items-start justify-between gap-4">
        <div>
          <h2 class="text-2xl font-bold text-gray-800">{{ evenement.name }}</h2>
          <div class="flex flex-wrap items-center gap-1.5 mt-2">
            <PastilleEtat :libelle="etatDe(evenement).libelle" :ton="etatDe(evenement).ton" />
            <PastilleEtat
              v-if="evenement.registrationOpen"
              libelle="Inscriptions ouvertes"
              ton="neutre"
            />
            <PastilleEtat
              v-if="publicationConnue"
              :libelle="evenement.isPublished ? 'Publié sur le site' : 'Non publié'"
              :ton="evenement.isPublished ? 'positif' : 'eteint'"
            />
            <span v-if="evenement.typeLabel" class="text-sm text-gray-500">
              {{ evenement.typeLabel }}
            </span>
          </div>
        </div>

        <div class="flex items-center gap-2">
          <RouterLink
            :to="{ name: 'evenement-admin-modifier', params: { slug } }"
            class="bg-primary text-white font-medium px-4 py-2 rounded-lg hover:opacity-90"
          >
            Modifier
          </RouterLink>
          <!-- La bascule ne s'affiche que si le back sert la publication :
               proposer « Publier » a un back qui ne sait pas la stocker
               promettrait une action sans effet. -->
          <button
            v-if="publicationConnue"
            type="button"
            :disabled="action"
            class="border border-gray-300 text-gray-700 font-medium px-4 py-2 rounded-lg disabled:opacity-60"
            @click="basculerSurLeSite"
          >
            {{ evenement.isPublished ? 'Retirer du site' : 'Publier sur le site' }}
          </button>
          <button
            v-if="annulable"
            type="button"
            :disabled="action"
            class="border border-red-200 text-red-700 font-medium px-4 py-2 rounded-lg disabled:opacity-60"
            @click="annuler"
          >
            Annuler l'évènement
          </button>
        </div>
      </header>

      <p
        v-if="erreurAction"
        class="bg-red-50 border border-red-200 text-red-800 rounded-xl px-4 py-3 mb-4"
        role="alert"
      >
        {{ erreurAction }}
      </p>

      <!-- `content-start` n'est pas cosmetique : la grille occupe la hauteur
           restante, et `align-content` vaut `stretch` par defaut. Sans lui,
           les rangees se partagent l'espace libre et un vide s'ouvre entre le
           detail et la liste des inscrits. -->
      <div
        class="min-h-0 flex-1 overflow-auto grid gap-6 lg:grid-cols-3 items-start content-start pb-2"
      >
        <!-- Le detail de l'evenement -->
        <section class="bg-white shadow-sm rounded-xl p-5 lg:col-span-2">
          <h3 class="text-sm font-semibold uppercase tracking-wide text-gray-500">Détail</h3>

          <dl class="mt-4 grid gap-4 sm:grid-cols-2">
            <div>
              <dt class="text-xs text-gray-500">Date</dt>
              <dd class="text-gray-800 tabular-nums">
                {{ dateLisible(evenement.date) }} à {{ evenement.time }}
              </dd>
            </div>
            <div>
              <dt class="text-xs text-gray-500">Lieu</dt>
              <dd class="text-gray-800">{{ evenement.location }}</dd>
            </div>
            <div>
              <dt class="text-xs text-gray-500">Clôture des inscriptions</dt>
              <dd class="text-gray-800 tabular-nums">
                {{
                  evenement.registrationDeadline
                    ? dateLisible(evenement.registrationDeadline)
                    : 'Non définie'
                }}
              </dd>
            </div>
            <div>
              <dt class="text-xs text-gray-500">Créé le</dt>
              <dd class="text-gray-800 tabular-nums">{{ dateLisible(evenement.createdAt) }}</dd>
            </div>
          </dl>

          <div v-if="evenement.description" class="mt-5 pt-5 border-t border-gray-100">
            <h4 class="text-xs text-gray-500">Description</h4>
            <!-- `whitespace-pre-line` respecte les retours a la ligne saisis
                 dans Ambassade Secure. Le texte n'est PAS du HTML : il est
                 interpole, jamais injecte. -->
            <p class="text-gray-700 mt-1 whitespace-pre-line">{{ evenement.description }}</p>
          </div>
        </section>

        <!-- L'etat des inscriptions -->
        <section class="bg-white shadow-sm rounded-xl p-5">
          <h3 class="text-sm font-semibold uppercase tracking-wide text-gray-500">Inscriptions</h3>

          <p class="mt-3 text-3xl font-bold text-gray-800 tabular-nums">
            {{ evenement.registeredCount
            }}<span v-if="evenement.capacity" class="text-lg font-medium text-gray-400">
              / {{ evenement.capacity }}</span
            >
          </p>

          <div
            v-if="evenement.capacity"
            class="mt-3 h-2 rounded-full bg-gray-100 overflow-hidden"
            aria-hidden="true"
          >
            <div
              class="h-full rounded-full"
              :class="remplissage(evenement) >= 100 ? 'bg-amber-500' : 'bg-primary'"
              :style="{ width: `${remplissage(evenement)}%` }"
            ></div>
          </div>

          <p class="text-sm text-gray-500 mt-2">
            <template v-if="evenement.spotsRemaining !== null">
              {{ evenement.spotsRemaining }} place{{
                evenement.spotsRemaining > 1 ? 's' : ''
              }}
              restante{{ evenement.spotsRemaining > 1 ? 's' : '' }}
            </template>
            <template v-else>Capacité non limitée</template>
          </p>
        </section>

        <!-- Les inscrits : des donnees personnelles, nommees seulement ici -->
        <section class="bg-white shadow-sm rounded-xl lg:col-span-3 overflow-hidden">
          <div class="flex flex-wrap items-center justify-between gap-3 px-5 py-4">
            <div>
              <h3 class="text-sm font-semibold uppercase tracking-wide text-gray-500">Inscrits</h3>
              <p class="text-xs text-gray-500 mt-0.5">
                Données personnelles : à ne pas diffuser hors de l'ambassade.
              </p>
            </div>
            <label v-if="evenement.participants.length > 0" class="text-sm">
              <span class="sr-only">Rechercher un inscrit</span>
              <input
                v-model="filtre"
                type="search"
                placeholder="Nom, courriel ou identifiant"
                class="w-64 max-w-full rounded-lg border border-gray-200 px-3 py-1.5 focus:outline-2 focus:outline-offset-2 focus:outline-primary"
              />
            </label>
          </div>

          <p v-if="evenement.participants.length === 0" class="px-5 pb-8 text-gray-500">
            Personne ne s'est encore inscrit.
          </p>

          <p v-else-if="inscrits.length === 0" class="px-5 pb-8 text-gray-500">
            Aucun inscrit ne correspond à « {{ filtre }} ».
          </p>

          <table v-else class="w-full text-left">
            <thead>
              <tr class="bg-gray-50">
                <th
                  class="border-y border-gray-200 px-5 py-3 text-xs font-semibold uppercase tracking-wide text-gray-500"
                  scope="col"
                >
                  Nom
                </th>
                <th
                  class="border-y border-gray-200 px-5 py-3 text-xs font-semibold uppercase tracking-wide text-gray-500"
                  scope="col"
                >
                  Courriel
                </th>
                <th
                  class="border-y border-gray-200 px-5 py-3 text-xs font-semibold uppercase tracking-wide text-gray-500"
                  scope="col"
                >
                  Identifiant
                </th>
              </tr>
            </thead>
            <tbody>
              <tr
                v-for="participant in inscrits"
                :key="participant.uidn"
                class="border-b border-gray-100 last:border-0"
              >
                <td class="px-5 py-3 text-gray-800">{{ participant.fullName }}</td>
                <td class="px-5 py-3 text-gray-600">
                  <a
                    :href="`mailto:${participant.email}`"
                    class="hover:text-primary hover:underline"
                  >
                    {{ participant.email }}
                  </a>
                </td>
                <td class="px-5 py-3 text-gray-500 tabular-nums">{{ participant.uidn }}</td>
              </tr>
            </tbody>
          </table>
        </section>
      </div>
    </template>
  </div>
</template>
