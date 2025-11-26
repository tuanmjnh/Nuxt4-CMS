<template>
  <div>
    <div class="flex items-center justify-between mb-6">
      <h1 class="text-2xl font-bold">Create Post</h1>
      <UButton to="/admin/posts" color="neutral" variant="ghost" icon="i-lucide-arrow-left">
        Back to Posts
      </UButton>
    </div>

    <UCard>
      <form @submit.prevent="handleSubmit" class="space-y-6">
        <div class="grid gap-6 lg:grid-cols-3">
          <!-- Main Content -->
          <div class="lg:col-span-2 space-y-6">
            <UFormGroup label="Title" name="title" required>
              <UInput v-model="form.title" placeholder="Post title" />
            </UFormGroup>

            <UFormGroup label="Content" name="content" required>
              <UTextarea v-model="form.content" :rows="15" placeholder="Write your post content here..." />
              <!-- TODO: Replace with Rich Text Editor -->
            </UFormGroup>

            <UFormGroup label="Excerpt" name="excerpt">
              <UTextarea v-model="form.excerpt" :rows="3" placeholder="Short summary for SEO and previews" />
            </UFormGroup>
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

                <UFormGroup v-if="form.status === 'scheduled'" label="Schedule Date">
                  <UInput type="datetime-local" v-model="form.scheduledAt" />
                </UFormGroup>

                <UButton type="submit" block :loading="loading">
                  {{ form.status === 'published' ? 'Publish' : 'Save Draft' }}
                </UButton>
              </div>
            </UCard>

            <UCard>
              <template #header>
                <h3 class="font-bold">Organization</h3>
              </template>

              <div class="space-y-4">
                <!-- Categories and Tags selectors will go here -->
                <p class="text-sm text-gray-500">Categories & Tags selectors coming soon</p>
              </div>
            </UCard>

            <UCard>
              <template #header>
                <h3 class="font-bold">Featured Image</h3>
              </template>

              <div class="space-y-4">
                <AdminMediaGallery v-model="form.thumbnail" />
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

const router = useRouter()
const { createPost } = usePosts()
const toast = useToast()

const loading = ref(false)
const form = ref({
  title: '',
  content: '',
  excerpt: '',
  status: 'draft',
  thumbnail: null,
  scheduledAt: ''
})

const handleSubmit = async () => {
  if (!form.value.title || !form.value.content) {
    toast.add({ title: 'Title and content are required', color: 'error' })
    return
  }

  loading.value = true
  try {
    await createPost(form.value)
    toast.add({ title: 'Post created successfully', color: 'success' })
    router.push('/admin/posts')
  } catch (error: any) {
    toast.add({ title: error.message || 'Failed to create post', color: 'error' })
  } finally {
    loading.value = false
  }
}
</script>
