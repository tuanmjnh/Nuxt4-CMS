<script setup lang="ts">
definePageMeta({
  layout: 'admin',
  middleware: 'admin'
})

const router = useRouter()
const { createPost } = usePosts()
const toast = useToast()
const { user } = useAuth()

interface PostForm {
  type: 'page'
  title: string
  content: string
  excerpt: string
  status: 'draft' | 'published' | 'scheduled' | 'archived'
  thumbnail?: any
  scheduledAt: string
  tags: string[]
  attributes: any[]
  categories: string[]
  slug: string
  author: string
  format: 'standard' | 'gallery' | 'video' | 'audio' | 'quote' | 'link'
}

const loading = ref(false)
const form = ref<PostForm>({
  type: 'page',
  title: '',
  content: '',
  excerpt: '',
  status: 'draft',
  thumbnail: undefined,
  scheduledAt: '',
  tags: [],
  attributes: [],
  categories: [],
  slug: '',
  author: '',
  format: 'standard'
})

const handleSubmit = async () => {
  if (!form.value.title || !form.value.content) {
    toast.add({ title: $t('error.title_content_required'), color: 'error' })
    return
  }

  loading.value = true
  try {
    const postData: Models.CreatePost = {
      ...form.value,
      scheduledAt: form.value.scheduledAt ? new Date(form.value.scheduledAt).getTime() : undefined,
      author: user.value?._id || ''
    }
    await createPost(postData)
    toast.add({ title: $t('success.create'), color: 'success' })
    router.push('/admin/posts')
  } catch (error: any) {
    toast.add({ title: $t(error.statusMessage) || $t('error.operation_failed'), color: 'error' })
  } finally {
    loading.value = false
  }
}
</script>

<template>
  <UCard>
    <template #header>
      <div class="flex items-center justify-between mb-6">
        <h1 class="text-2xl font-bold">{{ $t('common.create') }}</h1>
        <UButton to="/admin/posts" color="neutral" variant="ghost" icon="i-lucide-arrow-left">
          {{ $t('common.back') }}
        </UButton>
      </div>
    </template>
    <form @submit.prevent="handleSubmit" class="space-y-6">
      <div class="grid gap-6 lg:grid-cols-3">
        <!-- Main Content -->
        <div class="lg:col-span-2 space-y-6">
          <UFormField :label="$t('common.title')" name="title" required>
            <UInput v-model="form.title" :placeholder="$t('content.title_placeholder')" />
          </UFormField>

          <UFormField :label="$t('common.content')" name="content" required>
            <AdminTiptapEditor v-model="form.content" />
          </UFormField>

          <UFormField :label="$t('common.excerpt')" name="excerpt">
            <UTextarea v-model="form.excerpt" :rows="3" :placeholder="$t('content.excerpt_placeholder')" />
          </UFormField>
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

              <UFormField v-if="form.status === 'scheduled'" :label="$t('content.schedule_date')">
                <UInput type="datetime-local" v-model="form.scheduledAt" />
              </UFormField>

              <UButton type="submit" block :loading="loading">
                {{ form.status === 'published' ? $t('common.publish') : $t('common.save_draft') }}
              </UButton>
            </div>
          </UCard>
        </div>
      </div>
    </form>
  </UCard>
</template>