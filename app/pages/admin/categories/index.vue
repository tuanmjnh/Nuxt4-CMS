<template>
  <div>
    <div class="flex items-center justify-between mb-6">
      <h1 class="text-2xl font-bold">Categories</h1>
      <UButton @click="openCreateModal" icon="i-lucide-plus">
        Create Category
      </UButton>
    </div>

    <UCard>
      <div class="mb-4">
        <UTabs :items="tabs" @change="onTabChange" />
      </div>

      <UTable :rows="categories" :columns="columns" :loading="pending">
        <template #actions-data="{ row }">
          <div class="flex items-center gap-2">
            <UButton icon="i-lucide-edit" color="info" variant="ghost" size="xs" @click="editCategory(row)" />
            <UButton icon="i-lucide-trash" color="error" variant="ghost" size="xs" @click="confirmDelete(row)" />
          </div>
        </template>
      </UTable>
    </UCard>

    <!-- Create/Edit Modal -->
    <UModal v-model="showModal">
      <UCard>
        <template #header>
          <h3 class="font-bold">{{ editingCategory ? 'Edit Category' : 'Create Category' }}</h3>
        </template>

        <form @submit.prevent="handleSubmit" class="space-y-4">
          <UFormGroup label="Type" name="type">
            <USelect v-model="form.type" :options="['post', 'product']" disabled />
          </UFormGroup>

          <UFormGroup label="Name" name="name" required>
            <UInput v-model="form.name" />
          </UFormGroup>

          <UFormGroup label="Description" name="description">
            <UTextarea v-model="form.description" />
          </UFormGroup>

          <UFormGroup label="Parent Category" name="parent">
            <USelect v-model="form.parent" :options="parentOptions" option-attribute="name" value-attribute="_id"
              placeholder="None" />
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
          <h3 class="font-bold">Delete Category</h3>
        </template>
        <p>Are you sure you want to delete this category? Items will be unassigned.</p>
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
const editingCategory = ref<any>(null)
const categoryToDelete = ref<any>(null)
const saving = ref(false)
const deleting = ref(false)
const currentType = ref('post')

const tabs = [
  { label: 'Post Categories', slot: 'post', content: 'post' },
  { label: 'Product Categories', slot: 'product', content: 'product' }
]

const form = ref({
  name: '',
  description: '',
  parent: '',
  type: 'post'
})

const columns = [
  { key: 'name', label: 'Name' },
  { key: 'slug', label: 'Slug' },
  { key: 'postCount', label: 'Count' },
  { key: 'actions', label: 'Actions' }
]

const { data, pending, refresh } = await useFetch('/api/categories', {
  query: { type: currentType }
})

const categories = computed(() => data.value?.data?.categories || [])

const parentOptions = computed(() => {
  return categories.value.filter((c: any) => c._id !== editingCategory.value?._id)
})

const onTabChange = (index: number) => {
  currentType.value = tabs[index].content
  refresh()
}

const openCreateModal = () => {
  editingCategory.value = null
  form.value = { name: '', description: '', parent: '', type: currentType.value }
  showModal.value = true
}

const editCategory = (category: any) => {
  editingCategory.value = category
  form.value = {
    name: category.name,
    description: category.description || '',
    parent: category.parent?._id || category.parent || '',
    type: category.type || 'post'
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

    toast.add({ title: `Category ${editingCategory.value ? 'updated' : 'created'} successfully`, color: 'success' })
    showModal.value = false
    refresh()
  } catch (error: any) {
    toast.add({ title: error.message || 'Operation failed', color: 'error' })
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

    toast.add({ title: 'Category deleted successfully', color: 'success' })
    showDeleteModal.value = false
    refresh()
  } catch (error: any) {
    toast.add({ title: 'Failed to delete category', color: 'error' })
  } finally {
    deleting.value = false
  }
}
</script>
