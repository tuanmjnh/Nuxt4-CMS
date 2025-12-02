import { z } from 'zod'
import { MenuItem } from '../../../../models/MenuItem'

const createItemSchema = z.object({
  label: z.string().min(1),
  linkType: z.enum(['url', 'post', 'category', 'tag', 'page']),
  parent: z.string().nullable().optional(),
  url: z.string().optional(),
  post: z.string().optional(),
  category: z.string().optional(),
  tag: z.string().optional(),
  target: z.enum(['_self', '_blank']).optional(),
  icon: z.string().optional(),
  cssClass: z.string().optional(),
  isVisible: z.boolean().optional()
})

export default defineEventHandler(async (event) => {
  try {
    await connectDB()

    const menuId = getRouterParam(event, 'id')
    if (!menuId)
      throw createError({ statusCode: 400, message: 'Menu ID required', statusMessage: 'error.validation' })

    const currentUser = event.context.user
    if (!currentUser || currentUser.role !== 'admin')
      throw createError({ statusCode: 403, message: 'Admin only', statusMessage: 'error.unauthorized' })

    const body = await readBody(event)
    const data = createItemSchema.parse(body)

    // Get max sort order
    const lastItem = await MenuItem.findOne({ menu: menuId, parent: data.parent || null })
      .sort({ sortOrder: -1 })

    const sortOrder = (lastItem?.sortOrder || 0) + 1

    const item = await MenuItem.create({
      ...data,
      menu: menuId,
      sortOrder
    })

    return { success: true, data: { item } }
  } catch (error: any) {
    if (error.name === 'ZodError') throw createError({ statusCode: 400, message: error.errors, statusMessage: 'error.validation' })
    if (error.statusCode) throw error
    throw createError({ statusCode: 500, statusMessage: 'error.server_error', message: error.message })
  }
})
