<script setup lang="ts">
import { useInfiniteScroll } from '@vueuse/core'
import type { TableColumn } from '@nuxt/ui'

definePageMeta({
  layout: 'admin',
  middleware: 'admin'
})

const toast = useToast()

const roles = ref<Models.Role[]>([])
const cursor = ref<string | number | Date | null>(null)
const canLoadMore = ref(true)
const container = useTemplateRef('container')
const search = ref('')

const { data: routesData } = await useFetch<any>('/api/admin/routes')

// Transform routes to tree
const routeTree = computed(() => {
  const routes = JSON.parse(JSON.stringify(routesData.value?.data || []))
  const map: any = {}
  const roots: any[] = []

  routes.forEach((route: any) => {
    map[route._id] = { ...route, children: [] }
  })

  routes.forEach((route: any) => {
    const parentId = typeof route.parent === 'object' ? route.parent?._id : route.parent
    if (parentId && map[parentId]) {
      map[parentId].children.push(map[route._id])
    } else {
      roots.push(map[route._id])
    }
  })

  const sortRoutes = (list: any[]) => {
    list.sort((a, b) => a.sortOrder - b.sortOrder)
    list.forEach(item => sortRoutes(item.children))
  }
  sortRoutes(roots)

  return roots
})

const { data, status, refresh } = await useAPI<ApiResponse<Models.Role[]>>('/api/roles/items', {
  method: 'POST',
  body: computed(() => ({
    cursor: cursor.value,
    limit: 20,
    search: search.value
  })),
  lazy: true,
  immediate: false
})

watch(data, (newData) => {
  if (!newData?.data) return

  if (!cursor.value) {
    roles.value = newData.data
  } else {
    roles.value.push(...newData.data)
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

const showModal = ref(false)
const showDeleteModal = ref(false)
const saving = ref(false)
const isEditing = ref(false)
const editingId = ref('')
const roleToDelete = ref<Models.Role | null>(null)

const form = ref({
  name: '',
  description: '',
  permissions: [] as string[],
  isDefault: false
})

const columns = computed(() => [
  { accessorKey: 'name', header: $t('common.name') },
  { accessorKey: 'description', header: $t('common.description') },
  { id: 'permissions', header: $t('roles.permissions') },
  { id: 'actions', header: $t('common.actions') }
] as TableColumn<Models.Role>[])


const openCreateModal = () => {
  isEditing.value = false
  editingId.value = ''
  form.value = { name: '', description: '', permissions: [], isDefault: false }
  showModal.value = true
}

const openEditModal = (role: any) => {
  isEditing.value = true
  editingId.value = role._id
  form.value = {
    name: role.name,
    description: role.description || '',
    permissions: role.permissions || [],
    isDefault: role.isDefault || false
  }
  showModal.value = true
}

const confirmDelete = (role: any) => {
  roleToDelete.value = role
  showDeleteModal.value = true
}

const handleDelete = async () => {
  if (!roleToDelete.value) return

  try {
    await $fetch(`/api/roles/${roleToDelete.value._id}`, { method: 'DELETE' })
    toast.add({ title: $t('roles.delete_success') })
    // Remove from list directly
    roles.value = roles.value.filter(r => r._id !== roleToDelete.value?._id)
  } catch (error: any) {
    toast.add({ title: $t('common.error'), description: error.message, color: 'error' })
  } finally {
    showDeleteModal.value = false
    roleToDelete.value = null
  }
}

const handleSubmit = async () => {
  saving.value = true
  try {
    // Calculate allowedRoutes based on permissions
    // If a route has 'view' permission, add its ID to allowedRoutes
    const allRoutes = routesData.value?.data || []
    const allowedRoutes = allRoutes.filter((route: any) => {
      const viewPerm = `${route.name.toLowerCase()}.view`
      return form.value.permissions.includes(viewPerm)
    }).map((r: any) => r._id)

    const payload = {
      ...form.value,
      allowedRoutes
    }

    if (isEditing.value) {
      await $fetch(`/api/roles/${editingId.value}`, {
        method: 'PUT',
        body: payload
      })
      toast.add({ title: $t('roles.update_success') })
      // Update local item
      const index = roles.value.findIndex(r => r._id === editingId.value)
      if (index !== -1) {
        const existingRole = roles.value[index]
        if (existingRole) roles.value[index] = { ...existingRole, ...payload }
      }
    } else {
      await $fetch('/api/roles', {
        method: 'POST',
        body: payload
      })
      toast.add({ title: $t('roles.create_success') })
      cursor.value = null
      refresh()
    }
    showModal.value = false
  } catch (error: any) {
    toast.add({ title: $t('common.error'), description: error.message, color: 'error' })
  } finally {
    saving.value = false
  }
}
</script>

<template>
  <UCard>
    <template #header>
      <div class="flex items-center justify-between mb-6">
        <h1 class="text-2xl font-bold">{{ $t('roles.title') }}</h1>
        <UButton @click="openCreateModal" icon="i-lucide-plus">
          {{ $t('roles.create') }}
        </UButton>
      </div>
    </template>

    <div ref="container" class="flex-1 overflow-y-auto" style="height: calc(100vh - 300px);">
      <UTable :rows="roles" :columns="columns" :loading="status === 'pending'" sticky>
        <template #permissions-cell="{ row }">
          <div class="max-w-xs truncate">
            {{ row.original.permissions.join(', ') }}
          </div>
        </template>

        <template #actions-cell="{ row }">
          <div class="flex gap-2">
            <UButton color="neutral" variant="ghost" icon="i-lucide-edit" @click="openEditModal(row.original)" />
            <UButton color="error" variant="ghost" icon="i-lucide-trash" @click="confirmDelete(row.original)" />
          </div>
        </template>
        <template #empty>
          <UEmpty size="xl" icon="i-lucide-shield" :title="$t('common.no_data')"
            :description="$t('common.no_data_desc')" :actions="[
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
      <div v-if="!canLoadMore && roles.length > 0" class="text-center p-4 text-gray-500 dark:text-gray-400 text-sm">
        {{ $t('common.no_more_data') }}
      </div>
    </div>
  </UCard>

  <!-- Create/Edit Modal -->
  <UModal v-model:open="showModal" :ui="{ content: 'sm:max-w-4xl' }">
    <template #content>
      <UCard>
        <template #header>
          <h3 class="font-bold">{{ isEditing ? $t('roles.edit') : $t('roles.create_new') }}</h3>
        </template>

        <AdminRolesRoleForm v-model="form" :loading="saving" :is-editing="isEditing" :route-tree="routeTree"
          @submit="handleSubmit" @cancel="showModal = false" />
      </UCard>
    </template>
  </UModal>

  <!-- Delete Confirmation -->
  <ConfirmModal v-model="showDeleteModal" :title="$t('roles.title')"
    :description="$t('roles.delete_confirm', { name: roleToDelete?.name })" color="error" @confirm="handleDelete"
    @cancel="showDeleteModal = false" />
</template>
