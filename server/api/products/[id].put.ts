import { Product } from '../../models/Product'

export default defineEventHandler(async (event) => {
  // TODO: Add admin check
  const id = event.context.params?.id
  const body = await readBody(event)

  try {
    const product = await Product.findByIdAndUpdate(id, body, { new: true })
    if (!product) {
      throw createError({
        statusCode: 404,
        message: 'Product not found'
      })
    }
    return product
  } catch (error: any) {
    throw createError({
      statusCode: 500,
      message: error.message
    })
  }
})
