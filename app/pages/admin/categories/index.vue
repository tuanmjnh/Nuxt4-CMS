<script setup lang="ts">
import { useSortable } from '@vueuse/integrations/useSortable'

definePageMeta({
  layout: 'admin',
  middleware: 'admin'
})

const toast = useToast()
const { token } = useAuth()

const showModal = ref(false)
const showDeleteModal = ref(false)
const editingCategory = ref<any>(null)
const categoryToDelete = ref<any>(null)
const saving = ref(false)
const deleting = ref(false)
const currentType = ref('post')

const tabs = computed(() => [
  { label: $t('categories.post_categories'), slot: 'post', content: 'post' },
  { label: $t('categories.product_categories'), slot: 'product', content: 'product' }
])

const form = ref({
  name: '',
  description: '',
  parent: '',
  type: 'post',
  metaTitle: '',
  metaDescription: '',
  keywords: [] as string[],
  ogImage: ''
})

const { data, pending, refresh } = await useFetch('/api/categories', {
  query: { type: currentType }
})

const categories = computed(() => data.value?.data || [])

const parentOptions = computed(() => {
  // Flatten tree or just use the categories list (which is flat from API)
  // Filter out self and children to prevent cycles if editing
  if (!editingCategory.value) return categories.value

  const getDescendants = (id: string, list: any[]): string[] => {
    const children = list.filter(c => c.parent === id || c.parent?._id === id)
    let descendants = children.map(c => c._id)
    children.forEach(c => {
      descendants = [...descendants, ...getDescendants(c._id, list)]
    })
    return descendants
  }

  const descendants = getDescendants(editingCategory.value._id, categories.value)
  return categories.value.filter((c: any) => c._id !== editingCategory.value._id && !descendants.includes(c._id))
})

// Tree Logic
const buildTree = (items: any[]) => {
  const map: any = {}
  const roots: any[] = []

  // Deep copy to avoid mutating original data
  const list = JSON.parse(JSON.stringify(items))

  list.forEach((item: any) => {
    map[item._id] = { ...item, label: item.name, children: [] }
  })

  list.forEach((item: any) => {
    const parentId = item.parent?._id || item.parent
    if (parentId && map[parentId]) {
      map[parentId].children.push(map[item._id])
    } else {
      roots.push(map[item._id])
    }
  })

  // Sort by sortOrder
  const sortItems = (list: any[]) => {
    list.sort((a, b) => (a.sortOrder || 0) - (b.sortOrder || 0))
    list.forEach(item => sortItems(item.children))
  }
  sortItems(roots)

  return roots
}

const categoryTree = shallowRef<any[]>([])

