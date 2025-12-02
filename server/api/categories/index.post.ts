import { z } from 'zod'
import { Category } from '../../models/Category'

const createCategorySchema = z.object({
  name: z.string().min(1, 'Name is required'),
  slug: z.string().optional(),
  description: z.string().optional(),
  image: z.string().optional(),
  parent: z.string().optional(),
  metaTitle: z.string().optional(),
  metaDescription: z.string().optional()
})

export default defineEventHandler(async (event) => {
  try {
    await connectDB()

    const currentUser = event.context.user
    if (!currentUser || currentUser.role !== 'admin')
      throw createError({ statusCode: 403, message: 'Only administrators can create categories', statusMessage: 'error.unauthorized' })

    const body = await readBody(event)
    const data = createCategorySchema.parse(body)

    const category = await Category.create(data)

    return {
      success: true,
      data: { category }
    }
  } catch (error: any) {
    if (error.name === 'ZodError')
      throw createError({ statusCode: 400, message: 'Validation error', statusMessage: 'error.validation', data: error.errors })
    if (error.statusCode) throw error
    throw createError({ statusCode: 500, message: 'Failed to create category', statusMessage: 'error.server_error' })
  }
})
