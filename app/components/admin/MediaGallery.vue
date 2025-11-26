<script setup lang="ts">
import { ref, computed } from 'vue'
// import ImageCard from './cloudinary/ImageCard.vue'
// import ConfirmModal from '../ConfirmModal.vue'

type FileResource = Cloudinary.IResource

const props = withDefaults(
  defineProps<{
    modelValue: FileResource[] | FileResource | null
    class?: string
    multiple?: boolean
    deleteTitle?: string
    deleteMessage?: string
    confirmText?: string
    cancelText?: string
    size?: string | number
    uploadSelectText?: string
    uploadNewFile?: string
    columns?: number
    folder?: string
  }>(),
  {
    deleteTitle: 'Confirm Delete',
    deleteMessage: 'Are you sure you want to delete this file?',
    confirmText: 'Delete',
    cancelText: 'Cancel',
    uploadSelectText: 'Select or Drag and Drop files',
    uploadNewFile: 'Upload new file',
    columns: 4,
    folder: 'nuxt4-cms'
  }
)

const emit = defineEmits<{
  (e: 'update:modelValue', value: any): void//FileResource[] | FileResource | null): void
  (e: 'selected', files: FileResource[]): void
  (e: 'preview', file: FileResource): void
  (e: 'edit', file: FileResource): void
  (e: 'delete', file: FileResource): void
}>()

const { uploadToCloudinary } = useCloudinary()
const toast = useToast()

const showCloudinaryManager = ref(false)
const isConfirmDelete = ref(false)
const selectedFile = ref<FileResource | null>(null)
const selectedIndex = ref<number | null>(null)
const selectedFiles = ref<FileResource[]>([])
const uploading = ref(false)
const fileInputRef = ref<HTMLInputElement | null>(null)
const showUploadMenu = ref(false)

const isSelected = (file: FileResource): boolean => {
  if (!file) return false
  return selectedFiles.value.some(s => s.public_id === file.public_id)
}

const handleToggleFile = (file: FileResource) => {
  const exists = isSelected(file)

  if (props.multiple) {
    if (exists) {
      selectedFiles.value = selectedFiles.value.filter(f => f.public_id !== file.public_id)
    } else {
      selectedFiles.value.push(file)
    }
  } else {
    selectedFiles.value = [file]
  }

  emit('selected', selectedFiles.value)
}

const isNoFile = computed(() => {
  return !props.modelValue || (Array.isArray(props.modelValue) && props.modelValue.length === 0)
})

function mergeByKey<T extends Record<string, any>>(base: T[], updates: T[], key: keyof T): T[] {
  const map = new Map(base.map(item => [item[key], { ...item }]))
  for (const item of updates) {
    const k = item[key]
    if (map.has(k)) {
      map.set(k, { ...map.get(k), ...item })
    } else {
      map.set(k, item)
    }
  }
  return Array.from(map.values())
}

const onEditFile = (file: FileResource) => {
  selectedFile.value = file
  showCloudinaryManager.value = true
  emit('edit', file)
}

const onOpenConfirmDelete = (file: FileResource, index: number) => {
  selectedFile.value = file
  selectedIndex.value = index
  isConfirmDelete.value = true
}

const onConfirmDelete = () => {
  if (props.multiple && Array.isArray(props.modelValue)) {
    const clone = [...props.modelValue]
    if (selectedIndex.value !== null && selectedIndex.value > -1) {
      clone.splice(selectedIndex.value, 1)
    }
    emit('update:modelValue', clone)
  } else {
    emit('update:modelValue', null)
  }

  if (selectedFile.value) {
    emit('delete', selectedFile.value)
  }
  isConfirmDelete.value = false
}

