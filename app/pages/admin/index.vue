<script setup lang="ts">
definePageMeta({
  layout: 'admin',
  middleware: 'admin'
})
const { user } = useAuth()

// Mock stats for now - will be replaced with real API call
const stats = ref({
  posts: 0,
  views: 0,
  comments: 0,
  users: 0
})

const recentPosts = ref<any[]>([])

// Fetch real stats
const { data } = await useFetch('/api/posts', {
  query: { limit: 5, sort: '-createdAt' }
})

if (data.value?.data) {
  recentPosts.value = data.value.data.posts
  stats.value.posts = data.value.data.pagination.total
}
</script>

<template>
  <!-- Stats Grid -->
  <div class="grid gap-6 md:grid-cols-2 lg:grid-cols-4">
    <UCard>
      <div class="flex items-center justify-between">
        <div>
          <p class="text-sm text-gray-500">{{ $t('posts.title') }}</p>
          <p class="text-2xl font-bold">{{ stats.posts }}</p>
        </div>
        <UIcon name="i-lucide-file-text" class="text-3xl text-primary-500" />
      </div>
    </UCard>

    <UCard>
      <div class="flex items-center justify-between">
        <div>
          <p class="text-sm text-gray-500">Total Views</p>
          <p class="text-2xl font-bold">{{ stats.views }}</p>
        </div>
        <UIcon name="i-lucide-eye" class="text-3xl text-green-500" />
      </div>
    </UCard>

    <UCard>
      <div class="flex items-center justify-between">
        <div>
          <p class="text-sm text-gray-500">Comments</p>
          <p class="text-2xl font-bold">{{ stats.comments }}</p>
        </div>
        <UIcon name="i-lucide-message-square" class="text-3xl text-blue-500" />
      </div>
    </UCard>

    <UCard>
      <div class="flex items-center justify-between">
        <div>
          <p class="text-sm text-gray-500">{{ $t('users.title') }}</p>
          <p class="text-2xl font-bold">{{ stats.users }}</p>
        </div>
        <UIcon name="i-lucide-users" class="text-3xl text-orange-500" />
      </div>
    </UCard>
  </div>

  <!-- Recent Activity -->
  <div class="grid gap-8 lg:grid-cols-2">
    <UCard>
      <template #header>
        <h3 class="font-bold">{{ $t('posts.latest_posts') }}</h3>
      </template>
      <div class="space-y-4">
        <div v-for="post in recentPosts" :key="post._id"
          class="flex items-center justify-between border-b pb-4 last:border-0 last:pb-0">
          <div>
            <p class="font-medium">{{ post.title }}</p>
            <p class="text-xs text-gray-500">
              {{ new Date(post.createdAt).toLocaleDateString() }}
            </p>
          </div>
          <UBadge :color="post.status === 'published' ? 'success' : 'neutral'" variant="subtle">
            {{ post.status }}
          </UBadge>
        </div>
      </div>
    </UCard>
  </div>

  <UCard>
    <template #header>
      <h3 class="font-bold">{{ $t('common.actions') }}</h3>
    </template>
    <div class="grid gap-4">
      <UButton to="/admin/posts/create" icon="i-lucide-plus" block>
        {{ $t('common.create') }} {{ $t('posts.single') }}
      </UButton>
      <UButton to="/admin/media" icon="i-lucide-image" variant="outline" block>
        {{ $t('media.title') }}
      </UButton>
      <UButton to="/admin/users" icon="i-lucide-user-plus" variant="outline" block>
        {{ $t('users.title') }}
      </UButton>
    </div>
  </UCard>
</template>
