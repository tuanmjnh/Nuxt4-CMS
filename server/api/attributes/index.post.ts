import { Attribute } from '../../models/Attribute'

export default defineEventHandler(async (event) => {
  // TODO: Add admin check
  const body = await readBody(event)

  try {
    const attribute = await Attribute.create({ ...body, type: 'product' })
    return { success: true, data: attribute }
  } catch (error: any) {
    if (error.statusCode) throw error
    throw createError({ statusCode: 500, statusMessage: 'error.server_error', message: error.message })
  }
})