const handleFileSelect = async (event: Event) => {
  const input = event.target as HTMLInputElement
  const files = input.files

  if (!files || files.length === 0) return

  uploading.value = true
  showUploadMenu.value = false

  try {
    const uploadedFiles: FileResource[] = []

    for (const file of Array.from(files)) {
      const result = await uploadToCloudinary(file, props.folder)

      uploadedFiles.push({
        public_id: result.public_id,
        url: result.url,
        secure_url: result.secure_url,
        resource_type: result.resource_type as 'image' | 'video' | 'raw',
        format: result.format,
        bytes: result.bytes,
        created_at: new Date().toISOString(),
        width: result.width,
        height: result.height,
        type: 'upload'
      })
    }

    if (uploadedFiles.length > 0) {
      if (props.multiple) {
        const base = Array.isArray(props.modelValue) ? [...props.modelValue] : []
        const merged = mergeByKey(base, uploadedFiles, 'public_id')
        emit('update:modelValue', merged)
      } else {
        emit('update:modelValue', uploadedFiles[0])
      }

      toast?.add({
        title: 'Upload successful',
        description: `${uploadedFiles.length} file(s) uploaded`,
        color: 'success'
      })
    }
  } catch (error: any) {
    console.error('Upload failed:', error)
    toast?.add({
      title: 'Upload failed',
      description: error.message || 'Please try again',
      color: 'error'
    })
  } finally {
    uploading.value = false
    if (input) input.value = ''
  }
}

const openDirectUpload = () => {
  showUploadMenu.value = false
  fileInputRef.value?.click()
}

const openCloudinaryManager = () => {
  showUploadMenu.value = false
  showCloudinaryManager.value = true
}

const handleCloudinaryManagerSelect = (files: FileResource[]) => {
  if (files && files.length > 0) {
    if (props.multiple) {
      const newItems = files.map(f => ({
        public_id: f.public_id,
        url: f.url || f.secure_url,
        secure_url: f.secure_url || f.url,
        resource_type: f.resource_type,
        format: f.format,
        bytes: f.bytes,
        created_at: f.created_at,
        width: f.width,
        height: f.height,
        type: f.type
      }))

      const base = Array.isArray(props.modelValue) ? [...props.modelValue] : []
      const merged = mergeByKey(base, newItems, 'public_id')

      emit('update:modelValue', merged)
    } else {
      const single = files[0]
      if (!single) return
      const result = {
        public_id: single.public_id,
        url: single.url || single.secure_url,
        secure_url: single.secure_url || single.url,
        resource_type: single.resource_type,
        format: single.format,
        bytes: single.bytes,
        created_at: single.created_at,
        width: single.width,
        height: single.height,
        type: single.type
      }

      emit('update:modelValue', result)
    }
  }

  showCloudinaryManager.value = false
}

const gridClass = computed(() => {
  return `grid gap-3 grid-cols-${props.columns}`
})
</script>

