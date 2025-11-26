import { AdminRoute } from '../../../models/AdminRoute'

export default defineEventHandler(async (event) => {
  const currentUser = event.context.user
  if (!currentUser || currentUser.role.name !== 'admin') {
    throw createError({ statusCode: 403, message: 'Access denied' })
  }

  await connectDB()
  const id = event.context.params?.id

  try {
    const route = await AdminRoute.findByIdAndDelete(id)
    if (!route) {
      throw createError({ statusCode: 404, message: 'Route not found' })
    }
    return {
      success: true
    }
  } catch (error: any) {
    throw createError({
      statusCode: 400,
      message: error.message
    })
  }
})
