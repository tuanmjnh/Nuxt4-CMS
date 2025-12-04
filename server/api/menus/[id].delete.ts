import { Menu } from '../../models/Menu'
import { MenuItem } from '../../models/MenuItem'

export default defineEventHandler(async (event) => {
  try {
    await connectDB()

    const id = getRouterParam(event, 'id')
    if (!id)
      throw createError({ statusCode: 400, message: 'ID required', statusMessage: 'error.validation' })

    // Soft delete menu and all its items
    await Menu.findByIdAndUpdate(id, {
      isDeleted: true,
      deletedAt: new Date()
    })
    await MenuItem.updateMany({ menu: id }, {
      isDeleted: true,
      deletedAt: new Date()
    })

    return { success: true, message: 'Menu deleted' }
  } catch (error: any) {
    if (error.statusCode) throw error
    throw createError({ statusCode: 500, statusMessage: 'error.server_error', message: error.message })
  }
})
