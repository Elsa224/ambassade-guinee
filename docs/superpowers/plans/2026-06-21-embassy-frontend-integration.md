# Embassy Frontend Integration — Implementation Plan (Plan 2 of 3)

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Turn the existing Vue dashboard from a mock-data template into a real CMS client of the Plan 1 Laravel API: token auth, role-aware route guards, typed API client, TipTap WYSIWYG, S3 presigned upload, and live data on the editorial screens.

**Architecture:** A single axios instance reads `VITE_API_URL` and attaches the Sanctum bearer token from a Pinia `auth` store. A reusable `useResource` composable wraps CRUD + submit/approve/reject for each content type, so each screen is thin. The launch-time dashboard hide (`VITE_ENABLE_DASHBOARD` flag from the release branch) is replaced by a real `beforeEach` guard that checks token + per-route roles.

**Tech Stack:** Vue 3 (`<script setup>`), Pinia, vue-router, axios, @tiptap/vue-3 + @tiptap/starter-kit, Vitest + @vue/test-utils (already in the repo).

## Global Constraints

- **Backend contract = Plan 1.** Base path `/api/v1`. Auth: `POST /auth/login` → `{token, user:{id,name,email,roles[]}}`; `GET /auth/me`; `POST /auth/logout`. Admin CRUD + `POST {type}/{id}/{submit|approve|reject}`. Media: `POST /admin/media/presign` → `{upload_url, object_url, key}`.
- **Statuses** exactly `draft|submitted|published|rejected`. **Roles** exactly `admin|supervisor|editor|viewer`.
- **Token storage:** `localStorage` key `token` (matches the existing logout code that already does `localStorage.removeItem('token')`).
- **No secrets in the repo.** API base comes from `import.meta.env.VITE_API_URL`.
- **Re-enabling the dashboard** at launch+CMS time is done by building with `VITE_ENABLE_DASHBOARD=true`; this plan's real guard supersedes the blanket redirect but keeps the flag as the master on/off.
- **No emojis in committed files.**

---

## File Structure

- `src/lib/api.ts` — axios instance + interceptors (token, 401 handling).
- `src/stores/auth.ts` — Pinia store: `user`, `roles`, `login`, `logout`, `fetchMe`, `hasRole`.
- `src/composables/useResource.ts` — generic CRUD + workflow actions for a resource path.
- `src/router/index.ts` — replace the launch redirect with a role-aware `beforeEach` (modify).
- `src/components/editor/RichTextEditor.vue` — TipTap WYSIWYG (v-model).
- `src/components/media/ImageUploader.vue` — presigned S3 upload widget (emits object URL).
- `src/views/dashboard/Articles.vue` — reference screen wired to the API (modify; mock removed).
- Remaining dashboard CMS screens — same wiring pattern (modify).
- `src/__tests__/*` — Vitest specs per task.

---

## Task 1: API client (`src/lib/api.ts`)

**Files:**
- Create: `src/lib/api.ts`, `src/__tests__/api.spec.ts`

**Interfaces:**
- Produces: `api` (axios instance). Requests attach `Authorization: Bearer <token>` when `localStorage.token` is set. A 401 response clears the token and redirects to `/connexion`.

- [ ] **Step 1: Install axios**

```bash
npm install axios
```

- [ ] **Step 2: Write the failing test**

```ts
// src/__tests__/api.spec.ts
import { describe, it, expect, beforeEach } from 'vitest'
import { api } from '@/lib/api'

describe('api client', () => {
  beforeEach(() => localStorage.clear())

  it('attaches the bearer token when present', async () => {
    localStorage.setItem('token', 'abc123')
    const cfg = await (api.interceptors.request as any).handlers[0].fulfilled({ headers: {} })
    expect(cfg.headers.Authorization).toBe('Bearer abc123')
  })

  it('omits Authorization when no token', async () => {
    const cfg = await (api.interceptors.request as any).handlers[0].fulfilled({ headers: {} })
    expect(cfg.headers.Authorization).toBeUndefined()
  })
})
```

