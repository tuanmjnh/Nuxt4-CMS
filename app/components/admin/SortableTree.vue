<script setup lang="ts">
import Sortable from 'sortablejs'

// Generic Tree Item Type
export interface TreeItem {
  _id: string
  name: string
  // Optional specific fields, can be extended
  path?: string
  icon?: string
  isVisible?: boolean
  children?: TreeItem[]
  sort: number
  parent?: string | null
  [key: string]: any
}

const props = defineProps<{
  items: TreeItem[]
  // Function to save order - promise based
  onSave?: (items: TreeItem[]) => Promise<void>
  // Function to edit item
  onEdit?: (item: TreeItem) => void
  // Function to toggle visibility
  onToggle?: (item: TreeItem) => void
  // Translation prefix for item name, e.g. 'route' -> $t('route.name')
  labelPrefix?: string
}>()

const toast = useToast()
const treeContainer = ref<HTMLElement>()
const isMounted = ref(false)

// Flatten helper for creating the sortable list
function flatten(
  items: TreeItem[],
  parent = items,
  level = 0
): { item: TreeItem; parent: TreeItem[]; index: number; level: number }[] {
  return items.flatMap((item, index) => [
    { item, parent, index, level },
    ...(item.children?.length ? flatten(item.children, item.children, level + 1) : [])
  ])
}

// Compute flat list for rendering
const flatItems = computed(() => flatten(props.items))

// Init Sortable
const initSortable = () => {
  if (!treeContainer.value || !isMounted.value) return

  // Destroy old instance if exists
  if ((treeContainer.value as any)._sortable) {
    (treeContainer.value as any)._sortable.destroy()
  }

  Sortable.create(treeContainer.value, {
    animation: 150,
    ghostClass: 'opacity-50',
    handle: '.drag-handle',
    onEnd: (evt) => {
      const { oldIndex, newIndex } = evt
      if (oldIndex === newIndex || oldIndex == null || newIndex == null) return

      // Logic to find source and target in the original data structure
      // utilizing the computed flat list.
      // Note: flatItems.value corresponds to the DOM order *before* the drag.

      const flat = flatItems.value
      const sourceInfo = flat[oldIndex]
      const targetInfo = flat[newIndex]

      if (!sourceInfo || !targetInfo) return

      const sourceNode = sourceInfo
      const targetNode = targetInfo

      // Validation: Only allow moving within same parent
      // We compare parent array references
      if (sourceNode.parent !== targetNode.parent) {
        toast.add({
          title: 'Action blocked',
          description: 'Moving content between different levels is currently restricted',
          color: 'error'
        })
        // Force re-render to revert DOM
        // We emit an event or call a method to force parent update? 
        // Actually since we mutate props directly in JS, we need to be careful.
        // But here we haven't mutated successfully yet.
        // We just need to trigger a re-render of the list.
        // Since props.items is reactive, maybe the parent needs to handle 'refresh'.
        // For now, we manually revert by re-init or key change.
        // A simple way is to destroy and re-create - handled by watcher.
        // But changing the key of the list or triggering a deep update is better.

        // Emitting an 'error' event so parent can refresh data
        // emit('error', 'invalid_move') 
        return
      }

      // Mutate the array
      // Remove from old position
      const [moved] = sourceNode.parent.splice(sourceNode.index, 1)

      if (!moved) return

      // Calculate new index
      // If we move down, the target index acts as expected (insert after?) 
      // No, splice insert at index puts it BEFORE.
      // If we are moving down: Source was 0, Target is 2. (0 -> 1 -> 2)
      // Remove 0. Target is now at index 1.
      // We want to insert AFTER target (which was at visual index 2, now 1).
      // So insert at target.indexInParent + 1 ?

      // Let's rely on the relative movement in the flat list.
      // Since they are in the same parent, their relative order in 'parent' array determines their relative order in 'flat' list.

      const targetIndexInParent = sourceNode.parent.indexOf(targetNode.item)
      // If target not found (shouldn't happen), fallback
      if (targetIndexInParent === -1) return

      let insertIndex = targetIndexInParent

      // Logic: If we dragged DOWN (old < new), we usually want to place it AFTER the target.
      // But SortableJS logic is "insert at this position".
      // If oldIndex < newIndex, we are dragging source "past" the target.
      if (oldIndex < newIndex) {
        insertIndex = targetIndexInParent + 1
      }

      sourceNode.parent.splice(insertIndex, 0, moved)

      // Trigger save
      if (props.onSave) {
        props.onSave(props.items)
      }
    }
  })

    ; (treeContainer.value as any)._sortable = true
}

// Watch data changes
watch(() => props.items, () => {
  nextTick(() => {
    initSortable()
  })
}, { deep: true })

onMounted(() => {
  isMounted.value = true
  nextTick(initSortable)
})

</script>

<template>
  <div ref="treeContainer" class="space-y-1">
    <div v-for="node in flatItems" :key="node.item._id" :data-id="node.item._id"
      class="flex items-center justify-between p-3 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors select-none group"
      :style="{ marginLeft: `${node.level * 24}px` }">
      <!-- Content -->
      <div class="flex items-center gap-3 flex-1 overflow-hidden">
        <UIcon name="i-lucide-grip-vertical"
          class="drag-handle text-gray-400 flex-shrink-0 cursor-grab active:cursor-grabbing opacity-0 group-hover:opacity-100 transition-opacity" />

        <div class="flex flex-col truncate">
          <span class="font-medium truncate">
            {{ labelPrefix ? $t(`${labelPrefix}.${node.item.name}`) : node.item.label || node.item.name }}
          </span>
          <span v-if="node.item.path" class="text-xs text-gray-500 truncate">{{ node.item.path }}</span>
        </div>
      </div>

      <!-- Actions -->
      <div class="flex items-center gap-2 flex-shrink-0 opacity-0 group-hover:opacity-100 transition-opacity">
        <slot name="actions" :item="node.item">
          <UBadge v-if="node.item.isVisible === false && onToggle" color="neutral" size="xs">
            {{ $t('common.hidden') }}
          </UBadge>

          <UButton v-if="onEdit" icon="i-lucide-edit" size="xs" variant="ghost" @click.stop="onEdit(node.item)" />

          <UButton v-if="onToggle" :icon="node.item.isVisible !== false ? 'i-lucide-eye' : 'i-lucide-eye-off'"
            :color="node.item.isVisible !== false ? 'neutral' : 'warning'" size="xs" variant="ghost"
            @click.stop="onToggle(node.item)" />
        </slot>
      </div>
    </div>
  </div>
</template>
