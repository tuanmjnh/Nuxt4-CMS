import { z } from 'zod'
import { Post } from '../../models/Post'
import { Attribute } from '../../models/Attribute'
import { syncTags, syncKeywords } from '../../utils/keywords'

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

    // Process tags and keywords
    if (data.tags && data.tags.length > 0)
      data.tags = await syncTags(data.tags)

    if (data.keywords && data.keywords.length > 0)
      await syncKeywords(data.keywords)

    // Process attributes (save to global registry)
    // Process attributes (save to global registry)
    if (data.attributes && data.attributes.length > 0) {
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

    // Create post
    const post = await Post.create({
      ...data,
      tags: data.tags,
      author: currentUser.userId,
      publishedAt: data.status === 'published' ? new Date() : data.publishedAt
    })

    // Populate references
    await post.populate('author', 'name email avatar')
    await post.populate('categories', 'name slug')
    await post.populate('tags', 'name slug color')

    return { success: true, data: post }
  } catch (error: any) {
    if (error.name === 'ZodError') throw createError({ statusCode: 400, message: error.errors, statusMessage: 'error.validation' })
    if (error.statusCode) throw error
    throw createError({ statusCode: 500, statusMessage: 'error.server_error', message: error.message })
  }
})