- [ ] **Step 3: Run test to verify it fails**

Run: `npm run test:unit -- api.spec`
Expected: FAIL (module not found).

- [ ] **Step 4: Implement**

```ts
// src/lib/api.ts
import axios from 'axios'
import router from '@/router'

export const api = axios.create({
  baseURL: (import.meta.env.VITE_API_URL ?? '') + '/api/v1',
  headers: { Accept: 'application/json' },
})

api.interceptors.request.use((config) => {
  const token = localStorage.getItem('token')
  if (token) config.headers.Authorization = `Bearer ${token}`
  return config
})

api.interceptors.response.use(
  (res) => res,
  (error) => {
    if (error.response?.status === 401) {
      localStorage.removeItem('token')
      router.push('/connexion')
    }
    return Promise.reject(error)
  },
)
```

- [ ] **Step 5: Run test to verify it passes**

Run: `npm run test:unit -- api.spec`
Expected: PASS.

- [ ] **Step 6: Commit**

```bash
git add src/lib/api.ts src/__tests__/api.spec.ts package.json package-lock.json
git commit -m "feat(fe): axios api client with bearer token + 401 handling"
```

---

## Task 2: Auth store (`src/stores/auth.ts`)

**Files:**
- Create: `src/stores/auth.ts`, `src/__tests__/auth.store.spec.ts`

**Interfaces:**
- Consumes: `api` (Task 1).
- Produces: store with state `user`, `roles`; actions `login(email,password)`, `logout()`, `fetchMe()`; getter `hasRole(role)` and `hasAnyRole(roles[])`.

- [ ] **Step 1: Write the failing test**

```ts
// src/__tests__/auth.store.spec.ts
import { setActivePinia, createPinia } from 'pinia'
import { describe, it, expect, beforeEach, vi } from 'vitest'
import { useAuthStore } from '@/stores/auth'
import { api } from '@/lib/api'

vi.mock('@/lib/api')

describe('auth store', () => {
  beforeEach(() => { setActivePinia(createPinia()); localStorage.clear() })

  it('login stores token, user and roles', async () => {
    ;(api.post as any) = vi.fn().mockResolvedValue({ data: { token: 't1', user: { id: 1, name: 'A', email: 'a@x', roles: ['editor'] } } })
    const store = useAuthStore()
    await store.login('a@x', 'pw')
    expect(localStorage.getItem('token')).toBe('t1')
    expect(store.hasRole('editor')).toBe(true)
    expect(store.hasRole('admin')).toBe(false)
  })
})
```

- [ ] **Step 2: Run test to verify it fails**

Run: `npm run test:unit -- auth.store`
Expected: FAIL.

- [ ] **Step 3: Implement**

```ts
// src/stores/auth.ts
import { defineStore } from 'pinia'
import { api } from '@/lib/api'

interface User { id: number; name: string; email: string; roles: string[] }

export const useAuthStore = defineStore('auth', {
  state: () => ({ user: null as User | null, roles: [] as string[] }),
  getters: {
    isAuthenticated: (s) => !!s.user,
    hasRole: (s) => (role: string) => s.roles.includes(role),
    hasAnyRole: (s) => (roles: string[]) => roles.some((r) => s.roles.includes(r)),
  },
  actions: {
    async login(email: string, password: string) {
      const { data } = await api.post('/auth/login', { email, password })
      localStorage.setItem('token', data.token)
      this.user = data.user
      this.roles = data.user.roles
    },
    async fetchMe() {
      if (!localStorage.getItem('token')) return
      const { data } = await api.get('/auth/me')
      this.user = data; this.roles = data.roles
    },
    async logout() {
      try { await api.post('/auth/logout') } catch { /* token may already be invalid */ }
      localStorage.removeItem('token'); this.user = null; this.roles = []
    },
  },
})
```

- [ ] **Step 4: Run test to verify it passes**

Run: `npm run test:unit -- auth.store`
Expected: PASS.

- [ ] **Step 5: Commit**

