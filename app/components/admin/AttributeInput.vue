<script setup lang="ts">
const props = withDefaults(defineProps<{
  modelValue: { name: string; value: string }[]
  namePlaceholder?: string
  valuePlaceholder?: string
  addButtonLabel?: string
}>(), {
  namePlaceholder: 'Attribute Name',
  valuePlaceholder: 'Value',
  addButtonLabel: 'Add Attribute'
})

const emit = defineEmits(['update:modelValue'])

const attributes = computed({
  get: () => props.modelValue || [],
  set: (val) => emit('update:modelValue', val)
})

const add = () => {
  emit('update:modelValue', [...attributes.value, { name: '', value: '' }])
}

const remove = (index: number) => {
  const newAttrs = [...attributes.value]
  newAttrs.splice(index, 1)
  emit('update:modelValue', newAttrs)
}

// Cache for available attributes
const availableAttributes = ref<any[]>([])

const { data } = await useFetch<any>('/api/posts/attributes')
if (data.value) {
  // api/posts/attributes returns { success: true, data: [...] }
  availableAttributes.value = data.value.data || []
}

const searchNames = async (q: string) => {
  if (!q) return availableAttributes.value.map(a => a.name)
  return availableAttributes.value
    .filter(a => a.name.toLowerCase().includes(q.toLowerCase()))
    .map(a => a.name)
}

const searchValues = async (name: string, q: string) => {
  const attr = availableAttributes.value.find(a => a.name === name)
  if (!attr || !attr.values) return []
  if (!q) return attr.values
  return attr.values.filter((v: string) => v.toLowerCase().includes(q.toLowerCase()))
}
</script>

<template>
  <div class="space-y-4">
    <div v-for="(attr, index) in attributes" :key="index" class="flex gap-4 items-start">
      <div class="flex-1">
        <UInputMenu v-model="attr.name" :search="searchNames"
          :placeholder="namePlaceholder || $t('attributes.name_placeholder')" creatable />
      </div>
      <div class="flex-1">
        <UInputMenu v-model="attr.value" :search="(q: any) => searchValues(attr.name, q)"
          :placeholder="valuePlaceholder || $t('attributes.value_placeholder')" creatable />
      </div>
      <UButton icon="i-lucide-trash" color="error" variant="ghost" @click="remove(index)" />
    </div>

    <UButton icon="i-lucide-plus" :label="addButtonLabel || $t('attributes.add_button')" variant="soft" size="sm"
      @click="add" />
  </div>
</template>