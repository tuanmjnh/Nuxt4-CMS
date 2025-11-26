import { Menu } from '../../models/Menu'
import { MenuItem } from '../../models/MenuItem'

export default defineEventHandler(async (event) => {
  try {
    await connectDB()

    const id = getRouterParam(event, 'id')

    if (!id) {
      throw createError({
        statusCode: 400,
        message: 'Menu ID is required'
      })
    }

    const menu = await Menu.findById(id).lean()

    if (!menu) {
      throw createError({
        statusCode: 404,
        message: 'Menu not found'
      })
    }

    // Get items
    const menuData = menu as any
    const items = await MenuItem.find({ menu: menuData._id })
      .populate('post', 'title slug')
      .populate('category', 'name slug')
      .populate('tag', 'name slug')
      .sort({ sortOrder: 1 })
      .lean()

    // Build tree
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

    return {
      success: true,
      data: {
        menu,
        items: buildTree(items)
      }
    }
  } catch (error: any) {
    if (error.statusCode) throw error
    throw createError({
      statusCode: 500,
      message: 'Failed to fetch menu'
    })
  }
})
