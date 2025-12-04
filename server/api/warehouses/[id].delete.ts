import { Warehouse } from '../../models/Warehouse'

export default defineEventHandler(async (event) => {
  // TODO: Add authorization check
  const id = getRouterParam(event, 'id')

  try {
    const warehouse = await Warehouse.findByIdAndDelete(id)
    if (!warehouse) {
      throw createError({ statusCode: 404, message: 'error.not_found', statusMessage: 'error.not_found' })
    }
    return { success: true, message: 'success.deleted' }
  } catch (error: any) {
    throw createError({ statusCode: 500, message: error.message, statusMessage: 'error.server_error' })
  }
})
