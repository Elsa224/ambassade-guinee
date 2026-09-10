<template>
  <div
    class="fixed inset-0 bg-black/50 bg-opacity-50 flex justify-center items-center z-50 overflow-auto"
  >
    <div class="bg-white rounded-2xl shadow-lg p-4 w-4/5 max-w-4xl relative">
      <button
        @click="$emit('close')"
        class="absolute top-2 right-2 text-gray-700 hover:text-black text-xl"
      >
        &times;
      </button>

      <h2 class="text-xl font-bold text-ink mb-4">Membres de {{ company?.nom || 'Entreprise' }}</h2>

      <table class="min-w-full border border-gray-200 rounded-lg">
        <thead class="bg-ink text-white">
          <tr>
            <th class="p-3">ID</th>
            <th class="p-3">Photo</th>
            <th class="p-3">Nom</th>
            <th class="p-3">Contact</th>
            <th class="p-3">Email</th>
            <th class="p-3">QR Code</th>
          </tr>
        </thead>
        <tbody>
          <tr
            v-for="(member, index) in company.members"
            :key="index"
            class="border-b hover:bg-gray-100"
          >
            <td class="p-3">{{ Number(index) + 1 }}</td>
            <td class="p-3">
              <img src="https://via.placeholder.com/40" class="h-10 w-10 rounded-full" />
            </td>
            <td class="p-3">{{ member }}</td>
            <td class="p-3">0123456789</td>
            <td class="p-3">member@email.com</td>
            <td class="p-3">
              <img
                :src="`https://api.qrserver.com/v1/create-qr-code/?size=80x80&data=Member+${Number(index) + 1}`"
                class="h-10 w-10 cursor-pointer"
                @click="
                  $emit('close')
                  $nextTick(() => $emit('openBadge', member))
                "
              />
            </td>
          </tr>
        </tbody>
      </table>
    </div>
  </div>
</template>

<script setup lang="ts">
// Définir une interface pour l'entreprise
interface Company {
  id: number
  nom: string
  logo: string
  qrCode: string
  lien: string
  phone: string
  email: string
  members: string[]
}

// Typer les props pour éviter 'any'
defineProps<{
  company: Company
}>()

// Événements émis
defineEmits<{
  (e: 'close'): void
  (e: 'openBadge', member: string): void
}>()
</script>

<style scoped>
@import url('https://unpkg.com/boxicons@2.1.4/css/boxicons.min.css');
</style>
