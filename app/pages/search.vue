<template>
  <div>
    <UContainer class="py-12">
      <h1 class="text-3xl font-bold mb-8">Search Results</h1>

      <div class="mb-8">
        <UInput v-model="searchQuery" icon="i-lucide-search" placeholder="Search posts..." size="xl"
          @keydown.enter="handleSearch" />
      </div>

      <div v-if="pending" class="space-y-4">
        <USkeleton v-for="i in 3" :key="i" class="h-32" />
      </div>

      <div v-else-if="posts.length > 0" class="space-y-6">
        <NuxtLink v-for="post in posts" :key="post._id" :to="`/posts/${post.slug}`"
          class="block border rounded-lg p-6 hover:shadow-lg transition bg-white dark:bg-gray-800">
          <h2 class="text-xl font-bold mb-2">{{ post.title }}</h2>
          <p class="text-gray-600 dark:text-gray-400 mb-4">{{ post.excerpt }}</p>
          <div class="flex items-center gap-4 text-sm text-gray-500">
            <span>{{ new Date(post.publishedAt).toLocaleDateString() }}</span>
            <span class="flex items-center gap-1">
              <UIcon name="i-lucide-eye" /> {{ post.views }}
            </span>
          </div>
        </NuxtLink>
      </div>

      <div v-else-if="searchQuery" class="text-center py-12 text-gray-500">
        No results found for "{{ searchQuery }}"
      </div>
    </UContainer>
  </div>
</template>

<script setup lang="ts">
const route = useRoute()
const router = useRouter()

const searchQuery = ref(route.query.q as string || '')
const posts = ref<any[]>([])
const pending = ref(false)

const handleSearch = () => {
  router.push({ query: { q: searchQuery.value } })
}

const performSearch = async () => {
  if (!searchQuery.value) return

  pending.value = true
  try {
    const { data } = await $fetch<any>('/api/posts', {
      query: {
        search: searchQuery.value,
        status: 'published',
        limit: 20
      }
    })
    posts.value = data.posts
  } catch (error) {
    console.error(error)
  } finally {
    pending.value = false
  }
}

watch(() => route.query.q, (newQ) => {
  searchQuery.value = newQ as string
  performSearch()
}, { immediate: true })

useSeoMeta({
  title: 'Search',
  robots: 'noindex'
})
</script>
