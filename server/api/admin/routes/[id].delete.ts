import { AdminRoute } from '../../../models/AdminRoute'

export default defineEventHandler(async (event) => {
  const currentUser = event.context.user
  if (!currentUser || !currentUser.roles.some((r: any) => (r.name === 'admin' || r === 'admin'))) {
    throw createError({ statusCode: 403, message: 'Access denied', statusMessage: 'error.unauthorized' })
  }

  await connectDB()
  const id = event.context.params?.id

  try {
    const route = await AdminRoute.findByIdAndDelete(id)
    if (!route)
      throw createError({ statusCode: 404, message: 'Route not found', statusMessage: 'error.not_found' })
    return { success: true, message: 'Route deleted successfully' }
  } catch (error: any) {
    if (error.statusCode) throw error
    throw createError({ statusCode: 500, message: error.message, statusMessage: 'error.server_error' })
  }
})
