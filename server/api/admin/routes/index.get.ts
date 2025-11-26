import { AdminRoute } from '../../../models/AdminRoute'

export default defineEventHandler(async (event) => {
  const currentUser = event.context.user
  if (!currentUser) {
    throw createError({ statusCode: 401, message: 'Not authenticated' })
  }

  await connectDB()

  const routes = await AdminRoute.find().sort({ sortOrder: 1 })

  return {
    success: true,
    data: routes
  }
})
