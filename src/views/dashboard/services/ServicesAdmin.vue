<template>
  <div>
    <header class="mb-6">
      <h2 class="text-2xl font-bold text-gray-800">Services consulaires</h2>
      <p class="text-gray-600 mt-1">
        Les prestations présentées sur la page « Nos services » et leurs pages de détail.
        <span class="font-medium"
          >Tant qu'aucun service n'est enregistré, la rubrique entière — menu compris — n'apparaît
          pas sur le site.</span
        >
      </p>
    </header>

    <p v-if="chargement" class="text-gray-500 py-20 text-center">Chargement des services…</p>

    <p
      v-else-if="erreurChargement"
      class="bg-red-50 border border-red-200 text-red-800 rounded-xl px-4 py-3"
      role="alert"
    >
      {{ erreurChargement }}
    </p>

    <div v-else class="space-y-6">
      <p
        v-if="message"
        class="bg-green-50 border border-green-200 text-green-800 rounded-xl px-4 py-3"
        role="status"
      >
        {{ message }}
      </p>

      <!-- Plateforme de demarches en ligne -->
      <section class="bg-white shadow-sm rounded-xl p-6">
        <div class="flex items-start justify-between gap-4 mb-5">
          <div>
            <h3 class="text-lg font-semibold text-primary">Démarches en ligne</h3>
            <p class="text-sm text-gray-500 mt-0.5">
              La plateforme vers laquelle le site renvoie les visiteurs, si l'ambassade en a une.
            </p>
          </div>
          <EtatSection :rempli="contenu.platform !== null" />
        </div>

        <form class="space-y-4" @submit.prevent="enregistrerLaPlateforme">
          <div class="grid gap-4 md:grid-cols-2">
            <div>
              <label for="nom-plateforme" class="block text-sm font-medium text-gray-700 mb-1.5">
                Nom <span class="text-red-600" aria-hidden="true">*</span>
              </label>
              <input
                id="nom-plateforme"
                v-model.trim="plateforme.name"
                type="text"
                maxlength="191"
                placeholder="Express54"
                class="w-full border border-gray-300 rounded-lg px-4 py-2.5 focus:outline-none focus:ring-2 focus:ring-primary/40 focus:border-primary"
              />
            </div>

            <div>
              <label for="url-plateforme" class="block text-sm font-medium text-gray-700 mb-1.5">
                Adresse <span class="text-red-600" aria-hidden="true">*</span>
              </label>
              <input
                id="url-plateforme"
                v-model.trim="plateforme.url"
                type="url"
                maxlength="255"
                placeholder="https://www.express54.org"
                class="w-full border border-gray-300 rounded-lg px-4 py-2.5 focus:outline-none focus:ring-2 focus:ring-primary/40 focus:border-primary"
              />
            </div>

            <div>
              <label for="tel-plateforme" class="block text-sm font-medium text-gray-700 mb-1.5">
                Téléphone <span class="text-gray-400 font-normal">(facultatif)</span>
              </label>
              <input
                id="tel-plateforme"
                v-model.trim="plateforme.phone"
                type="tel"
                maxlength="40"
                class="w-full border border-gray-300 rounded-lg px-4 py-2.5 focus:outline-none focus:ring-2 focus:ring-primary/40 focus:border-primary"
              />
            </div>

            <div>
              <label for="desc-plateforme" class="block text-sm font-medium text-gray-700 mb-1.5">
                Description <span class="text-gray-400 font-normal">(facultatif)</span>
              </label>
              <input
                id="desc-plateforme"
                v-model.trim="plateforme.description"
                type="text"
                maxlength="255"
                class="w-full border border-gray-300 rounded-lg px-4 py-2.5 focus:outline-none focus:ring-2 focus:ring-primary/40 focus:border-primary"
              />
            </div>
          </div>

          <p v-if="erreurPlateforme" class="text-sm text-red-700" role="alert">
            {{ erreurPlateforme }}
          </p>

          <div class="flex items-center gap-3">
            <button
              type="submit"
              :disabled="enregistrement"
              class="bg-primary hover:bg-primary-dark disabled:opacity-60 text-white font-semibold px-5 py-2.5 rounded-lg transition-colors"
            >
              {{ enregistrement ? 'Enregistrement…' : 'Enregistrer' }}
            </button>
            <button
              v-if="contenu.platform !== null"
              type="button"
              class="text-sm text-red-700 hover:underline"
              @click="retirerLaPlateforme"
            >
              Retirer du site
            </button>
          </div>
        </form>
      </section>

      <!-- Liste des services -->
      <ListeOrdonnee
        titre="Services"
        description="Les cartes de la page « Nos services », dans l'ordre d'affichage."
        libelle-ajout="Ajouter un service"
        :elements="elementsOrdonnes"
        @monter="(id) => deplacer(id, -1)"
        @descendre="(id) => deplacer(id, 1)"
        @supprimer="retirerLeService"
        @ajouter="ouvrirService(null)"
        @modifier="ouvrirService"
      >
        <template #apercu="{ element }">
          <div class="w-12 h-12 rounded-lg bg-primary/10 flex items-center justify-center shrink-0">
            <IconeService :icone="element.icon" />
          </div>
          <div class="min-w-0">
            <p class="font-semibold text-gray-800 truncate">{{ element.title }}</p>
            <p class="text-sm text-gray-600 truncate">/services/{{ element.slug }}</p>
          </div>
        </template>
      </ListeOrdonnee>
    </div>

    <!-- Formulaire d'un service -->
    <Boite
      v-if="serviceOuvert"
      :titre="serviceEdite ? 'Modifier le service' : 'Ajouter un service'"
      @fermer="serviceOuvert = false"
    >
      <form class="space-y-5" @submit.prevent="enregistrerLeService">
        <div class="grid gap-4 md:grid-cols-2">
          <div>
            <label for="titre-service" class="block text-sm font-medium text-gray-700 mb-1.5">
              Titre <span class="text-red-600" aria-hidden="true">*</span>
            </label>
            <input
              id="titre-service"
              v-model.trim="saisie.title"
              type="text"
              maxlength="120"
              class="w-full border border-gray-300 rounded-lg px-4 py-2.5 focus:outline-none focus:ring-2 focus:ring-primary/40 focus:border-primary"
            />
          </div>

          <div>
            <label for="icone-service" class="block text-sm font-medium text-gray-700 mb-1.5">
              Icône
            </label>
            <ChampSelect id="icone-service" v-model="saisie.icon" :options="OPTIONS_ICONE" />
          </div>
        </div>

        <div>
          <label for="slug-service" class="block text-sm font-medium text-gray-700 mb-1.5">
            Adresse de la page <span class="text-gray-400 font-normal">(facultatif)</span>
          </label>
          <div class="flex items-center gap-2">
            <span class="text-sm text-gray-500 shrink-0">/services/</span>
            <input
              id="slug-service"
              v-model.trim="saisie.slug"
              type="text"
              maxlength="60"
              :placeholder="slugPropose"
              class="w-full border border-gray-300 rounded-lg px-4 py-2.5 focus:outline-none focus:ring-2 focus:ring-primary/40 focus:border-primary"
            />
          </div>
          <p class="text-xs text-gray-500 mt-1.5">
            Laissée vide, elle est dérivée du titre. Une fois la page partagée, la modifier casse
            les liens déjà diffusés.
          </p>
        </div>

        <div>
          <label for="resume-service" class="block text-sm font-medium text-gray-700 mb-1.5">
            Résumé <span class="text-gray-400 font-normal">(facultatif)</span>
          </label>
          <input
            id="resume-service"
            v-model.trim="saisie.summary"
            type="text"
            maxlength="255"
            placeholder="La phrase affichée sur la carte"
            class="w-full border border-gray-300 rounded-lg px-4 py-2.5 focus:outline-none focus:ring-2 focus:ring-primary/40 focus:border-primary"
          />
        </div>

        <div class="grid gap-4 md:grid-cols-2">
          <div>
            <label for="delai-service" class="block text-sm font-medium text-gray-700 mb-1.5">
              Délai <span class="text-gray-400 font-normal">(facultatif)</span>
            </label>
            <input
              id="delai-service"
              v-model.trim="saisie.delay"
              type="text"
              maxlength="60"
              placeholder="5 jours ouvrables"
              class="w-full border border-gray-300 rounded-lg px-4 py-2.5 focus:outline-none focus:ring-2 focus:ring-primary/40 focus:border-primary"
            />
          </div>

          <div>
            <label for="tarif-service" class="block text-sm font-medium text-gray-700 mb-1.5">
              Tarif <span class="text-gray-400 font-normal">(facultatif)</span>
            </label>
            <input
              id="tarif-service"
              v-model.trim="saisie.fee"
              type="text"
              maxlength="60"
              placeholder="gratuit"
              class="w-full border border-gray-300 rounded-lg px-4 py-2.5 focus:outline-none focus:ring-2 focus:ring-primary/40 focus:border-primary"
            />
          </div>
        </div>

        <div>
          <label for="corps-service" class="block text-sm font-medium text-gray-700 mb-1.5">
            Contenu de la page <span class="text-red-600" aria-hidden="true">*</span>
          </label>
          <textarea
            id="corps-service"
            v-model="saisie.body_html"
            rows="14"
            class="w-full border border-gray-300 rounded-lg px-4 py-2.5 font-mono text-sm focus:outline-none focus:ring-2 focus:ring-primary/40 focus:border-primary"
          ></textarea>
          <p class="text-xs text-gray-500 mt-1.5">
            Les balises simples sont acceptées&nbsp;: titres, paragraphes, gras, italique, listes et
            tableaux — utiles pour une grille de tarifs.
          </p>
        </div>

        <p v-if="erreurFormulaire" class="text-sm text-red-700" role="alert">
          {{ erreurFormulaire }}
        </p>

        <div class="flex justify-end gap-3 pt-2">
          <button
            type="button"
            class="px-4 py-2.5 text-gray-700 font-semibold"
            @click="serviceOuvert = false"
          >
            Annuler
          </button>
          <button
            type="submit"
            :disabled="enregistrement"
            class="bg-primary hover:bg-primary-dark disabled:opacity-60 text-white font-semibold px-5 py-2.5 rounded-lg transition-colors"
          >
            {{ enregistrement ? 'Enregistrement…' : 'Enregistrer' }}
          </button>
        </div>
      </form>
    </Boite>
  </div>
