import { Menu } from '../../models/Menu'
import { MenuItem } from '../../models/MenuItem'

export default defineEventHandler(async (event) => {
  try {
    await connectDB()

    const id = getRouterParam(event, 'id')
    if (!id) throw createError({ statusCode: 400, message: 'ID required' })

    const currentUser = event.context.user
    if (!currentUser || currentUser.role !== 'admin') {
      throw createError({ statusCode: 403, message: 'Admin only' })
    }

    // Delete menu and all its items
    await Menu.findByIdAndDelete(id)
    await MenuItem.deleteMany({ menu: id })

    return { success: true, message: 'Menu deleted' }
  } catch (error) {
    throw error
  }
})
