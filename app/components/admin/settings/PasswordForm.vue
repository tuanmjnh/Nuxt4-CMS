<script setup lang="ts">
import * as z from 'zod'
import type { FormSubmitEvent } from '@nuxt/ui'

const toast = useToast()

// Password form schema
const passwordSchema = z.object({
  currentPassword: z.string().min(8, $t('validation.password_min')),
  newPassword: z.string().min(8, $t('validation.password_min')),
  confirmPassword: z.string().min(8, $t('validation.password_min'))
}).refine((data) => data.newPassword === data.confirmPassword, {
  message: $t('validation.passwords_mismatch'),
  path: ["confirmPassword"],
})

type PasswordSchema = z.output<typeof passwordSchema>

// State
const passwordState = reactive<Partial<PasswordSchema>>({
  currentPassword: '',
  newPassword: '',
  confirmPassword: ''
})

const loadingPassword = ref(false)

// Methods
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
      toast.add({ title: $t('common.success'), description: $t('auth.password_updated'), color: 'success' })

      // Reset password form
      passwordState.currentPassword = ''
      passwordState.newPassword = ''
      passwordState.confirmPassword = ''
    }
  } catch (e: any) {
    toast.add({ title: $t('common.error'), description: e.data?.message || $t('auth.password_error'), color: 'error' })
  } finally {
    loadingPassword.value = false
  }
}
</script>

<template>
  <UCard>
    <template #header>
      <h2 class="text-xl font-bold">{{ $t('auth.change_password') }}</h2>
    </template>

    <UForm :schema="passwordSchema" :state="passwordState" class="space-y-6" @submit="onPasswordSubmit">
      <!-- Current Password -->
      <UFormField :label="$t('auth.current_password')" name="currentPassword" required>
        <UInput v-model="passwordState.currentPassword" type="password"
          :placeholder="$t('auth.current_password_placeholder')" />
      </UFormField>

      <!-- New Password -->
      <UFormField :label="$t('auth.new_password')" name="newPassword" required>
        <UInput v-model="passwordState.newPassword" type="password"
          :placeholder="$t('auth.new_password_placeholder')" />
      </UFormField>

      <!-- Confirm Password -->
      <UFormField :label="$t('auth.confirm_new_password')" name="confirmPassword" required>
        <UInput v-model="passwordState.confirmPassword" type="password"
          :placeholder="$t('auth.confirm_new_password_placeholder')" />
      </UFormField>

      <!-- Submit Button -->
      <div class="flex justify-end">
        <UButton type="submit" :loading="loadingPassword" color="primary">
          {{ $t('auth.update_password') }}
        </UButton>
      </div>
    </UForm>
  </UCard>
</template>