</template>

<script setup lang="ts">
import { ref, reactive, computed, onMounted } from 'vue'
import ListeOrdonnee from '../contenu/ListeOrdonnee.vue'
import EtatSection from '../contenu/EtatSection.vue'
import Boite from '../contenu/Boite.vue'
import ChampSelect from '@/components/ui/ChampSelect.vue'
import IconeService from '@/components/services/IconeService.vue'
import { messageErreurContenu } from '@/api/contenu'
import {
  recupererServicesAdmin,
  ajouterService,
  modifierService,
  supprimerService,
  ordonnerServices,
  enregistrerPlateforme,
  supprimerPlateforme,
  SERVICES_VIDES,
  ICONES_SERVICE,
  type ContenuServices,
  type Service,
  type IconeService as CleIcone,
} from '@/api/services'

/**
 * L'ecran de saisie des services consulaires.
 *
 * Il double la page publique : tout ce que le visiteur voit se saisit ici, y
 * compris l'ordre des cartes. Rien n'est ecrit en dur dans le gabarit, c'est
 * ce qui empeche une ambassade d'afficher les services d'une autre.
 */
const contenu = ref<ContenuServices>({ ...SERVICES_VIDES })
const chargement = ref(true)
const enregistrement = ref(false)
const erreurChargement = ref('')
const erreurFormulaire = ref('')
const erreurPlateforme = ref('')
const message = ref('')

