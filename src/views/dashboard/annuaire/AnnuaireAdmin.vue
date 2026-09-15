<template>
  <div>
    <header class="mb-6">
      <h2 class="text-2xl font-bold text-gray-800">Annuaire de l'ambassade</h2>
      <p class="text-gray-600 mt-1">
        Le personnel de la chancellerie et les consuls honoraires affichés sur le site.
        <span class="font-medium"
          >Tant qu'une liste est vide, elle n'apparaît pas sur le site.</span
        >
      </p>
    </header>

    <p v-if="chargement" class="text-gray-500 py-20 text-center">Chargement de l'annuaire…</p>

    <p
      v-else-if="erreurChargement"
      class="bg-red-50 border border-red-200 text-red-800 rounded-xl px-4 py-3"
      role="alert"
    >
      {{ erreurChargement }}
    </p>

    <div v-else class="space-y-6">
      <!-- Personnel de la chancellerie -->
      <ListeOrdonnee
        titre="Personnel de la chancellerie"
        description="Les membres de l'équipe diplomatique, dans l'ordre d'affichage."
        libelle-ajout="Ajouter un membre"
        :elements="annuaire.staff"
        @monter="(id) => deplacer('staff', id, -1)"
        @descendre="(id) => deplacer('staff', id, 1)"
        @supprimer="(id) => retirer('staff', id)"
        @ajouter="ouvrirMembre(null)"
        @modifier="ouvrirMembre"
      >
        <template #apercu="{ element }">
          <img
            v-if="element.image_url"
            :src="element.image_url"
            alt=""
            class="w-14 h-14 rounded-lg object-cover"
          />
          <div
            v-else
            class="w-14 h-14 rounded-lg bg-gray-100 text-gray-400 flex items-center justify-center shrink-0"
            aria-hidden="true"
          >
            <i class="bx bx-user text-2xl"></i>
          </div>
          <div class="min-w-0">
            <p class="font-semibold text-gray-800 truncate">{{ element.name }}</p>
            <p class="text-sm text-gray-600 truncate">{{ element.role }}</p>
            <p v-if="element.email || element.phone" class="text-xs text-gray-500 truncate">
              {{ [element.email, element.phone].filter(Boolean).join(' · ') }}
            </p>
          </div>
        </template>
      </ListeOrdonnee>

      <!-- Consuls honoraires -->
      <ListeOrdonnee
        titre="Consuls honoraires"
        description="Les consuls honoraires et leur ville, dans l'ordre d'affichage."
        libelle-ajout="Ajouter un consul"
        :elements="annuaire.consuls"
        @monter="(id) => deplacer('consuls', id, -1)"
        @descendre="(id) => deplacer('consuls', id, 1)"
        @supprimer="(id) => retirer('consuls', id)"
        @ajouter="ouvrirConsul(null)"
        @modifier="ouvrirConsul"
      >
        <template #apercu="{ element }">
          <div class="min-w-0">
            <p class="font-semibold text-gray-800 truncate">{{ element.name }}</p>
            <p class="text-sm text-gray-600 truncate">{{ element.role }} — {{ element.city }}</p>
            <p v-if="element.email || element.phone" class="text-xs text-gray-500 truncate">
              {{ [element.email, element.phone].filter(Boolean).join(' · ') }}
            </p>
          </div>
        </template>
      </ListeOrdonnee>
    </div>

    <!-- Formulaire d'un membre du personnel -->
    <Boite
      v-if="membreOuvert"
      :titre="membreEdite ? 'Modifier le membre' : 'Ajouter un membre'"
      @fermer="membreOuvert = false"
    >
      <form class="space-y-5" @submit.prevent="enregistrerMembre">
        <ChampImage v-model="saisieMembre.image_url" libelle="Portrait" />

        <div>
          <label for="nom-membre" class="block text-sm font-medium text-gray-700 mb-1.5">
            Nom <span class="text-red-600" aria-hidden="true">*</span>
          </label>
          <input
            id="nom-membre"
            v-model.trim="saisieMembre.name"
            type="text"
            :maxlength="LONGUEUR_TEXTE_MAX"
            class="w-full border border-gray-300 rounded-lg px-4 py-2.5 focus:outline-none focus:ring-2 focus:ring-primary/40 focus:border-primary"
          />
        </div>

        <div>
          <label for="fonction-membre" class="block text-sm font-medium text-gray-700 mb-1.5">
            Fonction <span class="text-red-600" aria-hidden="true">*</span>
          </label>
          <input
            id="fonction-membre"
            v-model.trim="saisieMembre.role"
            type="text"
            :maxlength="LONGUEUR_TEXTE_MAX"
            placeholder="Premier Conseiller"
            class="w-full border border-gray-300 rounded-lg px-4 py-2.5 focus:outline-none focus:ring-2 focus:ring-primary/40 focus:border-primary"
          />
        </div>

        <div class="grid md:grid-cols-2 gap-5">
          <div>
            <label for="email-membre" class="block text-sm font-medium text-gray-700 mb-1.5">
              Adresse électronique <span class="text-gray-400 font-normal">(facultatif)</span>
            </label>
            <input
              id="email-membre"
              v-model.trim="saisieMembre.email"
              type="email"
              :maxlength="LONGUEUR_TEXTE_MAX"
              class="w-full border border-gray-300 rounded-lg px-4 py-2.5 focus:outline-none focus:ring-2 focus:ring-primary/40 focus:border-primary"
            />
          </div>
          <div>
            <label for="telephone-membre" class="block text-sm font-medium text-gray-700 mb-1.5">
              Téléphone <span class="text-gray-400 font-normal">(facultatif)</span>
            </label>
            <input
              id="telephone-membre"
              v-model.trim="saisieMembre.phone"
              type="text"
              :maxlength="LONGUEUR_TELEPHONE_MAX"
              class="w-full border border-gray-300 rounded-lg px-4 py-2.5 focus:outline-none focus:ring-2 focus:ring-primary/40 focus:border-primary"
            />
          </div>
        </div>

        <p v-if="erreurFormulaire" class="text-sm text-red-700" role="alert">
          {{ erreurFormulaire }}
        </p>

        <div class="flex justify-end gap-3 pt-2">
          <button
            type="button"
            class="px-4 py-2.5 text-gray-700 font-semibold"
            @click="membreOuvert = false"
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

    <!-- Formulaire d'un consul honoraire -->
    <Boite
      v-if="consulOuvert"
      :titre="consulEdite ? 'Modifier le consul' : 'Ajouter un consul'"
      @fermer="consulOuvert = false"
    >
      <form class="space-y-5" @submit.prevent="enregistrerConsul">
        <div>
          <label for="nom-consul" class="block text-sm font-medium text-gray-700 mb-1.5">
            Nom <span class="text-red-600" aria-hidden="true">*</span>
          </label>
          <input
            id="nom-consul"
            v-model.trim="saisieConsul.name"
            type="text"
            :maxlength="LONGUEUR_TEXTE_MAX"
            class="w-full border border-gray-300 rounded-lg px-4 py-2.5 focus:outline-none focus:ring-2 focus:ring-primary/40 focus:border-primary"
          />
        </div>

        <div class="grid md:grid-cols-2 gap-5">
          <div>
            <label for="fonction-consul" class="block text-sm font-medium text-gray-700 mb-1.5">
              Fonction <span class="text-red-600" aria-hidden="true">*</span>
            </label>
            <input
              id="fonction-consul"
              v-model.trim="saisieConsul.role"
              type="text"
              :maxlength="LONGUEUR_TEXTE_MAX"
              placeholder="Consul honoraire"
              class="w-full border border-gray-300 rounded-lg px-4 py-2.5 focus:outline-none focus:ring-2 focus:ring-primary/40 focus:border-primary"
            />
          </div>
          <div>
            <label for="ville-consul" class="block text-sm font-medium text-gray-700 mb-1.5">
              Ville <span class="text-red-600" aria-hidden="true">*</span>
            </label>
            <input
              id="ville-consul"
              v-model.trim="saisieConsul.city"
              type="text"
              :maxlength="LONGUEUR_TEXTE_MAX"
              class="w-full border border-gray-300 rounded-lg px-4 py-2.5 focus:outline-none focus:ring-2 focus:ring-primary/40 focus:border-primary"
            />
          </div>
        </div>

        <div>
          <label for="adresse-consul" class="block text-sm font-medium text-gray-700 mb-1.5">
            Adresse <span class="text-gray-400 font-normal">(facultatif)</span>
          </label>
          <textarea
            id="adresse-consul"
            v-model="saisieConsul.address"
            rows="3"
            :maxlength="LONGUEUR_ADRESSE_MAX"
            class="w-full border border-gray-300 rounded-lg px-4 py-2.5 focus:outline-none focus:ring-2 focus:ring-primary/40 focus:border-primary"
          ></textarea>
          <p class="text-xs text-gray-500 mt-1.5">
            Les retours à la ligne sont conservés à l'affichage.
          </p>
        </div>

        <div class="grid md:grid-cols-2 gap-5">
          <div>
            <label for="email-consul" class="block text-sm font-medium text-gray-700 mb-1.5">
              Adresse électronique <span class="text-gray-400 font-normal">(facultatif)</span>
            </label>
            <input
              id="email-consul"
              v-model.trim="saisieConsul.email"
              type="email"
              :maxlength="LONGUEUR_TEXTE_MAX"
              class="w-full border border-gray-300 rounded-lg px-4 py-2.5 focus:outline-none focus:ring-2 focus:ring-primary/40 focus:border-primary"
            />
          </div>
          <div>
            <label for="telephone-consul" class="block text-sm font-medium text-gray-700 mb-1.5">
              Téléphone <span class="text-gray-400 font-normal">(facultatif)</span>
            </label>
            <input
              id="telephone-consul"
              v-model.trim="saisieConsul.phone"
              type="text"
              :maxlength="LONGUEUR_TELEPHONE_MAX"
              class="w-full border border-gray-300 rounded-lg px-4 py-2.5 focus:outline-none focus:ring-2 focus:ring-primary/40 focus:border-primary"
            />
          </div>
        </div>

        <p v-if="erreurFormulaire" class="text-sm text-red-700" role="alert">
          {{ erreurFormulaire }}
        </p>

        <div class="flex justify-end gap-3 pt-2">
          <button
            type="button"
            class="px-4 py-2.5 text-gray-700 font-semibold"
            @click="consulOuvert = false"
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

    <p
      v-if="message"
      class="fixed bottom-6 right-6 bg-gray-900 text-white px-5 py-3 rounded-lg shadow-lg"
      role="status"
    >
      {{ message }}
    </p>
  </div>
