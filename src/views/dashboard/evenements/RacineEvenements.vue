<template>
  <!--
    Racine de la rubrique Evenements. Elle porte deux choses :

    1. L'IMBRICATION. Elle n'ajoute aucun habillage, elle existe pour que la
       fiche soit imbriquee sous `/dashboard/evenements` et non posee a cote.
       La nuance est visible a l'ecran : `active-class` de vue-router allume un
       lien des que sa route est un ancetre de la route courante. Deux routes
       soeurs a plat, et la rubrique « Evenements » de la barre laterale
       s'eteindrait des qu'on ouvre un evenement.

    2. LA GARDE DE MODULE. Elle est posee ici plutot que dans le routeur parce
       que les cinq routes enfants passent toutes par elle : une seule garde,
       et aucune page ne peut etre ajoutee en la contournant. L'adresse reste
       affichee, ce qui laisse a l'administrateur de quoi comprendre ou il a
       atterri.
  -->
  <RouterView v-if="etat === 'ouvert'" />

  <div v-else-if="etat === 'attente'" class="p-6 text-gray-500">Chargement…</div>

  <section v-else class="max-w-2xl rounded-lg bg-white p-8 shadow-sm">
    <h2 class="text-xl font-semibold text-gray-800">Module non ouvert</h2>
    <p class="mt-4 text-gray-600">
      Le module <strong>Évènements</strong> d'Ambassade Secure n'est pas activé pour cette
      ambassade. Tant qu'il ne l'est pas, ses écrans n'ont rien à afficher : l'API ne sert aucun
      évènement.
    </p>
    <p class="mt-4 text-gray-600">
      Son activation est une opération de provisionnement et ne se fait pas depuis cette
      administration.
    </p>
    <RouterLink
      to="/dashboard"
      class="mt-6 inline-block font-medium text-primary hover:text-primary-dark"
    >
      Retour au tableau de bord
    </RouterLink>
  </section>
</template>

<script setup lang="ts">
import { computed } from 'vue'
import { RouterView, RouterLink } from 'vue-router'
import { useTenantStore } from '@/stores/tenant'
import { etatDuModule } from '@/tenant/module-administration'

/**
 * Le geste protege n'est pas l'affichage mais l'APPEL : sans cette garde,
 * chacun des cinq ecrans interroge l'API, recoit le 404 d'un module ferme et
 * affiche « Ressource introuvable. » Ce message est juste du point de vue du
 * protocole et faux du point de vue de l'ambassade, a qui il fait prendre une
 * porte fermee pour une panne.
 */
const tenant = useTenantStore()
const etat = computed(() => etatDuModule('secure_events', tenant))
</script>
