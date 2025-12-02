<template>
  <div>
    <UContainer class="py-12">
      <!-- Loading state -->
      <div v-if="pending" class="max-w-4xl mx-auto">
        <USkeleton class="h-12 w-3/4 mb-4" />
        <USkeleton class="h-6 w-1/2 mb-8" />
        <USkeleton class="h-96" />
      </div>

      <!-- Post content -->
      <article v-else-if="post" class="max-w-4xl mx-auto">
        <!-- Featured Image -->
        <div v-if="post.featuredImage" class="aspect-video bg-gray-200 rounded-lg overflow-hidden mb-8">
          <img :src="post.featuredImage" :alt="getLocalized(post.title)" class="w-full h-full object-cover" />
        </div>

        <!-- Title -->
        <h1 class="text-4xl font-bold mb-4">{{ getLocalized(post.title) }}</h1>

        <!-- Meta info -->
        <div class="flex items-center gap-6 text-gray-600 dark:text-gray-400 mb-8 pb-8 border-b">
          <div v-if="author" class="flex items-center gap-2">
            <img v-if="author.avatar" :src="author.avatar.url" :alt="author.name" class="w-10 h-10 rounded-full" />
            <span>{{ author.name }}</span>
          </div>
          <span v-if="post.publishedAt" class="flex items-center gap-1">
            <UIcon name="i-lucide-calendar" />
            {{ new Date(post.publishedAt).toLocaleDateString() }}
          </span>
          <span class="flex items-center gap-1">
            <UIcon name="i-lucide-eye" />
            {{ post.views }}
          </span>
          <span class="flex items-center gap-1">
            <UIcon name="i-lucide-heart" />
            {{ post.likes }}
          </span>
        </div>

        <!-- Categories and Tags -->
        <div v-if="categories.length || tags.length" class="flex gap-4 mb-8">
          <div v-if="categories.length" class="flex gap-2">
            <UBadge v-for="category in categories" :key="category._id" variant="subtle">
              {{ category.name }}
            </UBadge>
          </div>
          <div v-if="tags.length" class="flex gap-2">
            <UBadge v-for="tag in tags" :key="tag._id" :style="{ backgroundColor: tag.color + '20', color: tag.color }">
              {{ tag.name }}
            </UBadge>
          </div>
        </div>

        <!-- Content -->
        <div class="prose dark:prose-invert max-w-none" v-html="getLocalized(post.content)"></div>
      </article>

      <!-- Not found -->
      <div v-else class="text-center py-12">
        <h1 class="text-2xl font-bold mb-4">{{ $t('post_not_found') }}</h1>
        <UButton to="/posts">{{ $t('back_to_posts') }}</UButton>
      </div>
    </UContainer>
  </div>
</template>

<script setup lang="ts">
// import type { IApiResponse } from '~/types/common'

const { t } = useI18n()
const route = useRoute()
const slug = route.params.slug as string

const { data, pending } = await useFetch<IApiResponse<{ post: Models.Post }>>(`/api/posts/${slug}`)
const post = computed(() => data.value?.data?.post)

const author = computed(() => {
  const a = post.value?.author
  return typeof a === 'object' ? a : null
})

const categories = computed(() => {
  return post.value?.categories?.filter((c): c is Models.Category => typeof c === 'object') || []
})

const tags = computed(() => {
  return post.value?.tags?.filter((t): t is Models.Tag => typeof t === 'object') || []
})

const getLocalized = (field: any) => {
  if (!field) return ''
  return typeof field === 'string' ? field : field.en || ''
}

// SEO
useSeoMeta({
  title: () => post.value?.metaTitle || getLocalized(post.value?.title) || t('post'),
  description: () => post.value?.metaDescription || getLocalized(post.value?.excerpt) || '',
  ogTitle: () => post.value?.metaTitle || getLocalized(post.value?.title) || '',
  ogDescription: () => post.value?.metaDescription || getLocalized(post.value?.excerpt) || '',
  ogImage: () => post.value?.ogImage || post.value?.featuredImage || '',
  ogType: 'article'
})
</script>
