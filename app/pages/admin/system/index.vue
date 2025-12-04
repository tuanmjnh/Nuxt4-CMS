<script setup lang="ts">
definePageMeta({
  middleware: [
    function (to, from) {
      return navigateTo('/admin/system/config')
    }
  ]
})
</script>

<template>
  <div>Redirecting...</div>
</template>
