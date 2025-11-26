import { Tag } from '../../models/Tag'

export default defineEventHandler(async (event) => {
  try {
    await connectDB()

    const tags = await Tag.find()
      .sort({ name: 1 })
      .lean()

    return {
      success: true,
      data: { tags }
    }
  } catch (error) {
    throw createError({
      statusCode: 500,
      message: 'Failed to fetch tags'
    })
  }
})
