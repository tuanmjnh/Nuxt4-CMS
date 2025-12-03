<script setup lang="ts">
import { useInfiniteScroll } from '@vueuse/core'
import type { TableColumn } from '@nuxt/ui'

definePageMeta({
  layout: 'admin',
  middleware: 'admin'
})

const toast = useToast()
const users = ref<Models.User[]>([])
const cursor = ref<string | number | null>(null)
const canLoadMore = ref(true)
const container = useTemplateRef('container')
const showDeleteModal = ref(false)
const userToDelete = ref<any>(null)

const columns = computed(() => [
  { accessorKey: 'name', header: $t('common.name') },
  { accessorKey: 'username', header: $t('auth.username') },
  { accessorKey: 'email', header: $t('auth.email') },
  { id: 'roles', header: $t('users.role') },
  { id: 'isActive', header: $t('common.status') },
  { id: 'actions', header: $t('common.actions') }
] as TableColumn<Models.User>[])

const { data, status, refresh } = await useAPI<any>('/api/users/items', {
  method: 'POST',
  body: computed(() => ({
    cursor: cursor.value,
    limit: 20
  })),
  lazy: true,
  immediate: false
})

watch(data, (newData) => {
  if (!newData?.data) return

  if (!cursor.value) {
    users.value = newData.data
  } else {
    users.value.push(...newData.data)
  }

  canLoadMore.value = !!newData.nextCursor
})

// Initial load
refresh()

onMounted(() => {
  useInfiniteScroll(container, () => {
    if (data.value?.nextCursor) {
      cursor.value = data.value.nextCursor
    }
  }, {
    distance: 50,
    canLoadMore: () => {
      return status.value !== 'pending' && canLoadMore.value
    }
  })
})

const confirmDelete = (user: any) => {
  userToDelete.value = user
  showDeleteModal.value = true
}

const deleteUser = async () => {
  if (!userToDelete.value) return

  try {
    await useAPI(`/api/users/${userToDelete.value._id}`, { method: 'DELETE' })
    // Remove from list directly
    users.value = users.value.filter(u => u._id !== userToDelete.value._id)
    toast.add({ title: $t('users.delete_success') })
  } catch (error: any) {
    toast.add({ title: $t('users.delete_error'), description: error.message, color: 'error' })
  } finally {
    showDeleteModal.value = false
    userToDelete.value = null
  }
}

const getRoleName = (role: any) => {
  if (typeof role === 'object' && role && 'name' in role) return role.name
  return typeof role === 'string' ? role : ''
}
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

    <div ref="container" class="flex-1 overflow-y-auto" style="height: calc(100vh - 300px);">
      <UTable :rows="users" :columns="columns" :loading="status === 'pending'" sticky>
        <template #roles-cell="{ row }">
          <div class="flex flex-wrap gap-1">
            <UBadge v-for="role in row.original.roles" :key="typeof role === 'object' ? role._id : role"
              :color="getRoleName(role) === 'admin' ? 'error' : 'primary'" variant="subtle">
              {{ getRoleName(role) }}
            </UBadge>
          </div>
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
            <UButton color="error" variant="ghost" icon="i-lucide-trash-2" size="xs"
              @click="confirmDelete(row.original)" />
          </div>
        </template>
        <template #empty>
          <UEmpty size="xl" icon="i-lucide-users" :title="$t('common.no_data')" :description="$t('common.no_data_desc')"
            :actions="[
              {
                icon: 'i-lucide-refresh-cw',
                label: $t('common.refresh'),
                color: 'neutral',
                variant: 'subtle',
                onClick: () => {
                  cursor = null
                  refresh()
                }
              }
            ]" />
        </template>
      </UTable>
      <div v-if="!canLoadMore && users.length > 0" class="text-center p-4 text-gray-500 dark:text-gray-400 text-sm">
        {{ $t('common.no_more_data') }}
      </div>
    </div>
  </UCard>

  <!-- Delete Confirmation Modal -->
  <ConfirmModal v-model="showDeleteModal" :title="$t('users.delete_title')" :description="$t('common.confirm_delete')"
    color="error" @confirm="deleteUser" @cancel="showDeleteModal = false" />
</template>