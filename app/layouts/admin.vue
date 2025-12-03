<script setup lang="ts">
import type { DropdownMenuItem } from '@nuxt/ui'
import { sub } from 'date-fns'

const runtimeConfig = useRuntimeConfig()
const { user } = useAuth()
const route = useRoute()
const router = useRouter()
const { startLoading, stopLoading } = useLoading()
const isPageLoading = ref(false)

// Start loading when accessing admin layout
startLoading()

router.beforeEach((to, from, next) => {
  if (to.path !== from.path) {
    isPageLoading.value = true
  }
  next()
})

router.afterEach(() => {
  setTimeout(() => {
    isPageLoading.value = false
  }, 200)
})

onMounted(() => {
  // Stop loading when layout is mounted
  setTimeout(() => {
    stopLoading()
  }, 500)
})

// Check if route is active
const isActiveRoute = (routePath: string) => {
  return route.path === routePath || route.path.startsWith(routePath + '/')
}

// Fetch admin routes
const { data: adminRoutes } = await useAPI<{ success: boolean, data: Models.AdminRoute[] }>('/api/admin/routes', {
  key: 'admin-routes'
})

// Computed routes with hierarchy
const routes = computed(() => {
  if (!adminRoutes.value?.data || adminRoutes.value.data.length === 0) return []

  const allRoutes = adminRoutes.value.data

  // Filter visible routes and sort by sort
  const visibleRoutes = allRoutes
    .filter((r: any) => r.isVisible)
    .sort((a: any, b: any) => a.sort - b.sort)

  // Build hierarchy
  const parentRoutes = visibleRoutes.filter((r: any) => !r.parent)
  const childRoutes = visibleRoutes.filter((r: any) => r.parent)

  // Attach children to parents
  return parentRoutes.map((parent: any) => ({
    ...parent,
    children: childRoutes
      .filter((child: any) => {
        const parentId = typeof child.parent === 'string'
          ? child.parent
          : child.parent?._id
        return parentId === parent._id
      })
      .sort((a: any, b: any) => a.sort - b.sort)
  }))
})

// Map routes to NavigationMenu items
const mapRouteToItem = (route: any): any => {
  return {
    label: route.name,
    icon: route.icon || 'i-lucide-circle',
    to: route.children?.length ? undefined : route.path,
    children: route.children?.length ? route.children.map(mapRouteToItem) : undefined,
    defaultOpen: isActiveRoute(route.path)
  }
}

const items = computed(() => routes.value.map(mapRouteToItem))

// Breadcrumbs
const breadcrumbItems = computed(() => {
  const pathSegments = route.path.split('/').filter(segment => segment !== '')
  const items = [{ label: $t('common.home'), to: '/' }]

  let currentPath = ''
  for (const segment of pathSegments) {
    currentPath += `/${segment}`
    const routeName = segment.charAt(0).toUpperCase() + segment.slice(1) // Simple capitalization
    items.push({ label: routeName, to: currentPath })
  }
  return items
})

const open = ref(false)

const groups = computed(() => [{
  id: 'links',
  label: 'Navigation',
  items: items.value.flatMap((item: any) => [
    { ...item, to: item.to, onSelect: () => { open.value = false } },
    ...(item.children || []).map((child: any) => ({ ...child, to: child.to, onSelect: () => { open.value = false } }))
  ])
}])

//
const { isNotificationsSlideoverOpen } = useDashboard()
const notifications = [[{
  label: 'New mail',
  icon: 'i-lucide-send',
  to: '/inbox'
}, {
  label: 'New customer',
  icon: 'i-lucide-user-plus',
  to: '/customers'
}]] satisfies DropdownMenuItem[][]

const range = shallowRef<RangeType>({
  start: sub(new Date(), { days: 14 }),
  end: new Date()
})
const period = ref<PeriodType>('daily')
</script>

<template>
  <UDashboardGroup>
    <UDashboardSidebar v-model:open="open" collapsible resizable class="bg-gray-50/50 dark:bg-gray-950/50">
      <template #header="{ collapsed }">
        <TeamsMenu :collapsed="collapsed" :title="$t('admin.title')" :icon="runtimeConfig.public.siteIcon" />
      </template>

      <template #default="{ collapsed }">
        <UDashboardSearchButton :collapsed="collapsed" />

        <UNavigationMenu :collapsed="collapsed" :items="items" orientation="vertical" />
      </template>

      <template #footer="{ collapsed }">
        <UserMenu :collapsed="collapsed" />
      </template>
    </UDashboardSidebar>

    <UDashboardSearch :groups="groups" />

    <UDashboardPanel>
      <template #header>
        <!-- <div class="hidden md:block">
          Sidebar cho PC
        </div>

        <div class="block md:hidden">
          Menu Hamburger cho Mobile
        </div> -->
        <!-- <ClientOnly>
          {{ deviceType }}
        </ClientOnly> -->
        <UDashboardNavbar :title="$t('admin.title')">
          <template #left>
            <UBreadcrumb :items="breadcrumbItems" />
          </template>
          <template #right>

            <UTooltip text="Notifications" :shortcuts="['N']">
              <UButton color="neutral" variant="ghost" square @click="isNotificationsSlideoverOpen = true">
                <UChip color="error" inset>
                  <UIcon name="i-lucide-bell" class="size-5 shrink-0" />
                </UChip>
              </UButton>
            </UTooltip>

            <!-- <UDropdownMenu :items="notifications">
              <UButton icon="i-lucide-plus" size="md" class="rounded-full" />
            </UDropdownMenu> -->
            <ThemeCustomizer />
            <UserMenu />
          </template>
        </UDashboardNavbar>
      </template>
      <template #body>
        <div v-if="isPageLoading" class="h-full flex items-center justify-center min-h-[200px]">
          <UIcon name="i-lucide-loader-2" class="w-8 h-8 animate-spin text-primary-500" />
        </div>
        <div v-else>
          <slot />
        </div>
      </template>
    </UDashboardPanel>

    <NotificationsSlideover />
  </UDashboardGroup>
</template>