<script setup lang="ts">
const mobileMenuOpen = ref(false)
</script>

<template>
  <div class="min-h-screen flex flex-col">
    <!-- Header -->
    <header class="border-b bg-white dark:bg-gray-900">
      <UContainer>
        <div class="flex items-center justify-between h-16">
          <NuxtLink to="/" class="text-xl font-bold">
            {{ $t('site_name') }}
          </NuxtLink>

          <!-- Navigation -->
          <nav class="hidden md:flex items-center gap-6">
            <UColorModeButton />
          </nav>

          <!-- Mobile menu button -->
          <UButton icon="i-lucide-menu" variant="ghost" class="md:hidden" @click="mobileMenuOpen = !mobileMenuOpen" />
        </div>

        <!-- Mobile menu -->
        <div v-if="mobileMenuOpen" class="md:hidden py-4 border-t">
          <nav class="flex flex-col gap-4">
            <NuxtLink to="/" class="hover:text-primary" @click="mobileMenuOpen = false">
              {{ $t('home') }}
            </NuxtLink>
            <div class="flex items-center gap-2">
              <span class="text-sm">{{ $t('theme') }}:</span>
              <UColorModeButton />
            </div>
          </nav>
        </div>
      </UContainer>
    </header>

    <!-- Main content -->
    <main class="flex-1">
      <slot />
    </main>

    <!-- Footer -->
    <footer class="border-t bg-gray-50 dark:bg-gray-900 py-8">
      <UContainer>
        <div class="text-center text-sm text-gray-600 dark:text-gray-400">
          <p>&copy; {{ new Date().getFullYear() }} {{ $t('copyright') }}</p>
        </div>
      </UContainer>
    </footer>
  </div>
</template>
