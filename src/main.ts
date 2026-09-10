import { createApp } from 'vue'
import { createPinia } from 'pinia'
import App from './App.vue'
import router from './router'
import './style.css'
import 'boxicons/css/boxicons.min.css'
import { useTenantStore } from '@/stores/tenant'
import { useAuthStore } from '@/stores/auth'
import { setAuthToken, setUnauthorizedHandler } from '@/api/client'

const app = createApp(App)
const pinia = createPinia()

app.use(pinia)
app.use(router)

// Le jeton persiste est remis en place avant le premier garde de route.
useAuthStore(pinia).restaurerSession()

// Une réponse 401 signale une session expirée ou un jeton révoqué : on purge
// la session locale et on renvoie l'utilisateur se reconnecter, sans appel
// réseau supplémentaire vers un serveur qui vient déjà de nous rejeter.
setUnauthorizedHandler(() => {
  const auth = useAuthStore(pinia)
  auth.token = null
  setAuthToken(null)
  localStorage.removeItem('cms_token')
  auth.utilisateur = null
  void router.push('/connexion')
})

// La config du tenant est resolue avant le montage : le theme est ainsi
// applique des le premier rendu, sans transition de couleurs visible.
useTenantStore(pinia)
  .charger()
  .finally(() => {
    app.mount('#app')
  })
