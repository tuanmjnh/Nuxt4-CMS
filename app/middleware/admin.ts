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

  // Check if user has admin access
  const userRoles = user.value.roles || []
  const hasAccess = userRoles.some((role: any) => {
    const name = typeof role === 'string' ? role : role.name
    return ['admin', 'editor', 'author'].includes(name)
  })

  if (!hasAccess) {
    return navigateTo('/')
  }

  // Check dynamic route permissions
  // Aggregate all allowed routes from all roles
  const allAllowedRoutes = userRoles.reduce((acc: any[], role: any) => {
    if (typeof role !== 'string' && role.allowedRoutes) {
      return [...acc, ...role.allowedRoutes]
    }
    return acc
  }, [])

  if (allAllowedRoutes.length > 0) {
    const targetPath = to.path
    // Always allow dashboard and profile/settings if needed
    if (targetPath === '/admin' || targetPath === '/admin/') return

    const hasPermission = allAllowedRoutes.some((route: any) =>
      targetPath.startsWith(route.path)
    )

    if (!hasPermission) {
      // Redirect to first allowed route or dashboard
      const firstRoute = allAllowedRoutes[0]
      return navigateTo(firstRoute ? firstRoute.path : '/admin')
    }
  }
})
