import { User } from '../../models/User'
import { UserSession } from '../../models/UserSession'

export default defineEventHandler(async (event) => {
  try {
    const body = await readBody(event)
    const { refreshToken } = body

    if (!refreshToken) {
      throw createError({
        statusCode: 400,
        message: 'Refresh token is required'
      })
    }

    // Verify refresh token
    const payload = verifyRefreshToken(refreshToken)

    if (!payload) {
      throw createError({
        statusCode: 401,
        message: 'Invalid or expired refresh token'
      })
    }

    // Connect to database
    await connectDB()

    // Verify session exists and matches token
    const session = await UserSession.findOne({
      refreshToken,
      user: payload.userId
    })

    if (!session) {
      throw createError({
        statusCode: 401,
        message: 'Invalid session'
      })
    }

    // Update session activity
    session.lastActiveAt = new Date()
    await session.save()

    // Verify user still exists and is active
    const user = await User.findById(payload.userId)

    if (!user || !user.isActive) {
      throw createError({
        statusCode: 401,
        message: 'User not found or inactive'
      })
    }

    // Generate new access token
    const newPayload = {
      userId: user._id.toString(),
      email: user.email,
      username: user.username,
      role: user.role.toString(),
      deviceType: session.deviceType
    }

    const accessToken = generateAccessToken(newPayload)

    return {
      success: true,
      data: {
        accessToken
      }
    }
  } catch (error) {
    throw error
  }
})
