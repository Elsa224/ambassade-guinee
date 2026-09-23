<template>
  <div>
    <header class="mb-6 flex flex-wrap items-start justify-between gap-4">
      <div>
        <h2 class="text-2xl font-bold text-gray-800">Utilisateurs</h2>
        <p class="text-gray-600 mt-1 max-w-3xl">
          Les comptes qui administrent le site de l'ambassade. Un
          <span class="font-medium">éditeur</span> publie le contenu ; un
          <span class="font-medium">administrateur</span> tient en plus les paramètres du poste et
          ces comptes.
        </p>
      </div>
      <button
        type="button"
        class="bg-primary hover:bg-primary-dark text-white font-semibold px-5 py-2.5 rounded-lg transition-colors shrink-0"
        @click="ouvrirCreation()"
      >
        <i class="bx bx-user-plus mr-1.5" aria-hidden="true"></i>
        Inviter un compte
      </button>
    </header>

    <!-- L'invitation emise, affichee jusqu'a ce qu'on la ferme : le lien est
         la seule chose que l'administrateur doit transmettre quand le courriel
         n'est pas parti, et il disparaitrait avec la boite modale. -->
    <section
      v-if="invitationEmise"
      class="mb-6 rounded-xl border border-sky-200 bg-sky-50 px-5 py-4"
      role="status"
    >
      <div class="flex items-start justify-between gap-4">
        <div class="min-w-0">
          <p class="font-semibold text-sky-900">
            {{
              invitationEmise.invitation.sent ? 'Invitation envoyée' : 'Invitation à transmettre'
            }}
          </p>
          <p class="text-sm text-sky-900/80 mt-1">
            <template v-if="invitationEmise.invitation.sent">
              Un courriel est parti à {{ invitationEmise.adresse }}.
            </template>
            <template v-else>
              Le courriel n'a pas pu partir. Transmettez ce lien à
              {{ invitationEmise.adresse }} vous-même.
            </template>
            <template v-if="expirationLisible">
              Le lien reste valable jusqu'au {{ expirationLisible }}.
            </template>
          </p>
          <div v-if="invitationEmise.invitation.url" class="mt-3 flex flex-wrap items-center gap-2">
            <code
              class="block max-w-full truncate rounded-lg border border-sky-200 bg-white px-3 py-2 text-xs text-gray-700"
              >{{ invitationEmise.invitation.url }}</code
            >
            <button
              type="button"
              class="rounded-lg border border-sky-300 bg-white px-3 py-2 text-sm font-medium text-sky-900 hover:bg-sky-100"
              @click="copierLien(invitationEmise.invitation.url)"
            >
              {{ lienCopie ? 'Copié' : 'Copier le lien' }}
            </button>
          </div>
        </div>
        <button
          type="button"
          class="p-1 rounded-full text-sky-700 hover:bg-sky-100 shrink-0"
          aria-label="Fermer"
          @click="invitationEmise = null"
        >
          <i class="bx bx-x text-2xl" aria-hidden="true"></i>
        </button>
      </div>
    </section>

    <!-- L'echec d'une action ne remplace pas le tableau : suspendre un compte
         peut echouer — le dernier administrateur actif, par exemple — et la
         liste doit rester lisible pour montrer ce qui est refuse. -->
    <p
      v-if="erreurAction"
      class="mb-6 rounded-xl border border-amber-200 bg-amber-50 px-4 py-3 text-amber-900"
      role="alert"
    >
      {{ erreurAction }}
    </p>

    <!-- Un echec de LECTURE, lui, n'est jamais rendu en « Aucun compte » : une liste vide est
         une affirmation, et le compte de la personne connectee y figure
         toujours. Dire « aucun » quand on n'a rien pu lire ferait passer une
         panne pour un fait. -->
    <div
      v-if="erreurChargement"
      class="rounded-xl border border-red-200 bg-red-50 px-5 py-4 text-red-800"
      role="alert"
    >
      <p>{{ erreurChargement }}</p>
      <button type="button" class="mt-3 font-semibold underline" @click="recharger()">
        Réessayer
      </button>
    </div>

    <p v-else-if="chargement" class="text-gray-500 py-20 text-center">Chargement des comptes…</p>

    <div v-else-if="comptes.length === 0" class="rounded-xl bg-white p-10 text-center shadow-sm">
      <p class="text-gray-600">Aucun compte ne figure dans cette liste.</p>
    </div>

    <div v-else class="overflow-hidden rounded-xl bg-white shadow-sm">
      <div class="overflow-x-auto">
        <table class="w-full text-left">
          <thead
            class="border-b border-gray-200 bg-gray-50 text-xs font-semibold uppercase tracking-wide text-gray-500"
          >
            <tr>
              <th scope="col" class="px-5 py-3">Nom</th>
              <th scope="col" class="px-5 py-3">Rôle</th>
              <th scope="col" class="px-5 py-3">État</th>
              <th scope="col" class="px-5 py-3">Dernière connexion</th>
              <th scope="col" class="px-5 py-3 text-right">Actions</th>
            </tr>
          </thead>
          <tbody class="divide-y divide-gray-100">
            <tr v-for="compte in comptes" :key="compte.id" class="hover:bg-gray-50">
              <td class="px-5 py-4">
                <p class="font-semibold text-gray-800">
                  {{ compte.name }}
                  <span
                    v-if="estMoi(compte)"
                    class="ml-1.5 rounded-full bg-gray-100 px-2 py-0.5 text-xs font-medium text-gray-600"
                    >vous</span
                  >
                </p>
                <p class="text-sm text-gray-600">{{ compte.email }}</p>
              </td>
              <td class="px-5 py-4 text-sm text-gray-700">{{ libelleRole(compte.role) }}</td>
              <td class="px-5 py-4">
                <PastilleEtat
                  :libelle="etatDuCompte(compte.status).libelle"
                  :ton="etatDuCompte(compte.status).ton"
                />
              </td>
              <!-- « Jamais connecté » est un fait, pas une deduction : le back
                   sert `last_login_at` a null tant que l'invitation n'a pas ete
                   honoree. Il ne dit pas si un compte suspendu l'a ete par
                   decision ou parce qu'il vient d'etre cree — `suspended_at`
                   n'est pas servi — et l'ecran n'essaie pas de le deviner. -->
              <td class="px-5 py-4 text-sm text-gray-600">
                {{ dateLisible(compte.last_login_at) ?? 'Jamais connecté' }}
              </td>
              <td class="px-5 py-4">
                <div class="flex items-center justify-end gap-1">
                  <button
                    type="button"
                    class="rounded-lg p-2 text-gray-500 hover:bg-gray-100 hover:text-primary-dark"
                    :aria-label="`Modifier ${compte.name}`"
                    @click="ouvrirModification(compte)"
                  >
                    <i class="bx bx-edit text-lg" aria-hidden="true"></i>
                  </button>
                  <button
                    v-if="compte.status === STATUT_SUSPENDU"
                    type="button"
                    :disabled="enCours"
                    class="rounded-lg p-2 text-gray-500 hover:bg-gray-100 hover:text-primary-dark disabled:opacity-50"
                    :aria-label="`Renvoyer l'invitation à ${compte.name}`"
                    @click="renvoyer(compte)"
                  >
                    <i class="bx bx-mail-send text-lg" aria-hidden="true"></i>
                  </button>
                  <!-- Les deux gestes que le back refuse sur son propre compte
                       — suspension et suppression — sont retires de la ligne
                       plutot que proposes puis refuses : c'est le seul refus
                       que le front peut trancher avec certitude, en comparant
                       deux identifiants. Le refus du DERNIER administrateur,
                       lui, n'est pas calcule ici : la liste est paginee, donc
                       le compter sur une page pourrait se tromper. Le serveur
                       le refuse, et son message s'affiche. -->
                  <template v-if="!estMoi(compte)">
                    <button
                      type="button"
                      :disabled="enCours"
                      class="rounded-lg p-2 text-gray-500 hover:bg-gray-100 hover:text-amber-700 disabled:opacity-50"
                      :aria-label="
                        compte.status === STATUT_SUSPENDU
                          ? `Réactiver ${compte.name}`
                          : `Suspendre ${compte.name}`
                      "
                      @click="demander(compte, 'statut')"
                    >
                      <i
                        :class="
                          compte.status === STATUT_SUSPENDU ? 'bx bx-user-check' : 'bx bx-user-x'
                        "
                        class="text-lg"
                        aria-hidden="true"
                      ></i>
                    </button>
                    <button
                      type="button"
                      :disabled="enCours"
                      class="rounded-lg p-2 text-gray-500 hover:bg-gray-100 hover:text-red-700 disabled:opacity-50"
                      :aria-label="`Supprimer ${compte.name}`"
                      @click="demander(compte, 'suppression')"
                    >
                      <i class="bx bx-trash text-lg" aria-hidden="true"></i>
                    </button>
                  </template>
                </div>
              </td>
            </tr>
          </tbody>
        </table>
      </div>

      <Pagination
        v-if="pagination.totalPages > 1"
        :pagination="pagination"
        :desactive="chargement"
        libelle-vide="Aucun compte"
        @page="allerALaPage"
        @limite="changerLignes"
      />
    </div>

    <!-- Formulaire d'invitation ou de modification -->
    <Boite
      v-if="formulaireOuvert"
      :titre="compteEdite ? 'Modifier le compte' : 'Inviter un compte'"
      @fermer="fermerFormulaire"
    >
      <form class="space-y-5" @submit.prevent="enregistrer">
        <div>
          <label for="nom-compte" class="mb-1.5 block text-sm font-medium text-gray-700">
            Nom <span class="text-red-600" aria-hidden="true">*</span>
          </label>
          <input
            id="nom-compte"
            v-model.trim="saisie.name"
            type="text"
            :maxlength="LONGUEUR_NOM_MAX"
            class="w-full rounded-lg border border-gray-300 px-4 py-2.5 focus:border-primary focus:ring-2 focus:ring-primary/40 focus:outline-none"
          />
        </div>

        <div>
          <label for="email-compte" class="mb-1.5 block text-sm font-medium text-gray-700">
            Adresse électronique <span class="text-red-600" aria-hidden="true">*</span>
          </label>
          <input
            id="email-compte"
            v-model.trim="saisie.email"
            type="email"
            :maxlength="LONGUEUR_EMAIL_MAX"
            class="w-full rounded-lg border border-gray-300 px-4 py-2.5 focus:border-primary focus:ring-2 focus:ring-primary/40 focus:outline-none"
          />
          <p class="mt-1.5 text-xs text-gray-500">
            C'est son identifiant de connexion, et l'adresse à laquelle part l'invitation.
          </p>
        </div>

        <div>
          <label for="role-compte" class="mb-1.5 block text-sm font-medium text-gray-700">
            Rôle
          </label>
          <ChampSelect
            id="role-compte"
            v-model="saisie.role"
            :options="optionsDeRole"
            :desactive="roleVerrouille"
          />
          <p class="mt-1.5 text-xs text-gray-500">
            {{ roleVerrouille ? REFUS_PROPRE_ROLE : resumeDuRole }}
          </p>
        </div>

        <!-- L'effet est annonce AVANT le bouton : une invitation qui part sans
             qu'on l'ait dit se lit comme une fuite, et un lien qu'on attend
             dans sa boite se cherche moins longtemps. -->
        <p v-if="!compteEdite" class="rounded-lg bg-gray-50 px-4 py-3 text-sm text-gray-600">
          Aucun mot de passe ne se choisit ici : un courriel d'invitation part à cette adresse, et
          la personne pose elle-même son mot de passe. Le compte reste suspendu jusque-là.
        </p>

        <p v-if="erreurFormulaire" class="text-sm text-red-700" role="alert">
          {{ erreurFormulaire }}
        </p>

        <div class="flex justify-end gap-3 pt-2">
          <button
            type="button"
            class="px-4 py-2.5 font-semibold text-gray-700"
            @click="fermerFormulaire"
          >
            Annuler
          </button>
          <button
            type="submit"
            :disabled="enregistrement"
            class="rounded-lg bg-primary px-5 py-2.5 font-semibold text-white transition-colors hover:bg-primary-dark disabled:opacity-60"
          >
            {{ libelleDuBouton }}
          </button>
        </div>
      </form>
    </Boite>

    <Confirmation
      v-if="aConfirmer"
      :titre="questionDeConfirmation.titre"
      :question="questionDeConfirmation.question"
      :consequence="questionDeConfirmation.consequence"
      :libelle-confirmer="questionDeConfirmation.libelle"
      :dangereux="aConfirmer.geste === 'suppression'"
      :en-cours="enCours"
      @confirmer="confirmer"
      @fermer="aConfirmer = null"
    />
  </div>
