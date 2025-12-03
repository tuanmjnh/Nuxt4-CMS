import { Post } from '../../models/Post'

export default defineEventHandler(async (event) => {
  try {
    await connectDB()

    // Get body parameters
    const body = await readBody(event)
    const limit = parseInt(body.limit as string) || 10
    const sort = body.sort as string || '-publishedAt'

    // Build filter
    const filter: any = { isDeleted: false }

    // Public users only see published posts
    const currentUser = event.context.user
    if (!currentUser) {
      filter.status = 'published'
      filter.publishedAt = { $lte: new Date() }
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

    if (body.author) {
      filter.author = body.author
    }

    // Search in title, content, excerpt
    if (body.search) {
      filter.$text = { $search: body.search }
    }

    // Cursor pagination
    if (body.cursor) {
      const cursor = Number(body.cursor)
      if (sort === '-publishedAt') {
        filter.publishedAt = { $lt: cursor }
      } else if (sort === 'publishedAt') {
        filter.publishedAt = { $gt: cursor }
      } else {
        // Fallback to createdAt for other sorts or default
        filter.createdAt = { $lt: cursor }
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
