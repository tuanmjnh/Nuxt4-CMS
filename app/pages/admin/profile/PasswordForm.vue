<script setup lang="ts">
import * as z from 'zod'
import type { FormSubmitEvent } from '@nuxt/ui'

const toast = useToast()

// Password form schema
const passwordSchema = z.object({
  currentPassword: z.string().min(8, $t('error.min_chars', { min: 8 })),
  newPassword: z.string().min(8, $t('error.min_chars', { min: 8 })),
  confirmPassword: z.string().min(8, $t('error.min_chars', { min: 8 }))
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

const loading = ref(false)
const formRef = ref()

// Methods
const onSubmit = async (event: FormSubmitEvent<PasswordSchema>) => {
  loading.value = true

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
    toast.add({ title: $t('common.error'), description: $t(e.statusMessage) || $t('auth.password_error'), color: 'error' })
  } finally {
    loading.value = false
  }
}
</script>

<template>
  <UCard :ui="{ body: 'flex justify-center' }">
    <template #header>
      <div class="flex items-center justify-between">
        <h1 class="text-2xl font-bold">{{ $t('auth.change_password') }}</h1>
        <UButton type="submit" variant="soft" :loading="loading" @click="formRef?.submit()">
          {{ $t('auth.update_password') }}
        </UButton>
      </div>
    </template>
    <UForm ref="formRef" :schema="passwordSchema" :state="passwordState" class="space-y-6" @submit="onSubmit">
      <!-- Current Password -->
      <UFormField :label="$t('auth.current_password')" name="currentPassword" required>
        <UInput v-model="passwordState.currentPassword" type="password" class="w-full"
          :placeholder="$t('auth.current_password_placeholder')" />
      </UFormField>

      <!-- New Password -->
      <UFormField :label="$t('auth.new_password')" name="newPassword" required>
        <UInput v-model="passwordState.newPassword" type="password" class="w-full"
          :placeholder="$t('auth.new_password_placeholder')" />
      </UFormField>

      <!-- Confirm Password -->
      <UFormField :label="$t('auth.confirm_new_password')" name="confirmPassword" required>
        <UInput v-model="passwordState.confirmPassword" type="password" class="w-full"
          :placeholder="$t('auth.confirm_new_password_placeholder')" />
      </UFormField>
    </UForm>
  </UCard>
</template>
