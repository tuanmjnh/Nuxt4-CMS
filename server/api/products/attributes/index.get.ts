import { ProductAttribute } from '../../../models/ProductAttribute'

export default defineEventHandler(async (event) => {
  try {
    const attributes = await ProductAttribute.find({}).sort({ name: 1 })
    return attributes
  } catch (error: any) {
    if (error.statusCode) throw error
    throw createError({ statusCode: 500, statusMessage: 'error.server_error', message: error.message })
  }
})
