import { AdminRoute } from '../../../models/AdminRoute'

export default defineEventHandler(async (event) => {
  const currentUser = event.context.user
  if (!currentUser || !currentUser.roles.some((r: any) => (r.name === 'admin' || r === 'admin')))
    throw createError({ statusCode: 403, message: 'Access denied', statusMessage: 'error.unauthorized' })

  await connectDB()
  const body = await readBody(event)

  try {
    const route = await AdminRoute.create(body)
    return { success: true, data: route }
  } catch (error: any) {
    if (error.statusCode) throw error
    throw createError({ statusCode: 500, message: error.message, statusMessage: 'error.server_error' })
  }
})
