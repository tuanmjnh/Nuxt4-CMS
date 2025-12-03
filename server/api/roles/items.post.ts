import { Role } from '../../models/Role'

export default defineEventHandler(async (event) => {
  try {
    await connectDB()

    const body = await readBody(event)
    const limit = parseInt(body.limit as string) || 20
    const sort = body.sort as string || '-createdAt'

    const filter: any = {}
    if (body.search) {
      filter.$text = { $search: body.search }
    }

    if (body.cursor) {
      const cursor = Number(body.cursor)
      if (sort === '-createdAt') {
        filter.createdAt = { $lt: cursor }
      } else if (sort === 'createdAt') {
        filter.createdAt = { $gt: cursor }
      } else {
        filter.createdAt = { $lt: cursor }
      }
    }

    const roles = await Role.find(filter)
      .sort(sort)
      .limit(limit)
      .lean()

    let nextCursor = null
    if (roles.length === limit) {
      const lastRole = roles[roles.length - 1]
      nextCursor = (lastRole as any).createdAt
    }

    return {
      success: true,
      data: roles,
      nextCursor
    }
  } catch (error: any) {
    if (error.statusCode) throw error
    throw createError({ statusCode: 500, statusMessage: 'error.server_error', message: error.message })
  }
})
