<script setup lang="ts">
import { sub } from 'date-fns'
import type { DropdownMenuItem } from '@nuxt/ui'
const { user } = useAuth()
const route = useRoute()
// Computed routes with hierarchy
const routes = computed(() => {
  if (!user.value?.role?.allowedRoutes) return []

  const allRoutes = user.value.role.allowedRoutes as Models.AdminRoute[]

  // Filter visible routes and sort by sortOrder
  const visibleRoutes = allRoutes
    .filter(r => r.isVisible)
    .sort((a, b) => a.sortOrder - b.sortOrder)

  // Build hierarchy
  const parentRoutes = visibleRoutes.filter(r => !r.parent)
  const childRoutes = visibleRoutes.filter(r => r.parent)

  // Attach children to parents
  return parentRoutes.map(parent => ({
    ...parent,
    children: childRoutes
      .filter(child => {
        const parentId = typeof child.parent === 'string'
          ? child.parent
          : child.parent?._id
        return parentId === parent._id
      })
      .sort((a, b) => a.sortOrder - b.sortOrder)
  }))
})

// Check if route is active
const isActiveRoute = (routePath: string) => {
  return route.path === routePath || route.path.startsWith(routePath + '/')
}

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
  const items = [{ label: 'Home', to: '/' }]

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
  items: items.value.flatMap(item => [
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
        <TeamsMenu :collapsed="collapsed" />
      </template>

      <template #default="{ collapsed }">
        <UDashboardSearchButton :collapsed="collapsed" />

        <UNavigationMenu :collapsed="collapsed" :items="items" orientation="vertical" class="-mx-2.5" />
      </template>

      <template #footer="{ collapsed }">
        <UserMenu :collapsed="collapsed" />
      </template>
    </UDashboardSidebar>

    <UDashboardSearch :groups="groups" />

    <UDashboardPanel>
      <template #header>
        <UDashboardNavbar title="Admin">
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

            <UDropdownMenu :items="notifications">
              <UButton icon="i-lucide-plus" size="md" class="rounded-full" />
            </UDropdownMenu>
          </template>
        </UDashboardNavbar>
      </template>
      <template #body>
        <slot />
      </template>
    </UDashboardPanel>

    <NotificationsSlideover />
  </UDashboardGroup>
</template>