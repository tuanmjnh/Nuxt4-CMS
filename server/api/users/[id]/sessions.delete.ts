import { UserSession } from '../../../models/UserSession'

export default defineEventHandler(async (event) => {
  try {
    const userId = event.context.params?.id

    // Check admin permission
    const currentUser = event.context.user
    if (!currentUser || !currentUser.roles.some((r: any) => (r.name === 'admin' || r === 'admin'))) {
      throw createError({ statusCode: 403, message: 'Access denied', statusMessage: 'error.unauthorized' })
    }

    await connectDB()
    const body = await readBody(event)
    const { sessionId } = body

    if (sessionId) {
      await UserSession.deleteOne({ _id: sessionId, user: userId })
    }

    return { success: true }
  } catch (error: any) {
    // throw createError({ statusCode: 500, message: error.message, statusMessage: 'error.server_error' })
    return { success: true }
  }
})
