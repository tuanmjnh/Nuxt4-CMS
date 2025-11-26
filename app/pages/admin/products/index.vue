<template>
  <div>
    <div class="flex items-center justify-between mb-6">
      <h1 class="text-2xl font-bold">Products</h1>
      <UButton to="/admin/products/create" icon="i-lucide-plus">
        Add Product
      </UButton>
    </div>

    <UCard>
      <div class="flex gap-4 mb-4">
        <UInput v-model="search" icon="i-lucide-search" placeholder="Search products..." class="w-64"
          @keyup.enter="() => refresh()" />
        <USelect v-model="status" :options="['published', 'draft', 'archived']" placeholder="Status" class="w-40"
          @change="() => refresh()" />
      </div>

      <UTable :rows="products" :columns="columns" :loading="pending">
        <template #image-data="{ row }">
          <UAvatar :src="getProduct(row).images?.[0]" :alt="getProduct(row).name" size="md" />
        </template>

        <template #status-data="{ row }">
          <UBadge :color="getStatusColor(getProduct(row).status)" variant="subtle">
            {{ getProduct(row).status }}
          </UBadge>
        </template>

        <template #price-data="{ row }">
          <div v-if="getProduct(row).type === 'simple'">
            <span v-if="getProduct(row).salePrice" class="line-through text-gray-400 text-xs mr-1">{{
              getProduct(row).price }}</span>
            <span :class="{ 'text-red-500': getProduct(row).salePrice }">{{ getProduct(row).salePrice ||
              getProduct(row).price }}</span>
          </div>
          <div v-else>
            <span class="text-xs text-gray-500">Variable</span>
          </div>
        </template>

        <template #stock-data="{ row }">
          <div v-if="getProduct(row).type === 'simple'">
            <span :class="{ 'text-red-500': (getProduct(row).stock || 0) <= 0 }">{{ getProduct(row).stock }}</span>
          </div>
          <div v-else>
            -
          </div>
        </template>

        <template #actions-data="{ row }">
          <div class="flex gap-2">
            <UButton color="neutral" variant="ghost" icon="i-lucide-edit"
              :to="`/admin/products/${getProduct(row)._id}`" />
            <UButton color="error" variant="ghost" icon="i-lucide-trash" @click="confirmDelete(getProduct(row))" />
          </div>
        </template>
      </UTable>

      <div class="flex justify-end mt-4">
        <UPagination v-model="page" :total="total" :page-count="limit" />
      </div>
    </UCard>
  </div>
</template>

<script setup lang="ts">
definePageMeta({
  layout: 'admin',
  middleware: 'admin'
})

const toast = useToast()
const page = ref(1)
const limit = ref(10)
const search = ref('')
const status = ref('')

const { data, pending, refresh } = await useFetch<{
  success: boolean
  data: Models.Product[]
  pagination: Models.Pagination
}>('/api/products', {
  query: { page, limit, search, status }
})

const products = computed(() => data.value?.data || [])
const total = computed(() => data.value?.pagination?.total || 0)

const columns: any[] = [
  { key: 'image', label: '' },
  { key: 'name', label: 'Name' },
  { key: 'sku', label: 'SKU' },
  { key: 'price', label: 'Price' },
  { key: 'stock', label: 'Stock' },
  { key: 'status', label: 'Status' },
  { key: 'actions', label: 'Actions' }
]

const getProduct = (row: any): Models.Product => row

const getStatusColor = (status: string) => {
  switch (status) {
    case 'published': return 'success'
    case 'draft': return 'neutral'
    case 'archived': return 'warning'
    default: return 'neutral'
  }
}

const confirmDelete = async (product: any) => {
  if (!confirm(`Are you sure you want to delete product "${product.name}"?`)) return

  try {
    await $fetch(`/api/products/${product._id}`, { method: 'DELETE' as any })
    toast.add({ title: 'Product deleted' })
    refresh()
  } catch (error: any) {
    toast.add({ title: 'Error', description: error.message, color: 'error' })
  }
}

watch([page, search, status], () => {
  refresh()
})
</script>