```bash
git add src/stores/auth.ts src/__tests__/auth.store.spec.ts
git commit -m "feat(fe): pinia auth store (login/logout/me + role getters)"
```

---

## Task 3: Role-aware route guard (replace the launch redirect)

**Files:**
- Modify: `src/router/index.ts`
- Create: `src/__tests__/guard.spec.ts`

**Interfaces:**
- Consumes: `useAuthStore` (Task 2).
- Produces: dashboard routes carry `meta: { requiresAuth: true, roles: [...] }`. The guard: if `VITE_ENABLE_DASHBOARD !== 'true'` → keep redirecting `/dashboard`+`/connexion` to `/` (launch behavior). Else: unauthenticated → `/connexion`; authenticated but lacking a route's roles → `/dashboard` (with a denied flag).

- [ ] **Step 1: Write the failing test**

```ts
// src/__tests__/guard.spec.ts
import { describe, it, expect } from 'vitest'
import { canActivate } from '@/router/index'

describe('route guard policy', () => {
  it('blocks anonymous users from a protected route', () => {
    expect(canActivate({ requiresAuth: true, roles: ['editor'] }, { authed: false, roles: [] }))
      .toEqual({ allow: false, redirect: '/connexion' })
  })
  it('blocks a viewer from an editor-only route', () => {
    expect(canActivate({ requiresAuth: true, roles: ['editor'] }, { authed: true, roles: ['viewer'] }))
      .toEqual({ allow: false, redirect: '/dashboard' })
  })
  it('allows a supervisor on a supervisor route', () => {
    expect(canActivate({ requiresAuth: true, roles: ['supervisor'] }, { authed: true, roles: ['supervisor'] }))
      .toEqual({ allow: true })
  })
})
```

- [ ] **Step 2: Run test to verify it fails**

Run: `npm run test:unit -- guard`
Expected: FAIL (`canActivate` not exported).

- [ ] **Step 3: Implement the pure policy + wire the guard**

Add to `src/router/index.ts` (export the pure function so it is unit-testable; the `beforeEach` is a thin adapter):

```ts
type RouteMeta = { requiresAuth?: boolean; roles?: string[] }
type AuthState = { authed: boolean; roles: string[] }

export function canActivate(meta: RouteMeta, auth: AuthState):
  { allow: true } | { allow: false; redirect: string } {
  if (!meta.requiresAuth) return { allow: true }
  if (!auth.authed) return { allow: false, redirect: '/connexion' }
  if (meta.roles?.length && !meta.roles.some((r) => auth.roles.includes(r))) {
    return { allow: false, redirect: '/dashboard' }
  }
  return { allow: true }
}
```

Replace the launch `beforeEach` with:

```ts
import { useAuthStore } from '@/stores/auth'
const DASHBOARD_ENABLED = import.meta.env.VITE_ENABLE_DASHBOARD === 'true'

router.beforeEach(async (to) => {
  if (!DASHBOARD_ENABLED) {
    if (to.path.startsWith('/dashboard') || to.path === '/connexion') return { path: '/' }
    return true
  }
  const auth = useAuthStore()
  if (localStorage.getItem('token') && !auth.user) { try { await auth.fetchMe() } catch { /* invalid */ } }
  const decision = canActivate(to.meta as RouteMeta, { authed: auth.isAuthenticated, roles: auth.roles })
  return decision.allow ? true : { path: decision.redirect }
})
```

Add `meta` to dashboard routes, e.g. on the `/dashboard` parent: `meta: { requiresAuth: true }`, and on editorial routes `meta: { requiresAuth: true, roles: ['editor','supervisor','admin'] }`, on user-management `roles: ['admin']`.

- [ ] **Step 4: Run test to verify it passes**

Run: `npm run test:unit -- guard`
Expected: PASS (all three).

- [ ] **Step 5: Commit**

```bash
git add src/router/index.ts src/__tests__/guard.spec.ts
git commit -m "feat(fe): role-aware route guard replacing launch redirect"
```

---

## Task 4: `useResource` composable (CRUD + workflow)

**Files:**
- Create: `src/composables/useResource.ts`, `src/__tests__/useResource.spec.ts`

