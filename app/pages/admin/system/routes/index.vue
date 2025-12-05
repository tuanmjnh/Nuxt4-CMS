<script setup lang="ts">
import type { FormSubmitEvent } from '@nuxt/ui'
import { useSortable } from '@vueuse/integrations/useSortable'
import * as z from 'zod'
definePageMeta({
  layout: 'admin',
  middleware: 'admin'
})

const toast = useToast()
const { token } = useAuth()
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
  // console.log(routeTree.value)
}, { immediate: true })

// Drag and Drop Logic
function flatten(
  items: any[],
  parent = items
): { item: any; parent: any[]; index: number }[] {
  return items.flatMap((item, index) => [
    { item, parent, index },
    ...(item.children?.length ? flatten(item.children, item.children) : [])
  ])
}

function moveItem(oldIndex: number, newIndex: number) {
  if (oldIndex === newIndex) return

  const flat = flatten(routeTree.value)
  const source = flat[oldIndex]
  const target = flat[newIndex]

  if (!source || !target) return

  // Prevent changing parent
  if (source.parent !== target.parent) {
    if (routesData.value?.data) {
      routeTree.value = buildTree(JSON.parse(JSON.stringify(routesData.value.data)))
    }
    return
  }

  const [moved] = source.parent.splice(source.index, 1)
  if (!moved) return

  const updatedFlat = flatten(routeTree.value)
  const updatedTarget = updatedFlat.find(({ item }) => item === target.item)
  if (!updatedTarget) return

  const insertIndex = oldIndex < newIndex ? updatedTarget.index + 1 : updatedTarget.index
  updatedTarget.parent.splice(insertIndex, 0, moved)

  // Trigger save
  saveOrder(routeTree.value)
}
const isMounted = ref(false)
const tree = useTemplateRef<any>('tree')

useSortable(computed(() => tree.value?.$el || tree.value), routeTree, {
  animation: 150,
  ghostClass: 'opacity-50',
  handle: '.drag-handle',
  onUpdate: (e: any) => moveItem(e.oldIndex, e.newIndex)
})

onMounted(() => {
  isMounted.value = true
})
// watch(tree, (val) => {
//   console.log('Tree ref updated:', val.$el)
// })

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
    await $fetch('/api/routes/order', {
      method: 'PUT',
      headers: { Authorization: `Bearer ${token.value}` },
      body: updates
    })
    toast.add({ title: $t('system.order_updated') })
    // Don't refresh here to avoid resetting the tree state while dragging
  } catch (error: any) {
    toast.add({ title: $t('system.order_error'), description: error.message, color: 'error' })
    refresh() // Revert on error
  }
}

const isOpen = ref(false)
const isEditing = ref(false)
const editingId = ref('')

const schema = z.object({
  name: z.string().min(1, $t('error.min_chars', { min: 1 })),
  path: z.string().min(1, $t('error.min_chars', { min: 1 })),
  icon: z.string().optional(),
  sort: z.number().default(0),
  isVisible: z.boolean().default(true),
  parent: z.string().nullable() // Add parent field
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
    await $fetch(`/api/routes/${row._id}`, {
      method: 'PUT',
      headers: { Authorization: `Bearer ${token.value}` },
      body: { ...row, isVisible: !row.isVisible }
    })
    toast.add({ title: $t('system.toggle_success') })
    refresh()
  } catch (error: any) {
    toast.add({ title: $t('system.route_error'), description: $t(error.statusMessage), color: 'error' })
  }
}

const onSubmit = async (event: FormSubmitEvent<Schema>) => {
  try {
    if (isEditing.value) {
      await $fetch(`/api/routes/${editingId.value}`, {
        method: 'PUT',
        headers: { Authorization: `Bearer ${token.value}` },
        body: event.data
      })
      toast.add({ title: $t('system.route_updated') })
    } else {
      await $fetch('/api/routes', {
        method: 'POST',
        headers: { Authorization: `Bearer ${token.value}` },
        body: event.data
      })
      toast.add({ title: $t('system.route_created') })
    }
    isOpen.value = false
    refresh()
    resetForm()
  } catch (error: any) {
    toast.add({ title: $t('system.route_error'), description: $t(error.statusMessage), color: 'error' })
  }
}

// Flat routes for parent selection
const flatRoutes = computed(() => routesData.value?.data || [])
</script>

<template>
  <UCard>
    <template #header>
      <div class="flex items-center justify-between">
        <h1 class="text-2xl font-bold">{{ $t('system.routes_title') }}</h1>
        <UButton icon="i-lucide-plus" variant="soft" @click="isOpen = true">{{ $t('system.add_route') }}</UButton>
      </div>
    </template>

    <div v-if="!isMounted" class="space-y-2">
      <USkeleton class="h-12 w-full" />
      <USkeleton class="h-12 w-full" />
      <USkeleton class="h-12 w-full" />
    </div>

    <div v-else>
      <div v-if="routeTree.length === 0" class="text-center py-8 text-gray-500">
        <!-- {{ $t('system.no_routes') }} -->
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
      <div v-else class="overflow-y-auto" style="height: calc(100vh - 250px)">
        <UTree ref="tree" :items="routeTree" :nested="false" :unmount-on-hide="false"
          :ui="{ item: 'block w-full', linkLabel: 'block w-full' }">
          <template #item-label="{ item }">
            <div class="flex items-center justify-between w-full p-2 rounded-md group">
              <div class="flex items-center gap-2">
                <UIcon name="i-lucide-grip-vertical" class="drag-handle cursor-move text-gray-400" />
                <!-- <UIcon :name="item.icon || 'i-lucide-circle'" class="w-5 h-5 text-gray-500" /> -->
                <div class="flex flex-col text-left">
                  <span class="font-medium text-sm">{{ $t(`route.${item.name}`) }}</span>
                  <span class="text-xs text-gray-400">{{ item.path }}</span>
                </div>
              </div>
              <div class="flex items-center gap-1">
                <UBadge v-if="!item.isVisible" color="neutral" variant="subtle" size="xs">{{ $t('common.hidden') }}
                </UBadge>
                <UButton icon="i-lucide-edit" color="primary" variant="ghost" size="xs" @click.stop="onEdit(item)" />
                <UButton :icon="item.isVisible ? 'i-lucide-eye-off' : 'i-lucide-eye'"
                  :color="item.isVisible ? 'warning' : 'success'" variant="ghost" size="xs"
                  @click.stop="toggleVisibility(item)" />
                <div v-if="!item.children || !item.children.length" class="w-5.5"></div>
              </div>
            </div>
          </template>
        </UTree>
      </div>
    </div>
  </UCard>

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
      <!-- </UCard> -->
    </template>
    <template #footer="{ close }">
      <UButton color="neutral" variant="ghost" @click="close">{{ $t('common.cancel') }}</UButton>
      <UButton type="submit" variant="soft" @click="formRef?.submit()">{{ $t('common.update') }}</UButton>
    </template>
  </UModal>
</template>
