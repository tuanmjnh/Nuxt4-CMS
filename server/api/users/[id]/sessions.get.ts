import { UserSession } from '../../../models/UserSession'

export default defineEventHandler(async (event) => {
  try {
    const userId = event.context.params?.id

    // Check admin permission
    const currentUser = event.context.user
    if (!currentUser || (currentUser.role.name !== 'admin' && currentUser.role !== 'admin')) {
      throw createError({ statusCode: 403, message: 'Access denied', statusMessage: 'error.unauthorized' })
    }

    await connectDB()

    const sessions = await UserSession.find({ user: userId }).sort({ lastActiveAt: -1 })

    return {
      success: true,
      data: sessions
    }
  } catch (error: any) {
    // throw createError({ statusCode: 500, message: error.message, statusMessage: 'error.server_error' })
    return { success: true }
  }
})
