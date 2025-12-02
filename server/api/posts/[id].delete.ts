import { Post } from '../../models/Post'

export default defineEventHandler(async (event) => {
  try {
    await connectDB()

    const id = getRouterParam(event, 'id')

    if (!id) throw createError({ statusCode: 400, message: 'Post ID is required', statusMessage: 'error.validation' })

    // Check authentication
    const currentUser = event.context.user
    if (!currentUser) throw createError({ statusCode: 401, message: 'Authentication required', statusMessage: 'error.unauthorized' })

    // Get existing post
    const existingPost = await Post.findById(id)

    if (!existingPost) throw createError({ statusCode: 404, message: 'Post not found', statusMessage: 'error.not_found' })

    // Check authorization (admin, or author of the post)
    if (currentUser.role !== 'admin' && existingPost.author.toString() !== currentUser.userId)
      throw createError({ statusCode: 403, message: 'Not authorized to delete this post', statusMessage: 'error.unauthorized' })

    // Soft delete post
    await Post.findByIdAndUpdate(id, {
      isDeleted: true,
      deletedAt: new Date()
    })

    return {
      success: true,
      message: 'Post deleted successfully'
    }
  } catch (error: any) {
    if (error.statusCode) throw error
    throw createError({ statusCode: 500, statusMessage: 'error.server_error', message: error.message })
  }
})
