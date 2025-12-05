<script setup lang="ts">
import { useClipboard, useInfiniteScroll } from '@vueuse/core'

const toast = useToast()
const { copy } = useClipboard()

const sessionColumns = computed(() => [
  { accessorKey: 'deviceType', header: $t('common.device') },
  { accessorKey: 'ip', header: 'IP' },
  { accessorKey: 'lastActiveAt', header: $t('auth.last_active') },
  { accessorKey: 'actions', header: $t('common.actions'), meta: { class: { th: 'w-26' } } }
])

const sessions = ref<Models.UserSession[]>([])
const queryCursor = ref<string | number | Date | null>(null)
const canLoadMore = ref(true)
const container = useTemplateRef('container')

const { data: sessionsData, status, refresh } = await useAPI<ApiResponse<Models.UserSession[]>>('/api/auth/sessions', {
  query: {
    cursor: queryCursor,
    limit: 10
  },
  lazy: true,
  immediate: false
})

watch(sessionsData, (newData) => {
  if (!newData?.data) return

  if (!queryCursor.value) {
    sessions.value = newData.data
  } else {
    sessions.value.push(...newData.data)
  }

  canLoadMore.value = !!newData.nextCursor
})

// Initial load
refresh()

onMounted(() => {
  useInfiniteScroll(container, () => {
    if (sessionsData.value?.nextCursor) {
      queryCursor.value = sessionsData.value.nextCursor
    }
  }, {
    distance: 50,
    canLoadMore: () => {
      return status.value !== 'pending' && canLoadMore.value
    }
  })
})

const copySessionId = (sessionId: string) => {
  copy(sessionId)
  toast.add({ title: $t('settings.session_id_copied'), color: 'success', icon: 'i-lucide-circle-check' })
}

const showRevokeModal = ref(false)
const sessionToRevoke = ref<string | null>(null)

const revokeSession = (sessionId: string) => {
  sessionToRevoke.value = sessionId
  showRevokeModal.value = true
}
const confirmRevoke = async () => {
  if (!sessionToRevoke.value) return

  try {
    await $fetch('/api/auth/sessions', {
      method: 'DELETE',
      body: { sessionId: sessionToRevoke.value }
    })
    removeById(sessions.value, sessionToRevoke.value)
    toast.add({ title: $t('settings.session_revoked'), color: 'success' })
  } catch (error: any) {
    toast.add({ title: $t('settings.revoke_error'), description: $t(error.statusMessage), color: 'error' })
  } finally {
    showRevokeModal.value = false
    sessionToRevoke.value = null
  }
}
</script>

<template>
  <UCard>
    <template #header>
      <h2 class="text-lg font-semibold">{{ $t('settings.active_sessions') }}</h2>
    </template>
    <div ref="container" class="flex-1 overflow-y-auto" style="height: calc(100vh - 390px);">
      <UTable :data="sessions" :columns="sessionColumns" :loading="status === 'pending'" sticky>
        <template #deviceType-cell="{ row }">
          <span class="capitalize">{{ row.original?.deviceType }}</span>
        </template>
        <template #ip-cell="{ row }">
          {{ row.original?.ip || 'N/A' }}
        </template>
        <template #lastActiveAt-cell="{ row }">
          {{ formatDate((row.original as Models.UserSession)?.lastActiveAt) }}
        </template>
        <template #actions-cell="{ row }">
          <div class="items-center text-center">
            <UButton icon="i-lucide-copy" color="neutral" variant="ghost" size="xs"
              @click="copySessionId(row.original?._id)" />
            <UButton icon="i-lucide-trash" color="error" variant="ghost" size="xs"
              @click="revokeSession(row.original?._id)" />
          </div>
        </template>
        <template #empty>
          <UEmpty size="xl" icon="i-lucide-bell" :title="$t('common.no_data')" :description="$t('common.no_data_desc')"
            :actions="[
              {
                icon: 'i-lucide-refresh-cw',
                label: $t('common.refresh'),
                color: 'neutral',
                variant: 'subtle',
                onClick: () => refresh()
              }
            ]" />
        </template>
      </UTable>
      <div v-if="!canLoadMore && sessions.length > 0" class="text-center p-4 text-gray-500 dark:text-gray-400 text-sm">
        {{ $t('common.no_more_data') }}
      </div>
    </div>
  </UCard>

  <ConfirmModal v-model="showRevokeModal" :title="$t('confirm.title')" :description="$t('settings.revoke_confirm')"
    :confirm-label="$t('settings.revoke')" :cancel-label="$t('common.cancel')" color="error" @confirm="confirmRevoke"
    @cancel="showRevokeModal = false" />
</template>