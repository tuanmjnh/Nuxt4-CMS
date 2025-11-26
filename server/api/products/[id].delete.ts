import { Product } from '../../models/Product'

export default defineEventHandler(async (event) => {
  // TODO: Add admin check
  const id = event.context.params?.id

  try {
    const product = await Product.findByIdAndDelete(id)
    if (!product) {
      throw createError({
        statusCode: 404,
        message: 'Product not found'
      })
    }
    return { message: 'Product deleted successfully' }
  } catch (error: any) {
    throw createError({
      statusCode: 500,
      message: error.message
    })
  }
})
