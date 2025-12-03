import { Attribute } from '../../../models/Attribute'

export default defineEventHandler(async (event) => {
  try {
    await connectDB()
    const attributes = await Attribute.find({ type: 'post' }).sort({ name: 1 })
    return { success: true, data: attributes }
  } catch (error: any) {
    if (error.statusCode) throw error
    throw createError({ statusCode: 500, statusMessage: 'error.server_error', message: error.message })
  }
})
