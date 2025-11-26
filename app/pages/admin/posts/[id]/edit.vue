<template>
  <div>
    <div class="flex items-center justify-between mb-6">
      <h1 class="text-2xl font-bold">Edit Post</h1>
      <UButton to="/admin/posts" color="neutral" variant="ghost" icon="i-lucide-arrow-left">
        Back to Posts
      </UButton>
    </div>

    <div v-if="pending" class="space-y-4">
      <USkeleton class="h-12 w-full" />
      <USkeleton class="h-96 w-full" />
    </div>

    <UCard v-else-if="post">
      <form @submit.prevent="handleSubmit" class="space-y-6">
        <div class="grid gap-6 lg:grid-cols-3">
          <!-- Main Content -->
          <div class="lg:col-span-2 space-y-6">
            <UFormGroup label="Title" name="title" required>
              <UInput v-model="form.title" placeholder="Post title" />
            </UFormGroup>

            <UFormGroup label="Slug" name="slug">
              <UInput v-model="form.slug" placeholder="post-url-slug" />
            </UFormGroup>

            <UFormGroup label="Content" name="content" required>
              <UTextarea v-model="form.content" :rows="15" placeholder="Write your post content here..." />
            </UFormGroup>

            <UFormGroup label="Excerpt" name="excerpt">
              <UTextarea v-model="form.excerpt" :rows="3" placeholder="Short summary for SEO and previews" />
            </UFormGroup>

            <UCard>
              <template #header>
                <h3 class="font-bold">SEO Settings</h3>
              </template>
              <div class="space-y-4">
                <UFormGroup label="Meta Title">
                  <UInput v-model="form.metaTitle" placeholder="SEO Title" />
                </UFormGroup>
                <UFormGroup label="Meta Description">
                  <UTextarea v-model="form.metaDescription" :rows="2" placeholder="SEO Description" />
                </UFormGroup>
              </div>
            </UCard>
          </div>

          <!-- Sidebar -->
          <div class="space-y-6">
            <UCard>
              <template #header>
                <h3 class="font-bold">Publishing</h3>
              </template>

              <div class="space-y-4">
                <UFormGroup label="Status">
                  <USelect v-model="form.status" :options="['draft', 'published', 'scheduled', 'archived']" />
                </UFormGroup>

                <div class="text-sm text-gray-500 mb-2">
                  <p>Created: {{ new Date(post.createdAt).toLocaleDateString() }}</p>
                  <p>Updated: {{ new Date(post.updatedAt).toLocaleDateString() }}</p>
                </div>

                <UButton type="submit" block :loading="saving">
                  Update Post
                </UButton>
              </div>
            </UCard>

            <UCard>
              <template #header>
                <h3 class="font-bold">Featured Image</h3>
              </template>

              <div class="space-y-4">
                <AdminMediaGallery v-model="form.featuredImage" />
              </div>
            </UCard>
          </div>
        </div>
      </form>
    </UCard>
  </div>
</template>

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

const form = ref({
  title: '',
  slug: '',
  content: '',
  excerpt: '',
  status: 'draft',
  featuredImage: '',
  metaTitle: '',
  metaDescription: ''
})

const { data, pending } = await useAsyncData(`post-${postId}`, () => fetchPost(postId))
const post = computed(() => data.value?.data?.post)

watch(post, (newPost) => {
  if (newPost) {
    form.value = {
      title: newPost.title,
      slug: newPost.slug,
      content: newPost.content,
      excerpt: newPost.excerpt || '',
      status: newPost.status,
      featuredImage: newPost.featuredImage || '',
      metaTitle: newPost.metaTitle || '',
      metaDescription: newPost.metaDescription || ''
    }
  }
}, { immediate: true })

const handleSubmit = async () => {
  saving.value = true
  try {
    await updatePost(postId, form.value)
    toast.add({ title: 'Post updated successfully', color: 'success' })
  } catch (error: any) {
    toast.add({ title: error.message || 'Failed to update post', color: 'error' })
  } finally {
    saving.value = false
  }
}
</script>
