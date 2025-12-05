<script setup lang="ts">
import { useInfiniteScroll } from '@vueuse/core'
import type { TableColumn } from '@nuxt/ui'

definePageMeta({
  layout: 'admin',
  middleware: 'admin'
})

const toast = useToast()
const taxonomies = ref<Models.Taxonomy[]>([])
const cursor = ref<string | number | Date | null>(null)
const canLoadMore = ref(true)
const container = useTemplateRef('container')
const search = ref('')
const typeFilter = ref<Models.Taxonomy['type']>('tag')

const columns = computed(() => [
  { accessorKey: 'name', header: $t('common.name') },
  { accessorKey: 'slug', header: $t('common.slug') },
  { id: 'type', header: $t('common.type') },
  { id: 'color', header: $t('common.color') },
  { accessorKey: 'count', header: $t('common.count') },
  { id: 'actions', header: $t('common.actions') }
] as TableColumn<Models.Taxonomy>[])

const { data, status, refresh } = await useAPI<ApiResponse<Models.Taxonomy[]>>('/api/taxonomies/items', {
  method: 'POST',
  body: computed(() => ({
    cursor: cursor.value,
    limit: 20,
    search: search.value,
    type: typeFilter.value
  })),
  lazy: true,
  immediate: false
})

watch(data, (newData) => {
  if (!newData?.data) return

  if (!cursor.value) {
    taxonomies.value = newData.data
  } else {
    taxonomies.value.push(...newData.data)
  }

  canLoadMore.value = !!newData.nextCursor
})

watch([search, typeFilter], () => {
  cursor.value = null
  refresh()
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
const editingItem = ref<any>(null)
const itemToDelete = ref<any>(null)
const saving = ref(false)
const deleting = ref(false)

const form = ref<{
  name: string
  description: string
  type: Models.Taxonomy['type']
  color: string
}>({
  name: '',
  description: '',
  type: 'tag',
  color: '#3b82f6'
})

const openCreateModal = () => {
  editingItem.value = null
  form.value = { name: '', description: '', type: typeFilter.value || 'tag', color: '#3b82f6' }
  showModal.value = true
}

const editItem = (item: any) => {
  editingItem.value = item
  form.value = {
    name: item.name,
    description: item.description || '',
    type: item.type,
    color: item.color || '#3b82f6'
  }
  showModal.value = true
}

const handleSubmit = async () => {
  saving.value = true
  try {
    const url = editingItem.value
      ? `/api/taxonomies/${editingItem.value._id}`
      : '/api/taxonomies'

    const method = editingItem.value ? 'PUT' : 'POST'

    await $fetch(url, {
      method,
      body: form.value
    })

    toast.add({ title: editingItem.value ? $t('common.update_success') : $t('common.create_success'), color: 'success' })
    showModal.value = false

    if (editingItem.value) {
      // Update local item
      const index = taxonomies.value.findIndex(t => t._id === editingItem.value._id)
      if (index !== -1) {
        const existingTaxonomy = taxonomies.value[index]
        if (existingTaxonomy) taxonomies.value[index] = { ...existingTaxonomy, ...form.value }
      }
    } else {
      cursor.value = null
      refresh()
    }
  } catch (error: any) {
    toast.add({ title: error.message || $t('common.operation_failed'), color: 'error' })
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
    await $fetch(`/api/taxonomies/${itemToDelete.value._id}`, {
      method: 'DELETE' as any
    })

    toast.add({ title: $t('common.delete_success'), color: 'success' })
    showDeleteModal.value = false
    // Remove from list directly
    taxonomies.value = taxonomies.value.filter(t => t._id !== itemToDelete.value._id)
  } catch (error: any) {
    toast.add({ title: $t('common.delete_error'), color: 'error' })
  } finally {
    deleting.value = false
  }
}
</script>

<template>
  <UCard>
    <template #header>
      <div class="flex items-center justify-between mb-6">
        <h1 class="text-2xl font-bold">{{ $t('taxonomies.title') }}</h1>
        <UButton @click="openCreateModal" icon="i-lucide-plus">
          {{ $t('common.create') }}
        </UButton>
      </div>
    </template>

    <div class="flex gap-4 mb-4">
      <UInput v-model="search" icon="i-lucide-search" :placeholder="$t('common.search')" class="flex-1" />
      <USelect v-model="typeFilter" :options="[{ label: 'Tag', value: 'tag' }, { label: 'Keyword', value: 'keyword' }]"
        option-attribute="label" value-attribute="value" class="w-40" />
    </div>

    <div ref="container" class="flex-1 overflow-y-auto" style="height: calc(100vh - 300px);">
      <UTable :rows="taxonomies" :columns="columns" :loading="status === 'pending'" sticky>
        <template #type-cell="{ row }">
          <UBadge :color="row.original.type === 'tag' ? 'primary' : 'info'" variant="subtle" class="capitalize">
            {{ row.original.type }}
          </UBadge>
        </template>

        <template #color-cell="{ row }">
          <div class="w-6 h-6 rounded-full border" :style="{ backgroundColor: row.original.color }"></div>
        </template>

        <template #actions-cell="{ row }">
          <div class="flex items-center gap-2">
            <UButton icon="i-lucide-edit" color="info" variant="ghost" size="xs" @click="editItem(row.original)" />
            <UButton icon="i-lucide-trash" color="error" variant="ghost" size="xs"
              @click="confirmDelete(row.original)" />
          </div>
        </template>
        <template #empty>
          <UEmpty size="xl" icon="i-lucide-tags" :title="$t('common.no_data')" :description="$t('common.no_data_desc')"
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
      <div v-if="!canLoadMore && taxonomies.length > 0"
        class="text-center p-4 text-gray-500 dark:text-gray-400 text-sm">
        {{ $t('common.no_more_data') }}
      </div>
    </div>
  </UCard>

  <!-- Create/Edit Modal -->
  <UModal v-model:open="showModal">
    <template #content>
      <UCard>
        <template #header>
          <h3 class="font-bold">{{ editingItem ? $t('common.edit') : $t('common.create') }}</h3>
        </template>

        <AdminTaxonomiesTaxonomyForm v-model="form" :loading="saving" :is-editing="!!editingItem" @submit="handleSubmit"
          @cancel="showModal = false" />
      </UCard>
    </template>
  </UModal>

  <!-- Delete Confirmation -->
  <ConfirmModal v-model="showDeleteModal" :title="$t('common.delete')" :description="$t('common.confirm_delete')"
    color="error" @confirm="handleDelete" @cancel="showDeleteModal = false" />
</template>