const plateforme = reactive({ name: '', url: '', phone: '', description: '' })

const serviceOuvert = ref(false)
const serviceEdite = ref<Service | null>(null)
const saisie = reactive({
  title: '',
  slug: '',
  summary: '',
  icon: '' as CleIcone | '',
  delay: '',
  fee: '',
  body_html: '',
})

const LIBELLE_ICONE: Readonly<Record<CleIcone, string>> = {
  visa: 'Visa',
  passeport: 'Passeport',
  'carte-consulaire': 'Carte consulaire',
  'etat-civil': 'État civil',
  legalisation: 'Légalisation',
  document: 'Document',
  transport: 'Transport',
  assistance: 'Assistance',
  entreprise: 'Entreprise',
  etudes: 'Études',
}

const OPTIONS_ICONE = [
  { valeur: '', libelle: 'Icône par défaut' },
  ...ICONES_SERVICE.map((cle) => ({ valeur: cle, libelle: LIBELLE_ICONE[cle] })),
]

/**
 * La liste que `ListeOrdonnee` sait nommer.
 *
 * Le composant cherche un `name` pour ses libelles d'accessibilite ; un
 * service porte un `title`. On l'expose sous les deux noms plutot que
 * d'apprendre au composant ce qu'est un service.
 */
const elementsOrdonnes = computed(() =>
  contenu.value.services.map((service) => ({ ...service, name: service.title })),
)

/** Ce que le back derivera du titre si l'adresse est laissee vide. */
const slugPropose = computed(() =>
  saisie.title
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '')
    .slice(0, 60),
)

function annoncer(texte: string): void {
  message.value = texte
  setTimeout(() => (message.value = ''), 3000)
}

