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

    <!-- Voile systematique, et seul dispositif : le texte est pose dessus
         sans cadre. Le texte n'est pas pose sur une couleur mais sur une
         photographie televersee par l'ambassade, dont rien n'est mesurable a
         l'avance. Le plancher est donc calcule contre le PIRE cas possible,
         une photographie entierement blanche :

           voile a 65 %  ->  texte blanc              : 6,98
                             titre en couleur secondaire : 4,74 (jaune gabonais)

         Les deux passent le seuil de 4,5, quelle que soit l'image. C'est ce
         qui remplace le fond opaque derriere les blocs de texte : la garantie
         est la meme, et la photographie reste visible. La maquette d'origine
         descend a 20 %, ou le titre jaune tombe a 1,6 devant une photo claire. -->
    <div
      class="absolute inset-0 bg-gradient-to-r from-black/75 via-black/70 to-black/65"
      aria-hidden="true"
    ></div>

    <div class="relative max-w-7xl mx-auto px-6 lg:px-8 py-24 w-full">
      <div class="grid lg:grid-cols-2 gap-10 lg:gap-16 items-center">
        <!-- Colonne de gauche : l'identite de l'ambassade. Elle ne change pas
             d'une diapositive a l'autre — c'est ce qui la distingue de la
             citation, et ce qui evite que le titre du site clignote. -->
        <div>
          <img v-if="logo" :src="logo" :alt="titre" class="w-16 mb-6" />

          <h1 class="text-3xl lg:text-5xl font-bold text-secondary leading-tight mb-5 text-balance">
            {{ titre }}
          </h1>

          <p v-if="intro" class="text-white/90 leading-relaxed mb-8">{{ intro }}</p>

          <div class="flex flex-wrap items-center gap-5">
            <slot name="boutons" />
          </div>
        </div>

        <!-- Colonne de droite : ce qui change. La citation, sa signature, et
             les pastilles numerotees qui disent laquelle on regarde. -->
        <div class="lg:border-l lg:border-white/20 lg:pl-12">
          <i class="bx bxs-quote-left text-3xl text-secondary/80" aria-hidden="true"></i>

          <!-- `aria-live` parce que ce bloc change tout seul : sans lui, une
               lecture d'ecran ne saurait jamais que le texte a ete remplace. -->
          <div aria-live="polite">
            <p v-if="citation" class="text-lg text-white/95 leading-relaxed mt-4">
              {{ citation.quote }}
            </p>
            <p
              v-if="citation?.author"
              class="text-secondary font-semibold text-sm tracking-wide uppercase mt-5"
            >
              {{ citation.author }}
            </p>
          </div>

          <div v-if="diapositives.length > 1" class="flex items-center gap-4 mt-10">
            <button
              v-for="(diapositive, rang) in diapositives"
              :key="diapositive.id"
              type="button"
              class="w-12 h-12 rounded-full border-2 font-semibold tabular-nums transition-colors focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-white"
              :class="
                rang === rangAffiche
                  ? 'border-secondary bg-secondary/20 text-secondary'
                  : 'border-white/40 text-white/70 hover:border-white hover:text-white'
              "
              :aria-label="`Afficher l'image ${rang + 1} sur ${diapositives.length}`"
              :aria-current="rang === rangAffiche"
              @click="afficher(rang)"
            >
              {{ String(rang + 1).padStart(2, '0') }}
            </button>
          </div>
        </div>
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
  logo: string
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
