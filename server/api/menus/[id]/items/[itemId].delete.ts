import { MenuItem } from '../../../../models/MenuItem'

export default defineEventHandler(async (event) => {
  try {
    await connectDB()

    const itemId = getRouterParam(event, 'itemId')
    if (!itemId)
      throw createError({ statusCode: 400, message: 'Item ID required', statusMessage: 'error.validation' })

    const currentUser = event.context.user
    if (!currentUser || !currentUser.roles.some((r: any) => (r.name === 'admin' || r === 'admin')))
      throw createError({ statusCode: 403, message: 'Admin only', statusMessage: 'error.unauthorized' })

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

    await MenuItem.findByIdAndUpdate(itemId, {
      isDeleted: true,
      deletedAt: new Date()
    })

    return { success: true, message: 'Item deleted' }
  } catch (error: any) {
    if (error.statusCode) throw error
    throw createError({ statusCode: 500, statusMessage: 'error.server_error', message: error.message })
  }
})
