<script setup lang="ts">
import { ref, computed, onMounted, onBeforeUnmount } from 'vue'
import { useRoute } from 'vue-router'
import {
  recupererEvenementAdmin,
  annulerEvenement,
  basculerPublication,
  recupererQrInscription,
  televerserLogo,
  recupererLogo,
  refusDuLogo,
  type EvenementAdmin,
  type QrInscription,
} from '@/api/evenements-admin'
import { messageErreur } from '@/api/evenements'
import { dateLisible, estAnnulable, etatDe, remplissage } from './presentation'
import {
  afficheEnJpeg,
  couleursDuTenant,
  dessinerAffiche,
  nomDeFichier,
  type DonneesAffiche,
} from './affiche-qr'
import { useIdentite } from '@/tenant/identite'
import PastilleEtat from '@/components/ui/PastilleEtat.vue'

/**
 * Fiche d'un evenement.
 *
 * C'est ici, et seulement ici, que les inscrits sont nommes. La liste n'en
 * affiche que le nombre : le nom, le courriel et l'identifiant sont des
 * donnees personnelles, et les deverser dans un tableau qu'on traverse pour
 * tout autre motif les expose sans qu'on l'ait voulu. Les ouvrir depuis la
 * fiche est un geste delibere.
 *
 * Le logo n'est jamais pose dans un `<img src>` direct : `logoUrl` est une
 * route locale qui exige le jeton porteur, qu'une image n'envoie pas.
 * L'apercu passe par `recupererLogo` puis une URL d'objet.
 */
const route = useRoute()
const { nomDeLAmbassade, logo: logoAmbassade } = useIdentite()

const evenement = ref<EvenementAdmin | null>(null)
const chargement = ref(true)
const erreur = ref('')
const filtre = ref('')

const slug = computed(() => String(route.params.slug ?? ''))

/**
 * Inscrits retenus par le filtre.
 *
 * Le filtre porte sur les trois champs : un agent cherche tantot un nom,
 * tantot le courriel qu'il a sous les yeux dans un courrier, tantot
 * l'identifiant qu'on lui a dicte.
 */
const inscrits = computed(() => {
  const liste = evenement.value?.participants ?? []
  const terme = filtre.value.trim().toLocaleLowerCase('fr')
  if (terme === '') return liste
  return liste.filter((participant) =>
    [participant.fullName, participant.email, participant.uidn].some((champ) =>
      champ.toLocaleLowerCase('fr').includes(terme),
    ),
  )
})

/**
 * Vrai quand le back sert la publication.
 *
 * Meme raison que dans la liste : `isPublished` vient du CMS et non
 * d'Ambassade Secure. Absent, la mention disparait plutot que d'annoncer
 * « non publie » a tort.
 */
const publicationConnue = computed(() => evenement.value?.isPublished !== undefined)

async function charger() {
  chargement.value = true
  erreur.value = ''
  try {
    evenement.value = await recupererEvenementAdmin(slug.value)
    // `logoUrl` non nul signale qu'un logo existe : on ne part chercher les
    // octets que dans ce cas, pour ne pas payer un 404 sur chaque fiche.
    if (evenement.value.logoUrl !== null) void chargerLogo()
  } catch (souleve) {
    erreur.value = messageErreur(souleve)
    evenement.value = null
  } finally {
    chargement.value = false
  }
}

/**
 * Une action est en cours.
 *
 * Un seul verrou pour les deux boutons : annuler et publier touchent le meme
 * evenement, et les laisser partir ensemble ferait arriver deux reponses dont
 * la derniere ecraserait la premiere.
 */
const action = ref(false)
const erreurAction = ref('')

async function agir(operation: () => Promise<EvenementAdmin>) {
  action.value = true
  erreurAction.value = ''
  try {
    evenement.value = await operation()
    // Depublier retire la page d'inscription : le QR affiche pointerait
    // vers une page morte. On le retire, il se redemande en un clic.
    qr.value = null
    erreurQr.value = ''
  } catch (souleve) {
    erreurAction.value = messageErreur(souleve)
  } finally {
    action.value = false
  }
}

