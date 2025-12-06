import { z } from 'zod'
import { User } from '../../models/User'
import { UserSession } from '../../models/UserSession'
import { SystemRoute } from '../../models/SystemRoute'

const loginSchema = z.object({
  usernameOrEmail: z.string().min(1, 'Username or Email is required'),
  password: z.string().min(6, 'Password must be at least 6 characters'),
  deviceId: z.string().min(1, 'Device ID is required')
})

export default defineEventHandler(async (event) => {
  try {
    // Connect to database
    await connectDB()

    // Parse and validate request body
    const body = await readBody(event)
    const { usernameOrEmail, password, deviceType = 'web', deviceId } = loginSchema.extend({
      deviceType: z.enum(['pc', 'mobile', 'tablet', 'web']).optional()
    }).parse(body)

    // Find user by email or username
    const user = await User.findOne({
      $or: [
        { email: usernameOrEmail.toLowerCase() },
        { username: usernameOrEmail.toLowerCase() }
      ],
      isActive: true
    }).populate('roles')

    if (!user)
      throw createError({ statusCode: 401, message: 'Invalid email or password', statusMessage: 'error.invalid_credentials' })


    // Verify password
    const isPasswordValid = await user.comparePassword(password)

    if (!isPasswordValid)
      throw createError({ statusCode: 401, message: 'Invalid email or password', statusMessage: 'error.invalid_credentials' })

    // Resolve permissions from Roles -> SystemRoutes -> API
    const BasePermissions = [
      '/api/auth/*',
      '/api/routes',
      '/api/menus/position/*'
    ]

    const roleRoutesPaths = [...new Set(user.roles.flatMap((role: any) => role.permissions))]
    let resolvedPermissions: string[] = []

    // Check for Super Admin
    if (roleRoutesPaths.includes('*')) {
      resolvedPermissions = ['*']
    } else {
      // Find SystemRoutes matching the role paths
      const matchedRoutes = await SystemRoute.find({
        path: { $in: roleRoutesPaths }
      }).select('permissions').lean() as { permissions?: string[] }[]

      const routePermissions = matchedRoutes
        .flatMap((r) => r.permissions || [])
        .filter(Boolean)

      resolvedPermissions = [...BasePermissions, ...routePermissions]
    }

    // Generate tokens
    const payload: JWTPayload = {
      userId: user._id.toString(),
      email: user.email,
      username: user.username,
      roles: user.roles.map((role: any) => role._id.toString()),
      permissions: [...new Set(resolvedPermissions)],
      deviceType
    }

    const accessToken = generateAccessToken(payload)
    const refreshToken = generateRefreshToken(payload)

    // Create User Session
    // Find existing session or create new one
    let session = await UserSession.findOne({ user: user._id, deviceId })

    if (session) {
      session.refreshToken = refreshToken
      session.deviceType = deviceType
      session.userAgent = getRequestHeader(event, 'user-agent')
      session.ip = getRequestIP(event)
      session.lastActiveAt = Date.now()
      session.expiresAt = Date.now() + 7 * 24 * 60 * 60 * 1000
      await session.save()
    } else {
      await UserSession.create({
        user: user._id,
        refreshToken,
        deviceId,
        deviceType,
        userAgent: getRequestHeader(event, 'user-agent'),
        ip: getRequestIP(event),
        expiresAt: Date.now() + 7 * 24 * 60 * 60 * 1000 // 7 days
      })
    }

    // Return user data and tokens
    return {
      success: true,
      data: {
        user: {
          id: user._id,
          email: user.email,
          username: user.username,
          name: user.name,
          roles: user.roles,
          avatar: user.avatar
        },
        accessToken,
        refreshToken
      }
    }
  } catch (error: any) {
    if (error.name === 'ZodError')
      throw createError({ statusCode: 400, message: 'Validation error', statusMessage: 'error.validation', data: error.errors })
    if (error.statusCode) throw error
    throw createError({ statusCode: 500, message: error.message, statusMessage: 'error.server_error' })
  }
})
