<template>
  <div>
    <div class="flex items-center justify-between mb-6">
      <div class="flex items-center gap-4">
        <UButton to="/admin/menus" color="neutral" variant="ghost" icon="i-lucide-arrow-left" />
        <div>
          <h1 class="text-2xl font-bold">{{ menu?.name }}</h1>
          <p class="text-sm text-gray-500">Menu Builder</p>
        </div>
      </div>
      <UButton @click="openAddModal()" icon="i-lucide-plus">
        Add Item
      </UButton>
    </div>

    <div v-if="pending" class="space-y-4">
      <USkeleton class="h-96 w-full" />
    </div>

    <div v-else class="grid gap-6 lg:grid-cols-3">
      <!-- Tree Builder -->
      <div class="lg:col-span-2">
        <UCard>
          <div v-if="menuTree.length === 0" class="text-center py-8 text-gray-500">
            No items found. Add one to get started.
          </div>
          <UTree v-else ref="tree" :items="menuTree" :nested="false" :unmount-on-hide="false" :ui="{
            item: 'block w-full'
          }">
            <template #item-label="{ item }">
              <div
                class="flex items-center justify-between w-full p-2 hover:bg-gray-50 dark:hover:bg-gray-800 rounded-md group">
                <div class="flex items-center gap-2">
                  <UIcon name="i-lucide-grip-vertical" class="drag-handle cursor-move text-gray-400" />
                  <UIcon :name="item.icon || 'i-lucide-circle'" class="w-5 h-5 text-gray-500" />
                  <div class="flex flex-col text-left">
                    <span class="font-medium text-sm">{{ item.label }}</span>
                    <div class="flex gap-2 items-center">
                      <UBadge size="xs" variant="subtle">{{ item.linkType }}</UBadge>
                      <span v-if="!item.isVisible" class="text-xs text-red-500">Hidden</span>
                    </div>
                  </div>
                </div>
                <div class="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                  <UButton icon="i-lucide-plus" color="neutral" variant="ghost" size="xs"
                    @click.stop="openAddModal(item)" title="Add Child" />
                  <UButton icon="i-lucide-edit" color="neutral" variant="ghost" size="xs"
                    @click.stop="openEditModal(item)" />
                  <UButton icon="i-lucide-trash" color="error" variant="ghost" size="xs"
                    @click.stop="confirmDelete(item)" />
                </div>
              </div>
            </template>
          </UTree>
        </UCard>
      </div>

      <!-- Instructions -->
      <div>
        <UCard>
          <template #header>
            <h3 class="font-bold">Instructions</h3>
          </template>
          <ul class="list-disc list-inside space-y-2 text-sm text-gray-600 dark:text-gray-400">
            <li>Drag and drop items to reorder them</li>
            <li>Nested items are displayed indented</li>
            <li>Click the + icon to add a child item</li>
            <li>Changes to order are saved automatically</li>
          </ul>
        </UCard>
      </div>
    </div>

    <!-- Item Modal -->
    <UModal v-model="showModal">
      <UCard>
        <template #header>
          <h3 class="font-bold">{{ editingItem ? 'Edit Item' : 'Add Item' }}</h3>
        </template>

        <MenuItemForm :item="editingItem" :loading="saving" @submit="handleItemSubmit" @cancel="showModal = false" />
      </UCard>
    </UModal>

    <!-- Delete Confirmation -->
    <UModal v-model="showDeleteModal">
      <UCard>
        <template #header>
          <h3 class="font-bold">Delete Item</h3>
        </template>
        <p>Are you sure you want to delete this item? Any children will be moved up.</p>
        <template #footer>
          <div class="flex justify-end gap-2">
            <UButton color="neutral" variant="ghost" @click="showDeleteModal = false">Cancel</UButton>
            <UButton color="error" @click="handleDelete" :loading="deleting">Delete</UButton>
          </div>
        </template>
      </UCard>
    </UModal>
  </div>
</template>

<script setup lang="ts">
import { useSortable } from '@vueuse/integrations/useSortable'

definePageMeta({
  layout: 'admin',
  middleware: 'admin'
})

const route = useRoute()
const { fetchMenu, createMenuItem, updateMenuItem, deleteMenuItem, reorderMenuItems } = useMenu()
const toast = useToast()

