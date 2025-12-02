import { Menu } from '../../../models/Menu'
import { MenuItem } from '../../../models/MenuItem'

export default defineEventHandler(async (event) => {
  try {
    await connectDB()

    const position = getRouterParam(event, 'position')

    if (!position)
      throw createError({ statusCode: 400, message: 'Position is required', statusMessage: 'error.validation' })

    // Get active menu for this position
    const menu = await Menu.findOne({
      position,
      isActive: true
    }).lean()

    if (!menu) {
      return {
        success: true,
        data: { menu: null, items: [] }
      }
    }

    // Get all menu items for this menu
    const menuData = menu as any
    const items = await MenuItem.find({
      menu: menuData._id,
      isVisible: true
    })
      .populate('post', 'slug title')
      .populate('category', 'slug name')
      .populate('tag', 'slug name')
      .sort({ sortOrder: 1 })
      .lean()

    // Build tree structure
    const buildTree = (items: any[], parentId: any = null): any[] => {
      return items
        .filter(item => {
          const itemParent = item.parent?.toString() || null
          const compareParent = parentId?.toString() || null
          return itemParent === compareParent
        })
        .map(item => ({
          ...item,
          children: buildTree(items, item._id)
        }))
    }

    const tree = buildTree(items)

    return {
      success: true,
      data: {
        menu,
        items: tree
      }
    }
  } catch (error: any) {
    if (error.statusCode) throw error
    throw createError({ statusCode: 500, statusMessage: 'error.server_error', message: error.message })
  }
})
