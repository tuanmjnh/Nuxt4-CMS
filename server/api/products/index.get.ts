import { Product } from '../../models/Product'

export default defineEventHandler(async (event) => {
  const query = getQuery(event)
  const page = Number(query.page) || 1
  const limit = Number(query.limit) || 10
  const search = query.search as string
  const status = query.status as string
  const category = query.category as string

  const filter: any = { isDeleted: false }

  if (status) {
    filter.status = status
  }

  if (category) {
    filter.categories = category
  }

  if (search) {
    filter.$text = { $search: search }
  }

  try {
    const cursor = query.cursor as string

    if (cursor) {
      filter.createdAt = { $lt: new Date(cursor) }
    }

    const products = await Product.find(filter)
      .sort({ createdAt: -1 })
      .limit(limit)
      .populate('categories', 'name slug')
      .populate('tags', 'name slug')

    const nextCursor = products.length === limit ? (products[products.length - 1] as any).createdAt : null

    return { success: true, data: products, nextCursor }
  } catch (error: any) {
    if (error.statusCode) throw error
    throw createError({ statusCode: 500, statusMessage: 'error.server_error', message: error.message })
  }
})
