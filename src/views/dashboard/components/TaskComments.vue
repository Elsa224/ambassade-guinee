<template>
  <div class="min-h-screen bg-gray-50 p-6">
    <div class="max-w-4xl mx-auto">
      <!-- En-tête -->
      <div class="mb-8">
        <div class="flex justify-between items-center mb-4">
          <h1 class="text-3xl font-bold text-gray-900">Commentaires - Update liste</h1>
          <button
            @click="addComment"
            class="px-6 py-2 bg-primary text-white rounded-lg hover:bg-primary-dark transition-colors flex items-center gap-2"
          >
            <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 4v16m8-8H4"/>
            </svg>
            Ajouter un Commentaire
          </button>
        </div>

        <p class="text-gray-600 mb-4">Rechercher par contenu, auteur</p>

        <!-- Barre de recherche -->
        <div class="flex gap-4 mb-6">
          <input
            type="text"
            placeholder="Rechercher dans les commentaires..."
            class="flex-1 px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent"
            v-model="searchQuery"
          >
          <button class="px-6 py-2 bg-primary text-white rounded-lg hover:bg-primary-dark transition-colors">
            Filtrer
          </button>
        </div>
      </div>

      <!-- Liste des commentaires -->
      <div class="bg-white rounded-lg shadow overflow-hidden">
        <div class="p-6">
          <!-- Commentaire existant -->
          <div v-for="comment in filteredComments" :key="comment.id" class="mb-6 last:mb-0">
            <div class="flex gap-4">
              <!-- Avatar -->
              <div class="flex-shrink-0">
                <div class="w-10 h-10 bg-primary rounded-full flex items-center justify-center text-white font-semibold">
                  {{ getInitials(comment.author) }}
                </div>
              </div>

              <!-- Contenu du commentaire -->
              <div class="flex-1">
                <div class="flex items-center justify-between mb-2">
                  <div>
                    <span class="font-semibold text-gray-900">{{ comment.author }}</span>
                    <span class="text-gray-500 text-sm ml-2">{{ comment.date }}</span>
                  </div>
                  <div class="flex items-center gap-2">
                    <button
                      @click="editComment(comment.id)"
                      class="text-primary hover:text-primary-dark p-1 rounded transition-colors"
                      title="Modifier"
                    >
                      <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z"/>
                      </svg>
                    </button>
                    <button
                      @click="deleteComment(comment.id)"
                      class="text-red-600 hover:text-red-800 p-1 rounded transition-colors"
                      title="Supprimer"
                    >
                      <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"/>
                      </svg>
                    </button>
                  </div>
                </div>

                <p class="text-gray-700 mb-3">{{ comment.content }}</p>

                <!-- Actions du commentaire -->
                <div class="flex items-center gap-4 text-sm text-gray-500">
                  <button
                    @click="toggleLike(comment.id)"
                    class="flex items-center gap-1 hover:text-primary transition-colors"
                    :class="{ 'text-primary': comment.isLiked }"
                  >
                    <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M14 10h4.764a2 2 0 011.789 2.894l-3.5 7A2 2 0 0115.263 21h-4.017c-.163 0-.326-.02-.485-.06L7 20m7-10V5a2 2 0 00-2-2h-.095c-.5 0-.905.405-.905.905 0 .714-.211 1.412-.608 2.006L7 11v9m7-10h-2M7 20H5a2 2 0 01-2-2v-6a2 2 0 012-2h2.5"/>
                    </svg>
                    <span>{{ comment.likes }}</span>
                  </button>

                  <button
                    @click="toggleReply(comment.id)"
                    class="flex items-center gap-1 hover:text-primary transition-colors"
                  >
                    <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M3 10h10a8 8 0 018 8v2M3 10l6 6m-6-6l6-6"/>
                    </svg>
                    <span>Répondre</span>
                  </button>
                </div>

                <!-- Zone de réponse (si active) -->
                <div v-if="comment.showReply" class="mt-4 pl-4 border-l-2 border-gray-200">
                  <textarea
                    v-model="comment.replyText"
                    rows="2"
                    class="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent mb-2"
                    placeholder="Écrivez votre réponse..."
                  ></textarea>
                  <div class="flex justify-end gap-2">
                    <button
                      @click="cancelReply(comment.id)"
                      class="px-3 py-1 text-sm border border-gray-300 rounded text-gray-700 hover:bg-gray-50 transition-colors"
                    >
                      Annuler
                    </button>
                    <button
                      @click="submitReply(comment.id)"
                      class="px-3 py-1 text-sm bg-primary text-white rounded hover:bg-primary-dark transition-colors"
                    >
                      Répondre
                    </button>
                  </div>
                </div>

                <!-- Réponses -->
                <div v-if="comment.replies && comment.replies.length > 0" class="mt-4 space-y-3">
                  <div
                    v-for="reply in comment.replies"
                    :key="reply.id"
                    class="pl-4 border-l-2 border-gray-200"
                  >
                    <div class="flex gap-3">
                      <div class="flex-shrink-0">
                        <div class="w-8 h-8 bg-primary rounded-full flex items-center justify-center text-white text-xs font-semibold">
                          {{ getInitials(reply.author) }}
                        </div>
                      </div>
                      <div class="flex-1">
                        <div class="flex items-center justify-between mb-1">
                          <div>
                            <span class="font-medium text-gray-900 text-sm">{{ reply.author }}</span>
                            <span class="text-gray-500 text-xs ml-2">{{ reply.date }}</span>
                          </div>
                          <button
                            @click="deleteReply(comment.id, reply.id)"
                            class="text-red-500 hover:text-red-700 p-1 rounded transition-colors"
                          >
                            <svg class="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"/>
                            </svg>
                          </button>
                        </div>
                        <p class="text-gray-700 text-sm">{{ reply.content }}</p>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>

          <!-- Message si aucun commentaire -->
          <div v-if="filteredComments.length === 0" class="text-center py-8 text-gray-500">
            <svg class="w-12 h-12 mx-auto text-gray-400 mb-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z"/>
            </svg>
            <p>Aucun commentaire pour le moment.</p>
            <p class="text-sm">Soyez le premier à commenter cette tâche !</p>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, computed } from 'vue'
