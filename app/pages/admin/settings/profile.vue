<script setup lang="ts">
definePageMeta({
  layout: 'admin',
  middleware: 'admin'
})

const { t } = useI18n()

useSeoMeta({
  title: t('settings.profile_title'),
  robots: 'noindex, nofollow'
})

const items = computed(() => [
  {
    label: t('settings.profile_info'),
    slot: 'profile'
  },
  {
    label: t('auth.change_password'),
    slot: 'password'
  },
  {
    label: t('settings.active_sessions'),
    slot: 'sessions'
  }
])
</script>

<template>
  <div class="max-w-4xl mx-auto space-y-8">
    <div>
      <h1 class="text-3xl font-bold">{{ $t('settings.profile_title') }}</h1>
      <p class="text-gray-500 mt-2">{{ $t('settings.profile_desc') }}</p>
    </div>

    <UTabs :items="items" class="w-full">
      <template #profile>
        <AdminSettingsProfileForm />
      </template>
      <template #password>
        <AdminSettingsPasswordForm />
      </template>
      <template #sessions>
        <AdminSettingsSessionsList />
      </template>
    </UTabs>
  </div>
</template>
