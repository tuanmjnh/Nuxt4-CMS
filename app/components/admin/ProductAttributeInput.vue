<script setup lang="ts">
interface ProductAttribute {
  name: string
  options: string[]
  visible: boolean
  variation: boolean
}

const props = withDefaults(defineProps<{
  modelValue: ProductAttribute[]
  nameLabel?: string
  namePlaceholder?: string
  optionsLabel?: string
  optionsPlaceholder?: string
  optionsSearchPlaceholder?: string
  optionsCreateLabel?: string
  optionsEmptyLabel?: string
  addLabel?: string
  visibleLabel?: string
  variationLabel?: string
}>(), {
  nameLabel: 'Name',
  namePlaceholder: 'Attribute Name (e.g. Color)',
  optionsLabel: 'Options',
  optionsPlaceholder: 'Select or create options...',
  optionsSearchPlaceholder: 'Search options...',
  optionsCreateLabel: 'Add option',
  optionsEmptyLabel: 'Select options',
  addLabel: 'Add Attribute',
  visibleLabel: 'Visible on product page',
  variationLabel: 'Used for variations'
})

const emit = defineEmits(['update:modelValue'])

const attributes = computed({
  get: () => props.modelValue || [],
  set: (val) => emit('update:modelValue', val)
})

const add = () => {
  emit('update:modelValue', [...attributes.value, {
    name: '',
    options: [],
    visible: true,
    variation: false
  }])
}

const remove = (index: number) => {
  const newAttrs = [...attributes.value]
  newAttrs.splice(index, 1)
  emit('update:modelValue', newAttrs)
}

// Cache for available attributes
const availableAttributes = ref<any[]>([])

const { data } = await useFetch<any>('/api/products/attributes')
if (data.value) {
  // api/products/attributes returns array directly based on index.get.ts
  availableAttributes.value = Array.isArray(data.value) ? data.value : []
}

const searchNames = async (q: string) => {
  if (!q) return availableAttributes.value.map(a => a.name)
  return availableAttributes.value
    .filter(a => a.name.toLowerCase().includes(q.toLowerCase()))
    .map(a => a.name)
}

const searchValues = async (name: string, q: string) => {
  const attr = availableAttributes.value.find(a => a.name === name)
  const values = attr?.values || []
  if (!q) return values
  return values.filter((v: string) => v.toLowerCase().includes(q.toLowerCase()))
}
</script>

<template>
  <div class="space-y-4">
    <div v-for="(attr, index) in attributes" :key="index"
      class="p-4 border border-gray-200 dark:border-gray-700 rounded-lg space-y-4">
      <div class="flex items-start gap-4">
        <div class="flex-1">
          <UFormField :label="nameLabel || $t('attributes.name_label')">
            <UInputMenu v-model="attr.name" :search="searchNames"
              :placeholder="namePlaceholder || $t('attributes.name_placeholder')" creatable />
          </UFormField>
        </div>
        <UButton icon="i-lucide-trash" color="error" variant="ghost" class="mt-6" @click="remove(index)" />
      </div>

      <UFormField :label="optionsLabel || $t('attributes.options_label')">
        <USelectMenu v-model="attr.options" :searchable="(q: any) => searchValues(attr.name, q)"
          :placeholder="optionsPlaceholder || $t('attributes.options_placeholder')" multiple creatable
          :searchable-placeholder="optionsSearchPlaceholder || $t('attributes.options_search_placeholder')">
          <template #['label']>
            <span v-if="attr.options.length" class="truncate">{{ attr.options.join(', ') }}</span>
            <span v-else class="text-gray-400">{{ optionsEmptyLabel || $t('attributes.options_empty_label') }}</span>
          </template>
          <template #['option-create']="{ option }">
            <span class="shrink-0">{{ optionsCreateLabel || $t('attributes.options_create_label') }}: </span>
            <span class="block truncate">{{ option.label }}</span>
          </template>
        </USelectMenu>
      </UFormField>

      <div class="flex gap-6">
        <UCheckbox v-model="attr.visible" :label="visibleLabel || $t('attributes.visible_label')" />
        <UCheckbox v-model="attr.variation" :label="variationLabel || $t('attributes.variation_label')" />
      </div>
    </div>

    <UButton icon="i-lucide-plus" :label="addLabel || $t('attributes.add_button')" variant="soft" @click="add" />
  </div>
</template>