<script setup lang="ts">
import type { TableColumn } from '@nuxt/ui'
definePageMeta({
  layout: 'admin',
  middleware: 'admin'
})
const route = useRoute()
const router = useRouter()
const toast = useToast()
const { t } = useI18n()

const userId = route.params.id as string
const loading = ref(false)
const form = ref({
  name: '',
  username: '',
  email: '',
  role: '',
  category: '',
  bio: '',
  isActive: true
})

const roles = ref<Models.Role[]>([])
const categories = ref<Models.Category[]>([])
const sessions = ref<Models.UserSession[]>([])

const roleOptions = computed(() => roles.value)
const categoryOptions = computed(() => categories.value)

const sessionColumns = computed(() => [
  { accessorKey: 'deviceType', header: t('settings.device') },
  { accessorKey: 'ip', header: t('settings.ip_address') },
  { accessorKey: 'lastActiveAt', header: t('settings.last_active') },
  { id: 'actions', header: t('common.actions') }
] as TableColumn<Models.UserSession>[])

const fetchData = async () => {
  try {
    const [userRes, rolesRes, categoriesRes, sessionsRes] = await Promise.all([
      useAPI<any>(`/api/users/${userId}`),
      useAPI<any>('/api/roles'),
      useAPI<any>('/api/categories?type=user'),
      useAPI<any>(`/api/users/${userId}/sessions`)
    ])

    const user = userRes.data.value
    form.value = {
      name: user.name,
      username: user.username,
      email: user.email,
      role: (user.role as any)?._id || user.role,
      category: (user.category as any)?._id || user.category,
      bio: user.bio,
      isActive: user.isActive
    }

    roles.value = rolesRes.data.value?.data || rolesRes.data.value || []
    categories.value = categoriesRes.data.value?.data || categoriesRes.data.value || []
    sessions.value = sessionsRes.data.value?.data || sessionsRes.data.value || []

  } catch (error: any) {
    toast.add({ title: t('common.error_fetching_data'), description: error.message, color: 'error' })
    router.push('/admin/users')
  }
}

const updateUser = async () => {
  loading.value = true
  try {
    await useAPI(`/api/users/${userId}`, {
      method: 'PUT',
      body: form.value
    })
    toast.add({ title: t('users.update_success') })
  } catch (error: any) {
    toast.add({ title: t('users.update_error'), description: error.message, color: 'error' })
  } finally {
    loading.value = false
  }
}

const revokeSession = async (sessionId: string) => {
  if (!confirm(t('settings.revoke_confirm'))) return

  try {
    await useAPI(`/api/users/${userId}/sessions`, {
      method: 'DELETE',
      body: { sessionId }
    })
    // Refresh sessions
    const { data } = await useAPI<any>(`/api/users/${userId}/sessions`)
    sessions.value = data.value?.data || []
    toast.add({ title: t('settings.session_revoked') })
  } catch (error: any) {
    toast.add({ title: t('settings.revoke_error'), description: error.message, color: 'error' })
  }
}

onMounted(() => {
  fetchData()
})
</script>

<template>
  <div class="max-w-2xl mx-auto space-y-6">
    <div class="flex items-center justify-between">
      <h1 class="text-2xl font-bold">{{ $t('users.edit') }}</h1>
      <UButton to="/admin/users" color="neutral" variant="ghost" icon="i-lucide-arrow-left">{{ $t('common.back') }}
      </UButton>
    </div>

    <UCard>
      <template #header>
        <h2 class="text-lg font-semibold">{{ $t('users.info') }}</h2>
      </template>

      <form @submit.prevent="updateUser" class="space-y-4">
        <UFormField :label="$t('common.name')" name="name" required>
          <UInput v-model="form.name" />
        </UFormField>

        <UFormField :label="$t('auth.username')" name="username" required>
          <UInput v-model="form.username" />
        </UFormField>

        <UFormField :label="$t('auth.email')" name="email" required>
          <UInput v-model="form.email" type="email" />
        </UFormField>

        <UFormField :label="$t('users.role')" name="role" required>
          <USelect v-model="form.role" :options="roleOptions" option-attribute="name" value-attribute="_id" />
        </UFormField>

        <UFormField :label="$t('common.category')" name="category">
          <USelect v-model="form.category" :options="categoryOptions" option-attribute="name" value-attribute="_id"
            :placeholder="$t('common.select_category')" />
        </UFormField>

        <UFormField :label="$t('users.bio')" name="bio">
          <UTextarea v-model="form.bio" />
        </UFormField>

        <UFormField name="isActive">
          <UCheckbox v-model="form.isActive" :label="$t('common.active')" />
        </UFormField>

        <div class="flex justify-end">
          <UButton type="submit" :loading="loading">{{ $t('users.update') }}</UButton>
        </div>
      </form>
    </UCard>

    <!-- User Sessions -->
    <UCard>
      <template #header>
        <h2 class="text-lg font-semibold">{{ $t('settings.active_sessions') }}</h2>
      </template>

      <UTable :rows="sessions" :columns="sessionColumns">
        <template #lastActiveAt-cell="{ row }">
          {{ row.original.lastActiveAt ? new Date(String(row.original.lastActiveAt)).toLocaleString() : '' }}
        </template>
        <template #actions-cell="{ row }">
          <UButton color="error" variant="ghost" icon="i-lucide-trash-2" size="xs"
            @click="revokeSession(row.original?._id || '')" />
        </template>
      </UTable>
    </UCard>
  </div>
</template>