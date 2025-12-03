<script setup lang="ts">
const props = defineProps<{
  modelValue?: {
    name: string
    description: string
    parent: string
    type: string
    metaTitle: string
    metaDescription: string
    keywords: string[]
    ogImage: string
  }
  loading?: boolean
  isEditing?: boolean
  parentOptions?: any[]
}>()

const emit = defineEmits<{
  (e: 'update:modelValue', value: any): void
  (e: 'submit'): void
  (e: 'cancel'): void
}>()

const form = computed({
  get: () => props.modelValue || {
    name: '',
    description: '',
    parent: '',
    type: 'post',
    metaTitle: '',
    metaDescription: '',
    keywords: [],
    ogImage: ''
  },
  set: (value) => emit('update:modelValue', value)
})

const showMediaManager = ref(false)

const handleImageSelect = (files: any[]) => {
  if (files.length > 0) {
    form.value.ogImage = files[0].secure_url
  }
  showMediaManager.value = false
}
</script>

<template>
  <form @submit.prevent="emit('submit')" class="space-y-4">
    <UFormField :label="$t('categories.type')" name="type">
      <USelect v-model="form.type" :options="['post', 'product']" disabled />
    </UFormField>

    <UFormField :label="$t('categories.name')" name="name" required>
      <UInput v-model="form.name" />
    </UFormField>

    <UFormField :label="$t('categories.description')" name="description">
      <UTextarea v-model="form.description" />
    </UFormField>

    <UFormField :label="$t('categories.parent')" name="parent">
      <USelect v-model="form.parent" :options="parentOptions" option-attribute="name" value-attribute="_id"
        :placeholder="$t('categories.none')" />
    </UFormField>

    <div class="my-6 border-t border-gray-200 dark:border-gray-700 pt-4">
      <h4 class="text-sm font-medium mb-4">{{ $t('categories.seo_settings') }}</h4>

      <div class="space-y-4">
        <UFormField :label="$t('categories.meta_title')" name="metaTitle">
          <UInput v-model="form.metaTitle" :placeholder="$t('categories.meta_title')" />
        </UFormField>

        <UFormField :label="$t('categories.meta_description')" name="metaDescription">
          <UTextarea v-model="form.metaDescription" :rows="2" :placeholder="$t('categories.meta_description')" />
        </UFormField>

        <UFormField :label="$t('categories.keywords')" name="keywords">
          <UInputMenu v-model="form.keywords" multiple creatable :placeholder="$t('categories.add_keywords')" />
        </UFormField>

        <UFormField :label="$t('categories.og_image')" name="ogImage">
          <div v-if="form.ogImage"
            class="relative w-full h-48 mb-2 rounded-lg overflow-hidden group border border-gray-200 dark:border-gray-700">
            <img :src="form.ogImage" class="w-full h-full object-cover" />
            <UButton icon="i-lucide-trash" color="error" variant="solid" size="xs"
              class="absolute top-2 right-2 opacity-0 group-hover:opacity-100 transition-opacity"
              @click="form.ogImage = ''" />
          </div>
          <UButton v-else icon="i-lucide-image" color="neutral" @click="showMediaManager = true">
            {{ $t('categories.select_image') }}
          </UButton>
        </UFormField>
      </div>
    </div>

    <div class="flex justify-end gap-2 pt-4">
      <UButton color="neutral" variant="ghost" @click="emit('cancel')">{{ $t('common.cancel') }}</UButton>
      <UButton type="submit" :loading="loading">{{ $t('common.save') }}</UButton>
    </div>
  </form>

  <!-- Cloudinary Manager Modal -->
  <AdminCloudinaryManager v-if="showMediaManager" mode="modal" :multiple="false" @close="showMediaManager = false"
    @selected-files="handleImageSelect" />
</template>
