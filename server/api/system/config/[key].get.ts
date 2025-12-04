import { SystemConfig } from '../../../models/SystemConfig'

export default defineEventHandler(async (event) => {
  // TODO: Add proper admin authorization check
  // const user = event.context.user
  // if (!user || user.role !== 'admin') {
  //   throw createError({ statusCode: 403, statusMessage: 'Forbidden' })
  // }

  const key = getRouterParam(event, 'key')

  if (!key) {
    throw createError({ statusCode: 400, message: 'error.validation', statusMessage: 'error.validation' })
  }

  try {
    const config = await SystemConfig.findOne({ key })
    if (!config) {
      // Return null or default value if not found, rather than 404 to simplify frontend logic
      return { success: true, data: null }
    }
    return { success: true, data: config.value }
  } catch (error: any) {
    if (error.statusCode) throw error
    throw createError({ statusCode: 500, message: error.message, statusMessage: 'error.server_error' })
  }
})
