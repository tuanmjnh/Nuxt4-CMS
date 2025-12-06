<script setup lang="ts">
const { title, icon, collapsed } = defineProps<{ title: string, icon?: string, collapsed?: boolean }>()
</script>
<template>
  <ULink :to="'/admin'" class="flex items-center gap-2 overflow-hidden">
    <UIcon :name="icon" class="w-6 h-6 text-primary-500" />
    <span v-if="!collapsed" class="font-bold text-gray-900 dark:text-white truncate ">{{ title }}</span>
  </ULink>
</template>
