<script setup lang="ts">
definePageMeta({
  layout: 'admin',
  middleware: 'admin'
})

const items = computed(() => [{
  label: $t('media.cloudinary'),
  slot: 'cloudinary',
  icon: 'i-simple-icons-cloudinary'
}, {
  label: $t('media.local'),
  slot: 'local',
  icon: 'i-heroicons-computer-desktop'
}])
</script>

<template>
  <UCard>
    <template #header>
      <div class="flex items-center justify-between px-4 py-3">
        <h1 class="text-xl font-semibold text-gray-900 dark:text-white">
          {{ $t('media.title') }}
        </h1>
      </div>
    </template>
    <div class="px-4">
      <UTabs :items="items" class="w-full">
        <template #cloudinary>
          <div class="h-[calc(100vh-9rem)] mt-4">
            <AdminCloudinaryManager mode="page" :header-text="$t('media.title')" :search-text="$t('common.search')"
              :upload-text="$t('media.upload_text')" :select-text="$t('common.select')"
              :selected-text="$t('media.selected_files_text')"
              :loading-folders-error="$t('media.loading_folders_error')"
              :loading-files-error="$t('media.loading_files_error')"
              :folder-created-title="$t('media.folder_created_title')"
              :folder-created-text="$t('media.folder_created_text')"
              :folder-create-error="$t('media.folder_create_error')"
              :file-deleted-title="$t('media.file_deleted_title')"
              :folder-deleted-title="$t('media.folder_deleted_title')" :delete-error="$t('media.delete_error')"
              :file-renamed-title="$t('media.file_renamed_title')" :rename-error="$t('media.rename_error')"
              :delete-title="$t('common.delete')" :delete-message="$t('common.confirm_delete')"
              :confirm-text="$t('common.delete')" :cancel-text="$t('common.cancel')"
              :rename-title="$t('media.rename_modal_title')" :rename-text="$t('media.rename_input_placeholder')" />
          </div>
        </template>

        <template #local>
          <div
            class="h-[calc(100vh-9rem)] mt-4 flex items-center justify-center border-2 border-dashed border-gray-300 dark:border-gray-700 rounded-lg bg-gray-50 dark:bg-gray-800/50">
            <div class="text-center">
              <UIcon name="i-heroicons-computer-desktop" class="w-12 h-12 text-gray-400 mx-auto mb-4" />
              <h3 class="text-lg font-medium text-gray-900 dark:text-white mb-2">{{ $t('media.local_storage') }}
              </h3>
              <p class="text-gray-500 dark:text-gray-400">{{ $t('media.local_coming_soon') }}</p>
            </div>
          </div>
        </template>
      </UTabs>
    </div>
  </UCard>
</template>
