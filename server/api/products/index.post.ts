import { Product } from '../../models/Product'

export default defineEventHandler(async (event) => {
  // TODO: Add admin check
  const body = await readBody(event)

  try {
    const product = await Product.create(body)
    return product
  } catch (error: any) {
    throw createError({
      statusCode: 500,
      message: error.message
    })
  }
})
