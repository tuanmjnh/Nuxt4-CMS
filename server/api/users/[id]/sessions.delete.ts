import { UserSession } from '../../../models/UserSession'

export default defineEventHandler(async (event) => {
  try {
    const userId = event.context.params?.id

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
