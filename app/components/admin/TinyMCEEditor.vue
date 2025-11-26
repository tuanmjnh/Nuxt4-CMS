<script setup lang="ts">
import { ref, computed, watch } from 'vue'
import Editor from '@tinymce/tinymce-vue'

interface Props {
  modelValue: string | null
  height?: number
  placeholder?: string
  apiKey?: string
}

const props = withDefaults(defineProps<Props>(), {
  height: 500,
  placeholder: 'Input content here...',
  apiKey: 'jl2ow90w9fkj758bcj3uw58sntbsdrtnpg8pj5x8cm2zilea'
})

const emit = defineEmits<{
  (e: 'update:modelValue', value: string): void
}>()

const { uploadToCloudinary } = useCloudinary()

const content = ref(props.modelValue ? String(props.modelValue) : '')

watch(() => props.modelValue, (val) => {
  const s = val ? String(val) : ''
  if (s !== content.value) content.value = s
})

function handleChange(v: string) {
  emit('update:modelValue', v)
}

// Cloudinary image upload handler
const handleImageUpload = async (blobInfo: any, progress: (percent: number) => void) => {
  try {
    const file = blobInfo.blob()

    // Upload to Cloudinary
    const result = await uploadToCloudinary(file, 'posts', (percent) => {
      progress(percent)
    })

    // Return the secure URL
    return result.secure_url
  } catch (error) {
    console.error('Image upload failed:', error)
    throw error
  }
}

const plugins = `
  anchor autolink charmap code codesample directionality emoticons fullscreen
  help image importcss insertdatetime link lists media preview quickbars searchreplace
  table visualblocks visualchars wordcount advlist
`

const toolbar = `
  undo redo | restoredraft | blocks fontfamily fontsize | bold italic underline strikethrough |
  forecolor backcolor | alignleft aligncenter alignright alignjustify alignnone |
  bullist numlist checklist | outdent indent | link image media | preview fullscreen |
  charmap emoticons | codesample code | table tabledelete tableprops tablemergecells tablesplitcells tableinsertrowbefore tableinsertrowafter
  tabledeleterow tableinsertcolbefore tableinsertcolafter tabledeletecol | searchreplace | removeformat | help
`

const themes = computed(() => {
  const isDark = document.documentElement.classList.contains('dark')
  return {
    skin: isDark ? 'oxide-dark' : 'oxide',
    content_css: isDark ? 'dark' : 'default'
  }
})
</script>

<template>
  <Editor v-model="content" :api-key="props.apiKey" :init="{
    height: props.height,
    menubar: true,
    plugins,
    toolbar,
    inline: false,
    fixed_toolbar_container: null,
    relative_urls: false,
    remove_script_host: false,
    placeholder: props.placeholder,
    image_caption: true,
    quickbars_selection_toolbar: 'bold italic underline | quicklink h2 h3 blockquote | forecolor backcolor',
    quickbars_insert_toolbar: 'image media table | hr',
    content_style: 'body { font-family: Inter, sans-serif; font-size: 14px; line-height: 1.6; }',
    skin: themes.skin,
    content_css: themes.content_css,
    // Cloudinary image upload
    images_upload_handler: handleImageUpload,
    automatic_uploads: true,
    file_picker_types: 'image',
    images_reuse_filename: true
  }" @update:modelValue="handleChange" />
</template>

<style>
.tox {
  width: 100%;
}

.tox-tinymce-aux,
.tox-dialog-wrap,
.tox-dialog {
  z-index: 2001 !important;
}
</style>
