import { User } from '../../models/User'

export default defineEventHandler(async (event) => {
  try {
    // Get user from context (set by auth middleware)
    const currentUser = event.context.user

    if (!currentUser) throw createError({ statusCode: 401, message: 'Not authenticated', statusMessage: 'error.unauthorized' })

    // Connect to database
    await connectDB()

    // Get full user data
    const user = await User.findById(currentUser.userId)
      .select('-password')
      .populate('roles')

    if (!user || !user.isActive)
      throw createError({ statusCode: 404, message: 'User not found or inactive', statusMessage: 'error.not_found' })

    return {
      success: true,
      data: {
        user: {
          id: user._id,
          username: user.username,
          email: user.email,
          name: user.name,
          roles: user.roles,
          avatar: user.avatar,
          bio: user.bio
        }
      }
    }
  } catch (error: any) {
    if (error.statusCode) throw error
    throw createError({ statusCode: 500, statusMessage: 'error.server_error', message: error.message })
  }
})