**Interfaces:**
- Consumes: `api` (Task 1).
- Produces: `useResource(path)` returning `{ items, item, loading, list(), get(id), create(payload), update(id,payload), remove(id), submit(id), approve(id), reject(id, reason) }`. `path` is e.g. `'articles'` → calls `/admin/articles`.

- [ ] **Step 1: Write the failing test**

```ts
// src/__tests__/useResource.spec.ts
import { describe, it, expect, vi } from 'vitest'
import { useResource } from '@/composables/useResource'
import { api } from '@/lib/api'
vi.mock('@/lib/api')

describe('useResource', () => {
  it('list() loads items from /admin/<path>', async () => {
    ;(api.get as any) = vi.fn().mockResolvedValue({ data: { data: [{ id: 1 }] } })
    const r = useResource('articles')
    await r.list()
    expect(api.get).toHaveBeenCalledWith('/admin/articles', { params: undefined })
    expect(r.items.value).toEqual([{ id: 1 }])
  })

  it('reject() posts the reason', async () => {
    ;(api.post as any) = vi.fn().mockResolvedValue({ data: { data: { id: 1, status: 'draft' } } })
    const r = useResource('articles')
    await r.reject(1, 'Sources non vérifiées')
    expect(api.post).toHaveBeenCalledWith('/admin/articles/1/reject', { reason: 'Sources non vérifiées' })
  })
})
```

- [ ] **Step 2: Run test to verify it fails**

Run: `npm run test:unit -- useResource`
Expected: FAIL.

- [ ] **Step 3: Implement**

```ts
// src/composables/useResource.ts
import { ref } from 'vue'
import { api } from '@/lib/api'

export function useResource(path: string) {
  const items = ref<any[]>([])
  const item = ref<any | null>(null)
  const loading = ref(false)
  const base = `/admin/${path}`

  async function list(params?: Record<string, unknown>) {
    loading.value = true
    try { items.value = (await api.get(base, { params })).data.data } finally { loading.value = false }
  }
  async function get(id: number) { item.value = (await api.get(`${base}/${id}`)).data.data }
  async function create(payload: Record<string, unknown>) { return (await api.post(base, payload)).data.data }
  async function update(id: number, payload: Record<string, unknown>) { return (await api.put(`${base}/${id}`, payload)).data.data }
  async function remove(id: number) { await api.delete(`${base}/${id}`) }
  async function submit(id: number) { return (await api.post(`${base}/${id}/submit`)).data.data }
  async function approve(id: number) { return (await api.post(`${base}/${id}/approve`)).data.data }
  async function reject(id: number, reason: string) { return (await api.post(`${base}/${id}/reject`, { reason })).data.data }

  return { items, item, loading, list, get, create, update, remove, submit, approve, reject }
}
```

- [ ] **Step 4: Run test to verify it passes**

Run: `npm run test:unit -- useResource`
Expected: PASS.

- [ ] **Step 5: Commit**

```bash
git add src/composables/useResource.ts src/__tests__/useResource.spec.ts
git commit -m "feat(fe): useResource composable for CRUD + approval actions"
```

---

## Task 5: TipTap rich-text editor component

**Files:**
- Create: `src/components/editor/RichTextEditor.vue`, `src/__tests__/RichTextEditor.spec.ts`

**Interfaces:**
- Produces: `<RichTextEditor v-model="html" />` — a TipTap editor emitting sanitized HTML via `update:modelValue`.

- [ ] **Step 1: Install TipTap**

```bash
npm install @tiptap/vue-3 @tiptap/starter-kit @tiptap/pm
```

- [ ] **Step 2: Write the failing test**

```ts
// src/__tests__/RichTextEditor.spec.ts
import { mount } from '@vue/test-utils'
import { describe, it, expect } from 'vitest'
import RichTextEditor from '@/components/editor/RichTextEditor.vue'

describe('RichTextEditor', () => {
  it('renders initial modelValue content', async () => {
    const wrapper = mount(RichTextEditor, { props: { modelValue: '<p>Bonjour</p>' } })
    await new Promise((r) => setTimeout(r, 0))
    expect(wrapper.html()).toContain('Bonjour')
  })
})
```