</template>

<script setup lang="ts">
import { computed, onMounted, ref } from 'vue'
import { useAuthStore } from '@/stores/auth'
import Boite from '@/views/dashboard/contenu/Boite.vue'
import ChampSelect from '@/components/ui/ChampSelect.vue'
import PastilleEtat from '@/components/ui/PastilleEtat.vue'
import Confirmation from '@/components/ui/Confirmation.vue'
import Pagination from '@/components/ui/Pagination.vue'
import type { Pagination as FormePagination } from '@/components/ui/pagination'
import { dateLisible, libelleRole, messageErreurCompte } from '@/api/compte'
import {
  changerStatutCompte,
  creerCompte,
  etatDuCompte,
  listerComptes,
  modifierCompteAdmin,
  renvoyerInvitation,
  ROLES_ATTRIBUABLES,
  STATUT_ACTIF,
  STATUT_SUSPENDU,
  supprimerCompte,
  type CompteAdmin,
  type Invitation,
} from '@/api/utilisateurs'

/**
 * Les comptes de l'ambassade.
 *
 * Il remplace deux ecrans herites du fork SecureCheck, retires le
 * 2026-09-17 : `UserList.vue`, qui etait un pointage de presence avec un
 * selecteur d'annee ecrit en dur, et `AddUser.vue`, un formulaire sans
 * `submit` dont le champ « Role » etait une saisie de texte libre. Aucun des
 * deux n'appelait d'API.
 *
 * La garde de role qui masque cette page est cosmetique : `role.admin` refuse
 * la surface entiere en 403, lecture comprise. La liste des adresses de ses
 * collegues n'est pas du contenu.
 */

