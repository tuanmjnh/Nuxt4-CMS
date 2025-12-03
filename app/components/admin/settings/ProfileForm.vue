<script setup lang="ts">
import * as z from 'zod'
import type { FormSubmitEvent } from '@nuxt/ui'
import { CalendarDate, getLocalTimeZone } from '@internationalized/date'

const { user, fetchUser } = useAuth()
const toast = useToast()
const inputDateRef = useTemplateRef('inputDateRef')

// Cloudinary file attach schema
const fileAttachSchema = z.object({
  public_id: z.string().optional(),
  display_name: z.string().optional(),
  url: z.string(),
  thumbnail_url: z.string().optional(),
  format: z.string().optional(),
  bytes: z.number().optional(),
  width: z.number().optional(),
  height: z.number().optional(),
  created_at: z.union([z.number(), z.string()]).optional()
})

// Profile form schema
const profileSchema = z.object({
  name: z.string().min(2, $t('error.min_chars', { min: 2 })),
  username: z.string().min(3, $t('error.min_chars', { min: 3 })),
  email: z.string().email($t('error.email')),
  bio: z.string().optional(),
  personNumber: z.string().optional(),
  phoneNumber: z.string().optional(),
  region: z.string().optional(),
  dateBirth: z.number().optional(),
  gender: z.string().optional(),
  address: z.string().optional(),
  avatar: fileAttachSchema.optional()
})

type ProfileSchema = z.output<typeof profileSchema>

// State
const profileState = reactive<Partial<ProfileSchema>>({
  name: user.value?.name || '',
  username: user.value?.username || '',
  email: user.value?.email || '',
  bio: user.value?.bio || '',
  personNumber: user.value?.personNumber || '',
  phoneNumber: user.value?.phoneNumber || '',
  region: user.value?.region || '',
  dateBirth: user.value?.dateBirth || undefined,
  gender: user.value?.gender || 'other',
  address: user.value?.address || '',
  avatar: user.value?.avatar || undefined
})

const loading = ref(false)
const showAvatarManager = ref(false)
const formRef = ref()

// Watch user changes
watch(() => user.value, (newUser) => {
  if (newUser) {
    profileState.name = newUser.name || ''
    profileState.username = newUser.username || ''
    profileState.email = newUser.email || ''
    profileState.bio = newUser.bio || ''
    profileState.personNumber = newUser.personNumber || ''
    profileState.phoneNumber = newUser.phoneNumber || ''
    profileState.region = newUser.region || ''
    profileState.dateBirth = newUser.dateBirth || undefined
    profileState.gender = newUser.gender || 'other'
    profileState.address = newUser.address || ''
    profileState.avatar = newUser.avatar || undefined
  }
}, { immediate: true })


const dateBirth = computed({
  get: () => {
    if (!profileState.dateBirth) return undefined
    const d = new Date(profileState.dateBirth)
    return new CalendarDate(d.getFullYear(), d.getMonth() + 1, d.getDate())
  },
  set: (v) => {
    if (v) {
      profileState.dateBirth = v.toDate(getLocalTimeZone()).getTime()
    } else {
      profileState.dateBirth = undefined
    }
  }
})

// Methods
const onSubmit = async (event: FormSubmitEvent<ProfileSchema>) => {
  loading.value = true

  try {
    const response = await $fetch<any>('/api/user/profile', {
      method: 'PUT',
      body: event.data
    })

    if (response.success) {
      toast.add({ title: $t('common.success'), description: $t('settings.profile_updated'), color: 'success' })

      // Refresh user data
      await fetchUser()
    }
  } catch (e: any) {
    toast.add({ title: $t('common.error'), description: e.data?.message || $t('settings.profile_error'), color: 'error' })
  } finally {
    loading.value = false
  }
}

const handleAvatarSelected = (files: Cloudinary.IFileAttach[]) => {
  if (files.length > 0) {
    profileState.avatar = files[0]
    showAvatarManager.value = false
  }
}
</script>

