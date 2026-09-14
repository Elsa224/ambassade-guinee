<script setup lang="ts">
import { ref, computed, onMounted } from 'vue'
import { useRoute } from 'vue-router'
import {
  recupererEvenementAdmin,
  ajouterInvites,
  erreursDeChamp,
  INVITES_MAX,
  type LotInvites,
} from '@/api/evenements-admin'
import { messageErreur } from '@/api/evenements'

/**
 * Ajout d'invites a un evenement.
 *
 * L'inscription publique passe par le QR ; ici l'ambassade inscrit
 * elle-meme des invites qui ne passeront pas par le formulaire — un corps
 * diplomatique, une delegation. Le back rend un pass par invite, avec un QR
 * PNG chacun, a imprimer ou a transmettre.
 *
 * Cote SecureCheck le lot est tout ou rien : soit tous les pass sont crees,
 * soit aucun. Le formulaire reste donc affiche tel quel apres un refus, pour
 * corriger et renvoyer le meme lot.
 */
const route = useRoute()
const slug = computed(() => String(route.params.slug ?? ''))

const nomEvenement = ref('')

interface LigneInvite {
  firstName: string
  lastName: string
  email: string
}

const ligneVide = (): LigneInvite => ({ firstName: '', lastName: '', email: '' })

const lignes = ref<LigneInvite[]>([ligneVide()])
const envoi = ref(false)
const erreurBandeau = ref('')
/** Indexees comme le back les indexe : `guests.2.lastName`. */
const erreursLignes = ref<Record<string, string>>({})
const resultat = ref<LotInvites | null>(null)

function ajouterLigne() {
  if (lignes.value.length >= INVITES_MAX) return
  lignes.value.push(ligneVide())
}

function retirerLigne(rang: number) {
  if (lignes.value.length <= 1) return
  lignes.value.splice(rang, 1)
  // Les erreurs sont indexees par rang : apres un retrait elles pointeraient
  // sur la mauvaise ligne. Le lot repartira de toute facon entier.
  erreursLignes.value = {}
}

/**
 * Valide localement ce que le back refusera a coup sur.
 *
 * Les rangs valides ici sont ceux du tableau ENVOYE : aucune ligne n'est
 * filtree avant l'envoi, sans quoi les erreurs `guests.N.*` du back ne
 * retomberaient plus sur la ligne affichee.
 */
function validerLocalement(): boolean {
  const trouvees: Record<string, string> = {}
  lignes.value.forEach((ligne, rang) => {
    if (ligne.firstName.trim() === '') {
      trouvees[`guests.${rang}.firstName`] = 'Ce champ est obligatoire.'
    }
    if (ligne.lastName.trim() === '') {
      trouvees[`guests.${rang}.lastName`] = 'Ce champ est obligatoire.'
    }
  })
  erreursLignes.value = trouvees
  return Object.keys(trouvees).length === 0
}

async function envoyer() {
  erreurBandeau.value = ''
  if (!validerLocalement()) return
  envoi.value = true
  try {
    const invites = lignes.value.map((ligne) => {
      const courriel = ligne.email.trim()
      return {
        firstName: ligne.firstName.trim(),
        lastName: ligne.lastName.trim(),
        // `email` facultatif : on l'omet plutot que d'envoyer une chaine
        // vide, que le back refuserait comme courriel invalide.
        ...(courriel === '' ? {} : { email: courriel }),
      }
    })
    resultat.value = await ajouterInvites(slug.value, invites)
    lignes.value = [ligneVide()]
    erreursLignes.value = {}
  } catch (souleve) {
    const parChamp = erreursDeChamp(souleve)
    if (Object.keys(parChamp).length > 0) {
      erreursLignes.value = parChamp
    } else {
      // Refus amont (SecureCheck, evenement annule) ou panne : un message
      // seul, en bandeau. Le lot est tout ou rien, rien n'a ete cree.
      erreurBandeau.value = messageErreur(souleve)
    }
  } finally {
    envoi.value = false
  }
}

function recommencer() {
  resultat.value = null
}

/**
 * Ouvre une page des pass et lance l'impression, un pass par page.
 *
 * Document construit par le DOM, jamais par concatenation : les noms
 * reviennent d'Ambassade Secure et ne doivent pas etre interpretes comme du
 * HTML. L'impression part quand toutes les images sont chargees.
 */
