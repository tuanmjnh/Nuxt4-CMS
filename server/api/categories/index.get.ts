import { Category } from '../../models/Category'

export default defineEventHandler(async (event) => {
  try {
    await connectDB()

    const query = getQuery(event)
    const type = query.type as string

    const filter: any = { isDeleted: false }
    if (type)
      filter.type = type

    const categories = await Category.find(filter)
      .populate('parent', 'title slug')
      .sort({ 'title.en': 1 })
      .lean()

    return { success: true, data: categories }
  } catch (error: any) {
    if (error.statusCode) throw error
    throw createError({ statusCode: 500, message: error.message, statusMessage: 'error.server_error' })
  }
})
