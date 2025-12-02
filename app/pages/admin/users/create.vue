<script setup lang="ts">
definePageMeta({
  layout: 'admin',
  middleware: 'admin'
})
const router = useRouter()
const toast = useToast()
const { t } = useI18n()

const loading = ref(false)
const form = ref({
  name: '',
  username: '',
  email: '',
  password: '',
  role: '',
  category: '',
  bio: '',
  isActive: true
})

const roles = ref<any[]>([])
const categories = ref<any[]>([])

const roleOptions = computed(() => roles.value)
const categoryOptions = computed(() => categories.value)

const fetchData = async () => {
  try {
    const [rolesData, categoriesData] = await Promise.all([
      useAPI<any>('/api/roles'),
      useAPI<any>('/api/categories?type=user')
    ])
    roles.value = rolesData.data.value?.data || rolesData.data.value || []
    categories.value = categoriesData.data.value?.data || categoriesData.data.value || []

    // Set default role if available
    if (roles.value.length > 0 && !form.value.role) {
      const defaultRole = roles.value.find((r: any) => r.isDefault) || roles.value[0]
      if (defaultRole) {
        form.value.role = defaultRole._id
      }
    }
  } catch (error) {
    console.error('Error fetching data:', error)
  }
}

const createUser = async () => {
  loading.value = true
  try {
    await useAPI('/api/users', {
      method: 'POST',
      body: form.value
    })
    toast.add({ title: t('users.create_success') })
    router.push('/admin/users')
  } catch (error: any) {
    toast.add({ title: t('users.create_error'), description: error.message, color: 'error' })
  } finally {
    loading.value = false
  }
}

onMounted(() => {
  fetchData()
})
</script>

<template>
  <UCard>
    <template #header>
      <div class="flex items-center justify-between">
        <h1 class="text-2xl font-bold">{{ $t('users.create') }}</h1>
        <UButton to="/admin/users" color="neutral" variant="ghost" icon="i-lucide-arrow-left">{{ $t('common.back') }}
        </UButton>
      </div>
    </template>
    <form @submit.prevent="createUser" class="space-y-4">
      <UFormField :label="$t('common.name')" name="name" required>
        <UInput v-model="form.name" />
      </UFormField>

      <UFormField :label="$t('auth.username')" name="username" required>
        <UInput v-model="form.username" />
      </UFormField>

      <UFormField :label="$t('auth.email')" name="email" required>
        <UInput v-model="form.email" type="email" />
      </UFormField>

      <UFormField :label="$t('auth.password')" name="password" required>
        <UInput v-model="form.password" type="password" />
      </UFormField>

      <UFormField :label="$t('users.role')" name="role" required>
        <USelect v-model="form.role" :options="roleOptions" option-attribute="name" value-attribute="_id" />
      </UFormField>

      <UFormField :label="$t('common.category')" name="category">
        <USelect v-model="form.category" :options="categoryOptions" option-attribute="name" value-attribute="_id"
          :placeholder="$t('common.select_category')" />
      </UFormField>

      <UFormField :label="$t('users.bio')" name="bio">
        <UTextarea v-model="form.bio" />
      </UFormField>

      <UFormField name="isActive">
        <UCheckbox v-model="form.isActive" :label="$t('common.active')" />
      </UFormField>

      <div class="flex justify-end">
        <UButton type="submit" :loading="loading">{{ $t('users.create') }}</UButton>
      </div>
    </form>
  </UCard>
</template>