import { Product } from '../../models/Product'

export default defineEventHandler(async (event) => {
  const id = event.context.params?.id

  try {
    const product = await Product.findOne({ _id: id, isDeleted: false })
      .populate('categories')
      .populate('tags')

    if (!product) throw createError({ statusCode: 404, message: 'Product not found', statusMessage: 'error.not_found' })
    return { success: true, data: product }
  } catch (error: any) {
    if (error.statusCode) throw error
    throw createError({ statusCode: 500, statusMessage: 'error.server_error', message: error.message })
  }
})
