import { UserSession } from '../../models/UserSession'

export default defineEventHandler(async (event) => {
  const currentUser = event.context.user
  if (!currentUser) {
    throw createError({ statusCode: 401, message: 'Not authenticated' })
  }

  await connectDB()

  const sessions = await UserSession.find({ user: currentUser.userId }).sort({ lastActiveAt: -1 })

  return {
    success: true,
    data: sessions
  }
})
