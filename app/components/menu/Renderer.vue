<script setup lang="ts">
const props = defineProps<{
  position: string
  containerClass?: string
  listClass?: string
  linkClass?: string
}>()

const { fetchMenuByPosition } = useMenu()
const route = useRoute()

const { data } = await useAsyncData(`menu-${props.position}`, () => fetchMenuByPosition(props.position))
const items = computed(() => data.value?.data?.items || [])

const getLink = (item: any) => {
  switch (item.linkType) {
    case 'url': return item.url
    case 'post': return `/posts/${item.post?.slug}`
    case 'category': return `/categories/${item.category?.slug}`
    case 'tag': return `/tags/${item.tag?.slug}`
    case 'page': return `/${item.url}` // Assuming pages are at root
    default: return '#'
  }
}

const isActive = (item: any) => {
  const link = getLink(item)
  return route.path === link
}
</script>

<template>
  <nav :class="containerClass">
    <ul :class="listClass">
      <li v-for="item in items" :key="item._id" class="relative group"
        :class="{ 'has-children': item.children && item.children.length > 0 }">
        <NuxtLink :to="getLink(item)" :target="item.target" :class="[
          linkClass,
          item.cssClass,
          { 'active': isActive(item) }
        ]">
          <UIcon v-if="item.icon" :name="item.icon" class="mr-2" />
          {{ item.label }}
          <UIcon v-if="item.children && item.children.length > 0" name="i-lucide-chevron-down" class="ml-1 w-4 h-4" />
        </NuxtLink>

        <!-- Dropdown -->
        <div v-if="item.children && item.children.length > 0"
          class="absolute left-0 top-full hidden group-hover:block z-50 min-w-[200px] bg-white dark:bg-gray-800 shadow-lg rounded-lg py-2 border dark:border-gray-700">
          <ul class="flex flex-col">
            <li v-for="child in item.children" :key="child._id">
              <NuxtLink :to="getLink(child)" :target="child.target"
                class="block px-4 py-2 hover:bg-gray-100 dark:hover:bg-gray-700" :class="child.cssClass">
                <UIcon v-if="child.icon" :name="child.icon" class="mr-2" />
                {{ child.label }}
              </NuxtLink>
            </li>
          </ul>
        </div>
      </li>
    </ul>
  </nav>
</template>