<template>
  <div class="min-h-screen bg-gray-50">
    <p v-if="chargement" class="text-gray-500 py-24 text-center">Chargement de l'annuaire…</p>

    <!-- Discipline de retractation : tant que le CMS ne sert personne, la page
         ne montre rien du gabarit. L'adresse reste atteignable a la main, on
         explique donc plutot que d'afficher une page vide. -->
    <div v-else-if="!aDuContenu" class="max-w-3xl mx-auto px-4 py-24 text-center">
      <h1 class="text-2xl font-bold text-gray-800 mb-3">Rubrique en préparation</h1>
      <p class="text-gray-600 mb-8">L'annuaire de la chancellerie n'a pas encore été publié.</p>
      <router-link to="/" class="text-accent font-semibold hover:underline">
        Retour à l'accueil
      </router-link>
    </div>

    <template v-else>
      <!-- Bandeau -->
      <div class="relative bg-gradient-to-r from-accent to-primary-light text-white">
        <div class="absolute inset-0 bg-black/20"></div>
        <div class="relative max-w-7xl mx-auto px-4 py-16 md:py-20">
          <div class="text-center">
            <div
              class="inline-flex items-center gap-2 bg-white/20 backdrop-blur px-4 py-1 rounded-full text-sm mb-4"
            >
              <img
                v-if="drapeau !== ''"
                :src="drapeau"
                :alt="`Drapeau ${articleDuPays(nomOfficiel)} ${nomOfficiel}`"
                class="w-5 h-auto rounded-sm"
              />
              {{ nomDeLAmbassade }}
            </div>
            <h1 class="text-4xl md:text-5xl font-bold mb-4">La Chancellerie Diplomatique</h1>
            <p class="text-xl md:text-2xl max-w-3xl mx-auto opacity-90">
              Au service de la représentation diplomatique et des relations bilatérales
            </p>
            <div class="flex justify-center gap-4 mt-8">
              <div class="w-16 h-1 bg-accent"></div>
              <div class="w-16 h-1 bg-secondary"></div>
              <div class="w-16 h-1 bg-primary-light"></div>
            </div>
          </div>
        </div>

        <div class="absolute bottom-0 left-0 right-0">
          <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 1440 120" class="w-full h-auto">
            <path
              fill="#f9fafb"
              fill-opacity="1"
              d="M0,64L80,69.3C160,75,320,85,480,80C640,75,800,53,960,48C1120,43,1280,53,1360,58.7L1440,64L1440,120L1360,120C1280,120,1120,120,960,120C800,120,640,120,480,120C320,120,160,120,80,120L0,120Z"
            ></path>
          </svg>
        </div>
      </div>

      <div class="max-w-7xl mx-auto px-4 py-12">
        <h2 class="text-3xl font-bold text-gray-800 mb-8 flex items-center">
          <span class="bg-accent w-1 h-8 mr-3"></span>
          Équipe Diplomatique
        </h2>

        <!-- L'ambassadeur vient du bloc `ambassador` du contenu d'accueil,
             comme sur la page de biographie : il n'est pas dans l'annuaire. -->
        <div
          v-if="ambassadeur !== null"
          class="bg-gradient-to-r from-accent to-accent-deep text-white rounded-2xl p-6 mb-8 shadow-xl"
        >
          <div class="flex items-center gap-4">
            <div
              v-if="ambassadeur.image_url !== null"
              class="w-16 h-16 rounded-full overflow-hidden bg-white/20 shrink-0"
            >
              <img
                :src="ambassadeur.image_url"
                :alt="ambassadeur.name"
                class="w-full h-full object-cover"
              />
            </div>
            <div v-else class="bg-white/20 p-3 rounded-full shrink-0">
              <i class="bx bx-user text-3xl" aria-hidden="true"></i>
            </div>
            <div>
              <h3 class="text-2xl font-bold">{{ ambassadeur.name }}</h3>
              <p class="text-lg text-secondary">{{ ambassadeur.title }}</p>
            </div>
          </div>
        </div>

        <!-- Personnel de la chancellerie, groupe par service et dans l'ordre
             servi par le CMS. Le titre de service n'apparait que si l'agent en
             porte un : une ambassade qui ne renseigne pas le champ retrouve la
             liste a plat qu'elle avait avant. -->
        <div v-for="groupe in groupes" :key="groupe.nom ?? 'sans-service'" class="mb-10 last:mb-0">
          <h3
            v-if="groupe.nom !== null"
            class="text-sm font-bold tracking-wider uppercase text-accent mb-4 pb-2 border-b border-gray-200"
          >
            {{ groupe.nom }}
          </h3>
          <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            <div
              v-for="(membre, rang) in groupe.membres"
              :key="membre.id"
              class="bg-white rounded-xl shadow-lg p-6 hover:shadow-xl transition-shadow border-l-4"
              :class="bordureDuRang(rang)"
            >
              <div class="flex items-start gap-4">
                <div
                  v-if="membre.image_url !== null"
                  class="w-14 h-14 rounded-full overflow-hidden bg-gray-100 shrink-0"
                >
                  <img
                    :src="membre.image_url"
                    :alt="membre.name"
                    class="w-full h-full object-cover"
                  />
                </div>
                <div v-else class="bg-accent/10 p-3 rounded-full shrink-0">
                  <i class="bx bx-user text-2xl text-accent" aria-hidden="true"></i>
                </div>

                <div class="min-w-0">
                  <h3 class="font-bold text-gray-800 break-words">{{ membre.name }}</h3>
                  <p class="text-accent font-medium break-words">{{ membre.role }}</p>

                  <div class="mt-3 space-y-1 text-sm">
                    <p v-if="membre.email !== null" class="flex items-center gap-2">
                      <i class="bx bx-envelope text-gray-400" aria-hidden="true"></i>
                      <a
                        :href="`mailto:${membre.email}`"
                        class="text-primary-light hover:underline break-all"
                      >
                        {{ membre.email }}
                      </a>
                    </p>
                    <p v-if="membre.phone !== null" class="flex items-center gap-2">
                      <i class="bx bx-phone text-gray-400" aria-hidden="true"></i>
                      <a :href="`tel:${membre.phone}`" class="text-primary-light hover:underline">
                        {{ membre.phone }}
                      </a>
                    </p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </template>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, onMounted } from 'vue'
