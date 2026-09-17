<template>
  <section
    class="relative min-h-[85vh] flex items-center overflow-hidden"
    role="group"
    aria-label="Bannière d'accueil"
  >
    <!-- Les photos : une seule visible a la fois, en fondu. Le fondu est
         prefere a un rail qui translate parce qu'il ne depend pas de la
         largeur du conteneur et ne laisse jamais deux images a moitie
         visibles pendant le redimensionnement. -->
    <div
      v-for="(diapositive, rang) in diapositives"
      :key="diapositive.id"
      class="absolute inset-0 bg-cover bg-center transition-opacity duration-1000 motion-reduce:transition-none"
      :class="rang === rangAffiche ? 'opacity-100' : 'opacity-0'"
      :style="{ backgroundImage: `url(${diapositive.image_url})` }"
      aria-hidden="true"
    ></div>

    <!-- Voile systematique. Le texte n'est pas pose sur une couleur mais sur
         une photographie televersee par l'ambassade : aucun rapport de
         contraste n'est mesurable a l'avance, et il varie d'un point a
         l'autre de la meme image. Le degrade s'eclaircit vers la droite pour
         laisser voir la photo, mais son plancher ne descend pas sous 45 % :
         la maquette d'origine passait a 20 % au milieu de la banniere, ce qui
         tient devant trois portraits sombres et pas devant la premiere photo
         claire. -->
    <div
      class="absolute inset-0 bg-gradient-to-r from-black/80 via-black/65 to-black/45"
      aria-hidden="true"
    ></div>

    <div class="relative max-w-7xl mx-auto px-6 lg:px-8 py-24 w-full">
      <!-- Second dispositif : derriere le seul bloc de texte, un fond plus
           dense encore, pour que la lisibilite ne depende pas de ce que
           l'image contient a cet endroit-la. -->
      <div class="max-w-2xl bg-black/45 backdrop-blur-sm rounded-2xl px-8 py-10">
        <h1 class="text-3xl lg:text-5xl font-bold text-white leading-tight mb-5 text-balance">
          {{ titre }}
        </h1>

        <p v-if="intro" class="text-lg text-white/90 leading-relaxed mb-8">{{ intro }}</p>

        <!-- Citation de la diapositive courante. Texte brut : interpolation,
             jamais `v-html`. -->
        <blockquote v-if="citation" class="border-l-4 border-secondary pl-5 mb-8">
          <p class="text-white/95 italic leading-relaxed">« {{ citation.quote }} »</p>
          <footer v-if="citation.author" class="text-secondary font-semibold text-sm mt-2">
            {{ citation.author }}
          </footer>
        </blockquote>

        <div class="flex flex-wrap items-center gap-5">
          <slot name="boutons" />
        </div>
      </div>

      <!-- Pastilles : seulement s'il y a de quoi naviguer. -->
      <div v-if="diapositives.length > 1" class="flex items-center gap-3 mt-10">
        <button
          v-for="(diapositive, rang) in diapositives"
          :key="diapositive.id"
          type="button"
          class="h-3 rounded-full transition-all focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-white"
          :class="rang === rangAffiche ? 'w-10 bg-secondary' : 'w-3 bg-white/50 hover:bg-white/80'"
          :aria-label="`Afficher l'image ${rang + 1} sur ${diapositives.length}`"
          :aria-current="rang === rangAffiche"
          @click="afficher(rang)"
        ></button>
      </div>
    </div>
  </section>
</template>

<script setup lang="ts">
import { ref, computed, onMounted, onBeforeUnmount } from 'vue'
import type { DiapositiveBanniere } from '@/api/contenu'

/**
 * La banniere en diaporama, servie par le CMS.
 *
 * Elle ne s'affiche que si l'ambassade a choisi cette mise en page ET televerse
 * au moins une image : `Home.vue` tranche, parce qu'un diaporama vide n'est pas
 * un diaporama mais un aplat sombre ou personne ne trouve le menu.
 *
 * Les boutons ne sont pas saisis : ils arrivent par le slot `boutons`, deduits
 * des modules ouverts pour l'ambassade. Une destination saisie a la main
 * pointerait tot ou tard sur une rubrique fermee.
 */
const proprietes = defineProps<{
  titre: string
  intro: string | null
  diapositives: readonly DiapositiveBanniere[]
}>()

/** Six secondes, comme la maquette. */
const INTERVALLE = 6000

const rangAffiche = ref(0)
let minuterie: ReturnType<typeof setInterval> | null = null

const citation = computed(() => {
  const courante = proprietes.diapositives[rangAffiche.value]
  return courante?.quote ? courante : null
})

/**
 * Vrai si la personne a demande qu'on limite les animations.
 *
 * Une banniere qui defile toute seule n'est pas negociable pour qui a demande
 * qu'elle ne bouge pas : le defilement ne demarre alors pas du tout, et la
 * premiere image reste affichee. Les pastilles, elles, continuent de
 * fonctionner — c'est un geste voulu, pas une animation subie.
 */
function animationsReduites(): boolean {
  return (
    typeof window !== 'undefined' &&
    typeof window.matchMedia === 'function' &&
    window.matchMedia('(prefers-reduced-motion: reduce)').matches
  )
}

function arreter(): void {
  if (minuterie !== null) clearInterval(minuterie)
  minuterie = null
}

function lancer(): void {
  arreter()
  if (animationsReduites() || proprietes.diapositives.length < 2) return
  minuterie = setInterval(() => {
    rangAffiche.value = (rangAffiche.value + 1) % proprietes.diapositives.length
  }, INTERVALLE)
}

/**
 * Un clic sur une pastille relance le compte a zero.
 *
 * Sans cela, l'image choisie peut disparaitre au bout d'une demi-seconde
 * parce que la minuterie reprend la main la ou elle en etait.
 */
function afficher(rang: number): void {
  rangAffiche.value = rang
  lancer()
}

onMounted(lancer)
onBeforeUnmount(arreter)
</script>