/** Bornes du back : `max:191` sur le nom, `max:255` sur l'adresse. */
const LONGUEUR_NOM_MAX = 191
const LONGUEUR_EMAIL_MAX = 255

/** Le refus du back, mot pour mot, sur son propre role. */
const REFUS_PROPRE_ROLE = 'Vous ne pouvez pas modifier votre propre compte ici.'

const auth = useAuthStore()

const comptes = ref<CompteAdmin[]>([])
const chargement = ref(true)
/** Echec de la LECTURE : il remplace le tableau, qu'on n'a pas. */
const erreurChargement = ref<string | null>(null)
/** Echec d'une ACTION : il s'affiche au-dessus du tableau, qui reste lisible. */
const erreurAction = ref<string | null>(null)
const enCours = ref(false)

const page = ref(1)
const lignes = ref(20)
const total = ref(0)
const totalPages = ref(1)

const pagination = computed<FormePagination>(() => ({
  page: page.value,
  limit: lignes.value,
  total: total.value,
  totalPages: totalPages.value,
}))

const formulaireOuvert = ref(false)
const compteEdite = ref<CompteAdmin | null>(null)
const saisie = ref<{ name: string; email: string; role: string }>({
  name: '',
  email: '',
  role: 'editeur',
})
const erreurFormulaire = ref<string | null>(null)
const enregistrement = ref(false)

