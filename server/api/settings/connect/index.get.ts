import { Connect } from '../../../models/Connect'

export default defineEventHandler(async (event) => {
  try {
    const connects = await Connect.find().sort({ sort: 1 })

    // Transform array to object keyed by 'key' for frontend consumption if needed
    // But frontend expects specific structure. 
    // Let's return the list and let frontend handle it, OR transform it to match the schema structure.
    // The schema in connect.vue expects: google: {...}, facebook: {...}

    const result: Record<string, any> = {}
    connects.forEach((c: any) => {
      if (c.key) {
        result[c.key] = {
          ...c.toObject(),
          enabled: c.flag === 1
        }
      }
    })

    return {
      success: true,
      data: result
    }
  } catch (error: any) {
    throw createError({
      statusCode: 500,
      message: error.message
    })
  }
})
