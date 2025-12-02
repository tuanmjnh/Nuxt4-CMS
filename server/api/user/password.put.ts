import { User } from '../../models/User'
import bcrypt from 'bcrypt'

export default defineEventHandler(async (event) => {
  try {
    // Get user from context (set by auth middleware)
    const currentUser = event.context.user

    if (!currentUser) throw createError({ statusCode: 401, message: 'Not authenticated', statusMessage: 'error.unauthorized' })

    const body = await readBody(event)
    const { currentPassword, newPassword } = body

    if (!currentPassword || !newPassword)
      throw createError({ statusCode: 400, message: 'Current password and new password are required', statusMessage: 'error.validation' })

    if (newPassword.length < 8)
      throw createError({ statusCode: 400, message: 'New password must be at least 8 characters', statusMessage: 'error.validation' })

    // Connect to database
    await connectDB()

    // Get current user with password
    const user = await User.findById(currentUser.userId).select('+password')

    if (!user || !user.isActive)
      throw createError({ statusCode: 404, message: 'User not found or inactive', statusMessage: 'error.not_found' })

    // Verify current password
    const isPasswordValid = await bcrypt.compare(currentPassword, user.password)
    if (!isPasswordValid)
      throw createError({ statusCode: 400, message: 'Current password is incorrect', statusMessage: 'error.validation' })

    // Hash new password
    const hashedPassword = await bcrypt.hash(newPassword, 10)
    user.password = hashedPassword

    await user.save()

    return {
      success: true,
      message: 'Password updated successfully'
    }
  } catch (error: any) {
    if (error.statusCode) throw error
    throw createError({ statusCode: 500, statusMessage: 'error.server_error', message: error.message })
  }
})
