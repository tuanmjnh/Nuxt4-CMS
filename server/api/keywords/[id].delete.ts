import { Keywords } from '../../models/Keywords'

export default defineEventHandler(async (event) => {
  try {
    await connectDB()
    const id = getRouterParam(event, 'id')

    const keywords = await Keywords.findByIdAndDelete(id)

    if (!keywords)
      throw createError({ statusCode: 404, message: 'Keywords not found', statusMessage: 'error.not_found' })

    return { success: true, message: 'Keywords deleted successfully' }
  } catch (error: any) {
    if (error.statusCode) throw error
    throw createError({ statusCode: 500, statusMessage: 'error.server_error', message: error.message })
  }
})
