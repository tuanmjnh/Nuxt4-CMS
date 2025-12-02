<script setup lang="ts">
import type { TableColumn, DropdownMenuItem } from '@nuxt/ui'
import type { Row } from '@tanstack/vue-table'
import { useClipboard } from '@vueuse/core'
const UButton = resolveComponent('UButton')
const UBadge = resolveComponent('UBadge')
const UDropdownMenu = resolveComponent('UDropdownMenu')

const { user, fetchUser } = useAuth()
const toast = useToast()
const { copy } = useClipboard()
const { t } = useI18n()

const loading = ref(false)
const form = ref({
  name: user.value?.name || '',
  bio: user.value?.bio || ''
})

const updateProfile = async () => {
  loading.value = true
  try {
    await useAPI('/api/auth/profile', {
      method: 'PUT',
      body: form.value
    })
    await fetchUser()
    toast.add({ title: t('settings.profile_updated') })
  } catch (error: any) {
    toast.add({ title: t('settings.profile_error'), description: error.message, color: 'error' })
  } finally {
    loading.value = false
  }
}

const passwordLoading = ref(false)
const passwordForm = ref({
  currentPassword: '',
  newPassword: ''
})

const changePassword = async () => {
  passwordLoading.value = true
  try {
    await useAPI('/api/auth/profile', {
      method: 'PUT',
      body: passwordForm.value
    })
    passwordForm.value.currentPassword = ''
    passwordForm.value.newPassword = ''
    toast.add({ title: t('auth.password_updated') })
  } catch (error: any) {
    toast.add({ title: t('auth.password_error'), description: error.message, color: 'error' })
  } finally {
    passwordLoading.value = false
  }
}

// Sessions
interface Session {
  _id: string
  deviceType: string
  ip: string
  lastActiveAt: string
  refreshToken?: string
}

const { createActionsColumn } = useTableHelpers()

const sessions = ref<Session[]>([])
const sessionColumns = computed<TableColumn<Session>[]>(() => [
  {
    accessorKey: 'deviceType',
    header: t('settings.device')
  },
  {
    accessorKey: 'ip',
    header: t('settings.ip_address')
  },
  {
    accessorKey: 'lastActiveAt',
    header: t('settings.last_active'),
    cell: ({ row }) => new Date(row.original.lastActiveAt).toLocaleString()
  },
  createActionsColumn((row: Row<Session>) => [
    [
      {
        label: 'Copy session Id',
        icon: 'i-lucide-copy',
        onSelect: () => {
          copy(row.original._id.toString())

          toast.add({
            title: t('settings.session_id_copied'),
            color: 'success',
            icon: 'i-lucide-circle-check'
          })
        }
      }
    ],
    [
      {
        label: t('settings.revoke'),
        icon: 'i-lucide-trash',
        color: 'error',
        onSelect: () => {
          revokeSession(row.original._id)
        }
      }
    ]
  ])
])

const fetchSessions = async () => {
  const { data } = await useAPI<{ data: Session[] }>('/api/auth/sessions')
  sessions.value = data.value?.data || []
}

const revokeSession = async (sessionId: string) => {
  if (!confirm(t('settings.revoke_confirm'))) return

  try {
    await useAPI('/api/auth/sessions', {
      method: 'DELETE',
      body: { sessionId }
    })
    await fetchSessions()
    toast.add({ title: t('settings.session_revoked') })
  } catch (error: any) {
    toast.add({ title: t('settings.revoke_error'), description: error.message, color: 'error' })
  }
}

// Helper to check if session is current
const refreshToken = useCookie('refreshToken')
const isCurrentSession = (row: any) => {
  return row.refreshToken === refreshToken.value
}

onMounted(() => {
  fetchSessions()
})
</script>

<template>
  <div class="space-y-6">
    <div class="flex items-center justify-between">
      <h1 class="text-2xl font-bold">{{ $t('settings.profile_title') }}</h1>
    </div>

    <!-- Profile Info -->
    <UCard>
      <template #header>
        <h2 class="text-lg font-semibold">{{ $t('settings.profile_info') }}</h2>
      </template>

      <form @submit.prevent="updateProfile" class="space-y-4">
        <UFormField :label="$t('common.name')" name="name">
          <UInput v-model="form.name" />
        </UFormField>

        <UFormField :label="$t('users.bio')" name="bio">
          <UTextarea v-model="form.bio" />
        </UFormField>

        <div class="flex justify-end">
          <UButton type="submit" :loading="loading">{{ $t('common.save_changes') }}</UButton>
        </div>
      </form>
    </UCard>

    <!-- Change Password -->
    <UCard>
      <template #header>
        <h2 class="text-lg font-semibold">{{ $t('auth.change_password') }}</h2>
      </template>

      <form @submit.prevent="changePassword" class="space-y-4">
        <UFormField :label="$t('auth.current_password')" name="currentPassword">
          <UInput v-model="passwordForm.currentPassword" type="password" />
        </UFormField>

        <UFormField :label="$t('auth.new_password')" name="newPassword">
          <UInput v-model="passwordForm.newPassword" type="password" />
        </UFormField>

        <div class="flex justify-end">
          <UButton type="submit" color="neutral" :loading="passwordLoading">{{ $t('auth.update_password') }}</UButton>
        </div>
      </form>
    </UCard>

    <!-- Active Sessions -->
    <UCard>
      <template #header>
        <h2 class="text-lg font-semibold">{{ $t('settings.active_sessions') }}</h2>
      </template>

      <UTable :rows="sessions" :columns="sessionColumns" />
    </UCard>
  </div>
</template>