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
            {{ $t('common.site_name') }}
          </NuxtLink>

          <!-- Navigation -->
          <nav class="hidden md:flex items-center gap-6">
            <NuxtLink to="/" class="hover:text-primary">{{ $t('common.home') }}</NuxtLink>
            <NuxtLink to="/posts" class="hover:text-primary">{{ $t('posts.title') }}</NuxtLink>
            <NuxtLink to="/admin" class="hover:text-primary">{{ $t('admin.title') }}</NuxtLink>
            <UColorModeButton />
          </nav>

          <!-- Mobile menu button -->
          <UButton icon="i-lucide-menu" variant="ghost" class="md:hidden" @click="mobileMenuOpen = !mobileMenuOpen" />
        </div>

        <!-- Mobile menu -->
        <div v-if="mobileMenuOpen" class="md:hidden py-4 border-t">
          <nav class="flex flex-col gap-4">
            <NuxtLink to="/" class="hover:text-primary" @click="mobileMenuOpen = false">
              {{ $t('common.home') }}
            </NuxtLink>
            <NuxtLink to="/posts" class="hover:text-primary" @click="mobileMenuOpen = false">
              {{ $t('posts.title') }}
            </NuxtLink>
            <NuxtLink to="/admin" class="hover:text-primary" @click="mobileMenuOpen = false">
              {{ $t('admin.title') }}
            </NuxtLink>
            <div class="flex items-center gap-2">
              <span class="text-sm">{{ $t('settings.theme') }}:</span>
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
          <p>&copy; {{ new Date().getFullYear() }} {{ $t('common.copyright') }}</p>
        </div>
      </UContainer>
    </footer>
  </div>
</template>
