export default defineNuxtRouteMiddleware(async (to, from) => {
  const { user, token, fetchUser } = useAuth()

  if (!token.value) {
    return navigateTo('/admin/login')
  }

  if (!user.value) {
    await fetchUser()
  }

  if (!user.value) {
    return navigateTo('/admin/login')
  }

  // Fetch allowed routes from Server (Server Authority)
  const { routes: allowedRoutes, fetchRoutes } = useAdminNavigation()

  // Ensure routes are loaded
  if (allowedRoutes.value.length === 0) {
    await fetchRoutes()
  }

  const routes = allowedRoutes.value || []

  // Always check against allowed routes
  const targetPath = to.path

  // Find if current path is allowed
  // We match if the target path starts with any allowed route path
  // AND ensure it's a valid segment prefix (to avoid /admin/user matching /admin/users)
  const isAllowed = routes.some((route: any) => {
    // Exact match
    if (targetPath === route.path) return true
    // Parent match
    if (targetPath.startsWith(route.path + '/')) return true
    return false
  })

  if (!isAllowed) {
    // If trying to access a forbidden page, redirect to Dashboard or first allowed route
    // However, if Dashboard itself (/admin) is forbidden, we might have a problem.
    // Usually /admin is allowed.

    // Check if we are already at a fallback to avoid loops
    if (targetPath === '/admin') {
      // If even admin is not allowed (weird), logout or show error
      return // Let it pass to show 404 or empty page? Or abort?
    }

    // Try to redirect to /admin if allowed, else first allowed route
    const dashboardAllowed = routes.some((r: any) => r.path === '/admin')
    if (dashboardAllowed) {
      return navigateTo('/admin')
    }

    if (routes.length > 0 && routes[0]) {
      return navigateTo(routes[0].path)
    }

    // No routes allowed?
    return abortNavigation('Access Denied')
  }
})
