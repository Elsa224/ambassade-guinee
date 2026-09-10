<template>
  <div class="dashboard-container">
    <!-- En-tête -->
    <div class="mb-8">
      <h2 class="text-2xl font-bold text-gray-800">Bienvenue, Administrateur !</h2>
      <p class="text-gray-600 mt-1">Voici l'aperçu de votre plateforme</p>
    </div>

    <!-- Cartes de statistiques -->
    <div class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
      <!-- Carte Articles -->
      <div class="bg-white rounded-xl shadow-md p-6 hover:shadow-lg transition-all">
        <div class="flex items-center justify-between">
          <div>
            <p class="text-gray-500 text-sm">Articles</p>
            <p class="text-3xl font-bold text-gray-800">24</p>
            <div class="flex items-center gap-1 mt-2">
              <i class='bx bx-trending-up text-green-500'></i>
              <span class="text-green-600 text-xs">+12%</span>
            </div>
          </div>
          <div class="w-12 h-12 bg-primary/10 rounded-full flex items-center justify-center">
            <i class='bx bxs-news text-2xl text-primary'></i>
          </div>
        </div>
      </div>

      <!-- Carte Actualités -->
      <div class="bg-white rounded-xl shadow-md p-6 hover:shadow-lg transition-all">
        <div class="flex items-center justify-between">
          <div>
            <p class="text-gray-500 text-sm">Actualités</p>
            <p class="text-3xl font-bold text-gray-800">18</p>
            <div class="flex items-center gap-1 mt-2">
              <i class='bx bx-trending-up text-green-500'></i>
              <span class="text-green-600 text-xs">+5</span>
            </div>
          </div>
          <div class="w-12 h-12 bg-secondary/10 rounded-full flex items-center justify-center">
            <i class='bx bxs-megaphone text-2xl text-secondary'></i>
          </div>
        </div>
      </div>

      <!-- Carte Photos -->
      <div class="bg-white rounded-xl shadow-md p-6 hover:shadow-lg transition-all">
        <div class="flex items-center justify-between">
          <div>
            <p class="text-gray-500 text-sm">Photos</p>
            <p class="text-3xl font-bold text-gray-800">156</p>
            <div class="flex items-center gap-1 mt-2">
              <i class='bx bx-trending-up text-green-500'></i>
              <span class="text-green-600 text-xs">+8</span>
            </div>
          </div>
          <div class="w-12 h-12 bg-accent/10 rounded-full flex items-center justify-center">
            <i class='bx bxs-image text-2xl text-accent'></i>
          </div>
        </div>
      </div>

      <!-- Carte Utilisateurs -->
      <div class="bg-white rounded-xl shadow-md p-6 hover:shadow-lg transition-all">
        <div class="flex items-center justify-between">
          <div>
            <p class="text-gray-500 text-sm">Utilisateurs</p>
            <p class="text-3xl font-bold text-gray-800">8</p>
            <div class="flex items-center gap-1 mt-2">
              <i class='bx bx-trending-up text-green-500'></i>
              <span class="text-green-600 text-xs">+3</span>
            </div>
          </div>
          <div class="w-12 h-12 bg-blue-500/10 rounded-full flex items-center justify-center">
            <i class='bx bxs-user text-2xl text-blue-500'></i>
          </div>
        </div>
      </div>
    </div>

    <!-- Graphique simple en CSS -->
    <div class="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
      <div class="bg-white rounded-xl shadow-md p-6">
        <h3 class="font-semibold text-gray-800 mb-4">Statistiques hebdomadaires</h3>
        <div class="space-y-4">
          <div v-for="stat in statsHebdo" :key="stat.jour" class="space-y-1">
            <div class="flex justify-between text-sm">
              <span class="text-gray-600">{{ stat.jour }}</span>
              <span class="text-gray-800 font-medium">{{ stat.visites }}</span>
            </div>
            <div class="w-full bg-gray-200 rounded-full h-2">
              <div
                class="h-2 rounded-full transition-all duration-500"
                :class="stat.couleur"
                :style="{ width: `${(stat.visites / 350) * 100}%` }"
              ></div>
            </div>
          </div>
        </div>
      </div>

      <div class="bg-white rounded-xl shadow-md p-6">
        <h3 class="font-semibold text-gray-800 mb-4">Répartition du contenu</h3>
        <div class="space-y-4">
          <div>
            <div class="flex justify-between text-sm mb-1">
              <span class="text-gray-600">Articles</span>
              <span class="text-gray-800 font-medium">24 (38%)</span>
            </div>
            <div class="w-full bg-gray-200 rounded-full h-2">
              <div class="bg-primary h-2 rounded-full" style="width: 38%"></div>
            </div>
          </div>
          <div>
            <div class="flex justify-between text-sm mb-1">
              <span class="text-gray-600">Actualités</span>
              <span class="text-gray-800 font-medium">18 (29%)</span>
            </div>
            <div class="w-full bg-gray-200 rounded-full h-2">
              <div class="bg-secondary h-2 rounded-full" style="width: 29%"></div>
            </div>
          </div>
          <div>
            <div class="flex justify-between text-sm mb-1">
              <span class="text-gray-600">Photos</span>
              <span class="text-gray-800 font-medium">156 (33%)</span>
            </div>
            <div class="w-full bg-gray-200 rounded-full h-2">
              <div class="bg-accent h-2 rounded-full" style="width: 33%"></div>
            </div>
          </div>
        </div>
      </div>
    </div>

    <!-- Derniers contenus -->
    <div class="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
      <div class="bg-white rounded-xl shadow-md p-6">
        <div class="flex justify-between items-center mb-4">
          <h3 class="font-semibold text-gray-800">Derniers articles</h3>
          <router-link to="/admin/articles" class="text-sm text-primary hover:underline">Voir tous →</router-link>
        </div>
        <div class="space-y-3">
          <div v-for="article in derniersArticles" :key="article.id" class="flex gap-3 p-2 hover:bg-gray-50 rounded-lg cursor-pointer">
            <div class="w-10 h-10 bg-gray-200 rounded-lg flex items-center justify-center">
              <i class='bx bxs-file text-gray-500'></i>
            </div>
            <div class="flex-1">
              <p class="text-sm font-medium text-gray-800">{{ article.titre }}</p>
              <p class="text-xs text-gray-500">{{ article.date }}</p>
            </div>
            <span :class="['text-xs px-2 py-1 rounded-full', article.status === 'Publié' ? 'bg-green-100 text-green-600' : 'bg-yellow-100 text-yellow-600']">
              {{ article.status }}
            </span>
          </div>
        </div>
      </div>

      <div class="bg-white rounded-xl shadow-md p-6">
        <div class="flex justify-between items-center mb-4">
          <h3 class="font-semibold text-gray-800">Messages récents</h3>
          <router-link to="/admin/commentaires" class="text-sm text-primary hover:underline">Voir tous →</router-link>
        </div>
        <div class="space-y-3">
          <div v-for="msg in messagesRecents" :key="msg.id" class="flex gap-3 p-2 hover:bg-gray-50 rounded-lg">
            <div class="w-8 h-8 bg-blue-100 rounded-full flex items-center justify-center">
              <i class='bx bx-user text-blue-600'></i>
            </div>
            <div class="flex-1">
              <p class="text-sm font-medium text-gray-800">{{ msg.nom }}</p>
              <p class="text-xs text-gray-600">{{ msg.message }}</p>
              <p class="text-xs text-gray-400 mt-1">{{ msg.date }}</p>
            </div>
          </div>
        </div>
      </div>
    </div>

    <!-- Actions rapides -->
    <div class="bg-white rounded-xl shadow-md p-6">
      <h3 class="font-semibold text-gray-800 mb-4">Actions rapides</h3>
      <div class="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-4">
        <button @click="$router.push('/admin/articles')" class="p-4 text-center hover:bg-gray-50 rounded-lg transition-colors">
          <div class="bg-primary/10 p-3 rounded-full inline-block mb-2">
            <i class='bx bxs-news text-xl text-primary'></i>
          </div>
          <p class="text-xs font-medium">Nouvel article</p>
        </button>

        <button @click="$router.push('/admin/actualites')" class="p-4 text-center hover:bg-gray-50 rounded-lg transition-colors">
          <div class="bg-secondary/10 p-3 rounded-full inline-block mb-2">
            <i class='bx bxs-megaphone text-xl text-secondary'></i>
          </div>
          <p class="text-xs font-medium">Nouvelle actu</p>
        </button>

        <button @click="$router.push('/admin/photos')" class="p-4 text-center hover:bg-gray-50 rounded-lg transition-colors">
          <div class="bg-accent/10 p-3 rounded-full inline-block mb-2">
            <i class='bx bxs-image text-xl text-accent'></i>
          </div>
          <p class="text-xs font-medium">Ajouter photo</p>
        </button>

        <button @click="$router.push('/admin/categories')" class="p-4 text-center hover:bg-gray-50 rounded-lg transition-colors">
          <div class="bg-purple-500/10 p-3 rounded-full inline-block mb-2">
            <i class='bx bxs-category text-xl text-purple-500'></i>
          </div>
          <p class="text-xs font-medium">Catégorie</p>
        </button>

        <button class="p-4 text-center hover:bg-gray-50 rounded-lg transition-colors">
          <div class="bg-blue-500/10 p-3 rounded-full inline-block mb-2">
            <i class='bx bxs-user-plus text-xl text-blue-500'></i>
          </div>
          <p class="text-xs font-medium">Admin</p>
        </button>

        <router-link to="/admin/parametres" class="p-4 text-center hover:bg-gray-50 rounded-lg transition-colors block">
          <div class="bg-gray-500/10 p-3 rounded-full inline-block mb-2">
            <i class='bx bxs-cog text-xl text-gray-500'></i>
          </div>
          <p class="text-xs font-medium">Paramètres</p>
        </router-link>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref } from 'vue'

