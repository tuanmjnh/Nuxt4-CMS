<template>
  <div>
    <div class="flex items-center justify-between mb-6">
      <h1 class="text-2xl font-bold">Menus</h1>
      <UButton @click="openCreateModal" icon="i-lucide-plus">
        Create Menu
      </UButton>
    </div>

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
          <span class="text-sm text-gray-500">{{ menu.items?.length || 0 }} items</span>
          <div class="flex gap-2">
            <UButton :to="`/admin/menus/${menu._id}/builder`" icon="i-lucide-list-tree" size="xs" color="info"
              variant="ghost">
              Builder
            </UButton>
            <UButton icon="i-lucide-edit" size="xs" color="neutral" variant="ghost" @click="editMenu(menu)" />
            <UButton icon="i-lucide-trash" size="xs" color="error" variant="ghost" @click="confirmDelete(menu)" />
          </div>
        </div>
      </UCard>
    </div>

    <!-- Create/Edit Modal -->
    <UModal v-model="showModal">
      <UCard>
        <template #header>
          <h3 class="font-bold">{{ editingMenu ? 'Edit Menu' : 'Create Menu' }}</h3>
        </template>

        <form @submit.prevent="handleSubmit" class="space-y-4">
          <UFormGroup label="Name" name="name" required>
            <UInput v-model="form.name" />
          </UFormGroup>

          <UFormGroup label="Position" name="position" required>
            <USelect v-model="form.position" :options="['header', 'footer', 'sidebar', 'mobile', 'custom']" />
          </UFormGroup>

          <UCheckbox v-model="form.isActive" label="Active" />

          <div class="flex justify-end gap-2 pt-4">
            <UButton color="neutral" variant="ghost" @click="showModal = false">Cancel</UButton>
            <UButton type="submit" :loading="saving">Save</UButton>
          </div>
        </form>
      </UCard>
    </UModal>

    <!-- Delete Confirmation -->
    <UModal v-model="showDeleteModal">
      <UCard>
        <template #header>
          <h3 class="font-bold">Delete Menu</h3>
        </template>
        <p>Are you sure you want to delete this menu? All items within it will also be deleted.</p>
        <template #footer>
          <div class="flex justify-end gap-2">
            <UButton color="neutral" variant="ghost" @click="showDeleteModal = false">Cancel</UButton>
            <UButton color="error" @click="handleDelete" :loading="deleting">Delete</UButton>
          </div>
        </template>
      </UCard>
    </UModal>
  </div>
</template>

<script setup lang="ts">
definePageMeta({
  layout: 'admin',
  middleware: 'admin'
})

const { fetchMenus, createMenu, updateMenu, deleteMenu } = useMenu()
const toast = useToast()

const showModal = ref(false)
const showDeleteModal = ref(false)
const editingMenu = ref<any>(null)
const menuToDelete = ref<any>(null)
const saving = ref(false)
const deleting = ref(false)

const form = ref({
  name: '',
  position: 'custom',
  isActive: true
})

const { data, pending, refresh } = await useAsyncData('menus', () => fetchMenus())
const menus = computed(() => data.value?.data?.menus || [])

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
      toast.add({ title: 'Menu updated successfully', color: 'success' })
    } else {
      await createMenu(form.value)
      toast.add({ title: 'Menu created successfully', color: 'success' })
    }
    showModal.value = false
    refresh()
  } catch (error: any) {
    toast.add({ title: error.message || 'Operation failed', color: 'error' })
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
    toast.add({ title: 'Menu deleted successfully', color: 'success' })
  } catch (error) {
    toast.add({ title: 'Failed to save menu', color: 'error' })
  } finally {
    deleting.value = false
  }
}
</script>
