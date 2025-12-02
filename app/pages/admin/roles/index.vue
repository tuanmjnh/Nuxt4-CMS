<script setup lang="ts">
definePageMeta({
  layout: 'admin',
  middleware: 'admin'
})

import type { TableColumn } from '@nuxt/ui'

const toast = useToast()
const { t } = useI18n()
const { data: rolesData, pending, refresh } = await useFetch<{
  success: boolean
  data: {
    roles: Models.Role[]
  }
}>('/api/roles')

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
    if (route.parent && map[route.parent]) {
      map[route.parent].children.push(map[route._id])
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

const roles = computed(() => rolesData.value?.data?.roles || [])

const showModal = ref(false)
const saving = ref(false)
const isEditing = ref(false)
const editingId = ref('')

const form = ref({
  name: '',
  description: '',
  permissions: [] as string[],
  isDefault: false
})

const columns = computed(() => [
  { accessorKey: 'name', header: t('common.name') },
  { accessorKey: 'description', header: t('common.description') },
  { id: 'permissions', header: t('roles.permissions') },
  { id: 'actions', header: t('common.actions') }
] as TableColumn<Models.Role>[])

const getRole = (row: any): Models.Role => row

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

const confirmDelete = async (role: any) => {
  if (!confirm(t('roles.delete_confirm', { name: role.name }))) return

  try {
    await $fetch(`/api/roles/${role._id}`, { method: 'DELETE' })
    toast.add({ title: t('roles.delete_success') })
    refresh()
  } catch (error: any) {
    toast.add({ title: t('common.error'), description: error.message, color: 'error' })
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
      toast.add({ title: t('roles.update_success') })
    } else {
      await $fetch('/api/roles', {
        method: 'POST',
        body: payload
      })
      toast.add({ title: t('roles.create_success') })
    }
    showModal.value = false
    refresh()
  } catch (error: any) {
    toast.add({ title: t('common.error'), description: error.message, color: 'error' })
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
    <UTable :rows="roles" :columns="columns" :loading="pending">
      <template #permissions-data="{ row }">
        <div class="max-w-xs truncate">
          {{ getRole(row).permissions.join(', ') }}
        </div>
      </template>

      <template #actions-data="{ row }">
        <div class="flex gap-2">
          <UButton color="neutral" variant="ghost" icon="i-lucide-edit" @click="openEditModal(getRole(row))" />
          <UButton color="error" variant="ghost" icon="i-lucide-trash" @click="confirmDelete(getRole(row))" />
        </div>
      </template>
    </UTable>
  </UCard>

  <!-- Create/Edit Modal -->
  <UModal v-model:open="showModal" :ui="{ content: 'sm:max-w-4xl' }">
    <template #content>
      <UCard>
        <template #header>
          <h3 class="font-bold">{{ isEditing ? $t('roles.edit') : $t('roles.create_new') }}</h3>
        </template>

        <form @submit.prevent="handleSubmit" class="space-y-4">
          <UFormField :label="$t('common.name')" name="name" required>
            <UInput v-model="form.name" />
          </UFormField>

          <UFormField :label="$t('common.description')" name="description">
            <UInput v-model="form.description" />
          </UFormField>

          <UFormField :label="$t('roles.permissions')" name="permissions">
            <div class="max-h-96 overflow-y-auto border rounded-lg p-4">
              <AdminRolePermissionTree :routes="routeTree" v-model="form.permissions" />
            </div>
          </UFormField>

          <UCheckbox v-model="form.isDefault" :label="$t('roles.default_role')" />

          <div class="flex justify-end gap-2 pt-4">
            <UButton color="neutral" variant="ghost" @click="showModal = false">{{ $t('common.cancel') }}</UButton>
            <UButton type="submit" :loading="saving">{{ isEditing ? $t('common.update') : $t('common.create') }}
            </UButton>
          </div>
        </form>
      </UCard>
    </template>
  </UModal>
</template>
