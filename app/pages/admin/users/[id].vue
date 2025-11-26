<template>
  <div class="max-w-2xl mx-auto space-y-6">
    <div class="flex items-center justify-between">
      <h1 class="text-2xl font-bold">Edit User</h1>
      <UButton to="/admin/users" color="neutral" variant="ghost" icon="i-lucide-arrow-left">Back</UButton>
    </div>

    <UCard>
      <template #header>
        <h2 class="text-lg font-semibold">User Information</h2>
      </template>

      <form @submit.prevent="updateUser" class="space-y-4">
        <UFormGroup label="Name" name="name" required>
          <UInput v-model="form.name" />
        </UFormGroup>

        <UFormGroup label="Username" name="username" required>
          <UInput v-model="form.username" />
        </UFormGroup>

        <UFormGroup label="Email" name="email" required>
          <UInput v-model="form.email" type="email" />
        </UFormGroup>

        <UFormGroup label="Role" name="role" required>
          <USelect v-model="form.role" :options="roleOptions" option-attribute="name" value-attribute="_id" />
        </UFormGroup>

        <UFormGroup label="Category" name="category">
          <USelect v-model="form.category" :options="categoryOptions" option-attribute="name" value-attribute="_id"
            placeholder="Select category (optional)" />
        </UFormGroup>

        <UFormGroup label="Bio" name="bio">
          <UTextarea v-model="form.bio" />
        </UFormGroup>

        <UFormGroup name="isActive">
          <UCheckbox v-model="form.isActive" label="Active" />
        </UFormGroup>

        <div class="flex justify-end">
          <UButton type="submit" :loading="loading">Update User</UButton>
        </div>
      </form>
    </UCard>

    <!-- User Sessions -->
    <UCard>
      <template #header>
        <h2 class="text-lg font-semibold">Active Sessions</h2>
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

<script setup lang="ts">
import type { TableColumn } from '@nuxt/ui'

const route = useRoute()
const router = useRouter()
const toast = useToast()

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

const sessionColumns: TableColumn<Models.UserSession>[] = [
  { accessorKey: 'deviceType', header: 'Device' },
  { accessorKey: 'ip', header: 'IP Address' },
  { accessorKey: 'lastActiveAt', header: 'Last Active' },
  { id: 'actions', header: 'Actions' }
]

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
    toast.add({ title: 'Error fetching data', description: error.message, color: 'error' })
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
    toast.add({ title: 'User updated successfully' })
  } catch (error: any) {
    toast.add({ title: 'Error updating user', description: error.message, color: 'error' })
  } finally {
    loading.value = false
  }
}

const revokeSession = async (sessionId: string) => {
  if (!confirm('Are you sure you want to revoke this session?')) return

  try {
    await useAPI(`/api/users/${userId}/sessions`, {
      method: 'DELETE',
      body: { sessionId }
    })
    // Refresh sessions
    const { data } = await useAPI<any>(`/api/users/${userId}/sessions`)
    sessions.value = data.value?.data || []
    toast.add({ title: 'Session revoked' })
  } catch (error: any) {
    toast.add({ title: 'Error revoking session', description: error.message, color: 'error' })
  }
}

onMounted(() => {
  fetchData()
})
</script>
