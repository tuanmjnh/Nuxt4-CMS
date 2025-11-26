import { ProductAttribute } from '../../../models/ProductAttribute'

export default defineEventHandler(async (event) => {
  try {
    const attributes = await ProductAttribute.find({}).sort({ name: 1 })
    return attributes
  } catch (error: any) {
    throw createError({
      statusCode: 500,
      message: error.message
    })
  }
})
