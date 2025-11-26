import { z } from 'zod'
import { Menu } from '../../models/Menu'

const createMenuSchema = z.object({
  name: z.string().min(1, 'Name is required'),
  slug: z.string().optional(),
  position: z.enum(['header', 'footer', 'sidebar', 'mobile', 'custom']),
  isActive: z.boolean().optional(),
  sortOrder: z.number().optional()
})

export default defineEventHandler(async (event) => {
  try {
    await connectDB()

    const currentUser = event.context.user
    if (!currentUser || currentUser.role !== 'admin') {
      throw createError({
        statusCode: 403,
        message: 'Only administrators can create menus'
      })
    }

    const body = await readBody(event)
    const data = createMenuSchema.parse(body)

    // Check if position is already taken (except for custom)
    if (data.position !== 'custom' && data.isActive) {
      const existing = await Menu.findOne({ position: data.position, isActive: true })
      if (existing) {
        // Deactivate existing menu at this position
        await Menu.findByIdAndUpdate(existing._id, { isActive: false })
      }
    }

    const menu = await Menu.create(data)

    return {
      success: true,
      data: { menu }
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
      message: 'Failed to create menu'
    })
  }
})
