<template>
  <div>
    <UContainer class="py-12">
      <h1 class="text-3xl font-bold mb-8">All Posts</h1>

      <!-- Loading state -->
      <div v-if="pending" class="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
        <USkeleton v-for="i in 9" :key="i" class="h-64" />
      </div>

      <!-- Posts grid -->
      <div v-else-if="posts && posts.length > 0" class="space-y-8">
        <div class="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
          <NuxtLink v-for="post in posts" :key="post._id" :to="`/posts/${post.slug}`"
            class="block border rounded-lg overflow-hidden hover:shadow-lg transition">
            <div v-if="post.featuredImage" class="aspect-video bg-gray-200">
              <img :src="post.featuredImage" :alt="getLocalized(post.title)" class="w-full h-full object-cover" />
            </div>
            <div class="p-4">
              <h2 class="font-bold text-lg mb-2">{{ getLocalized(post.title) }}</h2>
              <p v-if="post.excerpt" class="text-gray-600 dark:text-gray-400 text-sm line-clamp-2">
                {{ getLocalized(post.excerpt) }}
              </p>
              <div class="mt-4 flex items-center gap-4 text-sm text-gray-500">
                <span class="flex items-center gap-1">
                  <UIcon name="i-lucide-eye" />
                  {{ post.views }}
                </span>
                <span class="flex items-center gap-1">
                  <UIcon name="i-lucide-heart" />
                  {{ post.likes }}
                </span>
              </div>
            </div>
          </NuxtLink>
        </div>

        <!-- Pagination -->
        <div v-if="pagination && pagination.totalPages > 1" class="flex justify-center gap-2">
          <UButton v-for="page in pagination.totalPages" :key="page"
            :variant="page === pagination.page ? 'solid' : 'outline'" @click="goToPage(page)">
            {{ page }}
          </UButton>
        </div>
      </div>

      <!-- Empty state -->
      <div v-else class="text-center py-12">
        <p class="text-gray-600 dark:text-gray-400">No posts found</p>
      </div>
    </UContainer>
  </div>
</template>

<script setup lang="ts">
useSeoMeta({
  title: 'All Posts',
  description: 'Browse all posts'
})

const route = useRoute()
const router = useRouter()

const page = computed(() => parseInt(route.query.page as string) || 1)

const { data, pending, refresh } = await useFetch<{
  success: boolean
  data: {
    posts: Models.Post[]
    pagination: Models.Pagination
  }
}>('/api/posts', {
  query: {
    page: page.value,
    limit: 9,
    sort: '-publishedAt'
  }
})

const posts = computed(() => data.value?.data?.posts || [])
const pagination = computed(() => data.value?.data?.pagination)

const goToPage = (newPage: number) => {
  router.push({ query: { page: newPage } })
  refresh()
}

const getLocalized = (field: any) => {
  if (!field) return ''
  return typeof field === 'string' ? field : field.en || ''
}
</script>
