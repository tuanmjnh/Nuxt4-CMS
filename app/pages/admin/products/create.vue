<template>
  <div>
    <div class="flex items-center justify-between mb-6">
      <h1 class="text-2xl font-bold">Create Product</h1>
      <UButton color="neutral" variant="ghost" to="/admin/products">
        Cancel
      </UButton>
    </div>

    <UForm :state="form" @submit="handleSubmit" class="space-y-6">
      <UCard>
        <template #header>
          <h3 class="font-bold">General Information</h3>
        </template>

        <div class="grid grid-cols-1 md:grid-cols-2 gap-6">
          <UFormGroup label="Product Name" name="name" required>
            <UInput v-model="form.name" />
          </UFormGroup>

          <UFormGroup label="Slug" name="slug">
            <UInput v-model="form.slug" placeholder="Auto-generated if empty" />
          </UFormGroup>

          <UFormGroup label="Product Type" name="type">
            <USelect v-model="form.type" :options="['simple', 'variable']" />
          </UFormGroup>

          <UFormGroup label="Status" name="status">
            <USelect v-model="form.status" :options="['draft', 'published', 'archived']" />
          </UFormGroup>
        </div>

        <UFormGroup label="Description" name="description" class="mt-6">
          <UTextarea v-model="form.description" :rows="5" />
        </UFormGroup>
      </UCard>

      <div class="flex justify-end">
        <UButton type="submit" :loading="saving" size="lg">
          Create Product
        </UButton>
      </div>
    </UForm>
  </div>
</template>

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
  description: ''
})

const handleSubmit = async () => {
  saving.value = true
  try {
    const product = await $fetch<Models.Product>('/api/products', {
      method: 'POST',
      body: form.value
    })
    toast.add({ title: 'Product created' })
    router.push(`/admin/products/${product._id}`)
  } catch (error: any) {
    toast.add({ title: 'Error', description: error.message, color: 'error' })
  } finally {
    saving.value = false
  }
}
</script>
