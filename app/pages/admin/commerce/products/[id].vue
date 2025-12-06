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
}

interface ProductForm {
  name: { en: string; vi: string }
  slug: { en: string; vi: string }
  description: { en: string; vi: string }
  type: 'simple' | 'variable'
  status: 'draft' | 'published' | 'archived'
  price: number
  salePrice: number
  sku: string
  stock: number
  manageStock: boolean
  tags: string[]
  attributes: ProductAttributeForm[]
  variants: Models.ProductVariant[]
  keywords: string[]
}

const route = useRoute()
const toast = useToast()
const saving = ref(false)
const { locale } = useI18n()

// Fetch Product
const { data: product, refresh } = await useFetch<Models.Product>(`/api/products/${route.params.id}`)

const form = ref<ProductForm>({
  name: { en: '', vi: '' },
  slug: { en: '', vi: '' },
  description: { en: '', vi: '' },
  type: 'simple',
  status: 'draft',
  price: 0,
  salePrice: 0,
  sku: '',
  stock: 0,
  manageStock: true,
  tags: [],
  attributes: [],
  variants: [],
  keywords: []
})

// Initialize form
watch(product, (newVal) => {
  if (newVal) {
    form.value = {
      name: typeof newVal.name === 'string' ? { en: newVal.name, vi: newVal.name } : { en: newVal.name?.en || '', vi: newVal.name?.vi || '' },
      slug: typeof newVal.slug === 'string' ? { en: newVal.slug, vi: newVal.slug } : { en: newVal.slug?.en || '', vi: newVal.slug?.vi || '' },
      description: typeof newVal.description === 'string' ? { en: newVal.description, vi: newVal.description } : { en: newVal.description?.en || '', vi: newVal.description?.vi || '' },
      type: newVal.type as 'simple' | 'variable',
      status: newVal.status as 'draft' | 'published' | 'archived',
      price: newVal.price || 0,
      salePrice: newVal.salePrice || 0,
      sku: newVal.sku || '',
      stock: newVal.stock || 0,
      manageStock: newVal.manageStock || true,
      tags: newVal.tags ? newVal.tags.map(t => typeof t === 'string' ? t : t.name) : [],
      attributes: newVal.attributes || [],
      variants: newVal.variants || [],
      keywords: newVal.keywords || []
    }
  }
})

const variationAttributes = computed(() => form.value.attributes.filter(attr => attr.variation))

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
    toast.add({ title: $t('products.save_success') })
    refresh()
  } catch (error: any) {
    toast.add({ title: $t('common.error'), description: error.message, color: 'error' })
  } finally {
    saving.value = false
  }
}
</script>

<template>
  <div v-if="product">
    <div class="flex items-center justify-between mb-6">
      <h1 class="text-2xl font-bold">{{ $t('products.edit') }}: {{ product.name }}</h1>
      <div class="flex gap-2">
        <UButton color="neutral" variant="ghost" to="/admin/products">{{ $t('common.back') }}</UButton>
        <UButton @click="saveProduct" :loading="saving">{{ $t('common.save_changes') }}</UButton>
      </div>
    </div>

    <div class="grid grid-cols-1 lg:grid-cols-3 gap-6">
      <!-- Main Content -->
      <div class="lg:col-span-2 space-y-6">
        <UCard>
          <template #header>
            <h3 class="font-bold">{{ $t('common.general') }}</h3>
          </template>
          <div class="space-y-4">
            <UFormField :label="$t('common.name')" name="name" required>
              <UInput v-model="form.name[locale]" />
            </UFormField>
            <UFormField :label="$t('common.description')" name="description">
              <AdminTiptapEditor v-model="form.description[locale]" />
            </UFormField>
          </div>
        </UCard>

        <!-- Pricing & Inventory (Simple Product) -->
        <UCard v-if="form.type === 'simple'">
          <template #header>
            <h3 class="font-bold">{{ $t('products.pricing_inventory') }}</h3>
          </template>
          <div class="grid grid-cols-2 gap-4">
            <UFormField :label="$t('products.regular_price')" name="price">
              <UInput v-model="form.price" type="number" />
            </UFormField>
            <UFormField :label="$t('products.sale_price')" name="salePrice">
              <UInput v-model="form.salePrice" type="number" />
            </UFormField>
            <UFormField :label="$t('products.sku')" name="sku">
              <UInput v-model="form.sku" />
            </UFormField>
            <UFormField :label="$t('products.stock_quantity')" name="stock">
              <UInput v-model="form.stock" type="number" />
            </UFormField>
          </div>
          <div class="mt-4">
            <UCheckbox v-model="form.manageStock" :label="$t('products.manage_stock')" />
          </div>
        </UCard>

        <!-- Attributes & Tags -->
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

        <!-- Variations (Variable Product) -->
        <UCard v-if="form.type === 'variable'">
          <template #header>
            <div class="flex justify-between items-center">
              <h3 class="font-bold">{{ $t('products.variations') }}</h3>
              <UButton size="sm" @click="addVariation">{{ $t('products.add_variation') }}</UButton>
            </div>
          </template>

          <div v-if="form.variants.length === 0" class="text-center text-gray-500 py-4">
            {{ $t('products.no_variations') }}
          </div>

          <div v-else class="space-y-4">
            <div v-for="(variant, index) in form.variants" :key="index" class="border p-4 rounded-lg">
              <div class="flex justify-between mb-2">
                <h4 class="font-semibold">{{ $t('products.variation') }} #{{ index + 1 }}</h4>
                <UButton color="error" variant="ghost" size="xs" icon="i-lucide-trash"
                  @click="removeVariation(index)" />
              </div>

              <div class="grid grid-cols-2 gap-4 mb-4">
                <div v-for="attr in variationAttributes" :key="attr.name">
                  <UFormField :label="attr.name">
                    <USelect v-model="getVariantAttribute(variant, attr.name).value" :options="attr.options" />
                  </UFormField>
                </div>
              </div>

              <div class="grid grid-cols-3 gap-4">
                <UFormField :label="$t('products.price')">
                  <UInput v-model="variant.price" type="number" />
                </UFormField>
                <UFormField :label="$t('products.sku')">
                  <UInput v-model="variant.sku" />
                </UFormField>
                <UFormField :label="$t('products.stock')">
                  <UInput v-model="variant.stock" type="number" />
                </UFormField>
              </div>
            </div>
          </div>
        </UCard>
      </div>

      <!-- Sidebar -->
      <div class="space-y-6">
        <UCard>
          <template #header>
            <h3 class="font-bold">{{ $t('common.publishing') }}</h3>
          </template>
          <UFormField :label="$t('common.status')">
            <USelect v-model="form.status" :options="['draft', 'published', 'archived']" />
          </UFormField>
          <UFormField :label="$t('common.slug')" class="mt-4">
            <UInput v-model="form.slug[locale]" />
          </UFormField>

          <UFormField :label="$t('common.keywords')" class="mt-4">
            <AdminKeywordInput v-model="form.keywords" />
          </UFormField>
        </UCard>
      </div>
    </div>
  </div>
</template>