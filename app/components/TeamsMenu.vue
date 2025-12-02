<script setup lang="ts">
const { title, icon } = defineProps<{ title: string, icon?: string }>()
</script>
<template>
  <div class="flex items-center gap-2 px-2 py-1.5">
    <UIcon :name="icon" class="w-6 h-6 text-primary-500" />
    <span class="font-bold text-gray-900 dark:text-white truncate">{{ title }}</span>
  </div>
</template>
