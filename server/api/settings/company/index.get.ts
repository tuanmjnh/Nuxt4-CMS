import { Company } from '../../../models/Company'

export default defineEventHandler(async (event) => {
  try {
    const company = await Company.findOne()
    return {
      success: true,
      data: company || {}
    }
  } catch (error: any) {
    throw createError({
      statusCode: 500,
      message: error.message
    })
  }
})
