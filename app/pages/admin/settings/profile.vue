<script setup lang="ts">
import * as z from 'zod'
import type { FormSubmitEvent } from '@nuxt/ui'

definePageMeta({
  layout: 'admin',
  middleware: 'admin'
})

const { user, fetchUser } = useAuth()
const toast = useToast()

// Profile form schema
const profileSchema = z.object({
  name: z.string().min(2, 'Name must be at least 2 characters'),
  email: z.string().email('Invalid email address'),
  bio: z.string().optional(),
  avatar: z.string().optional()
})

type ProfileSchema = z.output<typeof profileSchema>

// Password form schema
const passwordSchema = z.object({
  currentPassword: z.string().min(8, 'Password must be at least 8 characters'),
  newPassword: z.string().min(8, 'Password must be at least 8 characters'),
  confirmPassword: z.string().min(8, 'Password must be at least 8 characters')
}).refine((data) => data.newPassword === data.confirmPassword, {
  message: "Passwords don't match",
  path: ["confirmPassword"],
})

type PasswordSchema = z.output<typeof passwordSchema>

// State
const profileState = reactive<Partial<ProfileSchema>>({
  name: user.value?.name || '',
  email: user.value?.email || '',
  bio: user.value?.bio || '',
  avatar: user.value?.avatar || ''
})

const passwordState = reactive<Partial<PasswordSchema>>({
  currentPassword: '',
  newPassword: '',
  confirmPassword: ''
})

const loadingProfile = ref(false)
const loadingPassword = ref(false)
const showAvatarManager = ref(false)

// Watch user changes
watch(() => user.value, (newUser) => {
  if (newUser) {
    profileState.name = newUser.name || ''
    profileState.email = newUser.email || ''
    profileState.bio = newUser.bio || ''
    profileState.avatar = newUser.avatar || ''
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
      toast.add({
        title: 'Success',
        description: 'Profile updated successfully',
        color: 'success'
      })

      // Refresh user data
      await fetchUser()
    }
  } catch (e: any) {
    toast.add({
      title: 'Error',
      description: e.data?.message || 'Failed to update profile',
      color: 'error'
    })
  } finally {
    loadingProfile.value = false
  }
}

const onPasswordSubmit = async (event: FormSubmitEvent<PasswordSchema>) => {
  loadingPassword.value = true

  try {
    const response = await $fetch<any>('/api/user/password', {
      method: 'PUT',
      body: {
        currentPassword: event.data.currentPassword,
        newPassword: event.data.newPassword
      }
    })

    if (response.success) {
      toast.add({
        title: 'Success',
        description: 'Password updated successfully',
        color: 'success'
      })

      // Reset password form
      passwordState.currentPassword = ''
      passwordState.newPassword = ''
      passwordState.confirmPassword = ''
    }
  } catch (e: any) {
    toast.add({
      title: 'Error',
      description: e.data?.message || 'Failed to update password',
      color: 'error'
    })
  } finally {
    loadingPassword.value = false
  }
}

const handleAvatarSelected = (files: Cloudinary.IResource[]) => {
  if (files.length > 0) {
    profileState.avatar = files[0].secure_url
    showAvatarManager.value = false
  }
}

useSeoMeta({
  title: 'Profile Settings',
  robots: 'noindex, nofollow'
})
</script>

<template>
  <div class="max-w-4xl mx-auto space-y-8">
    <div>
      <h1 class="text-3xl font-bold">Profile Settings</h1>
      <p class="text-gray-500 mt-2">Manage your account settings and preferences</p>
    </div>

    <!-- Profile Information -->
    <UCard>
      <template #header>
        <h2 class="text-xl font-bold">Profile Information</h2>
      </template>

      <UForm :schema="profileSchema" :state="profileState" class="space-y-6" @submit="onProfileSubmit">
        <!-- Avatar -->
        <div class="flex items-center gap-6">
          <UAvatar :src="profileState.avatar" :alt="profileState.name" size="3xl" />
          <div>
            <UButton icon="i-lucide-upload" variant="outline" @click="showAvatarManager = true">
              Change Avatar
            </UButton>
            <p class="text-sm text-gray-500 mt-2">Click to upload a new avatar from Cloudinary</p>
          </div>
        </div>

        <!-- Name -->
        <UFormField label="Name" name="name" required>
          <UInput v-model="profileState.name" placeholder="Your name" />
        </UFormField>

        <!-- Email -->
        <UFormField label="Email" name="email" required>
          <UInput v-model="profileState.email" type="email" placeholder="your@email.com" />
        </UFormField>

        <!-- Bio -->
        <UFormField label="Bio" name="bio">
          <UTextarea v-model="profileState.bio" placeholder="Tell us about yourself..." :rows="4" />
        </UFormField>

        <!-- Submit Button -->
        <div class="flex justify-end">
          <UButton type="submit" :loading="loadingProfile">
            Save Changes
          </UButton>
        </div>
      </UForm>
    </UCard>

    <!-- Change Password -->
    <UCard>
      <template #header>
        <h2 class="text-xl font-bold">Change Password</h2>
      </template>

      <UForm :schema="passwordSchema" :state="passwordState" class="space-y-6" @submit="onPasswordSubmit">
        <!-- Current Password -->
        <UFormField label="Current Password" name="currentPassword" required>
          <UInput v-model="passwordState.currentPassword" type="password" placeholder="Enter current password" />
        </UFormField>

        <!-- New Password -->
        <UFormField label="New Password" name="newPassword" required>
          <UInput v-model="passwordState.newPassword" type="password" placeholder="Enter new password" />
        </UFormField>

        <!-- Confirm Password -->
        <UFormField label="Confirm New Password" name="confirmPassword" required>
          <UInput v-model="passwordState.confirmPassword" type="password" placeholder="Confirm new password" />
        </UFormField>

        <!-- Submit Button -->
        <div class="flex justify-end">
          <UButton type="submit" :loading="loadingPassword" color="primary">
            Update Password
          </UButton>
        </div>
      </UForm>
    </UCard>

    <!-- Cloudinary Manager Modal -->
    <admin-cloudinary-manager v-if="showAvatarManager" mode="modal" :multiple="false" @close="showAvatarManager = false"
      @selected-files="handleAvatarSelected" />
  </div>
</template>
