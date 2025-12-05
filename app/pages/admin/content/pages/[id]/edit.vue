<script setup lang="ts">
definePageMeta({
  layout: 'admin',
  middleware: 'admin'
})

const route = useRoute()
const router = useRouter()
const { fetchPost, updatePost } = usePosts()
const toast = useToast()

const postId = route.params.id as string
const saving = ref(false)

interface PostForm {
  type: 'page'
  title: string
  slug: string
  content: string
  excerpt: string
  status: Models.Post['status']
  featuredImage: string
  metaTitle: string
  metaDescription: string
  tags: string[]
  attributes: any[]
}

const form = ref<PostForm>({
  type: 'page',
  title: '',
  slug: '',
  content: '',
  excerpt: '',
  status: 'draft',
  featuredImage: '',
  metaTitle: '',
  metaDescription: '',
  tags: [],
  attributes: []
})

const { data, pending } = await useAsyncData(`post-${postId}`, () => fetchPost(postId))
const post = computed(() => data.value?.data?.post)

watch(post, (newPost) => {
  if (newPost) {
    form.value = {
      type: 'page',
      title: typeof newPost.title === 'string' ? newPost.title : newPost.title?.en || '',
      slug: newPost.slug,
      content: typeof newPost.content === 'string' ? newPost.content : newPost.content?.en || '',
      excerpt: typeof newPost.excerpt === 'string' ? newPost.excerpt : newPost.excerpt?.en || '',
      status: newPost.status,
      featuredImage: newPost.featuredImage || '',
      metaTitle: newPost.metaTitle || '',
      metaDescription: newPost.metaDescription || '',
      tags: newPost.tags?.map((t: any) => t.name || t) || [],
      attributes: newPost.attributes || []
    }
  }
}, { immediate: true })

const handleSubmit = async () => {
  saving.value = true
  try {
    await updatePost(postId, form.value)
    toast.add({ title: $t('posts.update_success'), color: 'success' })
  } catch (error: any) {
    toast.add({ title: error.message || $t('posts.update_error'), color: 'error' })
  } finally {
    saving.value = false
  }
}
</script>

<template>
  <UCard>
    <template #header>
      <div class="flex items-center justify-between mb-6">
        <h1 class="text-2xl font-bold">{{ $t('posts.edit') }}</h1>
        <UButton to="/admin/posts" color="neutral" variant="ghost" icon="i-lucide-arrow-left">
          {{ $t('posts.back') }}
        </UButton>
      </div>
    </template>
    <div v-if="pending" class="space-y-4">
      <USkeleton class="h-12 w-full" />
      <USkeleton class="h-96 w-full" />
    </div>

    <UCard v-else-if="post">
      <form @submit.prevent="handleSubmit" class="space-y-6">
        <div class="grid gap-6 lg:grid-cols-3">
          <!-- Main Content -->
          <div class="lg:col-span-2 space-y-6">
            <UFormField :label="$t('common.title')" name="title" required>
              <UInput v-model="form.title" :placeholder="$t('posts.title_placeholder')" />
            </UFormField>

            <UFormField :label="$t('common.slug')" name="slug">
              <UInput v-model="form.slug" :placeholder="$t('posts.slug_placeholder')" />
            </UFormField>

            <UFormField :label="$t('common.content')" name="content" required>
              <AdminTiptapEditor v-model="form.content" />
            </UFormField>

            <UFormField :label="$t('common.excerpt')" name="excerpt">
              <UTextarea v-model="form.excerpt" :rows="3" :placeholder="$t('posts.excerpt_placeholder')" />
            </UFormField>

            <UCard>
              <template #header>
                <h3 class="font-bold">{{ $t('posts.seo_settings') }}</h3>
              </template>
              <div class="space-y-4">
                <UFormField :label="$t('posts.meta_title')">
                  <UInput v-model="form.metaTitle" :placeholder="$t('posts.meta_title_placeholder')" />
                </UFormField>
                <UFormField :label="$t('posts.meta_description')">
                  <UTextarea v-model="form.metaDescription" :rows="2"
                    :placeholder="$t('posts.meta_description_placeholder')" />
                </UFormField>
              </div>
            </UCard>
          </div>

          <!-- Sidebar -->
          <div class="space-y-6">
            <UCard>
              <template #header>
                <h3 class="font-bold">{{ $t('posts.publishing') }}</h3>
              </template>

              <div class="space-y-4">
                <UFormField :label="$t('common.status')">
                  <USelect v-model="form.status" :options="['draft', 'published', 'scheduled', 'archived']" />
                </UFormField>

                <div class="text-sm text-gray-500 mb-2">
                  <p>{{ $t('common.created_at') }} {{ new Date(post.createdAt).toLocaleDateString() }}</p>
                  <p>{{ $t('common.updated_at') }} {{ new Date(post.updatedAt).toLocaleDateString() }}</p>
                </div>

                <UButton type="submit" block :loading="saving">
                  {{ $t('posts.update') }}
                </UButton>
              </div>
            </UCard>
          </div>
        </div>
      </form>
    </UCard>
  </UCard>
</template>