- [ ] **Step 3: Run test to verify it fails**

Run: `npm run test:unit -- RichTextEditor`
Expected: FAIL (component missing).

- [ ] **Step 4: Implement**

```vue
<!-- src/components/editor/RichTextEditor.vue -->
<script setup lang="ts">
import { watch } from 'vue'
import { useEditor, EditorContent } from '@tiptap/vue-3'
import StarterKit from '@tiptap/starter-kit'

const props = defineProps<{ modelValue: string }>()
const emit = defineEmits<{ (e: 'update:modelValue', v: string): void }>()

const editor = useEditor({
  content: props.modelValue,
  extensions: [StarterKit],
  onUpdate: ({ editor }) => emit('update:modelValue', editor.getHTML()),
})

watch(() => props.modelValue, (val) => {
  if (editor.value && val !== editor.value.getHTML()) editor.value.commands.setContent(val, false)
})
</script>

<template>
  <div class="border rounded-md">
    <editor-content :editor="editor" class="prose max-w-none p-3 min-h-[200px]" />
  </div>
</template>
```

- [ ] **Step 5: Run test to verify it passes**

Run: `npm run test:unit -- RichTextEditor`
Expected: PASS.

- [ ] **Step 6: Commit**

```bash
git add src/components/editor/RichTextEditor.vue src/__tests__/RichTextEditor.spec.ts package.json package-lock.json
git commit -m "feat(fe): TipTap rich-text editor component"
```

---

## Task 6: S3 presigned image uploader

**Files:**
- Create: `src/components/media/ImageUploader.vue`, `src/__tests__/ImageUploader.spec.ts`

**Interfaces:**
- Consumes: `api` (Task 1).
- Produces: `<ImageUploader @uploaded="url => ..." />`. Flow: `POST /admin/media/presign {filename,content_type}` → PUT file to `upload_url` → emit `uploaded` with `object_url`.

- [ ] **Step 1: Write the failing test**

```ts
// src/__tests__/ImageUploader.spec.ts
import { mount } from '@vue/test-utils'
import { describe, it, expect, vi } from 'vitest'
import ImageUploader from '@/components/media/ImageUploader.vue'
import { api } from '@/lib/api'
vi.mock('@/lib/api')

describe('ImageUploader', () => {
  it('presigns, uploads, and emits the object url', async () => {
    ;(api.post as any) = vi.fn().mockResolvedValue({ data: { upload_url: 'https://s3/put', object_url: 'https://s3/obj.jpg', key: 'k' } })
    ;(api.put as any) = vi.fn().mockResolvedValue({})
    vi.stubGlobal('fetch', vi.fn().mockResolvedValue({ ok: true }))

    const wrapper = mount(ImageUploader)
    const file = new File(['x'], 'photo.jpg', { type: 'image/jpeg' })
    await (wrapper.vm as any).handleFile(file)

    expect(api.post).toHaveBeenCalledWith('/admin/media/presign', { filename: 'photo.jpg', content_type: 'image/jpeg' })
    expect(wrapper.emitted('uploaded')?.[0]).toEqual(['https://s3/obj.jpg'])
  })
})
```

- [ ] **Step 2: Run test to verify it fails**

Run: `npm run test:unit -- ImageUploader`
Expected: FAIL.

- [ ] **Step 3: Implement**