<template>
  <UCard>
    <template #header>
      <div class="flex items-center justify-between">
        <h1 class="text-2xl font-bold">{{ $t('settings.profile_info') }}</h1>
        <UButton type="submit" variant="soft" :loading="loading" @click="formRef?.submit()">
          {{ $t('common.save_changes') }}
        </UButton>
      </div>
    </template>
    <UForm ref="formRef" :schema="profileSchema" :state="profileState" class="space-y-6" @submit="onSubmit">
      <!-- Avatar -->
      <div class="flex items-center gap-6">
        <UAvatar :src="profileState.avatar?.url || ''" :alt="profileState.name" size="3xl" />
        <div>
          <UButton icon="i-lucide-upload" variant="outline" @click="showAvatarManager = true">
            {{ $t('settings.change_avatar') }}
          </UButton>
          <p class="text-sm text-gray-500 mt-2">{{ $t('settings.avatar_help') }}</p>
        </div>
      </div>

      <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
        <!-- Name -->
        <UFormField :label="$t('common.name')" name="name" required>
          <UInput v-model="profileState.name" :placeholder="$t('settings.name_placeholder')" class="w-full" />
        </UFormField>

        <!-- Username -->
        <UFormField :label="$t('auth.username')" name="username" required>
          <UInput v-model="profileState.username" class="w-full" />
        </UFormField>

        <!-- Email -->
        <UFormField :label="$t('auth.email')" name="email" required>
          <UInput v-model="profileState.email" type="email" :placeholder="$t('settings.email_placeholder')"
            class="w-full" />
        </UFormField>

        <!-- Phone Number -->
        <UFormField :label="$t('users.phone_number')" name="phoneNumber">
          <UInput v-model="profileState.phoneNumber" class="w-full" />
        </UFormField>

        <!-- Person Number -->
        <UFormField :label="$t('users.person_number')" name="personNumber">
          <UInput v-model="profileState.personNumber" class="w-full" />
        </UFormField>

        <!-- Region -->
        <UFormField :label="$t('users.region')" name="region">
          <UInput v-model="profileState.region" class="w-full" />
        </UFormField>

        <!-- Date of Birth -->
        <UFormField :label="$t('users.date_birth')" name="dateBirth">
          <!-- <UInput type="date"
            :model-value="profileState.dateBirth ? new Date(profileState.dateBirth).toISOString().split('T')[0] : ''"
            @update:model-value="val => profileState.dateBirth = val ? new Date(val).getTime() : undefined" /> -->
          <UInputDate ref="inputDateRef" v-model="dateBirth">
            <template #trailing>
              <UPopover :reference="inputDateRef?.inputsRef[3]?.$el">
                <UButton color="neutral" variant="link" size="sm" icon="i-lucide-calendar"
                  :aria-label="$t('common.select_date')" class="px-0" />
                <template #content>
                  <UCalendar v-model="dateBirth" class="p-2" />
                </template>
              </UPopover>
            </template>
          </UInputDate>
        </UFormField>

        <!-- Gender -->
        <UFormField :label="$t('users.gender')" name="gender">
          <USelect v-model="profileState.gender" class="w-full" :items="[
            { label: $t('users.gender_male'), value: 'male' },
            { label: $t('users.gender_female'), value: 'female' },
            { label: $t('users.gender_other'), value: 'other' }
          ]" />
        </UFormField>
        <!-- Address -->
        <UFormField :label="$t('users.address')" name="address" class="col-span-full">
          <UTextarea v-model="profileState.address" class="w-full" :rows="1" />
        </UFormField>

        <!-- Bio -->
        <UFormField :label="$t('users.bio')" name="bio" class="col-span-full">
          <UTextarea v-model="profileState.bio" :placeholder="$t('settings.bio_placeholder')" :rows="4"
            class="w-full" />
        </UFormField>
      </div>
    </UForm>
  </UCard>
  <!-- Cloudinary Manager Modal -->
  <admin-media-gallery v-if="showAvatarManager" v-model="profileState.avatar" mode="modal" :multiple="false"
    @close="showAvatarManager = false" />
</template>
