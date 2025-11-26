import { z } from 'zod'
import { Post } from '../../models/Post'

const localizedString = z.object({
  en: z.string().min(1, 'English content is required'),
  vi: z.string().min(1, 'Vietnamese content is required')
})

const createPostSchema = z.object({
  title: localizedString,
  slug: z.string().optional(),
  content: localizedString,
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

    // Check authentication
    const currentUser = event.context.user
    if (!currentUser) {
      throw createError({
        statusCode: 401,
        message: 'Authentication required'
      })
    }

    // Parse and validate request body
    const body = await readBody(event)
    const data = createPostSchema.parse(body)

    // Create post
    const post = await Post.create({
      ...data,
      author: currentUser.userId,
      publishedAt: data.status === 'published' ? new Date() : data.publishedAt
    })

    // Populate references
    await post.populate('author', 'name email avatar')
    await post.populate('categories', 'name slug')
    await post.populate('tags', 'name slug color')

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
    throw createError({
      statusCode: 500,
      message: 'Failed to create post'
    })
  }
})