<template>
  <!-- Hidden file input -->
  <input ref="fileInputRef" type="file" class="hidden" :multiple="multiple" accept="image/*,video/*"
    @change="handleFileSelect" />

  <!-- No file – show upload options -->
  <div v-if="isNoFile" :class="class">
    <div class="relative">
      <button
        class="w-full aspect-video border-2 border-dashed border-gray-300 dark:border-gray-600 rounded-lg hover:border-blue-500 dark:hover:border-blue-400 transition flex flex-col items-center justify-center gap-3 bg-gray-50 dark:bg-gray-800/50"
        @click="showUploadMenu = !showUploadMenu">
        <svg class="w-12 h-12 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2"
            d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12" />
        </svg>
        <div class="text-center">
          <p class="text-sm font-medium text-gray-700 dark:text-gray-300">{{ uploadSelectText }}</p>
          <p class="text-xs text-gray-500 dark:text-gray-400 mt-1">Click to choose upload method</p>
        </div>
      </button>

      <!-- Upload Options Menu -->
      <div v-if="showUploadMenu"
        class="absolute top-full left-0 mt-2 w-full bg-white dark:bg-gray-800 rounded-lg shadow-lg border border-gray-200 dark:border-gray-700 overflow-hidden z-10">
        <button
          class="w-full px-4 py-3 text-left hover:bg-gray-50 dark:hover:bg-gray-700 transition flex items-center gap-3"
          @click="openDirectUpload">
          <svg class="w-5 h-5 text-blue-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2"
              d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12" />
          </svg>
          <div>
            <p class="font-medium text-gray-900 dark:text-white">Upload from Computer</p>
            <p class="text-xs text-gray-500 dark:text-gray-400">Choose files from your device</p>
          </div>
        </button>

        <button
          class="w-full px-4 py-3 text-left hover:bg-gray-50 dark:hover:bg-gray-700 transition flex items-center gap-3 border-t border-gray-200 dark:border-gray-700"
          @click="openCloudinaryManager">
          <svg class="w-5 h-5 text-green-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2"
              d="M3 7v10a2 2 0 002 2h14a2 2 0 002-2V9a2 2 0 00-2-2h-6l-2-2H5a2 2 0 00-2 2z" />
          </svg>
          <div>
            <p class="font-medium text-gray-900 dark:text-white">Browse Media Library</p>
            <p class="text-xs text-gray-500 dark:text-gray-400">Select from existing files or upload</p>
          </div>
        </button>
      </div>
    </div>
  </div>

  <!-- File list -->
  <div v-else :class="class">
    <div v-if="multiple" :class="gridClass">
      <image-card v-for="(f, i) in (modelValue as FileResource[])" :key="f.public_id" :file="f" :size="size"
        :is-show-selected="multiple" :is-selected="isSelected(f)" :upload-select-text="uploadSelectText"
        :upload-new-file="uploadNewFile" @toggle="handleToggleFile" @preview="emit('preview', f)" @edit="onEditFile(f)"
        @delete="onOpenConfirmDelete(f, i)" />
    </div>

    <!-- Single file -->
    <image-card v-else :file="modelValue as FileResource" :size="size" :is-show-selected="false"
      :is-selected="isSelected(modelValue as FileResource)" :upload-select-text="uploadSelectText"
      :upload-new-file="uploadNewFile" @toggle="handleToggleFile" @preview="emit('preview', modelValue as FileResource)"
      @edit="onEditFile(modelValue as FileResource)" @delete="onOpenConfirmDelete(modelValue as FileResource, 0)" />
  </div>

  <!-- Cloudinary Manager Modal -->
  <ClientOnly>
    <admin-cloudinary-manager v-if="showCloudinaryManager" mode="modal" :multiple="multiple" :delete-title="deleteTitle"
      :confirm-text="confirmText" :cancel-text="cancelText" :delete-message="deleteMessage"
      @close="showCloudinaryManager = false" @selected-files="handleCloudinaryManagerSelect" />
  </ClientOnly>

  <!-- Confirm delete dialog -->
  <confirm-modal :visible="isConfirmDelete" :title="deleteTitle" :confirm-text="confirmText" :cancel-text="cancelText"
    @confirm="onConfirmDelete" @cancel="isConfirmDelete = false">
    <template #default>
      <div class="text-center">
        <p>{{ deleteMessage }}</p>
        <span class="font-semibold text-red-500">
          {{ selectedFile?.public_id }}
        </span>
      </div>
    </template>
  </confirm-modal>

  <!-- Upload loading overlay -->
  <div v-if="uploading" class="fixed inset-0 bg-black/50 flex items-center justify-center z-9999">
    <div class="bg-white dark:bg-gray-800 rounded-lg p-6 shadow-xl">
      <div class="flex flex-col items-center gap-4">
        <svg class="w-12 h-12 animate-spin text-blue-600" fill="none" viewBox="0 0 24 24">
          <circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4"></circle>
          <path class="opacity-75" fill="currentColor"
            d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z">
          </path>
        </svg>
        <p class="text-gray-700 dark:text-gray-300 font-medium">Uploading...</p>
      </div>
    </div>
  </div>

  <!-- Click outside to close menu -->
  <div v-if="showUploadMenu" class="fixed inset-0 z-5" @click="showUploadMenu = false" />
</template>
