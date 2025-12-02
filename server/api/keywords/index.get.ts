import { Post } from '../../models/Post'
import { Product } from '../../models/Product'

export default defineEventHandler(async (event) => {
  try {
    await connectDB()

    // Aggregate unique keywords from Posts and Products
    const [postKeywords, productKeywords] = await Promise.all([
      Post.distinct('keywords'),
      Product.distinct('keywords')
    ])

    // Merge and deduplicate
    const allKeywords = [...new Set([...postKeywords, ...productKeywords])].sort()

    return {
      success: true,
      data: allKeywords
    }
  } catch (error: any) {
    if (error.statusCode) throw error
    throw createError({ statusCode: 500, statusMessage: 'error.server_error', message: error.message })
  }
})
