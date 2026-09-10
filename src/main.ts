import { createApp } from 'vue'
import { createPinia } from 'pinia'
import App from './App.vue'
import router from './router'
import './style.css'
import 'boxicons/css/boxicons.min.css'
import { useTenantStore } from '@/stores/tenant'

const app = createApp(App)
const pinia = createPinia()

app.use(pinia)
app.use(router)

// La config du tenant est resolue avant le montage : le theme est ainsi
// applique des le premier rendu, sans transition de couleurs visible.
useTenantStore(pinia)
  .charger()
  .finally(() => {
    app.mount('#app')
  })
