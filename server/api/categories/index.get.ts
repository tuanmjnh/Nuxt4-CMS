import { Category } from '../../models/Category'

export default defineEventHandler(async (event) => {
  try {
    await connectDB()

    const query = getQuery(event)
    const type = query.type as string

    const filter: any = {}
    if (type) {
      filter.type = type
    }

    const categories = await Category.find(filter)
      .populate('parent', 'name slug')
      .sort({ name: 1 })
      .lean()

    return {
      success: true,
      data: { categories }
    }
  } catch (error) {
    throw createError({
      statusCode: 500,
      message: 'Failed to fetch categories'
    })
  }
})
