import { H3Event } from 'h3'
import { User } from '../models/User'
import { Role } from '../models/Role'

// Helper to check permission
function hasPermission(path: string, permissions: string[]): boolean {
  return permissions.some(permission => {
    // Simple wildcard matching
    // If permission ends with *, it matches any path starting with the prefix
    if (permission === '*') return true
    if (permission.endsWith('*')) {
      const prefix = permission.slice(0, -1)
      return path.startsWith(prefix)
    }
    return path === permission
  })
}

export default defineEventHandler(async (event: H3Event) => {
  // Only check auth for API routes
  if (!event.path.startsWith('/api')) {
    return
  }

  // Extract token from Authorization header
  const authHeader = getHeader(event, 'authorization')
  const token = extractTokenFromHeader(authHeader)

  if (token) {
    const payload = verifyAccessToken(token)
    if (payload) {
      // Fetch full user with role
      // We need to connect to DB first? Middleware runs before API handlers which usually connect DB.
      // But we might need to ensure DB connection here if it's not established.
      // Assuming connectDB() is a global util or we need to import it.
      // In Nuxt server, utils are auto-imported.
      await connectDB()

      const user = await User.findById(payload.userId).populate('role')
      if (user && user.isActive) {
        event.context.user = {
          ...payload,
          role: user.role // This is now the populated Role document
        }
      }
    }
  }

  // Skip strict auth check for public routes
  const publicRoutes = [
    '/api/auth/login',
    '/api/auth/register',
    '/api/auth/refresh',
    '/api/auth/logout',
    '/api/posts', // Public GET is handled by method check below or inside handler
    '/api/categories',
    '/api/tags',
    '/api/menus/position',
    '/api/seed',
    '/api/_nuxt_icon'
  ]

  const path = event.path || ''

  // Check if route is public
  const isPublicRoute = publicRoutes.some(route => path.startsWith(route))

  // Specific check for GET requests on posts which are public
  const isPublicGet = path.startsWith('/api/posts') && event.method === 'GET'

  if (isPublicRoute || isPublicGet) {
    return
  }

  // If not public and no valid user, throw error
  if (!event.context.user)
    throw createError({ statusCode: 401, statusMessage: 'error.unauthorized', message: 'Authentication required' })

  // Check RBAC Permissions
  const userRole = event.context.user.role
  // If role is missing or not populated correctly (shouldn't happen if user exists), deny
  if (!userRole || !userRole.permissions)
    throw createError({ statusCode: 403, message: 'Access denied: No role assigned', statusMessage: 'error.access_denied' })

  // Check if user has permission for this path
  if (!hasPermission(path, userRole.permissions))
    throw createError({ statusCode: 403, message: 'Access denied: Insufficient permissions', statusMessage: 'error.access_denied' })
})
