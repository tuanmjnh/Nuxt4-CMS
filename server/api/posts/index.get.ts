import { Post } from '../../models/Post'

export default defineEventHandler(async (event) => {
  try {
    await connectDB()

    // Get query parameters
    const query = getQuery(event)
    const page = parseInt(query.page as string) || 1
    const limit = parseInt(query.limit as string) || 10
    const status = query.status as string
    const category = query.category as string
    const tag = query.tag as string
    const author = query.author as string
    const search = query.search as string
    const sort = query.sort as string || '-publishedAt'

    // Build filter
    const filter: any = { isDeleted: false }

    // Public users only see published posts
    const currentUser = event.context.user
    if (!currentUser) {
      filter.status = 'published'
      filter.publishedAt = { $lte: new Date() }
    } else if (status) {
      filter.status = status
    }

    if (category) {
      filter.categories = category
    }

    if (tag) {
      filter.tags = tag
    }

    if (author) {
      filter.author = author
    }

    // Search in title, content, excerpt
    if (search) {
      filter.$text = { $search: search }
    }

    // Calculate skip
    const skip = (page - 1) * limit

    // Get posts
    const posts = await Post.find(filter)
      .populate('author', 'name email avatar')
      .populate('categories', 'name slug')
      .populate('tags', 'name slug color')
      .sort(sort)
      .skip(skip)
      .limit(limit)
      .lean()

    // Get total count
    const total = await Post.countDocuments(filter)

    return {
      success: true,
      data: {
        posts,
        pagination: {
          page,
          limit,
          total,
          totalPages: Math.ceil(total / limit)
        }
      }
    }
  } catch (error: any) {
    if (error.statusCode) throw error
    throw createError({ statusCode: 500, statusMessage: 'error.server_error', message: error.message })
  }
})
