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
    if (currentUser.role !== 'admin' && existingPost.author.toString() !== currentUser.userId)
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

    // Process tags
    if (data.tags) {
      const { Tag } = await import('../../models/Tag')
      const tagIds = []
      for (const tagInput of data.tags) {
        if (tagInput.match(/^[0-9a-fA-F]{24}$/)) {
          const exists = await Tag.findById(tagInput)
          if (exists) {
            tagIds.push(exists._id)
            continue
          }
        }
        const slug = tagInput.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-+|-+$/g, '')
        let tag = await Tag.findOne({ $or: [{ name: tagInput }, { slug: slug }] })
        if (!tag) {
          try {
            tag = await Tag.create({ name: tagInput })
          } catch (e) {
            tag = await Tag.findOne({ name: tagInput })
          }
        }
        if (tag) tagIds.push(tag._id)
      }
      updateData.tags = tagIds
    }

    // Process attributes
    if (data.attributes) {
      const { PostAttribute } = await import('../../models/PostAttribute')
      for (const attr of data.attributes) {
        if (!attr.name || !attr.value) continue
        let attrDef = await PostAttribute.findOne({ name: attr.name })
        if (!attrDef) {
          try {
            attrDef = await PostAttribute.create({ name: attr.name, values: [attr.value] })
          } catch (e) {
            attrDef = await PostAttribute.findOne({ name: attr.name })
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

    return {
      success: true,
      data: { post }
    }
  } catch (error: any) {
    if (error.name === 'ZodError') throw createError({ statusCode: 400, message: error.errors, statusMessage: 'error.validation' })
    if (error.statusCode) throw error
    throw createError({ statusCode: 500, statusMessage: 'error.server_error', message: error.message })
  }
})