watch(() => categories.value, (newItems) => {
  if (newItems) {
    categoryTree.value = buildTree(newItems)
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

  const flat = flatten(categoryTree.value)
  const source = flat[oldIndex]
  const target = flat[newIndex]

  if (!source || !target) return

  const [moved] = source.parent.splice(source.index, 1)
  if (!moved) return

  const updatedFlat = flatten(categoryTree.value)
  const updatedTarget = updatedFlat.find(({ item }) => item === target.item)
  if (!updatedTarget) return

  const insertIndex = oldIndex < newIndex ? updatedTarget.index + 1 : updatedTarget.index
  updatedTarget.parent.splice(insertIndex, 0, moved)

  // Trigger save
  saveOrder(categoryTree.value)
}

const treeRef = useTemplateRef<HTMLElement>('tree')

useSortable(treeRef, categoryTree, {
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
    await $fetch('/api/categories/reorder', {
      method: 'PUT',
      body: { items: flatItems },
      headers: { Authorization: `Bearer ${token.value}` }
    })
    toast.add({ title: $t('categories.order_updated') })
  } catch (error: any) {
    toast.add({ title: $t('categories.order_error'), description: error.message, color: 'error' })
    refresh() // Revert on error
  }
}

const onTabChange = (index: number) => {
  const tab = tabs.value[index]
  if (tab) {
    currentType.value = tab.content
    refresh()
  }
}

const openCreateModal = (parentItem: any = null) => {
  editingCategory.value = null
  form.value = {
    name: '',
    description: '',
    parent: parentItem?._id || '',
    type: currentType.value,
    metaTitle: '',
    metaDescription: '',
    keywords: [],
    ogImage: ''
  }
  showModal.value = true
}

const editCategory = (category: any) => {
  editingCategory.value = category
  form.value = {
    name: category.name,
    description: category.description || '',
    parent: category.parent?._id || category.parent || '',
    type: category.type || 'post',
    metaTitle: category.metaTitle || '',
    metaDescription: category.metaDescription || '',
    keywords: category.keywords || [],
    ogImage: category.ogImage || ''
  }
  showModal.value = true
}

const handleSubmit = async () => {
  saving.value = true
  try {
    const url = editingCategory.value
      ? `/api/categories/${editingCategory.value._id}`
      : '/api/categories'

    const method = editingCategory.value ? 'PUT' : 'POST'

    await $fetch(url, {
      method,
      body: form.value,
      headers: { Authorization: `Bearer ${token.value}` }
    })

    toast.add({ title: $t('categories.save_success'), color: 'success' })
    showModal.value = false
    refresh()
  } catch (error: any) {
    toast.add({ title: error.message || $t('categories.save_error'), color: 'error' })
  } finally {
    saving.value = false
  }
}

const confirmDelete = (category: any) => {
  categoryToDelete.value = category
  showDeleteModal.value = true
}

const handleDelete = async () => {
  if (!categoryToDelete.value) return

  deleting.value = true
  try {
    await $fetch(`/api/categories/${categoryToDelete.value._id}`, {
      method: 'DELETE',
      headers: { Authorization: `Bearer ${token.value}` }
    })

    toast.add({ title: $t('categories.delete_success'), color: 'success' })
    showDeleteModal.value = false
    refresh()
  } catch (error: any) {
    toast.add({ title: $t('categories.delete_error'), color: 'error' })
  } finally {
    deleting.value = false
  }
}
</script>

<template>
  <UCard>
    <template #header>
      <div class="flex items-center justify-between mb-6">
        <h1 class="text-2xl font-bold">{{ $t('categories.title') }}</h1>
        <UButton @click="openCreateModal" icon="i-lucide-plus">
          {{ $t('categories.create') }}
        </UButton>
      </div>
    </template>
    <div class="mb-4">
      <UTabs :items="tabs" @change="onTabChange" />
    </div>

    <div v-if="pending" class="space-y-4">
      <USkeleton class="h-12 w-full" />
      <USkeleton class="h-64 w-full" />
    </div>

    <div v-else>
      <div v-if="categoryTree.length === 0" class="text-center py-8 text-gray-500">
        {{ $t('categories.no_categories') }}
      </div>

      <UTree v-else ref="tree" :items="categoryTree" :nested="false" :unmount-on-hide="false" :ui="{
        item: 'block w-full'
      }">
        <template #item-label="{ item }">
          <div
            class="flex items-center justify-between w-full p-2 hover:bg-gray-50 dark:hover:bg-gray-800 rounded-md group">
            <div class="flex items-center gap-2">
              <UIcon name="i-lucide-grip-vertical" class="drag-handle cursor-move text-gray-400" />
              <div class="flex flex-col text-left">
                <span class="font-medium text-sm">{{ item.label }}</span>
                <div class="flex gap-2 items-center text-xs text-gray-500">
                  <span>{{ item.slug }}</span>
                  <span v-if="item.postCount > 0">• {{ item.postCount }} posts</span>
                </div>
              </div>
            </div>
            <div class="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
              <UButton icon="i-lucide-plus" color="neutral" variant="ghost" size="xs"
                @click.stop="openCreateModal(item)" :title="$t('categories.add_child')" />
              <UButton icon="i-lucide-edit" color="info" variant="ghost" size="xs" @click.stop="editCategory(item)" />
              <UButton icon="i-lucide-trash" color="error" variant="ghost" size="xs"
                @click.stop="confirmDelete(item)" />
            </div>
          </div>
        </template>
      </UTree>
    </div>
  </UCard>

  <!-- Create/Edit Modal -->
  <UModal v-model:open="showModal">
    <template #content>
      <UCard>
        <template #header>
          <h3 class="font-bold">{{ editingCategory ? $t('categories.edit') : $t('categories.create') }}</h3>
        </template>

        <AdminCategoriesCategoryForm v-model="form" :loading="saving" :is-editing="!!editingCategory"
          :parent-options="parentOptions" @submit="handleSubmit" @cancel="showModal = false" />
      </UCard>
    </template>
  </UModal>

  <!-- Delete Confirmation -->
  <ConfirmModal v-model="showDeleteModal" :title="$t('categories.delete')"
    :description="$t('categories.delete_confirm')" color="error" @confirm="handleDelete"
    @cancel="showDeleteModal = false" />
</template>