<template>
  <div>
    <h2 class="text-xl font-semibold mb-6 text-primary">Créer un QR Code</h2>
    <form class="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
            <label class="block font-medium">Nom <span class="text-red-500">*</span></label>
            <input type="text" placeholder="Nom" class="mt-1 w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-primary bg-gray-200"/>
          </div>
          <div>
            <label class="block font-medium">Prénom <span class="text-red-500">*</span></label>
            <input type="text" placeholder="Prénom" class="mt-1 w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-primary bg-gray-200"/>
          </div>
          <div>
            <label class="block font-medium">Email <span class="text-red-500">*</span></label>
            <input type="email" placeholder="Email" class="mt-1 w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-primary bg-gray-200"/>
          </div>
          <div>
            <label class="block font-medium">Contact <span class="text-red-500">*</span></label>
            <input type="text" placeholder="Contact" class="mt-1 w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-primary bg-gray-200"/>
          </div>
          <div>
            <label class="block font-medium">Titre <span class="text-red-500">*</span></label>
            <input type="text" placeholder="Titre" class="mt-1 w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-primary bg-gray-200"/>
          </div>
          <div>
            <label class="block font-medium">Type QR <span class="text-red-500">*</span></label>
            <input type="text" placeholder="Type QR" class="mt-1 w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-primary bg-gray-200"/>
          </div>
          <div>
            <label class="block font-medium">Date d'expiration <span class="text-red-500">*</span></label>
            <input type="date" class="mt-1 w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-primary bg-gray-200"/>
          </div>
          <div>
            <label class="block font-medium">Entreprise <span class="text-red-500">*</span></label>
            <input type="text" placeholder="Entreprise" class="mt-1 w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-primary bg-gray-200"/>
          </div>
          <div>
            <label class="block font-medium">Document <span class="text-red-500">*</span></label>
            <input type="text" placeholder="Document" class="mt-1 w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-primary bg-gray-200"/>
          </div>
    </form>
    <div class="mt-6 text-center">
      <button class="border-2 border-primary text-primary px-6 py-2 rounded-lg font-semibold hover:bg-primary hover:text-white transition">
        Créer QR Code
      </button>
    </div>
  </div>
</template>

<script setup lang="ts">
</script>
