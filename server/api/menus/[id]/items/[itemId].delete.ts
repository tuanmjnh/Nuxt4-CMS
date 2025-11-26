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

    // Check for children
    const children = await MenuItem.find({ parent: itemId })
    if (children.length > 0) {
      // Move children to parent of deleted item (or root)
      const item = await MenuItem.findById(itemId)
      await MenuItem.updateMany(
        { parent: itemId },
        { parent: item?.parent || null }
      )
    }

    await MenuItem.findByIdAndDelete(itemId)

    return { success: true, message: 'Item deleted' }
  } catch (error) {
    throw error
  }
})
