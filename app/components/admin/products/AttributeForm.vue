<script setup lang="ts">
const props = defineProps<{
  modelValue?: {
    name: string
    values: string
  }
  loading?: boolean
  isEditing?: boolean
}>()

const emit = defineEmits<{
  (e: 'update:modelValue', value: any): void
  (e: 'submit'): void
  (e: 'cancel'): void
}>()

const form = computed({
  get: () => props.modelValue || { name: '', values: '' },
  set: (value) => emit('update:modelValue', value)
})
</script>

<template>
  <form @submit.prevent="emit('submit')" class="space-y-4">
    <UFormField :label="$t('common.name')" name="name" required>
      <UInput v-model="form.name" />
    </UFormField>

    <UFormField :label="$t('products.attributes')" name="values" required>
      <UInput v-model="form.values" :placeholder="$t('products.values_placeholder')" />
      <p class="text-xs text-gray-500 mt-1">{{ $t('products.values_help') }}</p>
    </UFormField>

    <div class="flex justify-end gap-2 pt-4">
      <UButton color="neutral" variant="ghost" @click="emit('cancel')">{{ $t('common.cancel') }}</UButton>
      <UButton type="submit" :loading="loading">{{ isEditing ? $t('common.update') : $t('common.create') }}</UButton>
    </div>
  </form>
</template>