function imprimerPasses() {
  const lot = resultat.value
  if (!lot || lot.passes.length === 0) return
  const fenetre = window.open('', '_blank', 'width=640,height=800')
  if (!fenetre) return
  const doc = fenetre.document
  doc.title = "Pass d'invitation"
  const style = doc.createElement('style')
  style.textContent =
    'body{font-family:sans-serif;text-align:center;margin:0}' +
    'section{padding:3rem;page-break-after:always}' +
    'img{width:60%;max-width:360px}h1{font-size:1.4rem}p{color:#444}'
  doc.head.appendChild(style)
  let restantes = lot.passes.length
  for (const pass of lot.passes) {
    const bloc = doc.createElement('section')
    const titre = doc.createElement('h1')
    titre.textContent = pass.credential.holderName
    const sousTitre = doc.createElement('p')
    sousTitre.textContent = `${nomEvenement.value || "Pass d'invitation"} — ${pass.credential.uidn}`
    const image = doc.createElement('img')
    image.alt = `QR du pass de ${pass.credential.holderName}`
    image.addEventListener('load', () => {
      restantes -= 1
      if (restantes === 0) {
        fenetre.focus()
        fenetre.print()
      }
    })
    image.src = pass.qr
    bloc.append(titre, sousTitre, image)
    doc.body.appendChild(bloc)
  }
}

onMounted(() => {
  // Le nom sert le titre et les pass imprimes ; son echec reste silencieux,
  // l'envoi du lot porte deja sa propre erreur si l'evenement n'existe pas.
  recupererEvenementAdmin(slug.value)
    .then((evenement) => (nomEvenement.value = evenement.name))
    .catch(() => {})
})
</script>