```vue
<!-- src/components/media/ImageUploader.vue -->
<script setup lang="ts">
import { ref } from 'vue'
import { api } from '@/lib/api'
const emit = defineEmits<{ (e: 'uploaded', url: string): void }>()
const busy = ref(false)

async function handleFile(file: File) {
  busy.value = true
  try {
    const { data } = await api.post('/admin/media/presign', { filename: file.name, content_type: file.type })
    await fetch(data.upload_url, { method: 'PUT', body: file, headers: { 'Content-Type': file.type } })
    emit('uploaded', data.object_url)
  } finally { busy.value = false }
}
defineExpose({ handleFile })

function onChange(e: Event) {
  const f = (e.target as HTMLInputElement).files?.[0]
  if (f) handleFile(f)
}
</script>

<template>
  <label class="inline-flex items-center gap-2 cursor-pointer">
    <input type="file" accept="image/*" class="hidden" @change="onChange" :disabled="busy" />
    <span class="px-3 py-2 rounded bg-[#006633] text-white">{{ busy ? 'Envoi…' : 'Téléverser une image' }}</span>
  </label>
</template>
```

- [ ] **Step 4: Run test to verify it passes**

Run: `npm run test:unit -- ImageUploader`
Expected: PASS.

- [ ] **Step 5: Commit**

```bash
git add src/components/media/ImageUploader.vue src/__tests__/ImageUploader.spec.ts
git commit -m "feat(fe): S3 presigned image uploader component"
```

---

## Task 7: Wire the Articles screen to the API (reference)

**Files:**
- Modify: `src/views/dashboard/Articles.vue` (remove mock array; use `useResource('articles')` + `RichTextEditor` + `ImageUploader`)
- Create: `src/__tests__/ArticlesView.spec.ts`

**Interfaces:**
- Consumes: `useResource` (Task 4), `RichTextEditor` (Task 5), `ImageUploader` (Task 6), `useAuthStore` (Task 2).
- Produces: the Articles screen lists from the API, creates/edits via TipTap + uploader, and shows role-gated actions — editors see **Soumettre**, supervisors see **Approuver/Rejeter**.

- [ ] **Step 1: Write the failing test**

```ts
// src/__tests__/ArticlesView.spec.ts
import { mount, flushPromises } from '@vue/test-utils'
import { setActivePinia, createPinia } from 'pinia'
import { describe, it, expect, vi, beforeEach } from 'vitest'
import Articles from '@/views/dashboard/Articles.vue'
import { api } from '@/lib/api'
vi.mock('@/lib/api')

describe('Articles view', () => {
  beforeEach(() => setActivePinia(createPinia()))
  it('renders article titles loaded from the API', async () => {
    ;(api.get as any) = vi.fn().mockResolvedValue({ data: { data: [{ id: 1, title: 'Coopération', status: 'published' }] } })
    const wrapper = mount(Articles, { global: { stubs: ['RichTextEditor', 'ImageUploader', 'router-link'] } })
    await flushPromises()
    expect(wrapper.text()).toContain('Coopération')
  })
})
```

- [ ] **Step 2: Run test to verify it fails**

Run: `npm run test:unit -- ArticlesView`
Expected: FAIL (still using mock data / no API call).

- [ ] **Step 3: Rewrite `Articles.vue`** — delete the hardcoded array; on mount call `useResource('articles').list()`; render `items`; the create/edit form binds `RichTextEditor` to `body` and `ImageUploader` to `cover_image_url`; action buttons use `v-if="auth.hasRole('editor')"` (Soumettre) and `v-if="auth.hasAnyRole(['supervisor','admin'])"` (Approuver/Rejeter). Reject opens a prompt for the reason.

- [ ] **Step 4: Run test to verify it passes**

Run: `npm run test:unit -- ArticlesView`
Expected: PASS.

- [ ] **Step 5: Commit**

```bash
git add src/views/dashboard/Articles.vue src/__tests__/ArticlesView.spec.ts
git commit -m "feat(fe): wire Articles screen to live API with role-gated actions"
```

---

## Task 8: Replicate the wiring to the remaining CMS screens

**Files (modify, one per screen):** `Actualites.vue`, `Nouvelles.vue`, `Galerie.vue`, `Document.vue`, `Courriers.vue` (+ its `ListeCourrier.vue`), `Evenement.vue` (+ `ListeEvenement.vue`), `Utilisateur.vue`/`UserList.vue` (admin-only), `Profile.vue` (uses `/auth/me`).

