import { z } from 'zod'

const updateMenuSchema = z.object({
  name: z.string().min(1).optional(),
  slug: z.string().optional(),
  position: z.enum(['header', 'footer', 'sidebar', 'mobile', 'custom']).optional(),
  isActive: z.boolean().optional(),
  sortOrder: z.number().optional()
})

import { Menu } from '../../models/Menu'

export default defineEventHandler(async (event) => {
  try {
    await connectDB()

    const id = getRouterParam(event, 'id')
    if (!id)
      throw createError({ statusCode: 400, message: 'ID required', statusMessage: 'error.validation' })

    const currentUser = event.context.user
    if (!currentUser || currentUser.role !== 'admin')
      throw createError({ statusCode: 403, message: 'Admin only', statusMessage: 'error.unauthorized' })

    const body = await readBody(event)
    const data = updateMenuSchema.parse(body)

    // Handle active position conflict
    if (data.position && data.isActive && data.position !== 'custom') {
      await Menu.updateMany(
        { position: data.position, _id: { $ne: id } },
        { isActive: false }
      )
    }

    const menu = await Menu.findByIdAndUpdate(id, { $set: data }, { new: true })

    if (!menu)
      throw createError({ statusCode: 404, message: 'Menu not found', statusMessage: 'error.not_found' })

    return { success: true, data: { menu } }
  } catch (error: any) {
    if (error.name === 'ZodError') throw createError({ statusCode: 400, message: error.errors, statusMessage: 'error.validation' })
    if (error.statusCode) throw error
    throw createError({ statusCode: 500, statusMessage: 'error.server_error', message: error.message })
  }
})
