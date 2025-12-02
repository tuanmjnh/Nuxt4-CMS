import { Tag } from '../../models/Tag'

export default defineEventHandler(async (event) => {
  try {
    await connectDB()

    const tags = await Tag.find({ isDeleted: false })
      .sort({ name: 1 })
      .lean()

    return {
      success: true,
      data: { tags }
    }
  } catch (error: any) {
    if (error.statusCode) throw error
    throw createError({ statusCode: 500, statusMessage: 'error.server_error', message: error.message })
  }
})
