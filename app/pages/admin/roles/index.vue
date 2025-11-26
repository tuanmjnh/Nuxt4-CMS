<script setup lang="ts">
definePageMeta({
  layout: 'admin',
  middleware: 'admin'
})

const toast = useToast()
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

const columns: any[] = [
  { key: 'name', label: 'Name' },
  { key: 'description', label: 'Description' },
  { key: 'permissions', label: 'Permissions' },
  { key: 'actions', label: 'Actions' }
]

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
  if (!confirm(`Are you sure you want to delete role "${role.name}"?`)) return

  try {
    await $fetch(`/api/roles/${role._id}`, { method: 'DELETE' })
    toast.add({ title: 'Role deleted' })
    refresh()
  } catch (error: any) {
    toast.add({ title: 'Error', description: error.message, color: 'error' })
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
      toast.add({ title: 'Role updated' })
    } else {
      await $fetch('/api/roles', {
        method: 'POST',
        body: payload
      })
      toast.add({ title: 'Role created' })
    }
    showModal.value = false
    refresh()
  } catch (error: any) {
    toast.add({ title: 'Error', description: error.message, color: 'error' })
  } finally {
    saving.value = false
  }
}
</script>

<template>
  <div>
    <div class="flex items-center justify-between mb-6">
      <h1 class="text-2xl font-bold">Roles</h1>
      <UButton @click="openCreateModal" icon="i-lucide-plus">
        Create Role
      </UButton>
    </div>

    <UCard>
      <UTable :rows="roles" :columns="columns" :loading="pending">
        <template #permissions-data="{ row }">
          <div class="max-w-xs truncate">
            {{ getRole(row).permissions.join(', ') }}
          </div>
        </template>

        <template #actions-data="{ row }">
          <div class="flex gap-2">
            <UButton color="gray" variant="ghost" icon="i-lucide-edit" @click="openEditModal(getRole(row))" />
            <UButton color="red" variant="ghost" icon="i-lucide-trash" @click="confirmDelete(getRole(row))" />
          </div>
        </template>
      </UTable>
    </UCard>

    <!-- Create/Edit Modal -->
    <UModal v-model="showModal" :ui="{ width: 'sm:max-w-4xl' }">
      <UCard>
        <template #header>
          <h3 class="font-bold">{{ isEditing ? 'Edit Role' : 'Create New Role' }}</h3>
        </template>

        <form @submit.prevent="handleSubmit" class="space-y-4">
          <UFormGroup label="Name" name="name" required>
            <UInput v-model="form.name" />
          </UFormGroup>

          <UFormGroup label="Description" name="description">
            <UInput v-model="form.description" />
          </UFormGroup>

          <UFormGroup label="Permissions" name="permissions">
            <div class="max-h-96 overflow-y-auto border rounded-lg p-4">
              <AdminRolePermissionTree :routes="routeTree" v-model="form.permissions" />
            </div>
          </UFormGroup>

          <UCheckbox v-model="form.isDefault" label="Default Role" />

          <div class="flex justify-end gap-2 pt-4">
            <UButton color="gray" variant="ghost" @click="showModal = false">Cancel</UButton>
            <UButton type="submit" :loading="saving">{{ isEditing ? 'Update' : 'Create' }}</UButton>
          </div>
        </form>
      </UCard>
    </UModal>
  </div>
</template>