<template>
  <div class="flex flex-col h-[calc(100vh-var(--hauteur-barre)-3rem)]">
    <RouterLink
      :to="{ name: 'evenement-admin', params: { slug } }"
      class="self-start text-sm text-gray-500 hover:text-primary mb-4"
    >
      &larr; Fiche de l'évènement
    </RouterLink>

    <header class="mb-6">
      <h2 class="text-2xl font-bold text-gray-800">Ajouter des invités</h2>
      <p v-if="nomEvenement" class="text-gray-500 mt-1">{{ nomEvenement }}</p>
      <p class="text-sm text-gray-500 mt-1">
        Chaque invité reçoit un pass avec son propre QR, sans passer par le formulaire public.
      </p>
    </header>

    <!-- Les pass crees -->
    <template v-if="resultat">
      <p class="bg-green-50 border border-green-200 text-green-800 rounded-xl px-4 py-3 mb-4">
        {{ resultat.passes.length }} pass créé{{ resultat.passes.length > 1 ? 's' : '' }}.
        L'évènement compte désormais {{ resultat.event.registeredCount }} inscrit{{
          resultat.event.registeredCount > 1 ? 's' : ''
        }}.
      </p>

      <div class="mb-4 flex items-center gap-2">
        <button
          type="button"
          class="bg-primary text-white font-medium px-4 py-2 rounded-lg hover:opacity-90"
          @click="imprimerPasses"
        >
          Imprimer les pass
        </button>
        <button
          type="button"
          class="border border-gray-300 text-gray-700 font-medium px-4 py-2 rounded-lg"
          @click="recommencer"
        >
          Ajouter d'autres invités
        </button>
      </div>

      <div class="min-h-0 flex-1 overflow-auto grid gap-4 sm:grid-cols-2 lg:grid-cols-3 pb-2">
        <div
          v-for="pass in resultat.passes"
          :key="pass.credential.uidn"
          class="bg-white shadow-sm rounded-xl p-4 flex items-start gap-4"
        >
          <img
            :src="pass.qr"
            :alt="`QR du pass de ${pass.credential.holderName}`"
            class="w-24 h-24 border border-gray-200 rounded-lg p-1 bg-white shrink-0"
          />
          <div class="min-w-0">
            <p class="font-medium text-gray-800 truncate">{{ pass.credential.holderName }}</p>
            <p class="text-sm text-gray-600 truncate">
              {{ pass.credential.holderEmail ?? '—' }}
            </p>
            <p class="text-xs text-gray-500 tabular-nums mt-1">{{ pass.credential.uidn }}</p>
          </div>
        </div>
      </div>
    </template>

    <!-- Le formulaire du lot -->
    <form v-else class="min-h-0 flex-1 flex flex-col" @submit.prevent="envoyer">
      <p
        v-if="erreurBandeau"
        class="bg-red-50 border border-red-200 text-red-800 rounded-xl px-4 py-3 mb-4"
        role="alert"
      >
        {{ erreurBandeau }}
      </p>

      <div class="min-h-0 flex-1 overflow-auto space-y-3 pb-2">
        <fieldset
          v-for="(ligne, rang) in lignes"
          :key="rang"
          class="bg-white shadow-sm rounded-xl p-4"
        >
          <legend class="sr-only">Invité {{ rang + 1 }}</legend>
          <div class="grid gap-3 sm:grid-cols-[1fr_1fr_1.2fr_auto] items-start">
            <label class="text-sm">
              <span class="text-xs text-gray-500">Prénom</span>
              <input
                v-model="ligne.firstName"
                type="text"
                maxlength="191"
                class="mt-1 w-full rounded-lg border border-gray-200 px-3 py-1.5 focus:outline-2 focus:outline-offset-2 focus:outline-primary"
              />
              <span
                v-if="erreursLignes[`guests.${rang}.firstName`]"
                class="block mt-1 text-xs text-red-700"
                role="alert"
              >
                {{ erreursLignes[`guests.${rang}.firstName`] }}
              </span>
            </label>
            <label class="text-sm">
              <span class="text-xs text-gray-500">Nom</span>
              <input
                v-model="ligne.lastName"
                type="text"
                maxlength="191"
                class="mt-1 w-full rounded-lg border border-gray-200 px-3 py-1.5 focus:outline-2 focus:outline-offset-2 focus:outline-primary"
              />
              <span
                v-if="erreursLignes[`guests.${rang}.lastName`]"
                class="block mt-1 text-xs text-red-700"
                role="alert"
              >
                {{ erreursLignes[`guests.${rang}.lastName`] }}
              </span>
            </label>
            <label class="text-sm">
              <span class="text-xs text-gray-500">Courriel (facultatif)</span>
              <input
                v-model="ligne.email"
                type="email"
                maxlength="255"
                class="mt-1 w-full rounded-lg border border-gray-200 px-3 py-1.5 focus:outline-2 focus:outline-offset-2 focus:outline-primary"
              />
              <span
                v-if="erreursLignes[`guests.${rang}.email`]"
                class="block mt-1 text-xs text-red-700"
                role="alert"
              >
                {{ erreursLignes[`guests.${rang}.email`] }}
              </span>
            </label>
            <button
              type="button"
              class="mt-5 text-sm text-gray-500 hover:text-red-700 disabled:opacity-40"
              :disabled="lignes.length <= 1"
              :aria-label="`Retirer l'invité ${rang + 1}`"
              @click="retirerLigne(rang)"
            >
              Retirer
            </button>
          </div>
        </fieldset>
      </div>

      <div class="flex flex-wrap items-center gap-2 pt-4 border-t border-gray-200">
        <button
          type="button"
          class="border border-gray-300 text-gray-700 font-medium px-4 py-2 rounded-lg disabled:opacity-60"
          :disabled="lignes.length >= INVITES_MAX"
          @click="ajouterLigne"
        >
          Ajouter une ligne
        </button>
        <span v-if="lignes.length >= INVITES_MAX" class="text-sm text-gray-500">
          Un lot compte au plus {{ INVITES_MAX }} invités : envoyez celui-ci, puis recommencez.
        </span>
        <button
          type="submit"
          :disabled="envoi"
          class="ml-auto bg-primary text-white font-medium px-4 py-2 rounded-lg hover:opacity-90 disabled:opacity-60"
        >
          {{
            envoi
              ? 'Création des pass…'
              : `Créer ${lignes.length > 1 ? `les ${lignes.length} pass` : 'le pass'}`
          }}
        </button>
      </div>
    </form>
  </div>
</template>
