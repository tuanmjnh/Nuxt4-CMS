import { Warehouse } from '../../models/Warehouse'

export default defineEventHandler(async (event) => {
  // TODO: Add authorization check
  const id = getRouterParam(event, 'id')
  const body = await readBody(event)

  try {
    const warehouse = await Warehouse.findByIdAndUpdate(id, body, { new: true })
    if (!warehouse) {
      throw createError({ statusCode: 404, message: 'error.not_found', statusMessage: 'error.not_found' })
    }
    return { success: true, data: warehouse }
  } catch (error: any) {
    if (error.code === 11000) {
      throw createError({ statusCode: 400, message: 'error.duplicate_key', statusMessage: 'error.duplicate_key' })
    }
    throw createError({ statusCode: 500, message: error.message, statusMessage: 'error.server_error' })
  }
})
