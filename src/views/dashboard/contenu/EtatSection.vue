<template>
  <!-- Le contrat du gabarit : une section vide ne s'affiche pas sur le site.
       L'administrateur doit le lire sans avoir a l'apprendre. -->
  <span
    class="shrink-0 inline-flex items-center gap-1.5 text-xs font-semibold px-2.5 py-1 rounded-full whitespace-nowrap"
    :class="rempli ? 'bg-primary/10 text-primary' : 'bg-gray-100 text-gray-600'"
  >
    <i :class="rempli ? 'bx bx-check-circle' : 'bx bx-hide'" aria-hidden="true"></i>
    {{ rempli ? 'Visible sur le site' : 'Masquée sur le site' }}
  </span>
</template>

<script setup lang="ts">
defineProps<{ rempli: boolean }>()
</script>
