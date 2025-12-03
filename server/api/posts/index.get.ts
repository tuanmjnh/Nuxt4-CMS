import { Post } from '../../models/Post'

export default defineEventHandler(async (event) => {
  try {
    await connectDB()

    // Get query parameters
    const query = getQuery(event)
    const limit = parseInt(query.limit as string) || 10
    const cursor = query.cursor as string
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

    // Cursor pagination
    if (cursor) {
      if (sort === '-publishedAt') {
        filter.publishedAt = { $lt: new Date(cursor) }
      } else if (sort === 'publishedAt') {
        filter.publishedAt = { $gt: new Date(cursor) }
      } else {
        // Fallback to createdAt for other sorts or default
        filter.createdAt = { $lt: new Date(cursor) }
      }
    }

    // Get posts
    const posts = await Post.find(filter)
      .populate('author', 'name email avatar')
      .populate('categories', 'name slug')
      .populate('tags', 'name slug color')
      .sort(sort)
      .limit(limit)
      .lean()

    let nextCursor = null
    if (posts.length === limit) {
      const lastPost = posts[posts.length - 1]
      if (sort === '-publishedAt' || sort === 'publishedAt') {
        nextCursor = lastPost.publishedAt
      } else {
        nextCursor = (lastPost as any).createdAt
      }
    }

    return { success: true, data: posts, nextCursor }
  } catch (error: any) {
    if (error.statusCode) throw error
    throw createError({ statusCode: 500, statusMessage: 'error.server_error', message: error.message })
  }
})