/**
 * Annule l'evenement.
 *
 * Confirmation demandee : l'annulation est visible des inscrits et du site
 * public, et rien dans l'ecran ne permet de revenir en arriere d'un clic.
 */
function annuler() {
  if (!evenement.value) return
  const nom = evenement.value.name
  if (!window.confirm(`Annuler « ${nom} » ? Les inscrits pourront en être informés.`)) return
  void agir(() => annulerEvenement(slug.value))
}

function basculerSurLeSite() {
  if (!evenement.value) return
  const publie = evenement.value.isPublished === true
  void agir(() => basculerPublication(slug.value, !publie))
}

/** Un evenement deja annule ou termine ne s'annule pas une seconde fois. */
const annulable = computed(() => (evenement.value ? estAnnulable(evenement.value.status) : false))

/**
 * Le QR d'inscription, charge a la demande.
 *
 * Pas au montage : la plupart des visites de la fiche n'en ont pas besoin,
 * et la route rend 409 tant que l'evenement n'est pas publie. L'ecran ne
 * propose le geste que sur un evenement publie, mais le 409 reste traite :
 * la fiche peut etre depassee par une depublication faite ailleurs.
 */
const qr = ref<QrInscription | null>(null)
const qrChargement = ref(false)
const erreurQr = ref('')

async function chargerQr() {
  qrChargement.value = true
  erreurQr.value = ''
  try {
    qr.value = await recupererQrInscription(slug.value)
  } catch (souleve) {
    erreurQr.value = messageErreur(souleve)
  } finally {
    qrChargement.value = false
  }
}

/** Vrai un instant apres la copie, le temps de le dire. */
const adresseCopiee = ref(false)

async function copierAdresse() {
  if (!qr.value) return
  try {
    await navigator.clipboard.writeText(qr.value.registrationUrl)
    adresseCopiee.value = true
    setTimeout(() => (adresseCopiee.value = false), 2000)
  } catch {
    // Refus du navigateur (page non focalisee, permission) : l'adresse est
    // affichee en clair juste au-dessus, elle reste copiable a la main.
  }
}

/**
 * L'affiche d'inscription, composee une seule fois.
 *
 * Imprimer et partager partent de la MEME image : l'ancienne impression
 * fabriquait sa propre page — titre en sans-serif sur fond blanc, QR au
 * milieu — et un partage aurait fabrique la sienne. Deux rendus separes
 * auraient diverge des la premiere retouche.
 */
const affiche = ref(false)
const erreurAffiche = ref('')

function donneesDeLAffiche(): DonneesAffiche | null {
  const donnees = qr.value
  const actuel = evenement.value
  if (!donnees || !actuel) return null
  return {
    nomEvenement: actuel.name,
    dateLisible: dateLisible(actuel.date),
    heure: actuel.time,
    lieu: actuel.location,
    nomAmbassade: nomDeLAmbassade.value,
    urlInscription: donnees.registrationUrl,
    qr: donnees.qr,
    logo: logoAmbassade.value === '' ? undefined : logoAmbassade.value,
    couleurs: couleursDuTenant(),
  }
}

/**
 * Imprime l'affiche.
 *
 * Le document de la fenetre d'impression est construit par le DOM, jamais
 * par concatenation : le nom de l'evenement vient d'Ambassade Secure et n'a
 * pas a etre interprete comme du HTML.
 */
