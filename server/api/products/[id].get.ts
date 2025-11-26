import { Product } from '../../models/Product'

export default defineEventHandler(async (event) => {
  const id = event.context.params?.id

  try {
    const product = await Product.findById(id)
      .populate('categories')
      .populate('tags')

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
