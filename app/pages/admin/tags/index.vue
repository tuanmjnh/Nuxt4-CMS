<script setup lang="ts">
definePageMeta({
  layout: 'admin',
  middleware: 'admin'
})

const toast = useToast()
const { token } = useAuth()
const { t } = useI18n()

const showModal = ref(false)
const showDeleteModal = ref(false)
const editingTag = ref<any>(null)
const tagToDelete = ref<any>(null)
const saving = ref(false)
const deleting = ref(false)

const form = ref({
  name: '',
  description: '',
  color: '#3b82f6'
})

const columns = computed(() => [
  { accessorKey: 'name', header: t('common.name') },
  { accessorKey: 'slug', header: t('common.slug') },
  { id: 'color', header: t('common.color') },
  { accessorKey: 'postCount', header: t('posts.title') },
  { id: 'actions', header: t('common.actions') }
])

const { data, pending, refresh } = await useFetch<{
  success: boolean
  data: {
    tags: Models.Tag[]
  }
}>('/api/tags')
const tags = computed(() => data.value?.data?.tags || [])

const getTag = (row: any): Models.Tag => row

const openCreateModal = () => {
  editingTag.value = null
  form.value = { name: '', description: '', color: '#3b82f6' }
  showModal.value = true
}

const editTag = (tag: any) => {
  editingTag.value = tag
  form.value = {
    name: tag.name,
    description: tag.description || '',
    color: tag.color || '#3b82f6'
  }
  showModal.value = true
}

const handleSubmit = async () => {
  saving.value = true
  try {
    const url = editingTag.value
      ? `/api/tags/${editingTag.value._id}`
      : '/api/tags'

    const method = editingTag.value ? 'PUT' : 'POST'

    await $fetch(url, {
      method,
      body: form.value,
      headers: { Authorization: `Bearer ${token.value}` }
    })

    toast.add({ title: t('tags.create_success'), color: 'success' })
    showModal.value = false
    refresh()
  } catch (error: any) {
    toast.add({ title: error.message || t('common.operation_failed'), color: 'error' })
  } finally {
    saving.value = false
  }
}

const confirmDelete = (tag: any) => {
  tagToDelete.value = tag
  showDeleteModal.value = true
}

const handleDelete = async () => {
  if (!tagToDelete.value) return

  deleting.value = true
  try {
    await $fetch(`/api/tags/${tagToDelete.value._id}`, {
      method: 'DELETE' as any,
      headers: { Authorization: `Bearer ${token.value}` }
    })

    toast.add({ title: t('tags.delete_success'), color: 'success' })
    showDeleteModal.value = false
    refresh()
  } catch (error: any) {
    toast.add({ title: t('tags.create_error'), color: 'error' })
  } finally {
    deleting.value = false
  }
}
</script>

<template>
  <UCard>
    <template #header>
      <div class="flex items-center justify-between mb-6">
        <h1 class="text-2xl font-bold">{{ $t('tags.title') }}</h1>
        <UButton @click="openCreateModal" icon="i-lucide-plus">
          {{ $t('tags.create') }}
        </UButton>
      </div>
    </template>
    <UTable :rows="tags" :columns="columns" :loading="pending">
      <template #color-cell="{ row }">
        <div class="w-6 h-6 rounded-full border" :style="{ backgroundColor: getTag(row.original).color }"></div>
      </template>

      <template #actions-cell="{ row }">
        <div class="flex items-center gap-2">
          <UButton icon="i-lucide-edit" color="info" variant="ghost" size="xs" @click="editTag(getTag(row.original))" />
          <UButton icon="i-lucide-trash" color="error" variant="ghost" size="xs" @click="confirmDelete(getTag(row))" />
        </div>
      </template>
    </UTable>
  </UCard>

  <!-- Create/Edit Modal -->
  <UModal v-model:open="showModal">
    <template #content>
      <UCard>
        <template #header>
          <h3 class="font-bold">{{ editingTag ? $t('tags.edit') : $t('tags.create') }}</h3>
        </template>

        <form @submit.prevent="handleSubmit" class="space-y-4">
          <UFormField :label="$t('common.name')" name="name" required>
            <UInput v-model="form.name" />
          </UFormField>

          <UFormField :label="$t('common.description')" name="description">
            <UTextarea v-model="form.description" />
          </UFormField>

          <UFormField :label="$t('common.color')" name="color">
            <div class="flex gap-2">
              <UInput v-model="form.color" type="color" class="w-12 p-1" />
              <UInput v-model="form.color" class="flex-1" />
            </div>
          </UFormField>

          <div class="flex justify-end gap-2 pt-4">
            <UButton color="neutral" variant="ghost" @click="showModal = false">{{ $t('common.cancel') }}</UButton>
            <UButton type="submit" :loading="saving">{{ $t('common.save') }}</UButton>
          </div>
        </form>
      </UCard>
    </template>
  </UModal>

  <!-- Delete Confirmation -->
  <UModal v-model:open="showDeleteModal">
    <template #content>
      <UCard>
        <template #header>
          <h3 class="font-bold">{{ $t('tags.delete') }}</h3>
        </template>
        <p>{{ $t('tags.delete_confirm') }}</p>
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