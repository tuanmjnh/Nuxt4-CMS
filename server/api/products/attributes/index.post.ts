import { ProductAttribute } from '../../../models/ProductAttribute'

export default defineEventHandler(async (event) => {
  // TODO: Add admin check
  const body = await readBody(event)

  try {
    const attribute = await ProductAttribute.create(body)
    return attribute
  } catch (error: any) {
    throw createError({
      statusCode: 500,
      message: error.message
    })
  }
})
