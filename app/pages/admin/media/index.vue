<template>
  <div>
    <div class="flex items-center justify-between mb-6">
      <h1 class="text-2xl font-bold">{{ $t('media.title') }}</h1>
    </div>

    <UCard class="mb-6">
      <MediaUploader @upload-success="handleUploadSuccess" />
    </UCard>

    <UCard>
      <div class="mb-4">
        <UInput v-model="search" icon="i-lucide-search" :placeholder="$t('common.search')" @input="handleSearch" />
      </div>

      <div v-if="pending" class="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-6 gap-4">
        <USkeleton v-for="i in 12" :key="i" class="aspect-square rounded-lg" />
      </div>

      <MediaGallery v-else :media="media" :pagination="pagination" @delete="confirmDelete"
        @page-change="handlePageChange" />
    </UCard>

    <!-- Delete Confirmation -->
    <UModal v-model="showDeleteModal">
      <UCard>
        <template #header>
          <h3 class="font-bold">{{ $t('common.delete') }}</h3>
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

const { fetchMedia, deleteMedia } = useMedia()
const toast = useToast()
const { t } = useI18n()

const page = ref(1)
const search = ref('')
const showDeleteModal = ref(false)
const itemToDelete = ref<any>(null)
const deleting = ref(false)

const { data, pending, refresh } = await useAsyncData('media', () => fetchMedia({
  page: page.value,
  limit: 18,
  search: search.value
}), {
  watch: [page]
})

const media = computed(() => data.value?.data?.media || [])
const pagination = computed(() => data.value?.data?.pagination)

const handleSearch = useDebounceFn(() => {
  page.value = 1
  refresh()
}, 500)

const handlePageChange = (newPage: number) => {
  page.value = newPage
}

const handleUploadSuccess = () => {
  toast.add({ title: 'Upload successful', color: 'success' })
  refresh()
}

const confirmDelete = (item: any) => {
  itemToDelete.value = item
  showDeleteModal.value = true
}

const handleDelete = async () => {
  if (!itemToDelete.value) return

  deleting.value = true
  try {
    await deleteMedia(itemToDelete.value._id)
    showDeleteModal.value = false
    refresh()
    toast.add({ title: 'File deleted', color: 'success' })
  } catch (error) {
    toast.add({ title: 'Failed to delete file', color: 'error' })
  } finally {
    deleting.value = false
  }
}
</script>
