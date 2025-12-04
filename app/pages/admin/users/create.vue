<script setup lang="ts">
definePageMeta({
  layout: 'admin',
  middleware: 'admin'
})
const router = useRouter()
const toast = useToast()

const loading = ref(false)
const form = ref({
  name: '',
  username: '',
  email: '',
  password: '',
  roles: [] as string[],
  category: '',
  bio: '',
  personNumber: '',
  region: '',
  dateBirth: undefined as number | undefined,
  gender: 'other',
  address: '',
  avatar: undefined as any,
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
    if (roles.value.length > 0 && form.value.roles.length === 0) {
      const defaultRole = roles.value.find((r: any) => r.isDefault) || roles.value[0]
      if (defaultRole) {
        form.value.roles = [defaultRole._id]
      }
    }
  } catch (error) {
    console.error('Error fetching data:', error)
  }
}

const createUser = async () => {
  loading.value = true
  try {
    await $api('/api/users', {
      method: 'POST',
      body: form.value
    })
    toast.add({ title: $t('users.create_success') })
    router.push('/admin/users')
  } catch (error: any) {
    toast.add({ title: $t('users.create_error'), description: error.message, color: 'error' })
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
      <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
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

        <UFormField :label="$t('users.role')" name="roles" required>
          <USelectMenu v-model="form.roles" :items="roleOptions" label-key="name" value-key="_id" multiple />
        </UFormField>

        <UFormField :label="$t('common.category')" name="category">
          <USelect v-model="form.category" :items="categoryOptions" label-key="name" value-key="_id"
            :placeholder="$t('common.select_category')" />
        </UFormField>

        <UFormField :label="$t('users.person_number')" name="personNumber">
          <UInput v-model="form.personNumber" />
        </UFormField>

        <UFormField :label="$t('users.region')" name="region">
          <UInput v-model="form.region" />
        </UFormField>

        <UFormField :label="$t('users.date_birth')" name="dateBirth">
          <UInput type="date" :model-value="form.dateBirth ? new Date(form.dateBirth).toISOString().split('T')[0] : ''"
            @update:model-value="val => form.dateBirth = val ? new Date(val).getTime() : undefined" />
        </UFormField>

        <UFormField :label="$t('users.gender')" name="gender">
          <USelect v-model="form.gender"
            :items="[{ label: $t('users.gender_male'), value: 'male' }, { label: $t('users.gender_female'), value: 'female' }, { label: $t('users.gender_other'), value: 'other' }]" />
        </UFormField>

        <UFormField :label="$t('users.address')" name="address" class="col-span-full">
          <UTextarea v-model="form.address" />
        </UFormField>

        <UFormField :label="$t('users.avatar')" name="avatar" class="col-span-full">
          <AdminMediaGallery v-model="form.avatar" :max="1" />
        </UFormField>
      </div>

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