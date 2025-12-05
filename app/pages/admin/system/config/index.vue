<script setup lang="ts">
import type { FormSubmitEvent } from '@nuxt/ui'
import * as z from 'zod'

definePageMeta({
  layout: 'admin',
  middleware: 'admin'
})

const toast = useToast()
const { token } = useAuth()
const { data: configs, refresh } = await useAPI<any>('/api/system/config')

const columns = computed(() => [
  { accessorKey: 'key', header: 'Key' },
  { accessorKey: 'value', header: 'Value' },
  { accessorKey: 'type', header: 'Type' },
  { accessorKey: 'isPublic', header: 'Public' },
  { accessorKey: 'actions', header: 'Actions', meta: { class: { th: 'w-26' } } }
])

const isOpen = ref(false)
const isEditing = ref(false)
const editingId = ref('')

const schema = z.object({
  key: z.string().min(1, 'Key is required'),
  value: z.any(),
  type: z.enum(['string', 'number', 'boolean', 'json']),
  isPublic: z.boolean().default(false),
  description: z.string().optional()
})

type Schema = z.output<typeof schema>

const state = reactive<Partial<Schema>>({
  key: undefined,
  value: undefined,
  type: 'string',
  isPublic: false,
  description: undefined
})

const resetForm = () => {
  state.key = undefined
  state.value = undefined
  state.type = 'string'
  state.isPublic = false
  state.description = undefined
  isEditing.value = false
  editingId.value = ''
}

const onEdit = (row: any) => {
  state.key = row.key
  state.value = row.value
  state.type = row.type
  state.isPublic = row.isPublic
  state.description = row.description
  editingId.value = row._id
  isEditing.value = true
  isOpen.value = true
}

const onSubmit = async (event: FormSubmitEvent<Schema>) => {
  try {
    let payloadValue = event.data.value

    // Handle number conversion
    if (event.data.type === 'number') {
      payloadValue = Number(payloadValue)
    }

    // Handle JSON parsing
    if (event.data.type === 'json' && typeof payloadValue === 'string') {
      try {
        payloadValue = JSON.parse(payloadValue)
      } catch (e) {
        toast.add({ title: 'Invalid JSON', color: 'error' })
        return
      }
    }

    await $fetch('/api/system/config', {
      method: 'POST',
      headers: { Authorization: `Bearer ${token.value}` },
      body: { ...event.data, value: payloadValue }
    })

    toast.add({ title: isEditing.value ? 'Config updated' : 'Config created' })
    isOpen.value = false
    refresh()
    resetForm()
  } catch (error: any) {
    toast.add({ title: 'Error', description: error.message, color: 'error' })
  }
}

const items = computed(() => configs.value?.data || [])
</script>

<template>
  <div>
    <UCard>
      <template #header>
        <div class="flex items-center justify-between">
          <h2 class="font-bold text-lg">System Configurations</h2>
          <UButton icon="i-lucide-plus" @click="isOpen = true">Add Config</UButton>
        </div>
      </template>

      <UTable :columns="columns" :rows="items">
        <template #value-cell="{ row }">
          <span v-if="row.original?.type === 'boolean'">
            <UBadge :color="row.original?.value ? 'success' : 'neutral'" variant="subtle">{{ row.original?.value }}
            </UBadge>
          </span>
          <span v-else-if="row.original?.type === 'json'" class="font-mono text-xs text-gray-500">
            {{ JSON.stringify(row.original?.value).substring(0, 50) }}
            {{ JSON.stringify(row.original?.value).length > 50 ? '...' : '' }}
          </span>
          <span v-else>{{ row.original?.value }}</span>
        </template>

        <template #isPublic-cell="{ row }">
          <UIcon :name="row.original?.isPublic ? 'i-lucide-check' : 'i-lucide-x'"
            :class="row.original?.isPublic ? 'text-green-500' : 'text-gray-400'" />
        </template>

        <template #actions-cell="{ row }">
          <UButton icon="i-lucide-edit" color="neutral" variant="ghost" @click="onEdit(row)" />
        </template>
      </UTable>
    </UCard>

    <UModal v-model:open="isOpen" :title="isEditing ? 'Edit Config' : 'Add Config'">
      <template #body>
        <UForm :schema="schema" :state="state" class="space-y-4" @submit="onSubmit">
          <UFormField label="Key" name="key">
            <UInput v-model="state.key" :disabled="isEditing" placeholder="e.g. site_name" />
          </UFormField>

          <UFormField label="Type" name="type">
            <USelectMenu v-model="state.type" :options="['string', 'number', 'boolean', 'json']" />
          </UFormField>

          <UFormField label="Value" name="value">
            <UInput v-if="state.type === 'string'" v-model="state.value" />
            <UInput v-else-if="state.type === 'number'" v-model="state.value" type="number" />
            <div v-else-if="state.type === 'boolean'" class="flex items-center h-8">
              <UCheckbox v-model="state.value" :label="state.value ? 'True' : 'False'" />
            </div>
            <UTextarea v-else-if="state.type === 'json'"
              :model-value="typeof state.value === 'object' ? JSON.stringify(state.value, null, 2) : state.value"
              @update:model-value="val => state.value = val" :rows="5" class="font-mono" />
          </UFormField>

          <UFormField label="Description" name="description">
            <UTextarea v-model="state.description" />
          </UFormField>

          <UFormField name="isPublic">
            <UCheckbox v-model="state.isPublic" label="Public (Exposed to client)" />
          </UFormField>

          <div class="flex justify-end gap-2 pt-4">
            <UButton color="neutral" variant="ghost" @click="isOpen = false">Cancel</UButton>
            <UButton type="submit">Save</UButton>
          </div>
        </UForm>
      </template>
    </UModal>
  </div>
</template>
