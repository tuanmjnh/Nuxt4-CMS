import { SystemRoute } from '../../../models/SystemRoute'

export default defineEventHandler(async (event) => {
  await connectDB()
  const id = event.context.params?.id

  try {
    const route = await SystemRoute.findByIdAndDelete(id)
    if (!route)
      throw createError({ statusCode: 404, message: 'Route not found', statusMessage: 'error.not_found' })
    return { success: true, message: 'Route deleted successfully' }
  } catch (error: any) {
    if (error.statusCode) throw error
    throw createError({ statusCode: 500, message: error.message, statusMessage: 'error.server_error' })
  }
})