</template>

<script setup lang="ts">
import { ref, reactive, onMounted } from 'vue'
import ListeOrdonnee from '../contenu/ListeOrdonnee.vue'
import Boite from '../contenu/Boite.vue'
import ChampImage from '../contenu/ChampImage.vue'
import { messageErreurContenu } from '@/api/contenu'
import {
  recupererAnnuaireAdmin,
  ajouterMembre,
  modifierMembre,
  supprimerMembre,
  ordonnerPersonnel,
  ajouterConsul,
  modifierConsul,
  supprimerConsul,
  ordonnerConsuls,
  ANNUAIRE_VIDE,
  LONGUEUR_TEXTE_MAX,
  LONGUEUR_TELEPHONE_MAX,
  LONGUEUR_ADRESSE_MAX,
  type Annuaire,
  type MembrePersonnel,
  type ConsulHonoraire,
} from '@/api/annuaire'

const annuaire = ref<Annuaire>({ ...ANNUAIRE_VIDE })
const chargement = ref(true)
const erreurChargement = ref('')
const enregistrement = ref(false)
const erreurFormulaire = ref('')
const message = ref('')

const membreOuvert = ref(false)
const membreEdite = ref<MembrePersonnel | null>(null)
const saisieMembre = reactive({ name: '', role: '', email: '', phone: '', image_url: '' })

