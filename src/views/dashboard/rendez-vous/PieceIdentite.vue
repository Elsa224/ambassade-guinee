<script setup lang="ts">
import { ref, onUnmounted, watch } from 'vue'
import { recupererPiece, messageErreurRdvAdmin, type FacePiece } from '@/api/rendez-vous-admin'

/**
 * Une face de la piece d'identite, servie sur geste explicite.
 *
 * Elle n'est JAMAIS prechargee, et ce n'est pas une precaution de confort :
 * en amont, chaque appel retelecharge la liste filtree entiere pour n'en
 * servir qu'une face, et la route est bornee a 30 appels par minute. Ouvrir
 * automatiquement les deux faces de chaque ligne d'une page de vingt
 * epuiserait le quota en un ecran.
 *
 * Les octets arrivent en `private, no-store` : ils ne doivent survivre ni
 * dans un store, ni dans un cache, ni dans une URL d'objet oubliee. Celle-ci
 * est revoquee des que la face est repliee, changee, ou le panneau ferme.
 */
const { reference, face, presente } = defineProps<{
  reference: string
  face: FacePiece
  /** Faux quand l'amont dit que cette face n'existe pas sur la demande. */
  presente: boolean
}>()

const LIBELLES: Record<FacePiece, string> = { recto: 'Recto', verso: 'Verso' }

const url = ref('')
const typeMime = ref('')
const chargement = ref(false)
const erreur = ref('')

function oublier(): void {
  if (url.value !== '') URL.revokeObjectURL(url.value)
  url.value = ''
  typeMime.value = ''
}

async function afficher(): Promise<void> {
  if (chargement.value) return
  if (url.value !== '') {
    oublier()
    return
  }

  chargement.value = true
  erreur.value = ''
  try {
    const octets = await recupererPiece(reference, face)
    typeMime.value = octets.type
    url.value = URL.createObjectURL(octets)
  } catch (souleve) {
    erreur.value = messageErreurRdvAdmin(souleve)
  } finally {
    chargement.value = false
  }
}

// Changer de demande sans replier la face laisserait l'octet de la
// precedente a l'ecran, sous le nom de la nouvelle.
watch(
  () => reference,
  () => {
    oublier()
    erreur.value = ''
  },
)

onUnmounted(oublier)
</script>

<template>
  <div>
    <button
      v-if="presente"
      type="button"
      class="inline-flex items-center gap-2 rounded-lg border border-gray-300 px-3 py-1.5 text-sm font-medium text-gray-700 transition-colors hover:bg-gray-50 disabled:opacity-60"
      :disabled="chargement"
      @click="afficher"
    >
      <i
        class="bx text-lg"
        :class="chargement ? 'bx-loader-alt bx-spin' : url === '' ? 'bx-id-card' : 'bx-hide'"
        aria-hidden="true"
      ></i>
      {{ url === '' ? `Afficher le ${LIBELLES[face].toLowerCase()}` : 'Masquer' }}
    </button>
    <p v-else class="text-sm text-gray-500">{{ LIBELLES[face] }} non fourni</p>

    <p v-if="erreur" class="mt-2 text-sm text-red-700" role="alert">{{ erreur }}</p>

    <div v-if="url !== ''" class="mt-3">
      <!-- Un PDF ne s'affiche pas dans une balise <img> : l'ouvrir en cadre
           evite une vignette cassee sans rien telecharger de plus. -->
      <iframe
        v-if="typeMime === 'application/pdf'"
        :src="url"
        class="w-full h-96 rounded-lg border border-gray-200"
        :title="`${LIBELLES[face]} de la pièce d'identité`"
      ></iframe>
      <img
        v-else
        :src="url"
        :alt="`${LIBELLES[face]} de la pièce d'identité du visiteur`"
        class="max-w-full rounded-lg border border-gray-200"
      />
    </div>
  </div>
</template>
