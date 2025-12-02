import { Category } from '../../models/Category'

export default defineEventHandler(async (event) => {
  const body = await readBody(event)
  const { items } = body

  if (!items || !Array.isArray(items))
    throw createError({ statusCode: 400, message: 'Invalid items data', statusMessage: 'error.validation' })

  try {
    const bulkOps = items.map((item: any) => ({
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

    if (bulkOps.length > 0) {
      await Category.bulkWrite(bulkOps)
    }

    return {
      success: true,
      message: 'Categories reordered successfully'
    }
  } catch (error: any) {
    if (error.statusCode) throw error
    throw createError({ statusCode: 500, message: error.message || 'Failed to reorder categories', statusMessage: 'error.server_error' })
  }
})
