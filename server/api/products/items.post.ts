import { Product } from '../../models/Product'

export default defineEventHandler(async (event) => {
  try {
    await connectDB()

    // Get body parameters
    const body = await readBody(event)
    const limit = parseInt(body.limit as string) || 10
    const sort = body.sort as string || '-createdAt'
    // Build filter
    const filter: any = { isDeleted: false }

    // Public users only see published products
    const currentUser = event.context.user
    if (!currentUser) {
      filter.status = 'published'
    } else if (body.status) {
      filter.status = body.status
    }

    if (body.categories) {
      const categories = Array.isArray(body.categories) ? body.categories : [body.categories]
      if (categories.length > 0) filter.categories = { $in: categories }
    }

    if (body.tags) {
      const tagList = Array.isArray(body.tags) ? body.tags : [body.tags]
      if (tagList.length > 0) filter.tags = { $in: tagList }
    }

    if (body.keywords) {
      const keywordList = Array.isArray(body.keywords) ? body.keywords : [body.keywords]
      if (keywordList.length > 0) filter.keywords = { $in: keywordList }
    }

    // Search in name, description
    if (body.search) {
      filter.$text = { $search: body.search }
    }

    // Cursor pagination
    if (body.cursor) {
      const cursor = Number(body.cursor)
      if (sort === '-createdAt') {
        filter.createdAt = { $lt: cursor }
      } else if (sort === 'createdAt') {
        filter.createdAt = { $gt: cursor }
      } else if (sort === '-price') {
        filter.price = { $lt: cursor }
      } else if (sort === 'price') {
        filter.price = { $gt: cursor }
      } else {
        // Fallback to createdAt
        filter.createdAt = { $lt: cursor }
      }
    }

    // Get products
    const products = await Product.find(filter)
      .populate('categories', 'name slug')
      .populate('tags', 'name slug')
      .sort(sort)
      .limit(limit)
      .lean()

    let nextCursor = null
    if (products.length === limit) {
      const lastProduct = products[products.length - 1]
      if (sort === '-createdAt' || sort === 'createdAt') {
        nextCursor = (lastProduct as any).createdAt
      } else if (sort === '-price' || sort === 'price') {
        nextCursor = (lastProduct as any).price
      } else {
        nextCursor = (lastProduct as any).createdAt
      }
    }

    return { success: true, data: products, nextCursor }
  } catch (error: any) {
    if (error.statusCode) throw error
    throw createError({ statusCode: 500, statusMessage: 'error.server_error', message: error.message })
  }
})
