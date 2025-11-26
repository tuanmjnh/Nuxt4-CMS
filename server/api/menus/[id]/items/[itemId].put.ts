import { z } from 'zod'

const updateItemSchema = z.object({
  label: z.string().optional(),
  linkType: z.enum(['url', 'post', 'category', 'tag', 'page']).optional(),
  url: z.string().optional(),
  post: z.string().optional(),
  category: z.string().optional(),
  tag: z.string().optional(),
  target: z.enum(['_self', '_blank']).optional(),
  icon: z.string().optional(),
  cssClass: z.string().optional(),
  isVisible: z.boolean().optional()
})

import { MenuItem } from '../../../../models/MenuItem'

export default defineEventHandler(async (event) => {
  try {
    await connectDB()

    const itemId = getRouterParam(event, 'itemId')
    if (!itemId) throw createError({ statusCode: 400, message: 'Item ID required' })

    const currentUser = event.context.user
    if (!currentUser || currentUser.role !== 'admin') {
      throw createError({ statusCode: 403, message: 'Admin only' })
    }

    const body = await readBody(event)
    const data = updateItemSchema.parse(body)

    const item = await MenuItem.findByIdAndUpdate(
      itemId,
      { $set: data },
      { new: true }
    )

    if (!item) throw createError({ statusCode: 404, message: 'Item not found' })

    return { success: true, data: { item } }
  } catch (error: any) {
    if (error.name === 'ZodError') throw createError({ statusCode: 400, message: error.errors })
    throw error
  }
})
