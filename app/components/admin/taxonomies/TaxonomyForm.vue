<script setup lang="ts">
const props = defineProps<{
  modelValue?: {
    name: string
    description: string
    type: Models.Taxonomy['type']
    color: string
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
  get: () => props.modelValue || { name: '', description: '', type: 'tag', color: '#3b82f6' },
  set: (value) => emit('update:modelValue', value)
})
</script>

<template>
  <form @submit.prevent="emit('submit')" class="space-y-4">
    <UFormField :label="$t('common.name')" name="name" required>
      <UInput v-model="form.name" />
    </UFormField>

    <UFormField :label="$t('common.description')" name="description">
      <UTextarea v-model="form.description" />
    </UFormField>

    <UFormField :label="$t('common.type')" name="type">
      <USelect v-model="form.type" :options="[{ label: 'Tag', value: 'tag' }, { label: 'Keyword', value: 'keyword' }]"
        option-attribute="label" value-attribute="value" />
    </UFormField>

    <UFormField :label="$t('common.color')" name="color">
      <div class="flex gap-2">
        <UInput v-model="form.color" type="color" class="w-12 p-1" />
        <UInput v-model="form.color" class="flex-1" />
      </div>
    </UFormField>

    <div class="flex justify-end gap-2 pt-4">
      <UButton color="neutral" variant="ghost" @click="emit('cancel')">{{ $t('common.cancel') }}</UButton>
      <UButton type="submit" :loading="loading">{{ $t('common.save') }}</UButton>
    </div>
  </form>
</template>
