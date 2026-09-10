import { createRouter, createWebHistory } from 'vue-router'
import { useAuthStore } from '@/stores/auth'

// Layouts
import Layout from '@/layouts/Layout.vue'
import DefautLayout from '@/layouts/DefautLayout.vue'

// Pages publiques
import Home from '@/views/Home.vue'

// Actualités
import Actualite from '@/views/Actualite.vue'
import ActualiteDetail from '@/views/ActualiteDetail.vue'
import ActualitesParCategorie from '@/components/actualites/ActualitesParCategorie.vue'

// Ambassade
import Presentation from '@/components/ambassade/Presentation.vue'
import Ambassadeur from '@/components/ambassade/Ambassadeur.vue'
import Chancellerie from '@/components/ambassade/Chancellerie.vue'
import ServicesAmbassadeur from '@/components/ambassade/ServicesAmbassade.vue'
import ConsulsHonoraires from '@/components/ambassade/ConsulsHonoraires.vue'
import Calendrier from '@/components/ambassade/Calendrier.vue'

// Relations bilatérales
import RelationsBilaterales from '@/views/RelationsBilaterales.vue'
import Usa from '@/components/relations/Usa.vue'
import CostaRica from '@/components/relations/CostaRica.vue'
import Haiti from '@/components/relations/Haiti.vue'
import Bahamas from '@/components/relations/Bahamas.vue'
import FondMonetaire from '@/components/relations/FondMonetaire.vue'

// Services
import Consulat from '@/components/services/Consulat.vue'
import RendezVous from '@/components/services/RendezVous.vue'
import DemarcheLigne from '@/components/services/DemarcheLigne.vue'

import Construction from '@/views/Construction.vue'

// ===================== DASHBOARD =====================
// Pages principales (conteneurs avec <router-view>)
import Dashboard from '@/views/dashboard/Dashboard.vue'
import Articles from '@/views/dashboard/Articles.vue'
import Actualites from '@/views/dashboard/Actualites.vue'
import Galerie from '@/views/dashboard/Galerie.vue'
import Nouvelles from '@/views/dashboard/Nouvelles.vue'

import Utilisateur from '@/views/dashboard/Utilisateur.vue'
import Scanner from '@/views/dashboard/Scanner.vue'
import Evenement from '@/views/dashboard/Evenement.vue'
import Visiteur from '@/views/dashboard/Visiteur.vue'
import Demande from '@/views/dashboard/Demande.vue'
import Presence from '@/views/dashboard/Presence.vue'
import Carte from '@/views/dashboard/Carte.vue'
import Courriers from '@/views/dashboard/Courriers.vue'
import Documents from '@/views/dashboard/Document.vue'
import Projets from '@/views/dashboard/Projet.vue'
import Taches from '@/views/dashboard/Taches.vue'
import Profile from '@/views/dashboard/Profile.vue'

// Sous‑composants (enfants)
// Utilisateurs
import AddUser from '@/views/dashboard/components/AddUser.vue'
import UserList from '@/views/dashboard/components/UserList.vue'

// Scanner
import ScannerQRCode from '@/views/dashboard/components/ScannerQRCode.vue'
import QRManuel from '@/views/dashboard/components/QRManuel.vue'
import ListeQRCode from '@/views/dashboard/components/ListeQRCode.vue'
import CreerQRCode from '@/views/dashboard/components/CreerQRCode.vue'

// Événements
import AjouterEvenement from '@/views/dashboard/components/AjouterEvenement.vue'
import ListeEvenement from '@/views/dashboard/components/ListeEvenement.vue'

// Courriers
import AjouterCourrier from '@/views/dashboard/components/AjouterCourrier.vue'
import ListeCourrier from '@/views/dashboard/components/ListeCourrier.vue'

// Projets
import ProjectList from '@/views/dashboard/components/ProjectList.vue'
import DocumentPreview from '@/views/dashboard/components/DocumentProjet.vue'
import EditProject from '@/views/dashboard/components/EditProject.vue'