async function charger(): Promise<void> {
  chargement.value = true
  erreurChargement.value = ''
  try {
    contenu.value = await recupererServicesAdmin()
    plateforme.name = contenu.value.platform?.name ?? ''
    plateforme.url = contenu.value.platform?.url ?? ''
    plateforme.phone = contenu.value.platform?.phone ?? ''
    plateforme.description = contenu.value.platform?.description ?? ''
  } catch (souleve) {
    erreurChargement.value = messageErreurContenu(souleve)
  } finally {
    chargement.value = false
  }
}

/**
 * Rejoue l'action puis recharge depuis le serveur.
 *
 * Recharger plutot que de modifier la copie locale evite que l'ecran et le
 * site public divergent : les positions et le slug sont calcules cote
 * serveur, et c'est sa version qui fait foi.
 */
async function agir(
  action: () => Promise<unknown>,
  succes: string,
  cible: 'formulaire' | 'plateforme' = 'formulaire',
): Promise<boolean> {
  enregistrement.value = true
  erreurFormulaire.value = ''
  erreurPlateforme.value = ''
  try {
    await action()
    await charger()
    annoncer(succes)
    return true
  } catch (souleve) {
    const texte = messageErreurContenu(souleve)
    if (cible === 'plateforme') erreurPlateforme.value = texte
    else erreurFormulaire.value = texte
    return false
  } finally {
    enregistrement.value = false
  }
}

async function enregistrerLaPlateforme(): Promise<void> {
  if (plateforme.name.trim() === '' || plateforme.url.trim() === '') {
    erreurPlateforme.value = "Le nom et l'adresse sont obligatoires."
    return
  }
  await agir(
    () =>
      enregistrerPlateforme({
        name: plateforme.name,
        url: plateforme.url,
        phone: plateforme.phone === '' ? null : plateforme.phone,
        description: plateforme.description === '' ? null : plateforme.description,
      }),
    'Plateforme enregistrée.',
    'plateforme',
  )
}

async function retirerLaPlateforme(): Promise<void> {
  await agir(supprimerPlateforme, 'Plateforme retirée du site.', 'plateforme')
}

function ouvrirService(id: number | null): void {
  erreurFormulaire.value = ''
  const existant = contenu.value.services.find((service) => service.id === id) ?? null
  serviceEdite.value = existant
  saisie.title = existant?.title ?? ''
  saisie.slug = existant?.slug ?? ''
  saisie.summary = existant?.summary ?? ''
  saisie.icon = existant?.icon ?? ''
  saisie.delay = existant?.delay ?? ''
  saisie.fee = existant?.fee ?? ''
  saisie.body_html = existant?.body_html ?? ''
  serviceOuvert.value = true
}

async function enregistrerLeService(): Promise<void> {
  if (saisie.title.trim() === '') {
    erreurFormulaire.value = 'Le titre est obligatoire.'
    return
  }
  if (saisie.body_html.trim() === '') {
    erreurFormulaire.value = 'Le contenu de la page est obligatoire.'
    return
  }

  // Les champs facultatifs vides partent a `null` : c'est ce qui fait
  // disparaitre le bandeau des delais et le resume, plutot que d'afficher
  // une case vide sur le site.
  const saisi = {
    title: saisie.title,
    slug: saisie.slug === '' ? slugPropose.value : saisie.slug,
    summary: saisie.summary === '' ? null : saisie.summary,
    icon: saisie.icon === '' ? null : saisie.icon,
    delay: saisie.delay === '' ? null : saisie.delay,
    fee: saisie.fee === '' ? null : saisie.fee,
    body_html: saisie.body_html,
  }

  const edite = serviceEdite.value
  const abouti = await agir(
    () => (edite === null ? ajouterService(saisi) : modifierService(edite.id, saisi)),
    edite === null ? 'Service ajouté.' : 'Service modifié.',
  )
  if (abouti) serviceOuvert.value = false
}

async function retirerLeService(id: number): Promise<void> {
  await agir(() => supprimerService(id), 'Service retiré du site.')
}

/**
 * Deplace un service d'un rang et renvoie l'ordre complet.
 *
 * Le contrat attend la liste entiere des identifiants, pas un deplacement :
 * le serveur renumerote, ce qui evite que deux services finissent a la meme
 * position.
 */
async function deplacer(id: number, pas: -1 | 1): Promise<void> {
  const services = contenu.value.services
  const rang = services.findIndex((service) => service.id === id)
  const vise = rang + pas
  if (rang === -1 || vise < 0 || vise >= services.length) return

  const ids = services.map((service) => service.id)
  ;[ids[rang], ids[vise]] = [ids[vise]!, ids[rang]!]
  await agir(() => ordonnerServices(ids as number[]), 'Ordre enregistré.')
}

onMounted(charger)
</script>
