import { z } from 'zod'
import { Category } from '../../models/Category'
import { syncTags, syncKeywords } from '../../utils/keywords'

const createCategorySchema = z.object({
  title: z.object({
    en: z.string().min(1, 'English title is required'),
    vi: z.string().min(1, 'Vietnamese title is required')
  }),
  slug: z.object({
    en: z.string().optional(),
    vi: z.string().optional()
  }).optional(),
  description: z.object({
    en: z.string().optional(),
    vi: z.string().optional()
  }).optional(),
  image: z.any().optional(), // Supports both string and object
  parent: z.string().optional(),
  metaTitle: z.object({
    en: z.string().optional(),
    vi: z.string().optional()
  }).optional(),
  metaDescription: z.object({
    en: z.string().optional(),
    vi: z.string().optional()
  }).optional(),
  keywords: z.array(z.string()).optional(),
  tags: z.array(z.string()).optional()
})

export default defineEventHandler(async (event) => {
  try {
    await connectDB()

    const body = await readBody(event)
    const data = createCategorySchema.parse(body)

    // Process tags and keywords
    if (data.tags && data.tags.length > 0) {
      data.tags = await syncTags(data.tags)
    }

    if (data.keywords && data.keywords.length > 0) {
      await syncKeywords(data.keywords)
    }

    const category = await Category.create(data)

    return { success: true, data: category }
  } catch (error: any) {
    if (error.name === 'ZodError')
      throw createError({ statusCode: 400, message: 'Validation error', statusMessage: 'error.validation', data: error.errors })
    if (error.statusCode) throw error
    throw createError({ statusCode: 500, message: 'Failed to create category', statusMessage: 'error.server_error' })
  }
})
