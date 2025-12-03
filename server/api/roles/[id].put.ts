import { Role } from '../../models/Role'

export default defineEventHandler(async (event) => {
  const id = event.context.params?.id
  const body = await readBody(event)

  try {
    const role = await Role.findByIdAndUpdate(id, body, { new: true })
    if (!role) throw createError({ statusCode: 404, message: 'Role not found', statusMessage: 'error.not_found' })
    return { success: true, data: role }
  } catch (error: any) {
    if (error.statusCode) throw error
    throw createError({ statusCode: 500, statusMessage: 'error.server_error', message: error.message })
  }
})
