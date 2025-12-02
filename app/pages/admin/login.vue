<script setup lang="ts">
const runtimeConfig = useRuntimeConfig()
import * as z from 'zod'
import type { FormSubmitEvent, AuthFormField } from '@nuxt/ui'
definePageMeta({ layout: 'auth' })

const toast = useToast()
const router = useRouter()
const loading = ref(false)
const { login } = useAuth()

const fields: AuthFormField[] = [{
  name: 'usernameOrEmail',
  type: 'text',
  label: $t('auth.usernameOrEmail'),
  placeholder: $t('auth.usernameOrEmail'),
  required: true
}, {
  name: 'password',
  label: $t('auth.password'),
  type: 'password',
  placeholder: $t('auth.password'),
  required: true
}, {
  name: 'remember',
  label: $t('auth.remember'),
  type: 'checkbox'
}]

const providers = [
  {
    label: 'Google',
    icon: 'i-simple-icons-google',
    onClick: () => {
      toast.add({ title: 'Google', description: $t('auth.login_with_google') })
    }
  },
  {
    label: 'GitHub',
    icon: 'i-simple-icons-github',
    onClick: () => {
      toast.add({ title: 'GitHub', description: $t('auth.login_with_github') })
    }
  }
]

const schema = z.object({
  usernameOrEmail: z.string({ message: $t('auth.invalid_email_or_username') }).min(5, $t('error.min_chars', { min: 5 })),
  password: z.string({ message: $t('error.required') }).min(8, $t('error.min_chars', { min: 8 }))
})

type Schema = z.output<typeof schema>

const onSubmit = async (event: FormSubmitEvent<Schema>) => {
  loading.value = true

  try {
    // const { startLoading, stopLoading } = useLoading()
    // startLoading()
    await login(event.data.usernameOrEmail, event.data.password)
    // Don't stop loading here, let the admin layout handle it or keep it until mounted
    router.push('/admin')
  } catch (e: any) {
    // const { stopLoading } = useLoading()
    // stopLoading()
    toast.add({
      title: $t('error.error'),
      description: e.statusMessage ? $t(e.statusMessage) : e.message,
      color: 'error'
    })
  } finally {
    loading.value = false
  }
}

useSeoMeta({
  title: runtimeConfig.public.siteName, // Keeping this static or use t() if needed, but useSeoMeta might need computed if using t
  robots: 'noindex, nofollow'
})
</script>
<template>
  <!-- <UContainer class="py-12">
    <div class="max-w-md mx-auto">
      <div class="bg-white dark:bg-gray-800 rounded-lg shadow-lg p-8">
        <h1 class="text-2xl font-bold mb-6 text-center">{{ $t('auth.login') }}</h1>

        <UForm :schema="schema" :state="state" class="space-y-4" @submit="onSubmit">
          <UFormField :label="$t('auth.usernameOrEmail')" name="usernameOrEmail">
            <UInput v-model="state.usernameOrEmail" :placeholder="$t('auth.usernameOrEmail')" />
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
  </UContainer> -->
  <div class="flex flex-col items-center justify-center gap-4 p-4">
    <UPageCard class="w-full max-w-md">
      <UAuthForm :schema="schema" :title="$t('auth.login')" :description="$t('auth.login_description')"
        :loading="loading" icon="i-lucide-user" :fields="fields" :providers="providers" @submit.prevent="onSubmit" />
    </UPageCard>
  </div>
</template>
