import { Menu } from '../../models/Menu'
import { MenuItem } from '../../models/MenuItem'

export default defineEventHandler(async (event) => {
  try {
    await connectDB()

    const menus = await Menu.find()
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

    return {
      success: true,
      data: { menus: menusWithCounts }
    }
  } catch (error) {
    throw createError({
      statusCode: 500,
      message: 'Failed to fetch menus'
    })
  }
})
