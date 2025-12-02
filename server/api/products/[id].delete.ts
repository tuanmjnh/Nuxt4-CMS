import { Product } from '../../models/Product'

export default defineEventHandler(async (event) => {
  // TODO: Add admin check
  const id = event.context.params?.id

  try {
    const product = await Product.findByIdAndUpdate(id, {
      isDeleted: true,
      deletedAt: new Date()
    })
    if (!product) throw createError({ statusCode: 404, message: 'Product not found', statusMessage: 'error.not_found' })
    return { message: 'Product deleted successfully' }
  } catch (error: any) {
    if (error.statusCode) throw error
    throw createError({ statusCode: 500, statusMessage: 'error.server_error', message: error.message })
  }
})
