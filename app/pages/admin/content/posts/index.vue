<script setup lang="ts">
import { useDebounceFn, useInfiniteScroll } from '@vueuse/core'
import type { TableColumn } from '@nuxt/ui'
const UCheckbox = resolveComponent('UCheckbox')

definePageMeta({
  layout: 'admin',
  middleware: 'admin'
})

const { deletePost } = usePosts()
const toast = useToast()
const { locale } = useI18n()

const search = ref('')
const statusFilter = ref([])
const showDeleteModal = ref(false)
const postToDelete = ref<any>(null)
const deleting = ref(false)

const posts = ref<Models.Post[]>([])
const cursor = ref<string | number | null>(null)
const canLoadMore = ref(true)
const container = useTemplateRef('container')
const table = useTemplateRef('table')

const columns = computed(() => [
  {
    id: 'select',
    header: ({ table }) =>
      h(UCheckbox, {
        modelValue: table.getIsSomePageRowsSelected()
          ? 'indeterminate'
          : table.getIsAllPageRowsSelected(),
        'onUpdate:modelValue': (value: boolean | 'indeterminate') =>
          table.toggleAllPageRowsSelected(!!value),
        'aria-label': 'Select all'
      }),
    cell: ({ row }) =>
      h(UCheckbox, {
        modelValue: row.getIsSelected(),
        'onUpdate:modelValue': (value: boolean | 'indeterminate') => row.toggleSelected(!!value),
        'aria-label': 'Select row'
      })
  },
  { accessorKey: 'title', header: $t('common.title') },
  { accessorKey: 'status', header: $t('common.status') },
  { accessorKey: 'author', header: $t('common.author') },
  { accessorKey: 'views', header: $t('common.views') },
  { accessorKey: 'publishedAt', header: $t('common.published') },
  { id: 'actions', header: $t('common.actions') }
] as TableColumn<Models.Post>[])

const { data, status, refresh } = await useAPI<any>('/api/posts/items', {
  method: 'POST',
  body: computed(() => ({
    type: 'post',
    cursor: cursor.value,
    limit: 20,
    search: search.value,
    // status: statusFilter.value
  })),
  watch: false
})

// Initialize posts from data
if (data.value?.data) {
  posts.value = data.value.data
  if (data.value.nextCursor) {
    canLoadMore.value = true
  } else {
    canLoadMore.value = false
  }
}

watch(data, (newData) => {
  if (!newData?.data) return

  if (!cursor.value) {
    posts.value = newData.data
  } else {
    posts.value.push(...newData.data)
  }

  canLoadMore.value = !!newData.nextCursor
})

const handleSearch = useDebounceFn(() => {
  cursor.value = null
  refresh()
}, 500)

watch(statusFilter, () => {
  cursor.value = null
  refresh()
})

onMounted(() => {
  useInfiniteScroll(container, () => {
    if (data.value?.nextCursor) {
      cursor.value = data.value.nextCursor
      refresh()
    }
  }, {
    distance: 50,
    canLoadMore: () => {
      return status.value !== 'pending' && canLoadMore.value
    }
  })
})

const getAuthorName = (post: Models.Post) => {
  if (typeof post.author === 'string') return post.author
  return post.author?.name || 'Unknown'
}

const getAuthorAvatar = (post: Models.Post) => {
  if (typeof post.author === 'string') return undefined
  return post.author?.avatar?.url
}

const getStatusColor = (status: string) => {
  switch (status) {
    case 'published': return 'success'
    case 'draft': return 'neutral'
    case 'scheduled': return 'info'
    case 'archived': return 'warning'
    default: return 'neutral'
  }
}

const confirmDelete = (post: any) => {
  postToDelete.value = post
  showDeleteModal.value = true
}

const handleDelete = async () => {
  if (!postToDelete.value) return

  deleting.value = true
  try {
    await deletePost(postToDelete.value._id)
    showDeleteModal.value = false
    // Remove from list directly
    posts.value = posts.value.filter(p => p._id !== postToDelete.value._id)
    toast.add({ title: $t('success.delete'), color: 'success' })
  } catch (error: any) {
    toast.add({ title: $t(error.statusMessage) || $t('error.delete'), color: 'error' })
  } finally {
    deleting.value = false
  }
}
</script>

<template>
  <UCard :ui="{ header: 'flex items-center justify-between', footer: 'justify-end' }">
    <template #header>
      <h1 class="text-2xl font-bold">{{ $t('content.posts') }}</h1>
      <UButton to="/admin/content/posts/create" icon="i-lucide-plus">
        {{ $t('common.create') }} {{ $t('content.posts') }}
      </UButton>
    </template>
    <!-- Filters -->
    <div class="flex gap-4 mb-6">
      <UInput v-model="search" icon="i-lucide-search" :placeholder="$t('common.search')" class="flex-1"
        @input="handleSearch" />
      <USelect v-model="statusFilter" multiple :items="['published', 'draft', 'scheduled', 'archived']"
        :placeholder="$t('common.status')" class="w-40" />
    </div>

    <div ref="container" class="flex-1 overflow-y-auto" style="height: calc(100vh - 300px);">
      <UTable ref="table" :data="posts" :columns="columns" :loading="status === 'pending'" sticky>
        <template #title-cell="{ row }">
          <span class="font-medium">
            {{ typeof row.original.title === 'string' ? row.original.title : row.original.title?.[locale] ||
              row.original.title?.en }}
          </span>
        </template>

        <template #status-cell="{ row }">
          <UBadge :color="getStatusColor(row.original.status)" variant="subtle">
            {{ row.original.status }}
          </UBadge>
        </template>

        <template #author-cell="{ row }">
          <div class="flex items-center gap-2">
            <UAvatar :src="getAuthorAvatar(row.original)" :alt="getAuthorName(row.original)" size="xs" />
            <span class="text-sm">{{ getAuthorName(row.original) }}</span>
          </div>
        </template>

        <template #publishedAt-cell="{ row }">
          <span class="text-sm text-gray-500">
            {{ row.original.publishedAt ? new Date(row.original.publishedAt!).toLocaleDateString() : '-' }}
          </span>
        </template>

        <template #actions-cell="{ row }">
          <div class="flex items-center gap-2">
            <UButton icon="i-lucide-eye" color="neutral" variant="ghost" size="xs" :to="`/posts/${row.original.slug}`"
              target="_blank" />
            <UButton icon="i-lucide-edit" color="info" variant="ghost" size="xs"
              :to="`/admin/content/posts/${row.original._id}/edit`" />
            <UButton icon="i-lucide-trash" color="error" variant="ghost" size="xs"
              @click="confirmDelete(row.original)" />
          </div>
        </template>
        <template #empty>
          <UEmpty size="xl" icon="i-lucide-file-text" :title="$t('common.no_data')"
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

      <div class="px-4 py-3.5 border-t border-accented text-sm text-muted">
        {{ table?.tableApi?.getFilteredSelectedRowModel().rows.length || 0 }} of
        {{ table?.tableApi?.getFilteredRowModel().rows.length || 0 }} row(s) selected.
      </div>
      <div v-if="!canLoadMore && posts.length > 0" class="text-center p-4 text-gray-500 dark:text-gray-400 text-sm">
        {{ $t('common.no_more_data') }}
      </div>
    </div>
  </UCard>

  <!-- Delete Confirmation Modal -->
  <ConfirmModal v-model="showDeleteModal" :title="$t('common.delete') + ' ' + $t('content.posts')"
    :description="$t('message.delete_confirm_desc')" color="error" @confirm="handleDelete"
    @cancel="showDeleteModal = false" />
</template>