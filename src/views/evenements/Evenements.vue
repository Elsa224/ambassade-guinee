<template>
  <section class="max-w-5xl mx-auto px-4 py-12">
    <header class="mb-10">
      <h1 class="text-3xl md:text-4xl font-bold text-ink-dark mb-3">Évènements</h1>
      <p class="text-gray-600 max-w-2xl">
        Les rendez-vous ouverts au public organisés par l'ambassade.
      </p>
    </header>

    <p v-if="chargement" class="text-center text-gray-500 py-20">Chargement des évènements…</p>

    <p
      v-else-if="erreur"
      class="bg-red-50 border border-red-200 text-red-800 rounded-xl px-4 py-3"
      role="alert"
    >
      {{ erreur }}
    </p>

    <p v-else-if="evenements.length === 0" class="text-center text-gray-500 py-20">
      Aucun évènement n'est annoncé pour le moment.
    </p>

    <ul v-else class="grid gap-5 sm:grid-cols-2">
      <li v-for="evenement in evenements" :key="evenement.publicToken">
        <router-link
          :to="`/evenements/inscription/${evenement.publicToken}`"
          class="h-full flex flex-col bg-white border border-gray-200 rounded-2xl overflow-hidden hover:shadow-md transition-shadow"
        >
          <img
            v-if="evenement.logoUrl"
            loading="lazy"
            :src="evenement.logoUrl"
            alt=""
            class="h-32 w-full object-cover bg-gray-50"
          />

          <div class="flex-1 flex flex-col p-5">
            <div class="flex items-start justify-between gap-3 mb-2">
              <p
                v-if="evenement.typeLabel"
                class="text-xs font-semibold uppercase tracking-widest text-accent"
              >
                {{ evenement.typeLabel }}
              </p>
              <span
                v-if="evenement.isRegistrationClosed"
                class="text-xs font-semibold text-gray-500 bg-gray-100 px-2 py-0.5 rounded-full whitespace-nowrap"
              >
                Inscriptions closes
              </span>
              <span
                v-else
                class="text-xs font-semibold text-primary bg-primary/10 px-2 py-0.5 rounded-full whitespace-nowrap"
              >
                Inscriptions ouvertes
              </span>
            </div>

            <h2 class="text-lg font-bold text-ink-dark leading-snug mb-3">{{ evenement.name }}</h2>

            <dl class="text-sm space-y-1.5 mt-auto">
              <div class="flex gap-2.5 text-gray-600">
                <dt class="text-gray-400 shrink-0">
                  <i class="bx bx-calendar" aria-hidden="true"></i>
                </dt>
                <dd>
                  {{ formaterDate(evenement.date) }}
                  <span v-if="evenement.time"> à {{ evenement.time }}</span>
                </dd>
              </div>
              <div v-if="evenement.location" class="flex gap-2.5 text-gray-600">
                <dt class="text-gray-400 shrink-0"><i class="bx bx-map" aria-hidden="true"></i></dt>
                <dd>{{ evenement.location }}</dd>
              </div>
            </dl>
          </div>
        </router-link>
      </li>
    </ul>
  </section>
</template>

<script setup lang="ts">
import { ref, onMounted } from 'vue'
import { listerEvenementsPublies, messageErreur, type EvenementPublic } from '@/api/evenements'

const evenements = ref<EvenementPublic[]>([])
const chargement = ref(true)
const erreur = ref('')

/**
 * Le back rend la liste des evenements deja publies : rien n'est filtre ici,
 * pas plus que l'etat d'inscription n'est recalcule.
 */
async function charger(): Promise<void> {
  chargement.value = true
  erreur.value = ''
  try {
    evenements.value = await listerEvenementsPublies()
  } catch (souleve) {
    erreur.value = messageErreur(souleve)
  } finally {
    chargement.value = false
  }
}

function formaterDate(brut: string): string {
  const date = new Date(brut)
  if (Number.isNaN(date.getTime())) return brut
  return date.toLocaleDateString('fr-FR', { day: 'numeric', month: 'long', year: 'numeric' })
}

onMounted(charger)
</script>
