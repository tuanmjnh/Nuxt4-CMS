import { z } from 'zod'
import { Post } from '../../models/Post'
import { Attribute } from '../../models/Attribute'
import { syncTags, syncKeywords } from '../../utils/taxonomy'
import { hasPermission } from '../../utils/permissions'

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
  attributes: z.array(z.object({
    name: z.string(),
    value: z.string()
  })).optional(),
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

    if (!id) throw createError({ statusCode: 400, message: 'Post ID is required', statusMessage: 'error.validation' })

    // Check authentication
    const currentUser = event.context.user
    if (!currentUser) throw createError({ statusCode: 401, message: 'Authentication required', statusMessage: 'error.unauthorized' })

    // Get existing post
    const existingPost = await Post.findById(id)

    if (!existingPost) throw createError({ statusCode: 404, message: 'Post not found', statusMessage: 'error.not_found' })

    // Check authorization (admin, or author of the post)
    const isAdmin = hasPermission('*', currentUser.permissions)
    if (!isAdmin && existingPost.author.toString() !== currentUser.userId)
      throw createError({ statusCode: 403, message: 'Not authorized to update this post', statusMessage: 'error.unauthorized' })

    // Parse and validate request body
    const body = await readBody(event)
    const data = updatePostSchema.parse(body)

    // Handle status change to published
    if (data.status === 'published' && existingPost.status !== 'published') {
      // @ts-ignore
      data.publishedAt = new Date().toISOString()
    }

    const updateData: any = { ...data }

    // Process tags and keywords
    if (data.tags) {
      updateData.tags = await syncTags(data.tags)
    }

    if (data.keywords) {
      await syncKeywords(data.keywords)
    }

    // Process attributes
    // Process attributes
    if (data.attributes) {
      for (const attr of data.attributes) {
        if (!attr.name || !attr.value) continue
        let attrDef = await Attribute.findOne({ name: attr.name, type: 'post' })
        if (!attrDef) {
          try {
            attrDef = await Attribute.create({ name: attr.name, type: 'post', values: [attr.value] })
          } catch (e) {
            attrDef = await Attribute.findOne({ name: attr.name, type: 'post' })
          }
        }
        if (attrDef && !attrDef.values.includes(attr.value)) {
          attrDef.values.push(attr.value)
          await attrDef.save()
        }
      }
    }

    // Update post
    const post = await Post.findByIdAndUpdate(
      id,
      { $set: updateData },
      { new: true }
    )
      .populate('author', 'name email avatar')
      .populate('categories', 'name slug')
      .populate('tags', 'name slug color')

    return { success: true, data: post }
  } catch (error: any) {
    if (error.name === 'ZodError') throw createError({ statusCode: 400, message: error.errors, statusMessage: 'error.validation' })
    if (error.statusCode) throw error
    throw createError({ statusCode: 500, statusMessage: 'error.server_error', message: error.message })
  }
})
