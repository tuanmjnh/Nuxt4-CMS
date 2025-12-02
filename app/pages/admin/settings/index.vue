<script setup lang="ts">
definePageMeta({
  middleware: [
    function (to, from) {
      if (to.path === '/admin/settings') {
        return navigateTo('/admin/settings/profile')
      }
    }
  ]
})
</script>

<template>
  <div></div>
</template>
