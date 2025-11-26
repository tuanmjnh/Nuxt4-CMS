import { User } from '../../models/User'

export default defineEventHandler(async (event) => {
  try {
    // Get user from context (set by auth middleware)
    const currentUser = event.context.user

    if (!currentUser) {
      throw createError({
        statusCode: 401,
        message: 'Not authenticated'
      })
    }

    // Connect to database
    await connectDB()

    // Get full user data
    const user = await User.findById(currentUser.userId)
      .select('-password')
      .populate({
        path: 'role',
        populate: {
          path: 'allowedRoutes',
          options: { sort: { sortOrder: 1 } }
        }
      })

    if (!user || !user.isActive) {
      throw createError({
        statusCode: 404,
        message: 'User not found or inactive'
      })
    }

    return {
      success: true,
      data: {
        user: {
          id: user._id,
          username: user.username,
          email: user.email,
          name: user.name,
          role: user.role,
          avatar: user.avatar,
          bio: user.bio
        }
      }
    }
  } catch (error) {
    throw error
  }
})
