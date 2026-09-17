<template>
  <div>
    <header class="mb-8">
      <h2 class="text-2xl font-bold text-gray-800">Bienvenue, {{ prenomOuTitre }}</h2>
      <p class="text-gray-600 mt-1">
        Vous administrez le site de
        <strong class="font-semibold">{{ nomDeLAmbassade }}</strong
        >.
      </p>
    </header>

    <div class="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-6">
      <RouterLink
        v-for="rubrique in rubriques"
        :key="rubrique.chemin"
        :to="rubrique.chemin"
        class="group block rounded-xl bg-white p-6 shadow-md no-underline transition-shadow hover:shadow-lg"
      >
        <div class="flex items-start gap-4">
          <span
            class="flex h-12 w-12 flex-shrink-0 items-center justify-center rounded-full bg-primary/10"
          >
            <i :class="rubrique.icone" class="text-2xl text-primary"></i>
          </span>
          <div class="min-w-0">
            <h3 class="font-semibold text-gray-800 group-hover:text-primary">
              {{ rubrique.titre }}
            </h3>
            <p class="mt-1 text-sm text-gray-600">{{ rubrique.description }}</p>
          </div>
        </div>
      </RouterLink>
    </div>
  </div>
</template>

<script setup lang="ts">
import { computed } from 'vue'
import { RouterLink } from 'vue-router'
import { useAuthStore } from '@/stores/auth'
import { useTenantStore } from '@/stores/tenant'
import { useIdentite } from '@/tenant/identite'
import { etatDuModule } from '@/tenant/module-administration'

/**
 * Page d'accueil du back-office.
 *
 * Elle affichait des statistiques INVENTEES : « 24 articles, +12 % »,
 * « 156 photos », un graphique de visites hebdomadaires et trois derniers
 * articles dont deux parlaient de Washington et du Costa Rica — du contenu de
 * l'ambassade de Guinee aux Etats-Unis, servi a l'administrateur gabonais.
 * Aucun de ces chiffres ne venait de l'API, et la repartition ne tombait meme
 * pas juste.
 *
 * Un chiffre faux est pire qu'une absence de chiffre : il se cite en reunion.
 * Aucun compteur n'est donc affiche tant que l'API n'en sert pas. La page dit
 * a la place ce qui est vrai — qui est connecte, quelle ambassade il
 * administre — et sert de porte d'entree vers les rubriques reelles, ce que la
 * barre laterale, qui n'est qu'une liste d'icones, ne fait pas.
 */
const auth = useAuthStore()
const tenant = useTenantStore()
const { nomDeLAmbassade } = useIdentite()

/**
 * Le prenom, ou « Administrateur » tant que l'identite n'est pas revenue de
 * `/api/auth/me`. Le nom complet du compte est souvent « Ambassade du Gabon a
 * Conakry » : le premier mot suffit a saluer sans reciter.
 */
const prenomOuTitre = computed(() => auth.utilisateur?.name?.split(' ')[0] ?? 'Administrateur')

interface Rubrique {
  chemin: string
  titre: string
  description: string
  icone: string
}

const RUBRIQUES: readonly Rubrique[] = [
  {
    chemin: '/dashboard/contenu-accueil',
    titre: "Contenu de l'accueil",
    description:
      "Bannière, mot de bienvenue, ambassadeur, dirigeants et vitrine de la page d'accueil.",
    icone: 'bx bxs-home',
  },
  {
    chemin: '/dashboard/services',
    titre: 'Services consulaires',
    description: 'Visas, passeports, état civil : procédures, pièces à fournir, délais et tarifs.',
    icone: 'bx bxs-briefcase',
  },
  {
    chemin: '/dashboard/annuaire',
    titre: 'Annuaire',
    description: 'Personnel de la chancellerie et consuls honoraires publiés sur le site.',
    icone: 'bx bxs-contact',
  },
  {
    chemin: '/dashboard/jours-feries',
    titre: 'Jours fériés',
    description: "Calendrier des fermetures de l'ambassade et document à télécharger.",
    icone: 'bx bxs-calendar',
  },
  {
    chemin: '/dashboard/articles',
    titre: 'Articles',
    description: 'Articles publiés dans la rubrique actualités du site.',
    icone: 'bx bxs-news',
  },
  {
    chemin: '/dashboard/actualites',
    titre: 'Actualités',
    description: "Brèves et annonces courtes de l'ambassade.",
    icone: 'bx bxs-megaphone',
  },
  {
    chemin: '/dashboard/parametres',
    titre: "Paramètres de l'ambassade",
    description:
      'Identité, coordonnées, couleurs du site. Ce que vous changez ici se voit partout.',
    icone: 'bx bxs-cog',
  },
]

/** Le module Evenements n'apparait que s'il est ouvert, comme dans le menu. */
const EVENEMENTS: Rubrique = {
  chemin: '/dashboard/evenements',
  titre: 'Évènements',
  description: 'Évènements, inscriptions, invités et feuille de présence.',
  icone: 'bx bx-calendar-event',
}

const rubriques = computed(() =>
  etatDuModule('secure_events', tenant) === 'ouvert' ? [...RUBRIQUES, EVENEMENTS] : RUBRIQUES,
)
</script>
