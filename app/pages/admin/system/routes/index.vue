<script setup lang="ts">
import type { FormSubmitEvent } from '@nuxt/ui'
import * as z from 'zod'

definePageMeta({
  layout: 'admin',
  middleware: 'admin'
})

const toast = useToast()
const { fetchRoutes } = useAdminNavigation()
const deviceType = computed(() => useDeviceStore().deviceType)
const { data: routesData, refresh } = await useAPI<any>('/api/routes')
const formRef = ref()

// Transform flat routes to tree
const buildTree = (routes: any[]) => {
  const map: any = {}
  const roots: any[] = []

  routes.forEach((route: any) => {
    map[route._id] = { ...route, label: route.name, children: [] }
  })

  routes.forEach((route: any) => {
    const parentId = typeof route.parent === 'object' ? route.parent?._id : route.parent
    if (parentId && map[parentId]) map[parentId].children.push(map[route._id])
    else roots.push(map[route._id])
  })

  // Sort by sort
  const sortRoutes = (list: any[]) => {
    list.sort((a, b) => a.sort - b.sort)
    list.forEach(item => sortRoutes(item.children))
  }
  sortRoutes(roots)

  return roots
}

const routeTree = shallowRef<any[]>([])

watch(routesData, (newData) => {
  if (newData?.data)
    routeTree.value = buildTree(JSON.parse(JSON.stringify(newData.data)))
}, { immediate: true })

// Save Order Handler
const saveOrder = async (tree: any[]) => {
  const updates: any[] = []

  const processNode = (node: any, parentId: string | null, index: number) => {
    updates.push({
      _id: node._id,
      parent: parentId,
      sort: index + 1
    })
    if (node.children)
      node.children.forEach((child: any, i: number) => processNode(child, node._id, i))
  }

  tree.forEach((node, i) => processNode(node, null, i))

  try {
    await $api('/api/routes/order', { method: 'PUT', body: updates })
    toast.add({ title: $t('system.order_updated') })
    await fetchRoutes(true)
  } catch (error: any) {
    toast.add({ title: $t('system.order_error'), description: error.message, color: 'error' })
    refresh() // Revert on error
  }
}

// Form Logic
const isOpen = ref(false)
const isEditing = ref(false)
const editingId = ref('')

const schema = z.object({
  name: z.string().min(1, $t('error.min_chars', { min: 1 })),
  path: z.string().min(1, $t('error.min_chars', { min: 1 })),
  icon: z.string().optional(),
  sort: z.number().default(0),
  isVisible: z.boolean().default(true),
  parent: z.string().nullable()
})

type Schema = z.output<typeof schema>

const state = reactive<Partial<Schema>>({
  name: undefined,
  path: undefined,
  icon: undefined,
  sort: 0,
  isVisible: true,
  parent: undefined
})

const resetForm = () => {
  state.name = undefined
  state.path = undefined
  state.icon = undefined
  state.sort = 0
  state.isVisible = true
  state.parent = undefined
  isEditing.value = false
  editingId.value = ''
}

const onEdit = (row: any) => {
  state.name = row.name
  state.path = row.path
  state.icon = row.icon
  state.sort = row.sort
  state.isVisible = row.isVisible
  state.parent = row.parent
  editingId.value = row._id
  isEditing.value = true
  isOpen.value = true
}

const toggleVisibility = async (row: any) => {
  const action = row.isVisible ? 'hide' : 'show'
  if (!confirm($t('system.toggle_confirm', { action, name: row.name }))) return

  try {
    await $api(`/api/routes/${row._id}`, {
      method: 'PUT',
      body: { ...row, isVisible: !row.isVisible }
    })
    toast.add({ title: $t('system.toggle_success') })
    refresh()
    await fetchRoutes(true)
  } catch (error: any) {
    toast.add({ title: $t('system.route_error'), description: $t(error.statusMessage), color: 'error' })
  }
}

const onSubmit = async (event: FormSubmitEvent<Schema>) => {
  try {
    if (isEditing.value) {
      await $api(`/api/routes/${editingId.value}`, {
        method: 'PUT',
        body: event.data
      })
      toast.add({ title: $t('system.route_updated') })
    } else {
      await $api('/api/routes', {
        method: 'POST',
        body: event.data
      })
      toast.add({ title: $t('system.route_created') })
    }
    isOpen.value = false
    refresh()
    resetForm()
    await fetchRoutes(true)
  } catch (error: any) {
    toast.add({ title: $t('system.route_error'), description: $t(error.statusMessage), color: 'error' })
  }
}

// Flat routes for parent selection
const flatRoutes = computed(() => routesData.value?.data || [])
</script>

<template>
  <UCard :ui="{ header: 'flex items-center justify-between', footer: 'justify-end' }">
    <template #header>
      <h1 class="text-2xl font-bold">{{ $t('system.routes_title') }}</h1>
      <UButton icon="i-lucide-plus" variant="soft" @click="isOpen = true">{{ $t('system.add_route') }}</UButton>
    </template>

    <ClientOnly>
      <div v-if="routeTree.length === 0" class="text-center py-8 text-gray-500">
        <UEmpty size="xl" icon="i-lucide-bell" :title="$t('common.no_data')" :description="$t('common.no_data_desc')"
          :actions="[
            {
              icon: 'i-lucide-refresh-cw',
              label: $t('common.refresh'),
              color: 'neutral',
              variant: 'subtle',
              onClick: () => refresh()
            }
          ]" />
      </div>

      <div v-else class="overflow-auto custom-scrollbar pr-2" style="height: calc(100vh - 250px);">
        <AdminSortableTree :items="routeTree" :on-save="saveOrder" :on-edit="onEdit" :on-toggle="toggleVisibility"
          label-prefix="route" />
      </div>

      <template #fallback>
        <div class="space-y-2">
          <USkeleton class="h-12 w-full" />
          <USkeleton class="h-12 w-full" />
          <USkeleton class="h-12 w-full" />
        </div>
      </template>
    </ClientOnly>

    <UModal v-model:open="isOpen" :title="isEditing ? $t('system.edit_route') : $t('system.add_route')"
      :fullscreen="deviceType !== 'DESKTOP'" :ui="{ footer: 'justify-end' }">
      <template #body>
        <UForm ref="formRef" :schema="schema" :state="state" class="space-y-4" @submit="onSubmit">
          <UFormField :label="$t('common.name')" name="name">
            <UInput v-model="state.name" />
          </UFormField>

          <UFormField :label="$t('common.path')" name="path">
            <UInput v-model="state.path" />
          </UFormField>

          <UFormField :label="$t('common.icon')" name="icon">
            <UInput v-model="state.icon" placeholder="i-lucide-..." />
          </UFormField>

          <UFormField :label="$t('system.parent_route')" name="parent">
            <USelectMenu v-model="state.parent" :options="flatRoutes" option-attribute="name" value-attribute="_id"
              :placeholder="$t('system.select_parent')" searchable />
          </UFormField>

          <UFormField :label="$t('common.sort_order')" name="sort">
            <UInput v-model="state.sort" type="number" />
          </UFormField>

          <UFormField name="isVisible">
            <UCheckbox v-model="state.isVisible" :label="$t('system.visible_in_menu')" />
          </UFormField>
        </UForm>
      </template>
      <template #footer="{ close }">
        <UButton color="neutral" variant="ghost" @click="close">{{ $t('common.cancel') }}</UButton>
        <UButton type="submit" variant="soft" @click="formRef?.submit()">{{ $t('common.update') }}</UButton>
      </template>
    </UModal>
  </UCard>
</template>