const menuId = route.params.id as string
const showModal = ref(false)
const showDeleteModal = ref(false)
const editingItem = ref<any>(null)
const itemToDelete = ref<any>(null)
const parentForNewItem = ref<string | null>(null)
const saving = ref(false)
const deleting = ref(false)

const { data, pending, refresh } = await useAsyncData(`menu-${menuId}`, () => fetchMenu(menuId))
const menu = computed(() => data.value?.data?.menu)

// Transform flat items to tree
const buildTree = (items: any[]) => {
  const map: any = {}
  const roots: any[] = []

  items.forEach((item: any) => {
    map[item._id] = { ...item, children: [] }
  })

  items.forEach((item: any) => {
    if (item.parent && map[item.parent]) {
      map[item.parent].children.push(map[item._id])
    } else {
      roots.push(map[item._id])
    }
  })

  // Sort by sortOrder
  const sortItems = (list: any[]) => {
    list.sort((a, b) => a.sortOrder - b.sortOrder)
    list.forEach(item => sortItems(item.children))
  }
  sortItems(roots)

  return roots
}

const menuTree = shallowRef<any[]>([])

watch(() => data.value?.data?.items, (newItems) => {
  if (newItems) {
    menuTree.value = buildTree(JSON.parse(JSON.stringify(newItems)))
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

  const flat = flatten(menuTree.value)
  const source = flat[oldIndex]
  const target = flat[newIndex]

  if (!source || !target) return

  const [moved] = source.parent.splice(source.index, 1)
  if (!moved) return

  const updatedFlat = flatten(menuTree.value)
  const updatedTarget = updatedFlat.find(({ item }) => item === target.item)
  if (!updatedTarget) return

  const insertIndex = oldIndex < newIndex ? updatedTarget.index + 1 : updatedTarget.index
  updatedTarget.parent.splice(insertIndex, 0, moved)

  // Trigger save
  saveOrder(menuTree.value)
}

const treeRef = useTemplateRef<HTMLElement>('tree')

useSortable(treeRef, menuTree, {
  animation: 150,
  ghostClass: 'opacity-50',
  handle: '.drag-handle',
  onUpdate: (e: any) => moveItem(e.oldIndex, e.newIndex)
})

const saveOrder = async (tree: any[]) => {
  // Flatten tree to get new order and parents
  const flattenForSave = (list: any[], parent: string | null = null): any[] => {
    return list.reduce((acc: any[], item: any, index: number) => {
      const current = {
        id: item._id,
        parent,
        sortOrder: index
      }
      const children = item.children ? flattenForSave(item.children, item._id) : []
      return [...acc, current, ...children]
    }, [])
  }

  const flatItems = flattenForSave(tree)

  try {
    await reorderMenuItems(menuId, flatItems)
    toast.add({ title: 'Order updated successfully' })
    // Don't refresh here to avoid resetting the tree state while dragging
  } catch (error: any) {
    toast.add({ title: 'Error updating order', description: error.message, color: 'error' })
    refresh() // Revert on error
  }
}


const openAddModal = (parent: any = null) => {
  editingItem.value = null
  parentForNewItem.value = parent?._id || null
  showModal.value = true
}

const openEditModal = (item: any) => {
  editingItem.value = item
  parentForNewItem.value = null
  showModal.value = true
}

const handleItemSubmit = async (formData: any) => {
  saving.value = true
  try {
    if (editingItem.value) {
      await updateMenuItem(menuId, editingItem.value._id, formData)
      toast.add({ title: 'Item updated', color: 'success' })
    } else {
      await createMenuItem(menuId, {
        ...formData,
        parent: parentForNewItem.value
      })
      toast.add({ title: 'Item added', color: 'success' })
    }
    showModal.value = false
    refresh()
  } catch (error: any) {
    toast.add({ title: error.message || 'Operation failed', color: 'error' })
  } finally {
    saving.value = false
  }
}

const confirmDelete = (item: any) => {
  itemToDelete.value = item
  showDeleteModal.value = true
}

const handleDelete = async () => {
  if (!itemToDelete.value) return

  deleting.value = true
  try {
    await deleteMenuItem(menuId, itemToDelete.value._id)
    showDeleteModal.value = false
    refresh()
    toast.add({ title: 'Item deleted', color: 'success' })
  } catch (error) {
    toast.add({ title: 'Failed to delete item', color: 'error' })
  } finally {
    deleting.value = false
  }
}
</script>
