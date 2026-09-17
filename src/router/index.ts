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

import BientotDisponible from '@/components/BientotDisponible.vue'
import InscriptionEvenement from '@/views/evenements/InscriptionEvenement.vue'
import Evenements from '@/views/evenements/Evenements.vue'

// ===================== DASHBOARD =====================
// Pages principales (conteneurs avec <router-view>)
import Dashboard from '@/views/dashboard/Dashboard.vue'
import Articles from '@/views/dashboard/Articles.vue'
import AccueilContenu from '@/views/dashboard/contenu/AccueilContenu.vue'
import AnnuaireAdmin from '@/views/dashboard/annuaire/AnnuaireAdmin.vue'
import JoursFeriesAdmin from '@/views/dashboard/jours-feries/JoursFeriesAdmin.vue'

import ListeEvenementsAdmin from '@/views/dashboard/evenements/ListeEvenements.vue'
import FicheEvenementAdmin from '@/views/dashboard/evenements/FicheEvenement.vue'
import RacineEvenementsAdmin from '@/views/dashboard/evenements/RacineEvenements.vue'
import FormulaireEvenementAdmin from '@/views/dashboard/evenements/FormulaireEvenement.vue'
import FeuillePresenceAdmin from '@/views/dashboard/evenements/FeuillePresence.vue'
import AjoutInvitesAdmin from '@/views/dashboard/evenements/AjoutInvites.vue'

// Sous‑composants (enfants)
// Utilisateurs

// Scanner

// Événements

// Courriers

// Projets

// Tâches

// Carte

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
        { path: 'evenements', name: 'evenements', component: Evenements },
        // La carte d'un evenement porte deja son formulaire d'inscription :
        // plutot que deux URL au contenu identique, celle-ci renvoie vers
        // celle que le QR imprime, qui fait autorite.
        {
          path: 'evenements/:token',
          redirect: (destination) => `/evenements/inscription/${destination.params.token}`,
        },
        // Chemin impose par le QR d'inscription genere par le CMS
        // (SECURECHECK_REGISTRATION_PATH) : il doit correspondre exactement.
        {
          path: 'evenements/inscription/:token',
          name: 'inscription-evenement',
          component: InscriptionEvenement,
        },
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

        // La rubrique des services servie par le CMS. Elle ne remplace pas
        // `services-ambassadeur`, qui porte encore le texte en dur de
        // l'ambassade de Guinee aux Etats-Unis.
        {
          path: 'services',
          name: 'services',
          component: () => import('@/components/services/ServicesConsulaires.vue'),
        },
        {
          path: 'services/:slug',
          name: 'service-detail',
          component: () => import('@/components/services/ServiceDetail.vue'),
          props: true,
        },

        { path: 'consulat', name: 'consulat', component: Consulat },
        { path: 'rendez-vous', name: 'rendez-vous', component: RendezVous },
        { path: 'demarche-ligne', name: 'demarche-ligne', component: DemarcheLigne },

        { path: 'construction', name: 'construction', component: BientotDisponible },
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
        { path: 'contenu-accueil', name: 'contenu-accueil', component: AccueilContenu },
        {
          path: 'services',
          name: 'services-admin',
          component: () => import('@/views/dashboard/services/ServicesAdmin.vue'),
        },
        { path: 'annuaire', name: 'annuaire-admin', component: AnnuaireAdmin },
        {
          path: 'parametres',
          name: 'parametres-admin',
          component: () => import('@/views/dashboard/parametres/ParametresAdmin.vue'),
        },
        {
          // Le seul ecran du tableau de bord ouvert a tous les roles : un
          // compte qui ne peut pas changer son mot de passe est un compte
          // qu'on ne peut pas securiser.
          path: 'profil',
          name: 'mon-profil',
          component: () => import('@/views/dashboard/MonProfil.vue'),
        },
        { path: 'jours-feries', name: 'jours-feries-admin', component: JoursFeriesAdmin },
        {
          path: 'evenements',
          component: RacineEvenementsAdmin,
          children: [
            { path: '', name: 'evenements-admin', component: ListeEvenementsAdmin },
            // `nouveau` est declare avant `:slug` : l'ordre n'est pas ce qui
            // tranche — vue-router classe le segment fixe au-dessus du
            // parametre — mais le lire dans cet ordre evite de croire le
            // contraire en relisant.
            {
              path: 'nouveau',
              name: 'evenement-admin-nouveau',
              component: FormulaireEvenementAdmin,
            },
            { path: ':slug', name: 'evenement-admin', component: FicheEvenementAdmin },
            {
              path: ':slug/modifier',
              name: 'evenement-admin-modifier',
              component: FormulaireEvenementAdmin,
            },
            {
              path: ':slug/presence',
              name: 'evenement-admin-presence',
              component: FeuillePresenceAdmin,
            },
            {
              path: ':slug/invites',
              name: 'evenement-admin-invites',
              component: AjoutInvitesAdmin,
            },
          ],
        },

        // Les ecrans herites du fork SecureCheck — utilisateurs, scanner,
        // visiteurs, demandes, presence, cartes, courriers, taches, projets,
        // documents — ont ete RETIRES le 2026-09-17. Aucun ne faisait le
        // moindre appel API : ils affichaient des donnees ecrites en dur, des
        // utilisateurs et des presences qui n'ont jamais existe. Les laisser
        // atteignables par leur adresse, une fois sortis du menu, aurait garde
        // le defaut en n'en supprimant que la visibilite.
        //
        // Leurs composants restent dans le depot, sous `views/dashboard/`, en
        // matiere premiere pour les vrais ecrans : c'est la mise en page qui
        // vaut d'etre reprise, pas les donnees.
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
