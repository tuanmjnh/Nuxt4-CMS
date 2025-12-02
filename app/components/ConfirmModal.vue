<script setup lang="ts">
const props = withDefaults(defineProps<{
  modelValue?: boolean
  title?: string
  description?: string
  icon?: string
  color?: "error" | "success" | "primary" | "secondary" | "info" | "warning" | "neutral" | undefined
  confirmLabel?: string
  cancelLabel?: string
}>(), {
  title: 'Confirm Action',
  description: 'Are you sure you want to perform this action?',
  confirmLabel: 'Confirm',
  cancelLabel: 'Cancel',
  color: 'primary'
})

const emit = defineEmits<{
  (e: 'update:modelValue', value: boolean): void
  (e: 'confirm'): void
  (e: 'cancel'): void
}>()

const isOpen = computed({
  get: () => props.modelValue ?? false,
  set: (value) => emit('update:modelValue', value)
})

const onConfirm = () => {
  emit('confirm')
  isOpen.value = false
}

const onCancel = () => {
  emit('cancel')
  isOpen.value = false
}
</script>

<template>
  <UModal v-model:open="isOpen" :title="title" :description="description" :icon="icon">
    <slot />
    <template #footer>
      <div class="flex items-center justify-end gap-2 w-full">
        <UButton :label="cancelLabel" color="neutral" variant="ghost" @click="onCancel" />
        <UButton :label="confirmLabel" :color="color" @click="onConfirm" />
      </div>
    </template>
  </UModal>
</template>
