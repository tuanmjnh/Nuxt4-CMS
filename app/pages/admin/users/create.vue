<template>
  <div class="max-w-2xl mx-auto space-y-6">
    <div class="flex items-center justify-between">
      <h1 class="text-2xl font-bold">Create User</h1>
      <UButton to="/admin/users" color="neutral" variant="ghost" icon="i-lucide-arrow-left">Back</UButton>
    </div>

    <UCard>
      <form @submit.prevent="createUser" class="space-y-4">
        <UFormGroup label="Name" name="name" required>
          <UInput v-model="form.name" />
        </UFormGroup>

        <UFormGroup label="Username" name="username" required>
          <UInput v-model="form.username" />
        </UFormGroup>

        <UFormGroup label="Email" name="email" required>
          <UInput v-model="form.email" type="email" />
        </UFormGroup>

        <UFormGroup label="Password" name="password" required>
          <UInput v-model="form.password" type="password" />
        </UFormGroup>

        <UFormGroup label="Role" name="role" required>
          <USelect v-model="form.role" :options="roleOptions" option-attribute="name" value-attribute="_id" />
        </UFormGroup>

        <UFormGroup label="Category" name="category">
          <USelect v-model="form.category" :options="categoryOptions" option-attribute="name" value-attribute="_id"
            placeholder="Select category (optional)" />
        </UFormGroup>

        <UFormGroup label="Bio" name="bio">
          <UTextarea v-model="form.bio" />
        </UFormGroup>

        <UFormGroup name="isActive">
          <UCheckbox v-model="form.isActive" label="Active" />
        </UFormGroup>

        <div class="flex justify-end">
          <UButton type="submit" :loading="loading">Create User</UButton>
        </div>
      </form>
    </UCard>
  </div>
</template>

<script setup lang="ts">
const router = useRouter()
const toast = useToast()

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
    toast.add({ title: 'User created successfully' })
    router.push('/admin/users')
  } catch (error: any) {
    toast.add({ title: 'Error creating user', description: error.message, color: 'error' })
  } finally {
    loading.value = false
  }
}

onMounted(() => {
  fetchData()
})
</script>
