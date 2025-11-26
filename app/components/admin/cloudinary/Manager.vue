<script setup lang="ts">
import { ref, computed, onMounted } from 'vue'
// import FolderTree from './FolderTree.vue'
// import FileGrid from './FileGrid.vue'
// import CloudUpload from './CloudUpload.vue'
// import ConfirmModal from './ConfirmModal.vue'
// import LoadingSpinner from './LoadingSpinner.vue'

interface Props {
  mode?: 'modal' | 'page'
  multiple?: boolean
  deleteTitle?: string
  deleteMessage?: string
  confirmText?: string
  cancelText?: string
  renameTitle?: string
  renameText?: string
}

const props = withDefaults(defineProps<Props>(), {
  mode: 'page',
  multiple: false,
  deleteTitle: 'Confirm Delete',
  deleteMessage: 'Are you sure you want to delete this item?',
  confirmText: 'Delete',
  cancelText: 'Cancel',
  renameTitle: 'Rename',
  renameText: 'Enter new name'
})

const emit = defineEmits<{
  (e: 'close'): void
  (e: 'selected-files', files: Cloudinary.IResource[]): void
}>()

const { token } = useAuth()
const toast = useToast()

// State
const loading = ref(false)
const currentFolder = ref<string>('root')
const folders = ref<Cloudinary.IFolder[]>([])
const files = ref<Cloudinary.IResource[]>([])
const selectedFiles = ref<Cloudinary.IResource[]>([])
const searchQuery = ref('')
const showUpload = ref(false)
const showConfirmDelete = ref(false)
const itemToDelete = ref<any>(null)
const deleteType = ref<'file' | 'folder'>('file')

// Computed
const filteredFiles = computed(() => {
  if (!searchQuery.value) return files.value
  const query = searchQuery.value.toLowerCase()
  return files.value.filter(f =>
    f.public_id.toLowerCase().includes(query) ||
    (f.display_name && f.display_name.toLowerCase().includes(query))
  )
})

const isModal = computed(() => props.mode === 'modal')

// Methods
const loadFolders = async (folder: string = 'root') => {
  try {
    loading.value = true
    const response = await $fetch<Cloudinary.IResponseFolders>('/api/cloudinary/folders', {
      params: { folder },
      headers: { Authorization: `Bearer ${token.value}` }
    })

    if (folder === 'root') {
      folders.value = response.folders
    }

    return response.folders
  } catch (error: any) {
    toast?.add({
      title: 'Error loading folders',
      description: error.message,
      color: 'error'
    })
    return []
  } finally {
    loading.value = false
  }
}

const loadFiles = async (folder: string = 'root') => {
  try {
    loading.value = true
    const response = await $fetch<Cloudinary.IResponseAsset>('/api/cloudinary/files', {
      params: { folder, max_results: 100 },
      headers: { Authorization: `Bearer ${token.value}` }
    })

    files.value = response.resources || []
  } catch (error: any) {
    toast?.add({
      title: 'Error loading files',
      description: error.message,
      color: 'error'
    })
    files.value = []
  } finally {
    loading.value = false
  }
}

const handleFolderSelect = async (folder: Cloudinary.IFolder) => {
  currentFolder.value = folder.path
  await loadFiles(folder.path)
}

const handleFileSelect = (file: Cloudinary.IResource) => {
  if (props.multiple) {
    const index = selectedFiles.value.findIndex(f => f.public_id === file.public_id)
    if (index > -1) {
      selectedFiles.value.splice(index, 1)
    } else {
      selectedFiles.value.push(file)
    }
  } else {
    selectedFiles.value = [file]
  }
}

const handleCreateFolder = async (name: string) => {
  try {
    loading.value = true
    await $fetch('/api/cloudinary/folders', {
      method: 'POST',
      body: { name: `${currentFolder.value === 'root' ? '' : currentFolder.value + '/'}${name}` },
      headers: { Authorization: `Bearer ${token.value}` }
    })

    toast?.add({
      title: 'Folder created',
      description: `Folder "${name}" created successfully`,
      color: 'success'
    })

    await loadFolders(currentFolder.value)
  } catch (error: any) {
    toast?.add({
      title: 'Error creating folder',
      description: error.message,
      color: 'error'
    })
  } finally {
    loading.value = false
  }
}

const handleDeleteFile = (file: Cloudinary.IResource) => {
  itemToDelete.value = file
  deleteType.value = 'file'
  showConfirmDelete.value = true
}

const handleDeleteFolder = (folder: Cloudinary.IFolder) => {
  itemToDelete.value = folder
  deleteType.value = 'folder'
  showConfirmDelete.value = true
}

const confirmDelete = async () => {
  try {
    loading.value = true

    if (deleteType.value === 'file') {
      const publicId = encodeURIComponent(itemToDelete.value.public_id)
      await $fetch(`/api/cloudinary/files/${publicId}`, {
        method: 'DELETE',
        headers: { Authorization: `Bearer ${token.value}` }
      })

      await loadFiles(currentFolder.value)
      toast?.add({
        title: 'File deleted',
        color: 'success'
      })
    } else {
      await $fetch(`/api/cloudinary/folders/${encodeURIComponent(itemToDelete.value.path)}`, {
        method: 'DELETE',
        headers: { Authorization: `Bearer ${token.value}` }
      })

      await loadFolders(currentFolder.value)
      toast?.add({
        title: 'Folder deleted',
        color: 'success'
      })
    }
  } catch (error: any) {
    toast?.add({
      title: 'Error deleting',
      description: error.message,
      color: 'error'
    })
  } finally {
    loading.value = false
    showConfirmDelete.value = false
    itemToDelete.value = null
  }
}

