<script setup lang="ts">
const props = defineProps<{
  routes: any[]
  modelValue: string[] // Array of permission strings e.g. 'users.view', 'users.create'
}>()

const emit = defineEmits(['update:modelValue'])

const permissions = computed({
  get: () => props.modelValue,
  set: (value) => emit('update:modelValue', value)
})

const actions = ['view', 'create', 'edit', 'delete']

const togglePermission = (route: any, action: string) => {
  const perm = `${route.name.toLowerCase()}.${action}`
  const newPermissions = [...permissions.value]

  if (newPermissions.includes(perm)) {
    const index = newPermissions.indexOf(perm)
    newPermissions.splice(index, 1)
    // If view is removed, remove all others? No, let's keep it flexible or enforce logic here.
    // Enforce: if view is removed, remove all others.
    if (action === 'view') {
      actions.forEach(a => {
        if (a !== 'view') {
          const p = `${route.name.toLowerCase()}.${a}`
          const i = newPermissions.indexOf(p)
          if (i > -1) newPermissions.splice(i, 1)
        }
      })
    }
  } else {
    newPermissions.push(perm)
    // Enforce: if any action is added, view must be added.
    if (action !== 'view') {
      const viewPerm = `${route.name.toLowerCase()}.view`
      if (!newPermissions.includes(viewPerm)) {
        newPermissions.push(viewPerm)
      }
    }
  }

  emit('update:modelValue', newPermissions)
}

const hasPermission = (route: any, action: string) => {
  return permissions.value.includes(`${route.name.toLowerCase()}.${action}`)
}
</script>

<template>
  <div class="space-y-4">
    <div v-for="route in routes" :key="route._id" class="border rounded-lg p-4 dark:border-gray-700">
      <div class="flex items-center justify-between mb-2">
        <div class="flex items-center gap-2">
          <UIcon :name="route.icon || 'i-lucide-circle'" class="w-5 h-5 text-gray-500" />
          <span class="font-medium">{{ route.name }}</span>
        </div>
      </div>

      <div class="flex gap-4 pl-7">
        <UCheckbox v-for="action in actions" :key="action" :label="action.charAt(0).toUpperCase() + action.slice(1)"
          :model-value="hasPermission(route, action)" @update:model-value="togglePermission(route, action)" />
      </div>

      <!-- Recursive children -->
      <div v-if="route.children && route.children.length > 0" class="mt-4 pl-8 border-l dark:border-gray-700">
        <AdminRolePermissionTree :routes="route.children" v-model="permissions" />
      </div>
    </div>
  </div>
</template>
