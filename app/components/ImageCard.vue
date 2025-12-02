<script setup lang="ts">
import { ref, computed } from 'vue'
// import FilePreview from './FilePreview.vue'

const props = withDefaults(
  defineProps<{
    file: Cloudinary.IFileAttach | null
    isShowSelected?: boolean
    isSelected: boolean
    size?: string | number
    fit?: 'cover' | 'contain'
    uploadSelectText?: string
    uploadNewFile?: string
  }>(),
  {
    fit: 'cover',
    uploadSelectText: 'Select or Drag and Drop files',
    uploadNewFile: 'Upload new file'
  }
)

const emit = defineEmits<{
  (e: 'upload'): void
  (e: 'preview', file: Cloudinary.IFileAttach): void
  (e: 'edit', file: Cloudinary.IFileAttach): void
  (e: 'delete', file: Cloudinary.IFileAttach): void
  (e: 'toggle', file: Cloudinary.IFileAttach): void
}>()

const isFilePreview = ref(false)
const selectedFile = ref<Cloudinary.IFileAttach | null>(null)

const imageError = ref(false)
const imageLoaded = ref(false)

const handleImageError = () => {
  imageError.value = true
  imageLoaded.value = true
}

const handleImageLoad = () => {
  imageLoaded.value = true
}

const imageUrl = computed(() => {
  if (!props.file || imageError.value) {
    return 'https://via.placeholder.com/160x120?text=File+Error'
  }
  return props.file.thumbnail_url || props.file.url
})

const isNoFile = computed(() => !props.file)

const cardSize = computed(() => {
  const val = props.size

  if (!val) return { width: '160px', height: '120px', full: false }

  if (val === 'full') {
    return { width: '100%', height: 'auto', full: true }
  }

  if (val === 'auto') {
    return { width: 'auto', height: 'auto', full: false }
  }

  if (!isNaN(Number(val))) {
    const px = val + 'px'
    return { width: px, height: px, full: false }
  }

  if (typeof val === 'string' && val.includes('x')) {
    const [w, h] = val.split('x')
    return { width: w + 'px', height: h + 'px', full: false }
  }

  return { width: '160px', height: '120px', full: false }
})

const onPreview = (file: Cloudinary.IFileAttach) => {
  selectedFile.value = file
  isFilePreview.value = true
  emit('preview', file)
}

const handleCardClick = (file: Cloudinary.IFileAttach | null) => {
  if (!props.file) emit('upload')
  else if (file) emit('toggle', file)
}

const DEFAULT_CARD_CLASSES =
  'relative border border-gray-200 dark:border-gray-700 rounded-xl overflow-hidden group transition-transform duration-200 bg-white dark:bg-gray-800'
</script>

