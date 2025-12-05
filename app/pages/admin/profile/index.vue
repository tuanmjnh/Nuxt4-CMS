<script setup lang="ts">
definePageMeta({
  layout: 'admin',
  middleware: 'admin'
})
import ProfileForm from './ProfileForm.vue'
import PasswordForm from './PasswordForm.vue'
import SessionsList from './SessionsList.vue'

useSeoMeta({
  title: $t('settings.profile_title'),
  robots: 'noindex, nofollow'
})

const items = computed(() => [
  {
    label: $t('settings.profile_info'),
    slot: 'profile'
  },
  {
    label: $t('auth.change_password'),
    slot: 'password'
  },
  {
    label: $t('settings.active_sessions'),
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
        <ProfileForm />
      </template>
      <template #password>
        <PasswordForm />
      </template>
      <template #sessions>
        <SessionsList />
      </template>
    </UTabs>
  </div>
</template>
