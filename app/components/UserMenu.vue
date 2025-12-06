<script setup lang="ts">
const { user, logout } = useAuth()

const items = computed(() => [
  // [
  //   {
  //     label: user.value?.name || 'User',
  //     avatar: { src: user.value?.avatar?.url },
  //     type: 'label',
  //     ui: { label: 'cursor-pointer' }
  //   }
  // ],
  [
    {
      label: $t('settings.profile'),
      icon: 'i-lucide-user',
      to: '/admin/profile'
    },
    // {
    //   label: $t('system.routes'),
    //   icon: 'i-lucide-settings',
    //   to: '/admin/system/routes'
    // },
    // {
    //   label: $t('system.config'),
    //   icon: 'i-lucide-settings',
    //   to: '/admin/system/config'
    // }
  ],
  [
    {
      label: $t('auth.logout'),
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
