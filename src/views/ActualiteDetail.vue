<template>
  <article class="max-w-3xl mx-auto px-4 py-12">
    <p v-if="chargement" class="text-center text-gray-500 py-16">Chargement de l'actualite...</p>

    <div v-else-if="introuvable" class="text-center py-16">
      <h1 class="text-2xl font-bold text-ink mb-3">Cette actualite est introuvable</h1>
      <p class="text-gray-600 mb-6">
        Elle a peut-etre ete retiree, ou le lien que vous avez suivi est incorrect.
      </p>
      <router-link
        to="/actualite"
        class="inline-block bg-primary hover:bg-primary-dark text-white px-6 py-2.5 rounded-full font-semibold transition-colors"
      >
        Voir toutes les actualites
      </router-link>
    </div>

    <template v-else-if="article">
      <router-link
        to="/actualite"
        class="inline-flex items-center gap-2 text-primary hover:text-primary-dark mb-6 text-sm font-medium"
      >
        <i class="bx bx-arrow-back"></i>
        Retour aux actualites
      </router-link>

      <p class="text-sm font-semibold text-accent uppercase tracking-wide mb-2">
        {{ article.categorie?.nom }}
      </p>

      <h1 class="text-3xl md:text-4xl font-bold text-ink-dark leading-tight mb-4">
        {{ article.titre }}
      </h1>

      <p class="text-sm text-gray-500 mb-8">
        Publie le {{ dateLisible }} &middot; {{ article.temps_lecture }} min de lecture
      </p>

      <img
        v-if="article.image"
        :src="article.image"
        :alt="article.titre"
        class="w-full rounded-xl mb-8 object-cover"
      />

      <p class="text-lg text-gray-700 font-medium mb-6">{{ article.resume }}</p>

      <!-- Le contenu est du HTML rendu par le CMS (spec 4.2). -->
      <div class="prose max-w-none text-gray-800 leading-relaxed" v-html="article.contenu"></div>
    </template>
  </article>
</template>

<script setup lang="ts">
import { ref, computed, watch } from 'vue'
import { useRoute } from 'vue-router'
import { recupererArticleParSlug, type Article } from '@/api/articles'
import { ApiError } from '@/api/client'

const route = useRoute()

const article = ref<Article | null>(null)
const chargement = ref(true)
const introuvable = ref(false)

const dateLisible = computed(() => {
  if (!article.value?.date_publication) return ''
  return new Date(article.value.date_publication).toLocaleDateString('fr-FR', {
    day: 'numeric',
    month: 'long',
    year: 'numeric',
  })
})

async function charger(slug: string): Promise<void> {
  chargement.value = true
  introuvable.value = false
  article.value = null
  try {
    article.value = await recupererArticleParSlug(slug)
  } catch (souleve) {
    // Un 404 est un cas nominal (lien obsolete) ; toute autre erreur aussi
    // aboutit a l ecran « introuvable », faute de contenu a afficher.
    introuvable.value = true
    if (!(souleve instanceof ApiError) || souleve.statut !== 404) {
      console.error("Echec du chargement de l actualite :", souleve)
    }
  } finally {
    chargement.value = false
  }
}

// `immediate` couvre le premier rendu ; le watch gere la navigation d un
// article a un autre, ou le composant est reutilise sans etre remonte.
watch(() => route.params.slug, (slug) => charger(String(slug)), { immediate: true })
</script>
