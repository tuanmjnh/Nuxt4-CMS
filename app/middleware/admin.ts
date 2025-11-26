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
  const roleName = typeof user.value.role === 'string' ? user.value.role : user.value.role?.name
  if (!['admin', 'editor', 'author'].includes(roleName)) {
    return navigateTo('/')
  }

  // Check dynamic route permissions
  if (user.value.role?.allowedRoutes?.length) {
    const targetPath = to.path
    // Always allow dashboard and profile/settings if needed
    if (targetPath === '/admin' || targetPath === '/admin/') return

    const hasPermission = user.value.role.allowedRoutes.some((route: any) =>
      targetPath.startsWith(route.path)
    )

    if (!hasPermission) {
      // Redirect to first allowed route or dashboard
      const firstRoute = user.value.role.allowedRoutes[0]
      return navigateTo(firstRoute ? firstRoute.path : '/admin')
    }
  }
})
