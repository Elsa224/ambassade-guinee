<template>
  <Boite :titre="titre" @fermer="$emit('fermer')">
    <p class="text-gray-700">{{ question }}</p>
    <p v-if="consequence" class="mt-3 text-sm text-gray-500">{{ consequence }}</p>

    <div class="mt-8 flex flex-col-reverse gap-3 sm:flex-row sm:justify-end">
      <button
        ref="boutonRenoncer"
        type="button"
        data-confirmation="renoncer"
        class="px-5 py-2.5 rounded-xl border border-gray-300 text-gray-700 font-medium transition-colors hover:bg-gray-50"
        @click="$emit('fermer')"
      >
        {{ libelleRenoncer }}
      </button>
      <button
        type="button"
        data-confirmation="valider"
        class="px-5 py-2.5 rounded-xl font-semibold text-white transition-colors disabled:opacity-60"
        :class="dangereux ? 'bg-red-600 hover:bg-red-700' : 'bg-primary hover:bg-primary-dark'"
        :disabled="enCours"
        @click="$emit('confirmer')"
      >
        {{ enCours ? 'En cours…' : libelleConfirmer }}
      </button>
    </div>
  </Boite>
</template>

<script setup lang="ts">
import { onMounted, useTemplateRef } from 'vue'
import Boite from '@/views/dashboard/contenu/Boite.vue'

/**
 * Demande de confirmation avant un geste qu'on ne rattrape pas.
 *
 * Ces gestes passaient par `window.confirm`. Le navigateur y parle en son
 * nom : il affiche son propre domaine en titre, ses boutons dans la langue
 * du navigateur et non celle du site, et rien ne rattache la question au
 * tableau de bord. Un redacteur y lit une alerte de page piegee plutot que
 * la question de son propre outil — et la reflexe est de la chasser.
 *
 * La boite reprend donc le cadre du tableau de bord, et pose le premier
 * foyer sur RENONCER : un appui sur Entree ne doit pas supprimer un compte.
 */
withDefaults(
  defineProps<{
    titre: string
    question: string
    /** Ce que le geste entraine, quand ce n'est pas evident dans la question. */
    consequence?: string
    libelleConfirmer: string
    libelleRenoncer?: string
    /** Rouge pour ce qui detruit, couleur du poste pour le reste. */
    dangereux?: boolean
    enCours?: boolean
  }>(),
  { consequence: '', libelleRenoncer: 'Renoncer', dangereux: false, enCours: false },
)

defineEmits<{ confirmer: []; fermer: [] }>()

const boutonRenoncer = useTemplateRef<HTMLButtonElement>('boutonRenoncer')
onMounted(() => boutonRenoncer.value?.focus())
</script>
