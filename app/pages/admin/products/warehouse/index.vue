<script setup lang="ts">
import type { FormSubmitEvent } from '#ui/types'
import { z } from 'zod'

const toast = useToast()

const columns = computed(() => [
  { accessorKey: 'code', header: $t('warehouses.code') },
  { accessorKey: 'name', header: $t('warehouses.name') },
  { accessorKey: 'manager', header: $t('warehouses.manager') },
  { accessorKey: 'phone', header: $t('warehouses.phone') },
  { accessorKey: 'status', header: $t('warehouses.status') },
  { id: 'actions', header: $t('common.actions') }
])

const { data: warehousesData, refresh, pending: loading } = await useAPI<ApiResponse<Models.Warehouse[]>>('/api/warehouses')

const warehouses = computed(() => warehousesData.value?.data || [])

const isOpen = ref(false)
const isEditing = ref(false)
const selectedId = ref<string | null>(null)

const schema = z.object({
  name: z.string().min(1, $t('form.required')),
  code: z.string().min(1, $t('form.required')),
  address: z.string().optional(),
  manager: z.string().optional(),
  phone: z.string().optional(),
  description: z.string().optional(),
  status: z.enum(['active', 'inactive']).default('active')
})

type Schema = z.output<typeof schema>

const state = reactive<Schema>({
  name: '',
  code: '',
  address: '',
  manager: '',
  phone: '',
  description: '',
  status: 'active'
})

const resetForm = () => {
  state.name = ''
  state.code = ''
  state.address = ''
  state.manager = ''
  state.phone = ''
  state.description = ''
  state.status = 'active'
  selectedId.value = null
  isEditing.value = false
}

const openCreate = () => {
  resetForm()
  isOpen.value = true
}

const openEdit = (warehouse: Models.Warehouse) => {
  state.name = warehouse.name
  state.code = warehouse.code
  state.address = warehouse.address
  state.manager = warehouse.manager
  state.phone = warehouse.phone
  state.description = warehouse.description
  state.status = warehouse.status
  selectedId.value = warehouse._id
  isEditing.value = true
  isOpen.value = true
}

const onSubmit = async (event: FormSubmitEvent<Schema>) => {
  try {
    if (isEditing.value && selectedId.value) {
      await $api(`/api/warehouses/${selectedId.value}`, {
        method: 'PUT',
        body: event.data
      })
      toast.add({ title: $t('warehouses.update_success'), color: 'success' })
    } else {
      await $api('/api/warehouses', {
        method: 'POST',
        body: event.data
      })
      toast.add({ title: $t('warehouses.create_success'), color: 'success' })
    }
    isOpen.value = false
    refresh()
  } catch (error: any) {
    toast.add({ title: error.data?.message || $t('message.error'), color: 'error' })
  }
}

const onDelete = async (id: string) => {
  if (!confirm($t('warehouses.delete_confirm'))) return
  try {
    await $api(`/api/warehouses/${id}`, {
      method: 'DELETE'
    })
    toast.add({ title: $t('warehouses.delete_success'), color: 'success' })
    refresh()
  } catch (error: any) {
    toast.add({ title: error.data?.message || $t('message.error'), color: 'error' })
  }
}
</script>

<template>
  <div class="p-4">
    <div class="flex justify-between items-center mb-4">
      <h1 class="text-2xl font-bold">{{ $t('warehouses.title') }}</h1>
      <UButton icon="i-heroicons-plus" @click="openCreate">
        {{ $t('common.create') }}
      </UButton>
    </div>

    <UCard>
      <UTable :data="warehouses || []" :columns="columns" :loading="loading">
        <template #status-cell="{ row }">
          <UBadge :color="row.original.status === 'active' ? 'success' : 'neutral'">
            {{ row.original.status === 'active' ? $t('common.active') : $t('common.inactive') }}
          </UBadge>
        </template>
        <template #actions-cell="{ row }">
          <div class="flex gap-2">
            <UButton color="neutral" variant="ghost" icon="i-heroicons-pencil-square" @click="openEdit(row.original)" />
            <UButton color="error" variant="ghost" icon="i-heroicons-trash" @click="onDelete(row.original._id)" />
          </div>
        </template>
      </UTable>
    </UCard>

    <UModal v-model="isOpen">
      <UCard>
        <template #header>
          <h3 class="text-lg font-bold">
            {{ isEditing ? $t('warehouses.edit') : $t('warehouses.create') }}
          </h3>
        </template>

        <UForm :schema="schema" :state="state" class="space-y-4" @submit="onSubmit">
          <div class="grid grid-cols-2 gap-4">
            <UFormGroup :label="$t('warehouses.name')" name="name" required>
              <UInput v-model="state.name" />
            </UFormGroup>
            <UFormGroup :label="$t('warehouses.code')" name="code" required>
              <UInput v-model="state.code" />
            </UFormGroup>
          </div>

          <UFormGroup :label="$t('warehouses.address')" name="address">
            <UInput v-model="state.address" />
          </UFormGroup>

          <div class="grid grid-cols-2 gap-4">
            <UFormGroup :label="$t('warehouses.manager')" name="manager">
              <UInput v-model="state.manager" />
            </UFormGroup>
            <UFormGroup :label="$t('warehouses.phone')" name="phone">
              <UInput v-model="state.phone" />
            </UFormGroup>
          </div>

          <UFormGroup :label="$t('warehouses.description')" name="description">
            <UTextarea v-model="state.description" />
          </UFormGroup>

          <UFormGroup :label="$t('warehouses.status')" name="status">
            <USelect v-model="state.status" :options="['active', 'inactive']" />
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
