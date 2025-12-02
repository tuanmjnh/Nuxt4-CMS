<script setup lang="ts">
import * as z from 'zod'
import type { FormSubmitEvent } from '@nuxt/ui'

const { user, fetchUser } = useAuth()
const toast = useToast()

// Cloudinary file attach schema
const fileAttachSchema = z.object({
  public_id: z.string().optional(),
  display_name: z.string().optional(),
  url: z.string(),
  thumbnail_url: z.string().optional(),
  format: z.string().optional(),
  bytes: z.number().optional(),
  width: z.number().optional(),
  height: z.number().optional(),
  created_at: z.union([z.number(), z.string()]).optional()
})

// Profile form schema
const profileSchema = z.object({
  name: z.string().min(2, $t('validation.name_min')),
  email: z.string().email($t('validation.email_invalid')),
  bio: z.string().optional(),
  avatar: fileAttachSchema.optional()
})

type ProfileSchema = z.output<typeof profileSchema>

// State
const profileState = reactive<Partial<ProfileSchema>>({
  name: user.value?.name || '',
  email: user.value?.email || '',
  bio: user.value?.bio || '',
  avatar: user.value?.avatar || undefined
})

const loadingProfile = ref(false)
const showAvatarManager = ref(false)

// Watch user changes
watch(() => user.value, (newUser) => {
  if (newUser) {
    profileState.name = newUser.name || ''
    profileState.email = newUser.email || ''
    profileState.bio = newUser.bio || ''
    profileState.avatar = newUser.avatar || undefined
  }
}, { immediate: true })

// Methods
const onProfileSubmit = async (event: FormSubmitEvent<ProfileSchema>) => {
  loadingProfile.value = true

  try {
    const response = await $fetch<any>('/api/user/profile', {
      method: 'PUT',
      body: event.data
    })

    if (response.success) {
      toast.add({ title: $t('common.success'), description: $t('settings.profile_updated'), color: 'success' })

      // Refresh user data
      await fetchUser()
    }
  } catch (e: any) {
    toast.add({ title: $t('common.error'), description: e.data?.message || $t('settings.profile_error'), color: 'error' })
  } finally {
    loadingProfile.value = false
  }
}

const handleAvatarSelected = (files: Cloudinary.IFileAttach[]) => {
  if (files.length > 0) {
    profileState.avatar = files[0]
    showAvatarManager.value = false
  }
}
</script>

<template>
  <UCard>
    <template #header>
      <h2 class="text-xl font-bold">{{ $t('settings.profile_info') }}</h2>
    </template>

    <UForm :schema="profileSchema" :state="profileState" class="space-y-6" @submit="onProfileSubmit">
      <!-- Avatar -->
      <div class="flex items-center gap-6">
        <UAvatar :src="profileState.avatar?.url || ''" :alt="profileState.name" size="3xl" />
        <div>
          <UButton icon="i-lucide-upload" variant="outline" @click="showAvatarManager = true">
            {{ $t('settings.change_avatar') }}
          </UButton>
          <p class="text-sm text-gray-500 mt-2">{{ $t('settings.avatar_help') }}</p>
        </div>
      </div>

      <!-- Name -->
      <UFormField :label="$t('common.name')" name="name" required>
        <UInput v-model="profileState.name" :placeholder="$t('settings.name_placeholder')" />
      </UFormField>

      <!-- Email -->
      <UFormField :label="$t('auth.email')" name="email" required>
        <UInput v-model="profileState.email" type="email" :placeholder="$t('settings.email_placeholder')" />
      </UFormField>

      <!-- Bio -->
      <UFormField :label="$t('users.bio')" name="bio">
        <UTextarea v-model="profileState.bio" :placeholder="$t('settings.bio_placeholder')" :rows="4" />
      </UFormField>

      <!-- Submit Button -->
      <div class="flex justify-end">
        <UButton type="submit" :loading="loadingProfile">
          {{ $t('common.save_changes') }}
        </UButton>
      </div>
    </UForm>

    <!-- Cloudinary Manager Modal -->
    <admin-media-gallery v-if="showAvatarManager" v-model="profileState.avatar" mode="modal" :multiple="false"
      @close="showAvatarManager = false" />
  </UCard>
</template>
