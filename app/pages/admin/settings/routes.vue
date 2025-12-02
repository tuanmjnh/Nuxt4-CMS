<script setup lang="ts">
import type { FormSubmitEvent } from '@nuxt/ui'
import { useSortable } from '@vueuse/integrations/useSortable'
import * as z from 'zod'

definePageMeta({
  layout: 'admin',
  middleware: 'admin'
})

const toast = useToast()
const { t } = useI18n()
const { data: routesData, refresh } = await useFetch<any>('/api/admin/routes')

// Transform flat routes to tree
const buildTree = (routes: any[]) => {
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

  // Sort by sortOrder
  const sortRoutes = (list: any[]) => {
    list.sort((a, b) => a.sortOrder - b.sortOrder)
    list.forEach(item => sortRoutes(item.children))
  }
  sortRoutes(roots)

  return roots
}

const routeTree = shallowRef<any[]>([])

watch(routesData, (newData) => {
  if (newData?.data) {
    routeTree.value = buildTree(JSON.parse(JSON.stringify(newData.data)))
  }
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

const treeRef = useTemplateRef<HTMLElement>('tree')

useSortable(treeRef, routeTree, {
  animation: 150,
  ghostClass: 'opacity-50',
  handle: '.drag-handle',
  onUpdate: (e: any) => moveItem(e.oldIndex, e.newIndex)
})

const saveOrder = async (tree: any[]) => {
  const updates: any[] = []

  const processNode = (node: any, parentId: string | null, index: number) => {
    updates.push({
      _id: node._id,
      parent: parentId,
      sortOrder: index + 1
    })
    if (node.children) {
      node.children.forEach((child: any, i: number) => processNode(child, node._id, i))
    }
  }

  tree.forEach((node, i) => processNode(node, null, i))

  try {
    await $fetch('/api/admin/routes/order', {
      method: 'PUT',
      body: updates
    })
    toast.add({ title: t('settings.order_updated') })
    // Don't refresh here to avoid resetting the tree state while dragging
  } catch (error: any) {
    toast.add({ title: t('settings.order_error'), description: error.message, color: 'error' })
    refresh() // Revert on error
  }
}

const isOpen = ref(false)
const isEditing = ref(false)
const editingId = ref('')

const schema = z.object({
  name: z.string().min(1, t('validation.name_min')),
  path: z.string().min(1, 'Path is required'),
  icon: z.string().optional(),
  sortOrder: z.number().default(0),
  isVisible: z.boolean().default(true),
  parent: z.string().optional() // Add parent field
})

type Schema = z.output<typeof schema>

const state = reactive<Partial<Schema>>({
  name: undefined,
  path: undefined,
  icon: undefined,
  sortOrder: 0,
  isVisible: true,
  parent: undefined
})

const resetForm = () => {
  state.name = undefined
  state.path = undefined
  state.icon = undefined
  state.sortOrder = 0
  state.isVisible = true
  state.parent = undefined
  isEditing.value = false
  editingId.value = ''
}

const onEdit = (row: any) => {
  state.name = row.name
  state.path = row.path
  state.icon = row.icon
  state.sortOrder = row.sortOrder
  state.isVisible = row.isVisible
  state.parent = row.parent
  editingId.value = row._id
  isEditing.value = true
  isOpen.value = true
}

const toggleVisibility = async (row: any) => {
  const action = row.isVisible ? 'hide' : 'show'
  if (!confirm(t('settings.toggle_confirm', { action, name: row.name }))) return

  try {
    await $fetch(`/api/admin/routes/${row._id}`, {
      method: 'PUT',
      body: { ...row, isVisible: !row.isVisible }
    })
    toast.add({ title: t('settings.toggle_success') })
    refresh()
  } catch (error: any) {
    toast.add({ title: t('settings.route_error'), description: error.message, color: 'error' })
  }
}

const onSubmit = async (event: FormSubmitEvent<Schema>) => {
  try {
    if (isEditing.value) {
      await $fetch(`/api/admin/routes/${editingId.value}`, {
        method: 'PUT',
        body: event.data
      })
      toast.add({ title: t('settings.route_updated') })
    } else {
      await $fetch('/api/admin/routes', {
        method: 'POST',
        body: event.data
      })
      toast.add({ title: t('settings.route_created') })
    }
    isOpen.value = false
    refresh()
    resetForm()
  } catch (error: any) {
    toast.add({ title: t('settings.route_error'), description: error.message, color: 'error' })
  }
}

// Flat routes for parent selection
const flatRoutes = computed(() => routesData.value?.data || [])
</script>

<template>
  <UCard>
    <template #header>
      <div class="flex items-center justify-between">
        <h1 class="text-2xl font-bold">{{ $t('settings.routes_title') }}</h1>
        <UButton icon="i-lucide-plus" @click="isOpen = true">{{ $t('settings.add_route') }}</UButton>
      </div>
    </template>
    <div v-if="routeTree.length === 0" class="text-center py-8 text-gray-500">
      {{ $t('settings.no_routes') }}
    </div>
    <UTree v-else ref="tree" :items="routeTree" :nested="false" :unmount-on-hide="false" :ui="{
      item: 'block w-full'
    }">
      <template #item-label="{ item }">
        <div
          class="flex items-center justify-between w-full p-2 hover:bg-gray-50 dark:hover:bg-gray-800 rounded-md group">
          <div class="flex items-center gap-2">
            <UIcon name="i-lucide-grip-vertical" class="drag-handle cursor-move text-gray-400" />
            <UIcon :name="item.icon || 'i-lucide-circle'" class="w-5 h-5 text-gray-500" />
            <div class="flex flex-col text-left">
              <span class="font-medium text-sm">{{ item.name }}</span>
              <span class="text-xs text-gray-400">{{ item.path }}</span>
            </div>
          </div>
          <div class="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
            <UBadge v-if="!item.isVisible" color="neutral" variant="subtle" size="xs">{{ $t('common.hidden') }}
            </UBadge>
            <UButton icon="i-lucide-edit" color="neutral" variant="ghost" size="xs" @click.stop="onEdit(item)" />
            <UButton :icon="item.isVisible ? 'i-lucide-eye-off' : 'i-lucide-eye'"
              :color="item.isVisible ? 'warning' : 'success'" variant="ghost" size="xs"
              @click.stop="toggleVisibility(item)" />
          </div>
        </div>
      </template>
    </UTree>
  </UCard>

  <UModal v-model:open="isOpen">
    <template #content>
      <UCard>
        <template #header>
          <h3 class="text-lg font-semibold">{{ isEditing ? $t('settings.edit_route') : $t('settings.add_route') }}
          </h3>
        </template>

        <UForm :schema="schema" :state="state" class="space-y-4" @submit="onSubmit">
          <UFormField :label="$t('common.name')" name="name">
            <UInput v-model="state.name" />
          </UFormField>

          <UFormField :label="$t('common.path')" name="path">
            <UInput v-model="state.path" />
          </UFormField>

          <UFormField :label="$t('common.icon')" name="icon">
            <UInput v-model="state.icon" placeholder="i-lucide-..." />
          </UFormField>

          <UFormField :label="$t('settings.parent_route')" name="parent">
            <USelectMenu v-model="state.parent" :options="flatRoutes" option-attribute="name" value-attribute="_id"
              :placeholder="$t('settings.select_parent')" searchable />
          </UFormField>

          <UFormField :label="$t('common.sort_order')" name="sortOrder">
            <UInput v-model="state.sortOrder" type="number" />
          </UFormField>

          <UFormField name="isVisible">
            <UCheckbox v-model="state.isVisible" :label="$t('settings.visible_in_menu')" />
          </UFormField>

          <div class="flex justify-end gap-2">
            <UButton color="neutral" variant="ghost" @click="isOpen = false">{{ $t('common.cancel') }}</UButton>
            <UButton type="submit">{{ $t('common.save') }}</UButton>
          </div>
        </UForm>
      </UCard>
    </template>
  </UModal>
</template>
