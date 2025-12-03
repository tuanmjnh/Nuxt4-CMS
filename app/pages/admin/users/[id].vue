<script setup lang="ts">
import type { TableColumn } from '@nuxt/ui'
definePageMeta({
  layout: 'admin',
  middleware: 'admin'
})
const route = useRoute()
const router = useRouter()
const toast = useToast()

const userId = route.params.id as string
const loading = ref(false)
const showRevokeModal = ref(false)
const sessionToRevoke = ref<string | null>(null)

const form = ref({
  name: '',
  username: '',
  email: '',
  roles: [] as string[],
  category: '',
  bio: '',
  personNumber: '',
  region: '',
  dateBirth: undefined as number | undefined,
  gender: 'other',
  address: '',
  avatar: undefined as any,
  isActive: true
})

const roles = ref<Models.Role[]>([])
const categories = ref<Models.Category[]>([])
const sessions = ref<Models.UserSession[]>([])

const roleOptions = computed(() => roles.value)
const categoryOptions = computed(() => categories.value.map(c => {
  const { type, ...rest } = c
  return rest
}))

const sessionColumns = computed(() => [
  { accessorKey: 'deviceType', header: $t('settings.device') },
  { accessorKey: 'ip', header: $t('settings.ip_address') },
  { accessorKey: 'lastActiveAt', header: $t('settings.last_active') },
  { id: 'actions', header: $t('common.actions') }
] as TableColumn<Models.UserSession>[])

const fetchData = async () => {
  try {
    const [userRes, rolesRes, categoriesRes, sessionsRes] = await Promise.all([
      useAPI<any>(`/api/users/${userId}`),
      useAPI<any>('/api/roles'),
      useAPI<any>('/api/categories?type=user'),
      useAPI<any>(`/api/users/${userId}/sessions`)
    ])

    const user = userRes.data.value?.data || userRes.data.value
    form.value = {
      name: user.name,
      username: user.username,
      email: user.email,
      roles: user.roles?.map((r: any) => r._id || r) || [],
      category: (user.category as any)?._id || user.category,
      bio: user.bio,
      personNumber: user.personNumber,
      region: user.region,
      dateBirth: user.dateBirth,
      gender: user.gender,
      address: user.address,
      avatar: user.avatar,
      isActive: user.isActive
    }

    roles.value = rolesRes.data.value?.data || rolesRes.data.value || []
    categories.value = categoriesRes.data.value?.data || categoriesRes.data.value || []
    sessions.value = sessionsRes.data.value?.data || sessionsRes.data.value || []

  } catch (error: any) {
    toast.add({ title: $t('common.error_fetching_data'), description: error.message, color: 'error' })
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
    toast.add({ title: $t('users.update_success') })
  } catch (error: any) {
    toast.add({ title: $t('users.update_error'), description: error.message, color: 'error' })
  } finally {
    loading.value = false
  }
}

const confirmRevoke = (sessionId: string) => {
  sessionToRevoke.value = sessionId
  showRevokeModal.value = true
}

const handleRevoke = async () => {
  if (!sessionToRevoke.value) return

  try {
    await useAPI(`/api/users/${userId}/sessions`, {
      method: 'DELETE',
      body: { sessionId: sessionToRevoke.value }
    })
    // Refresh sessions
    const { data } = await useAPI<any>(`/api/users/${userId}/sessions`)
    sessions.value = data.value?.data || []
    toast.add({ title: $t('settings.session_revoked') })
  } catch (error: any) {
    toast.add({ title: $t('settings.revoke_error'), description: error.message, color: 'error' })
  } finally {
    showRevokeModal.value = false
    sessionToRevoke.value = null
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
        <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
          <UFormField :label="$t('common.name')" name="name" required>
            <UInput v-model="form.name" />
          </UFormField>

          <UFormField :label="$t('auth.username')" name="username" required>
            <UInput v-model="form.username" />
          </UFormField>

          <UFormField :label="$t('auth.email')" name="email" required>
            <UInput v-model="form.email" type="email" />
          </UFormField>

          <UFormField :label="$t('users.role')" name="roles" required>
            <USelectMenu v-model="form.roles" :items="roleOptions" label-key="name" value-key="_id" multiple />
          </UFormField>

          <UFormField :label="$t('common.category')" name="category">
            <USelect v-model="form.category" :items="categoryOptions" label-key="name" value-key="_id"
              :placeholder="$t('common.select_category')" />
          </UFormField>

          <UFormField :label="$t('users.person_number')" name="personNumber">
            <UInput v-model="form.personNumber" />
          </UFormField>

          <UFormField :label="$t('users.region')" name="region">
            <UInput v-model="form.region" />
          </UFormField>

          <UFormField :label="$t('users.date_birth')" name="dateBirth">
            <UInput type="date"
              :model-value="form.dateBirth ? new Date(form.dateBirth).toISOString().split('T')[0] : ''"
              @update:model-value="val => form.dateBirth = val ? new Date(val).getTime() : undefined" />
          </UFormField>

          <UFormField :label="$t('users.gender')" name="gender">
            <USelect v-model="form.gender"
              :items="[{ label: $t('users.gender_male'), value: 'male' }, { label: $t('users.gender_female'), value: 'female' }, { label: $t('users.gender_other'), value: 'other' }]" />
          </UFormField>

          <UFormField :label="$t('users.address')" name="address" class="col-span-full">
            <UTextarea v-model="form.address" />
          </UFormField>

          <UFormField :label="$t('users.avatar')" name="avatar" class="col-span-full">
            <AdminMediaGallery v-model="form.avatar" :max="1" />
          </UFormField>
        </div>

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
            @click="confirmRevoke(row.original?._id || '')" />
        </template>
      </UTable>
    </UCard>

    <ConfirmModal v-model="showRevokeModal" :title="$t('settings.revoke')" :description="$t('settings.revoke_confirm')"
      color="error" @confirm="handleRevoke" @cancel="showRevokeModal = false" />
  </div>
</template>