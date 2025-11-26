<template>
  <div>
    <div class="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-6 gap-4">
      <div v-for="item in media" :key="item._id"
        class="group relative aspect-square bg-gray-100 dark:bg-gray-800 rounded-lg overflow-hidden border hover:border-primary-500 cursor-pointer"
        :class="{ 'ring-2 ring-primary-500': selectedIds.includes(item._id) }" @click="toggleSelection(item)">
        <img :src="item.thumbnailUrl || item.url" :alt="item.altText" class="w-full h-full object-cover" />

        <!-- Overlay -->
        <div
          class="absolute inset-0 bg-black/50 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center gap-2">
          <UButton icon="i-lucide-trash" color="error" variant="solid" size="xs" @click.stop="emit('delete', item)" />
        </div>
      </div>
    </div>

    <!-- Pagination -->
    <div v-if="pagination && pagination.totalPages > 1" class="flex justify-center mt-6">
      <UPagination v-model="page" :total="pagination.total" :page-count="pagination.limit" />
    </div>
  </div>
</template>

<script setup lang="ts">
const props = defineProps<{
  media: any[]
  pagination?: any
  selected?: any[]
  multiple?: boolean
}>()

const emit = defineEmits(['update:selected', 'delete', 'page-change'])

const page = computed({
  get: () => props.pagination?.page || 1,
  set: (value) => emit('page-change', value)
})

const selectedIds = computed(() => props.selected?.map(m => m._id) || [])

const toggleSelection = (item: any) => {
  if (props.multiple) {
    const newSelected = [...(props.selected || [])]
    const index = newSelected.findIndex(m => m._id === item._id)

    if (index === -1) {
      newSelected.push(item)
    } else {
      newSelected.splice(index, 1)
    }
    emit('update:selected', newSelected)
  } else {
    emit('update:selected', [item])
  }
}
</script>
