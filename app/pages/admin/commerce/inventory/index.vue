<script setup lang="ts">

definePageMeta({
  layout: 'admin',
  middleware: 'admin'
})

const columns = computed(() => [
  { accessorKey: 'code', header: $t('inventory.transaction_code') },
  { accessorKey: 'type', header: $t('inventory.type') },
  { accessorKey: 'warehouse.name', header: $t('inventory.warehouse') },
  { accessorKey: 'totalAmount', header: $t('inventory.total_amount') },
  { accessorKey: 'status', header: $t('inventory.status') },
  { accessorKey: 'createdAt', header: $t('common.created_at') }
])

const page = ref(1)
const pageCount = ref(10)

const { data: transactionsData, pending: loading } = await useAPI<ApiResponse<Models.InventoryTransaction[]>>('/api/inventory', {
  params: computed(() => ({
    page: page.value,
    limit: pageCount.value
  }))
})

const transactions = computed(() => transactionsData.value?.data || [])
const total = computed(() => transactionsData.value?.pagination?.total || 0)

const getTypeColor = (type?: string) => {
  if (!type) return 'neutral'
  switch (type) {
    case 'import': return 'success'
    case 'export': return 'error'
    case 'transfer': return 'primary'
    default: return 'neutral'
  }
}
</script>

<template>
  <div class="p-4">
    <div class="flex justify-between items-center mb-4">
      <h1 class="text-2xl font-bold">{{ $t('inventory.title') }}</h1>
      <div class="flex gap-2">
        <UButton to="/admin/products/inventory/import" color="success" icon="i-lucide-import">
          {{ $t('inventory.import') }}
        </UButton>
        <UButton to="/admin/products/inventory/export" color="error" icon="i-lucide-square-arrow-up">
          {{ $t('inventory.export') }}
        </UButton>
        <UButton to="/admin/products/inventory/transfer" color="primary" icon="i-lucide-square-arrow-right">
          {{ $t('inventory.transfer') }}
        </UButton>
      </div>
    </div>

    <UCard>
      <UTable :data="transactions" :columns="columns" :loading="loading">
        <template #type-cell="{ row }">
          <UBadge :color="getTypeColor(row.original?.type)">
            {{ $t(`inventory.${row.original?.type}`) }}
          </UBadge>
        </template>
        <template #createdAt-cell="{ row }">
          {{ $d(row.original?.createdAt, 'short') }}
        </template>
      </UTable>

      <div class="flex justify-end p-4 border-t">
        <UPagination v-model="page" :page-count="pageCount" :total="total" />
      </div>
    </UCard>
  </div>
</template>
