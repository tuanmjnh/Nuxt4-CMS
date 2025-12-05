import { z } from 'zod'
import { Category } from '../../models/Category'
import { syncTags, syncKeywords } from '../../utils/keywords'

const updateCategorySchema = z.object({
  name: z.string().min(1).optional(),
  slug: z.string().optional(),
  description: z.string().optional(),
  image: z.string().optional(),
  parent: z.string().optional(),
  metaTitle: z.string().optional(),
  metaDescription: z.string().optional(),
  keywords: z.array(z.string()).optional(),
  tags: z.array(z.string()).optional(),
  sortOrder: z.number().optional(),
  type: z.enum(['post', 'product', 'user']).optional()
})

export default defineEventHandler(async (event) => {
  try {
    await connectDB()

    const id = getRouterParam(event, 'id')
    if (!id) throw createError({ statusCode: 400, message: 'Category ID is required', statusMessage: 'error.validation' })

    const body = await readBody(event)
    const data = updateCategorySchema.parse(body)

    // Process tags and keywords
    if (data.tags && data.tags.length > 0) {
      data.tags = await syncTags(data.tags)
    }

    if (data.keywords && data.keywords.length > 0) {
      await syncKeywords(data.keywords)
    }

    const category = await Category.findByIdAndUpdate(id, data, { new: true })

    if (!category) throw createError({ statusCode: 404, message: 'Category not found', statusMessage: 'error.not_found' })

    return { success: true, data: category }
  } catch (error: any) {
    if (error.name === 'ZodError')
      throw createError({ statusCode: 400, message: 'Validation error', statusMessage: 'error.validation', data: error.errors })
    if (error.statusCode) throw error
    throw createError({ statusCode: 500, message: 'Failed to update category', statusMessage: 'error.server_error' })
  }
})
