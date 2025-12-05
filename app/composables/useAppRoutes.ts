// composables/useAppRoutes.ts

export const useAppRoutes = () => {
  const router = useRouter()
  const { defaultLocale } = useI18n() // Get default locale (eg: 'vi')

  // Recursive function to clean the router tree
  const cleanRoutes = (routes: any[]) => {
    const uniqueRoutes = new Map()

    routes.forEach(route => {
      // 1. Ignore system routes or redirects without names
      if (!route.name) return

      // 2. Parse route names
      // i18n often uses '___' as a separator. Eg: 'admin-users___en'
      // If there is no '___', it is the root route (depending on strategy)
      const routeNameString = String(route.name)
      const separatorIndex = routeNameString.indexOf('___')

      // Get the name root (baseName). Eg: 'admin-users___vi' -> 'admin-users'
      const baseName = separatorIndex > -1
        ? routeNameString.substring(0, separatorIndex)
        : routeNameString

      // Get the locale of this route (if any)
      const routeLocale = separatorIndex > -1
        ? routeNameString.substring(separatorIndex + 3)
        : null

      // 3. FILTER LOGIC:
      // We only get 1 representative version for each page.
      // Prioritize the version that matches the defaultLocale (to make the path display best)
      // Or if it is not in the map, just get it temporarily.

      const isDefaultLocale = routeLocale === defaultLocale

      // If it is not in the list -> Add
      if (!uniqueRoutes.has(baseName)) {
        uniqueRoutes.set(baseName, {
          ...route,
          name: baseName, // Returns the clean name
          // Recursively process children if present
          children: route.children ? cleanRoutes(route.children) : []
        })
      }
      // If already present, but the current route MATCHES the defaultLocale
      // -> Override (to get the most standard root path, e.g. /admin instead of /en/admin)
      else if (isDefaultLocale) {
        uniqueRoutes.set(baseName, {
          ...route,
          name: baseName,
          children: route.children ? cleanRoutes(route.children) : []
        })
      }
    })

    return Array.from(uniqueRoutes.values())
  }
  // Call the function with the full list of routes from Nuxt
  const mainRoutes = computed(() => cleanRoutes(router.options.routes as any[]))

  return {
    mainRoutes
  }
}