const consulOuvert = ref(false)
const consulEdite = ref<ConsulHonoraire | null>(null)
const saisieConsul = reactive({ name: '', role: '', city: '', address: '', email: '', phone: '' })

function annoncer(texte: string): void {
  message.value = texte
  setTimeout(() => (message.value = ''), 3000)
}

async function charger(): Promise<void> {
  chargement.value = true
  erreurChargement.value = ''
  try {
    annuaire.value = await recupererAnnuaireAdmin()
  } catch (souleve) {
    erreurChargement.value = messageErreurContenu(souleve)
  } finally {
    chargement.value = false
  }
}

/**
 * Rejoue l'action puis recharge depuis le serveur.
 *
 * Recharger plutot que de modifier la copie locale garde l'ecran aligne sur
 * ce que le site public sert : l'ordre et les positions sont fixes cote
 * serveur, c'est sa version qui fait foi.
 */
async function agir(action: () => Promise<unknown>, succes: string): Promise<boolean> {
  enregistrement.value = true
  erreurFormulaire.value = ''
  try {
    await action()
    await charger()
    annoncer(succes)
    return true
  } catch (souleve) {
    erreurFormulaire.value = messageErreurContenu(souleve)
    return false
  } finally {
    enregistrement.value = false
  }
}

function ouvrirMembre(id: number | null): void {
  erreurFormulaire.value = ''
  const existant = annuaire.value.staff.find((m) => m.id === id) ?? null
  membreEdite.value = existant
  saisieMembre.name = existant?.name ?? ''
  saisieMembre.role = existant?.role ?? ''
  saisieMembre.email = existant?.email ?? ''
  saisieMembre.phone = existant?.phone ?? ''
  saisieMembre.image_url = existant?.image_url ?? ''
  membreOuvert.value = true
}

