import { UserSession } from '../../../models/UserSession'

export default defineEventHandler(async (event) => {
  const userId = event.context.params?.id

  // Check admin permission
  const currentUser = event.context.user
  if (!currentUser || (currentUser.role.name !== 'admin' && currentUser.role !== 'admin')) {
    throw createError({ statusCode: 403, message: 'Access denied' })
  }

  await connectDB()
  const body = await readBody(event)
  const { sessionId } = body

  if (sessionId) {
    await UserSession.deleteOne({ _id: sessionId, user: userId })
  }

  return { success: true }
})
