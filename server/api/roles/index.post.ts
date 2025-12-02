import { Role } from '../../models/Role'

export default defineEventHandler(async (event) => {
  const body = await readBody(event)

  try {
    const role = await Role.create(body)
    return role
  } catch (error: any) {
    if (error.statusCode) throw error
    throw createError({ statusCode: 500, statusMessage: 'error.server_error', message: error.message })
  }
})
