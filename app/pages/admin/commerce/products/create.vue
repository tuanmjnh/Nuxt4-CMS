<script setup lang="ts">
definePageMeta({
  layout: 'admin',
  middleware: 'admin'
})

const router = useRouter()
const toast = useToast()
const saving = ref(false)

const form = ref({
  name: '',
  slug: '',
  type: 'simple',
  status: 'draft',
  description: '',
  tags: [],
  attributes: [],
  keywords: []
})

const handleSubmit = async () => {
  saving.value = true
  try {
    const product = await $fetch<Models.Product>('/api/products', {
      method: 'POST',
      body: form.value
    })
    toast.add({ title: $t('products.create_success') })
    router.push(`/admin/products/${product._id}`)
  } catch (error: any) {
    toast.add({ title: $t('common.error'), description: error.message, color: 'error' })
  } finally {
    saving.value = false
  }
}
</script>

<template>
  <div>
    <div class="flex items-center justify-between mb-6">
      <h1 class="text-2xl font-bold">{{ $t('products.create') }}</h1>
      <UButton color="neutral" variant="ghost" to="/admin/products">
        {{ $t('common.cancel') }}
      </UButton>
    </div>

    <UForm :state="form" @submit="handleSubmit" class="space-y-6">
      <UCard>
        <template #header>
          <h3 class="font-bold">{{ $t('common.general_info') }}</h3>
        </template>

        <div class="grid grid-cols-1 md:grid-cols-2 gap-6">
          <UFormField :label="$t('products.name')" name="name" required>
            <UInput v-model="form.name" />
          </UFormField>

          <UFormField :label="$t('common.slug')" name="slug">
            <UInput v-model="form.slug" :placeholder="$t('common.auto_generated')" />
          </UFormField>

          <UFormField :label="$t('products.type')" name="type">
            <USelect v-model="form.type" :options="['simple', 'variable']" />
          </UFormField>

          <UFormField :label="$t('common.status')" name="status">
            <USelect v-model="form.status" :options="['draft', 'published', 'archived']" />
          </UFormField>
        </div>

        <UFormField :label="$t('common.description')" name="description" class="mt-6">
          <AdminTiptapEditor v-model="form.description" />
        </UFormField>

        <UFormField :label="$t('common.keywords')" name="keywords" class="mt-6">
          <AdminKeywordInput v-model="form.keywords" />
        </UFormField>
      </UCard>

      <UCard>
        <template #header>
          <h3 class="font-bold">{{ $t('products.organization') }}</h3>
        </template>
        <div class="space-y-4">
          <UFormField :label="$t('tags.title')">
            <AdminTagInput v-model="form.tags" />
          </UFormField>
          <UFormField :label="$t('products.attributes')">
            <AdminProductAttributeInput v-model="form.attributes" />
          </UFormField>
        </div>
      </UCard>

      <div class="flex justify-end">
        <UButton type="submit" :loading="saving" size="lg">
          {{ $t('products.create') }}
        </UButton>
      </div>
    </UForm>
  </div>
</template>