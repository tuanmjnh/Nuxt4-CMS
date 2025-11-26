<template>
  <div>
    <UContainer class="py-12">
      <div class="mb-8">
        <h1 class="text-3xl font-bold mb-2">Tag: {{ tag?.name }}</h1>
        <p class="text-gray-600 dark:text-gray-400">{{ tag?.description }}</p>
      </div>

      <!-- Loading state -->
      <div v-if="pending" class="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
        <USkeleton v-for="i in 6" :key="i" class="h-64" />
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
        <p class="text-gray-600 dark:text-gray-400">No posts found with this tag</p>
      </div>
    </UContainer>
  </div>
</template>

<script setup lang="ts">
const route = useRoute()
const router = useRouter()

const slug = route.params.slug as string
const page = computed(() => parseInt(route.query.page as string) || 1)

const { data: tagsData } = await useFetch<{
  success: boolean
  data: {
    tags: Models.Tag[]
  }
}>('/api/tags')
const tag = computed(() => tagsData.value?.data?.tags?.find((t) => t.slug === slug))

const { data: postsData, pending, refresh } = await useAsyncData(`tag-posts-${slug}-${page.value}`, () => {
  if (!tag.value) return Promise.resolve(null)
  return $fetch<{
    success: boolean
    data: {
      posts: Models.Post[]
      pagination: Models.Pagination
    }
  }>('/api/posts', {
    query: {
      tag: tag.value._id,
      page: page.value,
      limit: 9,
      status: 'published'
    }
  })
}, {
  watch: [tag, page]
})

const posts = computed(() => postsData.value?.data?.posts || [])
const pagination = computed(() => postsData.value?.data?.pagination)

const goToPage = (newPage: number) => {
  router.push({ query: { page: newPage } })
  refresh()
}

const getLocalized = (field: any) => {
  if (!field) return ''
  return typeof field === 'string' ? field : field.en || ''
}

useSeoMeta({
  title: () => tag.value ? `Tag: ${tag.value.name}` : 'Tag',
  description: () => tag.value?.description || ''
})
</script>
