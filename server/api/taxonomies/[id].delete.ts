import { Taxonomy } from '../../models/Taxonomy'

export default defineEventHandler(async (event) => {
  try {
    await connectDB()
    const id = getRouterParam(event, 'id')

    const taxonomy = await Taxonomy.findByIdAndDelete(id)

    if (!taxonomy)
      throw createError({ statusCode: 404, message: 'Taxonomy not found', statusMessage: 'error.not_found' })

    return { success: true, message: 'Taxonomy deleted successfully' }
  } catch (error: any) {
    if (error.statusCode) throw error
    throw createError({ statusCode: 500, statusMessage: 'error.server_error', message: error.message })
  }
})
