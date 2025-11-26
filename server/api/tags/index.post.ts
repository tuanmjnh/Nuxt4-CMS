import { z } from 'zod'
import { Tag } from '../../models/Tag'

const createTagSchema = z.object({
  name: z.string().min(1, 'Name is required'),
  slug: z.string().optional(),
  description: z.string().optional(),
  color: z.string().optional()
})

export default defineEventHandler(async (event) => {
  try {
    await connectDB()

    const currentUser = event.context.user
    if (!currentUser || currentUser.role !== 'admin') {
      throw createError({
        statusCode: 403,
        message: 'Only administrators can create tags'
      })
    }

    const body = await readBody(event)
    const data = createTagSchema.parse(body)

    const tag = await Tag.create(data)

    return {
      success: true,
      data: { tag }
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
      message: 'Failed to create tag'
    })
  }
})
