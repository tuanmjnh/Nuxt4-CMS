import { Menu } from '../../models/Menu'
import { MenuItem } from '../../models/MenuItem'

export default defineEventHandler(async (event) => {
  try {
    await connectDB()

    const menus = await Menu.find({ isDeleted: false })
      .sort({ position: 1, sortOrder: 1 })
      .lean()

    // Get item counts for each menu
    const menusWithCounts = await Promise.all(
      menus.map(async (menu) => {
        const itemCount = await MenuItem.countDocuments({ menu: menu._id })
        return {
          ...menu,
          itemCount
        }
      })
    )

    return { success: true, data: menusWithCounts }
  } catch (error: any) {
    if (error.statusCode) throw error
    throw createError({ statusCode: 500, statusMessage: 'error.server_error', message: error.message })
  }
})
