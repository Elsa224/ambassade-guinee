<template>
  <div>
    <p class="block text-sm font-medium text-gray-700 mb-1.5">
      {{ libelle }} <span v-if="requis" class="text-red-600" aria-hidden="true">*</span>
    </p>

    <div class="flex items-start gap-4">
      <div
        class="w-24 h-24 shrink-0 rounded-lg border border-gray-200 bg-gray-50 overflow-hidden flex items-center justify-center"
      >
        <img
          v-if="adresseAffichee"
          :src="adresseAffichee"
          alt=""
          class="w-full h-full object-cover"
        />
        <i v-else class="bx bx-image text-3xl text-gray-300" aria-hidden="true"></i>
      </div>

      <div class="flex-1 min-w-0">
        <label
          class="inline-flex items-center gap-2 px-4 py-2 rounded-lg border border-gray-300 text-sm font-semibold text-gray-700 hover:bg-gray-50 cursor-pointer transition-colors"
          :class="{ 'opacity-60 pointer-events-none': envoiEnCours }"
        >
          <i class="bx bx-upload" aria-hidden="true"></i>
          {{
            envoiEnCours
              ? 'Envoi en cours…'
              : adresseAffichee
                ? "Changer l'image"
                : 'Choisir une image'
          }}
          <input type="file" class="sr-only" :accept="accept" @change="choisir" />
        </label>

        <p class="text-xs text-gray-500 mt-2">WebP, PNG ou JPEG, {{ poidsMaximal }} Mo maximum.</p>

        <p v-if="erreur" class="text-sm text-red-700 mt-2" role="alert">{{ erreur }}</p>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { computed, ref } from 'vue'
import {
  televerserImage,
  refusDuFichier,
  TAILLE_IMAGE_MAX,
  TYPES_IMAGE_ACCEPTES,
  messageErreurContenu,
} from '@/api/contenu'

/**
 * Ce qu'un televersement rend : la valeur a conserver, et l'adresse a montrer.
 *
 * Les deux coincident partout sauf pour les articles, dont le champ stocke la
 * CLE du media quand l'apercu, lui, a besoin d'une adresse affichable.
 */
export interface ResultatDeTeleversement {
  valeur: string
  apercu: string
}

const {
  libelle,
  requis = false,
  televerseur,
  poidsMaximal = Math.round(TAILLE_IMAGE_MAX / (1024 * 1024)),
} = defineProps<{
  libelle: string
  requis?: boolean
  /** Remplace le televersement par defaut, qui rend l'URL absolue. */
  televerseur?: (fichier: File) => Promise<ResultatDeTeleversement>
  poidsMaximal?: number
}>()

const modelValue = defineModel<string>({ required: true })
/**
 * L'adresse montree dans la vignette, quand elle differe de la valeur gardee.
 *
 * Sans elle, un champ qui stocke une cle afficherait cette cle en guise de
 * source d'image, et la vignette resterait cassee.
 */
const apercu = defineModel<string>('apercu', { default: undefined })

const adresseAffichee = computed(() => apercu.value ?? modelValue.value)

const accept = TYPES_IMAGE_ACCEPTES.join(',')
const envoiEnCours = ref(false)
const erreur = ref('')

async function choisir(evenement: Event): Promise<void> {
  const champ = evenement.target as HTMLInputElement
  const fichier = champ.files?.[0]
  if (!fichier) return

  erreur.value = ''
  const refus = refusDuFichier(fichier, poidsMaximal * 1024 * 1024)
  if (refus !== null) {
    erreur.value = refus
    // Sans cela, choisir deux fois le meme fichier ne declenche plus rien.
    champ.value = ''
    return
  }

  envoiEnCours.value = true
  try {
    const resultat = televerseur
      ? await televerseur(fichier)
      : await (async () => {
          const url = await televerserImage(fichier)
          return { valeur: url, apercu: url }
        })()
    modelValue.value = resultat.valeur
    if (apercu.value !== undefined || televerseur) apercu.value = resultat.apercu
  } catch (souleve) {
    erreur.value = messageErreurContenu(souleve)
  } finally {
    envoiEnCours.value = false
    champ.value = ''
  }
}
</script>
