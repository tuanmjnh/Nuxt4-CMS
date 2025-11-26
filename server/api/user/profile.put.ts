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

    const body = await readBody(event)
    const { name, email, bio, avatar } = body

    // Connect to database
    await connectDB()

    // Get current user
    const user = await User.findById(currentUser.userId)

    if (!user || !user.isActive) {
      throw createError({
        statusCode: 404,
        message: 'User not found or inactive'
      })
    }

    // Check if email is being changed and if it's already taken
    if (email && email !== user.email) {
      const existingUser = await User.findOne({ email })
      if (existingUser) {
        throw createError({
          statusCode: 400,
          message: 'Email already in use'
        })
      }
      user.email = email
    }

    // Update user fields
    if (name) user.name = name
    if (bio !== undefined) user.bio = bio
    if (avatar !== undefined) user.avatar = avatar

    await user.save()

    // Return updated user without password
    const updatedUser = await User.findById(user._id)
      .select('-password')
      .populate({
        path: 'role',
        populate: {
          path: 'allowedRoutes',
          options: { sort: { sortOrder: 1 } }
        }
      })

    if (!updatedUser) {
      throw createError({
        statusCode: 500,
        message: 'Failed to retrieve updated user'
      })
    }

    return {
      success: true,
      data: {
        user: {
          id: updatedUser._id,
          username: updatedUser.username,
          email: updatedUser.email,
          name: updatedUser.name,
          role: updatedUser.role,
          avatar: updatedUser.avatar,
          bio: updatedUser.bio
        }
      }
    }
  } catch (error) {
    throw error
  }
})