<template>
  <div
    :class="[DEFAULT_CARD_CLASSES, !isNoFile ? 'hover:shadow-lg cursor-pointer' : 'border-dashed border-2 cursor-pointer hover:border-indigo-500']"
    :style="{ width: cardSize.width, height: cardSize.height }" @click="handleCardClick(file)">
    <!-- No File -->
    <div v-if="isNoFile" class="w-full h-full flex flex-col items-center justify-center text-gray-400 p-4"
      @click="$emit('upload')">
      <svg class="w-10 h-10 mb-2 text-indigo-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2"
          d="M7 16a4 4 0 01-.885-3.324L6 12a4 4 0 018-2 4 4 0 011.615 6.676M15 17h4a2 2 0 002-2v-4a2 2 0 00-2-2h-3">
        </path>
      </svg>
      <p class="text-sm font-medium text-indigo-600 dark:text-indigo-400">
        {{ uploadSelectText }}
      </p>
      <p class="text-xs">{{ uploadNewFile }}</p>
    </div>

    <!-- With File -->
    <div v-else class="relative w-full h-full">
      <!-- Loading Skeleton -->
      <div v-if="!imageLoaded" class="flex items-center justify-center bg-gray-200 dark:bg-gray-700 animate-pulse"
        :style="{ width: '100%', height: cardSize.height }">
        <svg class="w-8 h-8 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2"
            d="M4 16l4.586-4.586a2 2 0 012.828 0L14 14m0 0l-1.586-1.586a2 2 0 00-2.828 0L7 16m0 0l-1.586-1.586a2 2 0 00-2.828 0L2 14v4a2 2 0 002 2h16a2 2 0 002-2v-4a2 2 0 00-2-2h-3m-6 3h.01M16 11H8">
          </path>
        </svg>
      </div>

      <!-- Image -->
      <img :src="imageUrl" :alt="file?.public_id || 'Media File'" :class="[
        'rounded-t-lg transition-opacity duration-300',
        fit === 'contain' ? 'object-contain' : 'object-cover',
        { 'opacity-0 absolute inset-0': !imageLoaded }
      ]" :style="{ width: cardSize.width, height: cardSize.full ? 'auto' : cardSize.height }" loading="lazy"
        @load="handleImageLoad" @error="handleImageError" />

      <!-- Action Overlay -->
      <div
        class="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition flex items-center justify-center gap-3">
        <slot name="actions" :file="file">
          <!-- Select -->
          <button v-if="isShowSelected" class="p-1 rounded-full transition" :class="[
            isSelected
              ? 'bg-indigo-500 text-white hover:bg-indigo-600'
              : 'bg-white text-indigo-600 hover:bg-indigo-100'
          ]" :title="isSelected ? 'Uncheck' : 'Select file'" @click.stop="$emit('toggle', file!)">
            <svg v-if="isSelected" class="w-4 h-4" stroke="currentColor" fill="none" viewBox="0 0 24 24">
              <path
                d="M9 12L11 14L15 10M12 2C6.49 2 2 6.49 2 12C2 17.51 6.49 22 12 22C17.51 22 22 17.51 22 12C22 6.49 17.51 2 12 2Z"
                stroke-width="2" stroke-linecap="round" stroke-linejoin="round" />
            </svg>
            <svg v-else class="w-4 h-4" stroke="currentColor" fill="none" viewBox="0 0 24 24">
              <path d="M12 2C6.49 2 2 6.49 2 12C2 17.51 6.49 22 12 22C17.51 22 22 17.51 22 12C22 6.49 17.51 2 12 2Z"
                stroke-width="2" stroke-linecap="round" stroke-linejoin="round" />
            </svg>
          </button>

          <!-- Preview -->
          <button class="p-1 rounded-full bg-indigo-500 text-white hover:bg-indigo-600 transition" title="Preview file"
            @click.stop="onPreview(file!)">
            <svg xmlns="http://www.w3.org/2000/svg" fill="none" stroke="currentColor" viewBox="0 0 24 24"
              class="w-4 h-4">
              <path stroke-linecap="round" stroke-linejoin="round"
                d="M2.036 12.322a1.012 1.012 0 0 1 0-.639C3.423 7.51 7.36 4.5 12 4.5c4.638 0 8.573 3.007 9.963 7.178.07.207.07.431 0 .639C20.577 16.49 16.64 19.5 12 19.5c-4.638 0-8.573-3.007-9.963-7.178Z" />
              <path stroke-linecap="round" stroke-linejoin="round" d="M15 12a3 3 0 1 1-6 0 3 3 0 0 1 6 0Z" />
            </svg>
          </button>

          <!-- Edit -->
          <button
            class="p-1 rounded-full text-gray-700 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-700 transition"
            title="Edit file" @click.stop="$emit('edit', file!)">
            <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path
                d="M12 20H21M16.5 3.5L19.5 6.5M17.8 5.2L7.6 15.4C7.3 15.7 7.1 16.1 7 16.5L6 20L9.5 19C9.9 18.9 10.3 18.7 10.6 18.4L20.8 8.2C21.1 7.9 21.3 7.5 21.3 7.1C21.3 6.7 21.1 6.3 20.8 6L17.8 3C17.5 2.7 17.1 2.5 16.7 2.5C16.3 2.5 15.9 2.7 15.6 3L12 6.5"
                stroke-width="2" stroke-linecap="round" stroke-linejoin="round" />
            </svg>
          </button>

          <!-- Delete -->
          <button
            class="p-1 rounded-full text-red-600 dark:text-red-400 hover:bg-red-100 dark:hover:bg-red-900/70 transition"
            title="Delete file" @click.stop="$emit('delete', file!)">
            <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path
                d="M10 12V17M14 12V17M21 5H3M6 5L7.73171 18.6655C7.8436 19.5051 7.90045 19.9249 8.16398 20.245C8.40375 20.5353 8.7699 20.7061 9.15579 20.7303C9.57143 20.7565 10.0984 20.7686 11.1523 20.7686H12.8477C13.9016 20.7686 14.4286 20.7565 14.8442 20.7303C15.2301 20.7061 15.5962 20.5353 15.836 20.245C16.0995 19.9249 16.1564 19.5051 16.2683 18.6655L18 5M16 5V4C16 2.89543 15.1046 2 14 2H10C8.89543 2 8 2.89543 8 4V5"
                stroke-width="2" stroke-linecap="round" stroke-linejoin="round" />
            </svg>
          </button>
        </slot>
      </div>
    </div>
  </div>

  <!-- Preview Popup -->
  <admin-cloudinary-file-preview v-if="isFilePreview && selectedFile" :file="selectedFile"
    @close="isFilePreview = false" />
</template>
