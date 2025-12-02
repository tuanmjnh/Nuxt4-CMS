<script setup lang="ts">
interface Props {
  file: Cloudinary.IFileAttach
  errorText?: string
  nameLabel?: string
  formatLabel?: string
  sizeLabel?: string
  createdLabel?: string
  naText?: string
}

const props = withDefaults(defineProps<Props>(), {
  errorText: 'Cannot load image. Please check URL or network connection.',
  nameLabel: 'Name:',
  formatLabel: 'Format:',
  sizeLabel: 'Size:',
  createdLabel: 'Created:',
  naText: 'N/A'
})

const emit = defineEmits<{ (e: 'close'): void }>()

const imageLoaded = ref(false)
const imageError = ref(false)

const handleImageLoad = () => {
  imageLoaded.value = true
}

const handleImageError = () => {
  imageError.value = true
  imageLoaded.value = true
}

const formattedFileSize = computed(() => {
  if (props.file && props.file.bytes) {
    const kb = props.file.bytes / 1024
    if (kb < 1024) {
      return `${kb.toFixed(1)} KB`
    } else {
      const mb = kb / 1024
      return `${mb.toFixed(1)} MB`
    }
  }
  return props.naText
})

const formattedCreationDate = computed(() => {
  if (props.file && props.file.created_at) {
    const date = new Date(props.file.created_at)
    if (!isNaN(date.getTime())) {
      return date.toLocaleString()
    }
  }
  return props.naText
})
</script>

<template>
  <UModal :model-value="true" :ui="{ content: 'w-full sm:max-w-3xl' }" @close="$emit('close')">
    <div
      class="relative bg-white dark:bg-gray-900 rounded-lg overflow-hidden shadow-xl border border-gray-200 dark:border-gray-700">
      <button
        class="absolute top-2 right-2 rounded-md flex items-center justify-center text-lg py-1 text-gray-500 dark:text-gray-400 hover:text-red-500 dark:hover:text-red-400 transition-colors w-[28px] z-10"
        @click="$emit('close')">
        <UIcon name="i-lucide-x" class="w-5 h-5" />
      </button>

      <div
        class="relative max-h-[70vh] flex items-center justify-center mx-auto overflow-hidden bg-gray-100 dark:bg-gray-800">
        <div v-if="!imageLoaded"
          class="w-full h-[50vh] animate-pulse flex items-center justify-center text-gray-400 text-sm">
          <UIcon name="i-lucide-image" class="w-12 h-12" />
        </div>

        <img :src="file.url || file.thumbnail_url" :alt="file.public_id"
          class="object-contain max-h-[70vh] w-auto transition-opacity duration-300"
          :class="{ 'opacity-0 absolute inset-0': !imageLoaded }" loading="lazy" @load="handleImageLoad"
          @error="handleImageError" />

        <div v-if="imageError"
          class="absolute inset-0 bg-red-100/80 dark:bg-red-900/80 flex items-center justify-center p-4">
          <p class="text-sm text-red-700 dark:text-red-300 font-semibold text-center">
            {{ errorText }}
          </p>
        </div>
      </div>

      <div class="p-4 text-sm text-gray-700 dark:text-gray-300 space-y-1 border-t border-gray-200 dark:border-gray-700">
        <div class="grid grid-cols-2 gap-4">
          <div><strong class="dark:text-gray-100">{{ nameLabel }}</strong> {{ file.public_id || naText }}</div>
          <div><strong class="dark:text-gray-100">{{ formatLabel }}</strong> {{ file.format || naText }}</div>
          <div><strong class="dark:text-gray-100">{{ sizeLabel }}</strong> {{ formattedFileSize }}</div>
          <div><strong class="dark:text-gray-100">{{ createdLabel }}</strong> {{ formattedCreationDate }}</div>
        </div>
      </div>
    </div>
  </UModal>
</template>
