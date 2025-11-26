<template>
  <div>
    <div class="flex items-center justify-between mb-6">
      <h1 class="text-2xl font-bold">Tags</h1>
      <UButton @click="openCreateModal" icon="i-lucide-plus">
        Create Tag
      </UButton>
    </div>

    <UCard>
      <UTable :rows="tags" :columns="columns" :loading="pending">
        <template #color-cell="{ row }">
          <div class="w-6 h-6 rounded-full border" :style="{ backgroundColor: getTag(row.original).color }"></div>
        </template>

        <template #actions-cell="{ row }">
          <div class="flex items-center gap-2">
            <UButton icon="i-lucide-edit" color="info" variant="ghost" size="xs"
              @click="editTag(getTag(row.original))" />
            <UButton icon="i-lucide-trash" color="error" variant="ghost" size="xs"
              @click="confirmDelete(getTag(row))" />
          </div>
        </template>
      </UTable>
    </UCard>

    <!-- Create/Edit Modal -->
    <UModal v-model="showModal">
      <UCard>
        <template #header>
          <h3 class="font-bold">{{ editingTag ? 'Edit Tag' : 'Create Tag' }}</h3>
        </template>

        <form @submit.prevent="handleSubmit" class="space-y-4">
          <UFormGroup label="Name" name="name" required>
            <UInput v-model="form.name" />
          </UFormGroup>

          <UFormGroup label="Description" name="description">
            <UTextarea v-model="form.description" />
          </UFormGroup>

          <UFormGroup label="Color" name="color">
            <div class="flex gap-2">
              <UInput v-model="form.color" type="color" class="w-12 p-1" />
              <UInput v-model="form.color" class="flex-1" />
            </div>
          </UFormGroup>

          <div class="flex justify-end gap-2 pt-4">
            <UButton color="neutral" variant="ghost" @click="showModal = false">Cancel</UButton>
            <UButton type="submit" :loading="saving">Save</UButton>
          </div>
        </form>
      </UCard>
    </UModal>

    <!-- Delete Confirmation -->
    <UModal v-model="showDeleteModal">
      <UCard>
        <template #header>
          <h3 class="font-bold">Delete Tag</h3>
        </template>
        <p>Are you sure you want to delete this tag?</p>
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
definePageMeta({
  layout: 'admin',
  middleware: 'admin'
})

const toast = useToast()
const { token } = useAuth()

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

const columns: any[] = [
  { accessorKey: 'name', header: 'Name' },
  { accessorKey: 'slug', header: 'Slug' },
  { id: 'color', header: 'Color' },
  { accessorKey: 'postCount', header: 'Posts' },
  { id: 'actions', header: 'Actions' }
]

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

    toast.add({ title: 'Tag created successfully', color: 'success' })
    showModal.value = false
    refresh()
  } catch (error: any) {
    toast.add({ title: error.message || 'Operation failed', color: 'error' })
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

    toast.add({ title: 'Tag deleted successfully', color: 'success' })
    showDeleteModal.value = false
    refresh()
  } catch (error: any) {
    toast.add({ title: 'Failed to create tag', color: 'error' })
  } finally {
    deleting.value = false
  }
}
</script>