import { useRouter } from 'vue-router'

const router = useRouter()
const searchQuery = ref('')

const comments = ref([
  {
    id: 1,
    author: 'Employee Admin',
    date: '23/10/2025 14:30',
    content: 'La mise à jour de la liste des API a été complétée avec succès. Tous les endpoints sont maintenant fonctionnels.',
    likes: 3,
    isLiked: false,
    showReply: false,
    replyText: '',
    replies: [
      {
        id: 1,
        author: 'Master Admin',
        date: '23/10/2025 15:45',
        content: 'Excellent travail ! Les performances se sont améliorées.'
      }
    ]
  },
  {
    id: 2,
    author: 'Master Admin',
    date: '22/10/2025 09:15',
    content: 'N\'oubliez pas de tester tous les cas d\'utilisation avant le déploiement en production.',
    likes: 1,
    isLiked: true,
    showReply: false,
    replyText: '',
    replies: []
  },
  {
    id: 3,
    author: 'Employee Admin',
    date: '21/10/2025 16:20',
    content: 'J\'ai rencontré un problème avec l\'endpoint /users. Je travaille sur une solution.',
    likes: 0,
    isLiked: false,
    showReply: false,
    replyText: '',
    replies: [
      {
        id: 1,
        author: 'Master Admin',
        date: '21/10/2025 17:30',
        content: 'As-tu vérifié les logs d\'erreur ?'
      },
      {
        id: 2,
        author: 'Employee Admin',
        date: '22/10/2025 08:45',
        content: 'Oui, c\'était un problème de configuration CORS. Résolu maintenant.'
      }
    ]
  }
])

const filteredComments = computed(() => {
  if (!searchQuery.value) return comments.value
  return comments.value.filter(comment =>
    comment.content.toLowerCase().includes(searchQuery.value.toLowerCase()) ||
    comment.author.toLowerCase().includes(searchQuery.value.toLowerCase())
  )
})

const getInitials = (name) => {
  return name.split(' ').map(n => n[0]).join('').toUpperCase()
}

const addComment = () => {
  router.push({ name: 'AddComment', params: { id: router.currentRoute.value.params.id } })
}

const editComment = (commentId) => {
  router.push({ name: 'EditComment', params: { id: router.currentRoute.value.params.id, commentId } })
}

const deleteComment = (commentId) => {
  if (confirm('Êtes-vous sûr de vouloir supprimer ce commentaire ?')) {
    comments.value = comments.value.filter(comment => comment.id !== commentId)
  }
}

const deleteReply = (commentId, replyId) => {
  const comment = comments.value.find(c => c.id === commentId)
  if (comment && confirm('Êtes-vous sûr de vouloir supprimer cette réponse ?')) {
    comment.replies = comment.replies.filter(reply => reply.id !== replyId)
  }
}

const toggleLike = (commentId) => {
  const comment = comments.value.find(c => c.id === commentId)
  if (comment) {
    comment.isLiked = !comment.isLiked
    comment.likes += comment.isLiked ? 1 : -1
  }
}

const toggleReply = (commentId) => {
  const comment = comments.value.find(c => c.id === commentId)
  if (comment) {
    comment.showReply = !comment.showReply
    if (!comment.showReply) {
      comment.replyText = ''
    }
  }
}

const cancelReply = (commentId) => {
  const comment = comments.value.find(c => c.id === commentId)
  if (comment) {
    comment.showReply = false
    comment.replyText = ''
  }
}

const submitReply = (commentId) => {
  const comment = comments.value.find(c => c.id === commentId)
  if (comment && comment.replyText.trim()) {
    const newReply = {
      id: Date.now(),
      author: 'Utilisateur Actuel', // À remplacer par l'utilisateur connecté
      date: new Date().toLocaleString('fr-FR'),
      content: comment.replyText.trim()
    }

    if (!comment.replies) {
      comment.replies = []
    }

    comment.replies.push(newReply)
    comment.showReply = false
    comment.replyText = ''
  }
}
</script>
