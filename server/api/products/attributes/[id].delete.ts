import { ProductAttribute } from '../../../models/ProductAttribute'

export default defineEventHandler(async (event) => {
  // TODO: Add admin check
  const id = event.context.params?.id

  try {
    const attribute = await ProductAttribute.findByIdAndUpdate(id, {
      isDeleted: true,
      deletedAt: new Date()
    })
    if (!attribute) throw createError({ statusCode: 404, message: 'Attribute not found', statusMessage: 'error.not_found' })
    return { message: 'Attribute deleted successfully' }
  } catch (error: any) {
    if (error.statusCode) throw error
    throw createError({ statusCode: 500, statusMessage: 'error.server_error', message: error.message })
  }
})
