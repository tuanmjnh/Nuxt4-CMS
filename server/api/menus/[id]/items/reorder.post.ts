import { MenuItem } from '../../../../models/MenuItem'

export default defineEventHandler(async (event) => {
  try {
    await connectDB()

    const menuId = getRouterParam(event, 'id')
    if (!menuId)
      throw createError({ statusCode: 400, message: 'Menu ID required', statusMessage: 'error.validation' })

    const currentUser = event.context.user
    if (!currentUser || !currentUser.roles.some((r: any) => (r.name === 'admin' || r === 'admin')))
      throw createError({ statusCode: 403, message: 'Admin only', statusMessage: 'error.unauthorized' })

    const body = await readBody(event)
    const { items } = body // Array of { id, parent, sortOrder }

    if (!Array.isArray(items))
      throw createError({ statusCode: 400, message: 'Invalid items array', statusMessage: 'error.validation' })

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

    if (operations.length > 0)
      await MenuItem.bulkWrite(operations)

    return { success: true, message: 'Menu reordered' }
  } catch (error: any) {
    if (error.statusCode) throw error
    throw createError({ statusCode: 500, statusMessage: 'error.server_error', message: error.message })
  }
})
