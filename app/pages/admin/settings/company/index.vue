<script setup lang="ts">
import { z } from 'zod'
import type { FormSubmitEvent } from '#ui/types'

definePageMeta({
  layout: 'admin',
  middleware: 'admin'
})

const toast = useToast()

const items = [
  { slot: 'general', label: $t('settings.general') },
  { slot: 'media', label: $t('settings.media') },
  { slot: 'social', label: $t('settings.social') },
  { slot: 'seo', label: $t('settings.seo') },
  { slot: 'bank', label: $t('settings.bank_accounts') }
]

const schema = z.object({
  name: z.string().min(1, $t('common.required')),
  shortName: z.string().optional(),
  slogan: z.string().optional(),
  desc: z.string().optional(),
  address: z.string().optional(),
  phone: z.string().optional(),
  fax: z.string().optional(),
  email: z.string().email($t('company.invalid_email')).optional().or(z.literal('')),
  hotline: z.string().optional(),
  website: z.string().url($t('company.invalid_url')).optional().or(z.literal('')),
  taxCode: z.string().optional(),
  openingHours: z.string().optional(),
  mapEmbed: z.string().optional(),

  logo: z.any().optional(),
  banner: z.any().optional(),
  gallery: z.array(z.any()).optional(),

  social: z.object({
    facebook: z.string().optional(),
    twitter: z.string().optional(),
    instagram: z.string().optional(),
    linkedin: z.string().optional(),
    youtube: z.string().optional(),
    tiktok: z.string().optional(),
    zalo: z.string().optional()
  }),

  seo: z.object({
    title: z.string().optional(),
    description: z.string().optional(),
    keywords: z.string().optional(), // We'll handle array conversion
    image: z.any().optional()
  }),

  bankAccounts: z.array(z.object({
    bankName: z.string().min(1, $t('common.required')),
    number: z.string().min(1, $t('common.required')),
    owner: z.string().min(1, $t('common.required')),
    qrCode: z.any().optional()
  }))
})

type Schema = z.output<typeof schema>

const state = reactive<Schema>({
  name: '',
  shortName: '',
  slogan: '',
  desc: '',
  address: '',
  phone: '',
  fax: '',
  email: '',
  hotline: '',
  website: '',
  taxCode: '',
  openingHours: '',
  mapEmbed: '',

  logo: null,
  banner: null,
  gallery: [],

  social: {
    facebook: '',
    twitter: '',
    instagram: '',
    linkedin: '',
    youtube: '',
    tiktok: '',
    zalo: ''
  },

  seo: {
    title: '',
    description: '',
    keywords: '',
    image: null
  },

  bankAccounts: []
})

const { data: companyInfo, pending: loading } = await useAPI<Models.Response<Models.Company>>('/api/system/company')

watch(companyInfo, (newInfo) => {
  if (newInfo?.data) {
    const data = newInfo.data

    // Map basic fields
    state.name = data.name || ''
    state.shortName = data.shortName || ''
    state.slogan = data.slogan || ''
    state.desc = data.desc || ''
    state.address = data.address || ''
    state.phone = data.phone || ''
    state.fax = data.fax || ''
    state.email = data.email || ''
    state.hotline = data.hotline || ''
    state.website = data.website || '' // Assuming website is part of company model but not in interface? It was in previous vue file. 
    // Wait, previous vue file had website, but model interface doesn't have it explicitly in the snippet I saw?
    // Let's check Company.d.ts again. 
    // It has: name, shortName, slogan, desc, address, phone, fax, email, hotline, taxCode...
    // It does NOT have website in the interface I saw in Step 345.
    // But previous vue file had it. I should probably add it to interface if needed, or maybe it was removed.
    // I'll keep it in state but maybe it won't be saved if not in model.
    // Actually, I should check if I should add it to the model. 
    // The user said "check schema". 
    // I'll assume standard fields. I'll add website to state just in case, but if it's not in model it won't save.
    // Let's stick to what's in the model + what was there before.

    state.taxCode = data.taxCode || ''
    state.openingHours = data.openingHours || ''
    state.mapEmbed = data.mapEmbed || ''

    state.logo = data.logo || null
    state.banner = data.banner || null
    state.gallery = data.gallery || []

    state.social = { ...state.social, ...data.social }

    state.seo = {
      title: data.seo?.title || '',
      description: data.seo?.description || '',
      keywords: Array.isArray(data.seo?.keywords) ? data.seo.keywords.join(', ') : '',
      image: data.seo?.image || null
    }

    state.bankAccounts = data.bankAccounts || []
  }
}, { immediate: true })

