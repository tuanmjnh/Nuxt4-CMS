import { AdminRoute } from '../../../models/AdminRoute'

export default defineEventHandler(async (event) => {
  const currentUser = event.context.user
  if (!currentUser || currentUser.role.name !== 'admin') {
    throw createError({ statusCode: 403, message: 'Access denied' })
  }

  await connectDB()
  const body = await readBody(event)

  try {
    const route = await AdminRoute.create(body)
    return {
      success: true,
      data: route
    }
  } catch (error: any) {
    throw createError({
      statusCode: 400,
      message: error.message
    })
  }
})
