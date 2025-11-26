<template>
  <UApp :toaster="appConfig.toaster">
    <NuxtLoadingIndicator color="#primary" />

    <NuxtLayout>
      <NuxtPage />
    </NuxtLayout>

    <!-- <ClientOnly>
      <AppSearch v-model="isSearchOpen" />
    </ClientOnly> -->
  </UApp>
</template>

<script setup lang="ts">
const appConfig = useAppConfig()
const colorMode = useColorMode()
const color = computed(() => colorMode.value === 'dark' ? '#020618' : 'white')
// Global SEO configuration
useSeoMeta({
  titleTemplate: '%s | Nuxt 4 CMS',
  ogType: 'website'
})
// Cấu hình Head
useHead({
  meta: [
    { charset: 'utf-8' },
    { name: 'viewport', content: 'width=device-width, initial-scale=1' },
    // { key: 'theme-color', name: 'theme-color', content: color }
  ],
  link: [
    { rel: 'icon', href: '/favicon.ico' }
  ],
  htmlAttrs: {
    lang: 'vi'
  },
  // Inject JSON-LD Schema (Cấu trúc dữ liệu cho Google)
  script: [
    {
      type: 'application/ld+json',
      // 🟢 SỬA LẠI NHƯ SAU:
      // 1. Đổi 'children' thành 'innerHTML' (Chuẩn HTML Script)
      // 2. Dùng JSON.stringify() vì thẻ script chỉ chứa text, không chứa JS Object
      // innerHTML: computed(() => {
      //   return companyStore.jsonLdSchema
      //     ? JSON.stringify(companyStore.jsonLdSchema)
      //     : '' // Trả về chuỗi rỗng nếu chưa có data để tránh lỗi
      // })
    }
  ]
})
</script>
