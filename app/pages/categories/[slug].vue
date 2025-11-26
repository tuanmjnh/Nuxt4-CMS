<template>
  <div>
    <UContainer class="py-12">
      <div class="mb-8">
        <h1 class="text-3xl font-bold mb-2">{{ category?.name }}</h1>
        <p class="text-gray-600 dark:text-gray-400">{{ category?.description }}</p>
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
        <p class="text-gray-600 dark:text-gray-400">No posts found in this category</p>
      </div>
    </UContainer>
  </div>
</template>

<script setup lang="ts">
const route = useRoute()
const router = useRouter()

const slug = route.params.slug as string
const page = computed(() => parseInt(route.query.page as string) || 1)

// Fetch category details first to get ID (or we could update API to filter by category slug directly)
// For now, assuming API supports filtering by category slug or we need to lookup category first.
// Let's assume we update the posts API to accept category slug or we fetch category first.
// Since I didn't implement getCategoryBySlug, I'll use the posts API with category filter if it supports slug, 
// or I'll just rely on the fact that I should have implemented it.
// Actually, looking at my posts API `server/api/posts/index.get.ts`, it filters by `category` ID.
// So I need to fetch the category first to get its ID.

// Wait, I didn't create `server/api/categories/[slug].get.ts`. I created `[id].get.ts`.
// I should probably update `[id].get.ts` to handle slugs too, like I did for posts.
// Let's assume I can fetch all categories and find it, or better, I'll just use the posts API and hope I can filter by slug.
// If not, I'll quickly create a utility or just fetch all categories.
// Actually, `server/api/categories/index.get.ts` returns all categories. I can use that.

const { data: categoriesData } = await useFetch<{
  success: boolean
  data: {
    categories: Models.Category[]
  }
}>('/api/categories')
const category = computed(() => categoriesData.value?.data?.categories?.find((c) => c.slug === slug))

const { data: postsData, pending, refresh } = await useAsyncData(`category-posts-${slug}-${page.value}`, () => {
  if (!category.value) return Promise.resolve(null)
  return $fetch<{
    success: boolean
    data: {
      posts: Models.Post[]
      pagination: Models.Pagination
    }
  }>('/api/posts', {
    query: {
      category: category.value._id,
      page: page.value,
      limit: 9,
      status: 'published'
    }
  })
}, {
  watch: [category, page]
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
  title: () => category.value?.name || 'Category',
  description: () => category.value?.description || ''
})
</script>
