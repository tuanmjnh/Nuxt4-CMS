<script setup lang="ts">
import type { TableColumn } from '@nuxt/ui'
definePageMeta({
  layout: 'admin',
  middleware: 'admin'
})

const toast = useToast()
const { data, pending, refresh } = await useFetch<ApiResponse<Models.Attribute[]>>('/api/products/attributes')

const attributes = computed(() => data.value?.data || [])

const showModal = ref(false)
const showDeleteModal = ref(false)
const saving = ref(false)
const isEditing = ref(false)
const editingId = ref('')
const itemToDelete = ref<Models.Attribute | null>(null)

const form = ref({
  name: '',
  values: ''
})

const columns = computed(() => [
  { id: 'name', header: $t('common.name') },
  { id: 'slug', header: $t('common.slug') },
  { id: 'values', header: $t('products.attributes') },
  { id: 'actions', header: $t('common.actions') }
] as TableColumn<Models.Attribute>[])

const openCreateModal = () => {
  isEditing.value = false
  editingId.value = ''
  form.value = { name: '', values: '' }
  showModal.value = true
}

const openEditModal = (attr: Models.Attribute) => {
  isEditing.value = true
  editingId.value = attr._id
  form.value = {
    name: attr.name,
    values: attr.values.join(', ')
  }
  showModal.value = true
}

const confirmDelete = (attr: Models.Attribute) => {
  itemToDelete.value = attr
  showDeleteModal.value = true
}

const handleDelete = async () => {
  if (!itemToDelete.value) return

  try {
    await $fetch(`/api/products/attributes/${itemToDelete.value._id}`, { method: 'DELETE' as any })
    toast.add({ title: $t('products.attribute_deleted') })
    refresh()
  } catch (error: any) {
    toast.add({ title: $t('common.error'), description: error.message, color: 'error' })
  } finally {
    showDeleteModal.value = false
    itemToDelete.value = null
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
      toast.add({ title: $t('products.attribute_updated') })
    } else {
      await $fetch('/api/products/attributes', {
        method: 'POST',
        body: payload
      })
      toast.add({ title: $t('products.attribute_created') })
    }
    showModal.value = false
    refresh()
  } catch (error: any) {
    toast.add({ title: $t('common.error'), description: error.message, color: 'error' })
  } finally {
    saving.value = false
  }
}
</script>

<template>
  <UCard>
    <template #header>
      <div class="flex items-center justify-between mb-6">
        <h1 class="text-2xl font-bold">{{ $t('products.attributes_title') }}</h1>
        <UButton @click="openCreateModal" icon="i-lucide-plus">
          {{ $t('products.create_attribute') }}
        </UButton>
      </div>
    </template>
    <UTable :rows="attributes" :columns="columns" :loading="pending">
      <template #values-cell="{ row }">
        <div class="flex flex-wrap gap-1">
          <UBadge v-for="value in row.original.values" :key="value" variant="subtle" size="xs">
            {{ value }}
          </UBadge>
        </div>
      </template>

      <template #actions-cell="{ row }">
        <div class="flex gap-2">
          <UButton color="neutral" variant="ghost" icon="i-lucide-edit" @click="openEditModal(row.original)" />
          <UButton color="error" variant="ghost" icon="i-lucide-trash" @click="confirmDelete(row.original)" />
        </div>
      </template>
    </UTable>
  </UCard>

  <!-- Create/Edit Modal -->
  <UModal v-model:open="showModal">
    <template #content>
      <UCard>
        <template #header>
          <h3 class="font-bold">{{ isEditing ? $t('products.edit_attribute') : $t('products.create_new_attribute') }}
          </h3>
        </template>

        <AdminProductsAttributeForm v-model="form" :loading="saving" :is-editing="isEditing" @submit="handleSubmit"
          @cancel="showModal = false" />
      </UCard>
    </template>
  </UModal>

  <ConfirmModal v-model="showDeleteModal" :title="$t('confirm.title')"
    :description="$t('products.delete_attribute_confirm', { name: itemToDelete?.name })" color="error"
    @confirm="handleDelete" @cancel="showDeleteModal = false" />
</template>