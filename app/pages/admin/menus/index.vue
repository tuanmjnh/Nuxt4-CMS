<script setup lang="ts">
definePageMeta({
  layout: 'admin',
  middleware: 'admin'
})

const { fetchMenus, createMenu, updateMenu, deleteMenu } = useMenu()
const toast = useToast()
const { t } = useI18n()

const showModal = ref(false)
const showDeleteModal = ref(false)
const editingMenu = ref<Models.Menu | null>(null)
const menuToDelete = ref<Models.Menu | null>(null)
const saving = ref(false)
const deleting = ref(false)

const form = ref<Models.CreateMenu>({
  name: '',
  position: 'custom',
  isActive: true
})

const { data, pending, refresh } = await useAsyncData('menus', () => fetchMenus())
const menus = computed(() => data.value?.data || [])

const openCreateModal = () => {
  editingMenu.value = null
  form.value = {
    name: '',
    position: 'custom',
    isActive: true
  }
  showModal.value = true
}

const editMenu = (menu: any) => {
  editingMenu.value = menu
  form.value = {
    name: menu.name,
    position: menu.position,
    isActive: menu.isActive
  }
  showModal.value = true
}

const handleSubmit = async () => {
  saving.value = true
  try {
    if (editingMenu.value) {
      await updateMenu(editingMenu.value._id, form.value)
      toast.add({ title: t('menus.updated_success'), color: 'success' })
    } else {
      await createMenu(form.value)
      toast.add({ title: t('menus.created_success'), color: 'success' })
    }
    showModal.value = false
    refresh()
  } catch (error: any) {
    toast.add({ title: error.message || t('common.error'), color: 'error' })
  } finally {
    saving.value = false
  }
}

const confirmDelete = (menu: any) => {
  menuToDelete.value = menu
  showDeleteModal.value = true
}

const handleDelete = async () => {
  if (!menuToDelete.value) return

  deleting.value = true
  try {
    await deleteMenu(menuToDelete.value._id)
    showDeleteModal.value = false
    refresh()
    toast.add({ title: t('menus.deleted_success'), color: 'success' })
  } catch (error) {
    toast.add({ title: t('menus.save_failed'), color: 'error' })
  } finally {
    deleting.value = false
  }
}
</script>

<template>
  <UCard>
    <template #header>
      <div class="flex items-center justify-between mb-6">
        <UButton @click="openCreateModal" icon="i-lucide-plus">
          {{ $t('menus.create') }}
        </UButton>
      </div>
    </template>
    <div v-if="pending" class="space-y-4">
      <USkeleton v-for="i in 3" :key="i" class="h-20 w-full" />
    </div>
    <div v-else class="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
      <UCard v-for="menu in menus" :key="menu._id" class="hover:border-primary-500 transition-colors">
        <div class="flex justify-between items-start mb-4">
          <div>
            <h3 class="font-bold text-lg">{{ menu.name }}</h3>
            <p class="text-sm text-gray-500">{{ menu.slug }}</p>
          </div>
          <UBadge :color="menu.isActive ? 'success' : 'neutral'" variant="subtle" size="xs">
            {{ menu.position }}
          </UBadge>
        </div>

        <div class="flex items-center justify-between mt-4">
          <span class="text-sm text-gray-500">{{ $t('menus.items_count', { count: menu.items?.length || 0 }) }}</span>
          <div class="flex gap-2">
            <UButton :to="`/admin/menus/${menu._id}/builder`" icon="i-lucide-list-tree" size="xs" color="info"
              variant="ghost">
              {{ $t('menus.builder') }}
            </UButton>
            <UButton icon="i-lucide-edit" size="xs" color="neutral" variant="ghost" @click="editMenu(menu)" />
            <UButton icon="i-lucide-trash" size="xs" color="error" variant="ghost" @click="confirmDelete(menu)" />
          </div>
        </div>
      </UCard>
    </div>
  </UCard>
  <!-- Create/Edit Modal -->
  <UModal v-model:open="showModal">
    <template #content>
      <UCard>
        <template #header>
          <h3 class="font-bold">{{ editingMenu ? $t('menus.edit') : $t('menus.create') }}</h3>
        </template>

        <form @submit.prevent="handleSubmit" class="space-y-4">
          <UFormField :label="$t('menus.name')" name="name" required>
            <UInput v-model="form.name" />
          </UFormField>

          <UFormField :label="$t('menus.position')" name="position" required>
            <USelect v-model="form.position" :options="['header', 'footer', 'sidebar', 'mobile', 'custom']" />
          </UFormField>

          <UCheckbox v-model="form.isActive" :label="$t('menus.active')" />

          <div class="flex justify-end gap-2 pt-4">
            <UButton color="neutral" variant="ghost" @click="showModal = false">{{ $t('common.cancel') }}</UButton>
            <UButton type="submit" :loading="saving">{{ $t('common.save') }}</UButton>
          </div>
        </form>
      </UCard>
    </template>
  </UModal>

  <!-- Delete Confirmation -->
  <UModal v-model:open="showDeleteModal">
    <template #content>
      <UCard>
        <template #header>
          <h3 class="font-bold">{{ $t('menus.delete') }}</h3>
        </template>
        <p>{{ $t('menus.delete_confirm') }}</p>
        <template #footer>
          <div class="flex justify-end gap-2">
            <UButton color="neutral" variant="ghost" @click="showDeleteModal = false">{{ $t('common.cancel') }}
            </UButton>
            <UButton color="error" @click="handleDelete" :loading="deleting">{{ $t('common.delete') }}</UButton>
          </div>
        </template>
      </UCard>
    </template>
  </UModal>
</template>