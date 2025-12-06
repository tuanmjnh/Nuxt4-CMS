<script setup lang="ts">
import { useDebounceFn, useInfiniteScroll } from '@vueuse/core'
import type { TableColumn } from '@nuxt/ui'

definePageMeta({
  layout: 'admin',
  middleware: 'admin'
})

const { deletePost } = usePosts()
const toast = useToast()

const search = ref('')
const statusFilter = ref('')
const showDeleteModal = ref(false)
const postToDelete = ref<any>(null)
const deleting = ref(false)

const posts = ref<Models.Post[]>([])
const cursor = ref<string | number | null>(null)
const canLoadMore = ref(true)
const container = useTemplateRef('container')

const columns = computed(() => [
  { id: 'title', header: $t('common.title') },
  { id: 'status', header: $t('common.status') },
  { id: 'author', header: $t('common.author') },
  { id: 'views', header: $t('common.views') },
  { id: 'publishedAt', header: $t('common.published') },
  { id: 'actions', header: $t('common.actions') }
] as TableColumn<Models.Post>[])

const { data, status, refresh } = await useAPI<any>('/api/posts/items', {
  method: 'POST',
  body: computed(() => ({
    type: 'page',
    cursor: cursor.value,
    limit: 20,
    search: search.value,
    status: statusFilter.value
  })),
  lazy: true,
  immediate: false
})

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
  <UCard>
    <template #header>
      <div class="flex items-center justify-between mb-6">
        <h1 class="text-2xl font-bold">{{ $t('content.pages') }}</h1>
        <UButton to="/admin/content/pages/create" icon="i-lucide-plus">
          {{ $t('common.create') }} {{ $t('content.pages') }}
        </UButton>
      </div>
    </template>
    <!-- Filters -->
    <div class="flex gap-4 mb-6">
      <UInput v-model="search" icon="i-lucide-search" :placeholder="$t('common.search')" class="flex-1"
        @input="handleSearch" />
      <USelect v-model="statusFilter" :options="['published', 'draft', 'scheduled', 'archived']"
        :placeholder="$t('common.status')" class="w-40" />
    </div>

    <div ref="container" class="flex-1 overflow-y-auto" style="height: calc(100vh - 300px);">
      <UTable :rows="posts" :columns="columns" :loading="status === 'pending'" sticky>
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
            <UButton icon="i-lucide-eye" color="neutral" variant="ghost" size="xs" :to="`/pages/${row.original.slug}`"
              target="_blank" />
            <UButton icon="i-lucide-edit" color="info" variant="ghost" size="xs"
              :to="`/admin/content/pages/${row.original._id}/edit`" />
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
      <div v-if="!canLoadMore && posts.length > 0" class="text-center p-4 text-gray-500 dark:text-gray-400 text-sm">
        {{ $t('common.no_more_data') }}
      </div>
    </div>
  </UCard>

  <!-- Delete Confirmation Modal -->
  <ConfirmModal v-model="showDeleteModal" :title="$t('common.delete') + ' ' + $t('content.pages')"
    :description="$t('message.delete_confirm_desc')" color="error" @confirm="handleDelete"
    @cancel="showDeleteModal = false" />
</template>