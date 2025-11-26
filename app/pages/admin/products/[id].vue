<template>
  <div v-if="product">
    <div class="flex items-center justify-between mb-6">
      <h1 class="text-2xl font-bold">Edit Product: {{ product.name }}</h1>
      <div class="flex gap-2">
        <UButton color="neutral" variant="ghost" to="/admin/products">Back</UButton>
        <UButton @click="saveProduct" :loading="saving">Save Changes</UButton>
      </div>
    </div>

    <div class="grid grid-cols-1 lg:grid-cols-3 gap-6">
      <!-- Main Content -->
      <div class="lg:col-span-2 space-y-6">
        <UCard>
          <template #header>
            <h3 class="font-bold">General</h3>
          </template>
          <div class="space-y-4">
            <UFormGroup label="Name" name="name" required>
              <UInput v-model="form.name" />
            </UFormGroup>
            <UFormGroup label="Description" name="description">
              <UTextarea v-model="form.description" :rows="5" />
            </UFormGroup>
          </div>
        </UCard>

        <!-- Pricing & Inventory (Simple Product) -->
        <UCard v-if="form.type === 'simple'">
          <template #header>
            <h3 class="font-bold">Pricing & Inventory</h3>
          </template>
          <div class="grid grid-cols-2 gap-4">
            <UFormGroup label="Regular Price" name="price">
              <UInput v-model="form.price" type="number" />
            </UFormGroup>
            <UFormGroup label="Sale Price" name="salePrice">
              <UInput v-model="form.salePrice" type="number" />
            </UFormGroup>
            <UFormGroup label="SKU" name="sku">
              <UInput v-model="form.sku" />
            </UFormGroup>
            <UFormGroup label="Stock Quantity" name="stock">
              <UInput v-model="form.stock" type="number" />
            </UFormGroup>
          </div>
          <div class="mt-4">
            <UCheckbox v-model="form.manageStock" label="Manage Stock" />
          </div>
        </UCard>

        <!-- Attributes -->
        <UCard>
          <template #header>
            <div class="flex justify-between items-center">
              <h3 class="font-bold">Attributes</h3>
              <USelectMenu v-model="selectedAttributeToAdd" :options="availableAttributes" option-attribute="name"
                placeholder="Add Attribute" @change="addAttribute" />
            </div>
          </template>

          <div v-if="form.attributes.length === 0" class="text-center text-gray-500 py-4">
            No attributes added.
          </div>

          <div v-else class="space-y-4">
            <div v-for="(attr, index) in form.attributes" :key="index" class="border p-4 rounded-lg">
              <div class="flex justify-between mb-2">
                <span class="font-bold">{{ attr.name }}</span>
                <UButton color="error" variant="ghost" size="xs" icon="i-lucide-trash"
                  @click="removeAttribute(index)" />
              </div>

              <div class="space-y-2">
                <UFormGroup label="Values">
                  <!-- Simple text area for values for now, ideally a multi-select if we fetch options -->
                  <UInput v-model="attr.optionsInput" placeholder="Enter options separated by |"
                    @change="updateAttributeOptions(index)" />
                  <p class="text-xs text-gray-500">Separate options with | (pipe)</p>
                </UFormGroup>

                <div class="flex gap-4">
                  <UCheckbox v-model="attr.visible" label="Visible on product page" />
                  <UCheckbox v-if="form.type === 'variable'" v-model="attr.variation" label="Used for variations" />
                </div>
              </div>
            </div>
          </div>
        </UCard>

        <!-- Variations (Variable Product) -->
        <UCard v-if="form.type === 'variable'">
          <template #header>
            <div class="flex justify-between items-center">
              <h3 class="font-bold">Variations</h3>
              <UButton size="sm" @click="addVariation">Add Variation</UButton>
            </div>
          </template>

          <div v-if="form.variants.length === 0" class="text-center text-gray-500 py-4">
            No variations created. Add attributes used for variations first.
          </div>

          <div v-else class="space-y-4">
            <div v-for="(variant, index) in form.variants" :key="index" class="border p-4 rounded-lg">
              <div class="flex justify-between mb-2">
                <h4 class="font-semibold">Variation #{{ index + 1 }}</h4>
                <UButton color="error" variant="ghost" size="xs" icon="i-lucide-trash"
                  @click="removeVariation(index)" />
              </div>

              <div class="grid grid-cols-2 gap-4 mb-4">
                <div v-for="attr in variationAttributes" :key="attr.name">
                  <UFormGroup :label="attr.name">
                    <USelect v-model="getVariantAttribute(variant, attr.name).value" :options="attr.options" />
                  </UFormGroup>
                </div>
              </div>

              <div class="grid grid-cols-3 gap-4">
                <UFormGroup label="Price">
                  <UInput v-model="variant.price" type="number" />
                </UFormGroup>
                <UFormGroup label="SKU">
                  <UInput v-model="variant.sku" />
                </UFormGroup>
                <UFormGroup label="Stock">
                  <UInput v-model="variant.stock" type="number" />
                </UFormGroup>
              </div>
            </div>
          </div>
        </UCard>
      </div>

      <!-- Sidebar -->
      <div class="space-y-6">
        <UCard>
          <template #header>
            <h3 class="font-bold">Publish</h3>
          </template>
          <UFormGroup label="Status">
            <USelect v-model="form.status" :options="['draft', 'published', 'archived']" />
          </UFormGroup>
          <UFormGroup label="Slug" class="mt-4">
            <UInput v-model="form.slug" />
          </UFormGroup>
        </UCard>

        <UCard>
          <template #header>
            <h3 class="font-bold">Organization</h3>
          </template>
          <!-- Categories and Tags would go here, need to fetch them -->
          <p class="text-sm text-gray-500">Categories & Tags selection to be implemented.</p>
        </UCard>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
