<script setup lang="ts">
const props = defineProps<{
  item?: any
  loading?: boolean
}>()

const emit = defineEmits(['submit', 'cancel'])

const form = ref({
  label: '',
  linkType: 'url',
  url: '',
  post: '',
  product: '',
  category: '',
  tag: '',
  target: '_self',
  icon: '',
  cssClass: '',
  isVisible: true
})

watch(() => props.item, (newItem) => {
  if (newItem) {
    form.value = {
      label: newItem.label,
      linkType: newItem.linkType,
      url: newItem.url || '',
      post: newItem.post?._id || newItem.post || '',
      product: newItem.product?._id || newItem.product || '',
      category: newItem.category?._id || newItem.category || '',
      tag: newItem.tag?._id || newItem.tag || '',
      target: newItem.target || '_self',
      icon: newItem.icon || '',
      cssClass: newItem.cssClass || '',
      isVisible: newItem.isVisible !== false
    }
  }
}, { immediate: true })

const handleSubmit = () => {
  emit('submit', form.value)
}
</script>

<template>
  <form @submit.prevent="handleSubmit" class="space-y-4">
    <UFormField label="Label" name="label" required>
      <UInput v-model="form.label" placeholder="Menu Item Label" />
    </UFormField>

    <UFormField label="Link Type" name="linkType">
      <USelect v-model="form.linkType" :options="['url', 'post', 'product', 'category', 'tag', 'page']" />
    </UFormField>

    <!-- Dynamic fields based on link type -->
    <UFormField v-if="form.linkType === 'url'" label="URL" name="url" required>
      <UInput v-model="form.url" placeholder="https://example.com" />
    </UFormField>

    <UFormField v-if="form.linkType === 'post'" label="Select Post" name="post" required>
      <!-- TODO: Replace with async search select -->
      <UInput v-model="form.post" placeholder="Post ID (temporary)" />
    </UFormField>

    <UFormField v-if="form.linkType === 'product'" label="Select Product" name="product" required>
      <!-- TODO: Replace with async search select -->
      <UInput v-model="form.product" placeholder="Product ID (temporary)" />
    </UFormField>

    <UFormField v-if="form.linkType === 'category'" label="Select Category" name="category" required>
      <!-- TODO: Replace with async search select -->
      <UInput v-model="form.category" placeholder="Category ID (temporary)" />
    </UFormField>

    <UFormField v-if="form.linkType === 'tag'" label="Select Tag" name="tag" required>
      <!-- TODO: Replace with async search select -->
      <UInput v-model="form.tag" placeholder="Tag ID (temporary)" />
    </UFormField>

    <div class="grid grid-cols-2 gap-4">
      <UFormField label="Target" name="target">
        <USelect v-model="form.target" :options="['_self', '_blank']" />
      </UFormField>

      <UFormField label="Icon" name="icon">
        <UInput v-model="form.icon" placeholder="i-lucide-home" />
      </UFormField>
    </div>

    <UFormField label="CSS Class" name="cssClass">
      <UInput v-model="form.cssClass" placeholder="custom-class" />
    </UFormField>

    <UCheckbox v-model="form.isVisible" label="Visible" />

    <div class="flex justify-end gap-2 pt-4">
      <UButton color="neutral" variant="ghost" @click="$emit('cancel')">Cancel</UButton>
      <UButton type="submit" :loading="loading">Save</UButton>
    </div>
  </form>
</template>