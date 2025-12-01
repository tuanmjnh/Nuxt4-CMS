<script setup lang="ts">
import * as z from 'zod'
import type { FormSubmitEvent } from '@nuxt/ui'

definePageMeta({ layout: 'auth' })

const schema = z.object({
  usernameOrEmail: z.string({ message: 'Invalid email or username' }).min(5, 'Must be at least 5 characters'),
  password: z.string({ message: 'Password is required' }).min(8, 'Must be at least 8 characters')
})

type Schema = z.output<typeof schema>

const router = useRouter()
const { login } = useAuth()
const toast = useToast()
const state = reactive<Partial<Schema>>({
  usernameOrEmail: undefined,
  password: undefined
})

const loading = ref(false)
const onSubmit = async (event: FormSubmitEvent<Schema>) => {
  loading.value = true

  try {
    await login(event.data.usernameOrEmail, event.data.password)
    router.push('/admin')
  } catch (e: any) {
    toast.add({
      title: 'Error',
      description: e.message,
      color: 'error'
    })
  } finally {
    loading.value = false
  }
}

useSeoMeta({
  title: 'Admin Login', // Keeping this static or use t() if needed, but useSeoMeta might need computed if using t
  robots: 'noindex, nofollow'
})
</script>
<template>
  <UContainer class="py-12">
    <div class="max-w-md mx-auto">
      <div class="bg-white dark:bg-gray-800 rounded-lg shadow-lg p-8">
        <h1 class="text-2xl font-bold mb-6 text-center">{{ $t('auth.login') }}</h1>

        <UForm :schema="schema" :state="state" class="space-y-4" @submit="onSubmit">
          <UFormField :label="$t('auth.email')" name="usernameOrEmail">
            <UInput v-model="state.usernameOrEmail" placeholder="admin or admin@example.com" />
          </UFormField>

          <UFormField :label="$t('auth.password')" name="password">
            <UInput v-model="state.password" type="password" :placeholder="$t('auth.password')" />
          </UFormField>

          <UButton type="submit" block :loading="loading">
            {{ $t('auth.login') }}
          </UButton>
        </UForm>
      </div>
    </div>
  </UContainer>
</template>
