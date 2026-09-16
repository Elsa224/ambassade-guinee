<template>
  <i :class="['bx', classeBoxicon, 'text-3xl', 'text-primary']" aria-hidden="true"></i>
</template>

<script setup lang="ts">
import { computed } from 'vue'
import { iconeDuService, type IconeService } from '@/api/services'

/**
 * L'icone d'une carte de service.
 *
 * Le CMS ne sert qu'une cle : la correspondance avec la fonte d'icones vit
 * ici, et une cle inconnue retombe sur le document generique plutot que de
 * laisser un carre vide dans la grille.
 */
const proprietes = defineProps<{ icone: IconeService | null }>()

const BOXICON_PAR_CLE: Readonly<Record<IconeService, string>> = {
  visa: 'bx-edit-alt',
  passeport: 'bx-book-content',
  'carte-consulaire': 'bx-id-card',
  'etat-civil': 'bx-file',
  legalisation: 'bx-badge-check',
  document: 'bx-file-blank',
  transport: 'bx-package',
  assistance: 'bx-support',
  entreprise: 'bx-briefcase',
  etudes: 'bx-graduation',
}

const classeBoxicon = computed(() => BOXICON_PAR_CLE[iconeDuService({ icon: proprietes.icone })])
</script>
