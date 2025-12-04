<script setup lang="ts">
import { z } from 'zod'
import type { FormSubmitEvent } from '#ui/types'

const toast = useToast()

const columns = computed(() => [
  { accessorKey: 'createdAt', header: $t('common.created_at') },
  { accessorKey: 'type', header: $t('inventory.type') },
  { accessorKey: 'amount', header: $t('inventory.total_amount') },
  { accessorKey: 'method', header: $t('payments.method') },
  { accessorKey: 'status', header: $t('inventory.status') },
  { accessorKey: 'note', header: $t('inventory.note') }
])

const page = ref(1)
const pageCount = ref(10)
const isOpen = ref(false)

const { data: paymentsData, refresh, pending: loading } = await useAPI<ApiResponse<Models.PaymentTransaction[]>>('/api/payments', {
  params: computed(() => ({
    page: page.value,
    limit: pageCount.value
  }))
})

const payments = computed(() => paymentsData.value?.data || [])
const total = computed(() => paymentsData.value?.pagination?.total || 0)

const schema = z.object({
  amount: z.number().min(1, $t('form.required')),
  type: z.enum(['in', 'out']),
  method: z.enum(['cash', 'bank_transfer', 'card', 'other']),
  status: z.enum(['pending', 'completed', 'failed']),
  note: z.string().optional(),
  reference: z.string().optional()
})

type Schema = z.output<typeof schema>

const state = reactive<Schema>({
  amount: 0,
  type: 'in',
  method: 'cash',
  status: 'completed',
  note: '',
  reference: ''
})

const onSubmit = async (event: FormSubmitEvent<Schema>) => {
  try {
    await $api('/api/payments', {
      method: 'POST',
      body: event.data
    })
    toast.add({ title: $t('message.success'), color: 'success' })
    isOpen.value = false
    refresh()
  } catch (error: any) {
    toast.add({ title: error.data?.message || $t('message.error'), color: 'error' })
  }
}
</script>

<template>
  <div class="p-4">
    <div class="flex justify-between items-center mb-4">
      <h1 class="text-2xl font-bold">{{ $t('payments.title') }}</h1>
      <UButton icon="i-heroicons-plus" @click="isOpen = true">
        {{ $t('common.create') }}
      </UButton>
    </div>

    <UCard>
      <UTable :data="payments" :columns="columns" :loading="loading">
        <template #createdAt-cell="{ row }">
          {{ row.original?.createdAt ? $d(row.original.createdAt, 'short') : $t('common.updating') }}
        </template>
        <template #type-cell="{ row }">
          <UBadge :color="row.original.type === 'in' ? 'success' : 'error'">
            {{ row.original.type === 'in' ? $t('payments.income') : $t('payments.expense') }}
          </UBadge>
        </template>
        <template #amount-cell="{ row }">
          {{ $n(row.original.amount, 'decimal') }}
        </template>
        <template #method-cell="{ row }">
          {{ $t(`payments.${row.original.method}`) }}
        </template>
        <template #status-cell="{ row }">
          <UBadge
            :color="row.original.status === 'completed' ? 'success' : row.original.status === 'pending' ? 'warning' : 'error'">
            {{ $t(`payments.${row.original.status}`) }}
          </UBadge>
        </template>
      </UTable>

      <div class="flex justify-end p-4 border-t">
        <UPagination v-model="page" :page-count="pageCount" :total="total" />
      </div>
    </UCard>

    <UModal v-model="isOpen">
      <UCard>
        <template #header>
          <h3 class="text-lg font-bold">{{ $t('payments.create') }}</h3>
        </template>

        <UForm :schema="schema" :state="state" class="space-y-4" @submit="onSubmit">
          <UFormGroup :label="$t('payments.amount')" name="amount" required>
            <UInput v-model.number="state.amount" type="number" />
          </UFormGroup>

          <div class="grid grid-cols-2 gap-4">
            <UFormGroup :label="$t('payments.type')" name="type">
              <USelect v-model="state.type" :options="['in', 'out']" />
            </UFormGroup>
            <UFormGroup :label="$t('payments.method')" name="method">
              <USelect v-model="state.method" :options="['cash', 'bank_transfer', 'card', 'other']" />
            </UFormGroup>
          </div>

          <UFormGroup :label="$t('payments.status')" name="status">
            <USelect v-model="state.status" :options="['pending', 'completed', 'failed']" />
          </UFormGroup>

          <UFormGroup :label="$t('payments.reference')" name="reference">
            <UInput v-model="state.reference" placeholder="Order ID or Transaction ID" />
          </UFormGroup>

          <UFormGroup :label="$t('payments.note')" name="note">
            <UTextarea v-model="state.note" />
          </UFormGroup>

          <div class="flex justify-end gap-2">
            <UButton color="neutral" variant="ghost" @click="isOpen = false">
              {{ $t('common.cancel') }}
            </UButton>
            <UButton type="submit">
              {{ $t('common.save') }}
            </UButton>
          </div>
        </UForm>
      </UCard>
    </UModal>
  </div>
</template>
