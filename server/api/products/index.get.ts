import { Product } from '../../models/Product'

export default defineEventHandler(async (event) => {
  const query = getQuery(event)
  const page = Number(query.page) || 1
  const limit = Number(query.limit) || 10
  const search = query.search as string
  const status = query.status as string
  const category = query.category as string

  const filter: any = {}

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
    const skip = (page - 1) * limit

    const [products, total] = await Promise.all([
      Product.find(filter)
        .sort({ createdAt: -1 })
        .skip(skip)
        .limit(limit)
        .populate('categories', 'name slug')
        .populate('tags', 'name slug'),
      Product.countDocuments(filter)
    ])

    return {
      data: products,
      pagination: {
        page,
        limit,
        total,
        pages: Math.ceil(total / limit)
      }
    }
  } catch (error: any) {
    throw createError({
      statusCode: 500,
      message: error.message
    })
  }
})
