<script setup lang="ts">
const props = defineProps<{
  modelValue?: {
    name: string
    description: string
    permissions: string[]
    isDefault: boolean
  }
  loading?: boolean
  isEditing?: boolean
  routeTree?: any[]
}>()

const emit = defineEmits<{
  (e: 'update:modelValue', value: any): void
  (e: 'submit'): void
  (e: 'cancel'): void
}>()

const form = computed({
  get: () => props.modelValue || { name: '', description: '', permissions: [], isDefault: false },
  set: (value) => emit('update:modelValue', value)
})
</script>

<template>
  <form @submit.prevent="emit('submit')" class="space-y-4">
    <UFormField :label="$t('common.name')" name="name" required>
      <UInput v-model="form.name" />
    </UFormField>

    <UFormField :label="$t('common.description')" name="description">
      <UInput v-model="form.description" />
    </UFormField>

    <UFormField :label="$t('roles.permissions')" name="permissions">
      <div class="max-h-96 overflow-y-auto border rounded-lg p-4">
        <AdminRolePermissionTree :routes="routeTree || []" v-model="form.permissions" />
      </div>
    </UFormField>

    <UCheckbox v-model="form.isDefault" :label="$t('roles.default_role')" />

    <div class="flex justify-end gap-2 pt-4">
      <UButton color="neutral" variant="ghost" @click="emit('cancel')">{{ $t('common.cancel') }}</UButton>
      <UButton type="submit" :loading="loading">{{ isEditing ? $t('common.update') : $t('common.create') }}</UButton>
    </div>
  </form>
</template>
