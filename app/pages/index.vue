<template>
  <div>
    <UContainer class="py-12">
      <div class="max-w-4xl mx-auto">
        <h1 class="text-4xl font-bold mb-4">{{ $t('common.welcome') }}</h1>
        <p class="text-xl text-gray-600 dark:text-gray-400 mb-8">
          {{ $t('common.site_description') }}
        </p>

        <!-- Featured Posts -->
        <div v-if="pending" class="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
          <USkeleton v-for="i in 6" :key="i" class="h-64" />
        </div>

        <div v-else-if="posts && posts.length > 0" class="space-y-8">
          <h2 class="text-2xl font-bold">{{ $t('posts.latest_posts') }}</h2>
          <div class="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
            <NuxtLink v-for="post in posts" :key="post._id" :to="`/posts/${post.slug}`"
              class="block border rounded-lg overflow-hidden hover:shadow-lg transition">
              <div v-if="post.thumbnail" class="aspect-video bg-gray-200">
                <img :src="post.thumbnail.url" :alt="getLocalized(post.title)" class="w-full h-full object-cover" />
              </div>
              <div class="p-4">
                <h3 class="font-bold text-lg mb-2">{{ getLocalized(post.title) }}</h3>
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
        </div>

        <div v-else class="text-center py-12">
          <p class="text-gray-600 dark:text-gray-400">{{ $t('posts.no_posts_found') }}</p>
        </div>
      </div>
    </UContainer>
  </div>
</template>

<script setup lang="ts">
import type { IApiResponse, IPost } from '~/types'

const { t } = useI18n()

useSeoMeta({
  title: t('common.home'),
  description: t('common.site_description')
})

const { data, pending } = await useFetch<IApiResponse<{ posts: IPost[] }>>('/api/posts', {
  query: {
    limit: 6,
    sort: '-publishedAt'
  }
})

const posts = computed(() => data.value?.data?.posts || [])

const getLocalized = (field: any) => {
  if (!field) return ''
  return typeof field === 'string' ? field : field.en || ''
}
</script>
