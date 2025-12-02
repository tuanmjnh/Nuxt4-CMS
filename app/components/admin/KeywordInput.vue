<script setup lang="ts">
const props = withDefaults(defineProps<{
  modelValue: string[]
  placeholder?: string
  searchPlaceholder?: string
  createLabel?: string
  emptyLabel?: string
}>(), {
  placeholder: 'Select or create keywords...',
  searchPlaceholder: 'Search keywords...',
  createLabel: 'Add keyword',
  emptyLabel: 'Select keywords'
})

const emit = defineEmits(['update:modelValue'])

const selected = computed({
  get: () => props.modelValue || [],
  set: (val) => emit('update:modelValue', val)
})

const { data } = await useFetch<any>('/api/keywords')
const availableKeywords = computed(() => data.value?.data || [])

const searchKeywords = async (q: string) => {
  if (!q) return availableKeywords.value
  return availableKeywords.value.filter((k: string) => k.toLowerCase().includes(q.toLowerCase()))
}
</script>

<template>
  <USelectMenu v-model="selected" :searchable="searchKeywords"
    :placeholder="placeholder || $t('keywords.select_placeholder')" multiple creatable
    :searchable-placeholder="searchPlaceholder || $t('keywords.search_placeholder')" class="w-full">
    <template #['label']>
      <span v-if="selected.length" class="truncate">{{ selected.join(', ') }}</span>
      <span v-else class="text-gray-400">{{ emptyLabel || $t('keywords.select_label') }}</span>
    </template>

    <template #['option-create']="{ option }">
      <span class="shrink-0">{{ createLabel || $t('keywords.create_label') }}: </span>
      <span class="block truncate">{{ option.label }}</span>
    </template>
  </USelectMenu>
</template>