async function enregistrerMembre(): Promise<void> {
  if (saisieMembre.name === '' || saisieMembre.role === '') {
    erreurFormulaire.value = 'Le nom et la fonction sont obligatoires.'
    return
  }
  // Un champ facultatif vide part a `null`, ce qui l'efface au contrat ;
  // `name` et `role` ne partent jamais vides, le back repondrait 422.
  const corps = {
    name: saisieMembre.name,
    role: saisieMembre.role,
    email: saisieMembre.email === '' ? null : saisieMembre.email,
    phone: saisieMembre.phone === '' ? null : saisieMembre.phone,
    image_url: saisieMembre.image_url === '' ? null : saisieMembre.image_url,
  }
  const edite = membreEdite.value
  const fait = await agir(
    () => (edite ? modifierMembre(edite.id, corps) : ajouterMembre(corps)),
    edite ? 'Membre modifié.' : 'Membre ajouté.',
  )
  if (fait) membreOuvert.value = false
}

function ouvrirConsul(id: number | null): void {
  erreurFormulaire.value = ''
  const existant = annuaire.value.consuls.find((c) => c.id === id) ?? null
  consulEdite.value = existant
  saisieConsul.name = existant?.name ?? ''
  saisieConsul.role = existant?.role ?? ''
  saisieConsul.city = existant?.city ?? ''
  saisieConsul.address = existant?.address ?? ''
  saisieConsul.email = existant?.email ?? ''
  saisieConsul.phone = existant?.phone ?? ''
  consulOuvert.value = true
}

async function enregistrerConsul(): Promise<void> {
  if (saisieConsul.name === '' || saisieConsul.role === '' || saisieConsul.city === '') {
    erreurFormulaire.value = 'Le nom, la fonction et la ville sont obligatoires.'
    return
  }
  const corps = {
    name: saisieConsul.name,
    role: saisieConsul.role,
    city: saisieConsul.city,
    address: saisieConsul.address.trim() === '' ? null : saisieConsul.address,
    email: saisieConsul.email === '' ? null : saisieConsul.email,
    phone: saisieConsul.phone === '' ? null : saisieConsul.phone,
  }
  const edite = consulEdite.value
  const fait = await agir(
    () => (edite ? modifierConsul(edite.id, corps) : ajouterConsul(corps)),
    edite ? 'Consul modifié.' : 'Consul ajouté.',
  )
  if (fait) consulOuvert.value = false
}

async function retirer(bloc: 'staff' | 'consuls', id: number): Promise<void> {
  const retrait = bloc === 'staff' ? supprimerMembre : supprimerConsul
  await agir(() => retrait(id), 'Élément retiré.')
}

/** Déplace un élément d'un rang, et envoie l'ordre complet au serveur. */
async function deplacer(bloc: 'staff' | 'consuls', id: number, pas: -1 | 1): Promise<void> {
  const elements = annuaire.value[bloc]
  const index = elements.findIndex((e) => e.id === id)
  const cible = index + pas
  if (index === -1 || cible < 0 || cible >= elements.length) return

  const ids = elements.map((e) => e.id)
  ;[ids[index], ids[cible]] = [ids[cible]!, ids[index]!]

  const reordonner = bloc === 'staff' ? ordonnerPersonnel : ordonnerConsuls
  await agir(() => reordonner(ids), 'Ordre mis à jour.')
}

onMounted(charger)
</script>