const statsHebdo = ref([
  { jour: 'Lundi', visites: 120, couleur: 'bg-primary' },
  { jour: 'Mardi', visites: 190, couleur: 'bg-primary' },
  { jour: 'Mercredi', visites: 170, couleur: 'bg-primary' },
  { jour: 'Jeudi', visites: 210, couleur: 'bg-primary' },
  { jour: 'Vendredi', visites: 250, couleur: 'bg-primary' },
  { jour: 'Samedi', visites: 300, couleur: 'bg-secondary' },
  { jour: 'Dimanche', visites: 280, couleur: 'bg-accent' }
])

const derniersArticles = ref([
  { id: 1, titre: 'Rencontre diplomatique à Washington', date: '15 Jan 2024', status: 'Publié' },
  { id: 2, titre: 'Nouveau partenariat avec le Costa Rica', date: '14 Jan 2024', status: 'Publié' },
  { id: 3, titre: 'Cérémonie à l\'ambassade', date: '12 Jan 2024', status: 'Brouillon' }
])

const messagesRecents = ref([
  { id: 1, nom: 'Marie Claire', message: 'Très intéressant cet article !', date: 'Il y a 2h' },
  { id: 2, nom: 'Paul Koné', message: 'Félicitations à toute l\'équipe', date: 'Hier' },
  { id: 3, nom: 'Jean Dupont', message: 'Quand aura lieu la prochaine cérémonie ?', date: 'Hier' }
])
</script>