async function imprimerQr(): Promise<void> {
  const donnees = donneesDeLAffiche()
  if (!donnees || affiche.value) return
  affiche.value = true
  erreurAffiche.value = ''
  try {
    const canevas = await dessinerAffiche(donnees)
    const fenetre = window.open('', '_blank', 'width=720,height=960')
    if (!fenetre) {
      erreurAffiche.value =
        "La fenêtre d'impression a été bloquée par le navigateur. Autorisez les fenêtres surgissantes, ou partagez l'affiche en image."
      return
    }
    const doc = fenetre.document
    doc.title = `Inscription — ${donnees.nomEvenement}`
    const style = doc.createElement('style')
    // L'affiche est deja au format A4 : elle occupe la page entiere, sans
    // marge du navigateur qui ajouterait un liseré blanc a l'impression.
    style.textContent =
      '@page{size:A4 portrait;margin:0}' +
      'html,body{margin:0;padding:0}' +
      'img{display:block;width:100%;height:auto}'
    doc.head.appendChild(style)
    const image = doc.createElement('img')
    image.alt = "Affiche d'inscription"
    image.addEventListener('load', () => {
      fenetre.focus()
      fenetre.print()
    })
    image.src = canevas.toDataURL('image/png')
    doc.body.appendChild(image)
  } catch (souleve) {
    erreurAffiche.value =
      souleve instanceof Error ? souleve.message : "L'affiche n'a pas pu être composée."
  } finally {
    affiche.value = false
  }
}

/**
 * Partage l'affiche en JPEG.
 *
 * `navigator.share` avec un fichier ouvre directement WhatsApp, Signal ou
 * le courriel sur telephone, et c'est le geste attendu. Sur un ordinateur de
 * bureau, l'API n'existe le plus souvent pas : on retombe alors sur un
 * telechargement, que l'on glisse ensuite dans la conversation. Jamais de
 * message d'echec pour une fonction simplement absente.
 */
async function partagerQr(): Promise<void> {
  const donnees = donneesDeLAffiche()
  if (!donnees || affiche.value) return
  affiche.value = true
  erreurAffiche.value = ''
  try {
    const image = await afficheEnJpeg(donnees)
    const fichier = new File([image], nomDeFichier(donnees.nomEvenement), { type: 'image/jpeg' })

    if (navigator.canShare?.({ files: [fichier] })) {
      try {
        await navigator.share({ files: [fichier], title: donnees.nomEvenement })
        return
      } catch (souleve) {
        // L'utilisateur a ferme le panneau de partage : ce n'est pas un
        // echec, et surtout pas une raison de lui imposer un telechargement.
        if (souleve instanceof DOMException && souleve.name === 'AbortError') return
      }
    }

    const url = URL.createObjectURL(image)
    const lien = document.createElement('a')
    lien.href = url
    lien.download = fichier.name
    document.body.appendChild(lien)
    lien.click()
    lien.remove()
    URL.revokeObjectURL(url)
  } catch (souleve) {
    erreurAffiche.value =
      souleve instanceof Error ? souleve.message : "L'affiche n'a pas pu être composée."
  } finally {
    affiche.value = false
  }
}

/**
 * L'apercu du logo, en URL d'objet.
 *
 * La route admin du logo exige le jeton porteur : les octets arrivent par
 * `recupererLogo`, jamais par un `<img src>` direct. L'URL d'objet est
 * revoquee a chaque remplacement et au demontage.
 */
const logoObjet = ref<string | null>(null)
const logoEnvoi = ref(false)
const erreurLogo = ref('')
const selecteurLogo = ref<HTMLInputElement | null>(null)

async function chargerLogo() {
  try {
    const octets = await recupererLogo(slug.value)
    if (logoObjet.value) URL.revokeObjectURL(logoObjet.value)
    logoObjet.value = octets ? URL.createObjectURL(octets) : null
  } catch (souleve) {
    erreurLogo.value = messageErreur(souleve)
  }
}

function choisirLogo() {
  selecteurLogo.value?.click()
}

