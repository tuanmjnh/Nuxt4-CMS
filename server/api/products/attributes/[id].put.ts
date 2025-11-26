import { ProductAttribute } from '../../../models/ProductAttribute'

export default defineEventHandler(async (event) => {
  // TODO: Add admin check
  const id = event.context.params?.id
  const body = await readBody(event)

  try {
    const attribute = await ProductAttribute.findByIdAndUpdate(id, body, { new: true })
    if (!attribute) {
      throw createError({
        statusCode: 404,
        message: 'Attribute not found'
      })
    }
    return attribute
  } catch (error: any) {
    throw createError({
      statusCode: 500,
      message: error.message
    })
  }
})
