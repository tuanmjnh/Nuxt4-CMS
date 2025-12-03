import { AdminRoute } from '../../../models/AdminRoute'

export default defineEventHandler(async (event) => {
  try {
    const currentUser = event.context.user
    if (!currentUser)
      throw createError({ statusCode: 401, message: 'Not authenticated', statusMessage: 'error.unauthorized' })

    await connectDB()

    const routes = await AdminRoute.find().sort({ sort: 1 })

    return { success: true, data: routes }
  } catch (error: any) {
    if (error.statusCode) throw error
    throw createError({ statusCode: 500, message: error.message, statusMessage: 'error.server_error' })
  }
})
