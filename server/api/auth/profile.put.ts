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
    if (!currentUser) {
      throw createError({ statusCode: 401, message: 'Not authenticated' })
    }

    await connectDB()
    const body = await readBody(event)
    const data = profileSchema.parse(body)

    const user = await User.findById(currentUser.userId)
    if (!user) {
      throw createError({ statusCode: 404, message: 'User not found' })
    }

    // Update basic info
    if (data.name) user.name = data.name
    if (data.bio !== undefined) user.bio = data.bio
    if (data.avatar !== undefined) user.avatar = data.avatar

    // Update password if requested
    if (data.newPassword) {
      if (!data.currentPassword) {
        throw createError({ statusCode: 400, message: 'Current password is required to set a new password' })
      }
      const isMatch = await user.comparePassword(data.currentPassword)
      if (!isMatch) {
        throw createError({ statusCode: 400, message: 'Incorrect current password' })
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
          role: user.role,
          avatar: user.avatar,
          bio: user.bio
        }
      }
    }
  } catch (error: any) {
    if (error.name === 'ZodError') {
      throw createError({ statusCode: 400, message: 'Validation error', data: error.errors })
    }
    throw error
  }
})