const handleRenameFile = async (file: Cloudinary.IResource, newName: string) => {
  try {
    loading.value = true

    const pathParts = file.public_id.split('/')
    pathParts[pathParts.length - 1] = newName
    const newPublicId = pathParts.join('/')

    await $fetch('/api/cloudinary/files/rename', {
      method: 'PUT',
      body: { from: file.public_id, to: newPublicId },
      headers: { Authorization: `Bearer ${token.value}` }
    })

    await loadFiles(currentFolder.value)
    toast?.add({
      title: 'File renamed',
      color: 'success'
    })
  } catch (error: any) {
    toast?.add({
      title: 'Error renaming file',
      description: error.message,
      color: 'error'
    })
  } finally {
    loading.value = false
  }
}

const handleUploadComplete = async () => {
  showUpload.value = false
  await loadFiles(currentFolder.value)
}

const handleConfirmSelection = () => {
  emit('selected-files', selectedFiles.value)
  if (isModal.value) {
    emit('close')
  }
}

// Lifecycle
onMounted(async () => {
  await loadFolders()
  await loadFiles()
})
</script>

<template>
  <div :class="[
    'cloudinary-manager',
    isModal ? 'fixed inset-0 z-9999 bg-black/50 flex items-center justify-center p-4' : ''
  ]">
    <div :class="[
      'bg-white dark:bg-gray-900 rounded-lg shadow-xl',
      isModal ? 'w-full max-w-6xl max-h-[90vh] flex flex-col' : 'h-full flex flex-col'
    ]">
      <!-- Header -->
      <div class="flex items-center justify-between p-4 border-b border-gray-200 dark:border-gray-700">
        <div class="flex items-center gap-4 flex-1">
          <h2 class="text-xl font-bold text-gray-900 dark:text-white">
            Cloudinary Manager
          </h2>

          <!-- Search -->
          <div class="flex-1 max-w-md">
            <input v-model="searchQuery" type="text" placeholder="Search files..."
              class="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-800 text-gray-900 dark:text-white" />
          </div>
        </div>

        <div class="flex items-center gap-2">
          <!-- Upload Button -->
          <button class="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg transition"
            @click="showUpload = true">
            Upload
          </button>

          <!-- Select Button (Modal mode) -->
          <button v-if="isModal && selectedFiles.length > 0"
            class="px-4 py-2 bg-green-600 hover:bg-green-700 text-white rounded-lg transition"
            @click="handleConfirmSelection">
            Select ({{ selectedFiles.length }})
          </button>

          <!-- Close Button (Modal mode) -->
          <button v-if="isModal" class="p-2 hover:bg-gray-100 dark:hover:bg-gray-800 rounded-lg transition"
            @click="$emit('close')">
            <svg class="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>
      </div>

      <!-- Main Content -->
      <div class="flex flex-1 overflow-hidden">
        <!-- Sidebar - Folder Tree -->
        <div class="w-64 border-r border-gray-200 dark:border-gray-700 overflow-y-auto">
          <admin-cloudinary-folder-tree :folders="folders" :current-folder="currentFolder" @select="handleFolderSelect"
            @create="handleCreateFolder" @delete="handleDeleteFolder" @load-children="loadFolders" />
        </div>

        <!-- File Grid -->
        <div class="flex-1 overflow-y-auto p-4">
          <admin-cloudinary-file-grid :files="filteredFiles" :selected-files="selectedFiles" :multiple="multiple"
            @select="handleFileSelect" @delete="handleDeleteFile" @rename="handleRenameFile" />
        </div>
      </div>

      <!-- Footer (Modal mode) -->
      <div v-if="isModal" class="p-4 border-t border-gray-200 dark:border-gray-700 flex justify-between items-center">
        <div class="text-sm text-gray-600 dark:text-gray-400">
          {{ selectedFiles.length }} file(s) selected
        </div>
        <div class="flex gap-2">
          <button
            class="px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-800 transition"
            @click="$emit('close')">
            {{ cancelText }}
          </button>
          <button v-if="selectedFiles.length > 0"
            class="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg transition"
            @click="handleConfirmSelection">
            {{ confirmText }}
          </button>
        </div>
      </div>
    </div>

    <!-- Upload Modal -->
    <admin-cloudinary-cloud-upload v-if="showUpload" :folder="currentFolder" @close="showUpload = false"
      @complete="handleUploadComplete" />

    <!-- Confirm Delete Modal -->
    <confirm-modal :visible="showConfirmDelete" :title="deleteTitle" :message="deleteMessage"
      :confirm-text="confirmText" :cancel-text="cancelText" @confirm="confirmDelete"
      @cancel="showConfirmDelete = false" />

    <!-- Loading Spinner -->
    <loading-spinner :visible="loading" />
  </div>
</template>

<style scoped>
.cloudinary-manager {
  font-family: Inter, sans-serif;
}
</style>
