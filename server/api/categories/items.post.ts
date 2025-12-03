import { Category } from '../../models/Category'

export default defineEventHandler(async (event) => {
  try {
    await connectDB()

    const body = await readBody(event)

    const filter: any = { isDeleted: false }
    if (body.type) filter.type = body.type

    if (body.tags) {
      const tagList = Array.isArray(body.tags) ? body.tags : [body.tags]
      if (tagList.length > 0) filter.tags = { $in: tagList }
    }

    if (body.keywords) {
      const keywordList = Array.isArray(body.keywords) ? body.keywords : [body.keywords]
      if (keywordList.length > 0) filter.keywords = { $in: keywordList }
    }

    const categories = await Category.find(filter)
      .populate('parent', 'name slug')
      .sort({ name: 1 })
      .lean()

    return { success: true, data: categories }
  } catch (error: any) {
    if (error.statusCode) throw error
    throw createError({ statusCode: 500, message: error.message, statusMessage: 'error.server_error' })
  }
})
