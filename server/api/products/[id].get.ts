import { Product } from '../../models/Product'

export default defineEventHandler(async (event) => {
  const id = event.context.params?.id
  if (!id) throw createError({ statusCode: 400, message: 'Product ID is required' })

  try {
    const filter: any = { isDeleted: false }
    if (id.match(/^[0-9a-fA-F]{24}$/)) {
      filter._id = id
    } else {
      filter.$or = [
        { 'slug.en': id },
        { 'slug.vi': id }
      ]
    }

    const product = await Product.findOne(filter)
      .populate('categories')
      .populate('tags')

    if (!product) throw createError({ statusCode: 404, message: 'Product not found', statusMessage: 'error.not_found' })
    return { success: true, data: product }
  } catch (error: any) {
    if (error.statusCode) throw error
    throw createError({ statusCode: 500, statusMessage: 'error.server_error', message: error.message })
  }
})
