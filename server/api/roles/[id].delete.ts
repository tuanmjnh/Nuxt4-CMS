import { Role } from '../../models/Role'

export default defineEventHandler(async (event) => {
  const id = event.context.params?.id

  try {
    const role = await Role.findByIdAndUpdate(id, {
      isDeleted: true,
      deletedAt: new Date()
    })
    if (!role) throw createError({ statusCode: 404, message: 'Role not found', statusMessage: 'error.not_found' })
    return { success: true, message: 'Role deleted successfully' }
  } catch (error: any) {
    if (error.statusCode) throw error
    throw createError({ statusCode: 500, statusMessage: 'error.server_error', message: error.message })
  }
})
