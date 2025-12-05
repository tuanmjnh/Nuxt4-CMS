import { SystemRoute } from '../../models/SystemRoute'

export default defineEventHandler(async (event) => {
  await connectDB()
  const id = event.context.params?.id
  const body = await readBody(event)

  try {
    const route = await SystemRoute.findByIdAndUpdate(id, body, { new: true })
    if (!route)
      throw createError({ statusCode: 404, message: 'Route not found', statusMessage: 'error.not_found' })
    return { success: true, message: 'Route updated successfully', data: route }
  } catch (error: any) {
    if (error.statusCode) throw error
    throw createError({ statusCode: 500, message: error.message, statusMessage: 'error.server_error' })
  }
})
