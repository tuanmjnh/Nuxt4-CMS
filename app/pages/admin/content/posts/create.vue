<script setup lang="ts">
definePageMeta({
  layout: 'admin',
  middleware: 'admin'
})

const router = useRouter()
const { createPost } = usePosts()
const toast = useToast()
const { user } = useAuth()
const { locale } = useI18n()

interface PostForm {
  type: 'post'
  title: { en: string; vi: string }
  content: { en: string; vi: string }
  excerpt: { en: string; vi: string }
  status: 'draft' | 'published' | 'scheduled' | 'archived'
  thumbnail?: any
  scheduledAt: string
  tags: string[]
  attributes: any[]
  categories: string[]
  slug: { en: string; vi: string;[key: string]: string }
  author: string
  format: 'standard' | 'gallery' | 'video' | 'audio' | 'quote' | 'link'
}

const loading = ref(false)
const form = ref<PostForm>({
  type: 'post',
  title: { en: '', vi: '' },
  content: { en: '', vi: '' },
  excerpt: { en: '', vi: '' },
  status: 'draft',
  thumbnail: undefined,
  scheduledAt: '',
  tags: [],
  attributes: [],
  categories: [],
  slug: { en: '', vi: '' },
  author: '',
  format: 'standard'
})

const handleSubmit = async () => {
  if (!form.value.title[locale.value] || !form.value.content[locale.value]) {
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
    router.push('/admin/content/posts')
  } catch (error: any) {
    toast.add({ title: $t(error.statusMessage) || $t('error.create'), color: 'error' })
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
        <UButton to="/admin/content/posts" color="neutral" variant="ghost" icon="i-lucide-arrow-left">
          {{ $t('common.back') }}
        </UButton>
      </div>
    </template>
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
        </div>

        <!-- Sidebar -->
        <div class="space-y-6">
          <UCard>
            <template #header>
              <h3 class="font-bold">{{ $t('content.publishing') }}</h3>
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