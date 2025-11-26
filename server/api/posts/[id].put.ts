import { z } from 'zod'
import { Post } from '../../models/Post'

const localizedString = z.object({
  en: z.string().min(1).optional(),
  vi: z.string().min(1).optional()
})

const updatePostSchema = z.object({
  title: localizedString.optional(),
  slug: z.string().optional(),
  content: localizedString.optional(),
  excerpt: localizedString.optional(),
  featuredImage: z.string().optional(),
  categories: z.array(z.string()).optional(),
  tags: z.array(z.string()).optional(),
  status: z.enum(['draft', 'published', 'scheduled', 'archived']).optional(),
  metaTitle: z.string().optional(),
  metaDescription: z.string().optional(),
  keywords: z.array(z.string()).optional(),
  ogImage: z.string().optional(),
  publishedAt: z.string().optional(),
  scheduledAt: z.string().optional()
})

export default defineEventHandler(async (event) => {
  try {
    await connectDB()

    const id = getRouterParam(event, 'id')

    if (!id) {
      throw createError({
        statusCode: 400,
        message: 'Post ID is required'
      })
    }

    // Check authentication
    const currentUser = event.context.user
    if (!currentUser) {
      throw createError({
        statusCode: 401,
        message: 'Authentication required'
      })
    }

    // Get existing post
    const existingPost = await Post.findById(id)

    if (!existingPost) {
      throw createError({
        statusCode: 404,
        message: 'Post not found'
      })
    }

    // Check authorization (admin, or author of the post)
    if (currentUser.role !== 'admin' && existingPost.author.toString() !== currentUser.userId) {
      throw createError({
        statusCode: 403,
        message: 'Not authorized to update this post'
      })
    }

    // Parse and validate request body
    const body = await readBody(event)
    const data = updatePostSchema.parse(body)

    // Handle status change to published
    if (data.status === 'published' && existingPost.status !== 'published') {
      data.publishedAt = new Date().toISOString()
    }

    // Update post
    const post = await Post.findByIdAndUpdate(
      id,
      { $set: data },
      { new: true }
    )
      .populate('author', 'name email avatar')
      .populate('categories', 'name slug')
      .populate('tags', 'name slug color')

    return {
      success: true,
      data: { post }
    }
  } catch (error: any) {
    if (error.name === 'ZodError') {
      throw createError({
        statusCode: 400,
        message: 'Validation error',
        data: error.errors
      })
    }
    if (error.statusCode) throw error
    throw createError({
      statusCode: 500,
      message: 'Failed to update post'
    })
  }
})
