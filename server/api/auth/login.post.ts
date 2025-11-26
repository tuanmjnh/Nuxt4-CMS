import { z } from 'zod'
import { User } from '../../models/User'
import { UserSession } from '../../models/UserSession'

const loginSchema = z.object({
  usernameOrEmail: z.string().min(1, 'Username or Email is required'),
  password: z.string().min(6, 'Password must be at least 6 characters')
})

export default defineEventHandler(async (event) => {
  try {
    // Connect to database
    await connectDB()

    // Parse and validate request body
    const body = await readBody(event)
    const { usernameOrEmail, password, deviceType = 'web' } = loginSchema.extend({
      deviceType: z.enum(['pc', 'mobile', 'tablet', 'web']).optional()
    }).parse(body)

    // Find user by email or username
    const user = await User.findOne({
      $or: [
        { email: usernameOrEmail.toLowerCase() },
        { username: usernameOrEmail.toLowerCase() }
      ],
      isActive: true
    }).populate({
      path: 'role',
      populate: {
        path: 'allowedRoutes',
        options: { sort: { sortOrder: 1 } }
      }
    })

    if (!user) {
      throw createError({
        statusCode: 401,
        message: 'Invalid email or password'
      })
    }

    // Verify password
    const isPasswordValid = await user.comparePassword(password)

    if (!isPasswordValid) {
      throw createError({
        statusCode: 401,
        message: 'Invalid email or password'
      })
    }

    // Generate tokens
    const payload = {
      userId: user._id.toString(),
      email: user.email,
      username: user.username,
      role: user.role,
      deviceType
    }

    const accessToken = generateAccessToken(payload)
    const refreshToken = generateRefreshToken(payload)

    // Create User Session
    await UserSession.create({
      user: user._id,
      refreshToken,
      deviceType,
      userAgent: getRequestHeader(event, 'user-agent'),
      ip: getRequestIP(event),
      expiresAt: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000) // 7 days
    })

    // Return user data and tokens
    return {
      success: true,
      data: {
        user: {
          id: user._id,
          email: user.email,
          username: user.username,
          name: user.name,
          role: user.role,
          avatar: user.avatar
        },
        accessToken,
        refreshToken
      }
    }
  } catch (error: any) {
    if (error.name === 'ZodError') {
      throw createError({
        statusCode: 400,
        message: 'Validation error',
        data: error.errors
      })
    }
    throw error
  }
})
