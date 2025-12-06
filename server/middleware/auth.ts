import { H3Event } from 'h3'
import { User } from '../models/User'
import { hasPermission } from '../utils/permissions'

export default defineEventHandler(async (event: H3Event) => {
  // 1. Ignore non-API requests 
  if (!event.path.startsWith('/api')) return

  const path = event.path || ''

  // 2. HARD PUBLIC ROUTES CHECK (Login/Register...) 
  // These routes DO NOT NEED to check token, nor do they NEED to check isActive 
  const strictlyPublicRoutes = [
    '/api/auth/login',
    '/api/auth/register',
    '/api/auth/refresh',
    '/api/seed',
    '/api/_nuxt_icon',
    '/api/icons'
  ]
  if (strictlyPublicRoutes.some(route => path.startsWith(route))) return

  // 3. TOKEN HANDLING AND CHECK ACTIVE
  const authHeader = getHeader(event, 'authorization')
  const token = extractTokenFromHeader(authHeader)

  // Default is not logged in
  event.context.user = null

  if (token) {
    try {
      const payload = verifyAccessToken(token)
      if (payload) {
        // --- IMPORTANT: CHECK ACTIVE STATUS ---

        // Connect DB if not yet (mongoose mechanism usually handles connection pooling,
        // but if you use serverless function then this line is needed)
        // await connectDB()

        // Optimum query: Only get _id and isActive. Use .lean() to return pure JS object (faster)
        const userStatus = await User.findById(payload.userId)
          .select('isActive roles') // Can get more roles if want to update permissions immediately
          .populate('roles')
          .lean()

        // Logic: There is a user in DB AND User is active
        if (userStatus && userStatus.isActive === true) {
          // Flatten permissions from all roles
          const permissions = userStatus.roles
            ? (userStatus.roles as any[]).flatMap((r: any) => r.permissions || [])
            : []
          // Unique permissions
          const uniquePermissions = [...new Set(permissions)]

          // Valid user -> Assign context
          // Tip: Combine payload (with available basic info) and latest data from DB (rights/active)
          event.context.user = {
            ...payload,
            // If you want the rights (roles/permissions) to always be the latest, get from DB and overwrite the payload
            // roles: userStatus.roles
            permissions: uniquePermissions,
            isActive: userStatus.isActive
          }
        } else {
          throw createError({ statusCode: 401, statusMessage: 'error.account_locked', message: 'Account inactive' })
          // Case: Token is in correct format, but User has been deleted or locked (isActive: false)
          // We leave event.context.user = null (like not logged in)
          // Let's wait a bit, the logic to check permissions will block.
        }
      }
    } catch (e) {
      // Token error/expired -> Consider as a guest (user = null)
      throw createError({ statusCode: 401, statusMessage: 'error.access_token_expired', message: 'Access token expired' })
    }
  }

  // 4. CHECK ACCESS RIGHTS (Authorization)

  // Route "Half-fat half-lean" (Optional Public)
  // Example: View post.
  // - If user active -> View as user (assigned above).
  // - If user is locked (user = null) -> View as guest.
  const isOptionalPublic =
    (path.startsWith('/api/posts') && event.method === 'GET') ||
    path.startsWith('/api/categories') ||
    path.startsWith('/api/tags') ||
    path.startsWith('/api/menus/position')

  if (isOptionalPublic) return

  // --- PRIVATE ROUTES --- 

  // If you come here without a user (because there is no token OR isActive: false) 
  if (!event.context.user)
    throw createError({ statusCode: 401, statusMessage: 'error.unauthorized', message: 'Authentication required' })

  // Check Permissions as before 
  const userPermissions = event.context.user.permissions || []
  const hasAccess = hasPermission(path, userPermissions)

  if (!hasAccess)
    throw createError({ statusCode: 403, message: 'Access denied', statusMessage: 'error.access_denied' })
})