<script setup lang="ts">
import { z } from 'zod'
import type { FormSubmitEvent } from '#ui/types'

const toast = useToast()
const router = useRouter()

const schema = z.object({
  warehouse: z.string().min(1, $t('form.required')),
  items: z.array(z.object({
    product: z.string().min(1, $t('form.required')),
    quantity: z.number().min(1, $t('form.required')),
    price: z.number().min(0).default(0)
  })).min(1, $t('form.required')),
  note: z.string().optional(),
  reference: z.string().optional()
})

type Schema = z.output<typeof schema>

const state = reactive<Schema>({
  warehouse: '',
  items: [{ product: '', quantity: 1, price: 0 }],
  note: '',
  reference: ''
})

const loading = ref(false)

const [{ data: warehouses }, { data: productsData }] = await Promise.all([
  useAPI<Models.Warehouse[]>('/api/warehouses'),
  useAPI<any>('/api/products/items', { params: { limit: 100 } })
])

const products = computed(() => productsData.value?.posts || [])

const addItem = () => {
  state.items.push({ product: '', quantity: 1, price: 0 })
}

const removeItem = (index: number) => {
  state.items.splice(index, 1)
}

const onSubmit = async (event: FormSubmitEvent<Schema>) => {
  try {
    loading.value = true
    await $api('/api/inventory', {
      method: 'POST',
      body: { ...event.data, type: 'import' }
    })
    toast.add({ title: $t('inventory.create_success'), color: 'success' })
    router.push('/admin/products/inventory')
  } catch (error: any) {
    toast.add({ title: error.data?.message || $t('message.error'), color: 'error' })
  } finally {
    loading.value = false
  }
}
</script>

<template>
  <div class="p-4">
    <div class="flex items-center gap-4 mb-4">
      <UButton icon="i-heroicons-arrow-left" color="neutral" variant="ghost" to="/admin/products/inventory" />
      <h1 class="text-2xl font-bold">{{ $t('inventory.import') }}</h1>
    </div>

    <UCard>
      <UForm :schema="schema" :state="state" class="space-y-4" @submit="onSubmit">
        <UFormGroup :label="$t('inventory.warehouse')" name="warehouse" required>
          <USelectMenu v-model="state.warehouse" :options="warehouses || []" value-attribute="_id"
            option-attribute="name" searchable />
        </UFormGroup>

        <div class="border rounded p-4 space-y-4">
          <div class="flex justify-between items-center">
            <h3 class="font-semibold">{{ $t('inventory.items') }}</h3>
            <UButton size="xs" icon="i-heroicons-plus" @click="addItem">
              {{ $t('common.add') }}
            </UButton>
          </div>

          <div v-for="(item, index) in state.items" :key="index"
            class="flex gap-4 items-end border-b pb-4 last:border-0 last:pb-0">
            <UFormGroup :label="$t('products.name')" :name="`items.${index}.product`" class="flex-1">
              <USelectMenu v-model="item.product" :options="products" value-attribute="_id" option-attribute="name"
                searchable />
            </UFormGroup>

            <UFormGroup :label="$t('products.stock_quantity')" :name="`items.${index}.quantity`" class="w-32">
              <UInput v-model.number="item.quantity" type="number" min="1" />
            </UFormGroup>

            <UFormGroup :label="$t('products.price')" :name="`items.${index}.price`" class="w-32">
              <UInput v-model.number="item.price" type="number" min="0" />
            </UFormGroup>

            <UButton color="error" variant="ghost" icon="i-heroicons-trash" @click="removeItem(index)" />
          </div>
        </div>

        <div class="grid grid-cols-2 gap-4">
          <UFormGroup :label="$t('inventory.reference')" name="reference">
            <UInput v-model="state.reference" />
          </UFormGroup>
          <UFormGroup :label="$t('inventory.note')" name="note">
            <UInput v-model="state.note" />
          </UFormGroup>
        </div>

        <div class="flex justify-end">
          <UButton type="submit" :loading="loading">
            {{ $t('common.save') }}
          </UButton>
        </div>
      </UForm>
    </UCard>
  </div>
</template>
