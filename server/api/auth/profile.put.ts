import { z } from 'zod'
import { User } from '../../models/User'

const profileSchema = z.object({
  name: z.string().min(1).optional(),
  bio: z.string().optional(),
  avatar: z.any().optional(),
  currentPassword: z.string().min(6).optional(),
  newPassword: z.string().min(6).optional()
})

export default defineEventHandler(async (event) => {
  try {
    const currentUser = event.context.user
    if (!currentUser)
      throw createError({ statusCode: 401, message: 'Not authenticated', statusMessage: 'error.unauthorized' })

    await connectDB()
    const body = await readBody(event)
    const data = profileSchema.parse(body)

    const user = await User.findById(currentUser.userId)
    if (!user)
      throw createError({ statusCode: 404, message: 'User not found', statusMessage: 'error.user_not_found' })

    // Update basic info
    if (data.name) user.name = data.name
    if (data.bio !== undefined) user.bio = data.bio
    if (data.avatar !== undefined) user.avatar = data.avatar

    // Update password if requested
    if (data.newPassword) {
      if (!data.currentPassword) {
        throw createError({ statusCode: 400, message: 'Current password is required to set a new password', statusMessage: 'error.current_password_required' })
      }
      const isMatch = await user.comparePassword(data.currentPassword)
      if (!isMatch) {
        throw createError({ statusCode: 400, message: 'Incorrect current password', statusMessage: 'error.incorrect_password' })
      }
      user.password = data.newPassword
    }

    await user.save()

    return {
      success: true,
      data: {
        user: {
          id: user._id,
          email: user.email,
          username: user.username,
          name: user.name,
          roles: user.roles,
          avatar: user.avatar,
          bio: user.bio
        }
      }
    }
  } catch (error: any) {
    if (error.name === 'ZodError')
      throw createError({ statusCode: 400, message: 'Validation error', statusMessage: 'error.validation', data: error.errors })
    if (error.statusCode) throw error
    throw createError({ statusCode: 500, message: error.message, statusMessage: 'error.server_error' })
  }
})