async function envoyerLogo(evenementDom: Event) {
  const champ = evenementDom.target as HTMLInputElement
  const fichier = champ.files?.[0]
  // Vide pour que rechoisir le meme fichier redeclenche `change`.
  champ.value = ''
  if (!fichier) return
  erreurLogo.value = ''
  const refus = refusDuLogo(fichier)
  if (refus) {
    erreurLogo.value = refus
    return
  }
  logoEnvoi.value = true
  try {
    await televerserLogo(slug.value, fichier)
    // L'apercu se relit depuis le serveur, pas depuis le fichier local :
    // c'est ce que le stockage sert reellement qui fait foi.
    await chargerLogo()
  } catch (souleve) {
    erreurLogo.value = messageErreur(souleve)
  } finally {
    logoEnvoi.value = false
  }
}

onBeforeUnmount(() => {
  if (logoObjet.value) URL.revokeObjectURL(logoObjet.value)
})

onMounted(charger)
</script>

<template>
  <div class="flex flex-col h-[calc(100vh-var(--hauteur-barre)-3rem)]">
    <RouterLink
      :to="{ name: 'evenements-admin' }"
      class="self-start text-sm text-gray-500 hover:text-primary-dark mb-4"
    >
      &larr; Tous les évènements
    </RouterLink>

    <p v-if="chargement" class="text-gray-500">Chargement de l'évènement…</p>

    <p
      v-else-if="erreur"
      class="bg-red-50 border border-red-200 text-red-800 rounded-xl px-4 py-3"
      role="alert"
    >
      {{ erreur }}
      <button type="button" class="ml-2 font-medium underline" @click="charger()">Réessayer</button>
    </p>

    <template v-else-if="evenement">
      <header class="mb-6 flex flex-wrap items-start justify-between gap-4">
        <div>
          <h2 class="text-2xl font-bold text-gray-800">{{ evenement.name }}</h2>
          <div class="flex flex-wrap items-center gap-1.5 mt-2">
            <PastilleEtat :libelle="etatDe(evenement).libelle" :ton="etatDe(evenement).ton" />
            <PastilleEtat
              v-if="evenement.registrationOpen"
              libelle="Inscriptions ouvertes"
              ton="neutre"
            />
            <PastilleEtat
              v-if="publicationConnue"
              :libelle="evenement.isPublished ? 'Publié sur le site' : 'Non publié'"
              :ton="evenement.isPublished ? 'positif' : 'eteint'"
            />
            <span v-if="evenement.typeLabel" class="text-sm text-gray-500">
              {{ evenement.typeLabel }}
            </span>
          </div>
        </div>

        <div class="flex items-center gap-2">
          <RouterLink
            :to="{ name: 'evenement-admin-modifier', params: { slug } }"
            class="bg-primary text-white font-medium px-4 py-2 rounded-lg hover:opacity-90"
          >
            Modifier
          </RouterLink>
          <RouterLink
            :to="{ name: 'evenement-admin-invites', params: { slug } }"
            class="border border-gray-300 text-gray-700 font-medium px-4 py-2 rounded-lg"
          >
            Ajouter des invités
          </RouterLink>
          <!-- La bascule ne s'affiche que si le back sert la publication :
               proposer « Publier » a un back qui ne sait pas la stocker
               promettrait une action sans effet. -->
          <button
            v-if="publicationConnue"
            type="button"
            :disabled="action"
            class="border border-gray-300 text-gray-700 font-medium px-4 py-2 rounded-lg disabled:opacity-60"
            @click="basculerSurLeSite"
          >
            {{ evenement.isPublished ? 'Retirer du site' : 'Publier sur le site' }}
          </button>
          <button
            v-if="annulable"
            type="button"
            :disabled="action"
            class="border border-red-200 text-red-700 font-medium px-4 py-2 rounded-lg disabled:opacity-60"
            @click="annuler"
          >
            Annuler l'évènement
          </button>
        </div>
      </header>

      <p
        v-if="erreurAction"
        class="bg-red-50 border border-red-200 text-red-800 rounded-xl px-4 py-3 mb-4"
        role="alert"
      >
        {{ erreurAction }}
      </p>

      <!-- `content-start` n'est pas cosmetique : la grille occupe la hauteur
           restante, et `align-content` vaut `stretch` par defaut. Sans lui,
           les rangees se partagent l'espace libre et un vide s'ouvre entre le
           detail et la liste des inscrits. -->
      <div
        class="min-h-0 flex-1 overflow-auto grid gap-6 lg:grid-cols-3 items-start content-start pb-2"
      >
        <!-- Le detail de l'evenement -->
        <section class="bg-white shadow-sm rounded-xl p-5 lg:col-span-2">
          <h3 class="text-sm font-semibold uppercase tracking-wide text-gray-500">Détail</h3>

          <dl class="mt-4 grid gap-4 sm:grid-cols-2">
            <div>
              <dt class="text-xs text-gray-500">Date</dt>
              <dd class="text-gray-800 tabular-nums">
                {{ dateLisible(evenement.date) }} à {{ evenement.time }}
              </dd>
            </div>
            <div>
              <dt class="text-xs text-gray-500">Lieu</dt>
              <dd class="text-gray-800">{{ evenement.location }}</dd>
            </div>
            <div>
              <dt class="text-xs text-gray-500">Clôture des inscriptions</dt>
              <dd class="text-gray-800 tabular-nums">
                {{
                  evenement.registrationDeadline
                    ? dateLisible(evenement.registrationDeadline)
                    : 'Non définie'
                }}
              </dd>
            </div>
            <div>
              <dt class="text-xs text-gray-500">Créé le</dt>
              <dd class="text-gray-800 tabular-nums">{{ dateLisible(evenement.createdAt) }}</dd>
            </div>
          </dl>

          <div v-if="evenement.description" class="mt-5 pt-5 border-t border-gray-100">
            <h4 class="text-xs text-gray-500">Description</h4>
            <!-- `whitespace-pre-line` respecte les retours a la ligne saisis
                 dans Ambassade Secure. Le texte n'est PAS du HTML : il est
                 interpole, jamais injecte. -->
            <p class="text-gray-700 mt-1 whitespace-pre-line">{{ evenement.description }}</p>
          </div>
        </section>

        <!-- L'etat des inscriptions -->
        <section class="bg-white shadow-sm rounded-xl p-5">
          <h3 class="text-sm font-semibold uppercase tracking-wide text-gray-500">Inscriptions</h3>

          <p class="mt-3 text-3xl font-bold text-gray-800 tabular-nums">
            {{ evenement.registeredCount
            }}<span v-if="evenement.capacity" class="text-lg font-medium text-gray-400">
              / {{ evenement.capacity }}</span
            >
          </p>

          <div
            v-if="evenement.capacity"
            class="mt-3 h-2 rounded-full bg-gray-100 overflow-hidden"
            aria-hidden="true"
          >
            <div
              class="h-full rounded-full"
              :class="remplissage(evenement) >= 100 ? 'bg-amber-500' : 'bg-primary'"
              :style="{ width: `${remplissage(evenement)}%` }"
            ></div>
          </div>

          <p class="text-sm text-gray-500 mt-2">
            <template v-if="evenement.spotsRemaining !== null">
              {{ evenement.spotsRemaining }} place{{
                evenement.spotsRemaining > 1 ? 's' : ''
              }}
              restante{{ evenement.spotsRemaining > 1 ? 's' : '' }}
            </template>
            <template v-else>Capacité non limitée</template>
          </p>
        </section>

        <!-- Le logo : les octets exigent le jeton, l'apercu passe par une URL d'objet -->
        <section class="bg-white shadow-sm rounded-xl p-5 lg:col-span-3">
          <h3 class="text-sm font-semibold uppercase tracking-wide text-gray-500">Logo</h3>

          <div class="mt-4 flex flex-wrap items-center gap-6">
            <img
              v-if="logoObjet"
              :src="logoObjet"
              alt="Logo de l'évènement"
              class="w-24 h-24 object-contain border border-gray-200 rounded-lg p-1 bg-white"
            />
            <p v-else class="text-sm text-gray-500">Aucun logo pour le moment.</p>

            <div class="space-y-2">
              <input
                ref="selecteurLogo"
                type="file"
                accept="image/png,image/jpeg,image/webp"
                class="hidden"
                @change="envoyerLogo"
              />
              <button
                type="button"
                :disabled="logoEnvoi"
                class="border border-gray-300 text-gray-700 text-sm font-medium px-3 py-1.5 rounded-lg disabled:opacity-60"
                @click="choisirLogo"
              >
                {{
                  logoEnvoi
                    ? 'Envoi du logo…'
                    : logoObjet
                      ? 'Remplacer le logo'
                      : 'Téléverser un logo'
                }}
              </button>
              <p class="text-xs text-gray-500">
                PNG, JPEG ou WebP, 2 Mo au maximum. Visible sur la carte publique de l'évènement.
              </p>
            </div>
          </div>

          <p
            v-if="erreurLogo"
            class="mt-3 bg-red-50 border border-red-200 text-red-800 rounded-xl px-4 py-3 text-sm"
            role="alert"
          >
            {{ erreurLogo }}
          </p>
        </section>

        <!-- Le QR d'inscription : la seule source de l'URL publique -->
        <section v-if="publicationConnue" class="bg-white shadow-sm rounded-xl p-5 lg:col-span-3">
          <h3 class="text-sm font-semibold uppercase tracking-wide text-gray-500">
            QR d'inscription
          </h3>

          <p v-if="!evenement.isPublished" class="mt-3 text-sm text-gray-500">
            Publiez l'évènement pour obtenir son QR d'inscription : avant publication, la page
            d'inscription n'existe pas.
          </p>

          <template v-else>
            <p v-if="qrChargement" class="mt-3 text-sm text-gray-500">Préparation du QR…</p>

            <p
              v-else-if="erreurQr"
              class="mt-3 bg-red-50 border border-red-200 text-red-800 rounded-xl px-4 py-3 text-sm"
              role="alert"
            >
              {{ erreurQr }}
              <button type="button" class="ml-2 font-medium underline" @click="chargerQr">
                Réessayer
              </button>
            </p>

            <div v-else-if="qr" class="mt-4 flex flex-wrap items-start gap-6">
              <img
                :src="qr.qr"
                alt="QR d'inscription"
                class="w-40 h-40 border border-gray-200 rounded-lg p-2 bg-white"
              />
              <div class="min-w-0 flex-1 space-y-3">
                <div>
                  <p class="text-xs text-gray-500">Adresse d'inscription</p>
                  <p class="text-sm text-gray-800 break-all select-all">
                    {{ qr.registrationUrl }}
                  </p>
                </div>
                <div class="flex flex-wrap items-center gap-2">
                  <button
                    type="button"
                    class="border border-gray-300 text-gray-700 text-sm font-medium px-3 py-1.5 rounded-lg"
                    @click="copierAdresse"
                  >
                    {{ adresseCopiee ? 'Adresse copiée' : "Copier l'adresse" }}
                  </button>
                  <button
                    type="button"
                    :disabled="affiche"
                    class="border border-gray-300 text-gray-700 text-sm font-medium px-3 py-1.5 rounded-lg disabled:opacity-60"
                    @click="imprimerQr"
                  >
                    {{ affiche ? 'Préparation…' : "Imprimer l'affiche" }}
                  </button>
                  <button
                    type="button"
                    :disabled="affiche"
                    class="border border-gray-300 text-gray-700 text-sm font-medium px-3 py-1.5 rounded-lg disabled:opacity-60"
                    @click="partagerQr"
                  >
                    {{ affiche ? 'Préparation…' : "Partager l'affiche" }}
                  </button>
                </div>
                <p
                  v-if="erreurAffiche"
                  class="text-sm text-red-700 bg-red-50 border border-red-200 rounded-lg px-3 py-2"
                  role="alert"
                >
                  {{ erreurAffiche }}
                </p>
                <p class="text-xs text-gray-500">
                  L'affiche porte les couleurs de l'ambassade. « Partager » l'envoie en JPEG vers
                  WhatsApp ou une autre messagerie, ou la télécharge sur ordinateur.
                </p>
              </div>
            </div>

            <button
              v-else
              type="button"
              class="mt-3 border border-gray-300 text-gray-700 text-sm font-medium px-3 py-1.5 rounded-lg"
              @click="chargerQr"
            >
              Afficher le QR d'inscription
            </button>
          </template>
        </section>

        <!-- Les inscrits : des donnees personnelles, nommees seulement ici -->
        <section class="bg-white shadow-sm rounded-xl lg:col-span-3 overflow-hidden">
          <div class="flex flex-wrap items-center justify-between gap-3 px-5 py-4">
            <div>
              <h3 class="text-sm font-semibold uppercase tracking-wide text-gray-500">Inscrits</h3>
              <p class="text-xs text-gray-500 mt-0.5">
                Données personnelles : à ne pas diffuser hors de l'ambassade.
              </p>
            </div>
            <!-- La feuille de presence vit sur sa propre page : pagination,
                 filtres et export y demandent plus de place que la fiche
                 n'en offre. -->
            <RouterLink
              :to="{ name: 'evenement-admin-presence', params: { slug } }"
              class="border border-gray-300 text-gray-700 text-sm font-medium px-3 py-1.5 rounded-lg"
            >
              Feuille de présence
            </RouterLink>
            <label v-if="evenement.participants.length > 0" class="text-sm">
              <span class="sr-only">Rechercher un inscrit</span>
              <input
                v-model="filtre"
                type="search"
                placeholder="Nom, courriel ou identifiant"
                class="w-64 max-w-full rounded-lg border border-gray-200 px-3 py-1.5 focus:outline-2 focus:outline-offset-2 focus:outline-primary"
              />
            </label>
          </div>

          <p v-if="evenement.participants.length === 0" class="px-5 pb-8 text-gray-500">
            Personne ne s'est encore inscrit.
          </p>

          <p v-else-if="inscrits.length === 0" class="px-5 pb-8 text-gray-500">
            Aucun inscrit ne correspond à « {{ filtre }} ».
          </p>

          <table v-else class="w-full text-left">
            <thead>
              <tr class="bg-gray-50">
                <th
                  class="border-y border-gray-200 px-5 py-3 text-xs font-semibold uppercase tracking-wide text-gray-500"
                  scope="col"
                >
                  Nom
                </th>
                <th
                  class="border-y border-gray-200 px-5 py-3 text-xs font-semibold uppercase tracking-wide text-gray-500"
                  scope="col"
                >
                  Courriel
                </th>
                <th
                  class="border-y border-gray-200 px-5 py-3 text-xs font-semibold uppercase tracking-wide text-gray-500"
                  scope="col"
                >
                  Identifiant
                </th>
              </tr>
            </thead>
            <tbody>
              <tr
                v-for="participant in inscrits"
                :key="participant.uidn"
                class="border-b border-gray-100 last:border-0"
              >
                <td class="px-5 py-3 text-gray-800">{{ participant.fullName }}</td>
                <td class="px-5 py-3 text-gray-600">
                  <a
                    :href="`mailto:${participant.email}`"
                    class="hover:text-primary hover:underline"
                  >
                    {{ participant.email }}
                  </a>
                </td>
                <td class="px-5 py-3 text-gray-500 tabular-nums">{{ participant.uidn }}</td>
              </tr>
            </tbody>
          </table>
        </section>
      </div>
    </template>
  </div>
</template>
