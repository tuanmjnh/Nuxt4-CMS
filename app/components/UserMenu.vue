<script setup lang="ts">
const { user, logout } = useAuth()
const { t } = useI18n()

const items = computed(() => [
  [
    {
      label: user.value?.name || 'User',
      avatar: {
        src: user.value?.avatar?.url
      },
      type: 'label',
      ui: {
        label: 'cursor-pointer'
      }
    }
  ],
  [
    {
      label: 'Profile',
      icon: 'i-lucide-user',
      to: '/admin/settings/profile'
    },
    {
      label: t('settings.title'),
      icon: 'i-lucide-settings',
      to: '/admin/settings/routes'
    }
  ],
  [
    {
      label: t('auth.logout'),
      icon: 'i-lucide-log-out',
      onSelect: () => logout()
    }
  ]
])
</script>

<template>
  <UDropdownMenu :items="items" :popper="{ placement: 'right-start' }" arrow :modal="false"
    :ui="{ item: 'cursor-pointer' }">
    <UButton color="neutral" variant="ghost" class="w-full justify-start">
      <UAvatar :src="user?.avatar?.url" :alt="user?.name" size="xs" />
      <span class="truncate text-gray-700 dark:text-gray-200 font-medium">{{ user?.name }}</span>
    </UButton>
  </UDropdownMenu>
</template>
