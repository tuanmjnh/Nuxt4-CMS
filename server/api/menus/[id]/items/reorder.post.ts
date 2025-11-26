import { MenuItem } from '../../../../models/MenuItem'

export default defineEventHandler(async (event) => {
  try {
    await connectDB()

    const menuId = getRouterParam(event, 'id')
    if (!menuId) throw createError({ statusCode: 400, message: 'Menu ID required' })

    const currentUser = event.context.user
    if (!currentUser || currentUser.role !== 'admin') {
      throw createError({ statusCode: 403, message: 'Admin only' })
    }

    const body = await readBody(event)
    const { items } = body // Array of { id, parent, sortOrder }

    if (!Array.isArray(items)) {
      throw createError({ statusCode: 400, message: 'Invalid items array' })
    }

    // Bulk update
    const operations = items.map(item => ({
      updateOne: {
        filter: { _id: item.id },
        update: {
          $set: {
            parent: item.parent || null,
            sortOrder: item.sortOrder
          }
        }
      }
    }))

    if (operations.length > 0) {
      await MenuItem.bulkWrite(operations)
    }

    return { success: true, message: 'Menu reordered' }
  } catch (error) {
    throw error
  }
})
