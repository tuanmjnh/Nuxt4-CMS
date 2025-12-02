<script setup lang="ts">
interface Props {
  folder: string
  title?: string
  dropText?: string
  descriptionText?: string
  browseText?: string
  uploadingText?: string
  uploadText?: string
  cancelText?: string
  selectedFilesText?: string
  successTitle?: string
  successDescription?: string
  errorTitle?: string
}

const props = withDefaults(defineProps<Props>(), {
  title: 'Upload Files',
  dropText: 'Drop files here or click to browse',
  descriptionText: 'Upload images, videos, or other files',
  browseText: 'Browse Files',
  uploadingText: 'Uploading...',
  uploadText: 'Upload',
  cancelText: 'Cancel',
  selectedFilesText: 'file(s) selected',
  successTitle: 'Upload complete',
  successDescription: 'file(s) uploaded successfully',
  errorTitle: 'Upload failed'
})

const emit = defineEmits<{
  (e: 'close'): void
  (e: 'complete'): void
}>()

const { uploadToCloudinary } = useCloudinary()
const toast = useToast()

const files = ref<File[]>([])
const uploading = ref(false)
const uploadProgress = ref<Record<string, number>>({})
const dragOver = ref(false)

const handleFileSelect = (event: Event) => {
  const input = event.target as HTMLInputElement
  if (input.files) {
    files.value = [...files.value, ...Array.from(input.files)]
  }
}

const handleDrop = (event: DragEvent) => {
  dragOver.value = false
  if (event.dataTransfer?.files) {
    files.value = [...files.value, ...Array.from(event.dataTransfer.files)]
  }
}

const removeFile = (index: number) => {
  files.value.splice(index, 1)
}

const uploadFiles = async () => {
  if (files.value.length === 0) return

  uploading.value = true

  try {
    for (const file of files.value) {
      uploadProgress.value[file.name] = 0

      await uploadToCloudinary(file, props.folder, (progress) => {
        uploadProgress.value[file.name] = progress
      })
    }

    toast?.add({
      title: props.successTitle,
      description: `${files.value.length} ${props.successDescription}`,
      color: 'success'
    })

    emit('complete')
    emit('close')
  } catch (error: any) {
    toast?.add({
      title: props.errorTitle,
      description: error.message,
      color: 'error'
    })
  } finally {
    uploading.value = false
    uploadProgress.value = {}
  }
}

const formatFileSize = (bytes: number) => {
  if (bytes < 1024) return bytes + ' B'
  if (bytes < 1024 * 1024) return (bytes / 1024).toFixed(1) + ' KB'
  return (bytes / (1024 * 1024)).toFixed(1) + ' MB'
}
</script>

<template>
  <div class="fixed inset-0 z-9999 bg-black/50 flex items-center justify-center p-4">
    <div class="bg-white dark:bg-gray-900 rounded-lg shadow-xl w-full max-w-2xl">
      <!-- Header -->
      <div class="flex items-center justify-between p-6 border-b border-gray-200 dark:border-gray-700">
        <h3 class="text-xl font-bold">{{ title }}</h3>
        <button class="p-2 hover:bg-gray-100 dark:hover:bg-gray-800 rounded-lg transition" @click="$emit('close')">
          <svg class="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12" />
          </svg>
        </button>
      </div>

      <!-- Content -->
      <div class="p-6">
        <!-- Drop Zone -->
        <div :class="[
          'border-2 border-dashed rounded-lg p-8 text-center transition',
          dragOver ? 'border-blue-500 bg-blue-50 dark:bg-blue-900/20' : 'border-gray-300 dark:border-gray-600'
        ]" @dragover.prevent="dragOver = true" @dragleave.prevent="dragOver = false" @drop.prevent="handleDrop">
          <svg class="w-16 h-16 mx-auto mb-4 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2"
              d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12" />
          </svg>
          <p class="text-lg font-medium mb-2">{{ dropText }}</p>
          <p class="text-sm text-gray-500 mb-4">{{ descriptionText }}</p>
          <input type="file" multiple class="hidden" id="file-input" @change="handleFileSelect" />
          <label for="file-input"
            class="inline-block px-6 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg cursor-pointer transition">
            {{ browseText }}
          </label>
        </div>

        <!-- File List -->
        <div v-if="files.length > 0" class="mt-6 space-y-2">
          <div v-for="(file, index) in files" :key="index"
            class="flex items-center gap-4 p-3 border border-gray-200 dark:border-gray-700 rounded-lg">
            <div class="flex-1 min-w-0">
              <p class="font-medium truncate">{{ file.name }}</p>
              <p class="text-sm text-gray-500">{{ formatFileSize(file.size) }}</p>

              <!-- Progress Bar -->
              <div v-if="uploading && uploadProgress[file.name] !== undefined" class="mt-2">
                <div class="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-2">
                  <div class="bg-blue-600 h-2 rounded-full transition-all"
                    :style="{ width: uploadProgress[file.name] + '%' }" />
                </div>
                <p class="text-xs text-gray-500 mt-1">{{ uploadProgress[file.name] }}%</p>
              </div>
            </div>

            <button v-if="!uploading"
              class="p-2 text-red-600 hover:bg-red-50 dark:hover:bg-red-900/20 rounded-lg transition"
              @click="removeFile(index)">
              <svg class="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2"
                  d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
              </svg>
            </button>
          </div>
        </div>
      </div>

      <!-- Footer -->
      <div class="flex items-center justify-between p-6 border-t border-gray-200 dark:border-gray-700">
        <p class="text-sm text-gray-600 dark:text-gray-400">
          {{ files.length }} {{ selectedFilesText }}
        </p>
        <div class="flex gap-2">
          <button
            class="px-6 py-2 border border-gray-300 dark:border-gray-600 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-800 transition"
            :disabled="uploading" @click="$emit('close')">
            {{ cancelText }}
          </button>
          <button
            class="px-6 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg transition disabled:opacity-50 disabled:cursor-not-allowed"
            :disabled="files.length === 0 || uploading" @click="uploadFiles">
            {{ uploading ? uploadingText : uploadText }}
          </button>
        </div>
      </div>
    </div>
  </div>
</template>
