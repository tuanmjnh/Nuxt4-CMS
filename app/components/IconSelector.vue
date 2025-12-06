<script setup lang="ts">
import { ref, computed, watch } from 'vue'

const props = defineProps<{
  modelValue?: string
  placeholder?: string
  title?: string
}>()

const emit = defineEmits(['update:modelValue', 'select'])

const searchQuery = ref('')
const selectedIcon = ref(props.modelValue || '')
const selectedCollection = ref('lucide')
const page = ref(1)
const perPage = 100

const collections = [
  { label: 'Lucide', value: 'lucide' },
  { label: 'Simple Icons', value: 'simpleIcons' }
]

const { data: iconData, status } = await useFetch('/api/icons', {
  lazy: true,
  transform: (data: any): { lucide: string[], simpleIcons: string[] } => {
    return {
      lucide: (data.lucide as string[]) || [],
      simpleIcons: (data.simpleIcons as string[]) || []
    }
  }
})

const currentIcons = computed(() => {
  if (!iconData.value) return []
  return iconData.value[selectedCollection.value as keyof typeof iconData.value] || []
})

const filteredIcons = computed(() => {
  let icons = currentIcons.value

  if (searchQuery.value) {
    const query = searchQuery.value.toLowerCase()
    icons = icons.filter((icon: string) => icon.toLowerCase().includes(query))
  }

  return icons
})

const displayedIcons = computed(() => {
  return filteredIcons.value.slice(0, page.value * perPage)
})

const hasMore = computed(() => {
  return displayedIcons.value.length < filteredIcons.value.length
})

const loadMore = () => {
  page.value++
}

const selectIcon = (icon: string) => {
  selectedIcon.value = icon
  emit('update:modelValue', icon)
  emit('select', icon)
}

const previewIcon = computed(() => {
  return searchQuery.value && searchQuery.value.startsWith('i-') ? searchQuery.value : selectedIcon.value
})

watch(searchQuery, () => {
  page.value = 1
})

watch(selectedCollection, () => {
  page.value = 1
})
</script>

<template>
  <div class="flex flex-col gap-4">
    <div class="flex gap-2">
      <UButton v-for="collection in collections" :key="collection.value" :label="collection.label" size="xs"
        :color="selectedCollection === collection.value ? 'primary' : 'neutral'" variant="soft"
        @click="selectedCollection = collection.value" />
    </div>

    <UInput v-model="searchQuery" :placeholder="placeholder || $t('icon_selector.search_placeholder')"
      icon="i-lucide-search" autofocus>
      <template #trailing>
        <UIcon v-if="previewIcon" :name="previewIcon" class="w-5 h-5 text-gray-500" />
      </template>
    </UInput>

    <div class="border rounded-md dark:border-gray-700 bg-gray-50 dark:bg-gray-800/50">
      <div v-if="status === 'pending'" class="p-4 text-center text-gray-500">
        <UIcon name="i-lucide-loader-2" class="w-6 h-6 animate-spin mx-auto mb-2" />
        {{ $t('common.loading') }}...
      </div>

      <div v-else-if="filteredIcons.length === 0" class="p-4 text-center text-gray-500 text-sm">
        {{ $t('icon_selector.no_icons') }}
      </div>

      <div v-else>
        <div class="grid grid-cols-6 sm:grid-cols-8 gap-2 max-h-60 overflow-y-auto p-2"
          @scroll="(e) => { const target = e.target as HTMLElement; if (target.scrollHeight - target.scrollTop <= target.clientHeight + 50 && hasMore) loadMore() }">
          <UTooltip v-for="icon in displayedIcons" :key="icon" :text="icon">
            <button type="button"
              class="flex items-center justify-center p-2 rounded-md hover:bg-white dark:hover:bg-gray-700 transition-colors w-full aspect-square"
              :class="{ 'bg-primary-50 text-primary-600 dark:bg-primary-950/50 dark:text-primary-400 ring-2 ring-primary-500': selectedIcon === icon }"
              @click="selectIcon(icon)">
              <UIcon :name="icon" class="w-6 h-6" />
            </button>
          </UTooltip>

          <div v-if="hasMore" class="col-span-full py-2 flex justify-center">
            <UButton variant="ghost" size="xs" :label="$t('common.load_more')" @click="loadMore" />
          </div>
        </div>
      </div>
    </div>

    <div class="text-xs text-gray-500 text-right">
      {{ filteredIcons.length }} icons found
    </div>
  </div>
</template>
