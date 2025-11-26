<template>
  <div v-if="visible" class="fixed inset-0 flex items-center justify-center z-9999">
    <div class="w-10 h-10 border-4 border-blue-500 border-t-transparent rounded-full animate-spin"></div>
  </div>
</template>

<script setup lang="ts">
defineProps<{
  visible?: boolean
}>()
</script>

<style scoped>
@keyframes spin {
  to {
    transform: rotate(360deg);
  }
}

.animate-spin {
  animation: spin 1s linear infinite;
}
</style>
