<template>
  <div class="space-y-6">
    <div class="flex items-center justify-between">
      <h1 class="text-2xl font-bold">Profile Settings</h1>
    </div>

    <!-- Profile Info -->
    <UCard>
      <template #header>
        <h2 class="text-lg font-semibold">Personal Information</h2>
      </template>

      <form @submit.prevent="updateProfile" class="space-y-4">
        <UFormGroup label="Name" name="name">
          <UInput v-model="form.name" />
        </UFormGroup>

        <UFormGroup label="Bio" name="bio">
          <UTextarea v-model="form.bio" />
        </UFormGroup>

        <div class="flex justify-end">
          <UButton type="submit" :loading="loading">Save Changes</UButton>
        </div>
      </form>
    </UCard>

    <!-- Change Password -->
    <UCard>
      <template #header>
        <h2 class="text-lg font-semibold">Change Password</h2>
      </template>

      <form @submit.prevent="changePassword" class="space-y-4">
        <UFormGroup label="Current Password" name="currentPassword">
          <UInput v-model="passwordForm.currentPassword" type="password" />
        </UFormGroup>

        <UFormGroup label="New Password" name="newPassword">
          <UInput v-model="passwordForm.newPassword" type="password" />
        </UFormGroup>

        <div class="flex justify-end">
          <UButton type="submit" color="neutral" :loading="passwordLoading">Update Password</UButton>
        </div>
      </form>
    </UCard>

    <!-- Active Sessions -->
    <UCard>
      <template #header>
        <h2 class="text-lg font-semibold">Active Sessions</h2>
      </template>

      <UTable :rows="sessions" :columns="sessionColumns" />
    </UCard>
  </div>
</template>

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
    toast.add({ title: 'Profile updated successfully' })
  } catch (error: any) {
    toast.add({ title: 'Error updating profile', description: error.message, color: 'error' })
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
    toast.add({ title: 'Password updated successfully' })
  } catch (error: any) {
    toast.add({ title: 'Error updating password', description: error.message, color: 'error' })
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
const sessionColumns: TableColumn<Session>[] = [
  {
    accessorKey: 'deviceType',
    header: 'Device'
  },
  {
    accessorKey: 'ip',
    header: 'IP Address'
  },
  {
    accessorKey: 'lastActiveAt',
    header: 'Last Active',
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
            title: 'Session ID copied to clipboard!',
            color: 'success',
            icon: 'i-lucide-circle-check'
          })
        }
      }
    ],
    [
      {
        label: 'Revoke',
        icon: 'i-lucide-trash',
        color: 'error',
        onSelect: () => {
          revokeSession(row.original._id)
        }
      }
    ]
  ])
]

const fetchSessions = async () => {
  const { data } = await useAPI<{ data: Session[] }>('/api/auth/sessions')
  sessions.value = data.value?.data || []
}

const revokeSession = async (sessionId: string) => {
  if (!confirm('Are you sure you want to revoke this session?')) return

  try {
    await useAPI('/api/auth/sessions', {
      method: 'DELETE',
      body: { sessionId }
    })
    await fetchSessions()
    toast.add({ title: 'Session revoked' })
  } catch (error: any) {
    toast.add({ title: 'Error revoking session', description: error.message, color: 'error' })
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
