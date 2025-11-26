<template>
  <div>
    <div class="flex items-center justify-between mb-6">
      <h1 class="text-2xl font-bold">Posts</h1>
      <UButton to="/admin/posts/create" icon="i-lucide-plus">
        Create Post
      </UButton>
    </div>

    <UCard>
      <!-- Filters -->
      <div class="flex gap-4 mb-6">
        <UInput v-model="search" icon="i-lucide-search" placeholder="Search posts..." class="flex-1"
          @input="handleSearch" />
        <USelect v-model="statusFilter" :options="['published', 'draft', 'scheduled', 'archived']" placeholder="Status"
          class="w-40" />
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
          <h3 class="font-bold text-lg">Delete Post</h3>
        </template>
        <p>Are you sure you want to delete this post? This action cannot be undone.</p>
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

const columns: any[] = [
  { key: 'title', label: 'Title' },
  { key: 'status', label: 'Status' },
  { key: 'author', label: 'Author' },
  { key: 'views', label: 'Views' },
  { key: 'publishedAt', label: 'Published' },
  { key: 'actions', label: 'Actions' }
]

const { data, pending, refresh } = await useAsyncData('admin-posts', () => fetchPosts({
  page: page.value,
  limit: limit.value,
  search: search.value,
  status: statusFilter.value
}), {
  watch: [page, statusFilter]
})

const posts = computed(() => data.value?.data?.posts || [])
const total = computed(() => data.value?.data?.pagination?.total || 0)

const getPost = (row: any): Models.Post => row

const getAuthorName = (post: Models.Post) => {
  if (typeof post.author === 'string') return post.author
  return post.author?.name || 'Unknown'
}

const getAuthorAvatar = (post: Models.Post) => {
  if (typeof post.author === 'string') return undefined
  return post.author?.avatar
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
