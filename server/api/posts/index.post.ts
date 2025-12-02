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

    // Check authentication
    const currentUser = event.context.user
    if (!currentUser) throw createError({ statusCode: 401, message: 'Authentication required', statusMessage: 'error.unauthorized' })

    // Parse and validate request body
    const body = await readBody(event)
    const data = createPostSchema.parse(body)

    // Process tags
    let processedTags: any[] = []
    if (data.tags && data.tags.length > 0) {
      const { Tag } = await import('../../models/Tag')
      const tagIds = []
      for (const tagInput of data.tags) {
        // Check if it's a valid ObjectId
        if (tagInput.match(/^[0-9a-fA-F]{24}$/)) {
          const exists = await Tag.findById(tagInput)
          if (exists) {
            tagIds.push(exists._id)
            continue
          }
        }

        // Treat as name
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
      processedTags = tagIds
    }

    // Process attributes (save to global registry)
    if (data.attributes && data.attributes.length > 0) {
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

    // Create post
    const post = await Post.create({
      ...data,
      tags: processedTags,
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
    if (error.name === 'ZodError') throw createError({ statusCode: 400, message: error.errors, statusMessage: 'error.validation' })
    if (error.statusCode) throw error
    throw createError({ statusCode: 500, statusMessage: 'error.server_error', message: error.message })
  }
})
