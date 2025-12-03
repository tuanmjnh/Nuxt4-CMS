<script setup lang="ts">
const props = defineProps<{
  modelValue?: {
    name: string
    position: string
    isActive: boolean
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
  get: () => props.modelValue || { name: '', position: 'custom', isActive: true },
  set: (value) => emit('update:modelValue', value)
})
</script>

<template>
  <form @submit.prevent="emit('submit')" class="space-y-4">
    <UFormField :label="$t('menus.name')" name="name" required>
      <UInput v-model="form.name" />
    </UFormField>

    <UFormField :label="$t('menus.position')" name="position" required>
      <USelect v-model="form.position" :options="['header', 'footer', 'sidebar', 'mobile', 'custom']" />
    </UFormField>

    <UCheckbox v-model="form.isActive" :label="$t('menus.active')" />

    <div class="flex justify-end gap-2 pt-4">
      <UButton color="neutral" variant="ghost" @click="emit('cancel')">{{ $t('common.cancel') }}</UButton>
      <UButton type="submit" :loading="loading">{{ $t('common.save') }}</UButton>
    </div>
  </form>
</template>
