<script setup lang="ts">
const runtimeConfig = useRuntimeConfig()
</script>

<template>
  <UDashboardGroup>
    <UDashboardPanel>
      <template #header>
        <UDashboardNavbar>
          <template #left>
            <UIcon name="i-lucide-house" class="size-5" />
            <ULink as="button" :to="'/'">{{ runtimeConfig.public.siteName }}</ULink>
          </template>
          <template #right>
            <ThemeCustomizer />
          </template>
        </UDashboardNavbar>
      </template>

      <template #body>
        <slot />
      </template>
      <template #footer>
        <footer
          class="py-4 text-center text-sm text-gray-500 dark:text-gray-400 bg-gray-50 dark:bg-gray-900 border-t border-gray-200 dark:border-gray-800">
          <p>&copy; {{ new Date().getFullYear() }} {{ runtimeConfig.public.copyright }}</p>
        </footer>
      </template>
    </UDashboardPanel>
  </UDashboardGroup>
</template>
