<script setup lang="ts">
definePageMeta({
  middleware: [
    function (to, from) {
      return navigateTo('/admin/settings/categories')
    }
  ]
})
</script>

<template>
  <div>{{ $t('common.loading_text') }}</div>
</template>
