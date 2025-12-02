<script setup lang="ts">
definePageMeta({
  layout: 'admin',
  middleware: 'admin'
})
import type { TableColumn } from '@nuxt/ui'
const users = ref<Models.User[]>([])
const loading = ref(false)
const toast = useToast()

const columns = computed(() => [
  { accessorKey: 'name', header: $t('common.name') },
  { accessorKey: 'username', header: $t('auth.username') },
  { accessorKey: 'email', header: $t('auth.email') },
  { id: 'role', header: $t('users.role') },
  { id: 'isActive', header: $t('common.status') },
  { id: 'actions', header: $t('common.actions') }
] as TableColumn<Models.User>[])

const fetchUsers = async () => {
  loading.value = true
  try {
    const { data } = await useAPI<any>('/api/users')
    users.value = data.value || []
  } catch (error) {
    toast.add({ title: $t('users.fetch_error'), color: 'error' })
  } finally {
    loading.value = false
  }
}

const deleteUser = async (user: any) => {
  if (!confirm($t('common.confirm_delete'))) return

  try {
    await useAPI(`/api/users/${user._id}`, { method: 'DELETE' })
    await fetchUsers()
    toast.add({ title: $t('users.delete_success') })
  } catch (error: any) {
    toast.add({ title: $t('users.delete_error'), description: error.message, color: 'error' })
  }
}

const getRoleName = (role: any) => {
  if (typeof role === 'object' && role && 'name' in role) {
    return role.name
  }
  return typeof role === 'string' ? role : ''
}

onMounted(() => {
  fetchUsers()
})
</script>

<template>
  <UCard>
    <template #header>
      <div class="flex items-center justify-between">
        <h1 class="text-2xl font-bold">{{ $t('users.title') }}</h1>
        <UButton to="/admin/users/create" icon="i-lucide-plus">{{ $t('common.create') }} {{ $t('users.title') }}
        </UButton>
      </div>
    </template>
    <UTable :rows="users" :columns="columns" :loading="loading">
      <template #role-cell="{ row }">
        <UBadge :color="getRoleName(row.original.role) === 'admin' ? 'error' : 'primary'" variant="subtle">
          {{ getRoleName(row.original.role) }}
        </UBadge>
      </template>

      <template #isActive-cell="{ row }">
        <UBadge :color="row.original.isActive ? 'success' : 'neutral'" variant="subtle">
          {{ row.original.isActive ? $t('common.active') : $t('common.inactive') }}
        </UBadge>
      </template>

      <template #actions-cell="{ row }">
        <div class="flex gap-2">
          <UButton :to="`/admin/users/${row.original._id}`" color="neutral" variant="ghost" icon="i-lucide-edit"
            size="xs" />
          <UButton color="error" variant="ghost" icon="i-lucide-trash-2" size="xs" @click="deleteUser(row)" />
        </div>
      </template>
    </UTable>
  </UCard>
</template>