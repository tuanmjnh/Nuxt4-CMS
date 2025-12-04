import { SystemRoute } from '../../../models/SystemRoute'

export default defineEventHandler(async (event) => {
  await connectDB()
  const body = await readBody(event)

  try {
    const route = await SystemRoute.create(body)
    return { success: true, data: route }
  } catch (error: any) {
    if (error.statusCode) throw error
    throw createError({ statusCode: 500, message: error.message, statusMessage: 'error.server_error' })
  }
})
