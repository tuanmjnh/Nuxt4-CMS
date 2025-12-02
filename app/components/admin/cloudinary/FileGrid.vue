<script setup lang="ts">
import { ref } from 'vue'
// import FilePreview from './FilePreview.vue'

interface Props {
  files: Cloudinary.IResource[]
  selectedFiles: Cloudinary.IResource[]
  multiple?: boolean
  emptyText?: string
  previewText?: string
  renameText?: string
  deleteText?: string
  renameModalTitle?: string
  renameInputPlaceholder?: string
  cancelButtonText?: string
  renameButtonText?: string
}

const props = withDefaults(defineProps<Props>(), {
  emptyText: 'No files in this folder',
  previewText: 'Preview',
  renameText: 'Rename',
  deleteText: 'Delete',
  renameModalTitle: 'Rename File',
  renameInputPlaceholder: 'Enter new file name',
  cancelButtonText: 'Cancel',
  renameButtonText: 'Rename'
})

const emit = defineEmits<{
  (e: 'select', file: Cloudinary.IResource): void
  (e: 'delete', file: Cloudinary.IResource): void
  (e: 'rename', file: Cloudinary.IResource, newName: string): void
}>()

const previewFile = ref<Cloudinary.IResource | null>(null)
const renamingFile = ref<Cloudinary.IResource | null>(null)
const newFileName = ref()

const isSelected = (file: Cloudinary.IResource) => {
  return props.selectedFiles.some(f => f.public_id === file.public_id)
}

const handleSelect = (file: Cloudinary.IResource) => {
  emit('select', file)
}

const handlePreview = (file: Cloudinary.IResource) => {
  previewFile.value = file
}

const startRename = (file: Cloudinary.IResource) => {
  renamingFile.value = file
  const parts = file.public_id.split('/')
  newFileName.value = parts[parts.length - 1]
}

const confirmRename = () => {
  if (renamingFile.value && newFileName.value.trim()) {
    emit('rename', renamingFile.value, newFileName.value.trim())
    renamingFile.value = null
    newFileName.value = ''
  }
}

const cancelRename = () => {
  renamingFile.value = null
  newFileName.value = ''
}

const formatFileSize = (bytes: number) => {
  if (bytes < 1024) return bytes + ' B'
  if (bytes < 1024 * 1024) return (bytes / 1024).toFixed(1) + ' KB'
  return (bytes / (1024 * 1024)).toFixed(1) + ' MB'
}

const getFileIcon = (file: Cloudinary.IResource) => {
  if (file.resource_type === 'image') return '🖼️'
  if (file.resource_type === 'video') return '🎥'
  return '📄'
}
</script>

<template>
  <div class="file-grid">
    <div v-if="files.length === 0" class="text-center py-12 text-gray-500">
      <svg class="w-16 h-16 mx-auto mb-4 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2"
          d="M7 21h10a2 2 0 002-2V9.414a1 1 0 00-.293-.707l-5.414-5.414A1 1 0 0012.586 3H7a2 2 0 00-2 2v14a2 2 0 002 2z" />
      </svg>
      <p>{{ emptyText }}</p>
    </div>

    <div v-else class="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-4">
      <div v-for="file in files" :key="file.public_id" :class="[
        'group relative border-2 rounded-lg overflow-hidden cursor-pointer transition',
        isSelected(file) ? 'border-blue-500 ring-2 ring-blue-200' : 'border-gray-200 dark:border-gray-700 hover:border-blue-300'
      ]" @click="handleSelect(file)">
        <!-- File Preview -->
        <div class="aspect-square bg-gray-100 dark:bg-gray-800 flex items-center justify-center overflow-hidden">
          <img v-if="file.resource_type === 'image'" :src="file.secure_url || file.url" :alt="file.public_id"
            class="w-full h-full object-cover" loading="lazy" />
          <div v-else class="text-4xl">
            {{ getFileIcon(file) }}
          </div>
        </div>

        <!-- File Info -->
        <div class="p-2 bg-white dark:bg-gray-900">
          <p class="text-sm font-medium truncate text-gray-900 dark:text-white">
            {{ file.display_name || file.public_id.split('/').pop() }}
          </p>
          <p class="text-xs text-gray-500">
            {{ formatFileSize(file.bytes) }}
          </p>
        </div>

        <!-- Action Overlay -->
        <div
          class="absolute inset-0 bg-black/50 opacity-0 group-hover:opacity-100 transition flex items-center justify-center gap-2">
          <button class="p-2 bg-white rounded-full hover:bg-gray-100 transition" :title="previewText"
            @click.stop="handlePreview(file)">
            <svg class="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2"
                d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2"
                d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
            </svg>
          </button>

          <button class="p-2 bg-white rounded-full hover:bg-gray-100 transition" :title="renameText"
            @click.stop="startRename(file)">
            <svg class="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2"
                d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
            </svg>
          </button>

          <button class="p-2 bg-red-500 text-white rounded-full hover:bg-red-600 transition" :title="deleteText"
            @click.stop="$emit('delete', file)">
            <svg class="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2"
                d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
            </svg>
          </button>
        </div>

        <!-- Selection Indicator -->
        <div v-if="isSelected(file)"
          class="absolute top-2 right-2 w-6 h-6 bg-blue-500 rounded-full flex items-center justify-center">
          <svg class="w-4 h-4 text-white" fill="currentColor" viewBox="0 0 20 20">
            <path fill-rule="evenodd"
              d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z"
              clip-rule="evenodd" />
          </svg>
        </div>
      </div>
    </div>

    <!-- File Preview Modal -->
    <admin-cloudinary-file-preview v-if="previewFile" :file="previewFile" @close="previewFile = null" />

    <!-- Rename Modal -->
    <UModal :model-value="!!renamingFile" @close="cancelRename">
      <UCard>
        <template #header>
          <div class="flex justify-between items-center">
            <h3 class="text-lg font-bold">{{ renameModalTitle }}</h3>
            <UButton color="neutral" variant="ghost" icon="i-lucide-x" @click="cancelRename" />
          </div>
        </template>

        <UInput v-model="newFileName" type="text" :placeholder="renameInputPlaceholder" autofocus
          @keyup.enter="confirmRename" />

        <template #footer>
          <div class="flex gap-2 justify-end">
            <UButton color="neutral" variant="ghost" @click="cancelRename">
              {{ cancelButtonText }}
            </UButton>
            <UButton color="primary" @click="confirmRename">
              {{ renameButtonText }}
            </UButton>
          </div>
        </template>
      </UCard>
    </UModal>
  </div>
</template>
