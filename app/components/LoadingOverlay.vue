<script setup lang="ts">
const { isLoading } = useLoading()
</script>

<template>
  <div v-if="isLoading"
    class="fixed inset-0 z-9999 flex items-center justify-center bg-white/80 dark:bg-gray-900/80 backdrop-blur-sm">
    <div class="flex flex-col items-center gap-4">
      <div class="w-12 h-12 border-4 border-primary-500 border-t-transparent rounded-full animate-spin"></div>
      <p class="text-gray-600 dark:text-gray-300 font-medium animate-pulse">Loading...</p>
    </div>
  </div>
</template>
