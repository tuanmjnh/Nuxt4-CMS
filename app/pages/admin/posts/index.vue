<template>
  <div>
    <div class="flex items-center justify-between mb-6">
      <h1 class="text-2xl font-bold">{{ $t('posts.title') }}</h1>
      <UButton to="/admin/posts/create" icon="i-lucide-plus">
        {{ $t('common.create') }} {{ $t('posts.single') }}
      </UButton>
    </div>

    <UCard>
      <!-- Filters -->
      <div class="flex gap-4 mb-6">
        <UInput v-model="search" icon="i-lucide-search" :placeholder="$t('common.search')" class="flex-1"
          @input="handleSearch" />
        <USelect v-model="statusFilter" :options="['published', 'draft', 'scheduled', 'archived']"
          :placeholder="$t('common.status')" class="w-40" />
      </div>

      <UTable :rows="posts" :columns="columns" :loading="pending">
        <template #status-data="{ row }">
          <UBadge :color="getStatusColor(getPost(row).status)" variant="subtle">
            {{ getPost(row).status }}
          </UBadge>
        </template>

        <template #author-data="{ row }">
          <div class="flex items-center gap-2">
            <UAvatar :src="getAuthorAvatar(getPost(row))" :alt="getAuthorName(getPost(row))" size="xs" />
            <span class="text-sm">{{ getAuthorName(getPost(row)) }}</span>
          </div>
        </template>

        <template #publishedAt-data="{ row }">
          <span class="text-sm text-gray-500">
            {{ getPost(row).publishedAt ? new Date(getPost(row).publishedAt!).toLocaleDateString() : '-' }}
          </span>
        </template>

        <template #actions-data="{ row }">
          <div class="flex items-center gap-2">
            <UButton icon="i-lucide-eye" color="neutral" variant="ghost" size="xs" :to="`/posts/${getPost(row).slug}`"
              target="_blank" />
            <UButton icon="i-lucide-edit" color="info" variant="ghost" size="xs"
              :to="`/admin/posts/${getPost(row)._id}/edit`" />
            <UButton icon="i-lucide-trash" color="error" variant="ghost" size="xs"
              @click="confirmDelete(getPost(row))" />
          </div>
        </template>
      </UTable>

      <!-- Pagination -->
      <div class="flex justify-center mt-6">
        <UPagination v-model="page" :total="total" :page-count="limit" />
      </div>
    </UCard>

    <!-- Delete Confirmation Modal -->
    <UModal v-model="showDeleteModal">
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
    </UModal>
  </div>
</template>

<script setup lang="ts">
import { useDebounceFn } from '@vueuse/core'

definePageMeta({
  layout: 'admin',
  middleware: 'admin'
})

const { fetchPosts, deletePost } = usePosts()
const toast = useToast()
const { t } = useI18n()

const page = ref(1)
const limit = ref(10)
const search = ref('')
const statusFilter = ref('')
const showDeleteModal = ref(false)
const postToDelete = ref<any>(null)
const deleting = ref(false)

const columns = computed(() => [
  { key: 'title', label: t('common.title') },
  { key: 'status', label: t('common.status') },
  { key: 'author', label: 'Author' }, // Need to add author to i18n if not present, or use common
  { key: 'views', label: 'Views' }, // Need to add views
  { key: 'publishedAt', label: t('common.published') },
  { key: 'actions', label: t('common.actions') }
] as any[])

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

const getPost = (row: any): Models.Post => row

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
    toast.add({ title: 'Post deleted successfully', color: 'success' })
  } catch (error) {
    toast.add({ title: 'Failed to delete post', color: 'error' })
  } finally {
    deleting.value = false
  }
}
</script>