const invitationEmise = ref<{ adresse: string; invitation: Invitation } | null>(null)
const lienCopie = ref(false)

const optionsDeRole = ROLES_ATTRIBUABLES.map((role) => ({
  valeur: role.valeur,
  libelle: role.libelle,
}))

const resumeDuRole = computed(
  () => ROLES_ATTRIBUABLES.find((role) => role.valeur === saisie.value.role)?.resume ?? '',
)

/** Son propre compte : le seul refus du back que le front sait trancher. */
function estMoi(compte: CompteAdmin): boolean {
  return auth.utilisateur?.id === compte.id
}

const roleVerrouille = computed(() => compteEdite.value !== null && estMoi(compteEdite.value))

const libelleDuBouton = computed(() => {
  if (enregistrement.value) return 'Enregistrement…'
  return compteEdite.value ? 'Enregistrer' : "Envoyer l'invitation"
})

const expirationLisible = computed(() =>
  dateLisible(invitationEmise.value?.invitation.expires_at ?? null),
)

async function charger(): Promise<void> {
  chargement.value = true
  erreurChargement.value = null
  try {
    const reponse = await listerComptes(page.value, lignes.value)
    comptes.value = reponse.comptes
    page.value = reponse.meta.current_page
    lignes.value = reponse.meta.per_page
    total.value = reponse.meta.total
    totalPages.value = reponse.meta.last_page
  } catch (souleve) {
    erreurChargement.value = messageErreurCompte(souleve)
    comptes.value = []
  } finally {
    chargement.value = false
  }
}

