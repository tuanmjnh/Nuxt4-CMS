import { ProductAttribute } from '../../../models/ProductAttribute'

export default defineEventHandler(async (event) => {
  // TODO: Add admin check
  const id = event.context.params?.id

  try {
    const attribute = await ProductAttribute.findByIdAndDelete(id)
    if (!attribute) {
      throw createError({
        statusCode: 404,
        message: 'Attribute not found'
      })
    }
    return { message: 'Attribute deleted successfully' }
  } catch (error: any) {
    throw createError({
      statusCode: 500,
      message: error.message
    })
  }
})
