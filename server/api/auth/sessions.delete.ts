import { UserSession } from '../../models/UserSession'

export default defineEventHandler(async (event) => {
  try {
    const currentUser = event.context.user
    if (!currentUser)
      throw createError({ statusCode: 401, message: 'Not authenticated', statusMessage: 'error.unauthorized' })

    await connectDB()
    const body = await readBody(event)
    const { sessionId } = body

    if (sessionId)
      await UserSession.deleteOne({ _id: sessionId, user: currentUser.userId })

    return { success: true, message: 'Session deleted successfully' }
  } catch (error: any) {
    return { success: true, message: 'Session deleted successfully' }
  }
})