function recharger(): void {
  void charger()
}

function allerALaPage(numero: number): void {
  page.value = numero
  void charger()
}

/** Changer le nombre de lignes ramene en page 1 : la page courante peut ne plus exister. */
function changerLignes(nombre: number): void {
  lignes.value = nombre
  page.value = 1
  void charger()
}

function ouvrirCreation(): void {
  compteEdite.value = null
  saisie.value = { name: '', email: '', role: 'editeur' }
  erreurFormulaire.value = null
  formulaireOuvert.value = true
}

function ouvrirModification(compte: CompteAdmin): void {
  compteEdite.value = compte
  saisie.value = { name: compte.name, email: compte.email, role: compte.role }
  erreurFormulaire.value = null
  formulaireOuvert.value = true
}

function fermerFormulaire(): void {
  formulaireOuvert.value = false
}

/**
 * Enregistre la creation ou la modification.
 *
 * Aucune regle de validation n'est inventee ici : le back verifie le nom,
 * l'adresse, son unicite et le role, et il sert un message francais
 * directement presentable. Un ecran herite du gabarit verifiait « au moins
 * 6 caracteres » en dur dans un formulaire qui n'envoyait rien.
 */
async function enregistrer(): Promise<void> {
  enregistrement.value = true
  erreurFormulaire.value = null
  try {
    const edite = compteEdite.value
    if (edite === null) {
      const resultat = await creerCompte({
        name: saisie.value.name,
        email: saisie.value.email,
        role: saisie.value.role,
      })
      annoncerInvitation(resultat.compte.email, resultat.invitation)
    } else {
      // Le role n'est envoye que s'il change : l'envoyer a l'identique sur son
      // propre compte suffirait a declencher le refus du back, qui garde toute
      // modification de role sur le compte courant.
      const resultat = await modifierCompteAdmin(edite.id, {
        name: saisie.value.name,
        email: saisie.value.email,
        ...(saisie.value.role === edite.role ? {} : { role: saisie.value.role }),
      })
      annoncerInvitation(resultat.compte.email, resultat.invitation)
    }
    formulaireOuvert.value = false
    await charger()
  } catch (souleve) {
    erreurFormulaire.value = messageErreurCompte(souleve)
  } finally {
    enregistrement.value = false
  }
}