// Tâches
import TaskList from '@/views/dashboard/components/TaskList.vue'
import EditTask from '@/views/dashboard/components/EditTask.vue'
import AddTimeEntry from '@/views/dashboard/components/AddTimeEntry.vue'
import TimeEntries from '@/views/dashboard/components/TimeEntries.vue'
import TaskComments from '@/views/dashboard/components/TaskComments.vue'
import AddComment from '@/views/dashboard/components/AddComment.vue'

// Carte
import CardList from '@/views/dashboard/components/CardList.vue'
import CreateCard from '@/views/dashboard/components/CreateCard.vue'

// ===================== ROUTES =====================
const router = createRouter({
  history: createWebHistory(),
  routes: [
    // ---------- SITE PUBLIC ----------
    {
      path: '/',
      component: Layout,
      children: [
        { path: '', name: 'home', component: Home },
        { path: 'actualite', name: 'actualite', component: Actualite },
        { path: 'actualites/:slug', name: 'actualite-detail', component: ActualiteDetail },
        // Les trois rubriques partagent le meme composant : seules la categorie
        // filtree et le sous-titre changent. Le slug passe ici doit exister
        // dans la taxonomie du CMS, c'est lui qui filtre la requete.
        {
          path: 'actualites-ambassade',
          name: 'actualites-ambassade',
          component: ActualitesParCategorie,
          props: { categorie: 'actualites-ambassade', sousTitre: "Actualités de l'Ambassade" },
        },
        {
          path: 'actualites-diplomatique',
          name: 'actualites-diplomatique',
          component: ActualitesParCategorie,
          props: { categorie: 'actualites-diplomatique', sousTitre: 'Actualités Diplomatiques' },
        },
        {
          path: 'actualites-gouvernementale',
          name: 'actualites-gouvernementale',
          component: ActualitesParCategorie,
          props: {
            categorie: 'actualites-gouvernementale',
            sousTitre: 'Actualités Gouvernementales',
          },
        },

        { path: 'presentation', name: 'presentation', component: Presentation },
        { path: 'ambassadeur', name: 'ambassadeur', component: Ambassadeur },
        { path: 'chancellerie', name: 'chancellerie', component: Chancellerie },
        {
          path: 'services-ambassadeur',
          name: 'services-ambassadeur',
          component: ServicesAmbassadeur,
        },
        { path: 'consuls-honoraires', name: 'consuls-honoraires', component: ConsulsHonoraires },
        { path: 'calendrier', name: 'calendrier', component: Calendrier },

        {
          path: 'relations-bilaterales',
          name: 'relations-bilaterales',
          component: RelationsBilaterales,
        },
        { path: 'usa', name: 'usa', component: Usa },
        { path: 'costa-rica', name: 'costa-rica', component: CostaRica },
        { path: 'haiti', name: 'haiti', component: Haiti },
        { path: 'bahamas', name: 'bahamas', component: Bahamas },
        { path: 'fond-monetaire', name: 'fond-monetaire', component: FondMonetaire },

        { path: 'consulat', name: 'consulat', component: Consulat },
        { path: 'rendez-vous', name: 'rendez-vous', component: RendezVous },
        { path: 'demarche-ligne', name: 'demarche-ligne', component: DemarcheLigne },

        { path: 'construction', name: 'construction', component: Construction },
      ],
    },

    // ---------- DASHBOARD (APP) ----------
    {
      path: '/dashboard',
      component: DefautLayout,
      children: [
        // --- GROUPE ADMIN ---
        { path: '', name: 'dashboard', component: Dashboard },
        { path: 'articles', name: 'articles', component: Articles },
        { path: 'actualites', name: 'actualites', component: Actualites },
        { path: 'galerie', name: 'galerie', component: Galerie },
        { path: 'nouvelles', name: 'nouvelles', component: Nouvelles },

        // --- GROUPE AMBASSADESECURE ---
        // Utilisateurs
        {
          path: 'utilisateurs',
          component: Utilisateur,
          redirect: '/dashboard/utilisateurs/liste',
          children: [
            { path: 'ajouter', name: 'AddUser', component: AddUser },
            { path: 'liste', name: 'UserList', component: UserList },
          ],
        },

        // Scanner QR Code
        {
          path: 'scanner',
          component: Scanner,
          redirect: '/dashboard/scanner/liste',
          children: [
            { path: 'liste', name: 'ListeQRCode', component: ListeQRCode },
            { path: 'scan', name: 'ScannerQRCode', component: ScannerQRCode },
            { path: 'manuel', name: 'QRManuel', component: QRManuel },
            { path: 'creer', name: 'CreerQRCode', component: CreerQRCode },
          ],
        },

        // Événements
        {
          path: 'evenement',
          component: Evenement,
          redirect: '/dashboard/evenement/liste',
          children: [
            { path: 'liste', name: 'ListeEvenement', component: ListeEvenement },
            { path: 'creer', name: 'AjouterEvenement', component: AjouterEvenement },
          ],
        },

        // Liste des visiteurs
        { path: 'visiteur', name: 'Visiteur', component: Visiteur },

        // Demandes
        { path: 'demande', name: 'Demande', component: Demande },

        // Liste de présence
        { path: 'presence', name: 'Presence', component: Presence },

        // Carte de membre
        {
          path: 'cartes',
          component: Carte,
          redirect: '/dashboard/cartes/liste',
          children: [
            { path: 'liste', name: 'CardList', component: CardList },
            { path: 'creer', name: 'CreateCard', component: CreateCard },
          ],
        },

        // Courriers
        {
          path: 'courriers',
          component: Courriers,
          redirect: '/dashboard/courriers/liste',
          children: [
            { path: 'ajouter', name: 'AjouterCourrier', component: AjouterCourrier },
            { path: 'liste', name: 'ListeCourrier', component: ListeCourrier },
          ],
        },

        // Tâches
        {
          path: 'taches',
          component: Taches,
          redirect: '/dashboard/taches/liste',
          children: [
            { path: 'liste', name: 'TaskList', component: TaskList },
            { path: 'ajouter', name: 'AddTask', component: EditTask },
            { path: 'editer/:id', name: 'EditTask', component: EditTask },
            { path: 'times/:id', name: 'TimeEntries', component: TimeEntries },
            { path: 'times/ajouter/:id', name: 'AddTimeEntry', component: AddTimeEntry },
            { path: 'commentaires/:id', name: 'TaskComments', component: TaskComments },
            { path: 'commentaires/ajouter/:id', name: 'AddComment', component: AddComment },
            {
              path: 'commentaires/editer/:id/:commentId',
              name: 'EditComment',
              component: AddComment,
            },
          ],
        },

        // Projets
        {
          path: 'projets',
          component: Projets,
          redirect: '/dashboard/projets/liste',
          children: [
            { path: 'liste', name: 'ProjectList', component: ProjectList },
            { path: 'document/:id', name: 'DocumentPreview', component: DocumentPreview },
            { path: 'editer/:id', name: 'EditProject', component: EditProject },
          ],
        },

        // Documents
        { path: 'documents', name: 'Documents', component: Documents },

        // Profil
        { path: 'profile', name: 'Profile', component: Profile },
      ],
    },

    // ---------- CONNEXION (sans layout) ----------
    {
      path: '/connexion',
      name: 'connexion',
      component: () => import('@/views/Connexion.vue'),
    },

    // Redirection 404 éventuelle (optionnelle)
    // { path: '/:pathMatch(.*)*', redirect: '/' }
  ],
})

/**
 * Garde d acces au back-office.
 * Le dashboard etait jusqu ici entierement ouvert : toute route sous
 * /dashboard exige desormais une session. La destination demandee est
 * conservee pour y revenir apres la connexion.
 */
router.beforeEach((destination) => {
  const auth = useAuthStore()
  const versDashboard =
    destination.path === '/dashboard' || destination.path.startsWith('/dashboard/')

  if (versDashboard && !auth.estAuthentifie) {
    return { path: '/connexion', query: { redirect: destination.fullPath } }
  }

  if (destination.path === '/connexion' && auth.estAuthentifie) {
    return { path: '/dashboard' }
  }

  return true
})

export default router
