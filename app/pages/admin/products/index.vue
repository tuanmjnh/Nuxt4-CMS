<script setup lang="ts">
import { useDebounceFn, useInfiniteScroll } from '@vueuse/core'
import type { TableColumn } from '@nuxt/ui'

definePageMeta({
  layout: 'admin',
  middleware: 'admin'
})

const toast = useToast()
const search = ref('')
const status = ref('')
const showDeleteModal = ref(false)
const productToDelete = ref<any>(null)

const products = ref<Models.Product[]>([])
const cursor = ref<string | number | null>(null)
const canLoadMore = ref(true)
const container = useTemplateRef('container')

const columns = computed(() => [
  { id: 'image', header: '' },
  { accessorKey: 'name', header: $t('common.name') },
  { accessorKey: 'sku', header: $t('products.sku') },
  { id: 'price', header: $t('products.price') },
  { id: 'stock', header: $t('products.stock') },
  { id: 'status', header: $t('common.status') },
  { id: 'actions', header: $t('common.actions') }
] as TableColumn<Models.Product>[])

const { data, status: requestStatus, refresh } = await useAPI<any>('/api/products/items', {
  method: 'POST',
  body: computed(() => ({
    cursor: cursor.value,
    limit: 20,
    search: search.value,
    status: status.value
  })),
  lazy: true,
  immediate: false
})

watch(data, (newData) => {
  if (!newData?.data) return

  if (!cursor.value) {
    products.value = newData.data
  } else {
    products.value.push(...newData.data)
  }

  canLoadMore.value = !!newData.nextCursor
})

const handleSearch = useDebounceFn(() => {
  cursor.value = null
  refresh()
}, 500)

watch(status, () => {
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
      return requestStatus.value !== 'pending' && canLoadMore.value
    }
  })
})

const getStatusColor = (status: string) => {
  switch (status) {
    case 'published': return 'success'
    case 'draft': return 'neutral'
    case 'archived': return 'warning'
    default: return 'neutral'
  }
}

const confirmDelete = (product: any) => {
  productToDelete.value = product
  showDeleteModal.value = true
}

const handleDelete = async () => {
  if (!productToDelete.value) return

  try {
    await $fetch(`/api/products/${productToDelete.value._id}`, { method: 'DELETE' as any })
    toast.add({ title: $t('products.delete_success') })
    // Remove from list directly
    products.value = products.value.filter(p => p._id !== productToDelete.value._id)
  } catch (error: any) {
    toast.add({ title: $t('common.error'), description: error.message, color: 'error' })
  } finally {
    showDeleteModal.value = false
    productToDelete.value = null
  }
}
</script>

<template>
  <UCard>
    <template #header>
      <div class="flex items-center justify-between mb-6">
        <h1 class="text-2xl font-bold">{{ $t('products.title') }}</h1>
        <UButton to="/admin/products/create" icon="i-lucide-plus">
          {{ $t('products.add') }}
        </UButton>
      </div>
    </template>
    <div class="flex gap-4 mb-4">
      <UInput v-model="search" icon="i-lucide-search" :placeholder="$t('products.search_placeholder')" class="w-64"
        @input="handleSearch" />
      <USelect v-model="status" :options="['published', 'draft', 'archived']" :placeholder="$t('common.status')"
        class="w-40" />
    </div>

    <div ref="container" class="flex-1 overflow-y-auto" style="height: calc(100vh - 300px);">
      <UTable :rows="products" :columns="columns" :loading="requestStatus === 'pending'" sticky>
        <template #image-cell="{ row }">
          <UAvatar :src="row.original.images?.[0]?.url || row.original.image?.url" :alt="row.original.name" size="md" />
        </template>

        <template #status-cell="{ row }">
          <UBadge :color="getStatusColor(row.original.status)" variant="subtle">
            {{ row.original.status }}
          </UBadge>
        </template>

        <template #price-cell="{ row }">
          <div v-if="row.original.type === 'simple'">
            <span v-if="row.original.salePrice" class="line-through text-gray-400 text-xs mr-1">{{
              row.original.price }}</span>
            <span :class="{ 'text-red-500': row.original.salePrice }">{{ row.original.salePrice ||
              row.original.price }}</span>
          </div>
          <div v-else>
            <span class="text-xs text-gray-500">Variable</span>
          </div>
        </template>

        <template #stock-data="{ row }">
          <div v-if="row.original.type === 'simple'">
            <span :class="{ 'text-red-500': (row.original.stock || 0) <= 0 }">{{ row.original.stock }}</span>
          </div>
          <div v-else>
            -
          </div>
        </template>

        <template #actions-data="{ row }">
          <div class="flex gap-2">
            <UButton color="neutral" variant="ghost" icon="i-lucide-edit" :to="`/admin/products/${row.original._id}`" />
            <UButton color="error" variant="ghost" icon="i-lucide-trash" @click="confirmDelete(row.original)" />
          </div>
        </template>
        <template #empty>
          <UEmpty size="xl" icon="i-lucide-shopping-bag" :title="$t('common.no_data')"
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
      <div v-if="!canLoadMore && products.length > 0" class="text-center p-4 text-gray-500 dark:text-gray-400 text-sm">
        {{ $t('common.no_more_data') }}
      </div>
    </div>
  </UCard>

  <!-- Delete Confirmation Modal -->
  <ConfirmModal v-model="showDeleteModal" :title="$t('products.delete_confirm_title')"
    :description="$t('products.delete_confirm', { name: productToDelete?.name })" color="error" @confirm="handleDelete"
    @cancel="showDeleteModal = false" />
</template>