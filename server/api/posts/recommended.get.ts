import { Post } from '../../models/Post'

export default defineEventHandler(async (event) => {
  try {
    await connectDB()

    const query = getQuery(event)
    const postId = query.postId as string
    const limit = parseInt(query.limit as string) || 5

    let filter: any = {
      status: 'published',
      publishedAt: { $lte: new Date() }
    }

    // Exclude current post if provided
    if (postId) {
      filter._id = { $ne: postId }

      // Get current post to find related posts
      const currentPost = await Post.findById(postId).select('categories tags')

      if (currentPost) {
        // Find posts with same categories or tags
        filter.$or = [
          { categories: { $in: currentPost.categories } },
          { tags: { $in: currentPost.tags } }
        ]
      }
    }

    // Get recommended posts sorted by views and likes
    const posts = await Post.find(filter)
      .populate('author', 'name avatar')
      .populate('categories', 'name slug')
      .populate('tags', 'name slug color')
      .sort({ views: -1, likes: -1, publishedAt: -1 })
      .limit(limit)
      .lean()

    return { success: true, data: posts }
  } catch (error: any) {
    if (error.statusCode) throw error
    throw createError({ statusCode: 500, statusMessage: 'error.server_error', message: error.message })
  }
})
