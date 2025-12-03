import { Post } from '../../models/Post'

export default defineEventHandler(async (event) => {
  try {
    await connectDB()

    const id = getRouterParam(event, 'id')

    if (!id) throw createError({ statusCode: 400, message: 'Post ID is required', statusMessage: 'error.validation' })

    // Build filter - try both _id and slug
    const filter: any = { isDeleted: false }
    if (id.match(/^[0-9a-fA-F]{24}$/)) {
      filter._id = id
    } else {
      filter.slug = id
    }

    // Public users only see published posts
    const currentUser = event.context.user
    if (!currentUser) {
      filter.status = 'published'
      filter.publishedAt = { $lte: new Date() }
    }

    // Get post
    const post = await Post.findOne(filter)
      .populate('author', 'name email avatar bio')
      .populate('categories', 'name slug description')
      .populate('tags', 'name slug color')
      .lean()

    if (!post) throw createError({ statusCode: 404, message: 'Post not found', statusMessage: 'error.not_found' })

    // Increment view count (only for public views)
    if (!currentUser) {
      const postData = post as any
      await Post.findByIdAndUpdate(postData._id, { $inc: { views: 1 } })
    }

    return { success: true, data: post }
  } catch (error: any) {
    if (error.statusCode) throw error
    throw createError({ statusCode: 500, statusMessage: 'error.server_error', message: error.message })
  }
})
