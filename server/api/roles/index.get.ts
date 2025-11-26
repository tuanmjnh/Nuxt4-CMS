import { Role } from '../../models/Role'

export default defineEventHandler(async (event) => {
  try {
    const roles = await Role.find({})
    return roles
  } catch (error: any) {
    throw createError({
      statusCode: 500,
      message: error.message
    })
  }
})
