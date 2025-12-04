import { Warehouse } from '../../models/Warehouse'

export default defineEventHandler(async (event) => {
  // TODO: Add authorization check
  try {
    const warehouses = await Warehouse.find().sort({ createdAt: -1 })
    return { success: true, data: warehouses }
  } catch (error: any) {
    throw createError({ statusCode: 500, message: error.message, statusMessage: 'error.server_error' })
  }
})
