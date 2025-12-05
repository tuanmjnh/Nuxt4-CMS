<script setup lang="ts">
import { z } from 'zod'
import type { TableColumn } from '@nuxt/ui'
import type { FormSubmitEvent } from '#ui/types'

definePageMeta({
  layout: 'admin',
  middleware: 'admin'
})

const toast = useToast()

const columns = computed<TableColumn<Models.Connect>[]>(() => [
  { accessorKey: 'title', header: $t('form.title') },
  { accessorKey: 'key', header: $t('form.key') },
  { accessorKey: 'flag', header: $t('form.status') },
  { id: 'actions', header: $t('common.actions') }
])

const { data: connects, refresh, pending } = await useAPI<Models.Response<Record<string, Models.Connect>>>('/api/system/connect')

const items = computed<Models.Connect[]>(() => {
  if (!connects.value?.data) return []
  return Object.values(connects.value.data)
})

const isOpen = ref(false)
const isEdit = ref(false)
const selectedId = ref<string | undefined>(undefined)

const schema = z.object({
  title: z.string().min(1, $t('form.required')),
  key: z.string().min(1, $t('form.required')),
  clientID: z.string().optional(),
  credentials: z.object({
    clientSecret: z.string().optional(),
    apiKey: z.string().optional(),
    secretKey: z.string().optional()
  }).default({}),
  flag: z.number().default(1)
})

type Schema = z.output<typeof schema>

const state = reactive<Schema>({
  title: '',
  key: '',
  clientID: '',
  credentials: {},
  flag: 1
})

const resetState = () => {
  state.title = ''
  state.key = ''
  state.clientID = ''
  state.credentials = {}
  state.flag = 1
  selectedId.value = undefined
  isEdit.value = false
}

const onOpen = () => {
  resetState()
  isOpen.value = true
}

const onEdit = (row: Models.Connect) => {
  resetState()
  isEdit.value = true
  selectedId.value = row._id

  state.title = row.title
  state.key = row.key || ''
  state.clientID = row.clientID || ''
  state.credentials = row.credentials || {}
  state.flag = row.flag

  isOpen.value = true
}

const onSubmit = async (event: FormSubmitEvent<Schema>) => {
  try {
    const payload = {
      ...event.data,
      credentials: {
        ...event.data.credentials
      }
    }

    if (isEdit.value && selectedId.value) {
      await $api(`/api/system/connect/${selectedId.value}`, {
        method: 'PUT',
        body: payload
      })
    } else {
      // Create logic is handled by the bulk update endpoint mostly, 
      // but here we might want to add a single one. 
      // The current backend structure for 'create' was bulk.
      // Let's use the index.post.ts which handles upsert by key.
      await $api('/api/system/connect', {
        method: 'POST',
        body: {
          [event.data.key]: {
            ...payload,
            enabled: event.data.flag === 1
          }
        }
      })
    }

    toast.add({ title: $t('message.success'), color: 'success' })
    isOpen.value = false
    refresh()
  } catch (error: any) {
    toast.add({ title: error.data?.message || $t('message.error'), color: 'error' })
  }
}

const onDelete = async (id?: string) => {
  if (!id) toast.add({ title: $t('message.error'), description: $t('error.no_exist'), color: 'error' })
  if (!confirm($t('message.delete_confirm'))) return

  try {
    await $api(`/api/system/connect/${id}`, {
      method: 'DELETE'
    })
    toast.add({ title: $t('message.success'), color: 'success' })
    refresh()
  } catch (error: any) {
    toast.add({ title: error.data?.message || $t('message.error'), color: 'error' })
  }
}

const onToggleStatus = async (row: Models.Connect) => {
  try {
    const newFlag = row.flag === 1 ? 0 : 1
    await $api('/api/system/connect/status', {
      method: 'PUT',
      body: {
        id: row._id,
        flag: newFlag
      }
    })
    toast.add({ title: $t('message.success'), color: 'success' })
    refresh()
  } catch (error: any) {
    toast.add({ title: error.data?.message || $t('message.error'), color: 'error' })
    // Revert UI if needed, but refresh handles it
  }
}
</script>

<template>
  <div class="p-4">
    <div class="flex items-center justify-between mb-4">
      <h1 class="text-2xl font-bold">{{ $t('settings.connect') }}</h1>
      <UButton icon="i-lucide-plus" @click="onOpen">
        {{ $t('common.create') }}
      </UButton>
    </div>

    <UCard>
      <UTable :columns="columns" :rows="items" :loading="pending">
        <template #flag-cell="{ row }">
          <UToggle :model-value="row.original.flag === 1" @update:model-value="onToggleStatus(row.original)" />
        </template>

        <template #actions-cell="{ row }">
          <div class="flex items-center gap-2">
            <UButton color="neutral" variant="ghost" icon="i-lucide-edit" @click="onEdit(row.original)" />
            <UButton color="error" variant="ghost" icon="i-lucide-trash" @click="onDelete(row.original._id)" />
          </div>
        </template>
      </UTable>
    </UCard>

    <UModal v-model="isOpen">
      <UCard>
        <template #header>
          <div class="flex items-center justify-between">
            <h3 class="text-base font-semibold leading-6 text-gray-900 dark:text-white">
              {{ isEdit ? $t('common.edit') : $t('common.create') }}
            </h3>
            <UButton color="neutral" variant="ghost" icon="i-lucide-x" class="-my-1" @click="isOpen = false" />
          </div>
        </template>

        <UForm :schema="schema" :state="state" class="space-y-4" @submit="onSubmit">
          <UFormField :label="$t('form.title')" name="title" required>
            <UInput v-model="state.title" />
          </UFormField>

          <UFormField :label="$t('form.key')" name="key" required>
            <UInput v-model="state.key" :disabled="isEdit" />
          </UFormField>

          <UFormField label="Client ID / App ID" name="clientID">
            <UInput v-model="state.clientID" />
          </UFormField>

          <div class="grid grid-cols-1 gap-4">
            <UFormField label="Client Secret" name="credentials.clientSecret">
              <UInput v-model="state.credentials.clientSecret" type="password" />
            </UFormField>
            <UFormField label="API Key" name="credentials.apiKey">
              <UInput v-model="state.credentials.apiKey" type="password" />
            </UFormField>
            <UFormField label="Secret Key" name="credentials.secretKey">
              <UInput v-model="state.credentials.secretKey" type="password" />
            </UFormField>
          </div>

          <UFormField :label="$t('form.status')" name="flag">
            <UToggle v-model="state.flag" :true-value="1" :false-value="0" />
          </UFormField>

          <div class="flex justify-end gap-2">
            <UButton color="neutral" variant="ghost" @click="isOpen = false">
              {{ $t('common.cancel') }}
            </UButton>
            <UButton type="submit">
              {{ $t('form.save') }}
            </UButton>
          </div>
        </UForm>
      </UCard>
    </UModal>
  </div>
</template>