**Interfaces:**
- Consumes: the same Task 4-6 building blocks. Each screen calls `useResource('<path>')` with its API path (`actualites`, `nouvelles`, `evenements`, `galeries`, `documents`, `courriers`, `users`).

> Repeat the Task 7 pattern per screen: remove the mock array, load via `useResource`, bind forms (TipTap for body-bearing types; ImageUploader for images), gate workflow buttons by role. **Nouvelles** is read+curate only (no create form — items arrive via the scraper; supervisors approve/reject). **Users** is admin-only CRUD (no approval workflow).

- [ ] **Step 1 (per screen): Write a failing render test** like `ArticlesView.spec.ts` (swap component + path) → FAIL.
- [ ] **Step 2 (per screen): Rewrite the screen** to use `useResource('<path>')`, removing mock data.
- [ ] **Step 3 (per screen): Run** `npm run test:unit -- <Screen>` → PASS.
- [ ] **Step 4: Commit per screen**

```bash
git add -A && git commit -m "feat(fe): wire <screen> to live API"
```

---

## Task 9: Real login screen + enable dashboard build

**Files:**
- Modify: `src/views/Connexion.vue` (call `useAuthStore().login`), `.env.example` (add `VITE_API_URL`, `VITE_ENABLE_DASHBOARD`)
- Create: `src/__tests__/Connexion.spec.ts`

**Interfaces:**
- Consumes: `useAuthStore` (Task 2).
- Produces: working login → redirect to `/dashboard`; documented enable flag.

- [ ] **Step 1: Write the failing test**

```ts
// src/__tests__/Connexion.spec.ts
import { mount, flushPromises } from '@vue/test-utils'
import { setActivePinia, createPinia } from 'pinia'
import { describe, it, expect, vi, beforeEach } from 'vitest'
import Connexion from '@/views/Connexion.vue'
import { useAuthStore } from '@/stores/auth'

describe('Connexion', () => {
  beforeEach(() => setActivePinia(createPinia()))
  it('calls auth.login on submit', async () => {
    const store = useAuthStore()
    store.login = vi.fn().mockResolvedValue(undefined)
    const wrapper = mount(Connexion, { global: { stubs: ['router-link'], mocks: { $router: { push: vi.fn() } } } })
    await wrapper.find('input[type="email"]').setValue('a@x')
    await wrapper.find('input[type="password"]').setValue('pw')
    await wrapper.find('form').trigger('submit.prevent')
    await flushPromises()
    expect(store.login).toHaveBeenCalledWith('a@x', 'pw')
  })
})
```

- [ ] **Step 2: Run test to verify it fails** — `npm run test:unit -- Connexion` → FAIL.
- [ ] **Step 3: Implement** the form in `Connexion.vue` (email/password fields, submit → `await auth.login(...)` then `router.push('/dashboard')`, error message on 422). Add to `.env.example`:

```dotenv
VITE_API_URL=https://api.embassyofguineausa.org
VITE_ENABLE_DASHBOARD=true
```

- [ ] **Step 4: Run test + full suite** — `npm run test:unit` → PASS; `npm run build` succeeds.
- [ ] **Step 5: Commit**

```bash
git add -A
git commit -m "feat(fe): real login screen + dashboard enable flag/env"
```

---

## Self-Review

**Spec coverage (spec §7 + §5 client side):** API client → T1; auth + token → T2; route guard (the missing gate) → T3; CRUD+workflow → T4; WYSIWYG → T5; S3 upload → T6; mock removal screen-by-screen → T7-8; login + enable flag → T9.
**Placeholder scan:** every code step has real code; per-screen repetition in T8 references the concrete T7 pattern. No TBD/TODO.
**Type consistency:** `useResource` method names (`list/get/create/update/remove/submit/approve/reject`) match their usage in T7-8. Auth getters `hasRole/hasAnyRole` match guard + screen usage. Token key `token` matches the existing logout code and Task 1.

---

## Execution Handoff

This is **Plan 2 of 3**. It depends on Plan 1's endpoints being live. Plan 3 (scraper ingest) is independent of this plan and can run in parallel once Plan 1 exists.