import { recupererAnnuaire, grouperParService, ANNUAIRE_VIDE, type Annuaire } from '@/api/annuaire'
import { recupererContenuAccueil, CONTENU_VIDE, type ContenuAccueil } from '@/api/contenu'
import { useIdentite, articleDuPays } from '@/tenant/identite'

/**
 * La page portait en dur l'equipe diplomatique de l'ambassade de Guinee aux
 * Etats-Unis — huit noms, l'attachee consulaire, le secretariat — ainsi que
 * sa juridiction et sa mission. C'etait l'une des fuites d'identite du
 * gabarit.
 *
 * Le personnel vient desormais de `GET /api/content/directory` et
 * l'ambassadeur du bloc `ambassador` de l'accueil, comme sur sa page de
 * biographie. Sur un echec, les deux restent vides et la page se retracte :
 * elle ne se rabat jamais sur le contenu d'une autre ambassade.
 *
 * Le texte de mission et la liste de juridiction ont ete retires sans
 * remplacement : ils ne relevent d'aucun contrat aujourd'hui. Les servir
 * demandera le contrat du contenu redactionnel, encore a ecrire.
 */
const annuaire = ref<Annuaire>({ ...ANNUAIRE_VIDE })
const contenu = ref<ContenuAccueil>({ ...CONTENU_VIDE })
const chargement = ref(true)

const { nomOfficiel, nomDeLAmbassade, drapeau } = useIdentite()

/** L'ordre servi fait foi : `position` peut porter des trous. */
const personnel = computed(() => annuaire.value.staff)

/**
 * Le personnel range par service, dans l'ordre decide par l'ambassade.
 *
 * Elsa a tranche le 21/09/2026 contre un organigramme dessine : l'annuaire
 * groupe par service ne demande aucun developpement de schema, et surtout il
 * reste exact quand quelqu'un change de poste, la ou un arbre devient faux en
 * silence. L'ordre des groupes suit la position minimale de leurs membres —
 * voir `grouperParService`, qui explique pourquoi.
 */
const groupes = computed(() => grouperParService(personnel.value))
const ambassadeur = computed(() => contenu.value.ambassador)
const aDuContenu = computed(() => personnel.value.length > 0 || ambassadeur.value !== null)

/** Les fiches alternent les couleurs de l'ambassade, dans l'ordre servi. */
const BORDURES = ['border-accent', 'border-secondary', 'border-primary-light'] as const
const bordureDuRang = (rang: number) => BORDURES[rang % BORDURES.length]

onMounted(async () => {
  // Les deux lectures sont independantes : l'echec de l'une ne doit pas
  // priver la page de l'autre.
  const [listes, accueil] = await Promise.allSettled([
    recupererAnnuaire(),
    recupererContenuAccueil(),
  ])
  if (listes.status === 'fulfilled') annuaire.value = listes.value
  if (accueil.status === 'fulfilled') contenu.value = accueil.value
  chargement.value = false
})
</script>

<style scoped>
.border-l-4 {
  transition: transform 0.2s ease;
}

.border-l-4:hover {
  transform: translateX(5px);
}
</style>
