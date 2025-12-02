import { AdminRoute } from '../../../models/AdminRoute'

export default defineEventHandler(async (event) => {
  const currentUser = event.context.user
  if (!currentUser || currentUser.role.name !== 'admin') {
    throw createError({ statusCode: 403, message: 'Access denied', statusMessage: 'error.unauthorized' })
  }

  await connectDB()
  const id = event.context.params?.id
  const body = await readBody(event)

  try {
    const route = await AdminRoute.findByIdAndUpdate(id, body, { new: true })
    if (!route) {
      throw createError({ statusCode: 404, message: 'Route not found', statusMessage: 'error.not_found' })
    }
    return {
      success: true,
      data: route
    }
  } catch (error: any) {
    if (error.statusCode) throw error
    throw createError({ statusCode: 400, message: error.message, statusMessage: 'error.server_error' })
  }
})
