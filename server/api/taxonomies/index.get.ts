import { Taxonomy } from '../../models/Taxonomy'

export default defineEventHandler(async (event) => {
  try {
    await connectDB()

    const query = getQuery(event)
    const limit = parseInt(query.limit as string) || 20
    const page = parseInt(query.page as string) || 1
    const skip = (page - 1) * limit

    const filter: any = {}
    if (query.type) filter.type = query.type
    if (query.search) filter.$text = { $search: query.search }

    const [taxonomies, total] = await Promise.all([
      Taxonomy.find(filter)
        .sort({ createdAt: -1 })
        .skip(skip)
        .limit(limit)
        .lean(),
      Taxonomy.countDocuments(filter)
    ])

    return {
      success: true,
      data: taxonomies,
      pagination: {
        total,
        page,
        limit,
        pages: Math.ceil(total / limit)
      }
    }
  } catch (error: any) {
    if (error.statusCode) throw error
    throw createError({ statusCode: 500, statusMessage: 'error.server_error', message: error.message })
  }
})
