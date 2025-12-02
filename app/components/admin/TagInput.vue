<script setup lang="ts">
const props = withDefaults(defineProps<{
  modelValue: string[]
  placeholder?: string
  searchPlaceholder?: string
  createLabel?: string
  emptyLabel?: string
}>(), {
  placeholder: 'Select or create tags...',
  searchPlaceholder: 'Search tags...',
  createLabel: 'Create tag',
  emptyLabel: 'Select tags'
})

const emit = defineEmits(['update:modelValue'])

const selected = computed({
  get: () => props.modelValue || [],
  set: (val) => emit('update:modelValue', val)
})

const searchTags = async (query: string) => {
  try {
    const { data } = await useFetch<any>('/api/tags', {
      query: { search: query }
    })
    // Assuming API returns { data: { tags: [...] } } based on index.get.ts
    // Wait, index.get.ts returns { success: true, data: { tags: [...] } }
    // So data.value.data.tags is the array
    const tags = data.value?.data?.tags || []
    return tags.map((t: any) => t.name)
  } catch (e) {
    return []
  }
}
</script>

<template>
  <USelectMenu v-model="selected" :searchable="searchTags" :placeholder="placeholder || $t('tags.select_placeholder')"
    multiple creatable :searchable-placeholder="searchPlaceholder || $t('tags.search_placeholder')" class="w-full">
    <template #item-label="{ item, index }">
      <span v-if="selected.length" class="truncate">{{ selected.join(', ') }}</span>
      <span v-else class="text-gray-400">{{ emptyLabel || $t('tags.select_label') }}</span>
    </template>

    <template #['option-create']="{ option }">
      <span class="shrink-0">{{ createLabel || $t('tags.create_label') }}: </span>
      <span class="block truncate">{{ option.label }}</span>
    </template>
  </USelectMenu>
</template>