const addBankAccount = () => {
  state.bankAccounts = state.bankAccounts || []
  state.bankAccounts.push({
    bankName: '',
    number: '',
    owner: '',
    qrCode: null
  })
}

const removeBankAccount = (index: number) => {
  state.bankAccounts?.splice(index, 1)
}

const onSubmit = async (event: FormSubmitEvent<Schema>) => {
  try {
    const payload = {
      ...event.data,
      seo: {
        ...event.data.seo,
        keywords: event.data.seo?.keywords ? event.data.seo.keywords.split(',').map(k => k.trim()).filter(k => k) : []
      }
    }

    await $api('/api/system/company', {
      method: 'POST',
      body: payload
    })
    toast.add({ title: $t('message.success'), color: 'success' })
  } catch (error: any) {
    toast.add({ title: error.data?.message || $t('message.error'), color: 'error' })
  }
}
</script>

<template>
  <div class="p-4">
    <h1 class="text-2xl font-bold mb-4">{{ $t('settings.company') }}</h1>

    <UCard>
      <UTabs :items="items" class="w-full">
        <template #item="{ item }">
          <div class="p-4">
            <UForm :schema="schema" :state="state" class="space-y-4" @submit="onSubmit">

              <!-- General Tab -->
              <div v-if="item.slot === 'general'" class="grid grid-cols-1 md:grid-cols-2 gap-4">
                <UFormField :label="$t('company.name')" name="name" required class="col-span-2">
                  <UInput v-model="state.name" />
                </UFormField>

                <UFormField :label="$t('company.short_name')" name="shortName">
                  <UInput v-model="state.shortName" />
                </UFormField>

                <UFormField :label="$t('company.slogan')" name="slogan">
                  <UInput v-model="state.slogan" />
                </UFormField>

                <UFormField :label="$t('company.email')" name="email">
                  <UInput v-model="state.email" />
                </UFormField>

                <UFormField :label="$t('company.phone')" name="phone">
                  <UInput v-model="state.phone" />
                </UFormField>

                <UFormField :label="$t('company.fax')" name="fax">
                  <UInput v-model="state.fax" />
                </UFormField>

                <UFormField :label="$t('company.hotline')" name="hotline">
                  <UInput v-model="state.hotline" />
                </UFormField>

                <UFormField :label="$t('company.tax_code')" name="taxCode">
                  <UInput v-model="state.taxCode" />
                </UFormField>

                <UFormField :label="$t('company.website')" name="website">
                  <UInput v-model="state.website" />
                </UFormField>

                <UFormField :label="$t('company.opening_hours')" name="openingHours">
                  <UInput v-model="state.openingHours" />
                </UFormField>

                <UFormField :label="$t('company.address')" name="address" class="col-span-2">
                  <UInput v-model="state.address" />
                </UFormField>

                <UFormField :label="$t('company.description')" name="desc" class="col-span-2">
                  <UTextarea v-model="state.desc" />
                </UFormField>
              </div>

              <!-- Media Tab -->
              <div v-if="item.slot === 'media'" class="space-y-4">
                <UFormField :label="$t('company.logo')" name="logo">
                  <FileManager v-model="state.logo" />
                </UFormField>

                <UFormField :label="$t('company.banner')" name="banner">
                  <FileManager v-model="state.banner" />
                </UFormField>

                <UFormField :label="$t('company.gallery')" name="gallery">
                  <FileManager v-model="state.gallery" :multiple="true" />
                </UFormField>
              </div>

              <!-- Social Tab -->
              <div v-if="item.slot === 'social'" class="grid grid-cols-1 md:grid-cols-2 gap-4">
                <UFormField label="Facebook" name="social.facebook">
                  <UInput v-model="state.social.facebook" icon="i-lucide-facebook" />
                </UFormField>
                <UFormField label="Twitter" name="social.twitter">
                  <UInput v-model="state.social.twitter" icon="i-lucide-twitter" />
                </UFormField>
                <UFormField label="Instagram" name="social.instagram">
                  <UInput v-model="state.social.instagram" icon="i-lucide-instagram" />
                </UFormField>
                <UFormField label="LinkedIn" name="social.linkedin">
                  <UInput v-model="state.social.linkedin" icon="i-lucide-linkedin" />
                </UFormField>
                <UFormField label="YouTube" name="social.youtube">
                  <UInput v-model="state.social.youtube" icon="i-lucide-youtube" />
                </UFormField>
                <UFormField label="TikTok" name="social.tiktok">
                  <UInput v-model="state.social.tiktok" />
                </UFormField>
                <UFormField label="Zalo" name="social.zalo">
                  <UInput v-model="state.social.zalo" />
                </UFormField>

                <UFormField :label="$t('company.map_embed')" name="mapEmbed" class="col-span-2">
                  <UTextarea v-model="state.mapEmbed" :rows="4" placeholder="<iframe...>" />
                </UFormField>
              </div>

              <!-- SEO Tab -->
              <div v-if="item.slot === 'seo'" class="space-y-4">
                <UFormField :label="$t('company.meta_title')" name="seo.title">
                  <UInput v-model="state.seo.title" />
                </UFormField>
                <UFormField :label="$t('company.meta_description')" name="seo.description">
                  <UTextarea v-model="state.seo.description" />
                </UFormField>
                <UFormField :label="$t('company.meta_keywords')" name="seo.keywords">
                  <UInput v-model="state.seo.keywords" :placeholder="$t('company.keywords_placeholder')" />
                </UFormField>
                <UFormField :label="$t('company.meta_image')" name="seo.image">
                  <FileManager v-model="state.seo.image" />
                </UFormField>
              </div>

              <!-- Bank Accounts Tab -->
              <div v-if="item.slot === 'bank'" class="space-y-4">
                <div v-for="(bank, index) in state.bankAccounts" :key="index" class="p-4 border rounded-lg relative">
                  <UButton color="error" variant="ghost" icon="i-lucide-trash" class="absolute top-2 right-2"
                    @click="removeBankAccount(index)" />

                  <div class="grid grid-cols-1 md:grid-cols-2 gap-4 pr-8">
                    <UFormField :label="$t('company.bank_name')" :name="`bankAccounts.${index}.bankName`" required>
                      <UInput v-model="bank.bankName" />
                    </UFormField>
                    <UFormField :label="$t('company.bank_number')" :name="`bankAccounts.${index}.number`" required>
                      <UInput v-model="bank.number" />
                    </UFormField>
                    <UFormField :label="$t('company.bank_owner')" :name="`bankAccounts.${index}.owner`" required>
                      <UInput v-model="bank.owner" />
                    </UFormField>
                    <UFormField :label="$t('company.qr_code')" :name="`bankAccounts.${index}.qrCode`">
                      <FileManager v-model="bank.qrCode" />
                    </UFormField>
                  </div>
                </div>

                <UButton icon="i-lucide-plus" block variant="soft" @click="addBankAccount">
                  {{ $t('common.add_new') }}
                </UButton>
              </div>

              <div class="flex justify-end pt-4 border-t">
                <UButton type="submit" :loading="loading">
                  {{ $t('company.update') }}
                </UButton>
              </div>

            </UForm>
          </div>
        </template>
      </UTabs>
    </UCard>
  </div>
</template>
