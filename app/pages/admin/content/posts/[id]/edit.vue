<script setup lang="ts">
definePageMeta({
  layout: 'admin',
  middleware: 'admin'
})

const route = useRoute()
const router = useRouter()
const { fetchPost, updatePost } = usePosts()
const toast = useToast()
const { locale } = useI18n()

const postId = route.params.id as string
const saving = ref(false)

interface PostForm {
  type: 'post'
  title: { en: string; vi: string;[key: string]: string }
  slug: { en: string; vi: string;[key: string]: string }
  content: { en: string; vi: string;[key: string]: string }
  excerpt: { en: string; vi: string;[key: string]: string }
  status: Models.Post['status']
  featuredImage: string
  metaTitle: string
  metaDescription: string
  tags: string[]
  attributes: any[]
}

const form = ref<PostForm>({
  type: 'post',
  title: { en: '', vi: '' },
  slug: { en: '', vi: '' },
  content: { en: '', vi: '' },
  excerpt: { en: '', vi: '' },
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
      type: 'post',
      title: typeof newPost.title === 'string' ? { en: newPost.title, vi: newPost.title } : { en: newPost.title?.en || '', vi: newPost.title?.vi || '' },
      slug: typeof newPost.slug === 'string' ? { en: newPost.slug, vi: newPost.slug } : { en: newPost.slug?.en || '', vi: newPost.slug?.vi || '' },
      content: typeof newPost.content === 'string' ? { en: newPost.content, vi: newPost.content } : { en: newPost.content?.en || '', vi: newPost.content?.vi || '' },
      excerpt: typeof newPost.excerpt === 'string' ? { en: newPost.excerpt, vi: newPost.excerpt } : { en: newPost.excerpt?.en || '', vi: newPost.excerpt?.vi || '' },
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
    toast.add({ title: $t('success.update'), color: 'success' })
  } catch (error: any) {
    toast.add({ title: $t(error.statusMessage) || $t('error.update'), color: 'error' })
  } finally {
    saving.value = false
  }
}
</script>

<template>
  <UCard>
    <template #header>
      <div class="flex items-center justify-between mb-6">
        <h1 class="text-2xl font-bold">{{ $t('common.edit') }}</h1>
        <UButton to="/admin/content/posts" color="neutral" variant="ghost" icon="i-lucide-arrow-left">
          {{ $t('common.back') }}
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
              <UInput v-model="form.title[locale]" :placeholder="$t('content.title_placeholder')" />
            </UFormField>

            <UFormField :label="$t('common.slug')" name="slug">
              <UInput v-model="form.slug[locale]" :placeholder="$t('content.slug_placeholder')" />
            </UFormField>

            <UFormField :label="$t('common.content')" name="content" required>
              <AdminTiptapEditor v-model="form.content[locale]" />
            </UFormField>

            <UFormField :label="$t('common.excerpt')" name="excerpt">
              <UTextarea v-model="form.excerpt[locale]" :rows="3" :placeholder="$t('content.excerpt_placeholder')" />
            </UFormField>

            <UCard>
              <template #header>
                <h3 class="font-bold">{{ $t('content.seo_settings') }}</h3>
              </template>
              <div class="space-y-4">
                <UFormField :label="$t('content.meta_title')">
                  <UInput v-model="form.metaTitle" :placeholder="$t('content.meta_title_placeholder')" />
                </UFormField>
                <UFormField :label="$t('content.meta_description')">
                  <UTextarea v-model="form.metaDescription" :rows="2"
                    :placeholder="$t('content.meta_description_placeholder')" />
                </UFormField>
              </div>
            </UCard>
          </div>

          <!-- Sidebar -->
          <div class="space-y-6">
            <UCard>
              <template #header>
                <h3 class="font-bold">{{ $t('common.publishing') }}</h3>
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
                  {{ $t('common.update') }}
                </UButton>
              </div>
            </UCard>
          </div>
        </div>
      </form>
    </UCard>
  </UCard>
</template>