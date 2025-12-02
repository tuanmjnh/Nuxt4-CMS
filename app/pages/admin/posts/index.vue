<script setup lang="ts">
import { useDebounceFn } from '@vueuse/core'

definePageMeta({
  layout: 'admin',
  middleware: 'admin'
})

const { fetchPosts, deletePost } = usePosts()
const toast = useToast()

const page = ref(1)
const limit = ref(10)
const search = ref('')
const statusFilter = ref('')
const showDeleteModal = ref(false)
const postToDelete = ref<any>(null)
const deleting = ref(false)

const columns = computed(() => [
  { id: 'title', header: $t('common.title') },
  { id: 'status', header: $t('common.status') },
  { id: 'author', header: $t('common.author') },
  { id: 'views', header: $t('common.views') },
  { id: 'publishedAt', header: $t('common.published') },
  { id: 'actions', header: $t('common.actions') }
])

const { data, pending, refresh } = await useAsyncData('admin-posts', () => fetchPosts({
  page: page.value,
  limit: limit.value,
  search: search.value,
  status: statusFilter.value as any // Cast to any to avoid strict type mismatch for now
}), {
  watch: [page, statusFilter]
})

const posts = computed(() => data.value?.data?.items || [])
const total = computed(() => data.value?.data?.pagination?.total || 0)

const getAuthorName = (post: Models.Post) => {
  if (typeof post.author === 'string') return post.author
  return post.author?.name || 'Unknown'
}

const getAuthorAvatar = (post: Models.Post) => {
  if (typeof post.author === 'string') return undefined
  return post.author?.avatar?.url
}

const handleSearch = useDebounceFn(() => {
  page.value = 1
  refresh()
}, 500)

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
    refresh()
    toast.add({ title: $t('posts.delete_success'), color: 'success' })
  } catch (error) {
    toast.add({ title: $t('posts.delete_error'), color: 'error' })
  } finally {
    deleting.value = false
  }
}
</script>

<template>
  <UCard>
    <template #header>
      <div class="flex items-center justify-between mb-6">
        <h1 class="text-2xl font-bold">{{ $t('posts.title') }}</h1>
        <UButton to="/admin/posts/create" icon="i-lucide-plus">
          {{ $t('common.create') }} {{ $t('posts.single') }}
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

    <UTable :rows="posts" :columns="columns" :loading="pending">
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
            :to="`/admin/posts/${row.original._id}/edit`" />
          <UButton icon="i-lucide-trash" color="error" variant="ghost" size="xs" @click="confirmDelete(row.original)" />
        </div>
      </template>
    </UTable>

    <!-- Pagination -->
    <div class="flex justify-center mt-6">
      <UPagination v-model="page" :total="total" :page-count="limit" />
    </div>
  </UCard>

  <!-- Delete Confirmation Modal -->
  <UModal v-model:open="showDeleteModal">
    <template #content>
      <UCard>
        <template #header>
          <h3 class="font-bold text-lg">{{ $t('common.delete') }} {{ $t('posts.single') }}</h3>
        </template>
        <p>{{ $t('common.confirm_delete') }}</p>
        <template #footer>
          <div class="flex justify-end gap-2">
            <UButton color="neutral" variant="ghost" @click="showDeleteModal = false">{{ $t('common.cancel') }}
            </UButton>
            <UButton color="error" @click="handleDelete" :loading="deleting">{{ $t('common.delete') }}</UButton>
          </div>
        </template>
      </UCard>
    </template>
  </UModal>
</template>