function annoncerInvitation(adresse: string, invitation: Invitation | undefined): void {
  if (invitation === undefined) return
  invitationEmise.value = { adresse, invitation }
  lienCopie.value = false
}

async function renvoyer(compte: CompteAdmin): Promise<void> {
  enCours.value = true
  erreurAction.value = null
  try {
    const resultat = await renvoyerInvitation(compte.id)
    annoncerInvitation(resultat.compte.email, resultat.invitation)
  } catch (souleve) {
    erreurAction.value = messageErreurCompte(souleve)
  } finally {
    enCours.value = false
    aConfirmer.value = null
  }
}

/**
 * Le geste soumis a confirmation, et sur quel compte.
 *
 * Un seul porteur pour les deux gestes : ils ne peuvent pas etre demandes en
 * meme temps, et deux drapeaux separes finiraient par se contredire.
 */
const aConfirmer = ref<{ compte: CompteAdmin; geste: 'statut' | 'suppression' } | null>(null)

/** La question posee, qui depend du geste ET de l'etat du compte. */
const questionDeConfirmation = computed(() => {
  const demande = aConfirmer.value
  if (!demande) return { titre: '', question: '', consequence: '', libelle: '' }
  const { compte, geste } = demande

  if (geste === 'suppression') {
    return {
      titre: 'Supprimer ce compte',
      question: `Supprimer définitivement le compte de ${compte.name} ?`,
      consequence:
        "Pour un agent qui s'absente, la suspension est réversible ; la suppression ne l'est pas.",
      libelle: 'Supprimer',
    }
  }

  return compte.status !== STATUT_SUSPENDU
    ? {
        titre: 'Suspendre ce compte',
        question: `Suspendre ${compte.name} ?`,
        consequence:
          'Ses sessions ouvertes sont fermées sur-le-champ, et son invitation en attente cesse de valoir.',
        libelle: 'Suspendre',
      }
    : {
        titre: 'Réactiver ce compte',
        question: `Réactiver ${compte.name} ?`,
        consequence:
          "Un compte qui n'a jamais posé de mot de passe aura besoin d'une nouvelle invitation.",
        libelle: 'Réactiver',
      }
})

function demander(compte: CompteAdmin, geste: 'statut' | 'suppression'): void {
  if (enCours.value) return
  aConfirmer.value = { compte, geste }
}

function confirmer(): void {
  const demande = aConfirmer.value
  if (!demande) return
  void (demande.geste === 'suppression'
    ? supprimer(demande.compte)
    : basculerStatut(demande.compte))
}

async function basculerStatut(compte: CompteAdmin): Promise<void> {
  const suspendre = compte.status !== STATUT_SUSPENDU

  enCours.value = true
  erreurAction.value = null
  try {
    await changerStatutCompte(compte.id, suspendre ? STATUT_SUSPENDU : STATUT_ACTIF)
    await charger()
  } catch (souleve) {
    erreurAction.value = messageErreurCompte(souleve)
  } finally {
    enCours.value = false
    aConfirmer.value = null
  }
}

async function supprimer(compte: CompteAdmin): Promise<void> {
  enCours.value = true
  erreurAction.value = null
  try {
    await supprimerCompte(compte.id)
    await charger()
  } catch (souleve) {
    erreurAction.value = messageErreurCompte(souleve)
  } finally {
    enCours.value = false
    aConfirmer.value = null
  }
}

/**
 * Copie le lien d'invitation.
 *
 * `navigator.clipboard` n'existe pas partout, et il echoue hors contexte
 * securise : l'echec ne dit rien de plus qu'un « Copié » qui n'aurait rien
 * copie, et le lien reste selectionnable a la main.
 */
async function copierLien(url: string): Promise<void> {
  try {
    await navigator.clipboard.writeText(url)
    lienCopie.value = true
  } catch {
    lienCopie.value = false
  }
}

onMounted(() => {
  void charger()
})
</script>