definePageMeta({
  layout: 'admin',
  middleware: 'admin'
})

interface ProductAttributeForm {
  name: string
  options: string[]
  visible: boolean
  variation: boolean
  optionsInput: string
}

interface ProductForm {
  name: string
  slug: string
  description: string
  type: 'simple' | 'variable'
  status: 'draft' | 'published' | 'archived'
  price: number
  salePrice: number
  sku: string
  stock: number
  manageStock: boolean
  attributes: ProductAttributeForm[]
  variants: Models.ProductVariant[]
}

const route = useRoute()
const toast = useToast()
const saving = ref(false)
const selectedAttributeToAdd = ref<Models.ProductAttribute | null>(null)

// Fetch Product
const { data: product, refresh } = await useFetch<Models.Product>(`/api/products/${route.params.id}`)
// Fetch Global Attributes
const { data: globalAttributes } = await useFetch<{ success: boolean, data: Models.ProductAttribute[] }>('/api/products/attributes')

const availableAttributes = computed(() => globalAttributes.value?.data || [])

const form = ref<ProductForm>({
  name: '',
  slug: '',
  description: '',
  type: 'simple',
  status: 'draft',
  price: 0,
  salePrice: 0,
  sku: '',
  stock: 0,
  manageStock: true,
  attributes: [],
  variants: []
})

// Initialize form
watch(product, (newVal) => {
  if (newVal) {
    form.value = {
      name: newVal.name,
      slug: newVal.slug,
      description: newVal.description || '',
      type: newVal.type as 'simple' | 'variable',
      status: newVal.status as 'draft' | 'published' | 'archived',
      price: newVal.price || 0,
      salePrice: newVal.salePrice || 0,
      sku: newVal.sku || '',
      stock: newVal.stock || 0,
      manageStock: newVal.manageStock || true,
      attributes: (newVal.attributes || []).map(a => ({
        name: a.name,
        options: a.options,
        visible: a.visible,
        variation: a.variation,
        optionsInput: a.options.join(' | ')
      })),
      variants: newVal.variants || []
    }
  }
}, { immediate: true })

const variationAttributes = computed(() => {
  return form.value.attributes.filter(a => a.variation)
})

const addAttribute = () => {
  if (!selectedAttributeToAdd.value) return

  const attr = selectedAttributeToAdd.value
  form.value.attributes.push({
    name: attr.name,
    options: attr.values, // Default to all values
    optionsInput: attr.values.join(' | '),
    visible: true,
    variation: false
  })
  selectedAttributeToAdd.value = null
}

const removeAttribute = (index: number) => {
  form.value.attributes.splice(index, 1)
}

const updateAttributeOptions = (index: number) => {
  const attr = form.value.attributes[index]
  if (attr) {
    attr.options = attr.optionsInput.split('|').map(v => v.trim()).filter(v => v)
  }
}

const addVariation = () => {
  const variantAttrs = variationAttributes.value.map(a => ({
    name: a.name,
    value: ''
  }))

  form.value.variants.push({
    sku: '',
    price: 0,
    stock: 0,
    attributes: variantAttrs
  })
}

const removeVariation = (index: number) => {
  form.value.variants.splice(index, 1)
}

const getVariantAttribute = (variant: Models.ProductVariant, attrName: string) => {
  const found = variant.attributes.find(a => a.name === attrName)
  if (found) return found
  // Fallback if not found (shouldn't happen if synced)
  const newAttr = { name: attrName, value: '' }
  variant.attributes.push(newAttr)
  return newAttr
}

const saveProduct = async () => {
  saving.value = true
  try {
    // Prepare payload
    const payload = {
      ...form.value,
      attributes: form.value.attributes.map(a => ({
        name: a.name,
        options: a.options,
        visible: a.visible,
        variation: a.variation
      }))
    }

    await $fetch(`/api/products/${route.params.id}`, {
      method: 'PUT' as any,
      body: payload
    })
    toast.add({ title: 'Product saved' })
    refresh()
  } catch (error: any) {
    toast.add({ title: 'Error', description: error.message, color: 'error' })
  } finally {
    saving.value = false
  }
}
</script>
