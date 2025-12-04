import { UserSession } from '../../../models/UserSession'

export default defineEventHandler(async (event) => {
  try {
    const userId = event.context.params?.id

    await connectDB()

    const query = getQuery(event)
    const limit = Number(query.limit) || 10
    const cursor = query.cursor as string

    const dbQuery: any = { user: userId }

    if (cursor) dbQuery.lastActiveAt = { $lt: new Date(cursor) }

    const sessions = await UserSession.find(dbQuery)
      .sort({ lastActiveAt: -1 })
      .limit(limit)

    const nextCursor = sessions.length === limit ? sessions[sessions.length - 1].lastActiveAt : null

    return {
      success: true,
      data: sessions,
      nextCursor
    }
  } catch (error: any) {
    // throw createError({ statusCode: 500, message: error.message, statusMessage: 'error.server_error' })
    return { success: true }
  }
})
