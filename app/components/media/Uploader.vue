<template>
  <div class="space-y-4">
    <div
      class="border-2 border-dashed border-gray-300 dark:border-gray-700 rounded-lg p-8 text-center hover:border-primary-500 transition-colors cursor-pointer"
      :class="{ 'border-primary-500 bg-primary-50 dark:bg-primary-900/10': isDragging }"
      @dragover.prevent="isDragging = true" @dragleave.prevent="isDragging = false" @drop.prevent="handleDrop"
      @click="triggerFileInput">
      <input ref="fileInput" type="file" class="hidden" multiple accept="image/*" @change="handleFileSelect" />

      <div v-if="uploading" class="space-y-2">
        <UIcon name="i-lucide-loader" class="text-4xl animate-spin text-primary-500 mx-auto" />
        <p>{{ $t('uploading') }}</p>
      </div>

      <div v-else>
        <UIcon name="i-lucide-upload-cloud" class="text-4xl text-gray-400 mx-auto mb-2" />
        <p class="font-medium">{{ $t('upload_instruction') }}</p>
        <p class="text-sm text-gray-500">{{ $t('upload_formats') }}</p>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
const emit = defineEmits(['upload-success', 'upload-error'])
const { uploadMedia } = useMedia()

const fileInput = ref<HTMLInputElement | null>(null)
const isDragging = ref(false)
const uploading = ref(false)

const triggerFileInput = () => {
  fileInput.value?.click()
}

const handleFileSelect = (event: Event) => {
  const input = event.target as HTMLInputElement
  if (input.files) {
    uploadFiles(Array.from(input.files))
  }
}

const handleDrop = (event: DragEvent) => {
  isDragging.value = false
  if (event.dataTransfer?.files) {
    uploadFiles(Array.from(event.dataTransfer.files))
  }
}

const uploadFiles = async (files: File[]) => {
  uploading.value = true

  try {
    const results = []
    for (const file of files) {
      const { data } = await uploadMedia(file)
      results.push(data.media)
    }
    emit('upload-success', results)
  } catch (error: any) {
    emit('upload-error', error)
  } finally {
    uploading.value = false
    if (fileInput.value) {
      fileInput.value.value = ''
    }
  }
}
</script>
