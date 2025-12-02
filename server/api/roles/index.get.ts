import { Role } from '../../models/Role'

export default defineEventHandler(async (event) => {
  try {
    const roles = await Role.find({ isDeleted: false })
    return roles
  } catch (error: any) {
    if (error.statusCode) throw error
    throw createError({ statusCode: 500, statusMessage: 'error.server_error', message: error.message })
  }
})
