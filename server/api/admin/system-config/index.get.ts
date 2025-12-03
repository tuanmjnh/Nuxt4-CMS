import { SystemConfig } from '../../../models/SystemConfig'

export default defineEventHandler(async (event) => {
  // TODO: Add proper admin authorization check
  // const user = event.context.user
  // if (!user || user.role !== 'admin') {
  //   throw createError({ statusCode: 403, statusMessage: 'Forbidden' })
  // }

  try {
    const configs = await SystemConfig.find().sort({ key: 1 })
    return { success: true, data: configs }
  } catch (error: any) {
    if (error.statusCode) throw error
    throw createError({ statusCode: 500, message: error.message, statusMessage: 'error.server_error' })
  }
})
