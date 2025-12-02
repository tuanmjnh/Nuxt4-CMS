<script setup lang="ts">
definePageMeta({
  layout: 'admin',
  middleware: 'admin'
})

const toast = useToast()
const { data, pending, refresh } = await useFetch<{
  success: boolean
  data: Models.ProductAttribute[]
}>('/api/products/attributes')

const attributes = computed(() => data.value?.data || [])

const showModal = ref(false)
const saving = ref(false)
const isEditing = ref(false)
const editingId = ref('')

const form = ref({
  name: '',
  values: ''
})

const columns = [
  { id: 'name', label: 'Name' },
  { id: 'slug', label: 'Slug' },
  { id: 'values', label: 'Values' },
  { id: 'actions', label: 'Actions' }
]

const getAttribute = (row: any): Models.ProductAttribute => row

const openCreateModal = () => {
  isEditing.value = false
  editingId.value = ''
  form.value = { name: '', values: '' }
  showModal.value = true
}

const openEditModal = (attr: any) => {
  isEditing.value = true
  editingId.value = attr._id
  form.value = {
    name: attr.name,
    values: attr.values.join(', ')
  }
  showModal.value = true
}

const confirmDelete = async (attr: any) => {
  if (!confirm(`Are you sure you want to delete attribute "${attr.name}"?`)) return

  try {
    await $fetch(`/api/products/attributes/${attr._id}`, { method: 'DELETE' as any })
    toast.add({ title: 'Attribute deleted' })
    refresh()
  } catch (error: any) {
    toast.add({ title: 'Error', description: error.message, color: 'error' })
  }
}

const handleSubmit = async () => {
  saving.value = true
  try {
    const payload = {
      name: form.value.name,
      values: form.value.values.split(',').map(v => v.trim()).filter(v => v)
    }

    if (isEditing.value) {
      await $fetch(`/api/products/attributes/${editingId.value}`, {
        method: 'PUT',
        body: payload
      })
      toast.add({ title: 'Attribute updated' })
    } else {
      await $fetch('/api/products/attributes', {
        method: 'POST',
        body: payload
      })
      toast.add({ title: 'Attribute created' })
    }
    showModal.value = false
    refresh()
  } catch (error: any) {
    toast.add({ title: 'Error', description: error.message, color: 'error' })
  } finally {
    saving.value = false
  }
}
</script>

<template>
  <UCard>
    <template #header>
      <div class="flex items-center justify-between mb-6">
        <h1 class="text-2xl font-bold">Product Attributes</h1>
        <UButton @click="openCreateModal" icon="i-lucide-plus">
          Create Attribute
        </UButton>
      </div>
    </template>
    <UTable :rows="attributes" :columns="columns" :loading="pending">
      <template #values-cell="{ row }">
        <div class="flex flex-wrap gap-1">
          <UBadge v-for="value in getAttribute(row).values" :key="value" variant="subtle" size="xs">
            {{ value }}
          </UBadge>
        </div>
      </template>

      <template #actions-cell="{ row }">
        <div class="flex gap-2">
          <UButton color="neutral" variant="ghost" icon="i-lucide-edit" @click="openEditModal(getAttribute(row))" />
          <UButton color="error" variant="ghost" icon="i-lucide-trash" @click="confirmDelete(getAttribute(row))" />
        </div>
      </template>
    </UTable>
  </UCard>

  <!-- Create/Edit Modal -->
  <UModal v-model:open="showModal">
    <template #content>
      <UCard>
        <template #header>
          <h3 class="font-bold">{{ isEditing ? 'Edit Attribute' : 'Create New Attribute' }}</h3>
        </template>

        <form @submit.prevent="handleSubmit" class="space-y-4">
          <UFormField label="Name" name="name" required>
            <UInput v-model="form.name" />
          </UFormField>

          <UFormField label="Values (comma separated)" name="values" required>
            <UInput v-model="form.values" placeholder="S, M, L, XL" />
            <p class="text-xs text-gray-500 mt-1">Enter values separated by commas</p>
          </UFormField>

          <div class="flex justify-end gap-2 pt-4">
            <UButton color="neutral" variant="ghost" @click="showModal = false">Cancel</UButton>
            <UButton type="submit" :loading="saving">{{ isEditing ? 'Update' : 'Create' }}</UButton>
          </div>
        </form>
      </UCard>
    </template>
  </UModal>
</template>