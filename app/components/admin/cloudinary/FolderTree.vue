<script setup lang="ts">
import { ref } from 'vue'

interface Props {
  folders: Cloudinary.IFolder[]
  currentFolder: string
  newFolderText?: string
  placeholderText?: string
  createText?: string
  cancelText?: string
}

const props = withDefaults(defineProps<Props>(), {
  newFolderText: '+ New Folder',
  placeholderText: 'Folder name',
  createText: 'Create',
  cancelText: 'Cancel'
})

const emit = defineEmits<{
  (e: 'select', folder: Cloudinary.IFolder): void
  (e: 'create', name: string): void
  (e: 'delete', folder: Cloudinary.IFolder): void
  (e: 'load-children', folder: string): Promise<Cloudinary.IFolder[]>
}>()

const expandedFolders = ref<Set<string>>(new Set(['root']))
const showCreateFolder = ref(false)
const newFolderName = ref('')

const toggleFolder = async (folder: Cloudinary.IFolder) => {
  const isExpanded = expandedFolders.value.has(folder.path)

  if (isExpanded) {
    expandedFolders.value.delete(folder.path)
  } else {
    expandedFolders.value.add(folder.path)

    // Load children if not loaded
    if (folder.hasChildren && !folder.childrenLoaded) {
      const children = await emit('load-children', folder.path)
      folder.children = children
      folder.childrenLoaded = true
    }
  }
}

const selectFolder = (folder: Cloudinary.IFolder) => {
  emit('select', folder)
}

const handleCreateFolder = () => {
  if (newFolderName.value.trim()) {
    emit('create', newFolderName.value.trim())
    newFolderName.value = ''
    showCreateFolder.value = false
  }
}

const isExpanded = (path: string) => expandedFolders.value.has(path)
const isActive = (path: string) => props.currentFolder === path
</script>

<template>
  <div class="folder-tree p-4">
    <!-- Create Folder Button -->
    <div class="mb-4">
      <button v-if="!showCreateFolder"
        class="w-full px-3 py-2 text-sm bg-blue-600 hover:bg-blue-700 text-white rounded-lg transition"
        @click="showCreateFolder = true">
        {{ newFolderText }}
      </button>

      <div v-else class="space-y-2">
        <input v-model="newFolderName" type="text" :placeholder="placeholderText"
          class="w-full px-3 py-2 text-sm border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-800"
          @keyup.enter="handleCreateFolder" @keyup.esc="showCreateFolder = false" />
        <div class="flex gap-2">
          <button class="flex-1 px-3 py-1 text-sm bg-blue-600 hover:bg-blue-700 text-white rounded"
            @click="handleCreateFolder">
            {{ createText }}
          </button>
          <button
            class="flex-1 px-3 py-1 text-sm border border-gray-300 dark:border-gray-600 rounded hover:bg-gray-50 dark:hover:bg-gray-800"
            @click="showCreateFolder = false">
            {{ cancelText }}
          </button>
        </div>
      </div>
    </div>

    <!-- Folder Tree -->
    <div class="space-y-1">
      <div v-for="folder in folders" :key="folder.path" class="folder-item">
        <div :class="[
          'flex items-center gap-2 px-2 py-1.5 rounded cursor-pointer transition',
          isActive(folder.path) ? 'bg-blue-100 dark:bg-blue-900 text-blue-700 dark:text-blue-300' : 'hover:bg-gray-100 dark:hover:bg-gray-800'
        ]" @click="selectFolder(folder)">
          <!-- Expand/Collapse Icon -->
          <button v-if="folder.hasChildren" class="w-4 h-4 flex items-center justify-center"
            @click.stop="toggleFolder(folder)">
            <svg class="w-3 h-3 transition-transform" :class="{ 'rotate-90': isExpanded(folder.path) }"
              fill="currentColor" viewBox="0 0 20 20">
              <path
                d="M7.293 14.707a1 1 0 010-1.414L10.586 10 7.293 6.707a1 1 0 011.414-1.414l4 4a1 1 0 010 1.414l-4 4a1 1 0 01-1.414 0z" />
            </svg>
          </button>
          <div v-else class="w-4" />

          <!-- Folder Icon -->
          <svg class="w-4 h-4 shrink-0" fill="currentColor" viewBox="0 0 20 20">
            <path d="M2 6a2 2 0 012-2h5l2 2h5a2 2 0 012 2v6a2 2 0 01-2 2H4a2 2 0 01-2-2V6z" />
          </svg>

          <!-- Folder Name -->
          <span class="text-sm flex-1 truncate">{{ folder.name }}</span>

          <!-- Delete Button -->
          <button v-if="folder.path !== 'root'"
            class="opacity-0 group-hover:opacity-100 p-1 hover:bg-red-100 dark:hover:bg-red-900 rounded transition"
            @click.stop="$emit('delete', folder)">
            <svg class="w-3 h-3 text-red-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2"
                d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
            </svg>
          </button>
        </div>

        <!-- Children -->
        <div v-if="isExpanded(folder.path) && folder.children" class="ml-4 mt-1 space-y-1">
          <div v-for="child in folder.children" :key="child.path" :class="[
            'flex items-center gap-2 px-2 py-1.5 rounded cursor-pointer transition',
            isActive(child.path) ? 'bg-blue-100 dark:bg-blue-900 text-blue-700 dark:text-blue-300' : 'hover:bg-gray-100 dark:hover:bg-gray-800'
          ]" @click="selectFolder(child)">
            <svg class="w-4 h-4 shrink-0" fill="currentColor" viewBox="0 0 20 20">
              <path d="M2 6a2 2 0 012-2h5l2 2h5a2 2 0 012 2v6a2 2 0 01-2 2H4a2 2 0 01-2-2V6z" />
            </svg>
            <span class="text-sm flex-1 truncate">{{ child.name }}</span>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<style scoped>
.folder-item:hover .opacity-0 {
  opacity: 1;
}
</style>
